from django.contrib import admin
from .models import Reservation, ReservationItem


class ReservationItemInline(admin.TabularInline):
    model = ReservationItem
    extra = 0
    readonly_fields = ['price']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['pk', 'customer', 'status', 'total_price', 'created_at']
    list_filter = ['status']
    inlines = [ReservationItemInline]
