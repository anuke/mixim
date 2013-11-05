def hostname(request):
    return { 'hostname': request.META['HTTP_HOST'] }
