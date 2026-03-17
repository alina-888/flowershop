from django.urls import path
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register('', api_views.ReservationViewSet, basename='reservation')

urlpatterns = [
    path('notifications/', api_views.NotificationListView.as_view()),
    path('notifications/read-all/', api_views.NotificationReadAllView.as_view()),
    path('notifications/<int:pk>/read/', api_views.NotificationReadView.as_view()),
    path('notifications/reservation/<int:reservation_id>/read/', api_views.NotificationReadByReservationView.as_view()),
] + router.urls
