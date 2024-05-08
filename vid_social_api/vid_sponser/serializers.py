from rest_framework import serializers
from vid_user.models import BinanceAccount

class BinanceAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinanceAccount
        fields = '__all__'