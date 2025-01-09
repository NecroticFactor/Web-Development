from django.contrib import admin
from .admin_filters import *
from .models import *


class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "first_name",
        "last_name",
        "account_type",
        "email",
        "date_joined",
    )

    search_fields = ["username", "first_name", "last_name", "account_type"]

    list_filter = ["account_type", "date_joined"]

    ordering = ["-username"]

    fieldsets = (
        (None, {"fields": ("username", "password", "email")}),
        ("Personal Information", {"fields": ("first_name", "last_name")}),
        ("Account Information", {"fields": ("account_type",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        (
            "Important Dates",
            {"fields": ("last_login", "date_joined"), "classes": ("collapse",)},
        ),
    )

    readonly_fields = ("last_login", "date_joined")


class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "total_likes", "total_comments", "created_at")
    readonly_fields = ("total_likes", "total_comments", "created_at")
    search_fields = ["title", "body"]
    list_filter = (
        TotalLikesFilter,
        TotalCommentsFilter,
        "created_at",
    )
    ordering = ("-created_at",)
    list_per_page = 20
    fieldsets = (
        (None, {"fields": ("title", "body", "user")}),
        (
            "Statistics",
            {"fields": ("total_likes", "total_comments"), "classes": ("collapse",)},
        ),
        ("Date Information", {"fields": ("created_at",), "classes": ("collapse",)}),
    )
    list_display_links = ("title",)


class LikesAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "created_at")
    readonly_fields = ("user", "post", "created_at")
    list_per_page = 20
    fieldsets = (
        (None, {"fields": ("user", "post")}),
        ("Date Information", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


class CommentsAdmin(admin.ModelAdmin):
    list_display = (
        "comments",
        "get_post_title",
        "get_user_username",
        "total_replies",
        "created_at",
    )
    readonly_fields = ("user", "post", "created_at")
    search_fields = ("comments", "post__title", "user__username")
    list_filter = (
        TotalRepliesFilter,
        "created_at",
    )
    list_per_page = 20
    fieldsets = (
        (None, {"fields": ("comments", "user", "post")}),
        ("Statistics", {"fields": ("total_replies",), "classes": ("collapse",)}),
        ("Date Information", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    def get_post_title(self, obj):
        return obj.post.title

    get_post_title.admin_order_field = "post__title"
    get_post_title.short_description = "Post Title"

    def get_user_username(self, obj):
        return obj.user.username

    get_user_username.admin_order_field = "user__username"
    get_user_username.short_description = "User Username"


class RepliesAdmin(admin.ModelAdmin):
    readonly_fields = ("user", "comments", "created_at")
    list_per_page = 20
    list_filter = ["created_at"]
    fieldsets = (
        (None, {"fields": ("user", "comments")}),
        ("Date Information", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


class FollowAdmin(admin.ModelAdmin):
    readonly_fields = ("follower", "followed", "created_at")
    list_display = ("follower", "followed", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("follower__username", "followed__username")
    ordering = ("-created_at",)
    list_per_page = 20
    fieldsets = (
        (None, {"fields": ("follower", "followed")}),
        ("Date Information", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Likes, LikesAdmin)
admin.site.register(Comments, CommentsAdmin)
admin.site.register(Replies, RepliesAdmin)
admin.site.register(Follow, FollowAdmin)
admin.site.register(Blocked)
