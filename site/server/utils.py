from django.core.mail import send_mail
from django.template.loader import render_to_string

def send_mail_to_user(user, template, context = None):
    if not context:
        context = {}

    context['user'] = user

    send_mail(render_to_string('mail/%s.subject' % template, context).strip(),
        render_to_string('mail/%s.body' % template, context),
        None, [user.email])
