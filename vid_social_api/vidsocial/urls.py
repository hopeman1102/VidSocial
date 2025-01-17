"""vidsocial URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from vid_user.views import yaml_to_html

urlpatterns = [
    path("vid_sponser/", include("vid_sponser.urls")),
    path("vid_user/", include("vid_user.urls")),
    path("vid_worker/", include("vid_worker.urls")),
    path('admin/', admin.site.urls),
    path("vid_customer/", include("vid_customer.urls")),
    path('api-doc/', yaml_to_html, name="api-doc"),
]

from django.conf.urls.static import static
from django.conf import settings

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


