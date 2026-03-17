class MediaCacheMiddleware:
    """Add Cache-Control headers to media file responses so browsers don't re-fetch on every page load."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith('/media/'):
            response['Cache-Control'] = 'public, max-age=86400'  # 24 hours
        return response
