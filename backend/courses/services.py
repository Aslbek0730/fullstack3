from django.conf import settings
import openai
from typing import Dict, Any, List
from .models import Test, Question, TestSubmission, QuestionSubmission, UserReward, Course
import json

openai.api_key = settings.OPENAI_API_KEY

def evaluate_test_submission(submission: TestSubmission) -> Dict[str, Any]:
    """
    Evaluate a test submission using AI.
    
    Args:
        submission: The test submission to evaluate
        
    Returns:
        Dict containing evaluation results
    """
    test = submission.test
    questions = test.questions.all()
    
    total_score = 0
    max_score = sum(q.points for q in questions)
    ai_feedback = []
    
    for question in questions:
        question_submission = submission.question_submissions.filter(question=question).first()
        if not question_submission:
            continue
            
        # Evaluate based on question type
        if question.question_type == 'multiple_choice':
            score, feedback = evaluate_multiple_choice(question, question_submission)
        elif question.question_type == 'true_false':
            score, feedback = evaluate_true_false(question, question_submission)
        elif question.question_type == 'short_answer':
            score, feedback = evaluate_short_answer(question, question_submission)
        elif question.question_type == 'programming':
            score, feedback = evaluate_programming(question, question_submission)
        else:
            score, feedback = 0, "Unsupported question type"
            
        question_submission.score = score
        question_submission.ai_feedback = feedback
        question_submission.save()
        
        total_score += score
        ai_feedback.append(f"Question {question.id}: {feedback}")
    
    # Calculate final score
    final_score = int((total_score / max_score) * test.max_score)
    
    # Determine if passed
    passed = final_score >= test.passing_score
    
    # Generate overall feedback
    overall_feedback = generate_overall_feedback(
        test, final_score, passed, ai_feedback
    )
    
    return {
        'score': final_score,
        'passed': passed,
        'feedback': overall_feedback,
        'ai_score': total_score / max_score
    }

def evaluate_multiple_choice(question: Question, submission: QuestionSubmission) -> tuple[int, str]:
    """Evaluate a multiple choice question."""
    selected_choices = submission.selected_choices.all()
    correct_choices = question.choices.filter(is_correct=True)
    
    score = 0
    if set(selected_choices) == set(correct_choices):
        score = question.points
        
    feedback = f"Selected: {', '.join(c.choice_text for c in selected_choices)}. "
    feedback += f"Correct: {', '.join(c.choice_text for c in correct_choices)}."
    
    return score, feedback

def evaluate_true_false(question: Question, submission: QuestionSubmission) -> tuple[int, str]:
    """Evaluate a true/false question."""
    correct_answer = question.choices.filter(is_correct=True).first()
    selected_answer = submission.selected_choices.first()
    
    score = question.points if selected_answer == correct_answer else 0
    
    feedback = f"Your answer: {selected_answer.choice_text if selected_answer else 'No answer'}. "
    feedback += f"Correct answer: {correct_answer.choice_text if correct_answer else 'Not set'}."
    
    return score, feedback

def evaluate_short_answer(question: Question, submission: QuestionSubmission) -> tuple[int, str]:
    """Evaluate a short answer question using AI."""
    prompt = f"""
    Evaluate this short answer question:
    
    Question: {question.question_text}
    Correct answer: {question.choices.filter(is_correct=True).first().choice_text}
    Student's answer: {submission.answer_text}
    
    Provide:
    1. Score (0-{question.points})
    2. Brief feedback
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational assessment system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=150
        )
        
        # Parse the response
        result = response.choices[0].message.content
        # TODO: Parse the score and feedback from the result
        
        return question.points, result
        
    except Exception as e:
        return 0, f"Error evaluating answer: {str(e)}"

def evaluate_programming(question: Question, submission: QuestionSubmission) -> tuple[int, str]:
    """Evaluate a programming question using AI code review."""
    prompt = f"""
    Review this programming submission:
    
    Question: {question.question_text}
    Expected output: {question.choices.filter(is_correct=True).first().choice_text}
    Student's code: {submission.answer_text}
    
    Provide:
    1. Code quality score (0-{question.points})
    2. Detailed feedback including:
       - Code correctness
       - Code style
       - Performance considerations
       - Best practices
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert code reviewer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        # Parse the response
        result = response.choices[0].message.content
        # TODO: Parse the score and feedback from the result
        
        return question.points, result
        
    except Exception as e:
        return 0, f"Error reviewing code: {str(e)}"

