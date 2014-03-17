from django import forms
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User
from django.contrib.gis import geos

from models import UserProfile, Pet, MediaFile
from choices import GENDERS
from utils import send_mail_to_user, find_geo_by_ip

import settings


class RegistrationForm(forms.ModelForm):
    username = forms.RegexField(label=_("Username"), min_length=4, max_length=30, regex=r'^[\w.-]+$',
        help_text=_("Required. From 4 to 30 characters. Letters, digits and ./-/_ only."),
        error_messages={'invalid': _("This value may contain only letters, numbers and ./-/_ characters.")})
    email = forms.EmailField(label=_("E-mail"), max_length=75)

    country  = forms.CharField(label=_("Country"), max_length=50, required=False)
    city     = forms.CharField(label=_("City"), max_length=50, required=False)
    gender   = forms.ChoiceField(label=_("Gender"), choices=GENDERS, required=False)
    birthday = forms.DateField(label=_("Birthday"), required=False, input_formats=['%d/%m/%Y'])

    def __init__(self, request):
        super(RegistrationForm, self).__init__(request.POST)
        self.request = request

    class Meta:
        model = User
        fields = ("username", "email",)

    def clean_username(self):
        username = self.cleaned_data["username"]
        try:
            User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return username.lower()

        raise forms.ValidationError(_("A user with that username already exists."))

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_password(User.objects.make_random_password(length=8))

        try:
            user = User.objects.get(email=user.email)

            send_mail_to_user(self.request, user, 'registration_exist')

            return user
        except User.DoesNotExist:
            pass

        if commit:
            user.save()

            profile = user.profile
            profile.country  = self.cleaned_data['country']
            profile.city     = self.cleaned_data['city']
            profile.gender   = self.cleaned_data['gender']
            profile.birthday = self.cleaned_data['birthday']

            if not profile.country:
                geo = find_geo_by_ip(self.request.META['REMOTE_ADDR'])
                if geo is not None:
                    profile.country = geo.get('country_code', '')
                    if not profile.city:
                        profile.city = geo.get('city', '')

            profile.save()

            activation_url = settings.ACTIVATION_URL % (self.request.hostname, profile.activation_key)
            send_mail_to_user(self.request, user, 'activation_code', {'activation_url': activation_url})

        return user


class ProfileForm(forms.ModelForm):
    first_name = forms.CharField(label=_("First name"), max_length=50, required=False)
    last_name = forms.CharField(label=_("First name"), max_length=50, required=False)
    country    = forms.CharField(label=_("Country"), max_length=50, required=False)
    city       = forms.CharField(label=_("City"), max_length=50, required=False)
    address    = forms.CharField(label=_("Address"), max_length=1000, required=False)
    gender     = forms.ChoiceField(label=_("Gender"), choices=GENDERS, required=False)
    birthday   = forms.DateField(label=_("Birthday"), required=False, input_formats=['%d/%m/%Y'])
    about      = forms.CharField(label=_("About"), widget=forms.Textarea, required=False)
    latitude   = forms.FloatField(label=_("Latitude"), required=False)
    longitude  = forms.FloatField(label=_("Longitude"), required=False)

    class Meta:
        model = UserProfile
        fields = ("country", "city", "address", "gender", "birthday", "about")

    def save(self, commit=True):
        profile = super(ProfileForm, self).save(commit=False)

        if commit:
            if self.cleaned_data['country'] is not None:
                profile.country  = self.cleaned_data['country']
            if self.cleaned_data['city'] is not None:
                profile.city     = self.cleaned_data['city']
            if self.cleaned_data['address'] is not None:
                profile.address  = self.cleaned_data['address']
            if self.cleaned_data['gender'] is not None:
                profile.gender   = self.cleaned_data['gender']
            if self.cleaned_data['birthday'] is not None:
                profile.birthday = self.cleaned_data['birthday']
            if self.cleaned_data['about'] is not None:
                profile.about    = self.cleaned_data['about']
            if self.cleaned_data['latitude'] is not None and self.cleaned_data['longitude'] is not None:
                longitude = self.cleaned_data['longitude']
                latitude = self.cleaned_data['latitude']
                profile.location = geos.fromstr("POINT(%s %s)" % (longitude, latitude))
            profile.save()

            user_changed = False
            if self.cleaned_data['first_name'] is not None:
                profile.user.first_name = self.cleaned_data['first_name']
                user_changed = True
            if self.cleaned_data['last_name'] is not None:
                profile.user.last_name = self.cleaned_data['last_name']
                user_changed = True
            if user_changed:
                profile.user.save()

        return profile


class PetForm(forms.ModelForm):
    birthday = forms.DateField(label=_("Birthday"), required=False, input_formats=['%d/%m/%Y'])

    class Meta:
        model = Pet
        fields = ("name", "species", "breed_index", "breed", "color", "birthday", "gender", "about")


class AvatarForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ("avatar",)

    def save(self, commit=True):
        profile = super(AvatarForm, self).save(commit=False)

        if commit:
            profile.save()

            # change avatar size
            if profile.avatar:
                from media import resize_avatar
                resize_avatar(profile.avatar.file.name)

        return profile


class MediaForm(forms.ModelForm):
    tags = forms.CharField(label=_("Tags"), max_length=100, required=False)

    class Meta:
        model = MediaFile
        fields = ("pet", "file", "description", "species")

    def save(self, commit=True):
        media = super(MediaForm, self).save(commit=False)

        if not media.species and media.pet:
            media.species = media.pet.species

        if commit:
            media.save()

            tags = self.cleaned_data['tags']
            media.tag_with(tags.split(","))

        return media


class FilterSettingsForm(forms.Form):
    filter_mycountry = forms.BooleanField(required=False)

    def __init__(self, request):
        super(FilterSettingsForm, self).__init__(request.POST)
        self.user = request.user

    def save(self):
        filter_mycountry = self.cleaned_data['filter_mycountry']
        self.user.profile.filter_mycountry = filter_mycountry
        self.user.profile.save()
