from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    interests = models.JSONField(default=list, blank=True)
    learning_history = models.JSONField(default=list, blank=True)
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    facebook_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email 