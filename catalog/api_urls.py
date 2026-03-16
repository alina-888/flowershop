from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register('flowers', api_views.FlowerViewSet, basename='flower')
router.register('bouquets', api_views.BouquetViewSet, basename='bouquet')

urlpatterns = router.urls
