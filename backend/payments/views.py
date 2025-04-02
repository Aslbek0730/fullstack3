from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from courses.models import Course
from .models import Payment, PaymentAttempt, UserDiscount
from .serializers import (
    PaymentSerializer, PaymentAttemptSerializer,
    UserDiscountSerializer, CreatePaymentSerializer
)
from .services import create_payment
from django.utils import timezone

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = CreatePaymentSerializer(data=request.data)
        if serializer.is_valid():
            course = get_object_or_404(Course, id=serializer.validated_data['course_id'])
            
            try:
                payment = create_payment(
                    user=request.user,
                    course=course,
                    provider=serializer.validated_data['provider'],
                    payment_data=serializer.validated_data['payment_data']
                )
                
                # Create payment attempt record
                PaymentAttempt.objects.create(
                    payment=payment,
                    status='initiated'
                )
                
                # Return payment data for frontend processing
                return Response({
                    'payment_id': payment.id,
                    'amount': payment.amount,
                    'currency': payment.currency,
                    'provider': payment.provider,
                    'transaction_id': payment.transaction_id,
                    'discount_applied': payment.discount_applied,
                    'bonus_points': payment.bonus_points
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        payment = self.get_object()
        
        # Update payment status based on provider callback
        payment.status = 'completed'
        payment.save()
        
        # Record successful payment attempt
        PaymentAttempt.objects.create(
            payment=payment,
            status='completed'
        )
        
        # Enroll user in the course
        payment.course.enrolled_students.add(payment.user)
        
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def fail(self, request, pk=None):
        payment = self.get_object()
        
        # Update payment status
        payment.status = 'failed'
        payment.save()
        
        # Record failed payment attempt
        PaymentAttempt.objects.create(
            payment=payment,
            status='failed',
            error_message=request.data.get('error_message', '')
        )
        
        return Response({'status': 'success'})

    @action(detail=False, methods=['get'])
    def discounts(self, request):
        discounts = UserDiscount.objects.filter(
            user=request.user,
            is_active=True,
            valid_until__gt=timezone.now()
        )
        serializer = UserDiscountSerializer(discounts, many=True)
        return Response(serializer.data)

class PaymentProviderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def click_callback(self, request):
        # Handle Click payment provider callback
        transaction_id = request.data.get('transaction_id')
        status = request.data.get('status')
        
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
            
            if status == 'success':
                payment.status = 'completed'
                payment.save()
                payment.course.enrolled_students.add(payment.user)
            else:
                payment.status = 'failed'
                payment.save()
            
            return Response({'status': 'success'})
            
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def payme_callback(self, request):
        # Handle Payme payment provider callback
        # Similar implementation to click_callback
        pass

    @action(detail=False, methods=['post'])
    def uzum_callback(self, request):
        # Handle Uzum Bank payment provider callback
        # Similar implementation to click_callback
        pass 