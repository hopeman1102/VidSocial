from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import *
from rest_framework.views import APIView

from django.shortcuts import HttpResponse
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
import base64

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ForgotPasswordSerializer

from django.contrib.auth.hashers import make_password
import jwt
from datetime import datetime, timedelta

from decouple import config
from django.db.models import Q
from django.contrib.auth.hashers import make_password

from django.conf import settings
import yaml
from django.core.exceptions import ImproperlyConfigured
import json 
from django.db.models import Sum
import os
import requests
import hashlib
import hmac

import random
import time
import json
from datetime import datetime
import arrow
from PIL import Image
import io
import base64
from moviepy.editor import VideoFileClip
from vid_worker.task import send_email_background,send_background_email,send_email_background_for_inquiry
import math

from django.template.loader import render_to_string
from agora_token_builder import RtcTokenBuilder

def yaml_to_html(request):
    if hasattr(settings, 'SWAGGER_YAML_FILE'):
        file = open(settings.SWAGGER_YAML_FILE)
        spec = yaml.safe_load(file.read())
        return render(request, template_name="swagger_base.html", context={'data': json.dumps(spec)})
    else:
        raise ImproperlyConfigured('You should define SWAGGER_YAML_FILE in your settings')

def get_translation(lang_code, key):
    with open('translations.json') as f:
        translations = json.load(f)
        return translations.get(lang_code, {}).get(key, key)
    
access_token_time_in_mint = 1440
refresh_token_time_in_days = 7

'''
for register user and worker from mobile

    url:- {{base_url}}/vid_user/register without token
    parameter:- {"first_name":"ravi", 
    "last_name":"kushwah", 
    "gender_id":"male",
    "email":"ravi@gmail.com", 
    "password":"123456",
    "role_id":"user",     
    "country_id":1,
    "identity_no":"jndfs778y3jk",
    "phone":"+915896523658"
    }

for create sponser from admin pannel

    url:- {{base_url}}/vid_user/register with token
    parameter:- {"first_name":"ravi", 
    "last_name":"kushwah", 
    "gender_id":"male",
    "email":"ravi@gmail.com", 
    "password":"123456",
    "role_id":"sponser",     
    "country_id":1,
    "identity_no":"jndfs778y3jk",
    "phone":"+915896523658"
    }    
'''
from rest_framework.exceptions import ValidationError
class RegisterUserAPIView(APIView):
    def post(self, request):
        token = request.META.get('HTTP_AUTHORIZATION') 
        serializer = UserSerializer(data=request.data, token=token)
        try:
            if serializer.is_valid():
                serializer.save()
                return Response({'code':status.HTTP_201_CREATED,'data':serializer.data})
        except ValidationError as e:
             return Response(e.detail)
        return Response({'code':401,'error':serializer.errors})

    def put(self, request,id):
        try:
            token = request.META.get('HTTP_AUTHORIZATION') 
            user_instance = UserProfile.objects.get(id=id)  # Assuming UserModel is your model
            serializer = UserSerializer(instance=user_instance, data=request.data, token=token, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({'code': status.HTTP_200_OK, 'data': serializer.data})
            else:
                return Response({'code': status.HTTP_400_BAD_REQUEST, 'error': serializer.errors})
        except UserProfile.DoesNotExist:
            return Response({'code': status.HTTP_404_NOT_FOUND, 'error': 'User not found'})
        except ValidationError as e:
            return Response({'code': status.HTTP_400_BAD_REQUEST, 'error': e.detail})


'''
for register user and worker from mobile

    url:- {{base_url}}/vid_user/login 
    parameter:- {"email":"admin@gmail.com", 
                "password":"123456"

                }
            
'''

class UserLoginView(APIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        password = serializer.validated_data['password']

        device_id = serializer.validated_data.get('device_id', None)

        if device_id == None:
            device_id=None
        
        secret_key = config('SECRET_KEY')
        
        try:
            
            user = UserProfile.objects.get(email=email)
            
            
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Please enter vaild email.'})
        serializer = UserSerializer(user)
        response_data = serializer.data.copy()
        country_id = serializer.data['country_id']
        try:
            country_obj = Country.objects.get(id=country_id)
            response_data["country_name"] = country_obj.name
            response_data["country_flag"] = country_obj.flag_url
            response_data["country_code"] = country_obj.code
        except Country.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'country not found'})
        
        if user.check_password(password):
            if user.role_id in ['user','User']:
                if not user.is_mail_verified:
                    message = get_translation(user.language, 'kindly_review_email_verification')
                    return Response({'code':400,'error': message,'is_updated':False,'data':response_data})
            
            if user.role_id in ['worker','Worker']:
                if not user.is_mail_verified:
                    message = get_translation(user.language, 'kindly_review_email_verification')
                    return Response({'code':400,'error': message,'is_updated':False,'data':response_data})
                if user.account_approval_state == "none":
                    message = get_translation(user.language, 'account_not_approved')
                    return Response({'code':400,'error': message,'is_updated':False,'data':response_data})
                
                elif user.account_approval_state == "decline":
                    message = get_translation(user.language, 'account_declined_by_admin')
                    return Response({'code':400,'error': message,'is_updated':False,'data':response_data})
            
            if user.login_permission:

                user_display_name = user.display_name
                user_role_id = user.role_id
                user.status = 'online'
                # Generate JWT tokens
                access_token = jwt.encode({
                    'user_id': user.id,
                    'display_name':user_display_name,
                    'role_id':user_role_id,
                    'exp': datetime.utcnow() + timedelta(minutes=access_token_time_in_mint)  # Access token expires in 1 day
                }, secret_key, algorithm='HS256')

                refresh_token = jwt.encode({
                    'user_id': user.id,
                    'display_name':user_display_name,
                    'role_id':user_role_id,
                    'exp': datetime.utcnow() + timedelta(days=refresh_token_time_in_days)  # Refresh token expires in 7 days
                }, secret_key, algorithm='HS256')
                
                if user_role_id in ['admin','sponser']:
                    return Response({
                        'code':status.HTTP_200_OK,
                        'access': access_token,
                        'refresh': refresh_token,
                    }, status=status.HTTP_200_OK)
                else:
                    UserProfile.objects.filter(id=user.id).update(device_id=device_id)
                    return Response({
                        'code':status.HTTP_200_OK,
                        'access': access_token,
                        'refresh': refresh_token,
                        'data':response_data ,#list(UserProfile.objects.filter(id=user.id).values())[0],
                    })
            else:
                message = get_translation(user.language, 'account_deactivated_by_admin')
                return Response({'code':status.HTTP_401_UNAUTHORIZED,'error': message})
        else:
            message = get_translation(user.language, 'please_enter_valid_password')
            return Response({'code':status.HTTP_401_UNAUTHORIZED,'error': message})




class UpdateMailVerificationAPIView(APIView):
    def get(self, request, verification_token):
        
        try:
            secret_key = config('SECRET_KEY')
            decoded_token = jwt.decode(verification_token,secret_key, algorithms=['HS256'])
            user_id = decoded_token['user_id']
            
            user_profile = UserProfile.objects.filter(pk=user_id).update(registered_date=datetime.now(timezone.utc).date(),is_mail_verified=True)
            server_base_url = config('SERVER_BASE_URL')
            logo =server_base_url+'/media/email_images/img_2.png'
            # print("logo",logo)
             # Replace this with your logo URL
            context = {
                'logo_url': logo,
            }
            return render(request, 'verification_success.html', context)
        
            # return render(request, 'verification_success.html')
        except ObjectDoesNotExist:
            
            logo =server_base_url+'/media/email_images/img_1.png'
            # print("logo",logo)
             # Replace this with your logo URL
            context = {
                'logo_url': logo,
            }
            return render(request, 'verification_failure.html',context)
        except Exception as e:
            
            logo =server_base_url+'/media/email_images/img_1.png'
            # print("logo",logo)
             # Replace this with your logo URL
            context = {
                'logo_url': logo,
            }
            return render(request, 'verification_failure.html',context)


class ForgotPasswordAPIView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        email=request.data["email"]
        language = request.data.get("language",None)

        if serializer.is_valid():
            email_sent = serializer.send_reset_email()
            if email_sent:
                if language !=None:
                    language=language
                else:
                    language = UserProfile.objects.filter(email=email).values("language")[0]["language"]
                message = get_translation(language, 'reset_link_sent_successfully')
                return Response({'code':200,'message': message})
            return Response({'code':400,'message': 'Please enter valid email address.'})
        return Response({'code':status.HTTP_400_BAD_REQUEST,'error':serializer.errors})


class ResetPasswordAPIView(APIView):
    def post(self, request,reset_token):
        new_password = request.data.get('new_password')
        print("new_password",new_password)
        try:
            # Decode token
            secret_key = config('SECRET_KEY')
            decoded_token = jwt.decode(reset_token,secret_key, algorithms=['HS256'])
            user_id = decoded_token['user_id']
            user_profile = UserProfile.objects.get(pk=user_id)
            # Set the new password
            user_profile.password = make_password(new_password)
            user_profile.save()
            
            server_base_url = config('SERVER_BASE_URL')
            logo =server_base_url+'/media/email_images/img_2.png'
            context = {
                'logo_url': logo,
            }
            
            return render(request, 'reset_password_successful.html',context)
        except ObjectDoesNotExist:
            logo =server_base_url+'/media/email_images/img_1.png'
            context = {
                'logo_url': logo,
            }
            return render(request, 'reset_password_link_expired.html',context)
        except Exception as e:
            logo =server_base_url+'/media/email_images/img_1.png'
            context = {
                'logo_url': logo,
            }
            
            return render(request, 'reset_password_link_expired.html',context)
        

class UpdatePasswordAPIView(APIView):
    def get(self, request,reset_token):
        server_base_url = config('SERVER_BASE_URL')
        secret_key = config('SECRET_KEY')
        reset_link = f"{server_base_url}/vid_user/password_reset/{reset_token}"
        try:
            pass
            payload = jwt.decode(reset_token, secret_key, algorithms=['HS256'])
            # print("payload",payload)
            
        except jwt.ExpiredSignatureError:
            logo =server_base_url+'/media/email_images/img_1.png'
            context = {
                'logo_url': logo,
            }
            return render(request, 'reset_password_link_expired.html',context)
            # return Response({'code':401,'error': 'Expired refresh token'})
        except jwt.InvalidTokenError:
            # return Response({'code':401,'error': 'Invalid refresh token'})
            logo =server_base_url+'/media/email_images/img_1.png'
            context = {
                'logo_url': logo,
            }
            return render(request, 'reset_password_link_expired.html',context)
        
        
        context = {'reset_link': reset_link}
        return render(request, 'update_password.html',context)
        

class RefreshToken(APIView):
    def post(self,request):
        secret_key = config('SECRET_KEY')
        refresh_token = request.data.get('refresh_token') 
        try:
            payload = jwt.decode(refresh_token, secret_key, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Expired refresh token'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid refresh token'})

        user_id = payload['user_id']
        display_name = payload['display_name']
        role_id = payload['role_id']

        access_payload = {
            'user_id': user_id,  
            'display_name':display_name,
            'role_id':role_id,
            'exp': datetime.utcnow() + timedelta(minutes=access_token_time_in_mint),  
            'iat': datetime.utcnow(),
            
        }

        access_token = jwt.encode(access_payload, secret_key, algorithm='HS256')
        refresh_token = jwt.encode({
            'user_id': user_id,
            'display_name':display_name,
            'role_id':role_id,
            'exp': datetime.utcnow() + timedelta(days=refresh_token_time_in_days)  # Refresh token expires in 7 days
        }, secret_key, algorithm='HS256')

        if payload['role_id'] in ['admin','sponser']:
            return Response({
                'code':status.HTTP_200_OK,
                'access': access_token,
                'refresh': refresh_token,
            }, status=status.HTTP_200_OK)
        else:
            user = list((UserProfile.objects.filter(id=user_id)).values("country_id"))[0]
            response_data = list((UserProfile.objects.filter(id=user_id)).values())[0]
            country_id = user['country_id']
            try:
                country_obj = Country.objects.get(id=country_id)
                response_data["country_name"] = country_obj.name
                response_data["country_flag"] = country_obj.flag_url
                response_data["country_code"] = country_obj.code
            except Country.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'country not found'})
            return Response({
                'code':status.HTTP_200_OK,
                'access': access_token,
                'refresh': refresh_token,
                'data':response_data,
            })







#name - sponsors list
#utility - returns list of sponsors with filter,search,sorting and pagination
class SponserListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = UserProfile.objects.filter(role_id = "sponser")
            if search_field!=None:
                queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = UserSerializer(queryset, many=True)
                data = serializer.data
                #count total worker for specific sponsor.
                for item in data:
                    sponser_id = item['id']
                    country_id = item['country_id']
                    count_of_workers = UserProfile.objects.filter(sponser_id_id=sponser_id).count()
                    if count_of_workers>0:
                        item['total_workers_for_sponsor'] = count_of_workers
                    else:
                        item['total_workers_for_sponsor'] = 0
                    #extract country name by country id.
                    country = Country.objects.get(id=country_id) 
                    item['country_name'] = country.name 
                result ={"code":200,"data" :data,"count":count}
                return Response(data=result, status=200)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        

#name - report list
#utility - returns list of report with filter,search,sorting and pagination
class ReportListOfSponsorAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            queryset = Report.objects.filter(Q(sponser_id__isnull=False) & Q(user_id__isnull=True),report_clear=False).order_by('-report_id')
            
            if start_date!=None:
                queryset = queryset.filter(create_datetime__date__range = (start_date,end_date))
            if search_field!=None:
                queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                check_sponser_id = list(UserProfile.objects.filter(Q(role_id="sponser") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field)| Q(country_id__name__icontains=search_field))).values("id"))[0]["id"]
                queryset = Report.objects.filter(sponser_id=check_sponser_id,is_active=True).order_by('-report_id')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = ReportSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                
                    report_attachment_obj = ReportAttachment.objects.filter(report_id=item["report_id"],is_active=True).values("file_image", "video_link")
                    if report_attachment_obj:
                        report_attachment_obj = report_attachment_obj[0]
                        item['image_attachment_of_report'] = report_attachment_obj["file_image"]
                        item['video_attachment_of_report'] = report_attachment_obj["video_link"]
                    else:
                        item['image_attachment_of_report'] = None
                        item['video_attachment_of_report'] = None
                    
                    sponser = UserProfile.objects.filter(id=item["sponser_id"],role_id="sponser",is_active=True).values("country_id", "display_name", "profile_image","email","total_warning")
                    if sponser:
                        sponser = sponser[0]
                        item['sponser_name'] = sponser["display_name"]
                        #item['sponser_profile_image'] = sponser["profile_image"]
                        item['sponser_email'] = sponser["email"]
                        item['sponser_total_warning'] = sponser["total_warning"]
                        country_id = sponser["country_id"]
                        country = Country.objects.get(id=country_id)
                        item['sponser_country_name'] = country.name
                        item['sponser_country_flag_url'] = country.flag_url
                    
                    worker = UserProfile.objects.filter(id=item["worker_id"],role_id="worker",is_active=True).values("country_id","display_name","profile_image","email","total_warning")
                    if worker:
                        worker = worker[0]
                        item['worker_name'] = worker["display_name"]
                       # item['worker_profile_image'] = worker["profile_image"]
                        item['worker_email'] = worker["email"]
                        item['worker_total_warning'] = worker["total_warning"]
                        country_id = worker["country_id"]
                        country = Country.objects.get(id=country_id)
                        item['worker_country_name'] = country.name
                        item['worker_country_flag_url'] = country.flag_url
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result, status=200)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
#name - workers list
#utility - returns list of workers with filter,search,sorting and pagination
class WorkerListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            sponser_id = request.GET.get("sponser_id")
            if not sponser_id:
                queryset = UserProfile.objects.filter(Q(role_id="worker") | Q(role_id="Worker"))
                if search_field!=None:
                    queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                    count = queryset.count()
                elif ordering_field!=None:
                    if sortingOrder=="asc":
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count()
                    else:
                        ordering_field="-"+ordering_field
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count() 
                else:
                    queryset = queryset.all() if queryset.exists() else None
                    count = queryset.count()
                if(page > 0):
                    queryset = queryset[skip:skip+limit] if not queryset == None  else []
                if queryset:
                    serializer = UserSerializer(queryset, many=True)
                    data = serializer.data
                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result, status=200)
                else:
                    return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
            else:
                queryset = UserProfile.objects.filter(sponser_id = sponser_id)
                count = queryset.count()
                if queryset:
                    serializer = UserSerializer(queryset, many=True)
                    data = serializer.data
                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result, status=200)
                else:
                    return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})


