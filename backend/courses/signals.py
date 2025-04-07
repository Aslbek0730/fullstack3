from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import User

@receiver(post_save, sender=User)
def send_registration_emails(sender, instance, created, **kwargs):
    if created:  # Only send emails for new user creation
        try:
            # Email to the new user
            user_subject = 'Welcome to Shams Academy!'
            user_message = f"""
            Dear {instance.username},

            Welcome to Shams Academy! We're excited to have you join our learning community.

            Your account has been successfully created. You can now:
            - Browse our course catalog
            - Enroll in courses
            - Track your progress
            - Earn rewards and certificates

            If you have any questions, feel free to contact our support team.

            Best regards,
            The Shams Academy Team
            """
            
            send_mail(
                user_subject,
                user_message,
                settings.DEFAULT_FROM_EMAIL or 'webmaster@localhost',
                [instance.email],
                fail_silently=True,  # Set to True to prevent errors from breaking user creation
            )
        except Exception as e:
            # Log the error but don't break the user creation process
            print(f"Failed to send welcome email: {str(e)}")

        # Email to superadmin
        admin_subject = 'New User Registration'
        admin_message = f"""
        New user registered on Shams Academy:

        User Details:
        - Username: {instance.username}
        - Email: {instance.email}
        - Date Joined: {instance.date_joined}
        """
        
        # Get all superusers using our custom User model
        superusers = User.objects.filter(is_superuser=True)
        admin_emails = [user.email for user in superusers if user.email]
        
        if admin_emails:  # Only send if there are superusers with emails
            try:
                send_mail(
                    admin_subject,
                    admin_message,
                    settings.DEFAULT_FROM_EMAIL or 'webmaster@localhost',
                    admin_emails,
                    fail_silently=True,  # Set to True to prevent errors from breaking user creation
                )
            except Exception as e:
                # Log the error but don't break the user creation process
                print(f"Failed to send admin email: {str(e)}") 