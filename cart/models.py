from django.db import models
from django.contrib.auth.models import User


class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    bouquet = models.ForeignKey('catalog.Bouquet', on_delete=models.CASCADE, null=True, blank=True)
    flower = models.ForeignKey('catalog.Flower', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['added_at']

    def __str__(self):
        name = self.bouquet.title if self.bouquet else self.flower.title
        return f"{self.quantity}x {name} ({self.user.username})"
