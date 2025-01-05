from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


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
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="likes_by_user"
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="likes_on_post"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")

    def __str__(self):
        return f"{self.user.username} liked {self.post.title}"


class Comments(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comments_by_user"
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments_on_post"
    )
    total_replies = models.IntegerField(default=0)
    comments = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.comments


class Replies(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="replies_by_user"
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="replies_on_post"
    )
    comments = models.ForeignKey(
        Comments, on_delete=models.CASCADE, related_name="replies_on_comment"
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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "followed")

    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"
