from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from vid_user.models import UserProfile, UserGallery, SponserHistory,Report,ReportAttachment
from .serializers import *
from vid_user.models import UserProfile
from vid_user.serializers import *
import base64
from django.contrib.auth.models import User
import jwt 
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from decouple import config
from django.db.models import Q
from datetime import datetime ,timezone
import os
from django.conf import settings
from moviepy.editor import VideoFileClip
from PIL import Image
import io
import base64
from decimal import Decimal
from vid_worker.task  import process_video_upload

from django.db.models import F 

from .models import Video
from django.db.models import Sum

'''Upload identity of worker for approval'''

def compress_and_encode_image(file):
    img = Image.open(file)
    target_size = 5 * 1024 * 1024 
    img.thumbnail((1000, 1000))  
    img_byte_array = io.BytesIO()
    img.save(img_byte_array, format='JPEG')  
    if img_byte_array.tell() > target_size:
        #compressed_image_path = 'compressed_image.jpg'
        img.save(img_byte_array, format='JPEG', quality=50)  
    img_byte_array.seek(0)
    encoded_image = base64.b64encode(img_byte_array.getvalue()).decode('utf-8')
    return encoded_image

class UserProfileImageView(APIView):

    def post(self, request):
        # secret_key = config('SECRET_KEY')
        # token = request.headers.get('Authorization').split(' ')[1]  
        # try:
        #     decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
        #     user_id = decoded_token['user_id']  
        # except jwt.ExpiredSignatureError:
        #     return Response({'code':status.HTTP_401_UNAUTHORIZED,'error': 'Token expired'})
        # except jwt.InvalidTokenError:
        #     return Response({'code':status.HTTP_401_UNAUTHORIZED,'error': 'Invalid token'})

        file = request.data.get('file')
        user_id = request.data.get('user_id')
        if not file:
            return Response({'code':status.HTTP_400_BAD_REQUEST,'error': 'File not found'})
        ######################
        target_folder = os.path.join('videos', str(f"profile_ID_{user_id}"))
        unique_filename = f"profile_ID_{file.name}"
        os.makedirs(target_folder, exist_ok=True)
        full_path = os.path.join(target_folder, unique_filename)
        with open(full_path, "wb+") as image_file:
            # Seek to the beginning of the file
            file.seek(0)
            
            file.seek(0)
            image_file.write(file.read())
            image_path = os.path.join(settings.MEDIA_URL, str(f"profile_ID_{user_id}"), unique_filename)
            base_url = config('SERVER_BASE_URL')
            # image_link = base_url + image_path
            image_link = image_path
        
        #######################
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'User not found'})
        
        #encoded_image=compress_and_encode_image(file)
        #encoded_image = base64.b64encode(file.read()).decode('utf-8')
        user.id_image = image_link
        user.signup_step = 2
        user.save()

        return Response({'code':status.HTTP_201_CREATED,'message': 'Image uploaded successfully'})



'''upload worker its profile image it can be use in user profile image'''

class UserProfileProfileView(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id'] 
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'})

        file = request.data.get('file')

        if not file:
            return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'File not found'})

        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'User not found'})

        # encoded_image = base64.b64encode(file.read()).decode('utf-8')
        # user.profile_image = encoded_image
        # user.signup_step=2
        # user.save()
        
        
        file_extension = os.path.splitext(file.name)[1]
        target_folder = os.path.join('videos',str(user_id))
        
        unique_filename = f"image{file_extension}"
        os.makedirs(target_folder, exist_ok=True)
        full_path = os.path.join(target_folder, unique_filename)
        
        with open(full_path, "wb") as image_file:
            image_file.write(file.read())
        
        image_path = os.path.join(settings.MEDIA_URL,str(user_id), unique_filename)
        base_url = config('SERVER_BASE_URL')
        # image_link =base_url+image_path
        image_link =image_path
        user.profile_image = image_link
        user.signup_step=2
        user.save()

        return Response({'data':image_link,'message': 'Image uploaded successfully','code':201})
        #return Response({'message': 'Image uploaded successfully','code':201})
    


'''upload video for approval '''

