from django.conf import settings
import openai
from typing import List, Dict, Any

openai.api_key = settings.OPENAI_API_KEY

def get_course_recommendations(
    user_interests: List[str],
    learning_history: List[Dict[str, Any]],
    available_courses: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Generate course recommendations using OpenAI's GPT model.
    
    Args:
        user_interests: List of user's interests
        learning_history: List of courses the user has taken
        available_courses: List of available courses
    
    Returns:
        List of recommended courses with relevance scores
    """
    # Prepare the prompt for GPT
    prompt = f"""
    Based on the following information, recommend the most relevant courses:
    
    User Interests: {', '.join(user_interests)}
    
    Learning History:
    {[course['title'] for course in learning_history]}
    
    Available Courses:
    {[course['title'] for course in available_courses]}
    
    Please recommend the top 5 most relevant courses and explain why they are relevant.
    Format the response as a JSON array with objects containing:
    - course_id: The ID of the course
    - relevance_score: A score from 0-1 indicating relevance
    - explanation: A brief explanation of why this course is relevant
    """
    
    try:
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a course recommendation system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Parse the response
        recommendations = response.choices[0].message.content
        # TODO: Parse the JSON response and return the recommendations
        
        return []  # Placeholder return
        
    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        return []

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