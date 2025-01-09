from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, transaction
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied


from .models import *
from .serializers import *


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


# Update User Profile
class UpdateUserView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        username = data.get("username", user.username)
        account_type = data.get("account_type", user.account_type)

        valid_account_types = [choice[0] for choice in User.ACCOUNT_TYPE_CHOICES]
        if account_type not in valid_account_types:
            raise ValidationError(
                {
                    "account_type": f"Invalid account type. Allowed values are: {valid_account_types}"
                }
            )

        if username == user.username and account_type == user.account_type:
            return Response(
                {"detail": "No changes detected."},
                status=status.HTTP_304_NOT_MODIFIED,
            )

        try:
            user.username = username
            user.account_type = account_type
            user.save()
        except IntegrityError:
            return Response(
                {"detail": "Username already taken."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "User updated successfully."}, status=status.HTTP_200_OK
        )


# # ----------------------------VIEWS FOR API QUERIES------------------------------------# #


# Handles Post CRUD
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a post.")

        with transaction.atomic():
            serializer.save(user=self.request.user)
            self.request.user.total_posts += 1
            self.request.user.save()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        post_id = self.kwargs["pk"]
        try:
            post = Post.objects.get(id=post_id, user=request.user)
        except Post.DoesNotExist:
            raise NotFound("Post does not exist")

        with transaction.atomic():
            if self.request.user.total_posts > 0:
                self.request.user.total_posts -= 1
                self.request.user.save()
            response = super().destroy(request, *args, **kwargs)

            return Response(
                {
                    "detail": "Post deleted successfully.",
                    "total_posts": self.request.user.total_posts,
                },
                status=status.HTTP_204_NO_CONTENT,
            )


# Handles Comments CRUD, Increment, Decrement
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comments.objects.all()
    serializer_class = CommentsSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        post_id = self.kwargs["post_pk"]
        return Comments.objects.filter(post=post_id).select_related("post", "user")

    def perform_create(self, serializer):
        post_id = self.kwargs["post_pk"]

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFound("Post does not exist")

        with transaction.atomic():
            serializer.save(user=self.request.user, post=post)

            post.total_comments += 1
            post.save()

    def destroy(self, request, *args, **kwargs):
        post_id = self.kwargs["post_pk"]
        comment_id = self.kwargs["comment_id"]

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFound("Post does not exist")

        comment = Comments.objects.get(post=post_id, id=comment_id)

        with transaction.atomic():

            comment.delete()

            if post.total_comments > 0:
                post.total_comments -= 1
                post.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


# Handles Likes CRUD, Increment, Decrement
class LikeViewSet(viewsets.ModelViewSet):
    queryset = Likes.objects.all()
    serializer_class = LikesSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        post_id = self.kwargs["post_pk"]
        return Likes.objects.filter(post_id=post_id).select_related("post", "user")

    def perform_create(self, serializer):
        post_id = self.kwargs["post_pk"]

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFound("Post does not exist")
        if Likes.objects.filter(user=self.request.user, post=post).exists():
            raise ValidationError("You have already liked this post.")

        with transaction.atomic():
            serializer.save(user=self.request.user, post=post)

            post.total_likes += 1
            post.save()

    def destroy(self, request, *args, **kwargs):
        post_id = self.kwargs["post_pk"]

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFound("Post does not exist")

        like = Likes.objects.filter(user=self.request.user, post=post).first()
        if not like:
            raise NotFound("You have not liked this post.")

        with transaction.atomic():
            like.delete()

            if post.total_likes > 0:
                post.total_likes -= 1
                post.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


# Handles Reply CRUD, Increment, Decrement
class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Replies.objects.all()
    serializer_class = RepliesSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        comment_id = self.kwargs["comment_pk"]
        return Replies.objects.filter(comments=comment_id).select_related(
            "comments", "user"
        )

    def perform_create(self, serializer):
        comment_id = self.kwargs["comment_pk"]
        try:
            comment = Comments.objects.get(id=comment_id)
        except Comments.DoesNotExist:
            raise NotFound("Comment not found")

        with transaction.atomic():
            serializer.save(user=self.request.user, comments=comment)

            comment.total_replies += 1
            comment.save()

    def destroy(self, request, *args, **kwargs):
        comment_id = self.kwargs["comment_pk"]
        reply_id = self.kwargs["reply_id"]

        try:
            comment = Comments.objects.get(id=comment_id)
        except Comments.DoesNotExist:
            raise NotFound("Comment not found.")

        reply = Replies.objects.filter(id=reply_id, comment=comment_id)

        with transaction.atomic():
            reply.delete()

            if comment.total_replies > 0:
                comment.total_replies -= 1
                comment.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


# Handles Follow Logic
class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return FollowCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return FollowUpdateSerializer
        return FollowSerializer

    def list(self, request, *args, **kwargs):
        status_filter = request.query_params.get("status", "pending")
        requests = Follow.objects.filter(followed=request.user, status=status_filter)
        serializer = FollowSerializer(requests, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        followed_id = serializer.validated_data["followed_id"]
        followed = get_object_or_404(User, id=followed_id)

        if request.user == followed:
            return Response({"error": "You cannot follow yourself."}, status=400)

        follow, created = Follow.objects.get_or_create(
            follower=request.user, followed=followed
        )

        if created:
            follow.status = "pending"
            follow.save()
            return Response({"success": "Follow request sent."}, status=201)
        elif follow.status == "pending":
            return Response({"info": "Follow request already sent."}, status=200)
        else:
            return Response(
                {"info": "You are already following this user."}, status=200
            )

    def update(self, request, pk=None, *args, **kwargs):
        follow = get_object_or_404(
            Follow, id=pk, followed=request.user, status="pending"
        )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["status"]

        if action == "approve":
            follow.status = "accepted"
            follow.save()
            return Response({"success": "Follow request approved."}, status=200)

        elif action == "reject":
            follow.status = "rejected"
            follow.save()
            return Response({"success": "Follow request rejected."}, status=200)

        return Response({"error": "Invalid action."}, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        return self.update(request, pk, *args, **kwargs)


# # ----------------------SPECIAL VIEWS FOR SPECIAL QUERIES---------------------------------# #


class LikedPostsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user = request.user
        liked_posts = Post.objects.filter(liked_posts__user=user)

        # Serialize and return the posts
        serializer = PostSerializer(liked_posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CommentedPostsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user = request.user
        commented_posts = Post.objects.filter(commented_post__user=user)

        serializer = PostSerializer(commented_posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FollowingPostsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user = request.user

        following_users = Follow.objects.filter(
            follower=user, status="accepted"
        ).values_list("followed", flat=True)
        posts_by_following = Post.objects.filter(user__id__in=following_users)
        serializer = PostSerializer(posts_by_following, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
