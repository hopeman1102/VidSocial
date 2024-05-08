from django.urls import path
from .views import *

urlpatterns = [
    path('WorkerRequestStatus/', WorkerRequestStatusAPIView.as_view(), name='Api to accept/decline worker request'),
    path('WorkerPaymentRequestStatus/', WorkerPaymentRequestStatusAPIView.as_view(), name='Api to accept/decline worker payment request'),
    path('WorkerPaymentNotification/<int:id>', WorkerPaymentNotificationAPIView.as_view(), name='Api to notify payment of worker'),
    path('BankDetail/', BankDetailCreateAPIView.as_view(), name='Api to add,update or list bank detail'),
    path('binance-accounts/', BinanceAccountAPIView.as_view(), name='binance-account-list-create-update'),

    #------------neha code here-----------------------
    path('sponsorship_list/', SponsorshipListAPIView.as_view(), name='sponsorship-list'),
    path('worker_payment_request_list/', WorkerPaymentRequestListAPIView.as_view(), name='worker-payment-request-list'),
   
    path('sponsor_payment_in_process_list/', SponsorPaymentInProcessListAPIView.as_view(), name='sponsor-payment-in-process-list'),
    path('sponsor_payment_history_list/', SponsorPaymentHistoryListAPIView.as_view(), name='sponsor-payment-history-list'),
    path('sponsor_payment_history_with_worker_list/', SponsorPaymentHistoryWithWorkerListAPIView.as_view(), name='sponsor-payment-history-with-worker-list'),
    
    path('client_list/', ClientListAPIView.as_view(), name='client-list'),
    path('worker_payment_request_accepted_by_admin_list/', WorkerPaymentRequesAcceptedByAdminListAPIView.as_view(), name='worker-payment-request-accepted-by-admin-list'),
    path('worker_payment_request_in_process_list/', WorkerPaymentRequestInProcessListAPIView.as_view(), name='worker-payment-request-in-process-list'),
    path('worker_payment_history_list/', WorkerPaymentHistoryListAPIView.as_view(), name='worker-payment-history-list'),
    path('upload_receipt_of_worker/', UploadReciptOfWorkerAPIView.as_view(), name='upload-receipt-of-worker'),
    
    path('sponsor_dashboard_count/', SponsorDashboradCountAPIView.as_view(), name='sponsor-dashboard-count'),
    path('admin_to_sponsor_payment_history/', AdminToSponsorPaymentHistoryAPIView.as_view(), name='admin-to-sponsor-payment-history'),
    path('worker_count_for_graph/', WorkerCountForGraphAPIView.as_view(), name='worker-count-for-graph'),
    path('revenue_count_for_graph/', RevenueCountForGraphAPIView.as_view(), name='revenue-count-for-graph'),
    
    path('workers_based_on_payment_request/', WorkersBasedOnPaymentRequestAPIView.as_view(), name='workers-based-on-payment-request'),
    path('excel_download_of_sponsor_report/', ExcelDownloadOfSponsorReportAPIView.as_view(), name='excel-download-of-sponsor-report'),
    path('reports_for_sponsor/', ReportForSponsorAPIView.as_view(), name='report-for-sponsor'),
    
    path('AddSponserBinanceAcc/', AddSponserBinanceAccount.as_view(), name='Add Sponser Binance Account'),
    path('CallDeductionCoin/', CallDeductionCoinapi.as_view(), name='Call Deduction Coin'),
]
