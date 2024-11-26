from django.urls import path

from . import views

app_name = "encyclopedia"
urlpatterns = [
    path("", views.index, name="index"),
    path("search/", views.search, name="search"),
    path("create_page/", views.create_page, name="create_page"),
    path("<str:title>/update_page/", views.update_page, name="update_page"),
    path("<str:title>/delete_page/", views.delete_page, name="delete_page"),
    path("random_page/", views.random_page, name="random_page"),
    path("<str:title>/", views.detail, name="detail"),
]