
from django.conf import settings
import os
from decouple import config
from vid_user.models import UserProfile
from rest_framework.response import Response
from moviepy.editor import VideoFileClip
from rest_framework import status

from celery import shared_task
from celery import Celery
import base64
app = Celery('tasks', broker= "redis://127.0.0.1:6379")


def check_video_corruption(file_path):
        try:
            video = VideoFileClip(file_path)
            # If the video is readable without errors, return True (not corrupted)
            return True
        except Exception as e:
            # If an error occurs during reading, it might indicate corruption or issues
            # print(f"Video file is corrupted or unreadable: {e}")
            return False

@app.task
def process_video_upload(user_id, file_content, file_name):
 
    
    target_folder = os.path.join('videos',str(user_id))
    os.makedirs(target_folder, exist_ok=True)
    full_path = os.path.join(target_folder, file_name)
    
    with open(full_path, 'wb') as destination:
        destination.write(file_content)
        
    is_corrupted = check_video_corruption(full_path)
    if not is_corrupted:
        return Response({'code':status.HTTP_400_BAD_REQUEST,'error': 'Video file is corrupted or unreadable'})
    video_path = os.path.join(settings.MEDIA_URL,str(user_id), file_name)
    base_url = config('SERVER_BASE_URL')
    # video_link =base_url+video_path
    video_link =video_path
    # try:
    #     user = UserProfile.objects.get(id=user_id)
    #     if user:
    #         user.video_link = video_link
    #         user.signup_step = 3
    #         user.account_approval_state = "none"
    #         user.save()
    try:
        user = UserProfile.objects.get(id=user_id)
        # print(user_id)
        if user:
            user.video_link = video_link
            user.signup_step = 3
            user.account_approval_state = "none"
            user.save()
            return Response({'data':video_link,'code':200,'message': 'Video uploaded successfully'})
    except UserProfile.DoesNotExist:
         return Response({'code':404,'error': 'User not found'})
    
    
    
@app.task 
def send_email_background(user_email, email_content):
    from django.core.mail import send_mail
    from django.conf import settings

    from_mail = config('DEFAULT_FROM_EMAIL')

    send_mail(
        'Coin Deduction Mail',
        email_content,
        from_mail,
        [user_email],
        html_message=email_content,
    )

@app.task 
def send_background_email(user_email, email_content):
    from django.core.mail import send_mail
    from django.conf import settings

    from_mail = config('DEFAULT_FROM_EMAIL')
    

    send_mail(
        'Payment Confirmation Mail',
        email_content,
        from_mail,
        [user_email],
        html_message=email_content,
    )    
    
@app.task 
def send_email_background_for_inquiry(user_email, email_content):
    from django.core.mail import send_mail
    from django.conf import settings

    from_mail = config('DEFAULT_FROM_EMAIL')

    send_mail(
        'Your Inquiry',
        email_content,
        from_mail,
        [user_email],
        html_message=email_content,
    )    