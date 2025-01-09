from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "account_type", "first_name", "last_name"]


class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    total_likes = serializers.IntegerField(read_only=True)
    total_comments = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "username",
            "title",
            "body",
            "total_likes",
            "total_comments",
            "created_at",
        ]


class LikesSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    post = serializers.CharField(source="post.title", read_only=True)
    post_id = serializers.CharField(source="post.id", read_only=True)

    class Meta:
        model = Likes
        fields = [
            "id",
            "username",
            "post",
            "post_id",
        ]


class CommentsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    post_title = serializers.CharField(source="post.title", read_only=True)
    post_id = serializers.CharField(source="post.id", read_only=True)
    total_replies = serializers.IntegerField(read_only=True)

    class Meta:
        model = Comments
        fields = [
            "id",
            "username",
            "post_title",
            "post_id",
            "comments",
            "total_replies",
            "created_at",
        ]


class RepliesSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    comment = serializers.CharField(source="comments.comments", read_only=True)
    comment_id = serializers.CharField(source="comments.id", read_only=True)

    class Meta:
        model = Replies
        fields = [
            "id",
            "username",
            "comment",
            "comment_id",
            "replies",
            "created_at",
        ]


class FollowSerializer(serializers.ModelSerializer):
    followed_username = serializers.CharField(
        source="followed.username", read_only=True
    )
    follower_username = serializers.CharField(
        source="follower.username", read_only=True
    )

    class Meta:
        model = Follow
        fields = [
            "id",
            "follower_username",
            "followed_username",
            "followed",
            "follower",
            "status",
            "created_at",
        ]
        read_only_fields = ["follower", "status", "created_at"]


class FollowCreateSerializer(serializers.ModelSerializer):
    followed_id = serializers.IntegerField()

    class Meta:
        model = Follow
        fields = ["followed_id"]


class FollowUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["approve", "reject"])
