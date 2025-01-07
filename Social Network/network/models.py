from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ACCOUNT_TYPE_CHOICES = [("public", "Public"), ("private", "Private")]
    account_type = models.CharField(
        max_length=10, choices=ACCOUNT_TYPE_CHOICES, default="private"
    )


class Post(models.Model):
    title = models.CharField(max_length=50)
    body = models.TextField()
    total_likes = models.IntegerField(default=0)
    total_comments = models.IntegerField(default=0)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts_by_user"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Likes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_user")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="liked_posts")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")

    def __str__(self):
        return f"{self.user.username} liked {self.post.title}"


class Comments(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="commented_user"
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="commented_post"
    )
    total_replies = models.IntegerField(default=0)
    comments = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.comments


class Replies(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="replied_user"
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="replied_post"
    )
    comments = models.ForeignKey(
        Comments, on_delete=models.CASCADE, related_name="replied_comment"
    )
    replies = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)


class Follow(models.Model):
    follower = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="following"
    )
    followed = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followers"
    )

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("blocked", "Blocked"),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "followed")

    def __str__(self):
        return f"{self.follower.username} -> {self.followed.username} ({self.status})"
