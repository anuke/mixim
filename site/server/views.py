import random
import string

from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.http import Http404
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext

from decorators import *
from errors import *
from forms import *
from media import resize_image, resize_thumbnail
from models import *
from utils import send_mail_to_user

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
    user = authenticate(username=username.lower(), password=password)

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

        # TODO: do not activate already verified accounts

        # need to be upgraded in case of changing auth backends
        profile.user.backend = 'django.contrib.auth.backends.ModelBackend'

        # generate new password
        password = User.objects.make_random_password(length=8)
        profile.user.set_password(password)
        profile.user.save()

        login(request, profile.user)

        send_mail_to_user(profile.user, 'registration_done', { 'password': password })

        return render_to_response('auth/activation_done.html')
    except UserProfile.DoesNotExist:
        return render_to_response('auth/activation_failed.html')


@serialize
@require_method("GET")
@require_exist(User)
def auth_reset_password(request):
    email = request.GET['email']
    user = User.objects.get(username=email)
    profile = UserProfile.objects.get(user=User.objects.get(username=email))

    reset_password = ''.join(random.choice(string.letters + string.digits) for n in range(32))
    profile.password_reset = reset_password
    profile.save()

    send_mail_to_user(user, 'password_reset', { 'reset_key': reset_password })


@require_method("GET")
def auth_autocreate_password(request):
    reset_key = request.GET['key']
    user = User.objects.get(profile=UserProfile.objects.get(password_reset=reset_key))

    password = ''.join(random.choice(string.letters + string.digits) for n in range(8))
    user.set_password(password)
    user.save()

    send_mail_to_user(user, 'password_changed', { 'password': password })
    return redirect('/notify_remail.shtml')


@serialize
@require_method("POST")
@require_auth
def auth_change_password(request):
    user = request.user
    password = request.POST['new_password']
    confirm = request.POST['confirmation']
    if not password:
        raise proto_exc(EXC_INVALID_DATA, { "new_password": "Password should not be empty" })
    if password != confirm:
        raise proto_exc(EXC_INVALID_DATA, { "confirm": "Confirmation does not match the password." })
    user.set_password(password)
    user.save()

    send_mail_to_user(user, 'password_changed', { 'password': password })


@serialize
@require_method("GET")
def user_stat(request):
    users = User.objects.count()
    pets = Pet.objects.count()
    return { "count": users + pets }


@serialize
@require_method("GET")
def user_check(request, username):
    return User.objects.filter(username__iexact=username).exists()


@serialize
@require_method("GET")
@require_id(User)
def profile_get(request, user):
    return user.profile


@serialize
@require_method("GET")
@require_auth
def profile_my(request):
    return request.user.profile


@serialize
@require_method("POST")
@require_auth
def profile_save(request):
    form = ProfileForm(request.POST, instance=request.user.profile)
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

    return form.save()


@serialize
@require_method("GET")
@require_id(Pet)
def pet_get(request, pet):
    return pet


@serialize
@require_method("POST")
@require_auth
@require_ownership(Pet)
def pet_save(request, pet):
    form = PetForm(request.POST, instance=pet)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    return form.save()


@serialize
@require_method("GET")
@require_auth
@require_ownership(Pet)
def pet_enable(request, pet):
    pet.enable()


@serialize
@require_method("GET")
@require_auth
@require_ownership(Pet)
def pet_disable(request, pet):
    pet.disable()


@serialize
@require_method("GET")
def media_list(request, start=0, limit=10):
    tags      = request.GET.get('tags')
    authors   = request.GET.get('authors')
    author_id = request.GET.get('author_id')
    pet_id    = request.GET.get('pet_id')
    breed     = request.GET.get('breed')
    gender    = request.GET.get('gender')

    query = MediaFile.enabled_objects.all()
    if tags:
        query = query.tagged_with(tags)
    if authors:
        query = query.posted_by(authors)
    if author_id:
        query = query.with_author(author_id)
    if pet_id:
        query = query.with_pet(pet_id)
    if breed:
        query = query.with_breed(breed)
    if gender:
        query = query.with_gender(gender)

    start = int(start)
    limit = int(limit)
    end = start + limit

    result = list(query[start:end])
    # TODO: rewrite to left join
    if request.user.is_authenticated():
        for media in result:
            media.aware_of(request.user)
    return result


@serialize
@require_method("GET")
@require_id(MediaFile, enabled=True)
def media_get(request, media):
    if request.user.is_authenticated():
        media.aware_of(request.user)
    return media


@serialize
@require_method("GET")
@require_auth
@require_id(MediaFile, enabled=True)
def media_like(request, media):
    return request.user.profile.like(media)