class UserProfileVideoView(APIView):
    def check_video_corruption(self,file_path):
            try:
                video = VideoFileClip(file_path)
                # If the video is readable without errors, return True (not corrupted)
                return True
            except Exception as e:
                # If an error occurs during reading, it might indicate corruption or issues
                # print(f"Video file is corrupted or unreadable: {e}")
                return False

    def post(self, request):
        try:
            video_file = request.FILES.get('video_file')
            user_id = request.data.get('user_id')
            if not video_file:
                return Response({'code':status.HTTP_400_BAD_REQUEST,'error': 'Video file not found'})
            else:
                # file_extension = os.path.splitext(video_file.name)[1]
                # target_folder = os.path.join('videos',str(user_id))
                # unique_filename = f"{user_id}{file_extension}"
                # os.makedirs(target_folder, exist_ok=True)
                # full_path = os.path.join(target_folder, unique_filename)
                # with open(full_path, 'wb') as destination:
                #     for chunk in video_file.chunks():
                #         destination.write(chunk)
                # is_corrupted = self.check_video_corruption(full_path)
                # if not is_corrupted:
                #     return Response({'code':status.HTTP_400_BAD_REQUEST,'error': 'Video file is corrupted or unreadable'})
                # video_path = os.path.join(settings.MEDIA_URL,str(user_id), unique_filename)
                # base_url = config('SERVER_BASE_URL')
                # video_link =base_url+video_path
                
                # try:
                #     user = UserProfile.objects.get(id=user_id)
                #     if user:
                #         user.video_link = video_link
                #         user.signup_step = 3
                #         user.account_approval_state = "none"
                #         user.save()
                        
                #         return Response({'data':video_link,'code':200,'message': 'Video uploaded successfully'})
                # except UserProfile.DoesNotExist:
                #     return Response({'code':404,'error': 'User not found'})
                # print(user_id)
                process_video_upload.delay(user_id,video_file.read(), video_file.name)
                #base64_file_content = base64.b64encode(video_file.read()).decode('utf-8')
                #process_video_upload.delay(user_id, video_file.name, base64_file_content)
                return Response({'code':200,'message': 'Video uploaded successfully'})

        except Exception as e:
            return Response({'code':400,'error':str(e)})
            
import time
class VideoAPIView(APIView):
    
    def post(self, request, *args, **kwargs):
        start_time = time.time()
        user_id = request.data.get('user_id')
        video_file = request.data.get('video_file')
        if not video_file:
            return Response({'code':status.HTTP_400_BAD_REQUEST,'error': 'Video file not found'})
        serializer = VideoSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            video_file = serializer.data.get('video_file')
            base_url = config('SERVER_BASE_URL')
            video_link = video_file.replace(base_url,'')
            
            try:
                user = UserProfile.objects.get(id=user_id)
                if user:
                    user.video_link = video_link
                    user.signup_step = 3
                    user.account_approval_state = "none"
                    user.save()
                    end_time = time.time()
                    execution_time = end_time - start_time
                return Response({'data':video_link,'code':200,'message': 'Video uploaded successfully'})
            except UserProfile.DoesNotExist:
                return Response({'code':404,'error': 'User not found'})
        return Response({'error': serializer.errors, 'code':400})


'''upload worker image in user gallery'''

class UserGalleryImageUpload(APIView):

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'})

        file = request.data.get('file')
        detail = request.data.get('detail')


        if not file:
            return Response({'code':400,'error': 'File not found'})

        try:
            user = UserProfile.objects.get(id=user_id)
        except user.DoesNotExist:
            return Response({'code':404,'error': 'User not found'})

        encoded_image = base64.b64encode(file.read()).decode('utf-8')
        serializer = UploadedGallerySerializer(data={'user_id': user_id, 'image': encoded_image, 'detail': detail})
        if serializer.is_valid():
            serializer.save()
            return Response({'code':201,'message': 'Image uploaded successfully'})
        else:
            return Response({'code':401,'error':serializer.errors})
        

    '''delet worker image in user gallery'''
       
    def delete(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1] 

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256']) 
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'})

        
        photo_id = request.data.get('photo_id')

        try:
            user = UserGallery.objects.get(id=photo_id)
        except UserGallery.DoesNotExist:
            return Response({'code':404,'error': 'Image not found'})
        
        user.is_active = False
        user.save()

        return Response({'code':201,'message': 'Image Delete Successfully'})        






'''Create sponser request from worker side'''

class CreateSponserRequest(APIView):

     def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        sponser_id = request.data.get('sponser_id')
        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'})
        
        language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
  
        
        try:
            user_profile = UserProfile.objects.get(id=sponser_id, role_id='sponser')

            sponser_history = SponserHistory.objects.filter(worker_id=user_id, current_status__in=['pending', 'accepted'])
            if user_profile:
                if sponser_history.exists():
                    current_status = sponser_history.first().current_status
                    sponsor_id_new = sponser_history.first().sponser_id_id
                    
                    message = get_translation(language, 'sponsor_request_already_present')
                    
                    return Response({'code':404,'message': message,'status':current_status,'sponsor_id':sponsor_id_new})
                else:
                    serializer = CreateSponserRequestSerializer(data={'worker_id': user_id, 'sponser_id': sponser_id})
                    if serializer.is_valid():
                        serializer.save()
                        
                        message = get_translation(language, 'sponsor_request_created_successfully')
                        return Response({'code':201,'message': message})
                    else:
                        return Response({'code':400,'error':serializer.errors})
            else:
                return Response({'code':404,'error': 'Sponsor not found'})

        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'Sponsor not found'})







