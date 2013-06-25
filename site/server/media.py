import hashlib
import datetime
import os
import subprocess

import settings


def media_upload_path(instance, filename):
    sha1 = hashlib.sha1()
    sha1.update(filename)
    sha1.update(str(datetime.datetime.now()))
    digest = sha1.hexdigest()

    _, ext = os.path.splitext(filename)
    path = "original/%s/%s%s" % (instance.author.id, digest, ext)

    if os.path.exists(settings.MEDIA_ROOT + path):
        return media_upload_path(instance, filename)  # will be used new time
    else:
        return path


def avatar_upload_path(instance, filename):
    sha1 = hashlib.sha1()
    sha1.update(filename)
    sha1.update(str(datetime.datetime.now()))
    digest = sha1.hexdigest()

    _, ext = os.path.splitext(filename)
    path = "avatar/%s/%s%s" % (instance.user.id, digest, ext)

    if os.path.exists(settings.MEDIA_ROOT + path):
        return avatar_upload_path(instance, filename)  # will be used new time
    else:
        return path


def thumbnail_url(original):
    return original.replace('original', 'thumbnail', 1)


def prepare_thumbnail(instance):
    original_path = settings.MEDIA_ROOT + instance.file.name
    thumbnail_path = thumbnail_url(original_path)
    subprocess.call([settings.MAKE_THUMBNAIL_SCRIPT, original_path, thumbnail_path])


def resize_image(path, new_size):
    original_path = settings.MEDIA_ROOT + path
    resized_path = original_path.replace('original', 'resized/' + new_size, 1)
    subprocess.call([settings.RESIZE_IMAGE_SCRIPT, new_size, original_path, resized_path])


def resize_thumbnail(path, new_size):
    original_path = settings.MEDIA_ROOT + path
    resized_path = original_path.replace('original', 'thumbnails/' + new_size, 1)
    subprocess.call([settings.RESIZE_THUMBNAIL_SCRIPT, new_size, original_path, resized_path])


def resize_avatar(path):
    subprocess.call([settings.RESIZE_AVATAR_SCRIPT, settings.AVATAR_SIZE, path])