#name - payment request list
#utility - returns list of payment request with filter,search,sorting and pagination
class PaymentRequestListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = PaymentRequest.objects.filter(Q(payment_status="accepted") | Q(payment_status="draft"))
            if search_field!=None:
                queryset = queryset.filter(Q(payment_status__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = PamentRequestSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    sponser_id = item['sponser_id']
                    sponser =list(UserProfile.objects.filter(id=sponser_id,role_id="sponser").values("email","first_name"))[0]
                    item['sponser_name'] = sponser["first_name"]
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result, status=200)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
#name - payment Received list
#utility - returns list of payment request with filter,search,sorting and pagination
class PaymentReceivedListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = PaymentRequest.objects.filter(payment_status="paid")
            if search_field!=None:
                queryset = queryset.filter(Q(payment_status__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = PamentRequestSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    sponser_id = item['sponser_id']
                    sponser =list(UserProfile.objects.filter(id=sponser_id,role_id="sponser").values("email","first_name"))[0]
                    item['sponser_name'] = sponser["first_name"]
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result, status=200)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
#name - payment history list
#utility - returns list of payment request with filter,search,sorting and pagination
class PaymentHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = PaymentRequest.objects.all()
            if search_field!=None:
                queryset = queryset.filter(Q(payment_status__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = PamentRequestSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    sponser_id = item['sponser_id']
                    sponser =list(UserProfile.objects.filter(id=sponser_id,role_id="sponser").values("email","first_name"))[0]
                    item['sponser_name'] = sponser["first_name"]
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result, status=200)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
#name - user with warning list
#utility - returns list of workers with filter,search,sorting and pagination
class UserWarningListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = UserProfile.objects.filter(Q(role_id="user") | Q(role_id="User"))
            if search_field!=None:
                queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = UserSerializer(queryset, many=True)
                data = serializer.data
                #result = []
                # for item in data:
                #     desired_fields = {'id': item['id'], 'name': item['first_name']}
                #     result.append(desired_fields)
                result ={"data" :data,"count":count}
                return Response(data=result, status=200)
            else:
                return Response(data={'message': 'No data available'}, status=404)
           
        except Exception as e:
            return Response(data=str(e), status=400)
        

#name -  message list
#utility - returns list of messages with filter,search,sorting and pagination
class UserMessageListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = UserProfile.objects.filter(Q(role_id="user") | Q(role_id="User"))
            if search_field!=None:
                queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = UserSerializer(queryset, many=True)
                data = serializer.data
                output = []
                for item in data:
                    desired_fields = {'user_id': item['id'], 'name': item['first_name'], 'email': item['email']}
                    output.append(desired_fields)
                result ={"data" :output,"count":count}
                return Response(data=result, status=200)
            else:
                return Response(data={'message': 'No data available'}, status=404)
        except Exception as e:
            return Response(data=str(e), status=400)
        
        

#name -  gift list
#utility - returns list of gift with filter,search,sorting and pagination
class GiftListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = GiftGallery.objects.all()
            if search_field!=None:
                queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = GiftGallerySerializer(queryset, many=True)
                data = serializer.data
                result ={"data" :data,"count":count}
                return Response(data=result, status=200)
            else:
                return Response(data={'message': 'No data available'}, status=404)
        except Exception as e:
            return Response(data=str(e), status=400)

#KD work start by hear.
        
class ImageViewAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def get(self, request,id):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']  # Extract the user_id from the decoded token
                image=list(UserProfile.objects.filter(id=id).values())[0]["id_image"]
                 
                return Response({'image':image}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'message': str(e)}, status=400)                
        
class VideoViewAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def get(self, request,id):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']  # Extract the user_id from the decoded token
                video_link=list(UserProfile.objects.filter(id=id).values())[0]["video_link"]
                 
                return Response({'video_link':video_link}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'message': str(e)}, status=400)                        

class CreateGiftAPIView(APIView):
    # authentication_classes=()
    # permission_classes=()
    
    def post(self,request):
        
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            user_id = decoded_token['user_id']  # Extract the user_id from the decoded token

        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
        language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

        
        if request.data.get("GiftId",None) == None:
            name = request.data.get("name")
            coin=request.data.get("coin")
            file = request.data.get('file')
            print("file",file)
            # encoded_image=base64.b64encode(file.read()).decode('utf-8')
            if file !=None:
                # encoded_image=base64.b64encode(file.read()).decode('utf-8')
                file_extension = os.path.splitext(file.name)[1]
                target_folder = os.path.join('videos', str(f"gift_{user_id}"))
                
                unique_filename = f"image_{name}{file_extension}"
                os.makedirs(target_folder, exist_ok=True)
                full_path = os.path.join(target_folder, unique_filename)
                print("full_path", full_path)
                
                with open(full_path, "wb+") as image_file:
                    # Seek to the beginning of the file
                    file.seek(0)
                    # print("File Content:", profile_url_data.read())
                    file.seek(0)
                    image_file.write(file.read())
                
                image_path = os.path.join(settings.MEDIA_URL, str(f"gift_{user_id}"), unique_filename)
                base_url = config('SERVER_BASE_URL')
                image_link = base_url + image_path
                image_link = image_path
                print("image_link",image_link)
            
            name_of_gift = GiftGallery.objects.filter(name=name).exists()
            if name_of_gift:
                message = get_translation(language, 'gift_name_already_exist')
                return Response({'code':400,'error': message},status=200)
            
            coin_of_gift = GiftGallery.objects.filter(coin=coin).exists()
            if coin_of_gift:
                message = get_translation(language, 'gift_coin_already_exist')
                return Response({'code':400,'error': message},status=200)
            
            if not file:
                message = get_translation(language, 'file_not_found')
                return Response({'code':400,'error': message},status=200)
            
            encoded_image_of_gift = GiftGallery.objects.filter(gift_image=image_link).exists()
            if encoded_image_of_gift:
                message = get_translation(language, 'image_of_gift_already_exist')
                return Response({'code':400,'error': message},status=200)

            #encoded_image=base64.b64encode(file.read()).decode('utf-8')
            
            Giftobj=GiftGallery()
            Giftobj.name=name
            Giftobj.coin=coin
            Giftobj.gift_image=image_link
            Giftobj.save()
            return Response(data={"code":200,"msg":"Gift added sucessfully in gift gallery"},status=200)
 
        else:
            name = request.data.get("name")
            coin=request.data.get("coin")
            file = request.data.get('file',None)  
            # print("file",file,"file.nam",file.name)
            GiftId=request.data.get("GiftId")
            try:
                if file !=None:
                    # encoded_image=base64.b64encode(file.read()).decode('utf-8')
                    file_extension = os.path.splitext(file.name)[1]
                    file_name_without_extension = os.path.splitext(file.name)[0]
                    target_folder = os.path.join('videos', str(f"gift_{user_id}"))
                    
                    unique_filename = f"image_{file_name_without_extension}{file_extension}"
                    os.makedirs(target_folder, exist_ok=True)
                    full_path = os.path.join(target_folder, unique_filename)
                    
                    with open(full_path, "wb+") as image_file:
                        # Seek to the beginning of the file
                        file.seek(0)
                        # print("File Content:", profile_url_data.read())
                        file.seek(0)
                        image_file.write(file.read())
                    
                    image_path = os.path.join(settings.MEDIA_URL, str(f"gift_{user_id}"), unique_filename)
                    base_url = config('SERVER_BASE_URL')
                    # image_link = base_url + image_path
                    image_link = image_path
                    # print("image_link",image_link)
                    
                    gift_gallery = GiftGallery.objects.filter(id=GiftId).update(name=name,coin=coin,gift_image=image_link)
                else:
                    gift_gallery = GiftGallery.objects.filter(id=GiftId).update(name=name,coin=coin)  
                
                message = get_translation(language, 'gift_added_successfully_in_gift_gallery')     
                return Response(data={"code":200,"msg":message},status=200)
            except Exception as e:
                return Response(data={"code":400,"exception":f"{e}"},status=200)               


#accept or paid or cancel status update 
# url :-{{base_url}}/vid_user/AdminPaymentRequestStatus/
# method:- post 
# json:- {
#     "id":id,
#     "Status":"cancel" ,or "Status":"accepted" or "Status":"paid"
#      "TransactionId": null
# }
class UploadReceiptAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                SponserId = decoded_token['user_id']  # Extract the user_id from the decoded token
                id = request.data.get("id",None)
                Status = request.data.get("Status",None)
                
                language = UserProfile.objects.filter(id=SponserId).values("language")[0]["language"]
                
                if Status=="paid":
                    file =  request.data.get('file')
                    if not file:
                        return Response({'error': 'File not found'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # encoded_image=base64.b64encode(file.read()).decode('utf-8')
                    # encoded_image=base64.b64encode(file.read()).decode('utf-8')
                    file_extension = os.path.splitext(file.name)[1]
                    target_folder = os.path.join('videos', str(f"recipt_{id}"))
                    
                    unique_filename = f"image_{id}{file_extension}"
                    os.makedirs(target_folder, exist_ok=True)
                    full_path = os.path.join(target_folder, unique_filename)
                    # print("full_path", full_path)
                    
                    with open(full_path, "wb+") as image_file:
                        # Seek to the beginning of the file
                        file.seek(0)
                        # print("File Content:", profile_url_data.read())
                        file.seek(0)
                        image_file.write(file.read())
                    
                    image_path = os.path.join(settings.MEDIA_URL, str(f"recipt_{id}"), unique_filename)
                    base_url = config('SERVER_BASE_URL')
                    # image_link = base_url + image_path
                    image_link = image_path
                    # print("image_link",image_link)
                        
                    current_date_time = timezone.now()
                    try:
                        sponser_payment_request = PaymentRequest.objects.get(payment_request_id=id)
                       
                    except PaymentRequest.DoesNotExist:
                        return Response({"code": 404, "message": "Payment request not found"})
                    # Update the object.
                    sponser_payment_request.request_status = Status
                    sponser_payment_request.receipts_image = image_link
                    sponser_payment_request.paid_date = current_date_time
                    sponser_payment_request.notify_payment_sent = True
                    sponser_payment_request.save()
                    try:
                        request_coin_claim_objects = RequestCoinClaim.objects.filter(payment_request_id=id)
                    except RequestCoinClaim.DoesNotExist:
                        return Response({"code": 404, "message": "Request Coin Claim object not found"})
                   
                    for request_coin_claim_obj in request_coin_claim_objects:
                        request_coin_claim_obj.payment_done_by_admin = True
                        request_coin_claim_obj.save()
                    
                    sponser_id = sponser_payment_request.sponser_id_id
                    try:
                        sponser_obj = UserProfile.objects.get(id = sponser_id,is_active=True)
                    except Exception as e:
                        return Response(data={"code":404,"message":"sponsor not found"})
                    
                    user_email =sponser_obj.email# "mahendra.inwizards@gmail.com"#sponser_obj.email
                    logo =base_url+'/media/email_images/logo.png'
                    # print("logo",logo)
                    # decoded_image = base64.b64decode(encoded_image)
                    # file_extension = os.path.splitext(file.name)[1]
                    # target_folder = os.path.join('videos',str(id))
                    
                    # unique_filename = f"image{file_extension}"
                    # os.makedirs(target_folder, exist_ok=True)
                    # full_path = os.path.join(target_folder, unique_filename)
                    
                    # with open(full_path, "wb") as file:
                    #     file.write(decoded_image)
                    
                    # image_path = os.path.join(settings.MEDIA_URL,str(id), unique_filename)
                    # base_url = config('SERVER_BASE_URL')
                    # image_link =base_url+image_path
                    
                    image_html = f'<img src="{image_link}" alt="Payment Confirmation Attachment" style="width: 300px; height: auto;">'

                    # email_content = f'''
                    #     <h2 style="color: #333;">Payment Confirmation</h2>
                    #     <p>Dear {sponser_obj.display_name},</p>
                        
                    #     <p>Your payment has been processed successfully.</p>
                    #     <p>To view your payment confirmation receipt, please <a href="{image_link}">click here</a>.</p>

                    #     <h3>Payment Details:</h3>
                        
                    #     <ul>
                    #         <li><strong>Amount:</strong> {sponser_payment_request.total_amount_request}</li>
                    #         <li><strong>Date:</strong> {sponser_payment_request.create_date_time.date()}</li>
                    #     </ul>
                        
                    #     <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
                        
                    #     <p>Thank you for choosing our service!</p>
                        
                    #     <p>Best regards,<br>
                    #     Admin</p>
                        
                    # '''
                    #from_mail = config('DEFAULT_FROM_EMAIL')
                    # print("image_link",image_link)
                    html_content = render_to_string('paymentconformation.html', {'worker_name': sponser_obj.first_name,"image_link":base_url + image_path, 'payment_amount':sponser_payment_request.total_amount_request,'sponsor_name':"Admin","create_date_str":sponser_payment_request.create_date_time.date(),"logo":logo})
                    
                    send_background_email.delay(user_email, html_content)
                    
                    # send_mail(
                    #     'Welcome to our platform!',
                    #     email_content,
                    #     from_mail,  # Replace with your email address
                    #     [user_email],  # Receiver's email address
                    #     html_message=email_content,  # Specify HTML content for the email
                        
                    # )
                    message = get_translation(language, 'sponsor_payment_upload_receipt_and_send_email_successfully')
                    return Response({'code':200,'message': message}, status=status.HTTP_200_OK) 
                    
                sponser_payment_request_object=PaymentRequest.objects.filter(payment_request_id=id).update(request_status=Status)  
                return Response({'message': f'Sponser payment {Status} successfully','code':200}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'message': str(e),'code':400}, status=200)       

                                  
class AdminPaymentRequestAPIView(APIView):

    def post(self,request):
        try:
            
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                SponserId = decoded_token['user_id']  # Extract the user_id from the decoded token

 
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(id=SponserId).values("language")[0]["language"]

            # print("SponserId",SponserId)
            user_profile_obj = UserProfile.objects.get(role_id="admin",is_active=True)[0]
            
            BinanceExist = BinanceAccount.objects.filter(user_id=SponserId).values()
            # print("BinanceExist",BinanceExist)
            if BinanceExist:
                pass
            else:
               message = get_translation(language, 'binance_account_unavailable') 
               result ={'code':status.HTTP_404_NOT_FOUND,'message': message}
               return Response(data=result)
            
            BinanceAccount_obj = BinanceAccount.objects.get(user_id=SponserId,is_active=True)
            
               
            #BankAccount_obj = BankAccount.objects.get(user_id =SponserId ,is_active=True)
            AdminId=user_profile_obj.id
            total_amount_request = request.data.get("AmountRequest",None)
            sponser_binance_acc_id = BinanceAccount_obj.binance_acc_id
            sponser_bank_acc_id = request.data.get('SponserBankId',None)
            list_of_worker_request_id = request.data.get('list_of_worker_request_id',None)
            
            PaymentObj=PaymentRequest()
            PaymentObj.sponser_id=UserProfile.objects.get(id=SponserId)
            PaymentObj.admin_id=UserProfile.objects.get(id=AdminId)
            
            PaymentObj.total_amount_request=total_amount_request
            if sponser_binance_acc_id != None:
               PaymentObj.sponser_binance_acc_id=BinanceAccount.objects.get(binance_acc_id=sponser_binance_acc_id)
            if sponser_bank_acc_id != None: 
               PaymentObj.sponser_bank_acc_id=BankAccount.objects.get(bank_acc_id=sponser_bank_acc_id)
            PaymentObj.save()
            for worker_request_id in list_of_worker_request_id:
                request_coin_claim_obj = RequestCoinClaim.objects.get(request_id=worker_request_id)
                request_coin_claim_obj.payment_request_id = PaymentObj
                request_coin_claim_obj.request_status = "inprocess"
                #request_coin_claim_obj.payment_done_by_admin =True
                request_coin_claim_obj.save()
            
            message = get_translation(language, 'payment_request_sent_successfully')     
            return Response(data={"message":message,'code':200},status=200)

        except Exception as e:
            return Response(data={"message":f"{e}",'code':400},status=200)
        
class SponserPaymentNotificationAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def get(self, request,id):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                SponserId = decoded_token['user_id']  # Extract the user_id from the decoded token
                subscriber_id=PaymentRequest.objects.filter(payment_request_id=id).update(notify_payment_sent=True)  
                 
                return Response({'message': f'Sponser Notify successfully','code':200}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'message': str(e)}, status=400)          
        








'''Update Sponser Detail '''

class UpdateSponserDetail(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        sponser_id = request.data.get('sponser_id')
        display_name = request.data.get('display_name')
        email = request.data.get('email')
        country_id= request.data.get('country_id')
        password = request.data.get('password')
        language = request.data.get('language')

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        try:
            user = UserProfile.objects.get(id=user_id,role_id='admin')
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Only admin can Update'})
        

        try:
            sponser_data = UserProfile.objects.get(id=sponser_id,role_id='sponser')
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Sponser not found'})
        
        # sponser_data = UserProfile.objects.filter(id=sponser_id,role_id='sponser').delete()
    
        sponser_data.display_name = display_name
        sponser_data.email = email
        sponser_data.language = language

        sponser_data.country_id= Country.objects.get(id=country_id)
        if password:
            sponser_data.password = make_password(password)
        sponser_data.save()
        
        language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

        message = get_translation(language, 'updated_successfully')
        print("message",message)

        return Response({'code':200,'message': message})
 
    '''delet sponsor by admin'''
       
    def delete(self, request,id):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1] 

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256']) 
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        try:
            user = UserProfile.objects.get(id=user_id, role_id = 'admin')
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Only admin Can Delete Sponsor'})
        
        # sponser = UserProfile.objects.get(id=id)
        # sponser.is_active = False
        # sponser.save()
        # worker = UserProfile.objects.filter(sponser_id=id).update(sponser_id=None)
        try:
            print("id",id)
            paymentDetail = RequestCoinClaim.objects.filter(sponser_id=id, request_status__in=['draft','inprocess'])
            if paymentDetail:
                WorkerPaymentData=paymentDetail.values()
                for data in WorkerPaymentData:
                    userobj=UserProfile.objects.get(id=data["worker_id_id"])
                    userobj.total_earn_coin=userobj.total_earn_coin + data["coin_claim"]
                    userobj.sponser_id=None
                    userobj.save()
                    
            worker = UserProfile.objects.filter(sponser_id=id).update(sponser_id=None)        
            sponser = UserProfile.objects.filter(id=id).delete() 
            
            data={"SponserId":id,"DeleteStatus":True}
            send_status_update_message(data)   
            return Response({'code':200,'message': 'Sponser Delete Successfully'}) 
        
        except Exception as e:
            return Response(data={'message': str(e),'code':400}, status=400)        

class ApproveReview(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        r_id = request.data.get('review_id')

        try:
            user = UserProfile.objects.get(id=user_id, role_id = 'admin')
        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'Only admin Can Approve'})
        review_data = Review.objects.get(id=r_id)
        review_data.is_approved = True
        review_data.save()

        return Response({'code':200,'message': 'Review Approved Successfully'})  
    


