from rest_framework import serializers
from .models import Reservation, ReservationItem
from catalog.models import Bouquet, Flower


class ReservationItemSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    item_id = serializers.SerializerMethodField()

    class Meta:
        model = ReservationItem
        fields = ['id', 'name', 'item_type', 'item_id', 'quantity', 'price', 'subtotal']

    def get_name(self, obj):
        return obj.name()

    def get_subtotal(self, obj):
        return obj.subtotal()

    def get_item_type(self, obj):
        return 'bouquet' if obj.bouquet_id else 'flower'

    def get_item_id(self, obj):
        return obj.bouquet_id if obj.bouquet_id else obj.flower_id


class ReservationSerializer(serializers.ModelSerializer):
    items = ReservationItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    wrapping_color_display = serializers.CharField(source='get_wrapping_color_display', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'status', 'status_display', 'total_price', 'created_at',
            'greeting_card', 'message', 'wrapping_color', 'wrapping_color_display',
            'estimated_ready', 'customer_username', 'items',
        ]


class CreateReservationSerializer(serializers.Serializer):
    greeting_card = serializers.BooleanField(default=False)
    message = serializers.CharField(allow_blank=True, default='')
    wrapping_color = serializers.CharField(allow_blank=True, default='')
    items = serializers.ListField(child=serializers.DictField())

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Korpa je prazna.')
        for item in items:
            item_type = item.get('type')
            try:
                item_id = int(item.get('id'))
                qty = int(item.get('qty', 1))
            except (TypeError, ValueError):
                raise serializers.ValidationError('Neispravan format artikla.')
            if item_type == 'bouquet':
                try:
                    obj = Bouquet.objects.get(pk=item_id)
                except Bouquet.DoesNotExist:
                    raise serializers.ValidationError(f'Buket sa ID {item_id} ne postoji.')
                if obj.number_in_stock < qty:
                    raise serializers.ValidationError(
                        f"'{obj.title}' nema dovoljno na stanju (dostupno: {obj.number_in_stock})."
                    )
            elif item_type == 'flower':
                try:
                    obj = Flower.objects.get(pk=item_id)
                except Flower.DoesNotExist:
                    raise serializers.ValidationError(f'Cvet sa ID {item_id} ne postoji.')
                if obj.number_in_stock < qty:
                    raise serializers.ValidationError(
                        f"'{obj.title}' nema dovoljno na stanju (dostupno: {obj.number_in_stock})."
                    )
            else:
                raise serializers.ValidationError(f'Nepoznat tip artikla: {item_type}.')
        return items
