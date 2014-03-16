from django.contrib.gis.db import models
from django.db.models.query import QuerySet
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver

from choices import GENDERS, STATUSES
from serializers import to_plain_data
from media import media_upload_path, avatar_upload_path, prepare_thumbnail, thumbnail_url
from utils import normalize_url


class UserProfile(models.Model):
    user     = models.OneToOneField(User, related_name='profile')
    country  = models.CharField(_("Country"), max_length=50, blank=True, null=True)
    city     = models.CharField(_("City"), max_length=50, blank=True, null=True)
    gender   = models.CharField(_("Gender"), max_length=1, choices=GENDERS, blank=True, null=True)
    birthday = models.DateField(_("Birthday"), blank=True, null=True)
    status   = models.CharField(_("Status"), max_length=50, choices=STATUSES, default='unverified')
    about    = models.TextField(_("About"), blank=True, null=True)
    avatar   = models.FileField(_("Avatar"), upload_to=avatar_upload_path, blank=True, null=True)
    activation_key = models.CharField(_("Activation Key"), max_length=30, default='old-user')
    password_reset = models.CharField(_("Reset password key"), max_length=32, blank=True, null=True)
    filter_mycountry = models.BooleanField(_("Filter by my country"), default=True)
    location  = models.PointField(_("Location"), blank=True, null=True)

    def has_location(self):
        return bool(self.longitude) and bool(self.latitude)

    def activate(self):
        self.status = 'verified'
        self.save()

    def like(self, media):
        _, created = Like.objects.get_or_create(user=self.user, media=media)
        return created

    def unlike(self, media):
        Like.objects.filter(user=self.user, media=media).delete()
        return True

    # friends region

    def add_friend(self, friend):
        rel, created = Friendship.objects.get_or_create(user=self.user, friend=friend)
        return created

    def remove_friend(self, friend):
        queryset = Friendship.objects.filter(user=self.user, friend=friend)
        exists = bool(queryset.count())
        if exists:
            queryset.delete()
        return exists

    def get_friends(self):
        return map(lambda f: f.friend, self.user.follows.all())

    def get_friend_of(self):
        return map(lambda f: f.user, self.user.followed_by.all())

    friends   = property(get_friends)
    friend_of = property(get_friend_of)

    # avatar region

    def get_avatarurl(self):
        if self.avatar:
            url = self.avatar.url
        elif self.gender == 'M':
            url = '/images/user_male.png'
        elif self.gender == 'F':
            url = '/images/user_female.png'
        else:
            url = '/images/user_unisex.png'
        return normalize_url(url)

    avatarurl = property(get_avatarurl)

    def plain_data(self):
        return to_plain_data(self,
            'id', 'user_id:user.id', 'username:user.username', 'about', 'avatar:avatarurl',
            'first_name:user.first_name', 'last_name:user.last_name',
            'country', 'city', 'gender', 'birthday', 'status', 'pets:user.pets',)

    def __unicode__(self):
        return self.user.username

    class Meta:
        verbose_name = _("Profile")
        verbose_name_plural = _("Profiles")


class ExtendedProfile:
    def __init__(self, profile):
        self.profile = profile

    def plain_data(self):
        return to_plain_data(self.profile,
            'id', 'user_id:user.id', 'username:user.username', 'about', 'avatar:avatarurl',
            'first_name:user.first_name', 'last_name:user.last_name',
            'country', 'city', 'gender', 'birthday', 'status', 'pets:user.pets',
            'filter_mycountry', 'longitude:location.x', 'latitude:location.y')


class Speciality(models.Model):
    name = models.CharField(_("Name"), max_length=100)

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = _("Speciality")
        verbose_name_plural = _("Specialities")


class UserSpeciality(models.Model):
    user        = models.ForeignKey(User)
    speciality  = models.ForeignKey(Speciality)
    country     = models.CharField(_("Country"), max_length=50)
    city        = models.CharField(_("City"), max_length=50)
    location    = models.PointField(_("Location"))
    description = models.TextField(_("Description"), null=True, blank=True)


class Pet(models.Model):
    owner    = models.ForeignKey(User, related_name='pets')
    name     = models.CharField(_("Name"), max_length=50)
    species  = models.CharField(_("Species"), max_length=50, blank=True, null=True)
    breed    = models.CharField(_("Breed"), max_length=50, blank=True, null=True)
    color    = models.CharField(_("Color"), max_length=50, blank=True, null=True)
    birthday = models.DateField(_("Birthday"), blank=True, null=True)
    gender   = models.CharField(_("Gender"), max_length=1, choices=GENDERS, blank=True, null=True)
    about    = models.TextField(_("About"), blank=True, null=True)
    enabled  = models.BooleanField(_("Enabled"), default=True)
    breed_index = models.CharField(_("Breed Index"), max_length=50, blank=True, null=True)

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
            'id', 'name', 'species', 'breed', 'color', 'birthday',
            'gender', 'enabled', 'about', 'last_picture', 'breed_index')

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = _("Pet")
        verbose_name_plural = _("Pets")


