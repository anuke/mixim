from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as OldUserAdmin

from server.models import *


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


class UserAdmin(OldUserAdmin):
    inlines = (UserProfileInline, )
    ordering = ('-id',)
    list_display = ('id', 'username', 'first_name', 'last_name', 'email')


class PetAdmin(admin.ModelAdmin):
    model = Pet

    class Meta:
        verbose_name = _('Pet')


admin.site.register(Pet)
admin.site.register(Breed)
admin.site.register(MediaFile)
admin.site.register(Comment)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