'''Cancel sponsership request from worker side'''

class CancelSponserRequest(APIView):

    def post(self, request):
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1] 

            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256']) 
                user_id = decoded_token['user_id']  
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'})
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'})
            
            language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
            
            request_id = request.data.get('request_id')

            try:
                user = SponserHistory.objects.get(id=request_id)
            except SponserHistory.DoesNotExist:
                return Response({'code':404,'error': 'Request not found'})
            
            user.current_status = 'cancel'
            user.save()
            
            message = get_translation(language, 'request_cancelled_successfully')
            print("message",message)
            
            return Response({'code':200,'message': message})





'''Leave sponser from worker'''

class LeaveSponser(APIView):

    def post(self, request):
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1] 

            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256']) 
                user_id = decoded_token['user_id']  
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'})
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'})
            
            language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
            
            sponser_id = request.data.get('sponser_id')

            try:
                user_profile = UserProfile.objects.get(id=sponser_id, role_id='sponser')
                
                if user_profile:
                    sponser_history = SponserHistory.objects.filter(worker_id=user_id, sponser_id=sponser_id)
                    accepted_sponser_history = sponser_history.filter(current_status='accepted')
                    if accepted_sponser_history.exists():
                        request_coin_object = RequestCoinClaim.objects.filter(sponser_id=sponser_id,worker_id=user_id,request_status="inprocess")
                        if request_coin_object.exists():
                            
                            message = get_translation(language, 'you_cant_leave_your_current_sponsor_because_your_payment_is_pending')
                            return Response({'code':400,'message': message})
                        
                        request_coin_object = RequestCoinClaim.objects.filter(sponser_id=sponser_id,worker_id=user_id,request_status="draft")
                        if request_coin_object.exists():
                            # request_coin_object.update(request_status="cancel")
                            message = get_translation(language, 'you_cant_leave_your_current_sponsor_because_your_payment_is_pending')
                            return Response({'code':400,'message': message})

                        end_datetime = datetime.utcnow()
                        update_sponserhistory = sponser_history.update(current_status='cancel',end_datetime=end_datetime)

                        record_userprofile = UserProfile.objects.filter(id=user_id)
                        update_record = record_userprofile.update(sponser_id=None)
                        message = get_translation(language, 'remove_sponsor_successfully')
                        return Response({'code':200,'message': message})
                    
                    elif sponser_history.filter(current_status='pending').exists():
                        end_datetime = datetime.utcnow()
                        update_sponserhistory = sponser_history.update(current_status='cancel',end_datetime=end_datetime)

                        record_userprofile = UserProfile.objects.filter(id=user_id)
                        update_record = record_userprofile.update(sponser_id=None)
                        message = get_translation(language, 'remove_sponsor_successfully')
                        return Response({'code':200,'message': message})
                    else:
                        message = get_translation(language, 'current_sponsorship_not_available')
                        return Response({'code':404,'message': message})
                else:
                    message = get_translation(language, 'sponsor_not_found')
                    return Response({'code':404,'error': message})

            except UserProfile.DoesNotExist:
                message = get_translation(language, 'sponsor_not_found')
                return Response({'code':404,'error': message})


def compress_and_encode_image(file):
    img = Image.open(file)
    target_size = 5 * 1024 * 1024 
    img.thumbnail((1000, 1000))  
    img_byte_array = io.BytesIO()
    img.save(img_byte_array, format='JPEG')  
    if img_byte_array.tell() > target_size:
        #compressed_image_path = 'compressed_image.jpg'
        img.save(img_byte_array, format='JPEG', quality=50)  
    img_byte_array.seek(0)
    encoded_image = base64.b64encode(img_byte_array.getvalue()).decode('utf-8')
    return encoded_image

'''Create Report of Sponser by worker'''

