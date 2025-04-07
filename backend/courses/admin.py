from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Course, Enrollment, Payment, Reward, ChatbotInteraction, CourseView, Test, Question, Choice, TestSubmission, QuestionSubmission, UserReward

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    search_fields = ('email', 'username')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'phone_number', 'avatar', 'bio', 'interests')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )

admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(Payment)
admin.site.register(Reward)
admin.site.register(ChatbotInteraction)
admin.site.register(CourseView)
admin.site.register(Test)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(TestSubmission)
admin.site.register(QuestionSubmission)
admin.site.register(UserReward) 