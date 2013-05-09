import random
import string

from django.db import models
from django.db.models.query import QuerySet
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from django.db.models.signals import post_save

from choices import GENDERS, STATUSES
from serializers import to_plain_data
from media import media_upload_path, prepare_thumbnail, thumbnail_url


class UserProfile(models.Model):
    user     = models.OneToOneField(User, related_name='profile')
    country  = models.CharField(name=_("Country"), max_length=50, blank=True, null=True)
    city     = models.CharField(name=_("City"), max_length=50, blank=True, null=True)
    gender   = models.CharField(name=_("Gender"), max_length=1, choices=GENDERS, blank=True, null=True)
    birthday = models.DateField(name=_("Birthday"), blank=True, null=True)
    status   = models.CharField(name=_("Status"), max_length=50, choices=STATUSES, default='unverified')
    about    = models.TextField(name=_("About"), blank=True, null=True)
    activation_key = models.CharField(name=_("Activation Key"), max_length=30, default='old-user')

    display_name = property(lambda self: self.user.username.partition('@')[0])

    def activate(self):
        self.status = 'verified'
        self.save()

    def like(self, media):
        _, created = Like.objects.get_or_create(user=self.user, media=media)
        return created

    def unlike(self, media):
        Like.objects.filter(user=self.user, media=media).delete()
        return True

    def plain_data(self):
        return to_plain_data(self,
            'id', 'user_id:user.id', 'username:display_name', 'about',
            'first_name:user.first_name', 'last_name:user.last_name',
            'country', 'city', 'gender', 'birthday', 'status', 'pets:user.pets')

    def __unicode__(self):
        return self.user.username

    class Meta:
        verbose_name = _("Profile")
        verbose_name_plural = _("Profiles")


class Pet(models.Model):
    owner    = models.ForeignKey(User, related_name='pets')
    name     = models.CharField(name=_("Name"), max_length=50)
    species  = models.CharField(name=_("Species"), max_length=50, blank=True, null=True)
    breed    = models.CharField(name=_("Species"), max_length=50, blank=True, null=True)
    color    = models.CharField(name=_("Species"), max_length=50, blank=True, null=True)
    birthday = models.DateField(name=_("Birthday"), blank=True, null=True)
    gender   = models.CharField(name=_("Gender"), max_length=1, choices=GENDERS, blank=True, null=True)
    about    = models.TextField(name=_("About"), blank=True, null=True)
    enabled  = models.BooleanField(name=_("Enabled"), default=True)

    def get_last_picture(self):
        files = self.media_files.order_by('-id')[0:1]
        if len(files):
            return files[0].thumbnail
        return None

    last_picture = property(get_last_picture)

    def enable(self):
        self.enabled = True
        self.save()

    def disable(self):
        self.enabled = False
        self.save()

    def plain_data(self):
        return to_plain_data(self,
            'id', 'name', 'species', 'breed', 'color', 'birthday', 'gender', 'enabled', 'about', 'last_picture')

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = _("Pet")
        verbose_name_plural = _("Pets")


class Breed(models.Model):
    name   = models.CharField(name=_("Name"), max_length=150)
    fci_no = models.IntegerField(name=_("FCI Standard No"), blank=True, null=True)

    def __unicode__(self):
        return self.name

    def plain_data(self):
        return to_plain_data(self, 'name', 'fci_no')

    class Meta:
        verbose_name = _("Breed")
        verbose_name_plural = _("Breeds")


class MediaTagManager(models.Manager):
    # TODO: make it thread safe
    def save(self, name):
        return self.get_or_create(name=name)


class MediaTag(models.Model):
    name   = models.CharField(name=_("Name"), max_length=50)
    hidden = models.BooleanField(name=_("Hidden"), default=False)

    objects = MediaTagManager()

    def __unicode__(self):
        return self.name

    def plain_data(self):
        return self.name

    class Meta:
        verbose_name = _("Tag")
        verbose_name_plural = _("Tags")


