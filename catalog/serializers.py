from rest_framework import serializers
from .models import Flower, Bouquet, BouquetItem

class FlowerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = Flower
        fields = ['id', 'title', 'description', 'number_in_stock', 'price', 'image']
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class BouquetItemSerializer(serializers.ModelSerializer):
    flower = FlowerSerializer()
    class Meta:
        model = BouquetItem
        fields = ['flower', 'quantity']

class BouquetSerializer(serializers.ModelSerializer):
    items = BouquetItemSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    class Meta:
        model = Bouquet
        fields = ['id', 'title', 'description', 'number_in_stock', 'price', 'image', 'items']
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