class CreateReport(APIView):

    '''Create Report of Sponser by worker'''

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        sponser_id = request.data.get('sponser_id')
        subject_line = request.data.get('subject_line')
        content = request.data.get('content')

        video_link = request.data.get('video_link',None)

        file_attachment = request.FILES.getlist('file',None)
        

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
            language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'})
        
        try:
            user_profile = UserProfile.objects.get(id=user_id, role_id='worker')
          
            serializer = CreateReportSerializer(data={'sponser_id':sponser_id,'worker_id': user_id, 'subject_line': subject_line,'content':content})
            if serializer.is_valid():
                serializer.save()
                report_id = serializer.instance.report_id
                if video_link:
                    report_video_serializer = CreateReportAttachmentSerializer(data={'report_id':report_id,'video_link': video_link})
                    if report_video_serializer.is_valid():
                        report_video_serializer.save()

                if file_attachment:
                    for img_file in file_attachment:
                        target_folder = os.path.join('videos', str(f"worker_warning_report_{report_id}"))
                        unique_filename = f"warning_report_{img_file.name}"
                        
                        os.makedirs(target_folder, exist_ok=True)
                        full_path = os.path.join(target_folder, unique_filename)
                        
                        with open(full_path, "wb+") as image_file:
                            # Seek to the beginning of the file
                            img_file.seek(0)
                            
                            img_file.seek(0)
                            image_file.write(img_file.read())
                        image_path = os.path.join(settings.MEDIA_URL, str(f"worker_warning_report_{report_id}"), unique_filename)
                        base_url = config('SERVER_BASE_URL')
                        # image_link = base_url + image_path
                        image_link = image_path
                        
                        
                        # encoded_image = compress_and_encode_image(file)
                        report_image_serializer = CreateReportAttachmentSerializer(data={'report_id':report_id,'file_image': image_link})
                        if report_image_serializer.is_valid():
                            report_image_serializer.save()
                
                message = get_translation(language, 'report_created_successfully')
                return Response({'code':201,'message': message})
            else:
                return Response({'code':401,'error':serializer.errors})

        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'Worker not found'})


    '''view report with attachment file'''

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
            report_data = Report.objects.filter(report_id=id).values()
            report_attachment = ReportAttachment.objects.filter(report_id=id).values()
       
            if not report_data:

                return Response({"code":404,"detail": "Report not found"}, status=status.HTTP_200_OK)

            return Response({"code":200,"report": report_data, "attachment": report_attachment}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"code":500,"detail": str(e)})







'''Create coin claim request from worker side '''

# class CreateCoinClaimRequest(APIView):

#     def post(self, request):
        
#         secret_key = config('SECRET_KEY')
#         token = request.headers.get('Authorization').split(' ')[1]  
#         sponser_id = request.data.get('sponser_id')
#         coin_claim = request.data.get('coin_claim')
#         amount = request.data.get('amount')
#         bank_received = request.data.get('bank_received')  # if its true then payment via Bank , if False then payment via Binance
#         request_date = datetime.now(timezone.utc).date()
        

#         try:
#             decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
#             user_id = decoded_token['user_id']  
#         except jwt.ExpiredSignatureError:
#             return Response({'code':401,'error': 'Token expired'})
#         except jwt.InvalidTokenError:
#             return Response({'code':401,'error': 'Invalid token'})
        
#         language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
        
        
#         try:
#             user_profile = UserProfile.objects.get(id=user_id, role_id='worker')
            
#             if sponser_id == None:
#                 message = get_translation(language, 'your_sponsor_deleted_by_admin_please_request_to_another_sponsor')
#                 return Response({'code':404,'error': message})

#             if bank_received:
#                 try:
#                     BankAccount.objects.get(user_id=user_profile.id)
#                 except BankAccount.DoesNotExist:
#                     message = get_translation(language, 'bank_account_not_found')
#                     return Response({'code':404,'error': message})
#             else:
#                 try:
#                     BinanceAccount.objects.get(user_id=user_profile.id)
#                 except BinanceAccount.DoesNotExist:
#                     message = get_translation(language, 'binance_account_not_found')
#                     return Response({'code':404,'error': message})
                
#             if coin_claim>user_profile.total_earn_coin:
#                 message = get_translation(language, 'your_claim_coin_is_greater_than_total_coin')
#                 return Response({'code':400,'message': message})
            
#             # LastPaymentDetail = RequestCoinClaim.objects.filter(worker_id=user_id, request_status="draft")
#             # if LastPaymentDetail.exists():
#             #     total_sum = LastPaymentDetail.aggregate(
#             #         total_coin_claim=Sum('coin_claim'),
#             #         total_amount=Sum('amount')
#             #     )
#             #     print("Total Coin Claim:", total_sum['total_coin_claim'])
#             #     print("Total Amount:", total_sum['total_amount'])
            
#             serializer = RequestCoinClaimSerializer(data={'sponser_id':sponser_id,'worker_id': user_id, 'request_date': request_date ,'coin_claim':coin_claim, 'amount':amount, 'bank_received':bank_received, })
#             if serializer.is_valid():
#                 serializer.save()
#                 user_profile.total_earn_coin = user_profile.total_earn_coin-Decimal(coin_claim)
#                 user_profile.save()
                