class MediaFileQuerySet(QuerySet):
    def tagged_with(self, tags):
        if not tags:
            return self

        tag_names = [name.strip() for name in tags.split(",")]
        return self.filter(tags__name__in=tag_names)

    def posted_by(self, authors):
        if not authors:
            return self

        author_names = [name.strip() for name in authors.split(",")]
        return self.filter(author__username__in=author_names)

    def with_author(self, author_id):
        if author_id:
            return self.filter(author__id=int(author_id))
        else:
            return self;

    def with_pet(self, pet_id):
        if pet_id == "no":
            return self.filter(pet__id__isnull=True)
        elif pet_id:
            return self.filter(pet__id=int(pet_id))
        else:
            return self;

    def with_breed(self, breed):
        if breed:
            return self.filter(pet__breed__iexact=breed)
        else:
            return self;

    def with_gender(self, gender):
        if gender:
            return self.filter(pet__gender__iexact=gender)
        else:
            return self;


class MediaFileManager(models.Manager):
    def get_query_set(self):
        return MediaFileQuerySet(self.model)

    def __getattr__(self, name, *args):
        if name.startswith("_"):
            raise AttributeError(name)

        return getattr(self.get_query_set(), name)


class EnabledMediaFileManager(MediaFileManager):
    def get_query_set(self):
        return MediaFileQuerySet(self.model).filter(enabled=True).exclude(pet__enabled=False)

class MediaFile(models.Model):
    author      = models.ForeignKey(User)
    pet         = models.ForeignKey(Pet, null=True, blank=True, related_name='media_files')
    created     = models.DateTimeField(name=_("Created"), auto_now_add=True)
    file        = models.FileField(name=_("File"), upload_to=media_upload_path)
    description = models.TextField(name=_("Description"), null=True, blank=True)
    tags        = models.ManyToManyField(MediaTag, related_name='files+', null=True, blank=True)
    enabled     = models.BooleanField(name=_("Enabled"), default=True)

    objects = MediaFileManager()
    enabled_objects = EnabledMediaFileManager()

    owner     = property(lambda self: self.author)
    original  = property(lambda self: self.file.url)
    thumbnail = property(lambda self: thumbnail_url(self.file.url))
    likes     = property(lambda self: self.like_set.count())

    def enable(self):
        self.enabled = True
        self.save()

    def disable(self):
        self.enabled = False
        self.save()

    def aware_of(self, user):
        self.favourite__ = Like.objects.filter(user=user, media=self).exists()

    def get_favourite(self):
        if hasattr(self, 'favourite__'):
            return self.favourite__
        return False

    def tag_with(self, tag_names):
        def save_tag(name):
            return MediaTag.objects.get_or_create(name=name.strip())

        new_tags = set([tag for tag,_ in [save_tag(name) for name in tag_names if name.strip()]])
        old_tags = set(self.tags.all())

        add_tags = new_tags - old_tags
        del_tags = old_tags - new_tags

        self.tags.remove(*del_tags)
        self.tags.add(*add_tags)

    favourite = property(get_favourite)

    def plain_data(self):
        return to_plain_data(self,
            'id', 'authorId:author.profile.id', 'author:author.profile.display_name',
            'petId:pet.id', 'pet:pet.name', 'created', 'original', 'thumbnail',
            'description', 'tags', 'likes', 'favourite',)

    def __unicode__(self):
        return self.file.url

    class Meta:
        verbose_name = _("Member")
        verbose_name_plural = _("Members")
        ordering = ["-created"]


class Comment(models.Model):
    author  = models.ForeignKey(User)
    media   = models.ForeignKey(MediaFile, related_name='comments')
    created = models.DateTimeField(name=_("Created"), auto_now_add=True)
    text    = models.TextField(name=_("Text"))

    def plain_data(self):
        return to_plain_data(self,
            'id', 'author:author.profile.display_name', 'created', 'text')

    def __unicode__(self):
        return u"%s: %s" % (self.owner, self.text[0:50])

    class Meta:
        verbose_name = _("Member")
        verbose_name_plural = _("Members")
        ordering = ["-created"]


class Like(models.Model):
    user    = models.ForeignKey(User)
    media   = models.ForeignKey(MediaFile)
    created = models.DateTimeField(name=_("Created"), auto_now_add=True)


# Signal callbacks

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        activation_key = ''.join(random.choice(string.ascii_uppercase + string.digits) for n in range(30))
        UserProfile.objects.create(user=instance, activation_key=activation_key)


def create_media_file(sender, instance, created, **kwargs):
    if created:
        prepare_thumbnail(instance)


post_save.connect(create_user_profile, sender=User)
post_save.connect(create_media_file, sender=MediaFile)
