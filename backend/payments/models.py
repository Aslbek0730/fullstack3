from django.db import models
from django.conf import settings
from django.utils import timezone

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_PROVIDER_CHOICES = [
        ('click', 'Click'),
        ('payme', 'Payme'),
        ('uzum', 'Uzum Bank'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    provider = models.CharField(max_length=20, choices=PAYMENT_PROVIDER_CHOICES)
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    payment_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    fraud_score = models.FloatField(null=True, blank=True)  # AI-generated fraud detection score
    discount_applied = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    bonus_points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.amount} {self.currency}"

    class Meta:
        app_label = 'payments'
        ordering = ['-created_at']

class PaymentAttempt(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    attempt_number = models.IntegerField(default=1)
    status = models.CharField(max_length=20)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attempt {self.attempt_number} for {self.payment}"

    class Meta:
        ordering = ['-created_at']

class UserDiscount(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ai_recommended = models.BooleanField(default=False)
    recommendation_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.discount_percentage}% off until {self.valid_until}"

    class Meta:
        ordering = ['-created_at'] 