#                 message = get_translation(language, 'coin_claim_request_created_successfully')
#                 return Response({'code':201,'message': message})
#             else:
#                 return Response({'code':401,'error':serializer.errors})

#         except UserProfile.DoesNotExist:
#             return Response({'code':404,'error': 'Worker not found'})


class CreateCoinClaimRequest(APIView):

    def post(self, request):
        
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  
        sponser_id = request.data.get('sponser_id')
        coin_claim = request.data.get('coin_claim')
        newcoin=coin_claim
        amount = request.data.get('amount')
        bank_received = request.data.get('bank_received')  # if its true then payment via Bank , if False then payment via Binance
        request_date = datetime.now(timezone.utc).date()

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            user_id = decoded_token['user_id']  
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'})
        
        language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
        
        
        try:
            user_profile = UserProfile.objects.get(id=user_id, role_id='worker')
            
            if sponser_id == None:
                message = get_translation(language, 'your_sponsor_deleted_by_admin_please_request_to_another_sponsor')
                return Response({'code':404,'error': message})

            if bank_received:
                try:
                    BankAccount.objects.get(user_id=user_profile.id)
                except BankAccount.DoesNotExist:
                    message = get_translation(language, 'bank_account_not_found')
                    return Response({'code':404,'error': message})
            else:
                try:
                    BinanceAccount.objects.get(user_id=user_profile.id)
                except BinanceAccount.DoesNotExist:
                    message = get_translation(language, 'binance_account_not_found')
                    return Response({'code':404,'error': message})
                
            if coin_claim>user_profile.total_earn_coin:
                message = get_translation(language, 'your_claim_coin_is_greater_than_total_coin')
                return Response({'code':400,'message': message})
            
            LastPaymentDetail = RequestCoinClaim.objects.filter(worker_id=user_id, request_status="draft")
            if LastPaymentDetail.exists():

                checkbankmode=LastPaymentDetail.filter(bank_received=True).values()
                checkbinancemode=LastPaymentDetail.filter(bank_received=False).values()
                
                if checkbankmode and bank_received==True :
                    total_sum = checkbankmode.aggregate(
                        total_coin_claim=Sum('coin_claim'),
                        total_amount=Sum('amount')
                    )
                    print("Total Coin Claim:", total_sum['total_coin_claim'])
                    print("Total Amount:", total_sum['total_amount'])
                    coin_claim=total_sum['total_coin_claim'] + newcoin
                    amount=total_sum['total_amount'] + amount
                    
                    RequestCoinClaim.objects.filter(worker_id=user_id, request_status="draft",bank_received=True).delete()

                if checkbinancemode and bank_received==False :
                        total_sum = checkbinancemode.aggregate(
                            total_coin_claim=Sum('coin_claim'),
                            total_amount=Sum('amount')
                        )
                        print("Total Coin Claim:", total_sum['total_coin_claim'])
                        print("Total Amount:", total_sum['total_amount'])
                        coin_claim=total_sum['total_coin_claim'] + newcoin
                        amount=total_sum['total_amount'] + amount
                        RequestCoinClaim.objects.filter(worker_id=user_id, request_status="draft",bank_received=False).delete()

            serializer = RequestCoinClaimSerializer(data={'sponser_id':sponser_id,'worker_id': user_id, 'request_date': request_date ,'coin_claim':coin_claim, 'amount':amount, 'bank_received':bank_received, })
            if serializer.is_valid():
                serializer.save()    
                user_profile.total_earn_coin = user_profile.total_earn_coin-Decimal(newcoin)
                user_profile.save()
                
                message = get_translation(language, 'coin_claim_request_created_successfully')
                return Response({'code':201,'message': message})
            else:
                return Response({'code':401,'error':serializer.errors})

        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'Worker not found'})




#-------------------neha code start here ----------------------------------------------------------




