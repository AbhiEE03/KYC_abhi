from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as auth_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/token/', auth_views.obtain_auth_token, name='api_token_auth'),
    path('api/v1/kyc/', include('kyc.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
