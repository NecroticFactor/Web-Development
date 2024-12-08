from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("watchlist/", views.watchlist, name="watchlist"),
    path("categories/", views.categories, name="categories"),
    path("categories/<str:category>/", views.category_listing, name="category_listing"),
    path("listings/details/<int:id>", views.listing_detail, name="listing_detail"),
    path("listings/detail/<int:id>/new_bid", views.new_bid, name="new_bid"),
    path("create_listing/", views.create_listing, name="create_listing"),
    path("my_listings/", views.my_listings, name="my_listings"),
    path("my_listings/edit/<int:id>", views.edit_listing, name="edit_listing"),
    path("my_listing/update/<int:id>", views.update_listing, name="update_listing"),
    path("my_listing/delete/<int:id>", views.delete_listing, name="delete_listing"),


]