#name -  online user list
#utility - returns list of online user with filter,search,sorting and pagination
class UserOnlineListAPIView(APIView):
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
            namesearch = request.GET.get("namesearch",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            # queryset = UserProfile.objects.filter( (Q(role_id="user") | Q(role_id="User"))).filter(is_active=True,login_permission=True).order_by('-id')
            queryset = UserProfile.objects.filter( (Q(role_id="user") | Q(role_id="User")) & (Q(status="offline") | Q(status="online"))).filter(is_active=True,login_permission=True).order_by( 
                F('status').desc(nulls_last=True), '-online_date'
            )
            if search_field!=None:
                #queryset = queryset.filter(Q(display_name__icontains=search_field)) 
                queryset = queryset.filter(country_id__name__icontains=search_field)
                count = queryset.count()
                
            if namesearch!=None:
                #queryset = queryset.filter(Q(display_name__icontains=search_field)) 
                queryset = queryset.filter(display_name__icontains=namesearch)
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
                    country_id = item['country_id']
                    try:
                        country = Country.objects.get(id=country_id)
                        item['country_name'] = country.name
                        item['country_flag_url'] = country.flag_url
                    except Country.DoesNotExist:
                        pass 
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
#name -  sponser list
#utility - returns list of sponser with filter,search,sorting and pagination
class SponserListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                worker_id = decoded_token['user_id'] 
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
            try:
                sponsor_obj = SponserHistory.objects.get(worker_id_id=worker_id, current_status__in=['pending', 'accepted'])
            except SponserHistory.DoesNotExist:
                sponsor_obj = None
            
            queryset = UserProfile.objects.filter((Q(role_id="sponser") | Q(role_id="Sponser"))).filter(is_active=True).order_by('-id')
            if sponsor_obj:
                queryset = UserProfile.objects.filter((Q(role_id="sponser") | Q(role_id="Sponser"))).exclude(id=sponsor_obj.sponser_id_id).filter(is_active=True).order_by('-id')
            if search_field!=None:
                # queryset = queryset.filter(Q(display_name__icontains=search_field)) 
                # count = queryset.count()
                queryset = queryset.filter(country_id__name__icontains=search_field)
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
                    country_id = item['country_id']
                    try:
                        country = Country.objects.get(id=country_id)
                        item['country_name'] = country.name
                        item['country_flag_url'] = country.flag_url
                    except Country.DoesNotExist:
                        pass 
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
       
#name -  worker payment historylist
#utility - returns list of worker payment history with filter,search,sorting and pagination
class WorkerPaymentHistoryListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                worker_id =decoded_token['user_id'] 
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
            queryset = RequestCoinClaim.objects.filter(worker_id=worker_id,is_active=True).order_by('-request_id')
            if search_field!=None:
                queryset = queryset.filter(Q(request_status__icontains=search_field)) 
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
                    if item["bank_received"]==True:
                        item["type"] = "Bank"
                    else:
                        item["type"] = "Binance"
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
#name -  worker payment historylist
#utility - returns list of worker payment history with filter,search,sorting and pagination
class WorkerReportListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']  # Extract the user_id from the decoded token
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
            queryset = Report.objects.filter(worker_id=user_id,is_active=True).order_by('-report_id')
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))
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
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = ReportSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker_id = item['worker_id']
                    worker =list(UserProfile.objects.filter(id=worker_id,role_id__in=["worker", "Worker"],is_active=True).values("country_id","first_name","id_image"))[0]
                    item['worker_name'] = worker["first_name"]
                    item['worker_id_image'] = worker["id_image"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['country_name'] = country.name
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        

class WorkerDetailAPIView(APIView):

    def get(self,request,worker_id):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            try:
                UserProfileObj = UserProfile.objects.get(id=worker_id,role_id__in=["worker", "Worker"])
            except UserProfileObj.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'worker not found'})
            
            # Create a serializer instance with the existing object
            serializer = UserSerializer(UserProfileObj)
             # Validate the serializer
            if serializer:
                detail=serializer.data
                country_id = detail['country_id']
                if country_id:
                    country_obj = Country.objects.get(id=country_id)
                    detail["country_name"] = country_obj.name
                    detail["country_flag"] = country_obj.flag_url 
                    detail["country_code"] = country_obj.code  
                    detail["country_dial_code"] = country_obj.dial_code
                return Response({'message': 'successfully', 'code': 200,'data':detail})
            else:
                return Response({'error':serializer.errors, 'code':status.HTTP_400_BAD_REQUEST})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
'''Create Report of User by worker'''

