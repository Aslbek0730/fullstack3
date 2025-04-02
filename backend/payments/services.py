from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import openai
from typing import Dict, Any, Optional
from .models import Payment, UserDiscount
from accounts.models import User

openai.api_key = settings.OPENAI_API_KEY

def analyze_payment_fraud(payment_data: Dict[str, Any]) -> float:
    """
    Analyze payment data for potential fraud using AI.
    
    Args:
        payment_data: Dictionary containing payment information
        
    Returns:
        float: Fraud score between 0 and 1 (higher means more suspicious)
    """
    prompt = f"""
    Analyze this payment data for potential fraud:
    {payment_data}
    
    Consider:
    1. Payment amount and frequency
    2. User's payment history
    3. Device and location information
    4. Transaction patterns
    
    Return a fraud score between 0 and 1, where:
    0 = Very safe
    1 = Highly suspicious
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a payment fraud detection system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=100
        )
        
        # Parse the response to get the fraud score
        fraud_score = float(response.choices[0].message.content.strip())
        return min(max(fraud_score, 0), 1)  # Ensure score is between 0 and 1
        
    except Exception as e:
        print(f"Error analyzing payment fraud: {str(e)}")
        return 0.5  # Default to medium risk on error

def recommend_discount(user: User, course: Any) -> Optional[Dict[str, Any]]:
    """
    Recommend a discount for a user based on their behavior and interests.
    
    Args:
        user: The user object
        course: The course object
        
    Returns:
        Optional[Dict[str, Any]]: Discount recommendation if applicable
    """
    prompt = f"""
    Analyze this user's data to recommend a discount:
    
    User Information:
    - Interests: {user.interests}
    - Learning History: {[c.title for c in user.enrolled_courses.all()]}
    - Payment History: {[p.amount for p in user.payment_set.all()]}
    
    Course Information:
    - Title: {course.title}
    - Price: {course.price}
    - Category: {course.category}
    
    Consider:
    1. User's engagement level
    2. Course relevance to user's interests
    3. Payment history and loyalty
    4. Course popularity and pricing
    
    Return a JSON object with:
    - recommended_discount: percentage (0-100)
    - bonus_points: integer
    - reason: explanation string
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a discount recommendation system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        # Parse the response
        recommendation = response.choices[0].message.content
        # TODO: Parse the JSON response and return the recommendation
        
        return {
            'recommended_discount': 0,
            'bonus_points': 0,
            'reason': 'Default recommendation'
        }
        
    except Exception as e:
        print(f"Error recommending discount: {str(e)}")
        return None

def create_payment(user: User, course: Any, provider: str, payment_data: Dict[str, Any]) -> Payment:
    """
    Create a new payment with AI-powered fraud detection and discount recommendations.
    
    Args:
        user: The user object
        course: The course object
        provider: Payment provider name
        payment_data: Provider-specific payment data
        
    Returns:
        Payment: The created payment object
    """
    # Analyze payment for fraud
    fraud_score = analyze_payment_fraud(payment_data)
    
    # Get discount recommendation
    discount_recommendation = recommend_discount(user, course)
    
    # Calculate final amount with discount
    amount = course.price
    discount_applied = 0
    bonus_points = 0
    
    if discount_recommendation:
        discount_applied = discount_recommendation['recommended_discount']
        bonus_points = discount_recommendation['bonus_points']
        amount = amount * (1 - discount_applied / 100)
    
    # Create payment record
    payment = Payment.objects.create(
        user=user,
        course=course,
        amount=amount,
        provider=provider,
        transaction_id=payment_data.get('transaction_id', ''),
        payment_data=payment_data,
        fraud_score=fraud_score,
        discount_applied=discount_applied,
        bonus_points=bonus_points
    )
    
    # If discount was recommended, create UserDiscount record
    if discount_recommendation:
        UserDiscount.objects.create(
            user=user,
            discount_percentage=discount_recommendation['recommended_discount'],
            valid_until=timezone.now() + timedelta(days=7),
            ai_recommended=True,
            recommendation_reason=discount_recommendation['reason']
        )
    
    return payment 