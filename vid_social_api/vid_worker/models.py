from django.db import models
# Create your models here.
from vid_user.models import UserProfile


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/{1}'.format(instance.user_id, filename)

class Video(models.Model):
    #title = models.CharField(max_length=255)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE,null =True)
    video_file = models.FileField(upload_to=user_directory_path)