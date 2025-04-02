from rest_framework import status, viewsets, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
import requests
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    SocialAuthSerializer,
    TokenSerializer
)

User = get_user_model()

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def social_auth(self, request):
        serializer = SocialAuthSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            provider = serializer.validated_data['provider']

            if provider == 'google':
                # Verify Google token
                response = requests.get(
                    f'https://oauth2.googleapis.com/tokeninfo?id_token={token}'
                )
                if response.status_code != 200:
                    return Response(
                        {'error': 'Invalid Google token'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                data = response.json()
                email = data.get('email')
                google_id = data.get('sub')

            elif provider == 'facebook':
                # Verify Facebook token
                response = requests.get(
                    f'https://graph.facebook.com/me?access_token={token}'
                )
                if response.status_code != 200:
                    return Response(
                        {'error': 'Invalid Facebook token'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                data = response.json()
                email = data.get('email')
                facebook_id = data.get('id')

            # Get or create user
            try:
                if provider == 'google':
                    user = User.objects.get(google_id=google_id)
                else:
                    user = User.objects.get(facebook_id=facebook_id)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(email=email)
                    if provider == 'google':
                        user.google_id = google_id
                    else:
                        user.facebook_id = facebook_id
                    user.save()
                except User.DoesNotExist:
                    user = User.objects.create_user(
                        username=email.split('@')[0],
                        email=email,
                        first_name=data.get('given_name', ''),
                        last_name=data.get('family_name', '')
                    )
                    if provider == 'google':
                        user.google_id = google_id
                    else:
                        user.facebook_id = facebook_id
                    user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'user': UserSerializer(user).data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        user = request.user
        # Get user's interests and learning history
        interests = user.interests
        learning_history = user.learning_history

        # TODO: Implement AI-based course recommendations
        # This is a placeholder for the AI recommendation logic
        recommended_courses = []  # Replace with actual AI recommendations

        return Response({
            'interests': interests,
            'learning_history': learning_history,
            'recommended_courses': recommended_courses
        }) 