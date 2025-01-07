from django.urls import path

from . import views

auth_patterns = [
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]

api_patterns = [
    path("", views.index, name="index"),
]

urlpatterns = auth_patterns + api_patterns
