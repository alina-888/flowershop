from django.db import models
from django.contrib.auth.models import User


class Reservation(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("read", "Read"),
        ("in_progress", "In Progress"),
        ("ready", "Ready for Pickup"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    WRAPPING_COLORS = [
        ("white", "White"),
        ("pink", "Pink"),
        ("red", "Red"),
        ("yellow", "Yellow"),
        ("green", "Green"),
        ("purple", "Purple"),
        ("blue", "Blue"),
    ]
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    greeting_card = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    wrapping_color = models.CharField(max_length=20, choices=WRAPPING_COLORS, blank=True)
    estimated_ready = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Reservation #{self.pk} by {self.customer.username}"


class ReservationItem(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='items')
    bouquet = models.ForeignKey('catalog.Bouquet', on_delete=models.CASCADE, null=True, blank=True)
    flower = models.ForeignKey('catalog.Flower', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def name(self):
        if self.bouquet:
            return self.bouquet.title
        return self.flower.title

    def __str__(self):
        return f"{self.quantity}x {self.name()}"

    def subtotal(self):
        return self.price * self.quantity
