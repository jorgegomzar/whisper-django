from django.urls import path
from . import views


app_name = 'transcriber'

urlpatterns = [
    path('', views.index, name='index'),
    path('list_uploaded', views.list_uploaded, name='list_uploaded'),
    path('<int:pk>/', views.detail, name='detail'),
]
