from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.contrib import messages
import random

from . import util


def index(request):
    context = {
        "entries": util.list_entries()
    }
    return render(request, "encyclopedia/index.html", context)



def detail(request, title):
    content = util.get_entry(title)
    if content:

        html_content = util.convert_to_html(content)

        context = {
            "title": title,
            "detail": html_content
        }
        return render(request, "encyclopedia/details.html", context)
    return render(request, 'encyclopedia/error.html')


def search(request):
    query = request.GET.get('q', '').strip().lower()
    entries = util.list_entries()
    matching_entries = [entry for entry in entries if query in entry.lower()]

    if len(matching_entries) == 1 and matching_entries[0].lower() == query:

        return redirect('encyclopedia:detail', title=matching_entries[0])

    elif matching_entries:
        return render(request, 'encyclopedia/search_results.html', {
            'query': query,
            'entries': matching_entries
        })
    else:
        return render(request, 'encyclopedia/error.html',)


def create_page(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        body = request.POST.get('description')
        content = f"# {title}\n\n{body}"
        util.save_entry(title, content)
        return redirect("encyclopedia:index")
    return render(request, 'encyclopedia/create_post.html', )



def update_page(request, title):
    if request.method == 'POST':
        body = request.POST.get('description')
        util.save_entry(title, body)
        return redirect("encyclopedia:detail", title=title)
    content = util.get_entry(title)
    if content:
        context = {
            "title": title,
            "description": content
        }
    else:
        context = {
            "title": title,
            "description": "Content not found for this title."
        }
    return render(request, 'encyclopedia/update_post.html', context)


def delete_page(request, title):
    util.delete_entry(title)
    messages.success(request, f"The page '{title}' was successfully deleted.")
    return redirect("encyclopedia:index")


def random_page(request):
    entries = util.list_entries()
    print(entries)
    if entries:
        title = random.choice(entries)
        return detail(request,title)