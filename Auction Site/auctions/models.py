from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.db import models
from datetime import datetime


class User(AbstractUser):
    pass


class Category(models.Model):
    name = models.CharField(max_length=20, unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Listing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_listings")
    title = models.CharField(max_length=50, blank=False)
    description = models.CharField(max_length=200, blank=False)
    url = models.URLField(blank=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="listings")
    created_at = models.DateTimeField(default=now)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=False, default=0.00)
    status = models.CharField(max_length=10, choices=[('active', 'Active'), ('closed', 'Closed')], default='active')

    def __str__(self):
        return self.title



class Bid(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bids_on_listing")
    bid = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_bids")

    def __str__(self):
        return str(self.bid)



class Comment(models.Model):
    comments = models.CharField(max_length=500, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_comments")
    created_at = models.DateTimeField(auto_now_add=True)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="listing_comments")

    def __str__(self):
        return self.comments


class Replies(models.Model):
    reply = models.CharField(max_length=500, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="replies")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_replies")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Replies"

    def __str__(self):
        return self.reply


class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlist")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="watched_by")

    class Meta:
        unique_together = ('user', 'listing')  

    def __str__(self):
        return f"{self.user.username} - {self.listing.title}"