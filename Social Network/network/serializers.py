from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "account_type",
            "first_name",
            "last_name",
            "total_followers",
            "total_following",
            "total_posts",
        ]


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_likes = serializers.IntegerField(read_only=True)
    total_comments = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "title",
            "body",
            "total_likes",
            "total_comments",
            "created_at",
        ]


class LikesSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)

    class Meta:
        model = Likes
        fields = [
            "id",
            "user",
            "post",
        ]


class CommentsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    total_replies = serializers.IntegerField(read_only=True)

    class Meta:
        model = Comments
        fields = [
            "id",
            "user",
            "post",
            "comments",
            "total_replies",
            "created_at",
        ]


class RepliesSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    comment = CommentsSerializer(read_only=True)

    class Meta:
        model = Replies
        fields = [
            "id",
            "user",
            "comment",
            "replies",
            "created_at",
        ]


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    followed = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = [
            "id",
            "follower",
            "followed",
            "status",
            "created_at",
        ]


class FollowCreateSerializer(serializers.ModelSerializer):
    followed_id = serializers.IntegerField()

    class Meta:
        model = Follow
        fields = ["followed_id"]


class FollowUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["accept", "decline"])


class BlockSerializer(serializers.ModelSerializer):
    blocker = UserSerializer(read_only=True)
    blocked = UserSerializer(read_only=True)
    blocked_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Blocked
        fields = [
            "blocker",
            "blocked",
            "blocked_id",
            "created_at",
        ]
        read_only = [
            "blocker",
        ]
