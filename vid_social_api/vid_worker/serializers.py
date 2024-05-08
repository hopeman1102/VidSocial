from rest_framework import serializers
from vid_user.models import UserProfile,UserGallery,SponserHistory,Report,ReportAttachment,RequestCoinClaim
from vid_worker.models import Video

class UploadedIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('id_image','video_link','profile_image')

class UploadedGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGallery
        fields = ('user_id','image','detail')

class CreateSponserRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponserHistory
        fields = ('sponser_id','worker_id')        

class CreateReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'      

class CreateReportAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAttachment
        fields = '__all__'                       

class RequestCoinClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestCoinClaim
        fields = '__all__'                       

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'

    def create(self, validated_data):
        user_id = self.context['request'].data.get('user_id')  # Adjust this based on how you pass user_id
        video_file = validated_data.get('video_file')
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError({"user_id": "Invalid user ID"}) 
        existing_video = Video.objects.filter(user=user).first()
        if existing_video:
            existing_video.video_file.delete(save=True)  # Delete the existing video file
            existing_video.video_file = video_file
            existing_video.save()
            return existing_video
        else:
            video_instance = Video.objects.create(user=user, video_file=video_file)
            return video_instance      