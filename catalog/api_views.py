from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Flower, Bouquet
from .serializers import FlowerSerializer, BouquetSerializer


class FlowerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Flower.objects.all()
    serializer_class = FlowerSerializer
    permission_classes = [AllowAny]


class BouquetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bouquet.objects.all()
    serializer_class = BouquetSerializer
    permission_classes = [AllowAny]
