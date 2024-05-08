from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import * 
from datetime import timedelta
from django.core.mail import send_mail
from django.template.loader import render_to_string
from decouple import config
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
import jwt
import json

DEBUG = config('DEBUG', default=False, cast=bool)

def get_translation(lang_code, key):
    with open('translations.json') as f:
        translations = json.load(f)
        return translations.get(lang_code, {}).get(key, key)
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def __init__(self, *args, **kwargs):
        # Get the token or related information passed to the serializer
        self.token = kwargs.pop('token', None)
        super(UserSerializer, self).__init__(*args, **kwargs)
        
    def create(self, validated_data):

    
        if self.token:
            # print(validated_data)
            email = validated_data.get('email')
            phone = validated_data.get('phone')
            display_name = validated_data.get('display_name')
            language = validated_data.get('language','es')
            country_id = validated_data.get('country_id')
            #identity_no = validated_data.get('identity_no')
            

            # Check if the email already exists
            if UserProfile.objects.filter(email=email).exists():
                message = get_translation(language, 'sponsor_email_already_used')
                raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message': message}) 

            elif UserProfile.objects.filter(display_name=display_name).exists():
                message = get_translation(language, 'nickname_already_used')
                raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message':message})
           
            # elif UserProfile.objects.filter(phone=phone).exists():
            #     raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message': 'Phone number already exists'})
            # elif UserProfile.objects.filter(identity_no=identity_no).exists():
            #     raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message':'Identity number already exists'})
            
            password = validated_data.pop('password', None)
            instance = self.Meta.model(**validated_data)
            
            if password is not None:
                instance.set_password(password)  # Hash the password before saving
            instance.role_id = 'sponser' 
            instance.first_name = display_name 
            instance.registered_date= datetime.now(timezone.utc).date()
            instance.save()
            # Generating token with expiration time
            refresh = RefreshToken.for_user(instance)
            refresh.access_token.set_exp(timedelta(hours=1))  # Set expiration time here
            instance.signup_step=1
            return instance

        else:    
            first_name = validated_data.get('first_name')
            last_name = validated_data.get('last_name')
            identity_no = validated_data.get('identity_no')
            country_id = validated_data.get('country_id')
            language = validated_data.get('language','en')
            email = validated_data.get('email')
            phone = validated_data.get('phone')
            display_name = validated_data.get('display_name')
            # Check if the email already exists
            if UserProfile.objects.filter(email=email).exists():
                message = get_translation(language, 'email_already_used')
                raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message': message})
            
            
            elif UserProfile.objects.filter(phone=phone).exists():
                message = get_translation(language, 'phone_number_already_used')
                raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message': message})
            
            elif UserProfile.objects.filter(display_name=display_name).exists():
                message = get_translation(language, 'nickname_already_used')
                raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message': message})
            
            elif UserProfile.objects.filter(identity_no=identity_no).exists():
                message = get_translation(language, 'identification_number_already_used')
                raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message':message})
            
        
            password = validated_data.pop('password', None)
            instance = self.Meta.model(**validated_data)
            
            role_id=validated_data.get('role_id')
            if role_id=="worker":
                instance.total_earn_coin= 2000
            

            if password is not None:
                instance.set_password(password)  # Hash the password before saving
            instance.signup_step=1
            instance.registered_date= datetime.now(timezone.utc).date()
            instance.save()

            user_email = instance.email  
            refresh_token_time_in_days = 7
            secret_key = config('SECRET_KEY')
            verification_token = jwt.encode({
                    'user_id': instance.id,
                    'display_name':instance.display_name,
                    'role_id':instance.role_id,
                    'exp': datetime.utcnow() + timedelta(days=refresh_token_time_in_days)  # Refresh token expires in 7 days
                }, secret_key, algorithm='HS256')
            #verification_token = RefreshToken.for_user(instance)
            user_id = instance.id  
            #verification_token['user_id'] = user_id 
            server_base_url = config('SERVER_BASE_URL')
            from_mail = config('DEFAULT_FROM_EMAIL')
            logo =server_base_url+'/media/email_images/logo.png'
            
            verification_link = f"{server_base_url}/vid_user/update_mail_verification/{verification_token}"
            
            email_content = render_to_string('verify_button.html', {'verification_link': verification_link,"display_name":instance.first_name,"logo":logo})
            # email_content = f'''
                
            #     {verify_button}
            # '''
            send_mail(
                'Welcome to our platform!',
                email_content,
                from_mail,  # Replace with your email address
                [user_email],  # Receiver's email address
                html_message=email_content,  # Specify HTML content for the email
                fail_silently=False,
            )
            # print('verification_link------------',verification_link)

            # Generating token with expiration time
        refresh = RefreshToken.for_user(instance)
        refresh.access_token.set_exp(timedelta(hours=1))  # Set expiration time here

        return instance
    
    def update(self, instance, validated_data):
        # Update the instance fields with validated_data
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance



class LoginSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UserProfile
        fields = ['email', 'password','device_id']




class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def send_reset_email(self):
        email = self.validated_data.get('email')
        if email:
            try:
                refresh_token_time_in_days = 5
                secret_key = config('SECRET_KEY')
                user = UserProfile.objects.get(email=email)
                reset_token = jwt.encode({
                    'user_id': user.id,
                    'display_name':user.display_name,
                    'role_id':user.role_id,
                    'exp': datetime.utcnow() + timedelta(minutes=refresh_token_time_in_days)
                }, secret_key, algorithm='HS256')
                
                # reset_token = RefreshToken.for_user(user)
                # reset_token.access_token.set_exp(timezone.now() + timedelta(minutes=5))
                # user_id = user.id  
                # reset_token['user_id'] = user_id 

                # email1='user002@mailinator.com'

                server_base_url = config('SERVER_BASE_URL')
                logo =server_base_url+'/media/email_images/logo.png'
                
                from_mail = config('DEFAULT_FROM_EMAIL')
                reset_link = f"{server_base_url}/vid_user/update_password/{reset_token}"
                reset_button = render_to_string('reset_password.html', {'reset_link': reset_link,'display_name':user.first_name,"logo":logo})

                email_content = f'''
                    {reset_button}

                '''

                send_mail(
                    'Reset Your Password',
                    email_content,
                    from_mail,  # Replace with your email address
                    [email],  # Receiver's email address
                    html_message=email_content,  # Specify HTML content for the email
                    fail_silently=False,
                )
                return True
            except UserProfile.DoesNotExist:
                return False
        return False
    

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
        
class PamentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRequest
        fields = '__all__'
       
       
class PamentRequestDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRequest
        fields = '__all__'
        depth=1
        
class GiftGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftGallery
        fields = '__all__'
        
        

class CoinAllotedSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminCoinAlloted
        fields = '__all__'                       






#------------------------neha ma'am code----------------------        

class RequestCoinClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestCoinClaim
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = '__all__'

class CoinManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoinManagement
        fields = '__all__'
        
class SponserHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SponserHistory
        fields = '__all__'

class CallSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallSession
        fields = '__all__'


        
        
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'
        
class FrequentQASerializer(serializers.ModelSerializer):
    class Meta:
        model = FrequentQA
        fields = '__all__'
        
        
class WarningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warning
        fields = '__all__'

        
class WarningSerializerData(serializers.ModelSerializer):
    class Meta:
        model = Warning
        fields = '__all__'     
        depth=1   
        
class HelpAndSupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpAndSupport
        fields = '__all__'
        
class BuyCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyCredit
        fields = '__all__'
        
class AdminEssentialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminEssentials
        fields = '__all__'
        
        
class GiftManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftManagement
        fields = '__all__'




class CallDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = CallSession
        fields =  '__all__'
        depth=1
        