class ApproveIdVideo(APIView):
    
    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        worker_id = request.data.get('worker_id')
        status = request.data.get('status')
        reason_of_declination_identity = request.data.get('reason_of_declination_identity',None)

        try:
            user = UserProfile.objects.get(id=user_id, role_id = 'admin')
        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'Only admin Can Approve'})
        
        worker_data = UserProfile.objects.get(id=worker_id)
        if status == "decline":
            
            worker_data.reason_of_declination_identity = reason_of_declination_identity
            worker_data.account_approval_state = status
            worker_data.signup_step = 1
            worker_data.save()
            return Response({'code':200,'message': 'Identity Decline Successfully'}) 
        else:
            worker_data.account_approval_state = status
            worker_data.total_earn_coin = 2000.00
            worker_data.save()
            return Response({'code':200,'message': 'Identity Approved Successfully'}) 
        
        
        # if worker_data.account_approval_state == 'none':
        #     worker_data.account_approval_state = 'waiting'
        #     worker_data.save()
        # elif worker_data.account_approval_state == 'waiting':
        #     worker_data.account_approval_state = 'confirmed'
        #     worker_data.save()


        #return Response({'code':200,'message': 'Identity Approved Successfully'})  



class ViewUserDetail(APIView):

    def get(self, request, id):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
        try:
            if (UserProfile.objects.get(id=user_id)).role_id =='admin':
                user_data = UserProfile.objects.filter(id=id).values('first_name','last_name','display_name','email','password','gender','phone','role_id','status','registered_date','first_call_date','total_warning','country_id','total_earn_coin','sponser_id','profile_image','id_image','video_link','account_approval_state','identity_no','is_mail_verified','last_warning_datetime')
            else:
                user_data = UserProfile.objects.filter(id=id).values('first_name','last_name','display_name','email','gender','phone','role_id','status','registered_date','first_call_date','total_warning','country_id','total_earn_coin','sponser_id','profile_image','id_image','video_link','account_approval_state','identity_no','is_mail_verified','last_warning_datetime')

            return Response({'code':200,"message": user_data})

        except Exception as e:
            return Response({'code':500,"error": str(e)})
        
       


from decimal import Decimal
class CoinAlloted(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        worker_id = request.data.get('worker_id')
        give_credit = request.data.get('give_credit')
        reason = request.data.get('reason')

        try:
            user = UserProfile.objects.get(id=user_id, role_id = 'admin')
        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'Only admin Can Allocate'})
        
        serializer = CoinAllotedSerializer(data={'admin_id':user_id,'worker_id':worker_id,'give_credit':give_credit,'reason':reason})
        
        if serializer.is_valid():
            serializer.save()
            worker_profile = UserProfile.objects.get(id=worker_id)
            
      
            # worker_profile.total_earn_coin=worker_profile.total_earn_coin +  int(give_credit)
            # print(" worker_profile.total_earn_coin", worker_profile.total_earn_coin)
            # worker_profile.save()
            worker_profile.total_earn_coin += int(give_credit)
            
            worker_profile.save(update_fields=['total_earn_coin'])



        return Response({'code':201,'message': 'Coin Alloted Successfully'})  
    


class CoinDeduction(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        worker_id = request.data.get('worker_id')
        give_credit = request.data.get('give_credit')
        reason = request.data.get('reason')

        try:
            user = UserProfile.objects.get(id=user_id, role_id = 'admin')
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Only Admin Can Deduct Coin'})
        
        serializer = CoinAllotedSerializer(data={'admin_id':user_id,'worker_id':worker_id,'give_credit':give_credit,'reason':reason})
        if serializer.is_valid():
            serializer.save()
            worker_profile = UserProfile.objects.get(id=worker_id)
            worker_profile.total_earn_coin=worker_profile.total_earn_coin - give_credit
            worker_profile.save()


        return Response({'code':status.HTTP_200_OK,'message': 'Coin Deducted Successfully'})  





class LoginPermission(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        sponser_id = request.data.get('sponser_id')

        try:
            user = UserProfile.objects.get(id=user_id, role_id = 'admin')
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Only Admin Have Permission'})
 
        sponser_profile = UserProfile.objects.get(id=sponser_id)
        print("sponser_profile.login_permission",sponser_profile.login_permission)
        sponser_profile.login_permission = not sponser_profile.login_permission
        sponser_profile.save()

        return Response({'code':status.HTTP_200_OK,'message': 'Login permission updated Successfully'})  
    



#------------------------listing start-------from-neha ma'am-------------------------------------------------




#name - sponsors list
#utility - returns list of sponsors with filter,search,sorting and pagination
class SponserListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sponsor_id = decoded_token['user_id'] 
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = UserProfile.objects.filter(Q(role_id = "sponser",is_active=True)).order_by('-id')
            if search_field!=None:
                queryset = queryset.filter(Q(display_name__icontains=search_field) | Q(email__icontains=search_field) | Q(country_id__name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = UserSerializer(queryset, many=True)
                data = serializer.data
                #count total worker for specific sponsor.
                for item in data:
                    sponser_id = item['id']
                    country_id = item['country_id']
                    count_of_workers = UserProfile.objects.filter(sponser_id_id=sponser_id,is_active=True).count()
                    if count_of_workers>0:
                        item['total_workers_for_sponsor'] = count_of_workers
                    else:
                        item['total_workers_for_sponsor'] = 0
                    #extract country name by country id.
                    country = Country.objects.get(id=country_id) 
                    item['country_name'] = country.name 
                    item['country_flag_url'] = country.flag_url 
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                language = UserProfile.objects.filter(id=sponsor_id).values("language")[0]["language"]

                message = get_translation(language, 'no_data_available')
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': message})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        

#name - report list
#utility - returns list of report with filter,search,sorting and pagination
class ReportListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            worker_id = request.GET.get("worker_id",None) 
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = Report.objects.filter(is_active=True).order_by('-report_id')
            
            if search_field!=None:
                check_worker_id = list(UserProfile.objects.filter(Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field))).values("id"))[0]["id"]
                queryset = Report.objects.filter(worker_id=check_worker_id,is_active=True).order_by('-report_id')
                count = queryset.count()
                
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = ReportSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    sponser_id = item['sponser_id']
                    worker_id = item['worker_id']
                    sponser_query = UserProfile.objects.filter(id=sponser_id,role_id="sponser",is_active=True)
                    if sponser_query:
                        sponser =list(sponser_query.values("first_name"))[0]
                        item['sponser_name'] = sponser["first_name"]
                    worker_query = UserProfile.objects.filter(id=worker_id,role_id="worker",is_active=True)
                    if worker_query:
                        worker =list(worker_query.values("email","first_name"))[0]
                        item['worker_email'] = worker["email"]
                        item['worker_name'] = worker["first_name"]
                    
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        
        
#name - workers list
#utility - returns list of workers with filter,search,sorting and pagination
class WorkerListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            sponser_id = request.GET.get("sponser_id")
            account_approval_state = request.GET.get("account_approval_state",None) 
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            if not sponser_id:
                queryset = UserProfile.objects.filter(is_active=True).filter(Q(role_id="worker") | Q(role_id="Worker")).order_by('-registered_date')
                
                if account_approval_state=="approve":
                   queryset = queryset.filter(account_approval_state="approve")
                elif account_approval_state=="decline":
                   queryset = queryset.filter(account_approval_state="decline")
                elif account_approval_state=="none":
                    queryset = queryset.filter(account_approval_state="none")
                elif account_approval_state=="all":
                    queryset = queryset.all()
                
                if start_date !=None:
                   queryset = queryset.filter(is_active=True,date_joined__date__range=(start_date, end_date))
                if search_field!=None:
                    queryset = queryset.filter(Q(display_name__icontains=search_field)| Q(email__icontains=search_field) | Q(country_id__name__icontains=search_field)) 
                    count = queryset.count()
                elif ordering_field!=None:
                    if sortingOrder=="asc":
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count()
                    else:
                        ordering_field="-"+ordering_field
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count() 
                else:
                    queryset = queryset.all() if queryset.exists() else None
                    count = queryset.count() if queryset is not None else 0
                if(page > 0):
                    queryset = queryset[skip:skip+limit] if not queryset == None  else []
                if queryset:
                    serializer = UserSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        if item["country_id"]:
                            item['country_id'] = Country.objects.filter(id=item["country_id"]).values()
                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result, status=200)
                else:
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
            else:
                queryset = UserProfile.objects.filter(sponser_id=sponser_id,is_active=True)
                count = queryset.count() if queryset is not None else 0
                if queryset:
                    serializer = UserSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        if item["country_id"]:
                            item['country_id'] = Country.objects.filter(id=item["country_id"]).values()
                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result)
                else:
                    return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})


#name - payment request list
#utility - returns list of payment request with filter,search,sorting and pagination
class PaymentRequestListAPIView(APIView):
    
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            country_name = request.GET.get("country_name",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            queryset = PaymentRequest.objects.filter(is_active=True).filter(request_status="draft").order_by('-payment_request_id')
            count = queryset.count()
            if start_date!=None:
                queryset = PaymentRequest.objects.filter(create_date_time__date__range=(start_date,end_date),is_active=True).filter(request_status="draft").order_by('-payment_request_id')
                count = queryset.count()
            if search_field!=None:

                queryset = queryset.filter((Q(sponser_id__email__icontains=search_field) | Q(sponser_id__display_name__icontains=search_field)| Q(total_amount_request__icontains=search_field)))
                print("queryset",queryset.values())
                
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            elif country_name!=None:
                check_sponsor_ids = UserProfile.objects.filter(
                    Q(role_id="sponser") & Q(is_active=True) & (Q(country_id__name__icontains=country_name))
                ).values_list("id", flat=True)

                if check_sponsor_ids:
                    queryset = queryset.filter(sponser_id__in=check_sponsor_ids)
                    count = queryset.count()

            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                
                serializer = PamentRequestDataSerializer(queryset, many=True) 
                data = serializer.data
                
                for item in data:
                  
                    sponser_id = item['sponser_id']['id']
                    sponsor_query =UserProfile.objects.filter(id=sponser_id,role_id="sponser",is_active=True).values()
                    if sponsor_query.exists():
                        sponsor = list(sponsor_query.values("email", "display_name","country_id"))[0]
                        item['email'] = sponsor["email"]
                        item['sponser_name'] = sponsor["display_name"]
                        item['country_id'] = Country.objects.filter(id=sponsor["country_id"]).values()
                    else:
                        pass    

                    payment_request_id = item['payment_request_id']
                    worker_count = RequestCoinClaim.objects.filter(payment_request_id=payment_request_id).count()
                    item["worker_count"] = worker_count

                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})


#name - payment Received list
#utility - returns list of payment request with filter,search,sorting and pagination
class PaymentReceivedListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            country_name = request.GET.get("country_name",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            queryset = BuyCredit.objects.filter(status="success",is_active=True).order_by('-buy_credit_id')
            if start_date!=None:
                queryset = BuyCredit.objects.filter(create_date_time__date__range=(start_date, end_date),status="success",is_active=True).order_by('-buy_credit_id')
                count = queryset.count()
            if search_field!=None:
               
                check_user_ids = UserProfile.objects.filter(
                    Q(role_id="user") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field) | Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_user_ids:
                    queryset = queryset.filter(customer_id__in=check_user_ids)
                    count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
                    
            elif country_name!=None:
                check_user_ids = UserProfile.objects.filter(
                    Q(role_id="user") & Q(is_active=True) & (Q(country_id__name__icontains=country_name))
                ).values_list("id", flat=True)

                if check_user_ids:
                    queryset = queryset.filter(customer_id__in=check_user_ids)
                    count = queryset.count()
            else:
                # queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
                
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = BuyCreditSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    customer_id = item['customer_id']
                    
                    user_query =UserProfile.objects.filter(id=customer_id,role_id="user",is_active=True).values()
                    
                    if user_query.exists():
                        user = list(user_query.values("email", "display_name","country_id","profile_image"))[0]
                        item['user_email'] = user["email"]
                        item['user_name'] = user["display_name"]
                        item['user_profile_image'] = user["profile_image"]
                        item['user_country_id'] = Country.objects.filter(id=user["country_id"]).values()
                          
                    else:
                        pass   
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
#name - payment history list
#utility - returns list of payment request with filter,search,sorting and pagination
class PaymentHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            country_name = request.GET.get("country_name",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            # if not start_date or not end_date:
            #     return Response(data={'code': 400, 'message': 'Please provide start and end date'})
            # if start_date > end_date:
            #     return Response(data={'code': 400, 'message':"Start date must be less than end date."})
            
            queryset = PaymentRequest.objects.filter(is_active=True,receipts_image__isnull=False,notify_payment_sent=True,request_status="paid").order_by('-paid_date')
            if start_date!=None:
                queryset = queryset.filter(create_date_time__date__range=(start_date,end_date),is_active=True,receipts_image__isnull=False,notify_payment_sent=True,request_status="paid").order_by('-create_date_time','-payment_request_id')
                count = queryset.count()
            if search_field!=None:
                check_sponsor_ids = UserProfile.objects.filter(
                    Q(role_id="sponser") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)) | Q(country_id__name__icontains=search_field)
                ).values_list("id", flat=True)
                if check_sponsor_ids:
                    queryset = queryset.filter(sponser_id__in=check_sponsor_ids)
                    count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            elif country_name!=None:
                check_user_ids = UserProfile.objects.filter(
                    Q(role_id="user") & Q(is_active=True) & (Q(country_id__name__icontains=country_name))
                ).values_list("id", flat=True)

                if check_user_ids:
                    queryset = queryset.filter(customer_id__in=check_user_ids)
                    count = queryset.count()
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
                # count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = PamentRequestDataSerializer(queryset, many=True)
                data = serializer.data
                
                for item in data:
                    sponser_id = item['sponser_id']['id']
                    # print("sponser_id",sponser_id)
                    sponsor_query =UserProfile.objects.filter(id=sponser_id,role_id__in=["sponser", "Sponser"],is_active=True).values()
                    # item['sponser_name'] = sponser["first_name"]
                    if sponsor_query.exists():
                        sponsor = list(sponsor_query.values("email", "display_name","country_id"))[0]
                        item['email'] = sponsor["email"]
                        item['sponser_name'] = sponsor["display_name"]
                        item['country_id'] = Country.objects.filter(id=sponsor["country_id"]).values()
                    else:
                        pass  
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
#name - user with warning list
#utility - returns list of workers with filter,search,sorting and pagination
class UserWarningListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = UserProfile.objects.filter(is_active=True).filter(Q(role_id="user") | Q(role_id="User")).order_by('-id')
            if search_field!=None:
                queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = UserSerializer(queryset, many=True)
                data = serializer.data
                #result = []
                # for item in data:
                #     desired_fields = {'id': item['id'], 'name': item['first_name']}
                #     result.append(desired_fields)
                for item in data:
                    item['country_id'] = Country.objects.filter(id=item["country_id"]).values()
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        

