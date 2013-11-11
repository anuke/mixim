import json
import urllib2

from django.core.mail import send_mail
from django.template import RequestContext
from django.template.loader import render_to_string


def send_mail_to_user(request, user, template, context = None):
    if not context:
        context = {}

    context['user'] = user

    request_context = RequestContext(request)
    send_mail(
        render_to_string('mail/%s.subject' % template, context, request_context).strip(),
        render_to_string('mail/%s.body' % template, context, request_context),
        None, [user.email])


def find_geo_by_ip(ip):
    try:
        geo_json = urllib2.urlopen("http://api.hostip.info/get_json.php?ip=" + ip).read()
        return json.loads(geo_json)
    except:
        pass
