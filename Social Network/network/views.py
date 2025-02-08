from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, transaction
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied


from .models import *
from .serializers import *


def index(request):
    return render(
        request,
        "network/index.html",
        {
            "user": request.user,
        },
    )

def profile(request):
    return render(
        request,
        "network/profile.html",
        {
            "user": request.user
        },
    )

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Return tokens in JSON response
            return JsonResponse(
                {
                    "success": True,
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                }
            )
        else:
            return JsonResponse({"success": False})
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        account_type = request.POST['account_type']

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
            user.account_type = account_type
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
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        # Validate account type
        username = data.get("username", user.username)
        account_type = data.get("account_type", user.account_type)

        valid_account_types = [choice[0] for choice in User.ACCOUNT_TYPE_CHOICES]
        if account_type not in valid_account_types:
            raise ValidationError(
                {
                    "account_type": f"Invalid account type. Allowed values are: {valid_account_types}"
                }
            )

        # Check if no changes were made
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


# ----------------------------VIEWS FOR API QUERIES------------------------------------#


# Handles Post CRUD
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            return []
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        # Ensure user is authenticated before creating a post
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a post.")

        # Save post and increment total posts for the user
        with transaction.atomic():
            serializer.save(user=self.request.user)
            self.request.user.total_posts += 1
            self.request.user.save()

    def create(self, request, *args, **kwargs):
        # Check if user is authenticated before creating a post
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Delete a post and decrement total posts for the user
        post_id = self.kwargs["pk"]
        user=request.user
        if not user:
            return Response(
                {"detail": "User not logged in."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            post = Post.objects.get(id=post_id, user=user)
            print(post)
        except Post.DoesNotExist:
            raise NotFound("Post does not exist")

        with transaction.atomic():
            self.request.user.total_posts = max(0, self.request.user.total_posts - 1)
            self.request.user.save()
            response = super().destroy(request, *args, **kwargs)

            return Response(
                {
                    "detail": "Post deleted successfully.",
                    "total_posts": self.request.user.total_posts,
                },
                status=status.HTTP_204_NO_CONTENT,
            )

    def list(self, request, *args, **kwargs):
        # Fetch posts based on query parameters
        user_id = request.query_params.get("user_id")

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
                )

            # Check if the user is private and if the requesting user is not allowed to view their posts
            if user.account_type == "private" and user != request.user:
                is_following = Follow.objects.filter(
                    follower=request.user, followed=user, status="accepted"
                ).exists()
                if not is_following:
                    return Response(
                        {"detail": "This user's account is private."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            # Fetch posts for the specific user
            queryset = Post.objects.filter(user=user).order_by('-created_at').select_related("user")
        elif not user_id:
            queryset = Post.objects.filter(
            user__account_type="public"
            ).order_by('-created_at').select_related("user")

            # Serialize and return the response
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        else:
            return Response(
                {"detail": "Please provide a user_id to fetch posts."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["get"], url_path="like-status")
    def check_status(self, request, pk=None):
        user = request.user
        post_id = self.kwargs['pk']
        print(user, post_id)

        try:
            like = Likes.objects.get(user=user, post_id=post_id)
            return Response(
                {
                    "liked": True
                },
                status=status.HTTP_200_OK
            )
        except Likes.DoesNotExist:
            return Response(
                {
                    "liked": False
                },
                status=status.HTTP_200_OK
            )


# Handles Comments CRUD, Increment, Decrement
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comments.objects.all()
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs["post_pk"]
        return Comments.objects.filter(post=post_id).order_by('-created_at').select_related("post", "user")

    def create(self, request, *args, **kwargs):
        # Save comment and increment total comments for the post
        post_id = self.kwargs["post_pk"]
        post = get_object_or_404(Post, id=post_id)

        # Check if the post is private and if the user is not a follower
        if post.user.account_type == "private":
            # Check if the user is a follower of the post's user
            is_follower = Follow.objects.filter(
                follower=self.request.user,
                followed=post.user,
                status="accepted",
            ).exists()

            if not is_follower:
                raise PermissionDenied(
                    "You cannot comment on a private post unless you are a follower."
                )

        # Create and validate the serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            comment = serializer.save(user=self.request.user, post=post)

            # Increment total_comments for the post
            post.total_comments += 1
            post.save()

        return Response(
            {
                "detail": "Comment added successfully.",
                "total_comments": post.total_comments,
                "comment": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        # Delete a comment and decrement total comments for the post
        post_id = self.kwargs["post_pk"]
        comment_id = self.kwargs["pk"]

        

        post = get_object_or_404(Post, id=post_id)
        comment = get_object_or_404(Comments, post=post, id=comment_id)

        if comment.user != request.user:
            return Response(
                {"detail": "You do not have permission to delete this comment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            comment.delete()

            post.total_comments = max(0, post.total_comments - 1)
            post.save()

        return Response(
            {
                "detail": "Comment deleted successfully.",
                "total_comments": post.total_comments,
            },
            status=status.HTTP_204_NO_CONTENT,
        )


# Handles Likes CRUD, Increment, Decrement
class LikeViewSet(viewsets.ModelViewSet):
    queryset = Likes.objects.all()
    serializer_class = LikesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return likes for a specific post
        post_id = self.kwargs["post_pk"]
        return Likes.objects.filter(post_id=post_id).select_related("post", "user")

    def perform_create(self, serializer):
        # Like a post and increment total likes for the post
        post_id = self.kwargs["post_pk"]
        post = get_object_or_404(Post, id=post_id)

        if post.user.account_type == "private" and post.user != self.request.user:
            is_following = Follow.objects.filter(
                follower=self.request.user, followed=post.user, status="accepted"
            ).exists()
            if not is_following:
                raise PermissionDenied("You cannot like a private post.")

        if Likes.objects.filter(user=self.request.user, post=post).exists():
            raise ValidationError("You have already liked this post.")

        with transaction.atomic():
            serializer.save(user=self.request.user, post=post)

            post.total_likes += 1
            post.save()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        post = get_object_or_404(Post, id=self.kwargs["post_pk"])
        response.data["total_likes"] = post.total_likes
        response.data["liked"] = True

        return response

    def destroy(self, request, *args, **kwargs):
        # Remove like from post and decrement total likes for the post
        post_id = self.kwargs["post_pk"]
        post = get_object_or_404(Post, id=post_id)

        like = get_object_or_404(Likes, user=self.request.user, post=post)

        with transaction.atomic():
            like.delete()

            post.total_likes = max(0, post.total_likes - 1)
            post.save()

        return Response(
            {
                "detail": "Like removed successfully.",
                "total_likes": post.total_likes,
                "liked": False,
            },
            status=status.HTTP_204_NO_CONTENT,
        )
            


class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Replies.objects.all()
    serializer_class = RepliesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return replies for a specific comment
        comment_id = self.kwargs["comment_pk"]
        return Replies.objects.filter(comments=comment_id).order_by('-created_at').select_related(
            "comments", "user"
        )

    def create(self, request, *args, **kwargs):
        # Save reply and increment total replies for the comment
        comment_id = self.kwargs["comment_pk"]
        comment = get_object_or_404(Comments, id=comment_id)
        post = comment.post

        # Check if the post is private and if the user is not a follower
        if post.user.account_type == "private":
            # Check if the user is a follower of the post's user
            is_follower = Follow.objects.filter(
                follower=self.request.user,
                followed=post.user,
                status="accepted",
            ).exists()

            if not is_follower:
                raise PermissionDenied(
                    "You cannot reply on a private post unless you are a follower."
                )

        # Create and validate the serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            # Save the reply and link it to the comment and user
            reply = serializer.save(user=self.request.user, comments=comment)

            # Increment total_replies for the comment
            comment.total_replies += 1
            comment.save()

        return Response(
            {
                "detail": "Reply added successfully.",
                "total_replies": comment.total_replies,
                "reply": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        # Delete a reply and decrement total replies for the comment
        comment_id = self.kwargs["comment_pk"]
        reply_id = self.kwargs["reply_id"]
        comment = get_object_or_404(Comments, id=comment_id)

        reply = Replies.objects.filter(id=reply_id, comment=comment_id)

        with transaction.atomic():
            reply.delete()

            comment.total_replies = max(0, comment.total_replies - 1)
            comment.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


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
        # Return pending follow requests for the authenticated user
        requests = Follow.objects.filter(followed=request.user, status="pending").order_by('-created_at')
        serializer = FollowSerializer(requests, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Create a follow request
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
            if followed.account_type == "public":
                follow.status = "accepted"
            else:
                follow.status = "pending"
            follow.save()
            return Response(
                (
                    {"success": "Followed User."}
                    if followed.account_type == "public"
                    else {"success": "Follow request sent."}
                ),
                status=201,
            )
        elif follow.status == "pending":
            return Response({"info": "Follow request already sent."}, status=200)
        else:
            return Response(
                {"info": "You are already following this user."}, status=200
            )

    def update(self, request, pk=None, *args, **kwargs):
        # Handle follow actions (approve, reject)
        follow = get_object_or_404(Follow, id=pk, followed=request.user)

        followed_user = follow.follower
        user = request.user

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["status"]

        if action == "accept" and follow.status == "pending":
            # Accept the follow request
            follow.status = "accepted"

            with transaction.atomic():
                follow.save()
                user.total_followers += 1
                followed_user.total_following += 1
                user.save()
                followed_user.save()

            return Response({"success": "Follow request approved."}, status=200)

        elif action == "decline" and follow.status == "pending":
            # Reject the follow request
            follow.delete()
            return Response({"success": "Follow request rejected."}, status=200)

        else:
            return Response(
                {"info": "Action already performed or invalid."}, status=200
            )

    def destroy(self, request, pk=None, *args, **kwargs):
        # Unfollow the user (delete the follow relationship)
        follow = get_object_or_404(Follow, id=pk, follower=request.user)

        followed_user = follow.followed
        user = request.user

        with transaction.atomic():
            # Delete the follow relationship
            follow.delete()
            user.total_following = max(0, user.total_following - 1)
            followed_user.total_followers = max(0, followed_user.total_followers - 1)
            user.save()
            followed_user.save()

        return Response({"success": "Unfollowed User."}, status=200)

    @action(detail=False, methods=["get"], url_path="check-status")
    def check_status(self, request):
        followed_id = request.query_params.get("followed_id")

        if not followed_id:
            raise ValidationError("'followed_id' is required.")

        follow = Follow.objects.filter(
            follower=request.user, followed_id=followed_id
        ).first()

        if follow:
            return Response({"status": follow.status}, status=200)
        return Response({"status": "none"}, status=404)


# Blocked View to handle blocking and unblocking
class BlockViewSet(viewsets.ModelViewSet):
    queryset = Blocked.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Blocked.objects.filter(blocker=self.request.user)

    def create(self, request, *args, **kwargs):
        blocker = self.request.user
        blocked_id = request.data.get("blocked_id")

        if not blocked_id:
            raise ValidationError({"error": "User ID is required to block user"})

        blocked_user = get_object_or_404(User, id=blocked_id)

        if blocker == blocked_user:
            return Response({"error": "You cannot block yourself."}, status=400)

        # save the users in the blocked model
        Blocked.objects.create(blocker=blocker, blocked=blocked_user)

        # Handle follow relationship between blocker and blocked
        # 1. Check if they are following you
        they_follow = Follow.objects.filter(
            follower=blocked_user,
            followed=blocker,
            status__in=["pending", "accepted"],
        ).first()

        if they_follow:
            with transaction.atomic():
                they_follow.delete()
                blocker.total_followers = max(0, blocker.total_followers - 1)
                blocked_user.total_following = max(0, blocked_user.total_following - 1)
                blocker.save()
                blocked_user.save()

        # 2. Check if you are following them
        you_follow = Follow.objects.filter(
            follower=blocker,
            followed=blocked_user,
            status__in=["pending", "accepted"],
        ).first()

        if you_follow:
            with transaction.atomic():
                blocker.total_following = max(0, blocker.total_following - 1)
                blocked_user.total_followers = max(0, blocked_user.total_followers - 1)
                blocker.save()
                blocked_user.save()

        return Response(
            {
                "message": "User has been blocked successfully.",
                "blocked": True,
            },
            status=201,
        )

    def list(self, request, *args, **kwargs):
        blocked_users = self.get_queryset()
        serializer = self.get_serializer(blocked_users, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Delete the block entry
        instance.delete()

        return Response(
            {"message": "User has been unblocked successfully."}, status=200
        )


# # ----------------------SPECIAL VIEWS FOR SPECIAL QUERIES---------------------------------# #


# View for profile page
class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        username = kwargs.get("username")
        user = get_object_or_404(User, username=username)

        self_user = self.request.user

        if username == self_user.username:
            # Display logged-in user details
            serializer = UserSerializer(self_user)
        else:
            # Get details for the user specified by the 'username'
            serializer = UserSerializer(user)

        return Response(serializer.data, status=status.HTTP_200_OK)


# View for fetching posts liked by the user
class LikedPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        liked_posts = Post.objects.filter(liked_posts__user=user).order_by('-created_at')
        serializer = PostSerializer(liked_posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# View for fetching posts commented on by the user
class CommentedPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        commented_posts = Post.objects.filter(commented_post__user=user).order_by('-created_at')
        serializer = PostSerializer(commented_posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# View for fetching posts from users the user is following
class FollowingPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        following_users = Follow.objects.filter(
            follower=user, status="accepted"
        ).values_list("followed", flat=True)
        posts_by_following = Post.objects.filter(user__id__in=following_users)
        serializer = PostSerializer(posts_by_following, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# View for fetching users the user is following
class FollowingUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        # Fetch users the current user is following with 'accepted' status
        following = User.objects.filter(
            id__in=Follow.objects.filter(follower=user, status="accepted").values(
                "followed"
            )
        )
        serializer = UserSerializer(following, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# View for fetching Other users following logged in user
class FollowerUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        followers = User.objects.filter(
            id__in=Follow.objects.filter(followed=user, status="accepted").values(
                "follower"
            )
        )
        serializer = UserSerializer(followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
