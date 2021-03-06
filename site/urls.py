from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

handler404 = 'server.views.handle404'

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'idrop.views.home', name='home'),
    # url(r'^idrop/', include('idrop.foo.urls')),

    url(r'^$', 'server.views.show_static_page'),
    url(r'^activate/([A-Z0-9]+)/$', 'server.views.auth_activate'),
    url(r'^404/$', 'server.views.handle404'),
    url(r'(.*?).shtml$', 'server.views.show_static_page'),
    url(r'^@([^/]+)/$', 'server.views.show_user_page'),

    url(r'pic([0-9]+)$', 'server.views.show_share_page'),
    url(r'pet([0-9]+)$', 'server.views.show_pet_page'),

    url(r'^([^/]+)/auth/register/', 'server.views.auth_register'),
    url(r'^([^/]+)/auth/login/', 'server.views.auth_login'),
    url(r'^([^/]+)/auth/logout/', 'server.views.auth_logout'),
    url(r'^([^/]+)/auth/logged/', 'server.views.auth_logged'),
    url(r'^([^/]+)/auth/resetpassword/', 'server.views.auth_reset_password'),
    url(r'^([^/]+)/auth/changepassword/', 'server.views.auth_change_password'),
    url(r'auth/autocreatepassword/', 'server.views.auth_autocreate_password'),

    url(r'^([^/]+)/user/stat/', 'server.views.user_stat'),
    url(r'^([^/]+)/user/check/([\w.-]+)$', 'server.views.user_check'),
    url(r'^([^/]+)/user/species/(?:([^/]+)/)?$', 'server.views.user_species'),
    url(r'^([^/]+)/user/likes/$', 'server.views.user_likes'),
    url(r'^([^/]+)/user/comments/(\w+)/$', 'server.views.user_comments'),
    url(r'^([^/]+)/user/specialities/$', 'server.views.user_specialities'),

    url(r'^([^/]+)/profile/get/(\d+)', 'server.views.profile_get'),
    url(r'^([^/]+)/profile/get/my', 'server.views.profile_my'),
    url(r'^([^/]+)/profile/save/', 'server.views.profile_save'),

    url(r'^([^/]+)/myfilter/save/', 'server.views.myfilter_save'),

    url(r'^([^/]+)/pet/add/', 'server.views.pet_add'),
    url(r'^([^/]+)/pet/get/(\d+)/', 'server.views.pet_get'),
    url(r'^([^/]+)/pet/save/(\d+)/', 'server.views.pet_save'),
    url(r'^([^/]+)/pet/enable/(\d+)/', 'server.views.pet_enable'),
    url(r'^([^/]+)/pet/disable/(\d+)/', 'server.views.pet_disable'),

    url(r'^([^/]+)/media/list/(\d+)/(\d+)/', 'server.views.media_list'),
    url(r'^([^/]+)/media/get/(\d+)/', 'server.views.media_get'),
    url(r'^([^/]+)/media/like/(\d+)/', 'server.views.media_like'),
    url(r'^([^/]+)/media/unlike/(\d+)/', 'server.views.media_unlike'),
    url(r'^([^/]+)/media/upload/', 'server.views.media_upload'),
    url(r'^([^/]+)/media/avatarupload/', 'server.views.avatar_upload'),
    url(r'^([^/]+)/media/save/(\d+)/', 'server.views.media_save'),
    url(r'^([^/]+)/media/enable/(\d+)/', 'server.views.media_enable'),
    url(r'^([^/]+)/media/disable/(\d+)/', 'server.views.media_disable'),

    url(r'^([^/]+)/friend/add/([^/]+)/', 'server.views.friend_add'),
    url(r'^([^/]+)/friend/remove/([^/]+)/', 'server.views.friend_remove'),
    url(r'^([^/]+)/friend/list/', 'server.views.friend_list'),
    url(r'^([^/]+)/friend/media/', 'server.views.friend_media'),

    url(r'^([^/]+)/discussion/list/', 'server.views.discussions'),

    url(r'^([^/]+)/comment/list/(\d+)/', 'server.views.comment_list'),
    url(r'^([^/]+)/comment/last/all/$', 'server.views.comment_all_last'),
    url(r'^([^/]+)/comment/last/(\w+)/$', 'server.views.comment_last'),
    url(r'^([^/]+)/comment/add/(\d+)/', 'server.views.comment_add'),
    url(r'^([^/]+)/comment/delete/', 'server.views.comment_delete'),

    url(r'^([^/]+)/dict/breed/', 'server.views.breed_dict'),
    url(r'^([^/]+)/available/breed/', 'server.views.breed_available'),
    url(r'^([^/]+)/available/tag/', 'server.views.tag_available'),
    url(r'^([^/]+)/feedback/', 'server.views.feedback'),

    url(r'^([^/]+)/bo/media/delete/(\d+)/', 'server.views.bo_media_delete'),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
