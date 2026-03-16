from django.contrib import admin
from .models import Flower, Bouquet, BouquetItem


class BouquetItemInline(admin.TabularInline):
    model = BouquetItem
    extra = 1


@admin.register(Bouquet)
class BouquetAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'number_in_stock']
    inlines = [BouquetItemInline]


@admin.register(Flower)
class FlowerAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'number_in_stock']
