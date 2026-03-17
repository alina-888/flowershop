from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/catalog/', include('catalog.api_urls')),
    path('api/auth/', include('users.api_urls')),
    path('api/reservations/', include('reservations.api_urls')),
    path('api/cart/', include('cart.api_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
