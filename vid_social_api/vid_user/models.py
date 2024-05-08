from django.db import models
from django.contrib.auth.models import AbstractBaseUser,AbstractUser
import pytz
from django.utils import timezone


class Country(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50)
    currency = models.CharField(max_length=50)
    flag_url = models.CharField(max_length=50,null=True)
    dial_code = models.CharField(max_length=50,null=True)
    prohibited_bank_exist= models.BooleanField(default=False)



class UserProfile(AbstractUser):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('sponser', 'Sponser'),
        ('worker', 'Worker'),
        ('user', 'User'),
    ]

    STATUS_CHOICES = [
        ('offline', 'Offline'),
        ('online', 'Online'),
        ('busy', 'Busy'),
    ]

    ACCOUNT_APPROVAL_CHOICES = [
        ('none', 'None'),
        ('decline', 'Decline'),
        ('approve', 'Approve'),
    ]
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=150,null=True,blank=True)
    last_name = models.CharField(max_length=150,null=True,blank=True)
    display_name = models.CharField(max_length=150)
    date_of_birth = models.DateField(null=True,blank=True)
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES,default='male')
    email = models.CharField(max_length=150)
    phone = models.CharField(max_length=50, blank=True, null=True)
    role_id = models.CharField(max_length=7, choices=ROLE_CHOICES)
    status = models.CharField(max_length=7, choices=STATUS_CHOICES, default='offline')
    password = models.TextField()
    registered_date = models.DateField(null=True, blank=True)
    first_call_date = models.DateField(null=True, blank=True)
    total_warning = models.IntegerField(default=0)
    country_id = models.ForeignKey(Country, on_delete=models.CASCADE,null=True, blank=True)
    total_earn_coin = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sponser_id = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='worker_sponsors')
    profile_image = models.TextField(null=True, blank=True)  # Storing the image URL here
    id_image = models.TextField(null=True, blank=True)  # Storing the image URL here
    video_link = models.TextField(null=True, blank=True)
    account_approval_state = models.CharField(max_length=10, choices=ACCOUNT_APPROVAL_CHOICES, default='none')
    identity_no = models.CharField(max_length=150,null=True, blank=True)
    is_mail_verified = models.BooleanField(default=False)
    last_warning_datetime = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    username = models.CharField(max_length=150,null=True,unique=True)
    login_permission = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    signup_step = models.IntegerField(default=0)
    device_id=models.TextField(null=True,blank=True)
    reason_of_declination_identity = models.TextField(null=True,blank=True)
    block_call_date_time = models.DateTimeField(null=True, blank=True)
    image_url_link= models.TextField(null=True, blank=True)
    online_date=models.DateTimeField(null=True, blank=True)
    language = models.CharField(max_length=150,null=True,default='en')

class SponserHistory(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('cancel', 'Cancel'),
    ]
    id = models.AutoField(primary_key=True)
    sponser_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sponsored_histories')
    worker_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='worked_histories')
    start_datetime = models.DateTimeField(auto_now_add=True)
    end_datetime = models.DateTimeField(null=True, blank=True)
    current_status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pending')
    is_active = models.BooleanField(default=True)


class UserGallery(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    image = models.TextField(null=True, blank=True)
    detail = models.TextField(null=True, blank=True)
    datetime = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)



class Review(models.Model):
    id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='customer_reviews')
    worker_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='worker_reviews')
    rating = models.IntegerField()
    content = models.TextField(null=True, blank=True)
    create_date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    like = models.BooleanField(default=True)



class Report(models.Model):
    report_id = models.AutoField(primary_key=True)
    sponser_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sponser_reports',null=True)
    worker_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='worker_reports')
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='user_reports',null=True)
    subject_line = models.TextField()
    content = models.TextField()
    create_datetime = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    report_clear=models.BooleanField(default=False)


class ReportAttachment(models.Model):
    id = models.AutoField(primary_key=True)
    report_id = models.ForeignKey(Report, on_delete=models.CASCADE)
    file_image = models.TextField(null=True, blank=True)  # Storing base64 encoded file here
    video_link = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)



class CoinManagement(models.Model):
    id = models.AutoField(primary_key=True)
    credit_coin = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    is_customer = models.BooleanField(default=True)
    



class Favorite(models.Model):
    id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='customer_favorites')
    worker_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='worker_favorites')
    is_active = models.BooleanField(default=False)

class LongTextField(models.TextField):
    def db_type(self, connection):
        if connection.settings_dict['ENGINE'] == 'django.db.backends.mysql':
            return 'longtext'
        return super().db_type(connection)

class GiftGallery(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    coin = models.IntegerField()
    gift_image = LongTextField(null=True, blank=True)  # Storing base64 encoded image here

from datetime import time

class CallSession(models.Model):
    vid = models.AutoField(primary_key=True)
    start_datetime = models.DateTimeField(auto_now_add=True)
    end_datetime = models.DateTimeField(null=True, blank=True)
    is_demo_call = models.BooleanField(default=False)
    duration =  models.TimeField(default=time(0, 0, 0)) # Consider storing duration in minutes
    call_started_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='started_calls')
    call_received_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_calls')
    call_earning = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    is_active = models.BooleanField(default=True)
    call_count = models.IntegerField(default=0)
    user_call_count = models.IntegerField(default=0)
    CallEnd=models.BooleanField(default=False)



class GiftManagement(models.Model):
    id = models.AutoField(primary_key=True)
    call_id = models.ForeignKey(CallSession, on_delete=models.CASCADE)
    gift_name = models.TextField(null=True, blank=True)
    gift_coin = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    is_active = models.BooleanField(default=True)
    gifts_processed = models.BooleanField(default=False)