#name -  message list
#utility - returns list of messages with filter,search,sorting and pagination
class UserMessageListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = UserProfile.objects.filter(Q(role_id="user") | Q(role_id="User")).filter(is_active=True).order_by('-id')
            if search_field!=None:
                queryset = queryset.filter(Q(first_name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = UserSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    item['country_id'] = Country.objects.filter(id=item["country_id"]).values()
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        

#name -  gift list
#utility - returns list of gift with filter,search,sorting and pagination
class GiftListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = GiftGallery.objects.all().order_by('-id')
            if search_field!=None:
                queryset = queryset.filter(name__icontains=search_field)
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = GiftGallerySerializer(queryset, many=True)
                data = serializer.data
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        

#name -  top worker list
#utility - returns list of top worker with filter,search,sorting and pagination
class TopWorkerListAPIView(APIView):
    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            IsActiveFlag=TopWorker.objects.all().values("is_active")[0]["is_active"]
            print("IsActiveFlag",IsActiveFlag)
            if IsActiveFlag==False and (decoded_token["role_id"]!="admin"):
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
                
            from_date = request.data.get("from_date")
            to_date = request.data.get("to_date")
            if not from_date:
                 return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Insert start date'})
            if not to_date:
                 return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Insert end date'})
                
            extracted_data = []
            final_data = {}
            worker_data = CallSession.objects.filter(Q(start_datetime__range=(from_date, to_date)) &Q(is_active=True)).values()
            for entry in worker_data:
                extracted_entry = {
                    'vid': entry['vid'],
                    'call_started_by': entry['call_started_by_id'],
                    'call_received_by': entry['call_received_by_id'],
                    'call_earning': entry['call_earning']
                }
                extracted_data.append(extracted_entry)
            
            for item in extracted_data:
                if UserProfile.objects.filter( Q(id=item['call_started_by'], role_id='worker')).values():
                    if item['call_started_by'] in final_data.keys():
                        final_data[item['call_started_by']] += item['call_earning']
                    else:
                        final_data[item['call_started_by']] = item['call_earning']                      
                elif UserProfile.objects.filter( Q(id=item['call_received_by'], role_id='worker') ).values():
                    if item['call_received_by'] in final_data.keys():
                        final_data[item['call_received_by']] += item['call_earning']
                    else:
                        final_data[item['call_received_by']] = item['call_earning'] 
                else:
                    pass        
            sorted_data = sorted(final_data.items(), key=lambda x: x[1], reverse=True)
            top_three = sorted_data[:3]
            # print("top_three",top_three)
            data =[]
            for worker_id,call_earning in top_three:
                data_dict = {}
                worker =list(UserProfile.objects.filter(id=worker_id,role_id__in=["worker", "Worker"]).values("id","first_name","email","profile_image","country_id","image_url_link","online_date"))[0]                
                data_dict['worker_id'] = worker["id"]
                data_dict['first_name'] = worker["first_name"]
                data_dict['call_earning'] = call_earning
                data_dict['email']=  worker["email"]
                data_dict['image_url_link']=  worker["image_url_link"]
                data_dict['online_date']=  worker["online_date"]
                
                country = Country.objects.get(id =worker["country_id"])
                data_dict['country_name'] = country.name
                data_dict['country_flag_url'] = country.flag_url
                data_dict['is_gift_send'] = False
                data_dict['gift_credit'] = None
                admin_coin_alloted_objs = AdminCoinAlloted.objects.filter(worker_id=worker_id)
                if admin_coin_alloted_objs.exists():
                    admin_coin_alloted_obj = admin_coin_alloted_objs.first()
                    data_dict['gift_credit'] = admin_coin_alloted_obj.give_credit
                    data_dict['is_gift_send'] = True
                data.append(data_dict)
            if data:
                count = len(data)
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        

#name -  country list
#utility - returns list of country with filter,search,sorting and pagination
class CountryListAPIView(APIView):
    def get(self, request):
        try:
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = Country.objects.all().order_by('name')
            if search_field!=None:
                queryset = queryset.filter(name__icontains=search_field)
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = CountrySerializer(queryset, many=True)
                data = serializer.data
                result ={'code':status.HTTP_200_OK,'message': 'success',"count":count,"data" :data}
                return Response(data=result)
            else:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available','count':0,'data':[]})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        






'''list of payment request for perticular '''


class SponserPaymentRequestListAPIView(APIView):
    
    def get(self, request):
        try:
            # import pdb;pdb.set_trace()
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            sponser_id = int(request.GET.get("sponser_id"))

            if sponser_id == 0:
                return Response(data={'code':404,'message': 'Insert Sponser id'})
            
            queryset = PaymentRequest.objects.filter(is_active=True).filter(Q(request_status="accepted") | Q(request_status="draft") & Q(sponser_id=sponser_id) ).order_by('-payment_request_id')
            if search_field!=None:
                check_sponsor_ids = UserProfile.objects.filter(
                    Q(role_id="sponser") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_sponsor_ids:
                    queryset = queryset.filter(sponser_id__in=check_sponsor_ids)
                    count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0   
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = PamentRequestSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    sponser_id = item['sponser_id']
                    sponsor_query =UserProfile.objects.filter(id=sponser_id,role_id="sponser",is_active=True).values()
                    if sponsor_query.exists():
                        sponsor = list(sponsor_query.values("email", "display_name","country_id"))[0]
                        item['email'] = sponsor["email"]
                        item['sponser_name'] = sponsor["display_name"]
                        item['country_id'] = Country.objects.filter(id=sponsor["country_id"]).values()
                    else:
                        pass    

                result ={'code':status.HTTP_200_OK,'message': 'success',"count":count,"data" :data}
                return Response(data=result)
            else:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available','count':0,'data':[]})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        




'''payment history for perticular sponser'''

class SponserPaymentHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            sponser_id = int(request.GET.get("sponser_id",0))
            skip = limit*page-limit

            if sponser_id == 0:
                return Response(data={'code':404,'message': 'Insert Sponser id'})
            
            queryset = PaymentRequest.objects.filter(is_active=True , sponser_id=sponser_id, request_status="paid").order_by('-payment_request_id')
            
            
            if search_field!=None:
                check_sponsor_ids = UserProfile.objects.filter(
                    Q(role_id="sponser") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_sponsor_ids:
                    queryset = queryset.filter(sponser_id__in=check_sponsor_ids)
                    count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
                # count = queryset.count()
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = PamentRequestSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    sponser_id = item['sponser_id']
                    sponsor_query =UserProfile.objects.filter(id=sponser_id,role_id__in=["sponser", "Sponser"],is_active=True).values()
                    # item['sponser_name'] = sponser["first_name"]
                    if sponsor_query.exists():
                        sponsor = list(sponsor_query.values("email", "display_name","country_id"))[0]
                        item['email'] = sponsor["email"]
                        item['sponser_name'] = sponsor["display_name"]
                        item['country_id'] = Country.objects.filter(id=sponsor["country_id"]).values()
                    else:
                        pass  
                
                result ={'code':status.HTTP_200_OK,'message': 'success',"count":count,"data" :data}
                return Response(data=result)
            else:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available','count':0,'data':[]})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})       

class CountryCreateAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            json_file_path = os.path.join(settings.BASE_DIR, 'vid_user/country_file', 'countries.json')

            with open(json_file_path, 'r') as json_file:
                countries_data = json.load(json_file)
                
                for country_data in countries_data:
                    flg_code = country_data['Alpha2 Code'].lower()
                    flag_url = f"https://flagcdn.com/120x90/{flg_code}.png"
                    Country.objects.create(
                        id = country_data['country_id'],
                        name=country_data['Name'],
                        currency=country_data['Currencies Code'],
                        flag_url=flag_url,
                        code=country_data['Alpha2 Code'],
                        dial_code=country_data['Calling Code']
                    )
            
            return Response({'message':'added country successfully', 'code':201})    
        
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST}) 


class CreditCoinAPIView(APIView):

    def post(self,request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token["user_id"]
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

             
            
            credit_coin=request.data.get("credit_coin",None)
            is_customer = request.data.get("is_customer",None)
            amount = request.data.get("amount",None)
            
            message = get_translation(language, 'please_provide_credit_coin_value')
            if not credit_coin:
                return Response({'message':message, 'code':200})
            
            message = get_translation(language, 'please_provide_amount_value')
            if not amount:
                return Response({'message': message, 'code': 200})
            
            existing_coin = CoinManagement.objects.filter(
                credit_coin=credit_coin,
                is_customer=is_customer
            ).exists()
            
            message = get_translation(language, 'create_coin_already_exists')
            if existing_coin:
                return Response({'message':message , 'code': status.HTTP_208_ALREADY_REPORTED})
          
            existing_coin = CoinManagement.objects.filter(
                is_customer=is_customer,
                amount=amount
            ).exists()
            
            message = get_translation(language, 'create_amount_already_exists')
            if existing_coin:
                return Response({'message': message, 'code': status.HTTP_208_ALREADY_REPORTED})
            
            serializer = CoinManagementSerializer(data={'credit_coin':credit_coin,'amount':amount,'is_customer':is_customer})
            if serializer.is_valid():
                serializer.save()
                message = get_translation(language, 'create_coin_successfully')
                return Response({'data':serializer.data,'message':message, 'code':201})
            else:
                return Response({'error':serializer.errors, 'code':status.HTTP_400_BAD_REQUEST})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
class UpdateCoinAPIView(APIView):

    def put(self,request,coin_id):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token

            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
                
            credit_coin=request.data.get("credit_coin")
            amount = request.data.get("amount")
            is_customer = request.data.get("is_customer",None)
            print("is_customer",is_customer)
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]
            ######################
            existing_coin = CoinManagement.objects.filter(
                amount=amount,is_customer=is_customer
            ).exists()
            print("amount",amount)
            message = get_translation(language, 'update_amount_already_exists')
            if existing_coin:
                print("amount",amount)
                return Response({'message': message, 'code': status.HTTP_208_ALREADY_REPORTED})
            
            existing_coin = CoinManagement.objects.filter(
                credit_coin=credit_coin,is_customer=is_customer
            ).exists()
            
            message = get_translation(language, 'update_coin_already_exists')
            if existing_coin:
                return Response({'message':message , 'code': status.HTTP_208_ALREADY_REPORTED})
            
            # existing_coin = CoinManagement.objects.filter(
            #     amount=amount
            # ).exists()
            # print("amount",amount)
            # message = get_translation(language, 'create_amount_already_exists')
            # if existing_coin:
            #     print("amount",amount)
            #     return Response({'message': message, 'code': status.HTTP_208_ALREADY_REPORTED})
            #######################
            try:
                CoinManagementObj = CoinManagement.objects.get(id=coin_id)
            except CoinManagement.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'coin not found'})
            
            # Create a serializer instance with the existing object and data from the request
            serializer = CoinManagementSerializer(CoinManagementObj, data=request.data, partial=True)
             # Validate the serializer
            if serializer.is_valid():
                # Save the updated data
                serializer.save()
                message = get_translation(language, 'coin_credit_updated_successfully')
                return Response({'message': message, 'code': 200})
            else:
                return Response({'error':serializer.errors, 'code':status.HTTP_400_BAD_REQUEST})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class DeleteCoinAPIView(APIView):
       
    def delete(self, request,coin_id):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1] 

            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256']) 
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

            
            CoinManagementObj = CoinManagement.objects.filter(id=coin_id, is_active=True).first()
            if not CoinManagementObj:
                return Response({'code': status.HTTP_404_NOT_FOUND, 'error': 'Coin not found or already inactive'})
            
            CoinManagementObj.is_active = False
            CoinManagementObj.delete()
            
            message = get_translation(language, 'coin_delete')
            return Response({'code':200,'message': message})       
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
    
    
class CreatefrequentquestionanswerAPIView(APIView):

    def post(self,request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

            
            question=request.data.get("question",None)
            if not question:
                return Response({'message':'Please provide question', 'code':200})
            answer = request.data.get("answer",None)
            if not answer:
                return Response({'message':'Please provide answer', 'code':200})
            #sequence = request.data.get('sequence',None)
            # if not sequence:
            #     return Response({'message':'Please provide sequence value for question', 'code':200})
             # Get the current maximum sequence number
            max_sequence = FrequentQA.objects.aggregate(models.Max('sequence'))['sequence__max']
            
            # Calculate the new sequence for the new record
            sequence = (max_sequence or 0) + 1
           
            serializer = FrequentQASerializer(data={'question':question,'answer':answer,'sequence':sequence})
            if serializer.is_valid():
                serializer.save()
                message = get_translation(language, 'faq_create')
                return Response({'data':serializer.data,'message':message, 'code':201})
            else:
                return Response({'error':serializer.errors, 'code':status.HTTP_400_BAD_REQUEST})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
class UpdatefrequentquestionanswerAPIView(APIView):

    def put(self,request,fqa_id):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
      
            new_sequence = request.data.get('sequence')   
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

                     
            try:
                frequent_qa_obj = FrequentQA.objects.get(id=fqa_id)
            except FrequentQA.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Frequent QA not found'})
            
            # Get the old sequence before updating
            old_sequence = frequent_qa_obj.sequence

            # Update the sequence for the specified FrequentQA object
            frequent_qa_obj.sequence = new_sequence
            frequent_qa_obj.save()
            if new_sequence > old_sequence:
                FrequentQA.objects.filter(sequence__gt=old_sequence, sequence__lte=new_sequence).exclude(id=fqa_id).update(sequence=models.F('sequence') - 1)
            else:
                FrequentQA.objects.filter(sequence__lt=old_sequence, sequence__gte=new_sequence).exclude(id=fqa_id).update(sequence=models.F('sequence') + 1)

            serializer = FrequentQASerializer(frequent_qa_obj)
            
            message = get_translation(language, 'faq_update')
            return Response({'message': message, 'data': serializer.data, 'code': status.HTTP_200_OK})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class UpdateFrequentQAAPIView(APIView):

    def put(self,request,fqa_id):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

            
            question = request.data.get('question')
            answer = request.data.get('answer')
            try:
                FrequentQAObj = FrequentQA.objects.get(id=fqa_id)
            except FrequentQA.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Frequent QA not found'})
            # Create a serializer instance with the existing object and data from the request
            serializer = FrequentQASerializer(FrequentQAObj, data=request.data, partial=True)
             # Validate the serializer
            if serializer.is_valid():
                # Save the updated data
                serializer.save()
                
                message = get_translation(language, 'faq_update')
                return Response({'message': message, 'code': 200})
            else:
                return Response({'error':serializer.errors, 'code':status.HTTP_400_BAD_REQUEST})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
class DeletefrequentquestionanswerAPIView(APIView):
       
    def delete(self, request,fqa_id):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1] 
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]


            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256']) 
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            FrequentQAObj = FrequentQA.objects.filter(id=fqa_id, is_active=True).first()
            if not FrequentQAObj:
                return Response({'code': status.HTTP_404_NOT_FOUND, 'error': 'frequent question answer not found or already inactive'})
            
            FrequentQAObj.is_active = False
            FrequentQAObj.save()

            message = get_translation(language, 'faq_delete')
            
            return Response({'code':200,'message': message})       
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
#name -  frequent question answer list
#utility - returns list of frequent question answer with filter,search,sorting and pagination
class frequentquestionanswerlistAPIView(APIView):
    def get(self, request):
        try:
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = FrequentQA.objects.filter(is_active=True).order_by('sequence')
            if search_field!=None:
                queryset = queryset.filter(sequence__icontains=search_field)
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = FrequentQASerializer(queryset, many=True)
                data = serializer.data
                result ={'code':status.HTTP_200_OK,'message': 'success',"count":count,"data" :data}
                return Response(data=result)
            else:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available','count':0,'data':[]})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
