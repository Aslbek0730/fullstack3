from rest_framework import serializers
from .models import (
    Course, Test, Question, Choice,
    TestSubmission, QuestionSubmission, UserReward
)
from accounts.serializers import UserSerializer

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    instructor_id = serializers.IntegerField(write_only=True)
    is_enrolled = serializers.SerializerMethodField()
    view_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'thumbnail', 'price',
            'instructor', 'instructor_id', 'category', 'level',
            'duration', 'rating', 'enrolled_students', 'created_at',
            'updated_at', 'is_published', 'tags', 'prerequisites',
            'objectives', 'syllabus', 'views_count', 'is_enrolled',
            'view_count'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'views_count')

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrolled_students.filter(id=request.user.id).exists()
        return False

    def get_view_count(self, obj):
        return obj.views.count()

class CourseViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseView
        fields = ('id', 'course', 'user', 'ip_address', 'viewed_at', 'duration')
        read_only_fields = ('id', 'viewed_at')

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'choice_text', 'is_correct')
        read_only_fields = ('is_correct',)

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ('id', 'question_type', 'question_text', 'points', 'choices')
        read_only_fields = ('id',)

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Test
        fields = (
            'id', 'title', 'description', 'test_type',
            'max_score', 'passing_score', 'time_limit',
            'due_date', 'questions'
        )
        read_only_fields = ('id',)

class QuestionSubmissionSerializer(serializers.ModelSerializer):
    selected_choices = ChoiceSerializer(many=True, read_only=True)
    selected_choice_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = QuestionSubmission
        fields = (
            'id', 'question', 'answer_text',
            'selected_choices', 'selected_choice_ids',
            'score', 'ai_feedback', 'ai_score'
        )
        read_only_fields = ('id', 'score', 'ai_feedback', 'ai_score')

class TestSubmissionSerializer(serializers.ModelSerializer):
    question_submissions = QuestionSubmissionSerializer(many=True)
    
    class Meta:
        model = TestSubmission
        fields = (
            'id', 'test', 'score', 'status',
            'submitted_at', 'graded_at',
            'ai_feedback', 'ai_score',
            'question_submissions'
        )
        read_only_fields = (
            'id', 'score', 'status',
            'submitted_at', 'graded_at',
            'ai_feedback', 'ai_score'
        )

class UserRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReward
        fields = (
            'id', 'reward_type', 'reward_value',
            'awarded_at'
        )
        read_only_fields = ('id', 'awarded_at')

class CreateTestSubmissionSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    question_submissions = serializers.ListField(
        child=serializers.DictField(
            child=serializers.JSONField()
        )
    ) 