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
    listings_with_max_bid = []

    for listing in all_listings:
        bids = listing.bids_on_listing.all()
        if bids:
            max_bid = max(bids, key=lambda bid: bid.bid)
        else:
            max_bid = None

        listings_with_max_bid.append({"listing": listing, "max_bid": max_bid})

    context = {
        "listings_with_max_bid": listings_with_max_bid,
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



# User registration
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



# Create watchlist
@login_required
def watchlist(request):
    return render(request, "auctions/watchlist.html")



# Create user listing
@login_required
def create_listing(request):
    if request.method == "POST":
        title = request.POST.get('title').strip()  
        description = request.POST.get('description').strip()  
        category_name = request.POST.get('category').strip()  
        url = request.POST.get('url').strip() 
        
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
                category=category,  
            )

            success_message = "Item successfully added."
            return render(request, "auctions/create_listing.html", {'success_message': success_message})
        except IntegrityError:
            error_message = "Item already exists."
            return render(request, "auctions/create_listing.html", {'error_message': error_message})

    return render(request, "auctions/create_listing.html")



# Edit the listing
@login_required
def edit_listing(request, id):
    listing = Listing.objects.get(pk=id)
    context = {
        "listing":listing,
        "id":id,
    }
    return render(request, "auctions/edit_listing.html", context)




# Update the listing after editing
@login_required
def update_listing(request, id):
    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        category_name = request.POST.get('category').strip()
        url = request.POST.get('url')

        # Try to get the category, or create it if it doesn't exist
        category, created = Category.objects.get_or_create(name=category_name)

        # Update the listing
        Listing.objects.filter(pk=id).update(
            user=request.user,
            title=title.strip(),
            description=description.strip(),
            category=category,  
            url=url.strip()  
        )

        return HttpResponseRedirect(reverse("my_listings"))



# Delete the listing
@login_required
def delete_listing(rewuest, id):
    listing = get_object_or_404(Listing, pk=id)
    listing.delete()
    return redirect("my_listings")



# Show the user's listing on my listing page
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



# Get the category
@login_required
def categories(request):
    category = Category.objects.all()
    context = {
        "categories":category
    }
    return render(request, "auctions/categories.html", context)



# Get the listings based on category
@login_required
def category_listing(request, category):
    listings = Listing.objects.filter(category__name=category)

    listing_data = []
    for listing in listings:
        bids = listing.bids_on_listing.all()
        max_bid = max(bids, key=lambda bid: bid.bid).bid if bids else None
        listing_data.append({
            "listing": listing,
            "max_bid": max_bid
        })

    context = {
        "listing_data": listing_data
    }
    return render(request, "auctions/category_listing.html", context)



# Get the contexts for the listing page and post-bid POST
def get_listing_context(id, user):
    listing = Listing.objects.get(pk=id)
    bids = listing.bids_on_listing.all()
    max_bid_obj = max(bids, key=lambda bid: bid.bid) if bids else None
    max_bid = max_bid_obj.bid if max_bid_obj else None
    max_bid_user = max_bid_obj.user if max_bid_obj else None
    is_owner = user == listing.user

    return {
        "listing": listing,
        "max_bid": max_bid,
        "max_bid_user": max_bid_user,
        "is_owner": is_owner,
    }



# Get the details of a listing
@login_required
def listing_detail(request, id):
    context = get_listing_context(id, request.user)
    return render(request, "auctions/listing_detail.html", context)



# Handles Biding logic and redirection
@login_required
def new_bid(request, id):
    if request.method == "POST":
        user_bid = float(request.POST.get("bid"))
        listing = Listing.objects.get(pk=id)
        bids = listing.bids_on_listing.all()

        if not bids:
            if user_bid > listing.price:
                Bid.objects.create(
                    bid=user_bid,
                    user=request.user,
                    listing=listing,
                )
                return redirect("listing_detail", id=id)
            else:
                context = get_listing_context(id, request.user)
                context["bid_price_error"] = "Bid must be greater than the price."
                return render(request, "auctions/listing_detail.html", context)
        else:
            max_bid = max(bids, key=lambda bid: bid.bid).bid
            if user_bid > max_bid:
                Bid.objects.create(
                    listing=listing,
                    bid=user_bid,
                    user=request.user,
                )
                return redirect("listing_detail", id=id)
            else:
                context = get_listing_context(id, request.user)
                context["bid_bid_error"] = "Bid must be greater than the current bid."
                return render(request, "auctions/listing_detail.html", context)

    return redirect("listing_detail", id=id)