class Breed(models.Model):
    name   = models.CharField(_("Name"), max_length=150)
    fci_no = models.IntegerField(_("FCI Standard No"), blank=True, null=True)
    species  = models.CharField(_("Species"), max_length=50, blank=True, null=True)

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
    name   = models.CharField(_("Name"), max_length=50)
    hidden = models.BooleanField(_("Hidden"), default=False)

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
            return self

    def with_pet(self, pet_id):
        if pet_id == "no":
            return self.filter(pet__id__isnull=True)
        elif pet_id:
            return self.filter(pet__id=int(pet_id))
        else:
            return self

    def with_breed(self, breed):
        if breed:
            return self.filter(pet__breed__iexact=breed)
        else:
            return self

    def with_gender(self, gender):
        if gender:
            return self.filter(pet__gender__iexact=gender)
        else:
            return self

    def with_species(self, species):
        if species:
            species_list = [i.strip() for i in species.split(",")]
            return self.filter(species__in=species_list)
        else:
            return self

    def next_to_me(self, loc):
        if loc.has_location():
            return self
        else:
            return self

class MediaFileManager(models.Manager):
    def get_queryset(self):
        return MediaFileQuerySet(self.model)

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)

        return getattr(self.get_queryset(), name)


class EnabledMediaFileManager(MediaFileManager):
    def get_queryset(self):
        return MediaFileQuerySet(self.model).filter(enabled=True).exclude(pet__enabled=False)


class MediaFile(models.Model):
    author      = models.ForeignKey(User)
    pet         = models.ForeignKey(Pet, null=True, blank=True, related_name='media_files')
    species     = models.CharField(_("Species"), max_length=50, blank=True, null=True)
    created     = models.DateTimeField(_("Created"), auto_now_add=True)
    file        = models.FileField(_("File"), upload_to=media_upload_path)
    description = models.TextField(_("Description"), null=True, blank=True)
    tags        = models.ManyToManyField(MediaTag, related_name='files+', null=True, blank=True)
    enabled     = models.BooleanField(_("Enabled"), default=True)

    objects = MediaFileManager()
    enabled_objects = EnabledMediaFileManager()

    owner     = property(lambda self: self.author)
    original  = property(lambda self: normalize_url(self.file.url))
    thumbnail = property(lambda self: thumbnail_url(self.original))
    likes     = property(lambda self: self.like_set.count())
    comments  = property(lambda self: self.comment_set.filter(deleted=False))

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

        new_tags = set([tag for tag, _ in [save_tag(name) for name in tag_names if name.strip()]])
        old_tags = set(self.tags.all())

        add_tags = new_tags - old_tags
        del_tags = old_tags - new_tags

        self.tags.remove(*del_tags)
        self.tags.add(*add_tags)

    favourite = property(get_favourite)

    def plain_data(self):
        return to_plain_data(self,
            'id', 'authorId:author.profile.id', 'author:author.username', 'authorAvatar:author.profile.avatarurl',
            'petId:pet.id', 'pet:pet.name', 'created', 'original', 'thumbnail', 'species',
            'description', 'tags', 'likes', 'favourite',)

    def __unicode__(self):
        return self.file.url

    class Meta:
        verbose_name = _("Media File")
        verbose_name_plural = _("Media Files")
        ordering = ["-created"]


class Comment(models.Model):
    author  = models.ForeignKey(User)
    media   = models.ForeignKey(MediaFile)
    created = models.DateTimeField(_("Created"), auto_now_add=True)
    text    = models.TextField(_("Text"))
    deleted = models.BooleanField(_("Deleted"), default=False)

    def get_queryset(self):
        return super(Comment, self).get_queryset().filter(deleted=False)

    def plain_data(self):
        return to_plain_data(self,
            'id', 'author:author.username', 'authorAvatar:author.profile.avatarurl',
            'created', 'text', 'thumbnail:media.thumbnail', 'mediaId:media.id')

    def __unicode__(self):
        return u"%s: %s" % (self.author, self.text[0:50])

    class Meta:
        verbose_name = _("Comment")
        verbose_name_plural = _("Comments")
        ordering = ["-created"]


class Like(models.Model):
    user    = models.ForeignKey(User)
    media   = models.ForeignKey(MediaFile)
    created = models.DateTimeField(_("Created"), auto_now_add=True)

    def plain_data(self):
        return to_plain_data(self, 'user:user.username', 'userAvatar:user.profile.avatarurl', 'created', 'media')


class Friendship(models.Model):
    user    = models.ForeignKey(User, related_name='follows')
    friend  = models.ForeignKey(User, related_name='followed_by')


# Signal callbacks

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        activation_key = User.objects.make_random_password(
            length=30, allowed_chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
        UserProfile.objects.create(user=instance, activation_key=activation_key)


@receiver(post_save, sender=MediaFile)
def create_media_file(sender, instance, created, **kwargs):
    if created:
        prepare_thumbnail(instance)
