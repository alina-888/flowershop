from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CartItem
from catalog.models import Bouquet, Flower


def serialize_cart(user):
    items = CartItem.objects.filter(user=user).select_related('bouquet', 'flower')
    result = []
    for item in items:
        if item.bouquet:
            result.append({
                'key': item.id,
                'type': 'bouquet',
                'id': item.bouquet.id,
                'qty': item.quantity,
                'title': item.bouquet.title,
                'price': float(item.bouquet.price),
            })
        else:
            result.append({
                'key': item.id,
                'type': 'flower',
                'id': item.flower.id,
                'qty': item.quantity,
                'title': item.flower.title,
                'price': float(item.flower.price),
            })
    return result


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(serialize_cart(request.user))

    def delete(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response(status=204)


class CartAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        item_type = request.data.get('type')
        item_id = request.data.get('id')
        qty = max(1, int(request.data.get('qty', 1)))

        if item_type == 'bouquet':
            try:
                obj = Bouquet.objects.get(pk=item_id)
            except Bouquet.DoesNotExist:
                return Response({'error': 'Buket ne postoji.'}, status=400)
            existing = CartItem.objects.filter(user=request.user, bouquet=obj).first()
            if existing:
                existing.quantity += qty
                existing.save()
            else:
                CartItem.objects.create(user=request.user, bouquet=obj, quantity=qty)
        elif item_type == 'flower':
            try:
                obj = Flower.objects.get(pk=item_id)
            except Flower.DoesNotExist:
                return Response({'error': 'Cvet ne postoji.'}, status=400)
            existing = CartItem.objects.filter(user=request.user, flower=obj).first()
            if existing:
                existing.quantity += qty
                existing.save()
            else:
                CartItem.objects.create(user=request.user, flower=obj, quantity=qty)
        else:
            return Response({'error': 'Nepoznat tip.'}, status=400)

        return Response(serialize_cart(request.user))


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        qty = int(request.data.get('qty', 1))
        if qty <= 0:
            item.delete()
        else:
            item.quantity = qty
            item.save()
        return Response(serialize_cart(request.user))

    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        item.delete()
        return Response(status=204)
