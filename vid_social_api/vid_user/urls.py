from django.urls import path
from vid_user.views import UpdateMailVerificationAPIView
from . import views
from django.urls import path
from .views import *

urlpatterns = [
    path('register', RegisterUserAPIView.as_view(), name='register'),
    path('register/<int:id>', RegisterUserAPIView.as_view(), name='register'),
    path('login', UserLoginView.as_view(), name='login'),
    path('update_mail_verification/<str:verification_token>', UpdateMailVerificationAPIView.as_view(), name='update-mail-verification'),
    path('forget_password', ForgotPasswordAPIView.as_view(), name='forget_password'),
    #########
    path('ExistData/', ExistData.as_view(), name='Exist data'),
    path('StatusUpdate/', StatusUpdate.as_view(), name='Exist data'),
    #########
    path('update_password/<str:reset_token>', UpdatePasswordAPIView.as_view(), name='update_password'),
    path('password_reset/<str:reset_token>', ResetPasswordAPIView.as_view(), name='password_reset'),
    path('update_sponser_detail', UpdateSponserDetail.as_view(), name='update sponser detail'),
    path('delete_sponser/<int:id>', UpdateSponserDetail.as_view(), name='delete sponser '),
    path('approve_review', ApproveReview.as_view(), name='approve review'),
    path('approve_identity', ApproveIdVideo.as_view(), name='approve id image and video'),
    path('get_user_detail/<int:id>', ViewUserDetail.as_view(), name='can view worker-sponsor-customer data'),
    path('alloted_coin', CoinAlloted.as_view(), name='admin can allot coin'),
    path('deduct_coin', CoinDeduction.as_view(), name='admin can deduct coin'),
    path('refresh_token', RefreshToken.as_view(), name='when token is expired'),
    path('login_permission', LoginPermission.as_view(), name='admin activate deactive login permission'),
    path('sponser_payment_request_list/', SponserPaymentRequestListAPIView.as_view(), name='sperticular sponser payment-request-list'),
    path('sponser_payment_history_list/', SponserPaymentHistoryListAPIView.as_view(), name='sperticular sponser payment-history-list'),

    path('sponser_list/', SponserListAPIView.as_view(), name='sponser-list'),
    path('report_list_of_sponsor/', ReportListOfSponsorAPIView.as_view(), name='report-list-of-sponsor'),
    path('worker_list/', WorkerListAPIView.as_view(), name='worker-list'),
    path('payment_request_list/', PaymentRequestListAPIView.as_view(), name='payment-request-list'),
    path('payment_received_list/', PaymentReceivedListAPIView.as_view(), name='payment-received-list'),
    path('payment_history_list/', PaymentHistoryListAPIView.as_view(), name='payment-history-list'),
    path('user_warning_list/', UserWarningListAPIView.as_view(), name='user-warning-list'),
    path('user_message_list/', UserMessageListAPIView.as_view(), name='user-message-list'),
    path('gift_list/', GiftListAPIView.as_view(), name='gift-list'),
    path('top_worker_list/', TopWorkerListAPIView.as_view(), name='top-worker-list'),
    path('country_list/', CountryListAPIView.as_view(), name='country-list'),
    path('create_credit_coin/', CreditCoinAPIView.as_view(), name='create-credit-coin'),
    path('update_credit_coin/<int:coin_id>', UpdateCoinAPIView.as_view(), name='update-credit-coin'),
    path('delete_credit_coin/<int:coin_id>', DeleteCoinAPIView.as_view(), name='delete-credit-coin'),
    path('create_countries/', CountryCreateAPIView.as_view(), name='country-create'),
    path('create_frequent_question_answer/', CreatefrequentquestionanswerAPIView.as_view(), name='create-frequent-question-answer'),
    path('update_frequent_QA_sequence/<int:fqa_id>', UpdatefrequentquestionanswerAPIView.as_view(), name='update-frequent-qa-sequence'),
    path('update_frequent_QA/<int:fqa_id>', UpdateFrequentQAAPIView.as_view(), name='update-frequent-question-answer'),
    path('delete_frequent_question_answer/<int:fqa_id>', DeletefrequentquestionanswerAPIView.as_view(), name='delete-frequent-question-answer'),
    path('frequent_question_answer_list/', frequentquestionanswerlistAPIView.as_view(), name='frequent-question-answer-list'),
    path('detail_frequent_question_answer/', DetailfrequentquestionanswerAPIView.as_view(), name='detail-frequent-question-answer'),
    path('binance/webhook-url/', BinanceWebhook.as_view(), name='binance-webhook-url'),
    
    path('binance/payment_cancel_url/', BinancePaymentCancelUrl.as_view(), name='binance-cancel-url'),
    
    path('binance/payment_success_url/', BinancePaymentSuccessUrl.as_view(), name='binance-success-url'),
    path('add_warning_for_user/', AddWarningForUser.as_view(), name='add-warning-for-user'),
    path('reply_help_and_support/', ReplyHelpAndSupportAPIView.as_view(), name='reply-help-and-support'),
    path('get_help_and_support/', GetHelpAndSupportListAPIView.as_view(), name='get-help-and-support'),
    path('get_report_list_of_user/', ReportListOfUserAPIView.as_view(), name='get-report-list-of-user'),
    path('get_count_of_report_and_payment_request/', GetCountofReportAndPaymentRequestAPIView.as_view(), name='get-count-of-report-and-payment-request'),
    path('users_list/', UsersListAPIView.as_view(), name='users-list'),
    path('view_receipt/<int:id>', ViewReceiptAPIView.as_view(), name='view-receipt'),
    path('list_of_workers_accepted_by_admin/', WorkerListAcceptedByAdminAPIView.as_view(), name='list_of_workers_accepted_by_admin'),
    path('users_amount_deduction_history/', UsersAmountDeductionHistoryAPIView.as_view(), name='users-amount-deduction-history'),
    path('reports_for_admin/', ReportForAdminAPIView.as_view(), name='report-for-admin'),
    path('excel_download/', ExcelDownloadAPIView.as_view(), name='excel-download'),
    path('add_amount/', AddAmountAPIView.as_view(), name='add-amount'),
    path('update_amount/<int:id>', UpdateAmountAPIView.as_view(), name='update-amount'),
    path('delete_amount/<int:id>', DeleteAmountAPIView.as_view(), name='delete-amount'),
    path('amount_list/', AmountListAPIView.as_view(), name='amount-list'),
    
    path('view_report/', ViewReportAPIView.as_view(), name='view-report'),
    
    path('user_warning_history_list/', UserWarningHistoryListAPIView.as_view(), name='user-warning-history-list'),
    path('user_call_history_list/', UserCallHistoryListAPIView.as_view(), name='user-call-history-list'),
    path('user_credit_history_list/', UserCreditHistoryListAPIView.as_view(), name='user-credit-history-list'),
    
    path('worker_call_history_list/', WorkerCallHistoryListAPIView.as_view(), name='worker-call-history-list'),
    path('worker_payment_history_list/', WorkerPaymentHistoryListAPIView.as_view(), name='worker-payment-history-list'),
    path('worker_payment_request_history_list/', WorkerPaymentRequestListAPIView.as_view(), name='worker-request-history-list'),
    
    path('users_and_workers_monthly_count/', UsersAndWorkersMonthlyCountAPIView.as_view(), name='users-and-workers-monthly-count'),
    path('monthly_revenue_count/', MonthlyRevenueCountAPIView.as_view(), name='monthly-revenue-count'),

    path('image-view/<int:id>', ImageViewAPIView.as_view(), name='Api to view image of worker'),
    path('video-view/<int:id>', VideoViewAPIView.as_view(), name='Api to view image of worker'),
    
    
    path('create-gift/', CreateGiftAPIView.as_view(), name='Api to gift'),
    path('admin-payment-request/', AdminPaymentRequestAPIView.as_view(), name='Api to add,update or list bank detail'),
    path('Upload_receipt/', UploadReceiptAPIView.as_view(), name='admin payment request status and upload receipt'),
    path('SponserPaymentNotification/<int:id>', SponserPaymentNotificationAPIView.as_view(), name='Api to notify payment of sponser'),
    
    path('pushnotify/video-calling/', PushNotifyVideoCallingAPIView.as_view(), name='pushnotify video calling'),

    path('prohibitedbank/create/', ProhibitedBankCreateAPIView.as_view(), name='pushnotify video calling'),
    
    path('prohibitedbank/update/', ProhibitedBankUpdateAPIView.as_view(), name='pushnotify video calling'),
    
    path('prohibitedbank/list/', ProhibitedBanklistAPIView.as_view(), name='sponser-list'),
    
    path('Warninglist/', WarningListAPIView.as_view(), name='Warning-list'),
    
    path('CheckWarning/', CheckWarningAPIView.as_view(), name='Warning-list'),
    
    path('WorkerPaymentHistory/<int:payment_id>', WorkerPaymentHistoryAPIView.as_view(), name='Warning-list'),
    
    path('CallDetailInitiate/',CallDetailInitiateAPIView.as_view(), name='CallDetailInitiate'),
    
    path('CallEnd/',CallEndAPIView.as_view(), name='CallDetailInitiate'),
    
    path('listing/', GiftManagementViewSet.as_view({'get': 'list'}), name='CallDetailInitiate'),
    
    path('ChangeLanguage/',ChangeLanguageAPIView.as_view(), name='ChangeLanguage'),
    
    path('CheckStatus/',CheckStatusAPIView.as_view(), name='CheckStatus'),
    
    path('DeleteMedia/',DeleteMediaAPIView.as_view(), name='DeleteMedia'),
    
    path('TopWorker/',TopWorkerListUpdateAPIView.as_view(), name='Worker show and hide api'),
    
    path('DeleteGift/',DeleteGiftAPIView.as_view(), name='Worker show and hide api'),
    
    path('DeleteWarning/',DeleteWarningAPIView.as_view(), name='Worker show and hide api'),
    
    path('AddUserCoin/',AddUserCoin.as_view(), name='add user coin'),
    
]
