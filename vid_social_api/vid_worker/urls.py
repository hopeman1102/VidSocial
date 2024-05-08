from django.urls import path
from . import views


from django.urls import path
from .views import *



urlpatterns = [
    # rv -----------
    path('worker_id_image/', UserProfileImageView.as_view(), name='upload identity image'),
    path('worker_video_url',  VideoAPIView.as_view(), name='upload video url'),
    path('worker_profile_image/', UserProfileProfileView.as_view(), name='upload profile image'),
    path('worker_gallery_image/', UserGalleryImageUpload.as_view(), name='upload gallery image'),
    path('worker_delete_image', UserGalleryImageUpload.as_view(), name='delete image'),
    path('sponser_request', CreateSponserRequest.as_view(), name='create sponser request'),
    path('cancel_sponser_request', CancelSponserRequest.as_view(), name='cancel sponser request'),
    path('leave_sponser', LeaveSponser.as_view(), name='leave sponser'),
    path('create_sponser_report/', CreateReport.as_view(), name='create sponser report'),
    path('get_report/<int:id>', CreateReport.as_view(), name='get perticular report'),
    path('create_worker_payment_request', CreateCoinClaimRequest.as_view(), name='create worker payment request'),
     #--------------------------rv 

     #-----neha ------------------------
    path('user_online_list/', UserOnlineListAPIView.as_view(), name='user-online-list'),
    path('sponser_list/', SponserListAPIView.as_view(), name='sponser-list'),
    path('worker_payment_history_list/', WorkerPaymentHistoryListAPIView.as_view(), name='worker-payment-history-list'),
    path('worker_report_list/', WorkerReportListAPIView.as_view(), name='worker-report-list'),
    path('worker_detail/<int:worker_id>', WorkerDetailAPIView.as_view(), name='worker-detail-list'),
    path('create_user_report/', CreateUserReport.as_view(), name='create-user-report'),
    path('Sponsor_associated_worker_details/', SponsorAssociatedWorkerDetailsAPIView.as_view(), name='Sponsor-associated-worker-details'),
    path('check_login_permission/', CheckLoginPermissionAPIView.as_view(), name='check-login-permission'),
    path('update_online_and_offline_status/', UpdateOnlineAndOfflineStatusAPIView.as_view(), name='update-online-and-offline-status'),
    path('total_coin_of_worker/', TotalCoinOfWorkerAPIView.as_view(), name='total-coin-of-worker'),
    path('get_sponsor_detail_of_worker/', GetSponsorDetailOfWorkerAPIView.as_view(), name='get-sponsor-detail-of-worker'),
    path('coin_list_for_worker/', CoinListForWorkerAPIView.as_view(), name='coin-list-for-worker'),
    path('gift_list_for_worker/', GiftListForWorkerAPIView.as_view(), name='gift-list-for-worker'),
    # ----------------------
    
    path('WorkerCoinClaimData/', WorkerCoinClaimSelectedlistAPIView.as_view(), name='worker coin claim data'),
    
    ]
