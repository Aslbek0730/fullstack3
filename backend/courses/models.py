from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    interests = models.JSONField(default=list, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(upload_to='course_thumbnails/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    is_published = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)
    total_students = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)
    category = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    progress = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.email} - {self.course.title}"

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    PAYMENT_PROVIDER_CHOICES = [
        ('click', 'Click'),
        ('payme', 'Payme'),
        ('uzum', 'Uzum'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    provider = models.CharField(max_length=20, choices=PAYMENT_PROVIDER_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.course.title} - {self.amount}"

class Reward(models.Model):
    REWARD_TYPES = [
        ('bonus', 'Bonus'),
        ('certificate', 'Certificate'),
        ('badge', 'Badge'),
        ('discount', 'Discount'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rewards')
    type = models.CharField(max_length=20, choices=REWARD_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_claimed = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"

class ChatbotInteraction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatbot_interactions')
    message = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.created_at}"

class CourseView(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_views')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(null=True, blank=True)

    class Meta:
        ordering = ['-viewed_at']
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.email} viewed {self.course.title} at {self.viewed_at}"

class Test(models.Model):
    TEST_TYPE_CHOICES = [
        ('quiz', 'Quiz'),
        ('practice', 'Practice Exercise'),
        ('programming', 'Programming Assignment'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES)
    max_score = models.IntegerField(default=100)
    passing_score = models.IntegerField(default=70)
    time_limit = models.IntegerField(null=True, blank=True)  # in minutes
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.course.title}"

class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('programming', 'Programming'),
    ]

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    question_text = models.TextField()
    points = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.question_text[:50]}..."

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.choice_text

class TestSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('graded', 'Graded'),
        ('failed', 'Failed'),
    ]

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    ai_feedback = models.TextField(null=True, blank=True)
    ai_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.test.title}"

class QuestionSubmission(models.Model):
    submission = models.ForeignKey(TestSubmission, on_delete=models.CASCADE, related_name='question_submissions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField(null=True, blank=True)
    selected_choices = models.ManyToManyField(Choice, blank=True)
    score = models.IntegerField(null=True, blank=True)
    ai_feedback = models.TextField(null=True, blank=True)
    ai_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.submission.user.username} - {self.question.question_text[:50]}..."

class UserReward(models.Model):
    REWARD_TYPE_CHOICES = [
        ('points', 'Points'),
        ('badge', 'Badge'),
        ('certificate', 'Certificate'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    test_submission = models.ForeignKey(TestSubmission, on_delete=models.CASCADE)
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPE_CHOICES)
    reward_value = models.CharField(max_length=100)  # Points amount, badge name, or certificate URL
    awarded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.reward_type} - {self.reward_value}" 