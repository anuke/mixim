from django import template

register = template.Library()

@register.filter
def resized(media, size):
    return media.original.replace('/original/', '/resized/%s/' % size)
