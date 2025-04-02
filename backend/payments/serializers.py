from rest_framework import serializers
from .models import Payment, PaymentAttempt, UserDiscount
from courses.serializers import CourseSerializer
from accounts.serializers import UserSerializer

class PaymentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = (
            'id', 'user', 'course', 'amount', 'currency', 'status',
            'provider', 'transaction_id', 'created_at', 'updated_at',
            'fraud_score', 'discount_applied', 'bonus_points'
        )
        read_only_fields = (
            'id', 'created_at', 'updated_at', 'fraud_score',
            'discount_applied', 'bonus_points'
        )

class PaymentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAttempt
        fields = ('id', 'payment', 'attempt_number', 'status', 'error_message', 'created_at')
        read_only_fields = ('id', 'created_at')

class UserDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDiscount
        fields = (
            'id', 'user', 'discount_percentage', 'valid_until',
            'is_active', 'created_at', 'ai_recommended', 'recommendation_reason'
        )
        read_only_fields = ('id', 'created_at', 'ai_recommended', 'recommendation_reason')

class CreatePaymentSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    provider = serializers.ChoiceField(choices=Payment.PAYMENT_PROVIDER_CHOICES)
    payment_data = serializers.DictField() 