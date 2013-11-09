class HostnameMiddleware:
    def process_request(self, request):
            hostname = request.META['HTTP_HOST']
            request.hostname = hostname

            if hostname.endswith(".us"):
                request.session['django_language'] = 'en'
                request.domain_country = 'US'
            elif hostname.endswith(".ru"):
                request.session['django_language'] = 'ru'
                request.domain_country = 'RU'

