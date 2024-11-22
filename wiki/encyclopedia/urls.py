from django.urls import path

from . import views

app_name = "encyclopedia"
urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>/", views.detail, name='detail'),
    path('search/', views.search, name='search'),
    path('create_post/', views.create_post, name='create_post'),
    path('wiki/<str:title>/update_post/', views.update_post, name='update_post'),
]
