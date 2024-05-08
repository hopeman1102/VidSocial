//--------------------------- Config Provider Start -----------------------
class baseURLProvider {
     // ------------- Local URL -------------
    // baseURL = 'http://103.117.65.42:8000/';
    // imageUrl = 'http://103.117.65.42:8000/';
    // SocketUrl = 'ws://http://103.117.65.42:8000/ws/status_update/';

    // -------------New Client Server URL -------------
    baseURL = 'https://vid-social.net:8000/';
    imageUrl = 'https://vid-social.net:8000';
    SocketUrl = 'wss://vid-social.net:8001/ws/status_update/';

    // ------------- Server URL -------------
    // baseURL = 'http://51.222.12.104:8000/';
    // imageUrl = 'http://51.222.12.104:8000';
    // SocketUrl = 'ws://51.222.12.104:8001/ws/status_update/';

    SocketbaseURL = 'ws://192.168.1.94:8001/ws/status_update/'
    SignUpUrl = this.baseURL + 'vid_user/register';
    SignUpFirstUrl = this.baseURL + 'vid_user/ExistData/';
    CountryList = this.baseURL + 'vid_user/country_list';
    LoginUrl = this.baseURL + 'vid_user/login';
    ForgetPassword = this.baseURL + 'vid_user/forget_password';
    HomeData = this.baseURL + 'vid_customer/worker_online_list/';
    HomeDataCustomer = this.baseURL + 'vid_worker/user_online_list/';
    TopWorkerList = this.baseURL + 'vid_user/top_worker_list/';
    AllFavWorker = this.baseURL + 'vid_customer/worker_favourite_list/';
    GetUserDetails = this.baseURL + 'vid_customer/profile-detail/?user_id=';
    GetPaymentHistory = this.baseURL + 'vid_worker/worker_payment_history_list/';
    GetSponserList = this.baseURL + 'vid_worker/sponser_list/';
    RequestSponse = this.baseURL + 'vid_worker/sponser_request';
    WorkerIdImage = this.baseURL + 'vid_worker/worker_id_image/';
    WorkerVideo = this.baseURL + 'vid_worker/worker_video_url';
    CustomerDetails = this.baseURL + 'vid_customer/get_user_info/';
    GetCoustomorCoins = this.baseURL + 'vid_customer/coin_list/';
    coin_list_for_worker = this.baseURL + 'vid_worker/coin_list_for_worker/';
    MarkUnmarkFav = this.baseURL + 'vid_customer/assign-fav-worker/';
    WorkerReport = this.baseURL + 'vid_worker/create_user_report/';
    ReportByWorker = this.baseURL + 'vid_worker/create_user_report/';
    HelpSupport = this.baseURL + 'vid_customer/create_help_and_support/';
    UpdateProfile = this.baseURL + 'vid_customer/update_profile_detail/';
    CreateReview = this.baseURL + 'vid_customer/create-review/';
    workerPymentRequest = this.baseURL + 'vid_worker/create_worker_payment_request';
    CustomerBinance = this.baseURL + 'vid_customer/binance_and_bank_list/';
    WorkerDetails = this.baseURL + 'vid_customer/get_worker_info';
    getPurchaseCoins = this.baseURL + 'vid_customer/buy_credit/';
    AddBinanceAccount = this.baseURL + 'vid_sponser/binance-accounts/';
    AddBankAccount = this.baseURL + 'vid_sponser/BankDetail/';
    RefreshToken = this.baseURL + 'vid_user/refresh_token';
    FrequentQuestions = this.baseURL + 'vid_user/frequent_question_answer_list';
    WorkerPaymentRequest = this.baseURL + 'vid_worker/create_worker_payment_request';
    SponsorAssociateDetails = this.baseURL + 'vid_worker/Sponsor_associated_worker_details/?sponser_id=';
    LoginPermission = this.baseURL + 'vid_worker/check_login_permission/?user_id=';
    LeaveSponser = this.baseURL + 'vid_worker/leave_sponser';
    TotalCoinOfWorker = this.baseURL + 'vid_worker/total_coin_of_worker/';
    ToGetSponsorId = this.baseURL + 'vid_worker/get_sponsor_detail_of_worker/';
    SendVideoCallingRequest = this.baseURL + 'vid_user/pushnotify/video-calling/';
    UserOnlineStatus = this.baseURL + 'vid_worker/update_online_and_offline_status/';
    StatusUpdateLogout = this.baseURL + 'vid_user/StatusUpdate/';
    GiftList = this.baseURL + 'vid_user/gift_list/';
    SendGiftToWorker = this.baseURL + 'vid_customer/send-gift/';
    CustomerVideoCallStart = this.baseURL + 'vid_customer/customer_videocall_start/';
    CoinDeduction = this.baseURL + 'vid_customer/amount_deduction_on_call/';
    GetWorkerGift = this.baseURL + 'vid_worker/gift_list_for_worker/?call_id=';
    WorkerWarning = this.baseURL + 'vid_user/CheckWarning/';
    CallInitiate = this.baseURL + 'vid_user/CallDetailInitiate/';
    EndCalling = this.baseURL + 'vid_user/CallEnd/';
    UpdateLanguage = this.baseURL + 'vid_user/ChangeLanguage/';
    CheckUserStatus = this.baseURL + 'vid_user/CheckStatus/';
    GetAllWarnings = this.baseURL + 'vid_user/Warninglist/?PersonId=';
    PrivacyPolicy = 'https://vidsocial.net/privacy-policy/';
    TermsCondition = 'https://vidsocial.net/terms-of-service/';

};

export const appBaseUrl = new baseURLProvider();