@serialize
@require_method("GET")
@require_auth
@require_id(MediaFile, enabled=True)
def media_unlike(request, media):
    return request.user.profile.unlike(media)


@serialize
@require_method("GET")
@require_auth
@require_ownership(MediaFile)
def media_enable(request, media):
    media.enable()


@serialize
@require_method("GET")
@require_auth
@require_ownership(MediaFile)
def media_disable(request, media):
    media.disable()


@serialize
@require_method("POST")
@require_auth
def media_upload(request):
    media = MediaFile(author=request.user)
    form = MediaForm(request.POST, request.FILES, instance=media)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    form.save()
    return media


@serialize
@require_method("POST")
@require_auth
def avatar_upload(request):
    form = AvatarForm(request.POST, request.FILES, instance=request.user.profile)
    if form.is_valid():
        form.save()
        return request.user.profile.avatar.url
    else:
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})



@serialize
@require_method("POST")
@require_auth
@require_ownership(MediaFile)
def media_save(request, media):
    form = MediaForm(request.POST, instance=media)
    if not form.is_valid():
        raise proto_exc(EXC_INVALID_DATA, {"errors": form.errors})

    form.save()


@serialize
@require_method("GET")
@require_auth
def friend_add(request, username):
    friend = User.objects.get(username = username)
    return request.user.profile.add_friend(friend)


@serialize
@require_method("GET")
@require_auth
def friend_remove(request, username):
    friend = User.objects.get(username = username)
    return request.user.profile.remove_friend(friend)


@serialize
@require_method("GET")
@require_id(MediaFile, enabled=True)
def comment_list(request, media):
    return media.comments.filter(deleted=False)


@serialize
@require_auth
def comment_last(request, type='outbox'):
    if type == 'inbox':
        return Comment.objects.filter(media__author=request.user, deleted=False).order_by('-created')
    elif type == 'outbox':
        return Comment.objects.filter(author=request.user, deleted=False).order_by('-created')
    else:
        return False


@serialize
def comment_all_last(request, type='outbox'):
    return Comment.objects.filter(deleted=False).order_by('-created')[:10]


@serialize
@require_method("POST")
@require_auth
@require_id(MediaFile, enabled=True)
def comment_add(request, media):
    author = request.user
    text   = request.POST.get('text')

    Comment.objects.create(author=author, media=media, text=text)


#TODO: check owner deleted
@serialize
@require_auth
@require_method("POST")
def comment_delete(request):
    comment_id = int(request.POST.get('comment'))
    comment = Comment.objects.get(id=comment_id)
    comment.deleted = True
    comment.save()


@serialize
@require_method("GET")
def breed_dict(request):
    return Breed.objects.order_by('name')


@serialize
@require_method("GET")
def breed_available(request):
    term = request.GET.get('term', '')
    return Pet.objects.filter(breed__icontains=term, enabled=True).order_by('breed').distinct('breed').values('breed')


@serialize
@require_method("GET")
def tag_available(request):
    term = request.GET.get('term', '')
    return MediaTag.objects.filter(name__icontains=term).order_by('name').distinct('name').values('name')


@serialize
@require_method("POST")
def feedback(request):
    # TODO: move to form
    email   = request.POST.get('email')
    subject = request.POST.get('subject')
    text    = request.POST.get('text')

    if not email or not text:
        raise proto_exc(EXC_INVALID_DATA, {"errors": "Check your fields"})

    send_mail('Feedback from %s: %s' % (email, subject), text, None, ['am35a.piston@gmail.com'])


@serialize
@require_method("GET")
@require_id(MediaFile, enabled=True)
def bo_media_delete(request, media):
    media.disable()

def handle404(request):
    request._req.add_common_vars()
    url = request._req.subprocess_env['REDIRECT_URL']

    if  url.startswith('/media/resized/'):
        splitted = url.split("/")
        new_size = splitted[3]
        path = "original/" + "/".join(splitted[4:])
        resize_image(path, new_size)

        return redirect(settings.TEMP_MEDIA_URL + '/'.join(splitted[2:]))
    elif  url.startswith('/media/thumbnails/'):
        splitted = url.split("/")
        new_size = splitted[3]
        path = "original/" + "/".join(splitted[4:])
        resize_thumbnail(path, new_size)

        return redirect(settings.TEMP_MEDIA_URL + '/'.join(splitted[2:]))
    else:
        raise Http404

def show_user_page(request, username):
    user = User.objects.get(username=username)
    page = int(request.GET.get('page', 1))
    per_page = 20
    start = (page - 1) * per_page
    end = start + per_page
    media_list = MediaFile.enabled_objects.with_author(user.id)[start:end]
    context = RequestContext(request, {
        'profile': user.profile,
        'media_list': media_list
    })

    return render_to_response('user/user_page.html', context_instance=context)