def generate_overall_feedback(
    test: Test,
    score: int,
    passed: bool,
    question_feedback: List[str]
) -> str:
    """Generate overall feedback for the test submission."""
    prompt = f"""
    Generate overall feedback for this test submission:
    
    Test: {test.title}
    Score: {score}/{test.max_score}
    Passed: {'Yes' if passed else 'No'}
    Question Feedback:
    {chr(10).join(question_feedback)}
    
    Provide:
    1. Overall performance summary
    2. Key strengths and areas for improvement
    3. Study recommendations
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational feedback system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Error generating feedback: {str(e)}"

def award_rewards(submission: TestSubmission) -> List[UserReward]:
    """
    Award rewards based on test performance.
    
    Args:
        submission: The test submission to award rewards for
        
    Returns:
        List of awarded rewards
    """
    rewards = []
    
    # Calculate points based on score
    points = int(submission.score * 10)  # 10 points per percentage point
    
    # Award points
    rewards.append(UserReward.objects.create(
        user=submission.user,
        test_submission=submission,
        reward_type='points',
        reward_value=str(points)
    ))
    
    # Award badges based on performance
    if submission.score >= 90:
        rewards.append(UserReward.objects.create(
            user=submission.user,
            test_submission=submission,
            reward_type='badge',
            reward_value='Excellent Performance'
        ))
    elif submission.score >= 80:
        rewards.append(UserReward.objects.create(
            user=submission.user,
            test_submission=submission,
            reward_type='badge',
            reward_value='Great Work'
        ))
    
    # Award certificate for passing
    if submission.status == 'graded':
        rewards.append(UserReward.objects.create(
            user=submission.user,
            test_submission=submission,
            reward_type='certificate',
            reward_value=f'/certificates/{submission.id}.pdf'
        ))
    
    return rewards

def get_course_recommendations(user, test_submissions):
    """
    Generate personalised course recommendations based on user performance and interests.
    
    Args:
        user: The user to generate recommendations for
        test_submissions: List of user's test submissions
        
    Returns:
        List of recommended courses with reasons and confidence scores
    """
    # Get user's performance data
    performance_data = {
        'average_score': sum(sub.score for sub in test_submissions) / len(test_submissions) if test_submissions else 0,
        'completed_courses': user.enrolled_courses.filter(status='completed').count(),
        'interests': user.interests or [],
        'learning_history': [
            {
                'course_id': sub.test.course.id,
                'score': sub.score,
                'difficulty': sub.test.course.level
            }
            for sub in test_submissions
        ]
    }
    
    # Get available courses (excluding completed ones)
    completed_course_ids = user.enrolled_courses.filter(status='completed').values_list('course_id', flat=True)
    available_courses = Course.objects.filter(is_published=True).exclude(id__in=completed_course_ids)
    
    prompt = f"""
    Based on the following user data, recommend suitable courses:
    
    User Performance:
    - Average Score: {performance_data['average_score']}%
    - Completed Courses: {performance_data['completed_courses']}
    - Interests: {', '.join(performance_data['interests'])}
    
    Learning History:
    {json.dumps(performance_data['learning_history'], indent=2)}
    
    Available Courses:
    {json.dumps([{
        'id': course.id,
        'title': course.title,
        'level': course.level,
        'category': course.category,
        'tags': course.tags
    } for course in available_courses], indent=2)}
    
    For each recommended course, provide:
    1. Course ID
    2. Reason for recommendation
    3. Confidence score (0-1)
    4. Suggested difficulty level
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational recommendation system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse the response and create recommendations
        recommendations = []
        result = response.choices[0].message.content
        
        # TODO: Parse the result into structured recommendations
        # This is a placeholder implementation
        recommendations = [
            {
                'course_id': course.id,
                'course_title': course.title,
                'difficulty_level': course.level,
                'reason': f"Based on your interests in {', '.join(performance_data['interests'])}",
                'confidence_score': 0.8
            }
            for course in available_courses[:5]
        ]
        
        return recommendations
        
    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        return []

def adjust_difficulty(user, course):
    """
    Adjust course difficulty based on user performance.
    
    Args:
        user: The user to adjust difficulty for
        course: The course to adjust
        
    Returns:
        Dict containing adjusted difficulty settings
    """
    # Get user's performance in this course
    test_submissions = TestSubmission.objects.filter(
        user=user,
        test__course=course
    )
    
    if not test_submissions.exists():
        return {'difficulty': course.level}
    
    average_score = sum(sub.score for sub in test_submissions) / test_submissions.count()
    
    prompt = f"""
    Based on the user's performance, suggest appropriate difficulty adjustments:
    
    Course: {course.title}
    Current Level: {course.level}
    Average Score: {average_score}%
    
    Recent Test Scores:
    {json.dumps([{
        'test': sub.test.title,
        'score': sub.score
    } for sub in test_submissions.order_by('-submitted_at')[:5]], indent=2)}
    
    Provide:
    1. Suggested difficulty level
    2. Additional practice recommendations
    3. Prerequisites to review
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational difficulty adjustment system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        # Parse the response
        result = response.choices[0].message.content
        
        # TODO: Parse the result into structured recommendations
        # This is a placeholder implementation
        return {
            'difficulty': course.level,
            'practice_recommendations': [],
            'prerequisites_to_review': []
        }
        
    except Exception as e:
        print(f"Error adjusting difficulty: {str(e)}")
        return {'difficulty': course.level} 