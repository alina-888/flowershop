from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.CartView.as_view()),
    path('add/', api_views.CartAddView.as_view()),
    path('items/<int:pk>/', api_views.CartItemView.as_view()),
]
