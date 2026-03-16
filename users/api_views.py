from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        password2 = request.data.get('password2', '')
        if not username or not password:
            return Response({'error': 'Username and password required'}, status=400)
        if password != password2:
            return Response({'error': 'Passwords do not match'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=400)
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=400)
        user = User.objects.create_user(username=username, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username, 'is_staff': user.is_staff})

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=400)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username, 'is_staff': user.is_staff})

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.user.auth_token.delete()
        return Response({'ok': True})

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'username': request.user.username, 'is_staff': request.user.is_staff})
