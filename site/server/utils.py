from django.core.mail import send_mail
from django.template import RequestContext
from django.template.loader import render_to_string

def send_mail_to_user(request, user, template, context = None):
    if not context:
        context = {}

    context['user'] = user

    request_context = RequestContext(request, context)
    send_mail(render_to_string('mail/%s.subject' % template, request_context).strip(),
        render_to_string('mail/%s.body' % template, request_context),
        None, [user.email])
