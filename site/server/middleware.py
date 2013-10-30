class LanguageMiddleware:
    def process_request(self, request):
            hostname = request.META['HTTP_HOST']
            if hostname.endswith(".us"):
                request.session['django_language'] = 'en'
            elif hostname.endswith(".ru"):
                request.session['django_language'] = 'ru'

