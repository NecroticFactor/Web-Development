from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect
from decimal import Decimal, InvalidOperation
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import *


def index(request):
    all_listings = Listing.objects.all().order_by("-created_at")
    context = {
        "all_listings": all_listings
    }

    return render(request, "auctions/index.html", context)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            next_url = request.GET.get("next",reverse("index"))
            return HttpResponseRedirect(next_url)
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["first-name"]
        last_name = request.POST['last-name']

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(
            username,
            email,
            password,
            first_name=first_name,
            last_name=last_name
            )
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required
def watchlist(request):
    return render(request, "auctions/watchlist.html")


@login_required
def create_listing(request):
    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        category_name = request.POST.get('category')
        url = request.POST.get('url')
        
        try:
            price = Decimal(request.POST.get("price", "0.00"))
        except (InvalidOperation, TypeError, ValueError):
            price = Decimal("0.00")

        try:
            # Check if the category exists, if not, create it
            category, created = Category.objects.get_or_create(name=category_name)

            # Create and save the listing
            Listing.objects.create(
                user=request.user,
                title=title,
                description=description,
                url=url,
                price=price,
                category=category,  # Link the listing to the category
            )

            success_message = "Item successfully added."
            return render(request, "auctions/create_listing.html", {'success_message': success_message})
        except IntegrityError:
            error_message = "Item already exists."
            return render(request, "auctions/create_listing.html", {'error_message': error_message})

    return render(request, "auctions/create_listing.html")


@login_required
def edit_listing(request, id):
    listing = Listing.objects.get(pk=id)
    context = {
        "listing":listing,
        "id":id,
    }
    return render(request, "auctions/edit_listing.html", context)


@login_required
def update_listing(request, id):
    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        category_name = request.POST.get('category')  # This will be the category name as a string
        url = request.POST.get('url')

        # Try to get the category, or create it if it doesn't exist
        category, created = Category.objects.get_or_create(name=category_name)

        # Update the listing
        Listing.objects.filter(pk=id).update(
            user=request.user,
            title=title,
            description=description,
            category=category,  # Pass the category instance here
            url=url
        )

        return HttpResponseRedirect(reverse("my_listings"))

@login_required
def delete_listing(rewuest, id):
    listing = get_object_or_404(Listing, pk=id)
    listing.delete()
    return redirect("my_listings")




@login_required
def my_listings(request):
    current_user = request.user
    user_list = User.objects.get(username=current_user)
    listings = user_list.user_listings.all()

    listings_with_max_bid = []

    for listing in listings:
        bids = listing.bids_on_listing.all()
        if bids:
            max_bid = max(bids, key=lambda bid: bid.bid)
        else:
            max_bid = None

        listings_with_max_bid.append({"listing": listing, "max_bid": max_bid})

    context = {
        "listings_with_max_bid": listings_with_max_bid,
    }
    return render(request, "auctions/my_listings.html", context)


@login_required
def categories(request):
    category = Listing.objects.get()
    return render(request, "auctions/categories.html")


@login_required
def category_listing(request, category):
    listing = Listing.objects.get(pk=category)
    context = {
        "listings":listing
    }
    return render(request, "auctions/category_listing.html", context)
