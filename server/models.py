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
    status   = models.CharField(name=_("Status"), max_length=50, choices=STATUSES, blank=True, null=True)

    def plain_data(self):
        return to_plain_data(self,
            'id', 'username:user.username', 'email:user.email',
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
    enabled  = models.BooleanField(name=_("Enanled"), default=True)

    def enable(self):
        self.enabled = True
        self.save()

    def disable(self):
        self.enabled = False
        self.save()

    def plain_data(self):
        return to_plain_data(self,
            'id', 'name', 'species', 'breed', 'color', 'birthday', 'gender', 'enabled')

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = _("Pet")
        verbose_name_plural = _("Pets")


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


class MediaFileManager(models.Manager):
    def get_query_set(self):
        return MediaFileQuerySet(self.model)

    def __getattr__(self, name, *args):
        if name.startswith("_"):
            raise AttributeError(name)

        return getattr(self.get_query_set(), name)


class MediaFile(models.Model):
    author      = models.ForeignKey(User)
    pet         = models.ForeignKey(Pet, null=True, blank=True)
    created     = models.DateTimeField(name=_("Created"), auto_now_add=True)
    file        = models.FileField(name=_("File"), upload_to=media_upload_path)
    description = models.TextField(name=_("Description"), null=True, blank=True)
    tags        = models.ManyToManyField(MediaTag, related_name='files+', null=True, blank=True)

    objects = MediaFileManager()

    owner     = property(lambda self: self.author)
    original  = property(lambda self: self.file.url)
    thumbnail = property(lambda self: thumbnail_url(self.file.url))

    def plain_data(self):
        return to_plain_data(self,
            'id', 'author:author.username', 'pet:pet.name',
            'created', 'original', 'thumbnail', 'description', 'tags')

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
            'id', 'author:author.username', 'created', 'text')

    def __unicode__(self):
        return u"%s: %s" % (self.owner, self.text[0:50])

    class Meta:
        verbose_name = _("Member")
        verbose_name_plural = _("Members")
        ordering = ["-created"]


# Signal callbacks

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


def create_media_file(sender, instance, created, **kwargs):
    if created:
        prepare_thumbnail(instance)


post_save.connect(create_user_profile, sender=User)
post_save.connect(create_media_file, sender=MediaFile)
