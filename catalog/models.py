from django.db import models
from PIL import Image as PilImage


MAX_IMAGE_PX = 1200  # max width or height in pixels


def resize_image(path):
    img = PilImage.open(path)
    if img.width > MAX_IMAGE_PX or img.height > MAX_IMAGE_PX:
        img.thumbnail((MAX_IMAGE_PX, MAX_IMAGE_PX), PilImage.LANCZOS)
        img.save(path, optimize=True, quality=85)


class Flower(models.Model):
    title = models.CharField(max_length=250)
    description = models.TextField()
    number_in_stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="flowers/", blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            resize_image(self.image.path)


class Bouquet(models.Model):
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    number_in_stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="bouquets/", blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            resize_image(self.image.path)


class BouquetItem(models.Model):
    bouquet = models.ForeignKey(Bouquet, on_delete=models.CASCADE, related_name='items')
    flower = models.ForeignKey(Flower, on_delete=models.CASCADE, related_name='bouquet_items')
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.flower.title} in {self.bouquet.title}"
