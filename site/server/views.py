import random
import string

from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.http import Http404
from django.shortcuts import redirect, render_to_response

from decorators import *
from errors import *
from forms import *
from media import resize_image
from models import *
import settings


@serialize
@require_method("POST")
def auth_register(request):
    form = RegistrationForm(request.POST)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    user = form.save()
    return user.profile


@serialize
@require_method("POST")
def auth_login(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)

    if user is None:
        raise proto_exc(EXC_AUTH_FAILED)

    if not user.is_active:
        raise proto_exc(EXC_INACTIVE_USER, {"username": username})

    login(request, user)
    return user.profile


@serialize
@require_method("GET")
def auth_logged(request):
    return request.user.is_authenticated()


@serialize
@require_method("GET")
def auth_logout(request):
    logout(request)


def auth_activate(request, activation_key):
    try:
        profile = UserProfile.objects.get(activation_key=activation_key)
        profile.activate()

        login(request, profile.user)

        return render_to_response('/auth/activation_done.html')
    except UserProfile.DoesNotExist:
        return render_to_response('/auth/activation_failed.html')


@serialize
@require_method("GET")
@require_exist(User)
def auth_reset_password(request):
    email = request.GET['email']
    user = User.objects.get(username=email)

    password = ''.join(random.choice(string.letters + string.digits) for n in range(8))
    user.set_password(password)
    user.save()

    send_mail('Mixim Password Reminder',
        'Your new password: %s' % password,
        None, [user.email])


@serialize
@require_method("GET")
@require_exist(User)
def profile_get(request, user_id):
    return User.objects.get(pk=user_id).profile


@serialize
@require_method("POST")
@require_auth
def profile_save(request):
    form = ProfileForm(request.POST, instance=request.user)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    form.save()


@serialize
@require_method("POST")
@require_auth
def pet_add(request):
    pet = Pet(owner=request.user)
    form = PetForm(request.POST, instance=pet)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    form.save()


@serialize
@require_method("GET")
@require_exist(Pet)
def pet_get(request, pet_id):
    return Pet.objects.get(pk=pet_id)


@serialize
@require_method("POST")
@require_auth
@require_ownership(Pet)
def pet_save(request, pet_id):
    pet = Pet.objects.get(pk=pet_id)
    form = PetForm(request.POST, instance=pet)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    form.save()


@serialize
@require_method("GET")
@require_auth
@require_ownership(Pet)
def pet_enable(request, pet_id):
    pet = Pet.objects.get(pk=pet_id)
    pet.enable()


@serialize
@require_method("GET")
@require_auth
@require_ownership(Pet)
def pet_disable(request, pet_id):
    pet = Pet.objects.get(pk=pet_id)
    pet.disable()


@serialize
@require_method("GET")
def media_list(request, start=0, limit=10):
    tags    = request.GET.get('tags')
    authors = request.GET.get('authors')

    query = MediaFile.objects.all()
    if tags:
        query = query.tagged_with(tags)
    if authors:
        query = query.posted_by(authors)

    start = int(start)
    limit = int(limit)
    end = start + limit

    return query[start:end]


@serialize
@require_method("GET")
@require_exist(MediaFile)
def media_get(request, media_id):
    return MediaFile.objects.get(pk=media_id)


@serialize
@require_method("POST")
@require_auth
def media_upload(request):
    media = MediaFile(author=request.user)
    form = MediaForm(request.POST, request.FILES, instance=media)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    form.save()


@serialize
@require_method("GET")
@require_exist(MediaFile)
def comment_list(request, media_id):
    media  = MediaFile.objects.get(pk=media_id)
    return media.comments


@serialize
@require_method("POST")
@require_auth
@require_exist(MediaFile)
def comment_add(request, media_id):
    author = request.user
    media  = MediaFile.objects.get(pk=media_id)
    text   = request.POST.get('text')

    Comment.objects.create(author=author, media=media, text=text)


def handle404(request):
    request._req.add_common_vars()
    url = request._req.subprocess_env['REDIRECT_URL']

    if not url.startswith('/media/resized/'):
        raise Http404

    splitted = url.split("/")
    new_size = splitted[3]
    path = "original/" + "/".join(splitted[4:])
    resize_image(path, new_size)

    return redirect(settings.TEMP_MEDIA_URL + '/'.join(splitted[2:]))
