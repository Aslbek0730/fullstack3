from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, TestViewSet, QuestionViewSet,
    ChoiceViewSet, UserRewardViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'courses/(?P<course_pk>\d+)/tests', TestViewSet, basename='course-test')
router.register(r'tests/(?P<test_pk>\d+)/questions', QuestionViewSet, basename='test-question')
router.register(r'questions/(?P<question_pk>\d+)/choices', ChoiceViewSet, basename='question-choice')
router.register(r'rewards', UserRewardViewSet, basename='user-reward')

urlpatterns = [
    path('', include(router.urls)),
    path('rewards/recommendations/', UserRewardViewSet.as_view({'get': 'recommendations'}), name='course-recommendations'),
    path('rewards/difficulty-adjustment/', UserRewardViewSet.as_view({'get': 'difficulty_adjustment'}), name='difficulty-adjustment'),
] 