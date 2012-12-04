from django import forms
from django.core.mail import send_mail
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User

from models import Pet, MediaFile, MediaTag
from choices import GENDERS

import settings


class RegistrationForm(forms.ModelForm):
    username = forms.RegexField(label=_("Username"), max_length=30, regex=r'^[\w.@+-]+$',
        help_text=_("Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only."),
        error_messages={'invalid': _("This value may contain only letters, numbers and @/./+/-/_ characters.")})
    email = forms.EmailField(label=_("E-mail"), max_length=75)
    password1 = forms.CharField(label=_("Password"), widget=forms.PasswordInput)
    password2 = forms.CharField(label=_("Password confirmation"), widget=forms.PasswordInput,
        help_text=("Enter the same password as above, for verification."))

    country  = forms.CharField(label=_("Country"), max_length=50, required=False)
    city     = forms.CharField(label=_("City"), max_length=50, required=False)
    gender   = forms.ChoiceField(label=_("Gender"), choices=GENDERS, required=False)
    birthday = forms.DateField(label=_("Birthday"), required=False)

    class Meta:
        model = User
        fields = ("username","email",)

    def clean_username(self):
        username = self.cleaned_data["username"]
        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username

        raise forms.ValidationError(_("A user with that username already exists."))

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1", "")
        password2 = self.cleaned_data["password2"]

        if password1 != password2:
            raise forms.ValidationError(_("The two password fields didn't match."))

        return password2

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if not user.email:
            user.email = user.username

        if commit:
            user.save()

            profile = user.profile
            profile.country  = self.cleaned_data['country']
            profile.city     = self.cleaned_data['city']
            profile.gender   = self.cleaned_data['gender']
            profile.birthday = self.cleaned_data['birthday']
            profile.save()

            send_mail('Mixim Activation Code',
                'Please visit %s%s to activate your profile.' % (settings.ACTIVATION_URL, profile.activation_code),
                None, [user.email])

        return user


class ProfileForm(forms.ModelForm):
    username = forms.RegexField(label=_("Username"), max_length=30, regex=r'^[\w.@+-]+$',
        help_text=_("Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only."),
        error_messages={'invalid': _("This value may contain only letters, numbers and @/./+/-/_ characters.")})
    email = forms.EmailField(label=_("E-mail"), max_length=75)

    country  = forms.CharField(label=_("Country"), max_length=50, required=False)
    city     = forms.CharField(label=_("City"), max_length=50, required=False)
    gender   = forms.ChoiceField(label=_("Gender"), choices=GENDERS, required=False)
    birthday = forms.DateField(label=_("Birthday"), required=False)

    class Meta:
        model = User
        fields = ("username",)

    def save(self, commit=True):
        user = super(ProfileForm, self).save(commit=False)

        if commit:
            user.save()
            user.profile.country  = self.cleaned_data['country']
            user.profile.city     = self.cleaned_data['city']
            user.profile.gender   = self.cleaned_data['gender']
            user.profile.birthday = self.cleaned_data['birthday']
            user.profile.save()

        return user


class PetForm(forms.ModelForm):

    class Meta:
        model = Pet
        fields = ("name", "species", "breed", "color", "birthday", "gender", "about" )


class MediaForm(forms.ModelForm):
    tags  = forms.CharField(label=_("Tags"), max_length=100, required=False)

    class Meta:
        model = MediaFile
        fields = ("pet", "file", "description")

    def save(self, commit=True):
        media = super(MediaForm, self).save(commit=False)

        if commit:
            media.save()

            tags = self.cleaned_data['tags']
            if tags:
                for name in tags.split(","):
                    tag, _ = MediaTag.objects.save(name.strip())
                    media.tags.add(tag)

        return media