class BinanceWebhook(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            # data=request.data
            # temp=Temptable()
            # temp.json_data=data
            # temp.save()
            
            
            data = request.data
            
            
            buy_credit_obj = BuyCredit.objects.filter(buy_credit_id=data["order_id"],payment_add=False).values().exists()
            
            if buy_credit_obj == True :
                
                buy_credit_obj = BuyCredit.objects.get(buy_credit_id=data["order_id"])
                
                
                
                if data["status"] == "cancel": 
                    buy_credit_obj.status = "failed"
                    buy_credit_obj.save()
                    
                elif data["status"] == "paid":
                    buy_credit_obj.status = "success"
                    buy_credit_obj.payment_add=True
                    buy_credit_obj.save()
                    buy_data=list(BuyCredit.objects.filter(buy_credit_id = data["order_id"]).values("coin_alloted","customer_id"))[0]
                   
                    total_earn_coin= list(UserProfile.objects.filter(id=buy_data["customer_id"]).values("total_earn_coin"))[0]["total_earn_coin"]
                   
                    
                    queryset=UserProfile.objects.filter(id=buy_data["customer_id"]).update(total_earn_coin=total_earn_coin+ buy_data["coin_alloted"])
             
                elif data["status"] == "process" or data["status"] == "check":
                    buy_credit_obj.status = "pending"
                    buy_credit_obj.save()

                else: 
                    buy_credit_obj.status = "failed"
                    buy_credit_obj.save()
                return Response({'message':"Webhook url binance account"}, status=status.HTTP_200_OK)
            else:
                return Response({'message':"Webhook url binance account"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'message': str(e)}, status=400) 
        
class BinancePaymentCancelUrl(APIView):
    # authentication_classes=()
    # permission_classes=()

    def get(self, request):
        try:
            
            
            # data = request.GET.get("data",None)
            # # print("cancel_url_hit",data)
            
            # secret_key = config('SECRET_KEY') # Assuming the token is in the 'Authorization' header
            # try:
            #     decoded_token = jwt.decode(data,secret_key, algorithms=['HS256'])  # Decode the JWT token
            #     order_id = decoded_token["order_id"]
            #     query_set=BuyCredit.objects.filter(buy_credit_id=order_id).update(status="failed")
                
            # except jwt.ExpiredSignatureError:
            #     return render(request, 'invalid_url.html')
            # except jwt.InvalidTokenError:
            #     return render(request, 'invalid_url.html')
            
            # return Response({'message':"binance payment cancel url is hit"}, status=status.HTTP_200_OK)
            return render(request, 'cancel_page.html')
           
        except Exception as e:
            return Response(data={'message': str(e)}, status=400) 

class BinancePaymentSuccessUrl(APIView):
    # authentication_classes=()
    # permission_classes=()

    def get(self, request):
        try:
            # data = request.GET.get("data",None)
            # # print("cancel_url_hit",data)
            
            # secret_key = config('SECRET_KEY') # Assuming the token is in the 'Authorization' header
            # try:
            #     decoded_token = jwt.decode(data,secret_key, algorithms=['HS256'])  # Decode the JWT token
            #     order_id = decoded_token["order_id"]
            #     query_set=BuyCredit.objects.filter(buy_credit_id=order_id).update(status="success")
            #     buy_credit_obj = list(BuyCredit.objects.filter(buy_credit_id=order_id).values("customer_id","coin_alloted"))[0] 
            #     customer_id = buy_credit_obj["customer_id"]
            #     coin_alloted = buy_credit_obj["coin_alloted"]
            #     user_obj = UserProfile.objects.get(id=customer_id)
            #     user_obj.total_earn_coin += coin_alloted
            #     user_obj.save()
            # except jwt.ExpiredSignatureError:
            #     return render(request, 'invalid_url.html')
            # except jwt.InvalidTokenError:
            #     return render(request, 'invalid_url.html')
            
            # return Response({'message':"binance payment cancel url is hit"}, status=status.HTTP_200_OK)
            return render(request, 'success_page.html')
           
        except Exception as e:
            return Response(data={'message': str(e)}, status=400)         
        
class AddWarningForUser(APIView):
     def post(self,request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                admin_id = decoded_token["user_id"]
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            user_id=request.data.get("user_id",None)
            report_id=request.data.get("report_id",None)
            print("report_id",report_id)
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

            
            if not user_id:
                message = get_translation(language, 'please_provide_user_id') 
                return Response({'message':message, 'code':200})
            try:
                user_profile_obj = UserProfile.objects.get(id=user_id)
            except UserProfile.DoesNotExist:
                message = get_translation(language, 'user_does_not_exist') 
                return Response({"error": message, 'code': 404})
            
            reason = request.data.get("reason",None)
            create_date_time = request.data.get("create_date_time",None)
            amount = request.data.get("amount",None)

            total_warning = user_profile_obj.total_warning
            
            previous_warning = user_profile_obj.total_warning
            serializer = WarningSerializer(data={'admin_id':admin_id,'user_id':user_id,"report_id":report_id,'reason':reason,'create_date_time':create_date_time,'amount':amount,'previous_warning':previous_warning})
            if serializer.is_valid():
                serializer.save()
                total_warning+=1
                user_profile_obj.total_warning = total_warning
                user_profile_obj.block_call_date_time = serializer.data["create_date_time"]  
                user_profile_obj.last_warning_datetime = serializer.data["create_date_time"]  
                total_earn_coin = user_profile_obj.total_earn_coin
                
                if amount:
                    new_coin = total_earn_coin - amount
                    user_profile_obj.total_earn_coin = new_coin
                    
                    server_base_url = config('SERVER_BASE_URL')
                    logo =server_base_url+'/media/email_images/logo.png'
                    print("logo",logo)
                    create_date_str=serializer.data["create_date_time"]
                    print("create_date_str",create_date_str)
                    create_date = datetime.strptime(create_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                    # Format the datetime as "09 April, 2024"
                    formatted_date = create_date.strftime("%d %B, %Y")
                    print("formatted_date",formatted_date)
                
                    user_email = user_profile_obj.email
                    
                    html_content = render_to_string('deductcoinfromuser.html', {'Display_name': user_profile_obj.first_name,'amount':amount,"create_date_str":formatted_date,"logo":logo})
                    send_email_background.delay(user_email, html_content)
                
                user_profile_obj.save()
                
                warning_obj = Warning.objects.get(warning_id = serializer.data["warning_id"])
                if total_warning == 1:
                    warning_obj.user_warning_action = "You will not be able to make calls for the next 24 hours."
                elif total_warning == 2:
                    warning_obj.user_warning_action = "You will not be able to make calls for the next 72 hours."
                elif amount:
                    warning_obj.amount=amount
                    warning_obj.user_warning_action = f"{amount} credits have been deducted from your wallet."
                warning_obj.save()
                report_id=request.data.get("report_id",None)
                queryset=Report.objects.filter(report_id=report_id).update(report_clear=True)

                data = WarningSerializer(warning_obj).data
                message = get_translation(language, 'warning_added_successfully') 
                return Response({'data':data,'message':message, 'code':201})
            else:
                return Response({'error':serializer.errors, 'code':status.HTTP_400_BAD_REQUEST})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class ReplyHelpAndSupportAPIView(APIView):
    def post(self,request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

        
            request_id=request.data.get("request_id",None)
            if not request_id:
                return Response({'message':'Please provide request id', 'code':200})
            
            reply_message = request.data.get("reply_message",None)
            if not reply_message:
                return Response({'message':'Please provide reply message', 'code':200})
            
            help_support_obj=HelpAndSupport.objects.get(id=request_id)
            help_support_obj.reply_message_by_admin = reply_message
            help_support_obj.is_checked_by_admin = True
            help_support_obj.save()
            
            ############# mail send ... ##############
            try:
                user_id=HelpAndSupport.objects.filter(id=request_id).values("user_id","message","reply_message_by_admin")[0]
                UserDetail=UserProfile.objects.filter(id=user_id["user_id"]).values("display_name","email","first_name")[0]
                server_base_url = config('SERVER_BASE_URL')
                logo =server_base_url+'/media/email_images/logo.png'
                user_email = UserDetail["email"]
                
                html_content = render_to_string('reply_answer.html', {'Display_name': UserDetail["first_name"],'question':user_id["message"],"answer":user_id["reply_message_by_admin"],"logo":logo})
                send_email_background_for_inquiry.delay(user_email, html_content)
            except:    
                pass
            ############################################    
            message = get_translation(language, 'reply_msg')
            return Response({'message':message, 'code':201})
         
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        

class GetHelpAndSupportListAPIView(APIView):
    def get(self, request):
        try:
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")

            queryset = HelpAndSupport.objects.filter(is_checked_by_admin=False,is_active =True).order_by('-id')
            
            if start_date!=None:
                queryset = queryset.filter(created_date_time__date__range=(start_date, end_date))
                count = queryset.count()
            if search_field!=None:
                queryset = queryset.filter(user_name__icontains=search_field)
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = HelpAndSupportSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    user_query =UserProfile.objects.filter(id=item['user_id']).values()
                    if user_query.exists():
                        user = list(user_query.values("email","role_id"))[0]
                        item['email'] = user["email"]
                        item['role'] = user["role_id"]
                   
                result ={'code':status.HTTP_200_OK,'message': 'success',"count":count,"data" :data}
                return Response(data=result)
            else:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available','count':0,'data':[]})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
#name - report list of user
#utility - returns list of report with filter,search,sorting and pagination
class ReportListOfUserAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            #queryset = Report.objects.filter(is_active=True).order_by('-report_id')
            queryset = Report.objects.filter(Q(user_id__isnull=False) & Q(sponser_id__isnull=True),report_clear=False).order_by('-report_id')
            
            if start_date!=None:
                queryset = queryset.filter(create_datetime__date__range = (start_date,end_date))
            if search_field!=None:
                check_user_id = list(UserProfile.objects.filter(Q(role_id="user") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field) | Q(country_id__name__icontains=search_field))).values("id"))[0]["id"]
                queryset = Report.objects.filter(user_id=check_user_id,is_active=True).order_by('-report_id')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = ReportSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker = list(UserProfile.objects.filter(id=item['worker_id'],role_id="worker",is_active=True).values("country_id", "display_name", "profile_image","email","total_warning","total_earn_coin"))
                    if worker:
                        worker = worker[0]
                        item['worker_name'] = worker["display_name"]
                        item['worker_profile_image'] = worker["profile_image"]
                        item['worker_email'] = worker["email"]
                        item['worker_total_warning'] = worker["total_warning"]
                        item['worker_total_earn_coin'] = worker["total_earn_coin"]
                        country_id = worker["country_id"]
                        country = Country.objects.get(id=country_id)
                        item['worker_country_name'] = country.name
                        item['worker_country_flag_url'] = country.flag_url
                    
                    user = list(UserProfile.objects.filter(id=item["user_id"],role_id="user",is_active=True).values("country_id","display_name","profile_image","email","total_warning","total_earn_coin"))
                    if user:
                        user = user[0]
                        item['user_name'] = user["display_name"]
                        item['user_profile_image'] = user["profile_image"]
                        item['user_email'] = user["email"]
                        item['user_total_warning'] = user["total_warning"]
                        item['user_total_earn_coin'] = user["total_earn_coin"]
                        country_id = user["country_id"]
                        country = Country.objects.get(id=country_id)
                        item['user_country_name'] = country.name
                        item['user_country_flag_url'] = country.flag_url
                        
                    report_attachment_obj = ReportAttachment.objects.filter(report_id=item["report_id"],is_active=True).values("file_image")
                    if report_attachment_obj:
                        report_attachment_obj = report_attachment_obj[0]
                        item['image_attachment_of_report'] = report_attachment_obj["file_image"]
                        #item['video_attachment_of_report'] = report_attachment_obj["video_link"]
                    else:
                        item['image_attachment_of_report'] = None
                        #item['video_attachment_of_report'] = None
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        
        
class DetailfrequentquestionanswerAPIView(APIView):

    def get(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        fqa_id = request.GET.get("fqa_id",None)
        if not fqa_id:
            return Response({'code':200,'message':"please provide id"})
        try:
            fqa_data=list(FrequentQA.objects.filter(id=fqa_id).values())[0]
            return Response({'code':200,'message':"success",'data':fqa_data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'code':500,"error": str(e)})
        
class GetCountofReportAndPaymentRequestAPIView(APIView):

    def get(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
        current_datetime = timezone.now().date()  # Get today's date
        current_datetime_new = arrow.get(current_datetime).format("YYYY-MM-DD")  # Format as string
        try:
            count_of_report = Report.objects.filter(report_clear=False).count()
            Sponsor_count = Report.objects.exclude(sponser_id=None).count()
            User_count = Report.objects.exclude(user_id=None).count()
            count_of_todays_report = Report.objects.filter(create_datetime__date=current_datetime_new).count()
            # count_of_todays_report = Report.objects.filter(
            #     create_datetime__date=current_datetime_new
            #     ).count()
            print("count_of_todays_report",count_of_todays_report)
            count_of_payment_request = PaymentRequest.objects.filter(request_status="draft").count()
            
            count_of_worker_pending_request = UserProfile.objects.filter(
                is_active=True,
                role_id="worker",
                account_approval_state="none"
            ).count()
            
            count_of_worker_request = UserProfile.objects.filter(date_joined__date=current_datetime_new,
                is_active=True,
                role_id="worker",
                account_approval_state="none"
            ).count()
            
            total_amount = BuyCredit.objects.filter(create_date_time__date=current_datetime_new,status="success",is_active=True).aggregate(total=Sum('amount'))
            # Check and replace counts with 0 if they are empty
            count_of_report = count_of_report if count_of_report else 0
            count_of_payment_request = count_of_payment_request if count_of_payment_request else 0
            count_of_worker_request = count_of_worker_request if count_of_worker_request else 0
            count_of_worker_pending_request = count_of_worker_pending_request if count_of_worker_pending_request else 0
            total = total_amount['total'] if total_amount['total'] is not None else 0


            # Prepare count dictionary
            count = {
                "Report_count": count_of_report,
                "Todays_report_count":count_of_todays_report,
                "Sponsor_count":Sponsor_count,
                "User_count":User_count,
                "Payment_request_count": count_of_payment_request,
                
                "worker_request_count": count_of_worker_request,
                "worker_pending_request_count": count_of_worker_pending_request,
                
                "today_collection": total
            }
            return Response({'code': 200, 'message': "success", 'data': count}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(data={'data':{},'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        
from .push_notification import push_notification
class PushNotifyVideoCallingAPIView(APIView):

    def post(self,request):
        try:
            
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token

            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
                
            # user_id = request.data.get("user_id")
            # channelname = request.data.get("channelname")
            # receiver_id = request.data.get("receiver_id")
            data =request.data
            
            receiver_id=int(data.get('receiver_id'))
            # print(receiver_id,type(receiver_id))
            caller_id=int(data.get('user_id'))
            
            agora_app_id = config('AGORA_ID')
            
            agora_app_certificate = config('AGORA_APP_CERTIFICATE')
            channelname = data.get('channelname')
            uid = 0#data.get('uid')
            role = 1#data.get('role')
            expiration_time_in_seconds = 86400 #data.get('expiration_time_in_seconds') #expire in 1 day 
            currentTimestamp = math.floor(datetime.now().timestamp())
            privilegeExpiredTs = currentTimestamp + expiration_time_in_seconds
            
            server_key = config('SERVER_KEY')
       
            device_id=list(UserProfile.objects.filter(id=receiver_id).values("device_id"))[0]["device_id"]
            
            # print("device_id---------------------",device_id)
            callerroom = data.get('callerroom')
            if callerroom:
                token = RtcTokenBuilder.buildTokenWithUid(agora_app_id, agora_app_certificate, callerroom, uid, role, privilegeExpiredTs)
                # print("token :::::: ",token)
                if token:
                    data.update({"agora_token":token})
            else:
                token = RtcTokenBuilder.buildTokenWithUid(agora_app_id, agora_app_certificate, channelname, uid, role, privilegeExpiredTs)
                # print("token :::::: ",token)
                if token:
                    data.update({"agora_token":token})
                
            event_name=data.get('event_name')
            if event_name == "incoming_call":
                
                user_obj = UserProfile.objects.get(id=caller_id)
                role_id = user_obj.role_id
                if role_id == "worker":
                    
                    is_demo_call=True
                    datadetail=list(UserProfile.objects.filter(id=receiver_id).values())[0]
                    totalcoin=datadetail["total_earn_coin"]
                    first_call_date=datadetail["first_call_date"]
                    if first_call_date == None:
                        UserProfile.objects.filter(id=receiver_id).update(first_call_date=datetime.now(timezone.utc).date())
                        
                    datadetailcaller=list(UserProfile.objects.filter(id=caller_id).values())[0]
                    caller_first_call_date=datadetailcaller["first_call_date"]
                    if caller_first_call_date == None:
                        UserProfile.objects.filter(id=caller_id).update(first_call_date=datetime.now(timezone.utc).date())    
                        
                        
                else:
                    is_demo_call=False
                    
                    datadetail=list(UserProfile.objects.filter(id=caller_id).values())[0]
                    totalcoin=datadetail["total_earn_coin"]
                    first_call_date=datadetail["first_call_date"]
                    if first_call_date == None:
                        UserProfile.objects.filter(id=caller_id).update(first_call_date=datetime.now(timezone.utc).date())
                    
                    recedatadetail=list(UserProfile.objects.filter(id=receiver_id).values())[0]
                    recefirst_call_date=recedatadetail["first_call_date"]
                    if recefirst_call_date == None:
                        UserProfile.objects.filter(id=receiver_id).update(first_call_date=datetime.now(timezone.utc).date())
                            
                    if totalcoin <=0:
                        return Response({'code':400,'message':'No Sufficient Credit'}, status=status.HTTP_200_OK)
                    
                    # deduction_amount =  Decimal('1.00')
                    # totalcoin = totalcoin-deduction_amount
                    
                    # warning_date_time = datadetail["block_call_date_time"]
                    # total_warning = datadetail["total_warning"]
                    # if warning_date_time and total_warning==2:
                    #     given_date = datetime.fromisoformat(str(warning_date_time))
                    #     current_time = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
                    #     end_block_time = given_date + timedelta(days=1)
                        
                    #     if current_time >= end_block_time:
                    #         UserProfile.objects.filter(id=caller_id).update(total_warning=0)
                    #         total_warning=0
                        
                    #     if current_time <= given_date <= end_block_time:
                    #         return Response({'code': 400, 'message': 'Call not allowed for the next 24 hours'}, status=200)
                    # if warning_date_time and total_warning==3:
                    #     given_date = datetime.fromisoformat(str(warning_date_time))
                    #     current_time = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
                    #     end_block_time = given_date + timedelta(days=3)
                    #     if current_time >= end_block_time:
                    #         UserProfile.objects.filter(id=caller_id).update(total_warning=0)
                    #         total_warning = 0
                            
                    #     if current_time <= given_date <= end_block_time:
                    #         return Response({'code': 400, 'message': 'Call not allowed for the next 72 hours'}, status=200)
                       
                CallObj=CallSession()
                CallObj.call_started_by=UserProfile.objects.get(id=caller_id)
                CallObj.call_received_by=UserProfile.objects.get(id=receiver_id)
                CallObj.is_demo_call=is_demo_call
                CallObj.call_count = 0
                # CallObj.duration = CallObj.duration 
                CallObj.save()
                
                coin_management=CoinManagement.objects.filter(is_active=True).values()
                data.update({"CallId":CallObj.vid})
            # else:
            #     CallObj=CallSession.objects.filter(call_started_by = caller_id,call_received_by = receiver_id).first()
            #     print("CallObj.vid ::: ",CallObj.vid)

            # print("data ::::::::",data)
            if device_id != None:
                push_notification(server_key,device_id,data)
            else:
                return Response(data={"code":200,"msg":"Push Notification Send Successfully"},status=200)  
               
            return Response(data={"code":200,"msg":"Push Notification Send Successfully"},status=200)
        except Exception as e:
            return Response(data={"code":200,"msg":"Push Notification Send Successfully"},status=200)                
        
class UsersListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            queryset = UserProfile.objects.filter(is_active=True).filter(Q(role_id="user") | Q(role_id="User")).order_by('-id')
            if start_date!=None:
                queryset = queryset.filter(date_joined__date__range=(start_date, end_date))
            if search_field!=None:
                queryset = queryset.filter(Q(email__icontains=search_field) | Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field)) 
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = UserSerializer(queryset, many=True)
                data = serializer.data
                #result = []
                # for item in data:
                #     desired_fields = {'id': item['id'], 'name': item['first_name']}
                #     result.append(desired_fields)
                for item in data:
                    item['country_id'] = Country.objects.filter(id=item["country_id"]).values()
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class ViewReceiptAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def get(self, request,id):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']  # Extract the user_id from the decoded token
                receipt_image=list(PaymentRequest.objects.filter(payment_request_id=id).values())[0]["receipts_image"]
                 
                return Response({'data':receipt_image,'code':status.HTTP_200_OK,'message': 'success'}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'message': str(e)}, status=400) 
        
        
class WorkerListAcceptedByAdminAPIView(APIView):
        
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            sponser_id = request.GET.get("sponser_id")
            payment_request_id = request.GET.get("payment_request_id")
         
            queryset  = RequestCoinClaim.objects.filter(sponser_id=sponser_id,payment_request_id=payment_request_id).order_by('-request_id')
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field) | Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_worker_ids:
                    queryset = queryset.filter(worker_id__in=check_worker_ids)
                    count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 

                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
                # count = queryset.count() 
   
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = RequestCoinClaimSerializer(queryset, many=True)
                data = serializer.data
                total_amount = 0.00
                for item in data:
                    worker_id = item['worker_id']
                    worker_query =UserProfile.objects.filter(id=worker_id,role_id="worker",is_active=True).values()
                    if worker_query.exists():
                        worker = list(worker_query.values("email", "display_name","country_id"))[0]
                        item['worker_email'] = worker["email"]
                        item['worker_name'] = worker["display_name"]
                        item['worker_country_id'] = Country.objects.filter(id=worker["country_id"]).values()
                    else:
                        pass    
                    amount = float(item["amount"])
                    total_amount += amount
                result ={"data" :data,"count":count,'total_amount':total_amount,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})


       
class UsersAmountDeductionHistoryAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            queryset = Warning.objects.filter(is_active=True,amount__isnull=False).order_by('-warning_id')
            if search_field!=None:
                check_user_ids = UserProfile.objects.filter(
                    Q(role_id="user") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_user_ids:
                    queryset = queryset.filter(user_id__in=check_user_ids)
                    count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = WarningSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    user_query =UserProfile.objects.filter(id=item['user_id']).values()
                    if user_query.exists():
                        user = list(user_query.values("email", "display_name","country_id"))[0]
                        item['user_email'] = user["email"]
                        item['user_name'] = user["display_name"]
                        item['user_country_id'] = Country.objects.filter(id=user["country_id"]).values()
                    else:
                        pass    
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        

# http://127.0.0.1:8000/vid_user/prohibitedbank/create/
# {
#     "CountryId":244,
#     "prohibitedbankcodelist":["0102","0163","0166","0175","0177","0601"]
# }

class ProhibitedBankCreateAPIView(APIView):
    authentication_classes=()
    permission_classes=()
    
    def post(self,request):
        try:
            
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']  # Extract the user_id from the decoded token

            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

        
        
            CountryId = request.data.get("CountryId")
            # print("CountryId",CountryId)
            country_id=Country.objects.get(id=CountryId)
            
            prohibitedbankcodelist = request.data.get("prohibitedbankcodelist")
            # print("prohibitedbankcodelist",prohibitedbankcodelist,type(prohibitedbankcodelist))
            alreadyExist=[]
            for bankcode in prohibitedbankcodelist:
                codedetail=list(prohibitedbank.objects.filter(country_id=country_id,prohibitedbankcode=int(bankcode)).values())
                # print("codedetail",codedetail)
                if codedetail:
                    alreadyExist.append(codedetail[0])
                else:
                    prohibbank=prohibitedbank()
                    prohibbank.country_id=country_id
                    prohibbank.prohibitedbankcode=bankcode
                    prohibbank.save()
                    country_id.prohibited_bank_exist=True
                    country_id.save()
                    
            if alreadyExist:
                message = get_translation(language, 'prohibited_code_added_successfully_except_this_record_already_exist')
                return Response(data={"code":200,"message":message,"alreadyExist":alreadyExist},status=200)
            
            message = get_translation(language, 'prohibited_bank_code_added_successfully')
            return Response(data={"code":200,"message":message},status=200)
 
        except Exception as e:
                return Response(data={"code":400,"message":f"{e}"},status=200)               
    

# http://127.0.0.1:8000/vid_user/prohibitedbank/update/
# {
#     "CountryId":244,
#     "prohibitedbankcodelist":["0102","0163","0166","0175","0177","0601"]
# }
class ProhibitedBankUpdateAPIView(APIView):
    authentication_classes=()
    permission_classes=()
    
    def post(self,request):
        try:
            
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']  # Extract the user_id from the decoded token

            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            CountryId = request.data.get("CountryId")
            # print("CountryId",CountryId)
            country_id=Country.objects.get(id=CountryId)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

            prohibitedbankcodelist = request.data.get("prohibitedbankcodelist")
            
            codedetail=prohibitedbank.objects.filter(country_id=country_id).delete()
            print("codedetail",codedetail)

            for bankcode in prohibitedbankcodelist:

                new_prohibited_bank = prohibitedbank(country_id=country_id, prohibitedbankcode=bankcode)
                new_prohibited_bank.save()
                    
            message = get_translation(language, 'prohibited_bank_code_updated_successfully')        
            return Response(data={"code":200,"message":message},status=200)
 
        except Exception as e:
                return Response(data={"code":400,"message":f"{e}"},status=200)         
            
class ProhibitedBanklistAPIView(APIView):
    authentication_classes=()
    permission_classes=()
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            CountryId = request.GET.get("CountryId",None) 
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            if CountryId:
                queryset = prohibitedbank.objects.filter(is_active=True,country_id=CountryId).order_by("-id")
            else:
                queryset = prohibitedbank.objects.filter(is_active=True).order_by("-id")
                
            count = queryset.count()
            
            if search_field!=None:
                queryset = queryset.filter(Q(country_id__name__icontains=search_field) ) 
                count = queryset.count()
                
            if ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 


            result_dict = {}
            for item in queryset.values():
                country_id_id = item["country_id_id"]
                
                prohibitedbankcode = item["prohibitedbankcode"]
                if country_id_id in result_dict:
                    # If yes, append the prohibitedbankcode to the existing list
                    result_dict[country_id_id].append(prohibitedbankcode)
                else:
                    # If no, create a new list with the prohibitedbankcode and add it to the result_dict
                    result_dict[country_id_id] = [prohibitedbankcode]
            detail=[]
            for country_id_id, prohibitedbankcodes in result_dict.items():
                country_name=list(Country.objects.filter(id=country_id_id).values("name"))[0]["name"]
                detail.append({"countryDetail":{"country_id":country_id_id,"name":country_name},"prohibitedbankcodes":prohibitedbankcodes})
           
            # print("detail",detail.count())
            count=len(detail)
            if(page > 0):
                detail = detail[skip:skip+limit] if not queryset == None  else []
                
            result ={"data" :detail,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
            return Response(data=result)
        
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})       
        
        
        
class ReportForAdminAPIView(APIView):
    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            start_date = request.data.get("start_date")
            end_date = request.data.get("end_date")
            key = request.data.get("key")
            
            search_field = request.data.get("search",None)
            ordering_field = request.data.get("ordering",None)  
            sortingOrder = request.data.get("sortingOrder",None)  
            limit = int(request.data.get("limit",5)) 
            page = int(request.data.get("page",0))
            skip = limit*page-limit
                
            if key == "revenue":
                queryset = BuyCredit.objects.filter(create_date_time__date__range=(start_date, end_date),status="success",is_active=True).order_by('-buy_credit_id')
                count = queryset.count()
                if search_field!=None:
                    queryset = queryset.filter(Q(subject_line__icontains=search_field)) 
                    count = queryset.count()
                elif ordering_field!=None:
                    if sortingOrder=="asc":
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count()
                    else:
                        ordering_field="-"+ordering_field
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count() 
                else:
                    queryset = queryset.all() if queryset.exists() else None
                    count = queryset.count() if queryset is not None else 0
                if(page > 0):
                    queryset = queryset[skip:skip+limit] if not queryset == None  else []
                if queryset:
                    serializer = BuyCreditSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        customer_id = item['customer_id']
                        user_query =UserProfile.objects.filter(id=customer_id,role_id="user",is_active=True).values()
                        if user_query.exists():
                            user = list(user_query.values("email", "display_name","country_id","profile_image"))[0]
                            item['user_email'] = user["email"]
                            item['user_name'] = user["display_name"]
                            item['user_profile_image'] = user["profile_image"]
                            country = Country.objects.filter(id=user["country_id"]).values("name","flag_url")[0]
                            item['user_country_name'] = country["name"]
                            item['user_country_flag'] =  country["flag_url"]
                        else:
                            pass   
                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result)
                else:
                    return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
            elif key == "payment_request":
                queryset = PaymentRequest.objects.filter(Q(is_active=True),Q(request_status="draft"),Q(create_date_time__date__range=(start_date, end_date))).order_by('-payment_request_id')
                count =queryset.count()
                if search_field!=None:
                    queryset = queryset.filter(Q(subject_line__icontains=search_field)) 
                    count = queryset.count()
                elif ordering_field!=None:
                    if sortingOrder=="asc":
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count()
                    else:
                        ordering_field="-"+ordering_field
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count() 
                else:
                    queryset = queryset.all() if queryset.exists() else None
                    count = queryset.count() if queryset is not None else 0
                if(page > 0):
                    queryset = queryset[skip:skip+limit] if not queryset == None  else []
                if queryset:
                    serializer = PamentRequestSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        sponser_id = item['sponser_id']
                        sponsor_query =UserProfile.objects.filter(id=sponser_id,role_id="sponser",is_active=True).values()
                        if sponsor_query.exists():
                            sponsor = list(sponsor_query.values("email", "display_name","country_id"))[0]
                            item['email'] = sponsor["email"]
                            item['sponser_name'] = sponsor["display_name"]
                            country = Country.objects.filter(id=sponsor["country_id"]).values("name","flag_url")[0]
                            item['country_name'] = country["name"]
                            item['country_flag'] = country["flag_url"]
                        else:
                            pass    
                        sponser_binance_acc_id= item['sponser_binance_acc_id']
                        binance_account_query =BinanceAccount.objects.filter(binance_acc_id=sponser_binance_acc_id,is_active=True).values()
                        if binance_account_query.exists():
                            binance_account = list(binance_account_query.values("binance_pay_id"))[0]
                            item['sponser_binance_acc_id'] = binance_account["binance_pay_id"]
                        else:
                            pass    
                        payment_request_id = item['payment_request_id']
                        worker_count = RequestCoinClaim.objects.filter(payment_request_id=payment_request_id).count()
                        item["worker_count"] = worker_count

                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result)
                else:
                    return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
            elif key == "worker_request":
                queryset = UserProfile.objects.filter(is_active=True,date_joined__date__range=(start_date, end_date)).filter(Q(role_id="worker") | Q(role_id="Worker")).order_by('-id')
                count = queryset.count()
                if search_field!=None:
                    queryset = queryset.filter(Q(subject_line__icontains=search_field)) 
                    count = queryset.count()
                elif ordering_field!=None:
                    if sortingOrder=="asc":
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count()
                    else:
                        ordering_field="-"+ordering_field
                        queryset = queryset.order_by(ordering_field) 
                        count = queryset.count() 
                else:
                    queryset = queryset.all() if queryset.exists() else None
                    count = queryset.count() if queryset is not None else 0
                if(page > 0):
                    queryset = queryset[skip:skip+limit] if not queryset == None  else []
                if queryset:
                    serializer = UserSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        if item["country_id"]:
                            country =Country.objects.filter(id=item["country_id"]).values("name","flag_url")[0]
                            item['country_name'] = country["name"]
                            item['country_flag'] = country["flag_url"]
                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result, status=200)
                else:
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
   