class CreateUserReport(APIView):

    '''Create Report of User by worker'''

    def post(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        user_id = request.data.get('user_id')
        
        user_role_id = list(UserProfile.objects.filter(id=user_id).values("role_id"))[0]["role_id"]
        
        if user_role_id =="user":
            database_user_id="user_id"
        else:
            database_user_id="sponser_id"
        # import pdb; pdb.set_trace()
        subject_line = request.data.get('subject_line')
        content = request.data.get('content')

        video_link = request.data.get('video_link')

        file_attachment = request.FILES.getlist('file')
        

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            worker_id = decoded_token['user_id']  
            language = UserProfile.objects.filter(id=worker_id).values("language")[0]["language"]
            
            
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'})
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'})
        
        try:
            user_profile = UserProfile.objects.get(id=worker_id)
          
            serializer = CreateReportSerializer(data={database_user_id:user_id,'worker_id': worker_id, 'subject_line': subject_line,'content':content})
            if serializer.is_valid():
                serializer.save()
                report_id = serializer.instance.report_id
                if video_link:
                    report_video_serializer = CreateReportAttachmentSerializer(data={'report_id':report_id,'video_link': video_link})
                    if report_video_serializer.is_valid():
                        report_video_serializer.save()

                if file_attachment:
                    for img_file in file_attachment:
                        target_folder = os.path.join('videos', str(f"user_warning_report_{report_id}"))
                        unique_filename = f"warning_report_{img_file.name}"
                        
                        os.makedirs(target_folder, exist_ok=True)
                        full_path = os.path.join(target_folder, unique_filename)
                        
                        with open(full_path, "wb+") as image_file:
                            # Seek to the beginning of the file
                            img_file.seek(0)
                            
                            img_file.seek(0)
                            image_file.write(img_file.read())
                        image_path = os.path.join(settings.MEDIA_URL, str(f"user_warning_report_{report_id}"), unique_filename)
                        base_url = config('SERVER_BASE_URL')
                        # image_link = base_url + image_path
                        image_link = image_path

                        # encoded_image = base64.b64encode(file.read()).decode('utf-8')
                        report_image_serializer = CreateReportAttachmentSerializer(data={'report_id':report_id,'file_image': image_link})
                        if report_image_serializer.is_valid():
                            report_image_serializer.save()
                message = get_translation(language, 'report_created')
                return Response({'code':201,'message': message})
            else:
                return Response({'code':401,'error':serializer.errors})

        except UserProfile.DoesNotExist:
            return Response({'code':404,'error': 'Worker not found'})
        
class SponsorAssociatedWorkerDetailsAPIView(APIView):
    def get(self,request):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                worker_id =  decoded_token['user_id']
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            sponser_id = int(request.GET.get("sponser_id",None))
            
            try:
                SponserHistoryObj = SponserHistory.objects.get(sponser_id=sponser_id,worker_id=worker_id,current_status="accepted",end_datetime__isnull=True)
            except SponserHistory.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Sponser History not found.'})
            
            start_datetime =SponserHistoryObj.start_datetime 
            current_date_time = datetime.now(timezone.utc)
            difference = current_date_time - start_datetime
            total_days = difference.days
            
            try:
                RequestCoinClaimObj = RequestCoinClaim.objects.filter(sponser_id=sponser_id,worker_id=worker_id,request_status="paid")
            except RequestCoinClaim.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Coin request not found.'})
            
            count_of_payment_received = RequestCoinClaimObj.count()
            total_money_received =  Decimal('0.00')
            bank_count = 0
            binance_count = 0
            for recieved_money in RequestCoinClaimObj:
                total_money_received+=recieved_money.amount
                if recieved_money.bank_received == True:
                    bank_count+=1
                else:
                    binance_count+=1
                    
            if bank_count>binance_count:
                frequent_payment_method = "Bank"
            else:
                frequent_payment_method = "Binance"
            
            user_obj = UserProfile.objects.get(id=sponser_id)
            
            data={}
            data["sponsor_name"] = user_obj.display_name
            data["sponsorship_days"]=total_days
            data["total_money_received"] = total_money_received
            data["count_of_payment_received"] = count_of_payment_received
            data["frequent_payment_method"]=frequent_payment_method
            return Response({'message': 'successfully', 'code': 200,'data':data})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
class CheckLoginPermissionAPIView(APIView):
    def get(self,request):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            user_id = int(request.GET.get("user_id"))
            
            try:
                UserProfileObj = UserProfile.objects.get(id=user_id,is_active=True)
            except UserProfile.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'User not found.'})
            
            
            data={}
            data["login_permission"]=UserProfileObj.login_permission
            return Response({'message': 'successfully', 'code': 200,'data':data})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class UpdateOnlineAndOfflineStatusAPIView(APIView):
    def post(self,request):
        try: 
            # secret_key = config('SECRET_KEY')
            # token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            # try:
            #     decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            # except jwt.ExpiredSignatureError:
            #     return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            # except jwt.InvalidTokenError:
            #     return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            user_id = request.data.get("user_id")
            status = request.data.get("status")
            
            try:
                UserProfileObj = UserProfile.objects.get(id=user_id,is_active=True)
            except UserProfile.DoesNotExist:
                return Response({'code':404,'error': 'User not found.'})
            UserProfileObj.status = status
            UserProfileObj.save()
            
            data={}
            data["status"]=UserProfileObj.status
            return Response({'message': 'successfully', 'code': 200,'data':data})

        except Exception as e:
            return Response({"error":str(e),'code':400})
        
        
       
