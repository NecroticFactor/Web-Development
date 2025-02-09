from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ACCOUNT_TYPE_CHOICES = [("public", "Public"), ("private", "Private")]
    account_type = models.CharField(
        max_length=10, choices=ACCOUNT_TYPE_CHOICES, default="private"
    )

    total_followers = models.PositiveIntegerField(default=0)
    total_following = models.PositiveIntegerField(default=0)
    total_posts = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.username

class UserBio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_bio')
    bio = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Bio"


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
        verbose_name_plural = "Likes"

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

    class Meta:
        verbose_name_plural = "Comments"

    def __str__(self):
        return f"{self.comments} by {self.user.username}"


class Replies(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="replied_user"
    )
    comments = models.ForeignKey(
        Comments, on_delete=models.CASCADE, related_name="replied_comment"
    )
    replies = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Replies"

    def __str__(self):
        return f"{self.replies} by {self.user.username}"


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
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "followed")

    def __str__(self):
        return f"{self.follower.username} -> {self.followed.username} ({self.status})"


class Blocked(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocker')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")

    def __str__(self):
        return f'{self.blocker.username} blocked {self.blocked.username}'