from openpyxl import Workbook
import os

def dict_to_excel(dicts, filename):
    wb = Workbook()
    ws = wb.active

    if dicts:
        headers = dicts[0].keys()
        ws.append(list(headers))

        for row in dicts:
        # Convert each value to a string or a format Excel can handle
            row_values = []
            for value in row.values():
                if isinstance(value, list) or isinstance(value, dict):
                    # Convert lists and dicts to a string representation
                    value = str(value)
                elif value is None:
                    # Convert None to an empty string or leave as None
                    value = ''
                row_values.append(value)

            ws.append(row_values)

        # Ensure the directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        wb.save(filename)

        
class ExcelDownloadAPIView(APIView):
    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            start_date = request.data.get("start_date")
            end_date = request.data.get("end_date")
            key = request.data.get("key")
            if key == "revenue":
                queryset = BuyCredit.objects.filter(create_date_time__date__range=(start_date, end_date),status="success",is_active=True).order_by('-buy_credit_id')
                count = queryset.count()
                if queryset:
                    serializer = BuyCreditSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        customer_id = item['customer_id']
                        user_query =UserProfile.objects.filter(id=customer_id,role_id="user",is_active=True).values()
                        if user_query.exists():
                            user = list(user_query.values("email", "display_name","country_id","profile_image"))[0]
                            item['user_email'] = user["email"]
                            item['user_name'] = user["display_name"]
                            item['user_profile_image'] = user["profile_image"]
                            country = Country.objects.filter(id=user["country_id"]).values("name","flag_url")[0]
                            item['user_country_name'] = country["name"]
                            item['user_country_flag'] =  country["flag_url"]
                        else:
                            pass   
                    
                    filename = 'mydata.xlsx'
                    file_path = os.path.join(settings.MEDIA_ROOT, filename)
                    dict_to_excel(data, file_path)
                    file_url = os.path.join(settings.MEDIA_URL, filename)
                    base_url = config('SERVER_BASE_URL')
                    file_link =base_url+file_url
                    if file_link:
                        return Response(data={'url': file_link, 'code': status.HTTP_200_OK, 'message': 'Excel generated successfully.'})
                    else:
                        return Response(data={'code':400, 'message': 'Excel not generated.'})
                else:
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
            
            elif key == "payment_request":
                queryset = PaymentRequest.objects.filter(Q(is_active=True),Q(request_status="draft"),Q(create_date_time__date__range=(start_date, end_date))).order_by('-payment_request_id')
                count =queryset.count()
                if queryset:
                    serializer = PamentRequestSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        sponser_id = item['sponser_id']
                        sponsor_query =UserProfile.objects.filter(id=sponser_id,role_id="sponser",is_active=True).values()
                        if sponsor_query.exists():
                            sponsor = list(sponsor_query.values("email", "display_name","country_id"))[0]
                            item['email'] = sponsor["email"]
                            item['sponser_name'] = sponsor["display_name"]
                            country = Country.objects.filter(id=sponsor["country_id"]).values("name","flag_url")[0]
                            item['country_name'] = country["name"]
                            # item['country_flag'] = country["flag_url"]
                        else:
                            pass    
                        sponser_binance_acc_id= item['sponser_binance_acc_id']
                        binance_account_query =BinanceAccount.objects.filter(binance_acc_id=sponser_binance_acc_id,is_active=True).values()
                        if binance_account_query.exists():
                            binance_account = list(binance_account_query.values("binance_pay_id"))[0]
                            item['sponser_binance_acc_id'] = binance_account["binance_pay_id"]
                        else:
                            pass    
                        payment_request_id = item['payment_request_id']
                        worker_count = RequestCoinClaim.objects.filter(payment_request_id=payment_request_id).count()
                        item["worker_count"] = worker_count
                        # print("item",item)
                        item.pop("request_status", None)
                        item.pop("notify_payment_sent", None)
                        item.pop("receipts_image", None)
                        item.pop("is_active", None)
                        item.pop("paid_date", None)
                        item.pop("sponser_id", None) 
                        item.pop("sponser_bank_acc_id", None) 
                        item.pop("admin_id", None) 

                    filename = 'mydata.xlsx'
                    file_path = os.path.join(settings.MEDIA_ROOT, filename)
                    dict_to_excel(data, file_path)
                    file_url = os.path.join(settings.MEDIA_URL, filename)
                    base_url = config('SERVER_BASE_URL')
                    file_link =base_url+file_url
                    if file_link:
                        return Response(data={'url': file_link, 'code': status.HTTP_200_OK, 'message': 'Excel generated successfully.'})
                    else:
                        return Response(data={'code':400, 'message': 'Excel not generated.'})
                else:
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        
            elif key == "worker_request":
                
                queryset = UserProfile.objects.filter(is_active=True,date_joined__date__range=(start_date, end_date)).filter(Q(role_id="worker") | Q(role_id="Worker")).values("id","display_name","date_of_birth","gender","email","phone","registered_date","country_id").order_by('-id')
                print("queryset",queryset)
                if queryset:
                    # serializer = UserSerializer(queryset, many=True)
                    # data = serializer.data
                    for item in queryset:
                        if item["country_id"]:
                            country =Country.objects.filter(id=item["country_id"]).values("name","flag_url")[0]
                            item['country_name'] = country["name"]
                            # item['country_flag'] = country["flag_url"]
                            item.pop("country_id", None)        
                    filename = 'mydata.xlsx'
                    file_path = os.path.join(settings.MEDIA_ROOT, filename)
                    dict_to_excel(queryset, file_path)
                    file_url = os.path.join(settings.MEDIA_URL, filename)
                    base_url = config('SERVER_BASE_URL')
                    file_link =base_url+file_url
                    print("file_link",file_link)
                    if file_link:
                        return Response(data={'url': file_link, 'code': status.HTTP_200_OK, 'message': 'Excel generated successfully.'})
                    else:
                        return Response(data={'code':400, 'message': 'Excel not generated.'})
                else:
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
                
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
class AddAmountAPIView(APIView):
    def post(self,request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
        language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

        
        amount = request.data.get("amount")
        if not amount:
            message = get_translation(language, 'please_add_amount')
            return Response({'code':400,'message': message},status=200)
        
        exists = AdminEssentials.objects.filter(is_active=True).exists()
        if exists:
            message = get_translation(language, 'amount_already_exist')
            return Response({'code':400,'message': message},status=200)
        try:
            AdminEssentialsobj=AdminEssentials()
            AdminEssentialsobj.amount=amount
            AdminEssentialsobj.save()
            
            message = get_translation(language, 'amount_added_successfully')
            return Response(data={"code":200,"message":message},status=200)
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class UpdateAmountAPIView(APIView):
    def put(self,request,id):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
        language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

        
        amount = request.data.get("amount")
        if not amount:
            message = get_translation(language, 'please_provide_amount')
            return Response({'code':400,'message': message},status=200)
        
        try:
            AdminEssentialsobj=AdminEssentials.objects.get(id=id)
            AdminEssentialsobj.amount=amount
            AdminEssentialsobj.save()
            message = get_translation(language, 'amount_updated_successfully')
            return Response(data={"code":200,"message":message},status=200)
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
class DeleteAmountAPIView(APIView):
    def delete(self,request,id):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]
            
            try:
                AdminEssentialsobj = AdminEssentials.objects.get(id=id)
            except Exception as e:
                message = get_translation(language, 'admin_essentials_object_not_found')
                return Response({"message":message,'code':status.HTTP_400_BAD_REQUEST})
            
            AdminEssentialsobj.is_active = False
            AdminEssentialsobj.save()
            message = get_translation(language, 'amount_deleted_successfully')
            return Response(data={"code":200,"message":message},status=200)
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
class AmountListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            queryset = AdminEssentials.objects.filter(is_active=True).order_by('-id')
            if search_field!=None:
                queryset = queryset.filter(amount__icontains=search_field)
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = AdminEssentialsSerializer(queryset, many=True)
                data = serializer.data 
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})   

