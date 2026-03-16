from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.utils.dateparse import parse_datetime
from .models import Reservation, ReservationItem
from .serializers import ReservationSerializer, CreateReservationSerializer
from catalog.models import Bouquet, Flower


class ReservationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservationSerializer

    def get_queryset(self):
        return Reservation.objects.filter(customer=self.request.user).order_by('-created_at')

    def create(self, request):
        ser = CreateReservationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        reservation = Reservation.objects.create(
            customer=request.user,
            greeting_card=data['greeting_card'],
            message=data['message'],
            wrapping_color=data['wrapping_color'],
            total_price=0,
        )
        total = 0
        for item in data['items']:
            item_type = item.get('type')
            item_id = int(item.get('id'))
            qty = int(item.get('qty', 1))
            if item_type == 'bouquet':
                obj = Bouquet.objects.get(pk=item_id)
                ReservationItem.objects.create(reservation=reservation, bouquet=obj, quantity=qty, price=obj.price)
            else:
                obj = Flower.objects.get(pk=item_id)
                ReservationItem.objects.create(reservation=reservation, flower=obj, quantity=qty, price=obj.price)
            total += obj.price * qty

        reservation.total_price = total
        reservation.save()
        return Response(ReservationSerializer(reservation).data, status=201)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def staff(self, request):
        queryset = Reservation.objects.all().order_by('-created_at').select_related('customer')
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(ReservationSerializer(page, many=True).data)
        return Response(ReservationSerializer(queryset, many=True).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser], url_path='staff-update')
    def staff_update(self, request, pk=None):
        try:
            res = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        if 'status' in request.data:
            res.status = request.data['status']
        if 'estimated_ready' in request.data and request.data['estimated_ready']:
            res.estimated_ready = parse_datetime(request.data['estimated_ready'])
        res.save()
        return Response(ReservationSerializer(res).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def options(self, request):
        return Response({
            'status_choices': Reservation.STATUS_CHOICES,
            'wrapping_colors': Reservation.WRAPPING_COLORS,
        })
