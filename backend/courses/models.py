from django.db import models
from django.conf import settings
from django.utils import timezone

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=True)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    enrolled_students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='enrolled_courses', blank=True)
    category = models.CharField(max_length=100)
    level = models.CharField(max_length=50)
    duration = models.DurationField()
    prerequisites = models.TextField(blank=True)
    objectives = models.TextField()
    syllabus = models.TextField()
    requirements = models.TextField()
    ai_recommended = models.BooleanField(default=False)
    ai_recommendation_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        app_label = 'courses'
        ordering = ['-created_at']

class CourseView(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(default=0)  # Duration in seconds

    class Meta:
        ordering = ['-viewed_at']

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