class BinanceAccount(models.Model):
    binance_acc_id = models.AutoField(primary_key=True)
    binance_email_id = models.CharField(max_length=500)
    binance_pay_id = models.CharField(max_length=500)
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)



class BankAccount(models.Model):
    bank_acc_id = models.AutoField(primary_key=True)
    bank_name = models.CharField(max_length=150)
    owner_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=500)
    account_type = models.CharField(max_length=150)
    bank_code = models.CharField(max_length=150)
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    currency_id = models.ForeignKey(Country, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)



class RequestCoinClaim(models.Model):
    request_id = models.AutoField(primary_key=True)
    worker_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='worker_coin_claims')
    request_date = models.DateTimeField(auto_now_add=True)
    coin_claim = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('accepted', 'Accepted'),
        ('paid', 'Paid'),
        ('cancel', 'Cancel'),
        ('inprocess', 'Inprocess')
    ]
    
    request_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    sponser_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sponser_coin_claims')
    bank_received = models.BooleanField(default=True)
    transaction_id = models.TextField(null=True, blank=True)
    receipts_image = models.TextField(null=True, blank=True)  # Storing base64 encoded image here
    payment_request_id = models.ForeignKey('PaymentRequest', on_delete=models.CASCADE, null=True,default=None)
    notify_payment_sent = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    payment_done_by_admin =  models.BooleanField(default=False)
    paid_date = models.DateTimeField(null=True, blank=True)
    




class BuyCredit(models.Model):
    buy_credit_id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    coin_alloted = models.DecimalField(max_digits=10, decimal_places=2)
    payment_transaction_id = models.TextField(null=True, blank=True)
    create_date_time = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    bar_code_image = models.TextField(null=True, blank=True)
    check_out_url = models.TextField(null=True, blank=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('timeout', 'Timeout'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    uuid=models.CharField(max_length=500, choices=STATUS_CHOICES, default='pending')
    payment_add= models.BooleanField(default=False)

class PaymentRequest(models.Model):
    payment_request_id = models.AutoField(primary_key=True)
    sponser_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sponser_payment_requests')
    total_amount_request = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    admin_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='admin_payment_requests')
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('accepted', 'Accepted'),
        ('paid', 'Paid'),
        ('cancel', 'Cancel')
    ]
    request_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    notify_payment_sent = models.BooleanField(default=False)
    sponser_binance_acc_id = models.ForeignKey(BinanceAccount, on_delete=models.CASCADE,null=True, blank=True)
    sponser_bank_acc_id = models.ForeignKey(BankAccount, on_delete=models.CASCADE,null=True, blank=True)
    create_date_time = models.DateTimeField(auto_now_add=True)
    receipts_image = models.TextField(null=True, blank=True)  # Storing base64 encoded image here
    is_active = models.BooleanField(default=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    
    





class AdminCoinAlloted(models.Model):
    id = models.AutoField(primary_key=True)
    give_credit = models.DecimalField(max_digits=10, decimal_places=2)
    admin_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='admin_coins_alloted')
    worker_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='worker_coins_alloted')
    reason = models.TextField(null=True, blank=True)
    create_date_time = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)


class Warning(models.Model):
    warning_id = models.AutoField(primary_key=True)
    admin_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='admin_warnings')
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='user_warnings')
    reason = models.TextField(null=True, blank=True)
    create_date_time = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    previous_warning = models.IntegerField(default=0,null=True)
    user_warning_action = models.TextField(null=True, blank=True)
    report_id=models.ForeignKey(Report, on_delete=models.CASCADE,null=True, blank=True)
    

class FrequentQA(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.TextField(null=True, blank=True)
    answer = models.TextField(null=True, blank=True)
    sequence = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)


class Temptable(models.Model):
    id = models.AutoField(primary_key=True)
    json_data = models.TextField(null=True, blank=True)
    
    
class HelpAndSupport(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='user_help_and_support')
    user_name = models.CharField(max_length=500)
    message = models.TextField(null=True, blank=True)
    is_checked_by_admin = models.BooleanField(default=False)
    reply_message_by_admin = models.TextField(null=True, blank=True)
    created_date_time = models.DateTimeField(auto_now_add=True,null = True)
    is_active = models.BooleanField(default=True)
    
class prohibitedbank(models.Model):
    id = models.AutoField(primary_key=True)
    country_id = models.ForeignKey(Country, on_delete=models.CASCADE,null=True, blank=True)
    # prohibitedbankcode= models.IntegerField(null=True, blank=True)
    prohibitedbankcode=models.CharField(max_length=10,null=True, blank=True)
    is_active= models.BooleanField(default=True)
    #prohibited_bank_exist= models.BooleanField(default=False)  
    
    
class AdminEssentials(models.Model):
    id = models.AutoField(primary_key=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active= models.BooleanField(default=True)
    

class CallDeductionCoin(models.Model):
    id = models.AutoField(primary_key=True)
    coin = models.CharField(max_length=50, blank=True, null=True)
    is_active= models.BooleanField(default=True)
    
    
class FileUrl(models.Model):
    id = models.AutoField(primary_key=True)
    image_url= models.TextField(null=True, blank=True)

    

class TopWorker(models.Model):
    id = models.AutoField(primary_key=True)
    is_active = models.BooleanField(default=True)

    
from django.db.models.signals import post_migrate
from django.dispatch import receiver
    
@receiver(post_migrate)
def create_default_top_worker(sender, **kwargs):
        TopWorker.objects.get_or_create(is_active=True)    