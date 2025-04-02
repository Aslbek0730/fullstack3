from django.conf import settings
import openai
from typing import Dict, Any, List
from django.contrib.auth import get_user_model
from courses.models import Course
import json

openai.api_key = settings.OPENAI_API_KEY
User = get_user_model()

def get_user_context(user: User) -> Dict[str, Any]:
    """Get relevant context about the user for the chatbot."""
    if not user.is_authenticated:
        return {}
        
    return {
        'enrolled_courses': [
            {
                'id': enrollment.course.id,
                'title': enrollment.course.title,
                'status': enrollment.status
            }
            for enrollment in user.enrolled_courses.all()
        ],
        'interests': user.interests or [],
        'recent_activity': [
            {
                'type': 'test',
                'course': submission.test.course.title,
                'score': submission.score,
                'date': submission.submitted_at.isoformat()
            }
            for submission in user.test_submissions.order_by('-submitted_at')[:5]
        ]
    }

def get_course_context() -> List[Dict[str, Any]]:
    """Get context about available courses."""
    return [
        {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'level': course.level,
            'category': course.category,
            'tags': course.tags
        }
        for course in Course.objects.filter(is_published=True)
    ]

def process_chat_message(message: str, user: User = None) -> Dict[str, Any]:
    """
    Process a chat message and generate a response using AI.
    
    Args:
        message: The user's message
        user: The authenticated user (if any)
        
    Returns:
        Dict containing the AI response and any relevant data
    """
    # Get user and course context
    user_context = get_user_context(user)
    course_context = get_course_context()
    
    # Construct the prompt
    prompt = f"""
    You are an AI assistant for an educational platform. Help users with their questions about courses and learning.
    
    User Context:
    {json.dumps(user_context, indent=2)}
    
    Available Courses:
    {json.dumps(course_context, indent=2)}
    
    User Message: {message}
    
    Provide a helpful response that:
    1. Directly addresses the user's question
    2. Uses available context to personalise the response
    3. Suggests relevant courses if appropriate
    4. Offers troubleshooting steps if they mention technical issues
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful educational assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response = response.choices[0].message.content
        
        # Check for technical issues
        technical_keywords = ['error', 'problem', 'issue', 'bug', 'not working', 'broken']
        is_technical_issue = any(keyword in message.lower() for keyword in technical_keywords)
        
        # Check for course-related queries
        course_keywords = ['course', 'class', 'lesson', 'learn', 'study', 'training']
        is_course_query = any(keyword in message.lower() for keyword in course_keywords)
        
        return {
            'response': ai_response,
            'is_technical_issue': is_technical_issue,
            'is_course_query': is_course_query,
            'suggested_courses': []  # Will be populated if relevant
        }
        
    except Exception as e:
        return {
            'response': "I apologize, but I'm having trouble processing your request. Please try again later.",
            'is_technical_issue': False,
            'is_course_query': False,
            'suggested_courses': []
        }

def get_troubleshooting_steps(issue_type: str) -> List[str]:
    """Get specific troubleshooting steps based on the issue type."""
    prompt = f"""
    Provide specific troubleshooting steps for this issue: {issue_type}
    
    Include:
    1. Common causes
    2. Step-by-step solutions
    3. When to contact support
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a technical support expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        return response.choices[0].message.content.split('\n')
        
    except Exception as e:
        return ["Please try refreshing the page or clearing your browser cache."] 