class ViewReportAPIView(APIView):
   def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            report_id = request.GET.get("report_id")
            if not report_id:
                return Response({'code':400,'message': 'Please provide report id'})
            
            queryset = Report.objects.get(report_id=report_id,is_active=True)
            if queryset:
                serializer = ReportSerializer(queryset)
                data = serializer.data 
                result ={"data" :data,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No report available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})  
        
        
#name - user with warning list
#utility - returns list of users with filter,search,sorting and pagination
class UserWarningHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            user_id =  request.GET.get("user_id") 
            if not user_id:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Please provide user Id'})
            
            queryset = Warning.objects.filter(user_id=user_id,is_active=True).order_by('-warning_id')
            if search_field!=None:
                check_user_id = list(UserProfile.objects.filter(Q(role_id="user") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))).values("id"))[0]["id"]
                queryset = queryset.filter(user_id=check_user_id,is_active=True).order_by('-warning_id')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = WarningSerializer(queryset, many=True)
                data = serializer.data
                
                for item in data:
                    # print("item",item)
                    user =list(UserProfile.objects.filter(id=item['user_id'],role_id__in=["user", "User"],is_active=True).values("country_id","display_name","email","phone","date_joined"))[0]
                    item['user_name'] = user["display_name"]
                    item['user_email'] = user["email"]
                    item['user_phone'] = user["phone"]
                    item['user_date_joined'] = user["date_joined"]
                    country = Country.objects.get(id =user["country_id"])
                    item['country_name'] = country.name
                    item['country_flag'] = country.flag_url
                    
                    if item["report_id"] !=None:
                        # print("report_id",item["report_id"])
                        report_data=list(Report.objects.filter(report_id=item["report_id"]).values("worker_id","sponser_id","user_id","content","subject_line","create_datetime"))[0]
                        # print("report_data",report_data)
                        workerdata =list(UserProfile.objects.filter(id=report_data['worker_id']).values("display_name","email"))[0]
                        # print("workerdata",workerdata)
                        
                        reportAttach =ReportAttachment.objects.filter(report_id=item["report_id"])
                        if reportAttach:
                        #    print("reportAttach",reportAttach.values("file_image")[0])
                           reportAttach=reportAttach.values("file_image")[0]["file_image"]
                        else:
                           reportAttach=None
                        item["report_id"]={"content":report_data["content"],"subject_line":report_data["subject_line"],"create_datetime":report_data["create_datetime"],"display_name":workerdata["display_name"],"email":workerdata["email"],"reportAttach":reportAttach}
                           
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
#name - user with call list
#utility - returns list of users with filter,search,sorting and pagination
class UserCallHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            user_id =  request.GET.get("user_id") 
            if not user_id:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Please provide user Id'})
            
            queryset = CallSession.objects.filter(Q(call_started_by=user_id) | Q(call_received_by=user_id),is_active=True).order_by('-vid')
            if search_field!=None:
                check_user_id = list(UserProfile.objects.filter(Q(role_id="user") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))).values("id"))[0]["id"]
                queryset = queryset.filter(user_id=check_user_id,is_active=True).order_by('-vid')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = CallSessionSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    
                    user1 =list(UserProfile.objects.filter(id=item['call_started_by'],is_active=True).values("role_id","country_id","display_name","email","phone","date_joined"))[0]
                    if  user1["role_id"]=="user":
                    
                        item['user_name'] = user1["display_name"]
                        item['user_email'] = user1["email"]
                        item['user_phone'] = user1["phone"]
                        item['user_date_joined'] = user1["date_joined"]
                        country = Country.objects.get(id =user1["country_id"])
                        item['user_country_name'] = country.name
                        item['user_country_flag'] = country.flag_url
                        
                    elif user1["role_id"]=="worker":
                        item['worker_name'] = user1["display_name"]
                        item['worker_email'] = user1["email"]
                        item['worker_phone'] = user1["phone"]
                        item['worker_date_joined'] = user1["date_joined"]
                        country = Country.objects.get(id =user1["country_id"])
                        item['worker_country_name'] = country.name
                        item['worker_country_flag'] = country.flag_url
                    
                    user2 =list(UserProfile.objects.filter(id=item['call_received_by'],is_active=True).values("role_id","country_id","display_name","email","phone","date_joined"))[0]
                    if  user2["role_id"]=="user":
                    
                        item['user_name'] = user2["display_name"]
                        item['user_email'] = user2["email"]
                        item['user_phone'] = user2["phone"]
                        item['user_date_joined'] = user2["date_joined"]
                        country = Country.objects.get(id =user2["country_id"])
                        item['user_country_name'] = country.name
                        item['user_country_flag'] = country.flag_url
                        
                    elif user2["role_id"]=="worker":
                        item['worker_name'] = user2["display_name"]
                        item['worker_email'] = user2["email"]
                        item['worker_phone'] = user2["phone"]
                        item['worker_date_joined'] = user2["date_joined"]
                        country = Country.objects.get(id =user2["country_id"])
                        item['worker_country_name'] = country.name
                        item['worker_country_flag'] = country.flag_url
                    
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
#name - user with credit history list
#utility - returns list of users with filter,search,sorting and pagination
class UserCreditHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            user_id =  request.GET.get("user_id") 
            if not user_id:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Please provide user Id'})
            
            queryset = BuyCredit.objects.filter(customer_id=user_id,is_active=True).order_by('-buy_credit_id')
            if search_field!=None:
                check_user_id = list(UserProfile.objects.filter(Q(role_id="user") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field))).values("id"))[0]["id"]
                queryset = queryset.filter(Q(call_started_by=check_user_id) | Q(call_received_by=check_user_id),is_active=True).order_by('-vid')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = BuyCreditSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    user =list(UserProfile.objects.filter(id=item['customer_id'],role_id__in=["user", "User"],is_active=True).values("country_id","display_name","email","phone","date_joined"))[0]
                    item['user_name'] = user["display_name"]
                    item['user_email'] = user["email"]
                    item['user_phone'] = user["phone"]
                    item['user_date_joined'] = user["date_joined"]
                    country = Country.objects.get(id =user["country_id"])
                    item['country_name'] = country.name
                    item['country_flag'] = country.flag_url
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
#name - user with call list
#utility - returns list of workers with filter,search,sorting and pagination
class WorkerCallHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            worker_id =  request.GET.get("worker_id") 
            if not worker_id:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Please provide worker Id'})
            
            queryset = CallSession.objects.filter(Q(call_started_by=worker_id) | Q(call_received_by=worker_id),is_active=True).order_by('-vid')
            if search_field!=None:
                check_worker_id = list(UserProfile.objects.filter(Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))).values("id"))[0]["id"]
                queryset = queryset.filter(user_id=check_worker_id,is_active=True).order_by('-vid')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = CallSessionSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    user1 =list(UserProfile.objects.filter(id=item['call_started_by'],is_active=True).values("role_id","country_id","display_name","email","phone","date_joined"))[0]
                    if  user1["role_id"]=="user":
                    
                        item['user_name'] = user1["display_name"]
                        item['user_email'] = user1["email"]
                        item['user_phone'] = user1["phone"]
                        item['user_date_joined'] = user1["date_joined"]
                        country = Country.objects.get(id =user1["country_id"])
                        item['user_country_name'] = country.name
                        item['user_country_flag'] = country.flag_url
                        
                    elif user1["role_id"]=="worker":
                        item['worker_name'] = user1["display_name"]
                        item['worker_email'] = user1["email"]
                        item['worker_phone'] = user1["phone"]
                        item['worker_date_joined'] = user1["date_joined"]
                        country = Country.objects.get(id =user1["country_id"])
                        item['worker_country_name'] = country.name
                        item['worker_country_flag'] = country.flag_url
                    
                    user2 =list(UserProfile.objects.filter(id=item['call_received_by'],is_active=True).values("role_id","country_id","display_name","email","phone","date_joined"))[0]
                    if  user2["role_id"]=="user":
                    
                        item['user_name'] = user2["display_name"]
                        item['user_email'] = user2["email"]
                        item['user_phone'] = user2["phone"]
                        item['user_date_joined'] = user2["date_joined"]
                        country = Country.objects.get(id =user2["country_id"])
                        item['user_country_name'] = country.name
                        item['user_country_flag'] = country.flag_url
                        
                    elif user2["role_id"]=="worker":
                        item['worker_name'] = user2["display_name"]
                        item['worker_email'] = user2["email"]
                        item['worker_phone'] = user2["phone"]
                        item['worker_date_joined'] = user2["date_joined"]
                        country = Country.objects.get(id =user2["country_id"])
                        item['worker_country_name'] = country.name
                        item['worker_country_flag'] = country.flag_url
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
       
#name - worker with payment history list
#utility - returns list of workers with filter,search,sorting and pagination
class WorkerPaymentHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            worker_id =  request.GET.get("worker_id") 
            if not worker_id:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Please provide worker Id'})
            
            queryset = RequestCoinClaim.objects.filter(worker_id=worker_id,request_status="paid",is_active=True).order_by('-request_id')
            if search_field!=None:
                check_worker_id = list(UserProfile.objects.filter(Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))).values("id"))[0]["id"]
                queryset = queryset.filter(user_id=check_worker_id,is_active=True).order_by('-request_id')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = RequestCoinClaimSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],role_id__in=["worker", "Worker"],is_active=True).values("country_id","display_name","email","phone","date_joined"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_email'] = worker["email"]
                    item['worker_phone'] = worker["phone"]
                    item['worker_date_joined'] = worker["date_joined"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag'] = country.flag_url
                    
                    sponsor =list(UserProfile.objects.filter(id=item['sponser_id'],role_id__in=["sponser", "Sponser"],is_active=True).values("country_id","display_name","email","phone","date_joined"))[0]
                    item['sponsor_name'] = sponsor["display_name"]
                    item['sponsor_email'] = sponsor["email"]
                    item['sponsor_phone'] = sponsor["phone"]
                    item['sponsor_date_joined'] = sponsor["date_joined"]
                    country = Country.objects.get(id =sponsor["country_id"])
                    item['sponsor_country_name'] = country.name
                    item['sponsor_country_flag'] = country.flag_url
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
#name - worker with payment request list
#utility - returns list of workers with filter,search,sorting and pagination
class WorkerPaymentRequestListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            worker_id =  request.GET.get("worker_id") 
            if not worker_id:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'Please provide worker Id'})
            
            queryset = RequestCoinClaim.objects.filter(worker_id=worker_id,request_status="draft",is_active=True).order_by('-request_id')
            if search_field!=None:
                check_worker_id = list(UserProfile.objects.filter(Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) |Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))).values("id"))[0]["id"]
                queryset = queryset.filter(user_id=check_worker_id,is_active=True).order_by('-request_id')
                count = queryset.count()
            elif ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            else:
                queryset = queryset.all() if queryset.exists() else None
                count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = RequestCoinClaimSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],role_id__in=["worker", "Worker"],is_active=True).values("country_id","display_name","email","phone","date_joined"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_email'] = worker["email"]
                    item['worker_phone'] = worker["phone"]
                    item['worker_date_joined'] = worker["date_joined"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag'] = country.flag_url
                    
                    sponsor =list(UserProfile.objects.filter(id=item['sponser_id'],role_id__in=["sponser", "Sponser"],is_active=True).values("country_id","display_name","email","phone","date_joined"))[0]
                    item['sponsor_name'] = sponsor["display_name"]
                    item['sponsor_email'] = sponsor["email"]
                    item['sponsor_phone'] = sponsor["phone"]
                    item['sponsor_date_joined'] = sponsor["date_joined"]
                    country = Country.objects.get(id =sponsor["country_id"])
                    item['sponsor_country_name'] = country.name
                    item['sponsor_country_flag'] = country.flag_url
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
def get_month_name(date_str):
    date_obj = datetime.strptime(date_str, '%Y-%m')
    month_name = date_obj.strftime('%B')
    return month_name

 
class UsersAndWorkersMonthlyCountAPIView(APIView):
    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            year = request.data.get("year")
            dataset =[]
            worker_queryset = UserProfile.objects.filter(date_joined__year=year,account_approval_state="approve",is_active=True).filter(Q(role_id="worker") | Q(role_id="Worker")).order_by('-id')
            month_counts_worker = {datetime(year, month, 1).strftime('%Y-%m'): 0 for month in range(1, 13)}
            for profile in worker_queryset:
                month_key = profile.date_joined.strftime('%Y-%m')
                month_counts_worker[month_key] += 1

            # Second dataset (new query)
            # Update this query as per your requirement
            user_queryset = UserProfile.objects.filter(date_joined__year=year,account_approval_state="approve",is_active=True).filter(Q(role_id="user") | Q(role_id="User")).order_by('-id')

            month_counts_user = {datetime(year, month, 1).strftime('%Y-%m'): 0 for month in range(1, 13)}
            for profile in user_queryset:
                month_key = profile.date_joined.strftime('%Y-%m')
                month_counts_user[month_key] += 1

            # Preparing the result
            month_name_list = []
            worker_count_list = []
            user_count_list = []

            for month in month_counts_worker:
                month_name = get_month_name(month)
                month_name_list.append(month_name)
                worker_count_list.append(month_counts_worker[month])
                user_count_list.append(month_counts_user.get(month, 0))

            dataset.append({
                "label": "Worker",
                "data": worker_count_list,
                "backgroundColor": "rgba(255, 99, 132, 0.5)"
            })
            dataset.append({
                "label": "User",
                "data": user_count_list,
                "backgroundColor": "rgba(53, 162, 235, 0.5)"
            })

            result = {
                "labels": month_name_list,
                'datasets': dataset
            }
          
            return Response({'data':result,'code':status.HTTP_200_OK,'message': 'success'})
          
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        

class MonthlyRevenueCountAPIView(APIView):
    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            year = request.data.get("year")
            dataset =[]
            revenue_queryset = BuyCredit.objects.filter(create_date_time__year=year,status="success",is_active=True).order_by('-buy_credit_id')
            month_totals_revenue = {datetime(year, month, 1).strftime('%Y-%m'): 0 for month in range(1, 13)}
            for revenue in revenue_queryset:
                month_key = revenue.create_date_time.strftime('%Y-%m')
                month_totals_revenue[month_key] += revenue.amount

            # Preparing the result
            month_name_list = []
            revenue_total_list = []
            for month in month_totals_revenue:
                month_name = get_month_name(month)
                month_name_list.append(month_name)
                revenue_total_list.append(month_totals_revenue[month])

            dataset.append({
                "label": "Revenue",
                "data": revenue_total_list,
                "backgroundColor": "rgba(255, 165, 0)"
            })
            result = {
                "labels": month_name_list,
                'datasets': dataset
            }
          
            return Response({'data':result,'code':status.HTTP_200_OK,'message': 'success'})
          
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class WarningListAPIView(APIView):
    authentication_classes=()
    permission_classes=()
    def get(self, request):
        try:

            PersonId = request.GET.get("PersonId",None) 
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            
            queryset = Warning.objects.filter(user_id=PersonId).order_by("-warning_id")
                
            count = queryset.count()

            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            
            if queryset:
                data=queryset.values()
                
                for value in data:
                    
                    print("value",value)
                    if value["report_id_id"] !=None:
                        reportdata=Report.objects.filter(report_id=value["report_id_id"]).values()[0]
                        print("reportdata",reportdata)
                        
                        userdetail=UserProfile.objects.filter(id=reportdata["worker_id_id"]).values("display_name","email")[0]
                        print("userdetail",userdetail)
                        reportdata["display_name"]=userdetail["display_name"]
                        reportdata["email"]=userdetail["email"]
                        
                        reportatt=ReportAttachment.objects.filter(report_id=value["report_id_id"])
                        if reportatt:
                            url=reportatt.values("file_image")[0]["file_image"]
                            reportdata["report_attachment"]=url
                        else:
                            reportdata["report_attachment"]=None
                            
                        value["reportdata"]=reportdata
                        
                    else:
                        value["reportdata"]=None    
                        
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                
                language = UserProfile.objects.filter(id=PersonId).values("language")[0]["language"]
                message = get_translation(language, 'no_data_available')  
                result ={"data" :queryset.values(),"count":0,'code':status.HTTP_400_BAD_REQUEST,'message': message}
                return Response(data=result)
            
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})          


class CheckWarningAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            from datetime import datetime, timedelta, timezone
            
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sender_id = decoded_token['user_id']  
            except jwt.ExpiredSignatureError:
                return Response({'code': 401, 'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code': 401, 'error': 'Invalid token'}, status=status.HTTP_200_OK)

            receiver_id = request.data.get("receiver_id", None)
            WarningData = UserProfile.objects.filter(id=sender_id).values("total_warning","email","last_warning_datetime","total_earn_coin","display_name")[0]
            
            language = UserProfile.objects.filter(id=sender_id).values("language")[0]["language"]
            

            if WarningData["total_warning"] == 1:
                warning_date = WarningData["last_warning_datetime"]
                # Make current_datetime aware of UTC timezone
                current_datetime = datetime.now(timezone.utc)
                remaining_time = warning_date + timedelta(hours=24) - current_datetime

                if current_datetime - warning_date > timedelta(hours=24):
                    result = {'code': status.HTTP_200_OK, 'message': 'Success'}
                else:
                    message = get_translation(language, 'you_will_not_be_able_to_make_calls_for_the_next_24_hours')
                    result = {'code': status.HTTP_400_BAD_REQUEST,"remaining_time":remaining_time, 'message': message}
                    return Response(data=result)
             
            elif WarningData["total_warning"] == 2:
                warning_date = WarningData["last_warning_datetime"]
                # print("warning_date", warning_date)
                # Make current_datetime aware of UTC timezone
                current_datetime = datetime.now(timezone.utc)
                remaining_time = warning_date + timedelta(hours=72) - current_datetime

                if current_datetime - warning_date > timedelta(hours=72):
                    result = {'code': status.HTTP_200_OK, 'message': 'Success'}
                else:
                    message = get_translation(language, 'you_will_not_be_able_to_make_calls_for_the_next_72_hours')
                    result = {'code': status.HTTP_400_BAD_REQUEST,"remaining_time":remaining_time, 'message': message}
                    return Response(data=result)
            elif WarningData["total_warning"]>2:
                pass
                # WarningCoin = AdminEssentials.objects.filter(is_active=True).values("amount")[0]["amount"]

                # if WarningData["total_earn_coin"]> WarningCoin:  
                #     totalcoin= WarningData["total_earn_coin"]

                # WarningData = UserProfile.objects.filter(id=sender_id).update(total_earn_coin=WarningData["total_earn_coin"]-WarningCoin)
                   #########################################################
                # try:
                #     server_base_url = config('SERVER_BASE_URL')
                #     logo =server_base_url+'/media/email_images/logo.png'

                #     create_date_str = datetime.now(timezone.utc)

                #     user_email = WarningData["email"]
                    
                #     html_content = render_to_string('deductcoinfromuser.html', {'Display_name': WarningData["display_name"],'amount':WarningData["total_earn_coin"],"create_date_str":create_date_str,"logo":logo})
                    
                #     # send_email_background.delay(user_email, html_content)
                        
                # except:
                #     pass   
                result = {'code': status.HTTP_200_OK, 'message': 'Success'} 
                    ###########################################
                # else:
                    
                #     result = {'code': status.HTTP_400_BAD_REQUEST,"message":"You have un sufficient balance to make a call."}
                #     return Response(data=result)
            else:
                result = {'code': status.HTTP_200_OK, 'message': 'Success'}

            #checking condition on receiver side.
            
            if receiver_id != None:
                
                WarningData = UserProfile.objects.filter(id=receiver_id).values("total_warning","email","last_warning_datetime","total_earn_coin","display_name")[0]

                if WarningData["total_warning"] == 1:
                    warning_date = WarningData["last_warning_datetime"]

                    # Make current_datetime aware of UTC timezone
                    current_datetime = datetime.now(timezone.utc)
                    # Calculate the remaining time
                    remaining_time = warning_date + timedelta(hours=24) - current_datetime

                    if current_datetime - warning_date > timedelta(hours=24):
                        result = {'code': status.HTTP_200_OK, 'message': 'Success'}
                    else:
                        message = get_translation(language, 'your_partner_not_able_to_make_calls_for_the_next_24_hours')
                        result = {'code': status.HTTP_400_BAD_REQUEST,"remaining_time":remaining_time, 'message': message}
                        return Response(data=result)
              
                elif WarningData["total_warning"] == 2:
                    warning_date = WarningData["last_warning_datetime"]
                    # Make current_datetime aware of UTC timezone
                    current_datetime = datetime.now(timezone.utc)
                    remaining_time = warning_date + timedelta(hours=72) - current_datetime
                    if current_datetime - warning_date > timedelta(hours=72):
                        result = {'code': status.HTTP_200_OK, 'message': 'Success'}
                    else:
                        message = get_translation(language, 'your_partner_not_able_to_make_calls_for_the_next_72_hours')
                        result = {'code': status.HTTP_400_BAD_REQUEST,"remaining_time":remaining_time, 'message': message}
                        return Response(data=result)
                elif WarningData["total_warning"]>2:
                    pass
                    WarningCoin = AdminEssentials.objects.filter(is_active=True).values("amount")[0]["amount"]

                    # if WarningData["total_earn_coin"]> WarningCoin:
                        
                    # WarningData = UserProfile.objects.filter(id=receiver_id).update(total_earn_coin=WarningData["total_earn_coin"]-WarningCoin)
                    
                    ########################################################
                    # try:
                    #     server_base_url = config('SERVER_BASE_URL')
                    #     logo =server_base_url+'/media/email_images/logo.png'
                        
                    #     create_date_str = datetime.now(timezone.utc)

                    #     user_email = WarningData["email"]
                        
                    #     html_content = render_to_string('deductcoinfromuser.html', {'Display_name': WarningData["display_name"],'amount':WarningData["total_earn_coin"],"create_date_str":create_date_str,"logo":logo})
                        
                    #     send_email_background.delay(user_email, html_content)
                        
                    # except:
                    #     pass   
                    
                    result = {'code': status.HTTP_200_OK, 'message': 'Success'} 
                        ###########################################
                    # else:
                        
                    #     result = {'code': status.HTTP_400_BAD_REQUEST,"message":"You have un sufficient balance to make a call."}
                    #     return Response(data=result)
                else:
                    result = {'code': status.HTTP_200_OK, 'message': 'Success'}
                    
                return Response(data=result)    

        except Exception as e:
            return Response({"error": str(e), 'code': status.HTTP_400_BAD_REQUEST})

class WorkerPaymentHistoryAPIView(APIView):
    authentication_classes=()
    permission_classes=()
    def get(self, request,payment_id):
        try:
            
            queryset = PaymentRequest.objects.filter(payment_request_id=payment_id) 
            serializer = PamentRequestDataSerializer(queryset, many=True)
            data = serializer.data[0]
            result ={"data" :data,'code':status.HTTP_200_OK,'message': 'success'}
            return Response(data=result)
            
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})         
        
class ExistData(APIView):
    def post(self, request):
        email = request.data.get("Email",None)
        display_name = request.data.get("NickName",None)
        language= request.data.get("language",'en')
        
        if UserProfile.objects.filter(Q(email=email) & ~Q(account_approval_state="decline")).exists():
            message = get_translation(language, 'entered_email_address_already_being_in_use')
            raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message': message})
                    
        elif UserProfile.objects.filter(Q(display_name=display_name) & ~Q(account_approval_state="decline")).exists():
            message = get_translation(language, 'nick_name_already_used_by_another_user')
            raise serializers.ValidationError({'code': status.HTTP_400_BAD_REQUEST, 'message': message})

        else:
           return Response({'code':200,'message': 'Success'})  
    
# class StatusUpdate(APIView):
#     def post(self, request):
#         try:
            
#             PersonId = request.data.get("PersonId",None)
#             Status = request.data.get("Status",None)
#             current_datetime = datetime.now(timezone.utc)
#             if Status =="offline":
#                 querset= UserProfile.objects.filter(id=PersonId).update(status="offline",online_date=current_datetime)
#                 return Response({'code':200,'message': 'User offline successfully'}) 
#             else:
#                 querset= UserProfile.objects.filter(id=PersonId).update(status="online",online_date=current_datetime)   
#                 return Response({'code':200,'message': 'User online successfully'}) 

#         except Exception as e:
#             return Response({"message":"Provide a valid Person Id",'code':status.HTTP_400_BAD_REQUEST})
              

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_status_update_message(data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "test_consumer_group",
        {
            'type': 'send_status_update',
            'message': data
        }
    )
    


class StatusUpdate(APIView):
    def post(self, request):
        try:
            PersonId = request.data.get("PersonId", None)
            Status = request.data.get("Status", None)
            current_datetime = datetime.now(timezone.utc)
            PersonRole=list(UserProfile.objects.filter(id=PersonId).values("role_id"))[0]["role_id"]
            
            if PersonRole=="user":
                data={"UpdateToWorker":True,"UpdateToUser":False,"Status":Status}
            else:
                data={"UpdateToWorker":False,"UpdateToUser":True,"Status":Status}
                    
            
            if Status == "offline":
                
                querset = UserProfile.objects.filter(id=PersonId).update(status="offline", online_date=current_datetime)
                send_status_update_message(data)
                return Response({'code': 200, 'message': 'User offline successfully'})
            else:
                querset = UserProfile.objects.filter(id=PersonId).update(status="online", online_date=current_datetime)
                send_status_update_message(data)
                return Response({'code': 200, 'message': 'User online successfully'})

        except Exception as e:
            return Response({"message": str(e), 'code': status.HTTP_400_BAD_REQUEST})


class LoginPermission(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        sponser_id = request.data.get('sponser_id')

        try:
            user = UserProfile.objects.get(id=user_id, role_id = 'admin')
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Only Admin Have Permission'})
 
        sponser_profile = UserProfile.objects.get(id=sponser_id)
        sponser_profile.login_permission = not sponser_profile.login_permission
        sponser_profile.save()
        
        data={"SponserId":sponser_id,"ActivateStatus":sponser_profile.login_permission}
        
        send_status_update_message(data)

        return Response({'code':status.HTTP_200_OK,'message': 'Login permission updated Successfully'})  
    
    
    
class CallDetailInitiateAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:

                CallId = request.data.get("CallId",None)

                credit_coin=list(CallDeductionCoin.objects.filter(is_active=True).values("coin"))[0]["coin"]
                
                CallDetail=list(CallSession.objects.filter(vid=CallId).values())[0]
                
                StatusMaintain=UserProfile.objects.filter(id=CallDetail["call_started_by_id"]).update(status="busy")
                StatusMaintain=UserProfile.objects.filter(id=CallDetail["call_received_by_id"]).update(status="busy")
                
                if CallDetail["is_demo_call"]== True:
                    CallDetail["call_started_role"]="worker"
                    usercoin=list(UserProfile.objects.filter(id=CallDetail["call_received_by_id"]).values("total_earn_coin"))[0]["total_earn_coin"]
                    CallDetail["usercoin"]=int(usercoin)
                else:
                     CallDetail["call_started_role"]="user"
                     usercoin=list(UserProfile.objects.filter(id=CallDetail["call_started_by_id"]).values("total_earn_coin"))[0]["total_earn_coin"]
                     CallDetail["usercoin"]=int(usercoin)
                CallDetail["coin_exchange_rate"]=credit_coin
                return Response({'code':200,"CallDetail":CallDetail}, status=status.HTTP_200_OK)    

        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)                        


class CallEndAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:

                CallId = request.data.get("CallId",None)
                Totalcoin = request.data.get("Totalcoin",None)
                Duration = request.data.get("Duration", None)
                current_datetime = datetime.now(timezone.utc)
                CallDetail=list(CallSession.objects.filter(vid=CallId,CallEnd=False).values())
                if CallDetail:
                    CallDetail=list(CallSession.objects.filter(vid=CallId,CallEnd=False).values())[0]
                    print("Till now call is not cut yet.")
                    pass
                else:
                    print("In Call end api, call is already cut")
                    return Response({'code':200,"CallDetail": "success"}, status=status.HTTP_200_OK) 
                    
                if CallDetail["is_demo_call"] == True :
                    worker_id=CallDetail["call_started_by_id"]
                    user_id=CallDetail["call_received_by_id"]
                else:    
                    worker_id=CallDetail["call_received_by_id"]
                    user_id=CallDetail["call_started_by_id"]
                    
                WorkerId = UserProfile.objects.get(id=worker_id)
                UserId = UserProfile.objects.get(id=user_id)
                
                if WorkerId:
                    worker_total_coin = WorkerId.total_earn_coin + Totalcoin
                    WorkerId.total_earn_coin = worker_total_coin  
                    WorkerId.online_date=current_datetime  
                    WorkerId.status = "online"
                
                if UserId:
                    user_total_coin = UserId.total_earn_coin - Totalcoin 
                    UserId.total_earn_coin = user_total_coin
                    WorkerId.online_date=current_datetime
                    UserId.status = "online"
                    
                try:
                    
                    WorkerId.save()
                    UserId.save()
                    
                    from datetime import time
                    minutes,seconds = Duration.split('.')
                    duration_time = time(minute=int(minutes), second=int(seconds))
                    
                    end_datetime = datetime.utcnow()
                    CallDetail=CallSession.objects.filter(vid=CallId).update(call_earning=int(Totalcoin),duration=duration_time,end_datetime=end_datetime)
                
                except Exception as e:
                  return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)  

                return Response({'code':200,"CallDetail": "success"}, status=status.HTTP_200_OK)    

        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)                        


from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import GiftManagement
from .serializers import GiftManagementSerializer

class CustomPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_page_size(self, request):
        page_size = request.query_params.get(self.page_size_query_param)
        if page_size:
            return int(page_size)
        return self.page_size

class GiftManagementViewSet(viewsets.ModelViewSet):
    queryset = GiftManagement.objects.all()
    serializer_class = GiftManagementSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['gift_name']
    ordering_fields = ['id']
    pagination_class = CustomPagination


class ChangeLanguageAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
                Id = request.data.get("Id",None)
                language = request.data.get("language","en")
                QuerySet=UserProfile.objects.filter(id=Id).update(language=language)
                message = get_translation(language, 'language_updated_successfully')
                return Response({'code':200,"CallDetail": message}, status=status.HTTP_200_OK)    

        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)                        


class CheckStatusAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
                Id = request.data.get("Id",None)
                QuerySet=UserProfile.objects.filter(id=Id).values("display_name","role_id","is_active","language","login_permission")[0]
                return Response({'code':200,"StatusData": QuerySet}, status=status.HTTP_200_OK)    
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)   
        

class DeleteMediaAPIView(APIView):
    authentication_classes = ()
    permission_classes = ()

    def post(self, request):
        try:
            Id = request.data.get("Id", None)
            QuerySet = UserProfile.objects.filter(id=Id).values("display_name", "role_id", "is_active", "id_image", "video_link")[0]
            if QuerySet["id_image"]:
                # print("id_image", QuerySet["id_image"])
                
                file_path = QuerySet["id_image"]
                # print("file_path", file_path)
                mediadelete(file_path)

            if QuerySet["video_link"]:
                # print("video_link", QuerySet["video_link"])
                video_link = QuerySet["video_link"]
                mediadelete(video_link)
            
            QuerySet = UserProfile.objects.filter(id=Id).update(id_image=None,video_link=None)
                
            return Response({'code': 200, "message": "Media Deleted Successfully"}, status=status.HTTP_200_OK)    
        except Exception as e:
            return Response(data={'code': 400, 'message': str(e)}, status=status.HTTP_200_OK)


def mediadelete(file_path):
    
    file_path = file_path.split('/media', 1)[-1]
    print("file_path without /media", file_path)
    file_path = str(file_path)
    # Combine MEDIA_ROOT and file_path
    absolute_file_path = str(settings.MEDIA_ROOT) + file_path
    print("absolute_file_path", absolute_file_path)
    if os.path.exists(absolute_file_path):
        os.remove(absolute_file_path)
        print("File removed successfully")
    else:
        print("The file does not exist")
        

class TopWorkerListUpdateAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def get(self, request):
        try:       
                QuerySet=TopWorker.objects.all().values()[0]
                # print("QuerySet",QuerySet)
                return Response({'code':200,"StatusData": QuerySet}, status=status.HTTP_200_OK)    
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK) 
    
    def post(self, request):
        try:       
                Id = request.data.get("Id",None)
                Status = request.data.get("Status",None)
                QuerySet=TopWorker.objects.filter(id=Id).update(is_active=Status)
                # print("QuerySet",QuerySet)
                return Response({'code':200,"message": "success"}, status=status.HTTP_200_OK)    
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)               


class DeleteGiftAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:       
                Id = request.data.get("Id",None)
                gift_image = GiftGallery.objects.filter(id=Id).values("gift_image")[0]["gift_image"]
                if gift_image != None:
                #    print("QuerySet",gift_image)
                   mediadelete(gift_image)
                QuerySet=GiftGallery.objects.filter(id=Id).delete()   
                return Response({'code':200,"message": "Gift Deleted Successfully"}, status=status.HTTP_200_OK)    
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)    


class DeleteWarningAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:       
                Warninglist = request.data.get("Warninglist",None)
                user_id = request.data.get("user_id",None)
                for Id in Warninglist:
                    report_id = Warning.objects.filter(warning_id=Id).values("report_id")[0]["report_id"]
                    if report_id != None :
                        # print("report_id",report_id)
                        reportdata=ReportAttachment.objects.filter(report_id=report_id)
                        # print("reportdata",reportdata)
                        if reportdata:
                            url=reportdata.values()[0]["file_image"]
                            # print("url",url)
                            mediadelete(url)
                            ReportAttachment.objects.filter(report_id=report_id).delete()  
                        Warning.objects.filter(warning_id=Id).delete()
                        Report.objects.filter(report_id=report_id).delete() 
                    else:
                        Warning.objects.filter(warning_id=Id).delete()
                        
                    cutwarning=UserProfile.objects.get(id=user_id)    
                    cutwarning.total_warning=cutwarning.total_warning - 1
                    cutwarning.save()
                        
                return Response({'code':200,"message": "Warning Deleted Successfully"}, status=status.HTTP_200_OK)    
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)    
        
        
class AddUserCoin(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:       
                UserId = request.data.get("UserId",None)
                CoinAdd = request.data.get("CoinAdd",None)
                QuerySet=UserProfile.objects.filter(id=UserId).update(total_earn_coin=CoinAdd)
                return Response({'code':200,"message": "success"}, status=status.HTTP_200_OK)    
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)         
