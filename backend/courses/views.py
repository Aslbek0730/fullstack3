from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from .models import (
    Course, CourseView, Test, Question, Choice,
    TestSubmission, QuestionSubmission, UserReward
)
from .serializers import (
    CourseSerializer, CourseViewSerializer, TestSerializer,
    QuestionSerializer, ChoiceSerializer, TestSubmissionSerializer,
    UserRewardSerializer, CreateTestSubmissionSerializer
)
from accounts.services import get_course_recommendations
from .services import evaluate_test_submission, award_rewards

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_published=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Course.objects.filter(is_published=True)
        category = self.request.query_params.get('category', None)
        level = self.request.query_params.get('level', None)
        search = self.request.query_params.get('search', None)

        if category:
            queryset = queryset.filter(category=category)
        if level:
            queryset = queryset.filter(level=level)
        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Record course view
        CourseView.objects.create(
            course=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        # Get most viewed courses in the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        popular_courses = Course.objects.filter(
            views__viewed_at__gte=thirty_days_ago
        ).annotate(
            view_count=Count('views')
        ).order_by('-view_count')[:6]
        
        serializer = self.get_serializer(popular_courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recommended(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get user's viewed courses
        user_views = CourseView.objects.filter(
            user=request.user
        ).select_related('course').order_by('-viewed_at')[:10]

        # Get user's interests and learning history
        user_interests = request.user.interests
        learning_history = [
            {
                'id': view.course.id,
                'title': view.course.title,
                'category': view.course.category,
                'tags': view.course.tags
            }
            for view in user_views
        ]

        # Get available courses (excluding viewed ones)
        viewed_course_ids = [view.course.id for view in user_views]
        available_courses = Course.objects.filter(
            is_published=True
        ).exclude(
            id__in=viewed_course_ids
        ).values('id', 'title', 'category', 'tags')

        # Get AI recommendations
        recommended_courses = get_course_recommendations(
            user_interests=user_interests,
            learning_history=learning_history,
            available_courses=list(available_courses)
        )

        # Get recommended course objects
        recommended_course_ids = [rec['course_id'] for rec in recommended_courses]
        courses = Course.objects.filter(id__in=recommended_course_ids)
        
        # Sort courses according to AI recommendations
        course_dict = {course.id: course for course in courses}
        sorted_courses = [
            course_dict[rec['course_id']]
            for rec in recommended_courses
            if rec['course_id'] in course_dict
        ]

        serializer = self.get_serializer(sorted_courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Course.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def levels(self, request):
        levels = Course.objects.values_list('level', flat=True).distinct()
        return Response(list(levels))

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        return Test.objects.filter(course_id=course_id)

    @action(detail=True, methods=['post'])
    def submit(self, request, course_pk=None, pk=None):
        test = self.get_object()
        serializer = CreateTestSubmissionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # Create test submission
        submission = TestSubmission.objects.create(
            test=test,
            user=request.user,
            status='pending'
        )
        
        # Create question submissions
        for q_submission in serializer.validated_data['question_submissions']:
            question = get_object_or_404(Question, id=q_submission['question_id'])
            
            question_submission = QuestionSubmission.objects.create(
                submission=submission,
                question=question,
                answer_text=q_submission.get('answer_text', ''),
                selected_choices=Choice.objects.filter(
                    id__in=q_submission.get('selected_choice_ids', [])
                )
            )
        
        # Evaluate submission using AI
        evaluation_result = evaluate_test_submission(submission)
        
        # Update submission with results
        submission.score = evaluation_result['score']
        submission.status = 'graded' if evaluation_result['passed'] else 'failed'
        submission.ai_feedback = evaluation_result['feedback']
        submission.ai_score = evaluation_result['ai_score']
        submission.save()
        
        # Award rewards
        rewards = award_rewards(submission)
        
        return Response({
            'submission': TestSubmissionSerializer(submission).data,
            'rewards': UserRewardSerializer(rewards, many=True).data
        })

    @action(detail=True, methods=['get'])
    def results(self, request, course_pk=None, pk=None):
        test = self.get_object()
        submission = TestSubmission.objects.filter(
            test=test,
            user=request.user
        ).first()
        
        if not submission:
            return Response(
                {'error': 'No submission found'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        return Response(TestSubmissionSerializer(submission).data)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        test_id = self.kwargs.get('test_pk')
        return Question.objects.filter(test_id=test_id)

class ChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_id = self.kwargs.get('question_pk')
        return Choice.objects.filter(question_id=question_id)

class UserRewardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserRewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserReward.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get AI-powered course recommendations for the user."""
        # Get user's test submissions
        test_submissions = TestSubmission.objects.filter(user=request.user)
        
        # Get recommendations using AI
        recommendations = get_course_recommendations(request.user, test_submissions)
        
        return Response(recommendations)

    @action(detail=False, methods=['get'])
    def difficulty_adjustment(self, request):
        """Get difficulty adjustment recommendations for current courses."""
        # Get user's enrolled courses
        enrolled_courses = request.user.enrolled_courses.filter(status='in_progress')
        
        adjustments = []
        for enrollment in enrolled_courses:
            adjustment = adjust_difficulty(request.user, enrollment.course)
            adjustments.append({
                'course_id': enrollment.course.id,
                'course_title': enrollment.course.title,
                **adjustment
            })
        
        return Response(adjustments) 