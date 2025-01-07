from django.contrib import admin


class TotalLikesFilter(admin.SimpleListFilter):
    title = "Total Likes"
    parameter_name = "total_likes"

    def lookups(self, request, model_admin):
        return (
            ("0", "No likes"),
            ("10", "10+ Likes"),
            ("100", "100+ Likes"),
            ("1000", "1000+ Likes"),
        )

    def queryset(self, request, queryset):
        if self.value == "0":
            return queryset.filter(total_likes=0)
        if self.value == "10":
            return queryset.filter(total_likes__get=10)
        if self.value == "100":
            return queryset.filter(total_likes__gte=100)
        if self.value == "1000":
            return queryset.filter(total_likes__gte=1000)
        return queryset


class TotalCommentsFilter(admin.SimpleListFilter):
    title = "Total Comments"
    parameter_name = "total_comments"

    def lookups(self, request, model_admin):
        return (
            ("0", "No Comments"),
            ("1", "1 Comment"),
            ("10", "10+ Comments"),
            ("100", "100+ Comments"),
        )

    def queryset(self, request, queryset):
        if self.value() == "0":
            return queryset.filter(total_comments=0)
        if self.value() == "1":
            return queryset.filter(total_comments=1)
        if self.value() == "10":
            return queryset.filter(total_comments__gte=10)
        if self.value() == "100":
            return queryset.filter(total_comments__gte=100)
        return queryset


class TotalRepliesFilter(admin.SimpleListFilter):
    title = "Total Replies"
    parameter_name = "total_replies"

    def lookups(self, request, model_admin):
        return (
            ("0", "No Reply"),
            ("1", "1 Replies"),
            ("10", "10+ Replies"),
            ("100", "100+ Replies"),
        )

    def queryset(self, request, queryset):
        if self.value() == "0":
            return queryset.filter(total_replies=0)
        if self.value() == "1":
            return queryset.filter(total_replies=1)
        if self.value() == "10":
            return queryset.filter(total_replies__gte=10)
        if self.value() == "100":
            return queryset.filter(total_replies__gte=100)
        return queryset
