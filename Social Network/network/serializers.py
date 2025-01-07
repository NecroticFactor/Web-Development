from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "account_type", "first_name", "last_name"]


class PostSerializer(serializers.ModelSerializer):
    post_username = serializers.CharField(source="user.username")

    class Meta:
        model = Post
        fields = [
            "id",
            "post_username",
            "title",
            "body",
            "total_likes",
            "total_comments",
            "created_at",
        ]


class LikesSerializer(serializers.ModelSerializer):
    likes_username = serializers.CharField(source="user.username")
    likes_post_title = serializers.CharField(source="post.title")

    class Meta:
        model = Likes
        fields = ["likes_username", "likes_post_title"]


class CommentsSerializer(serializers.ModelSerializer):
    comments_username = serializers.CharField(source="user.username")
    comments_post_title = serializers.CharField(source="post.title")

    class Meta:
        model = Comments
        fields = [
            "comments_username",
            "comments_post_title",
            "comments",
            "total_replies",
            "created_at",
        ]


class RepliesSerializer(serializers.ModelSerializer):
    replied_username = serializers.CharField(source="user.username")
    replied_post_title = serializers.CharField(source="post.title")
    replied_comments = serializers.CharField(source="comments.comments")

    class Meta:
        model = Replies
        fields = [
            "replied_username",
            "replied_post_title",
            "replied_comments",
            "replied",
            "created_at",
        ]


class FollowSerializer(serializers.ModelSerializer):
    follower_username = serializers.SerializerMethodField()
    followed_username = serializers.SerializerMethodField()

    class Meta:
        model = Follow
        fields = ["follower_username", "followed_username", "status", "created_at"]

    def get_follower_username(self, obj):
        return obj.follower.username

    def get_followed_username(self, obj):
        return obj.followed.username
