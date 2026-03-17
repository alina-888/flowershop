from rest_framework import viewsets, mixins, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.utils.dateparse import parse_datetime
from django.db import transaction
from rest_framework.views import APIView
from .models import Reservation, ReservationItem, Notification
from .serializers import ReservationSerializer, CreateReservationSerializer
from catalog.models import Bouquet, Flower


STATUS_MESSAGES = {
    'read':        'Vaša porudžbina #{id} je pregledana.',
    'in_progress': 'Vaša porudžbina #{id} je u pripremi.',
    'ready':       'Vaša porudžbina #{id} je spremna za preuzimanje!',
    'completed':   'Vaša porudžbina #{id} je završena.',
    'cancelled':   'Vaša porudžbina #{id} je otkazana.',
}


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

    @transaction.atomic
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
                obj = Bouquet.objects.select_for_update().get(pk=item_id)
                if obj.number_in_stock < qty:
                    raise serializers.ValidationError(
                        f"'{obj.title}' nema dovoljno na stanju (dostupno: {obj.number_in_stock})."
                    )
                ReservationItem.objects.create(reservation=reservation, bouquet=obj, quantity=qty, price=obj.price)
                obj.number_in_stock -= qty
                obj.save()
            else:
                obj = Flower.objects.select_for_update().get(pk=item_id)
                if obj.number_in_stock < qty:
                    raise serializers.ValidationError(
                        f"'{obj.title}' nema dovoljno na stanju (dostupno: {obj.number_in_stock})."
                    )
                ReservationItem.objects.create(reservation=reservation, flower=obj, quantity=qty, price=obj.price)
                obj.number_in_stock -= qty
                obj.save()
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
        old_status = res.status
        if 'status' in request.data:
            res.status = request.data['status']
        if 'estimated_ready' in request.data and request.data['estimated_ready']:
            res.estimated_ready = parse_datetime(request.data['estimated_ready'])
        res.save()
        if res.status != old_status:
            msg = STATUS_MESSAGES.get(res.status)
            if msg:
                Notification.objects.create(
                    user=res.customer,
                    reservation=res,
                    message=msg.format(id=res.pk),
                )
        return Response(ReservationSerializer(res).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def options(self, request):
        return Response({
            'status_choices': Reservation.STATUS_CHOICES,
            'wrapping_colors': Reservation.WRAPPING_COLORS,
        })


def serialize_notification(n):
    return {
        'id': n.id,
        'message': n.message,
        'reservation_id': n.reservation_id,
        'is_read': n.is_read,
        'created_at': n.created_at,
    }


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user)
        return Response([serialize_notification(n) for n in notifs])


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        Notification.objects.filter(pk=pk, user=request.user).update(is_read=True)
        return Response({'ok': True})


class NotificationReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'ok': True})


class NotificationReadByReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        Notification.objects.filter(
            user=request.user, reservation_id=reservation_id
        ).update(is_read=True)
        return Response({'ok': True})
