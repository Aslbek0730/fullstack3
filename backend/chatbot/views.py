from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services import process_chat_message, get_troubleshooting_steps

class ChatbotViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def message(self, request):
        """Process a chat message and return AI response."""
        message = request.data.get('message')
        
        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process the message with AI
        result = process_chat_message(message, request.user)
        
        # If it's a technical issue, get specific troubleshooting steps
        if result['is_technical_issue']:
            result['troubleshooting_steps'] = get_troubleshooting_steps(message)
        
        return Response(result) 