import json
from typing import List, Dict, Any
from django.conf import settings
from courses.models import Course, CourseView

try:
    import openai
    if settings.OPENAI_ENABLED and settings.OPENAI_API_KEY:
        openai.api_key = settings.OPENAI_API_KEY
        OPENAI_AVAILABLE = True
    else:
        OPENAI_AVAILABLE = False
except ImportError:
    OPENAI_AVAILABLE = False

def get_course_recommendations(user, test_submissions=None) -> List[Dict[str, Any]]:
    """
    Get AI-powered course recommendations for a user.
    If OpenAI is not available, return basic recommendations based on course views.
    """
    if not OPENAI_AVAILABLE:
        # Fallback to basic recommendations based on course views
        viewed_courses = CourseView.objects.filter(user=user).select_related('course')
        if viewed_courses.exists():
            # Get courses in the same category as viewed courses
            categories = set(view.course.category for view in viewed_courses)
            recommended_courses = Course.objects.filter(
                category__in=categories
            ).exclude(
                id__in=[view.course.id for view in viewed_courses]
            )[:5]
            
            return [{
                'course_id': course.id,
                'title': course.title,
                'description': course.description,
                'confidence': 0.7,  # Default confidence for basic recommendations
                'reason': 'Based on your viewing history'
            } for course in recommended_courses]
        
        # If no viewed courses, return popular courses
        popular_courses = Course.objects.order_by('-views_count')[:5]
        return [{
            'course_id': course.id,
            'title': course.title,
            'description': course.description,
            'confidence': 0.6,  # Lower confidence for popular courses
            'reason': 'Popular among other students'
        } for course in popular_courses]

    # OpenAI-based recommendations
    try:
        # Get user's course history
        viewed_courses = CourseView.objects.filter(user=user).select_related('course')
        course_history = [
            {
                'title': view.course.title,
                'category': view.course.category,
                'duration': view.duration.total_seconds() if view.duration else 0
            }
            for view in viewed_courses
        ]

        # Get test submission history if available
        test_history = []
        if test_submissions:
            test_history = [
                {
                    'test_id': submission.test.id,
                    'score': submission.score,
                    'status': submission.status
                }
                for submission in test_submissions
            ]

        # Prepare context for OpenAI
        context = {
            'course_history': course_history,
            'test_history': test_history,
            'available_courses': list(Course.objects.values('id', 'title', 'category', 'description'))
        }

        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a course recommendation assistant."},
                {"role": "user", "content": f"Based on this user data: {json.dumps(context)}, recommend 5 courses."}
            ]
        )

        # Parse recommendations
        recommendations = json.loads(response.choices[0].message.content)
        return recommendations

    except Exception as e:
        # Fallback to basic recommendations if OpenAI fails
        return get_course_recommendations(user)  # This will use the fallback logic

def update_user_interests(user, course_data: Dict[str, Any]):
    """
    Update user's interests based on course interaction.
    
    Args:
        user: The user object
        course_data: Data about the course interaction
    """
    # Extract relevant keywords from course data
    prompt = f"""
    Extract key interests and topics from this course data:
    {course_data}
    
    Return a list of 3-5 relevant interests or topics.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an interest extraction system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        # Parse the response and update user interests
        new_interests = response.choices[0].message.content.split(',')
        user.interests.extend(new_interests)
        user.save()
        
    except Exception as e:
        print(f"Error updating user interests: {str(e)}") 