class TotalCoinOfWorkerAPIView(APIView):
    def get(self,request):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                worker_id =  decoded_token['user_id']
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
            try:
                UserProfileObj = UserProfile.objects.get(id=worker_id,is_active=True)
            except UserProfile.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'User not found.'})                
            data={}
            data["Total_earn_coin"]=UserProfileObj.total_earn_coin
            return Response({'message': 'successfully', 'code': 200,'data':data})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
       
class GetSponsorDetailOfWorkerAPIView(APIView):
    def get(self,request):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                worker_id =  decoded_token['user_id']
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            try:
                SponserHistoryObj = SponserHistory.objects.get(worker_id=worker_id,current_status="accepted")
            except SponserHistory.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': 'Sponser not found.'})
            sponser_id = SponserHistoryObj.sponser_id_id
            #print(sponser_id)
            user_obj = UserProfile.objects.get(id=sponser_id,is_active=True)
            
            data={}
            data["sponser_id"] = sponser_id
            data["sponsor_name"] = user_obj.display_name
            
            return Response({'message': 'successfully', 'code': 200,'data':data})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
        
#name -  coin list
#utility - returns list of coin with filter,search,sorting and pagination
class CoinListForWorkerAPIView(APIView):
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
            
            queryset = CoinManagement.objects.filter(is_active=True,is_customer=False).order_by('-id')
            if search_field!=None:
                queryset = queryset.filter(Q(amount=search_field)) 
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
                serializer = CoinManagementSerializer(queryset, many=True)
                data = serializer.data
                
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})   
        
        
        
#name -  gift list
#utility - returns list of coin with filter,search,sorting and pagination
class GiftListForWorkerAPIView(APIView):
    def get(self, request):
        try:
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            call_id = request.GET.get("call_id",None)
            
            WorkerCallEarning=list(CallSession.objects.filter(vid=call_id).values("call_earning","call_started_by","call_received_by","is_demo_call"))

            
            if WorkerCallEarning[0]["is_demo_call"] == True:
                
                Fav=Favorite.objects.filter(customer_id=WorkerCallEarning[0]["call_received_by"],worker_id=WorkerCallEarning[0]["call_started_by"]).exists()
                if Fav==True:
                    favorite=True
                else:
                    favorite=False    
            else:
                Fav=Favorite.objects.filter(customer_id=WorkerCallEarning[0]["call_started_by"],worker_id=WorkerCallEarning[0]["call_received_by"]).exists()
                if Fav==True:
                    favorite=True
                else:
                    favorite=False    
            
                    
            queryset = GiftManagement.objects.filter(call_id=call_id,is_active=True).order_by('-id')
            
            if queryset:
                if search_field!=None:
                    queryset = queryset.filter(Q(gift_name__icontains=search_field)) 
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
                    serializer = GiftManagementSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        gift_name = item["gift_name"]
                        gift_obj = GiftGallery.objects.filter(name= gift_name).first()
                        if gift_obj:
                            item["gift_image"]=gift_obj.gift_image
                        
                    result ={"WorkerCallEarning":WorkerCallEarning[0]["call_earning"],"favorite":favorite,"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result)
                
            result ={"WorkerCallEarning":WorkerCallEarning[0]["call_earning"],"favorite":favorite,"data" :[],"count":0,'code':status.HTTP_200_OK,'message': 'success'}
            return Response(data=result)    
                
        except Exception as e:
            return Response({"code":400,"error": str(e)})   
        
        
        

class WorkerCoinClaimSelectedlistAPIView(APIView):
    def get(self, request):
        try:
            
            search_field = request.GET.get("search",None)
            ordering_field = request.GET.get("ordering",None)  
            sortingOrder = request.GET.get("sortingOrder",None)  
            limit = int(request.GET.get("limit",5)) 
            page = int(request.GET.get("page",0))
            skip = limit*page-limit
            call_id = request.GET.get("call_id",None)
            
            WorkerCallEarning=list(CallSession.objects.filter(vid=call_id).values("call_earning"))[0]["call_earning"]

            queryset = GiftManagement.objects.filter(call_id=call_id,is_active=True).order_by('-id')
            if search_field!=None:
                queryset = queryset.filter(Q(gift_name__icontains=search_field)) 
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
                serializer = GiftManagementSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    gift_name = item["gift_name"]
                    gift_obj = GiftGallery.objects.filter(name= gift_name).first()
                    if gift_obj:
                        item["gift_image"]=gift_obj.gift_image
                    
                result ={"WorkerCallEarning":WorkerCallEarning,"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})   
        