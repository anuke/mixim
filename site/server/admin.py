from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from server.models import *


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


class UserAdmin(UserAdmin):
    inlines = (UserProfileInline, )
    ordering = ('-id',)
    list_display = ('id', 'username', 'first_name', 'last_name', 'email')

class PetAdmin(admin.ModelAdmin):
    model = Pet
    class Meta:
        verbose_name = ''

admin.site.register(Pet)
admin.site.register(Breed)
admin.site.register(MediaFile)
admin.site.register(Comment)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

