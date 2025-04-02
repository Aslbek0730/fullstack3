from django.urls import path, include
from rest_framework.routers import DefaultRouter
from payments.views import PaymentViewSet, PaymentProviderViewSet

router = DefaultRouter()
router.register(r'payments', PaymentViewSet)
router.register(r'payment-providers', PaymentProviderViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
] 