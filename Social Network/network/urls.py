from django.urls import path
from rest_framework_nested.routers import NestedDefaultRouter
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

auth_patterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("update_profile/", views.UpdateUserView.as_view(), name="update_profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

page_patterns = [
    path("", views.index, name="index"),
    path('profile', views.profile, name='profile'),

]

single_query_patterns = [
    path(
        "user/<str:username>/",
        views.UserDetails.as_view(),
        name="profile-page",
    ),
    path("liked-posts/", views.LikedPostsView.as_view(), name="liked-posts"),
    path(
        "commented-posts/", views.CommentedPostsView.as_view(), name="commented-posts"
    ),
    path(
        "following-posts/", views.FollowingPostsView.as_view(), name="following-posts"
    ),
    path("following/", views.FollowingUserView.as_view(), name="following"),
    path("followers/", views.FollowerUserView.as_view(), name="followers"),
]

router = DefaultRouter()
router.register(r"posts", views.PostViewSet, basename="post")

# Nested route for comments under a post
post_router = NestedDefaultRouter(router, r"posts", lookup="post")
post_router.register(r"comments", views.CommentViewSet, basename="post-comments")

# Nested route for replies under a comment
comments_router = NestedDefaultRouter(post_router, r"comments", lookup="comment")
comments_router.register(r"replies", views.ReplyViewSet, basename="comment-replies")

# Nested route for likes under a post
post_router.register(r"likes", views.LikeViewSet, basename="post-likes")

# Follow route
follow_router = DefaultRouter()
follow_router.register(r"follow", views.FollowViewSet, basename="follow")

# Block route
block_router = DefaultRouter()
block_router.register(r"block", views.BlockViewSet, basename="block")


urlpatterns = (
    auth_patterns
    + page_patterns
    + single_query_patterns
    + router.urls
    + post_router.urls
    + comments_router.urls
    + follow_router.urls
    + block_router.urls
)
