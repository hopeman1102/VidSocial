
from django.urls import path
from .views import *


urlpatterns = [
    #-----------kunal code-----------
    path('assign-fav-worker/', AssignFavWorkerAPIView.as_view(), name='binance-account-list-create-update'),
    path('create-review/', CreateReviewAPIView.as_view(), name='create review api'),
    
    path('customer_videocall_start/', VideoCallStartAPIView.as_view(), name='start-video-call'),
    path('customer-videocall-end/', VideoCallEndAPIView.as_view(), name='end video call'),
    path('check-coin/', CheckCoinAPIView.as_view(), name='Api to check coin'),
    
    path('profile-detail/', ProfileAPIView.as_view(), name='Api to check own profile detail'),
    path('send-gift/', SendGiftAPIView.as_view(), name='send-gift'),
    #---------------------------------
    #-----------------neha code----------------------
    path('worker_online_list/', WorkerOnlineListAPIView.as_view(), name='worker-online-list'),
    path('worker_favourite_list/', WorkerFavouriteListAPIView.as_view(), name='worker-favourite-list'),
    path('coin_list/', CoinListAPIView.as_view(), name='coin-list'),
    path('get_user_info/', ViewUserInfo.as_view(), name='api to show user info like average time per calls,credits,number of call/month '),
    path('create_help_and_support/', HelpAndSupportAPIView.as_view(), name='create-help-and-support'),
    path('update_profile_detail/', UpdateProfileAPIView.as_view(), name='update-profile-detail'),
    path('buy_credit/', BuyCreditAPIView.as_view(), name='buy-credit'),
    path('binance_and_bank_list/', BinanceAndBankListAPIView.as_view(), name='binance-and-bank-list'),
    # path('amount_deduction_on_call/', AmountDeductionOnCallAPIViewnew.as_view(), name='amount-deduction-on-call'),
    path('add_coin_in_user_account/', AddCoinInUserAccountAPIViewnew.as_view(), name='amount-deduction-on-call'),
    #---------------------------------
    #-----------------ravi
    path('get_worker_info', ViewWorkerInfo.as_view(), name='api to show worker info like comment, rating, number of call/month '),
    
     
]
