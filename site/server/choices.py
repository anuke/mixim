from django.utils.translation import ugettext_lazy as _


GENDERS = (
    ('M', _('Male')),
    ('F', _('Female')),
)


STATUSES = (
    ('unverified', _('Unverified')),
    ('verified',   _('Verified')),
    ('blocked',    _('Blocked')),
    ('deleted',    _('Deleted')),
)
