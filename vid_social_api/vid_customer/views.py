from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from vid_user.models import Favorite,UserProfile,Review,CallSession,CoinManagement,GiftManagement,CallDeductionCoin
from .models import *
from rest_framework.views import APIView
from rest_framework import status

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
import jwt
from datetime import datetime, timedelta
from vid_user.serializers import *
from decouple import config
from django.db.models import Q
from django.db.models import Sum ,Avg, Count, ExpressionWrapper, DurationField

import requests
import hashlib
import hmac
from django.db.models import F 
import random
import time
import json
import base64
from decimal import Decimal
import os
from django.conf import settings
# Create your views here.
#KD work start by hear.
        
class AssignFavWorkerAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                CustomerId = decoded_token['user_id']  # Extract the user_id from the decoded token

                WorkerId = request.data.get("WorkerId",None)
                Status = request.data.get("Status",None)
                if Status==True :
                    queryset=Favorite.objects.filter(customer_id=CustomerId,worker_id=WorkerId).values()
                    if queryset:
                        # queryset=Favorite.objects.filter(customer_id=CustomerId,worker_id=WorkerId).update(is_active=True)
                        return Response({'code':200,'message': f' Favourate successfully'}, status=status.HTTP_200_OK) 
                    else:
                        FavCreate=Favorite()
                        FavCreate.customer_id=UserProfile.objects.get(id=CustomerId)
                        FavCreate.worker_id=UserProfile.objects.get(id=WorkerId)
                        FavCreate.is_active = True
                        FavCreate.save()
                    return Response({'code':200,'message': f'Favourate successfully'}, status=status.HTTP_200_OK)    
                else:
                    queryset=Favorite.objects.filter(customer_id=CustomerId,worker_id=WorkerId).delete()
                    return Response({'code':200,'message': f' Unfavourate successfully'}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)       
        
        
class CreateReviewAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                CustomerId = decoded_token['user_id']  # Extract the user_id from the decoded token

                WorkerId = request.data.get("WorkerId",None)
                Rating = int(request.data.get("rating",None))
                like = int(request.data.get("like"))
                

                if Rating > 5:
                    return Response({'code':401,'message':'Please provide a valid rating between 1 to 5'}, status=status.HTTP_200_OK)
                    
                if Rating >= int(config('RATING')):
                    like=True
                elif Rating  ==  None:
                    like=True
                else:
                    like=False    
                    
                         
                Content = request.data.get("content",None)
                ReviewObj=Review()
                ReviewObj.customer_id=UserProfile.objects.get(id=CustomerId)
                ReviewObj.worker_id=UserProfile.objects.get(id=WorkerId)
                ReviewObj.rating=Rating
                ReviewObj.content=Content
                ReviewObj.like=like
                ReviewObj.save()
                
                return Response({'code':200,'message':'Rating created successfully'}, status=status.HTTP_200_OK)    
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=200)   
        
class VideoCallStartAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            from datetime import datetime,timezone
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                role_id = decoded_token['role_id']  # Extract the user_id from the decoded token
                caller_id = decoded_token['user_id']
                receiver_id = request.data.get("receiver_id",None)

                if role_id == "worker":
                    is_demo_call=True
                    ### receiver first call check
                    datadetail=list(UserProfile.objects.filter(id=receiver_id).values())[0]
                    totalcoin=datadetail["total_earn_coin"]
                    first_call_date=datadetail["first_call_date"]
                    
                    if first_call_date == None:
                        
                        UserProfile.objects.filter(id=receiver_id).update(first_call_date=datetime.now(timezone.utc).date())
                    
                    ### caller first call check
                    Callerdetail=list(UserProfile.objects.filter(id=caller_id).values())[0]
                    caller_first_call_date=Callerdetail["first_call_date"]
                    
                    if caller_first_call_date == None:
                        
                        UserProfile.objects.filter(id=caller_id).update(first_call_date=datetime.now(timezone.utc).date())
   
                else:
                    is_demo_call=False
                    #caller first call date store. 
                    datadetail=list(UserProfile.objects.filter(id=caller_id).values())[0]
                    totalcoin=datadetail["total_earn_coin"]
                    first_call_date=datadetail["first_call_date"]
                    
                    if first_call_date == None:
                        
                        UserProfile.objects.filter(id=caller_id).update(first_call_date=datetime.now(timezone.utc).date())
                        
                    #reciver first call date store.  

                    Receiverdetail=list(UserProfile.objects.filter(id=receiver_id).values())[0]
                    Receiver_first_call_date=Receiverdetail["first_call_date"]
                    if Receiver_first_call_date == None:
                        UserProfile.objects.filter(id=receiver_id).update(first_call_date=datetime.now(timezone.utc).date())
                        
                          
                    if totalcoin <=0:
                        return Response({'code':200,'message':'Please buy a coin'}, status=status.HTTP_200_OK)
   
                CallObj=CallSession()
                CallObj.call_started_by=UserProfile.objects.get(id=caller_id)
                CallObj.call_received_by=UserProfile.objects.get(id=receiver_id)
                CallObj.is_demo_call=is_demo_call
                CallObj.call_count = 0
                # CallObj.duration = CallObj.duration 
                CallObj.save()
                
                coin_management=CoinManagement.objects.filter(is_active=True).values()
                credit_coin=list(CallDeductionCoin.objects.filter(is_active=True).values("coin"))[0]["coin"]
                
                return Response({'code':200,'message':'Calling start successfully',"CallId":CallObj.vid,"totalcoin":totalcoin,"coin_management":coin_management,"coin_exchange_rate":credit_coin}, status=status.HTTP_200_OK)    
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)                        


class VideoCallEndAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                CallCutbyid = decoded_token['user_id']  # Extract the user_id from the decoded token
                role_id = decoded_token['role_id']
                ##############################
                CallId = request.data.get("CallId",None)
                duration = request.data.get("duration",None)
                ###############################
                
                call_detail=list(CallSession.objects.filter(vid=CallId).values())[0]
                
                if call_detail["is_demo_call"] == True:
                    Workerid=call_detail["call_started_by_id"]
                    CustomerId=call_detail["call_received_by_id"]
                   
                    duration=duration-60
                else:
                    
                    CustomerId=call_detail["call_started_by_id"]
                    Workerid=call_detail["call_received_by_id"]
                        
                
                coin_diduct=duration/60
                
                main_coin=int(((str(coin_diduct)).split('.'))[0])
                
                decimal_coin=int(((str(coin_diduct)).split('.'))[1])
                if decimal_coin>0:
                    decimal_coin=1
                else:
                    decimal_coin=0
                gift_coin=list(GiftManagement.objects.filter(call_id=CallId).values())
                
                if gift_coin:
                    total_gift_coin = 0
                    # Loop through the list and add up the 'gift_coin' values
                    for item in gift_coin:
                        total_gift_coin += item['gift_coin']
                    
                else:
                    total_gift_coin=0
                total_earning_coin=main_coin+decimal_coin+total_gift_coin

                end_datetime = datetime.utcnow()
                queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,call_earning=total_earning_coin)
                
                Customer_coin =list(UserProfile.objects.filter(id=CustomerId).values("total_earn_coin"))[0]["total_earn_coin"]
                UserProfile.objects.filter(id=CustomerId).update(total_earn_coin=Customer_coin-total_earning_coin)
                
                
                woeker_coin =list(UserProfile.objects.filter(id=Workerid).values("total_earn_coin"))[0]["total_earn_coin"]
                UserProfile.objects.filter(id=Workerid).update(total_earn_coin=woeker_coin+total_earning_coin)

                return Response({'code':200,'message':'Calling end successfully'}, status=status.HTTP_200_OK)    
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)       
        
class CheckCoinAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']  # Extract the user_id from the decoded token
                subscriber_id=list(UserProfile.objects.filter(id=user_id).values())[0]["total_earn_coin"]
                 
                return Response({'code':200,'total_coin':subscriber_id}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)          

class ProfileAPIView(APIView):

    def get(self,request):
        try:
            user_id = request.GET.get("user_id",None)
            if not user_id:
                return Response({'code':200,'message':"please provide id"})
            profile_data=list(UserProfile.objects.filter(id=user_id).values())[0]
               
            return Response({'code':200,'message':"success",'data':[profile_data]}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)   
        
class SendGiftAPIView(APIView):
    authentication_classes=()
    permission_classes=()

    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                CustomerId = decoded_token['user_id']  # Extract the user_id from the decoded token

                call_id = request.data.get("call_id",None)
                gift_name = request.data.get("gift_name",None)

                gift_coin = request.data.get("gift_coin",None)
                
                customer_obj = UserProfile.objects.get(id = CustomerId)
                earn_coin = customer_obj.total_earn_coin
                # print(earn_coin)
                if earn_coin<=0.00:
                    return Response({'code':400,'message':'You dont have sufficient balance.'}, status=status.HTTP_200_OK)
                #call_detail=list(CallSession.objects.filter(vid=call_id).values())[0]
                try:
                    call_obj = CallSession.objects.get(vid=call_id)
                except CallSession.DoesNotExist:
                    return Response({'code':404,'message':'call object not found'})
                
                # call_started_by = call_detail["call_started_by_id"]
                # call_received_by = call_detail["call_received_by_id"]
                # call_earning =call_detail["call_earning"]
                call_started_by = call_obj.call_started_by_id
                call_received_by = call_obj.call_received_by_id
                call_earning =call_obj.call_earning
                
                try:
                    call_started_by_user_obj = UserProfile.objects.get(id = call_started_by)
                except UserProfile.DoesNotExist:
                    return Response({'code':404,'message':'user not found'})
                
                try:
                    call_received_by_user_obj = UserProfile.objects.get(id = call_received_by)
                except UserProfile.DoesNotExist:
                    return Response({'code':404,'message':'user not found'})
                
                GiftObj=GiftManagement()
                GiftObj.call_id=CallSession.objects.get(vid=call_id)
                GiftObj.gift_name=gift_name
                GiftObj.gift_coin=gift_coin
                GiftObj.gifts_processed = True
                GiftObj.save()
                
                if call_started_by_user_obj.role_id=="user":
                    total_user_coin = call_started_by_user_obj.total_earn_coin
                    # total_user_coin = total_user_coin - gift_coin
                    call_started_by_user_obj.total_earn_coin = total_user_coin
                    call_started_by_user_obj.save()
                    
                elif call_received_by_user_obj.role_id=="user":
                    total_user_coin = call_received_by_user_obj.total_earn_coin
                    # total_user_coin = total_user_coin - gift_coin
                    call_received_by_user_obj.total_earn_coin = total_user_coin
                    call_received_by_user_obj.save()
                
                call_earning = call_earning+gift_coin
                call_obj.call_earning= call_earning
                call_obj.save()
                
                data={}
                data["user_total_coin"] = total_user_coin
                data["worker_total_coin"]= call_earning

                return Response({'data':data,'code':200,'message':'gift send successfully'}, status=status.HTTP_200_OK)    
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK)         
        

'''api to show comment,rating,last call detail of selected worker'''

class ViewWorkerInfo(APIView):

    def post(self, request):
        # secret_key = config('SECRET_KEY')
        # token = request.headers.get('Authorization').split(' ')[1]  
        worker_id = request.data.get("worker_id")
        from_date = request.data.get("from_date")
        to_date = request.data.get("to_date")
        
        # try:
        #     decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
        #     user_id = decoded_token['user_id']  
        # except jwt.ExpiredSignatureError:
        #         return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        # except jwt.InvalidTokenError:
        #         return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
        try:
            user_profile = UserProfile.objects.get(id=worker_id)
            registered_date = user_profile.registered_date
            first_call_date = user_profile.first_call_date
            warnings = user_profile.total_warning
            profile_image = user_profile.profile_image
            user_id = user_profile.id
            display_name = user_profile.display_name
            
            last_call_in_month = CallSession.objects.filter(Q(start_datetime__range=(from_date, to_date)) &(Q(call_started_by=worker_id) | Q(call_received_by=worker_id)) &Q(is_active=True)).count()

            last_month_reviews = Review.objects.filter(
                Q(create_date__range=(from_date, to_date)) &
                Q(worker_id=worker_id) &
                Q(is_active=True)
            ).values('rating', 'content', 'like')
            # print("---------",last_month_reviews.values())
            overall_reviews = Review.objects.filter(
                         Q(worker_id=worker_id) &
                Q(is_active=True)
            ).values('rating', 'content', 'like')                           # only for rating 
            
            rating_average = overall_reviews.aggregate(avg_rating=Avg('rating'))        #  rating is overall all review average
            contents = [review['content'] for review in last_month_reviews]

            like_count = last_month_reviews.aggregate(like_count=Count('like'))
            positive_like_count = last_month_reviews.filter(like=True).count()
            negative_like_count = last_month_reviews.filter(like=False).count()

            if like_count['like_count'] > 0:
                positive_like_percentage = round((positive_like_count / like_count['like_count']) * 100,1)
                negative_like_percentage = round((negative_like_count / like_count['like_count']) * 100,1)
            else:
                positive_like_percentage = negative_like_percentage = 0
            
            if rating_average['avg_rating'] is not None:
               rating_value = round(rating_average['avg_rating'],1)
               rating_value=Decimal(rating_value)

            else:
                rating_value = 0.00

            customer_data=[]
            all_customers = Review.objects.filter(Q(worker_id=worker_id)&Q(is_active=True)).values('customer_id','rating', 'content', 'create_date') 
            for customer in all_customers:
                customer_dict ={}
                user_profile_obj = UserProfile.objects.filter(id=customer["customer_id"],is_active=True).values("display_name","profile_image")
                if user_profile_obj:
                    customer_dict["name"] = user_profile_obj[0]["display_name"]
                    customer_dict["profile_image"] = user_profile_obj[0]["profile_image"]
                    customer_dict["rating"] = customer["rating"]
                    customer_dict["comment"] = customer["content"]
                    customer_dict["create_date"] = customer["create_date"]
                    customer_data.append(customer_dict)  
            
              
            like_count = Favorite.objects.filter(worker_id=worker_id).count() 
            
                   
            return Response({'code':200,"data":{"registered_date": registered_date,"first_call_date":first_call_date,'last_call_in_month':last_call_in_month,'rating': '{:.1f}'.format(rating_value) ,'positive_comment_percentage':positive_like_percentage,'negative_comment_percentage':negative_like_percentage,'warnings':warnings,'profile_image':profile_image,'user_id':user_id,'display_name':display_name,'like_count':like_count,'customer_detail':customer_data}})

        except Exception as e:
            return Response({"code":500,"error": str(e)})



#-----------------------neha code start here -----------------------------------


#name -  worker online list
#utility - returns list of worker online with filter,search,sorting and pagination
class WorkerOnlineListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id']
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
            #queryset = UserProfile.objects.filter(Q(account_approval_state="approve") & (Q(role_id="worker") | Q(role_id="Worker"))).filter(is_active=True).order_by('-online_date')
            queryset = UserProfile.objects.filter( (Q(status="offline") | Q(status="online"))
               & Q(account_approval_state="approve") & 
                (Q(role_id="worker") | Q(role_id="Worker"))
            ).filter(
                is_active=True,login_permission=True
            ).order_by( 
                F('status').desc(nulls_last=True), '-online_date'
            )
            if search_field!=None:
                #queryset = queryset.filter(first_name__icontains=search_field)
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
                    worker_id = item['id']
                    country_id = item['country_id']
                    review_query =Review.objects.filter(worker_id=worker_id,is_active=True).values()
                    if review_query.exists():
                        sponsor = list(review_query.values("rating"))
                        total_count = review_query.count() # Count the total number of ratings
                        total_rating = sum(item['rating'] for item in sponsor)  # Calculate the sum of all ratings

                        if total_count > 0:
                            average_rating = total_rating / total_count  # Calculate the average rating
                            rating_value = round(average_rating,1)
                            rating_value=Decimal(rating_value)
                            
                        else:
                            rating_value = 0 
                            
                            
                        item['rating'] = '{:.1f}'.format(rating_value)
                        # item['like'] = sponsor["like"]

                    else:
                        pass 
                    favorite =Favorite.objects.filter(worker_id=worker_id,customer_id=user_id,is_active = True).values()
                    if favorite.exists():
                        item['favorite'] =True
                    else:
                        item['favorite'] =False
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
        
#name -  worker Favourite list
#utility - returns list of worker Favourite with filter,search,sorting and pagination
class WorkerFavouriteListAPIView(APIView):
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
            queryset = Favorite.objects.filter(customer_id=user_id,is_active=True).order_by('-id')
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
                serializer = FavoriteSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker_query = UserProfile.objects.filter(id=item['worker_id'],role_id__in=["worker", "Worker"],is_active=True,account_approval_state="approve")
                    if worker_query:
                        worker =list(worker_query.values("country_id","display_name","profile_image","date_joined","online_date","status"))[0]
                        item['worker_name'] = worker["display_name"]
                        item['worker_profile_image'] = worker["profile_image"]
                        item['date_joined'] = worker["date_joined"]
                        item['online_date'] = worker["online_date"]
                        item['status'] = worker["status"]
                        country = Country.objects.get(id =worker["country_id"])
                        if country:
                            item['country_name'] = country.name
                            item['country_flag_url'] = country.flag_url
                        review_query = Review.objects.filter(worker_id=item['worker_id'],customer_id = user_id)
                        if review_query:
                            review_obj = review_query.values("rating","like")[0]
                            item['rating']=review_obj["rating"]
                            item['like'] = review_obj["like"]
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
#name -  coin list
#utility - returns list of coin with filter,search,sorting and pagination
class CoinListAPIView(APIView):
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
            
            queryset = CoinManagement.objects.filter(is_active=True,is_customer=True).order_by('-id')
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
    
class ViewUserInfo(APIView):
    def post(self, request):
        # secret_key = config('SECRET_KEY')
        # token = request.headers.get('Authorization').split(' ')[1]  
        worker_id = request.data.get("worker_id")
        from_date = request.data.get("from_date")
        to_date = request.data.get("to_date")

        # try:
        #     decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
        #     #user_id = decoded_token['user_id']  
        # except jwt.ExpiredSignatureError:
        #         return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        # except jwt.InvalidTokenError:
        #         return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        
        try:
            user_profile = UserProfile.objects.get(id=worker_id)
            registered_date = user_profile.registered_date
            first_call_date = user_profile.first_call_date
            warning = user_profile.total_warning
            credits = user_profile.total_earn_coin

            last_call_in_month = CallSession.objects.filter(Q(start_datetime__range=(from_date, to_date)) &(Q(call_started_by=worker_id) | Q(call_received_by=worker_id)) &Q(is_active=True)).count()

            # Calculate the average duration per call for the user
            call_sessions = CallSession.objects.filter(call_started_by_id=worker_id).exclude(duration=None)
            total_duration_seconds = sum(
                (cs.duration.hour * 3600 + cs.duration.minute * 60 + cs.duration.second)
                for cs in call_sessions
            )
            number_of_calls = call_sessions.count()
            
            if number_of_calls > 0:
                # print("total_duration_seconds",total_duration_seconds)
                # print("number_of_calls",number_of_calls)
                average_duration_seconds = total_duration_seconds / number_of_calls
                # average_duration_readable=average_duration_seconds/60
                
                average_duration_readable = round(average_duration_seconds / 60, 2)
                # average_duration_readable = str(
                #     timedelta(seconds=average_duration_seconds)
                # )  # Convert average duration to HH:MM:SS format
            else:
                average_duration_readable = "0.00"
            
           
            return Response({'code':200,"data":{"registered_date": registered_date,"first_call_date":first_call_date,'last_call_in_month':last_call_in_month,'average_call_duration':average_duration_readable,'warning':warning,'credits':credits}})

        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
class HelpAndSupportAPIView(APIView):
     def post(self,request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id'] 
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]

            message = request.data.get("message",None)
            if not message:
                return Response({'message':'Please provide message', 'code':status.HTTP_400_BAD_REQUEST})
            
            try:
                user_obj = UserProfile.objects.get(id = user_id)
                user_name = user_obj.display_name
            except UserProfile.DoesNotExist:
                return Response({"message":'user not found','code':status.HTTP_400_BAD_REQUEST})
            
            help_support_obj=HelpAndSupport()
            help_support_obj.user_id = user_obj
            help_support_obj.user_name = user_name
            help_support_obj.message = message
            help_support_obj.save()
           
            message = get_translation(language, 'send_request')
            return Response({'message':message, 'code':201})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
class UpdateProfileAPIView(APIView):
    def post(self,request):
        try: 
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id'] 
                
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
                
            language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
            first_name=request.data.get("first_name")
            last_name = request.data.get("last_name")
            display_name = request.data.get('display_name')
            profile_image = request.data.get('profile_image')
            profile_url_data=profile_image

            
            try:
                UserProfileObj = UserProfile.objects.get(id=user_id)
            except UserProfile.DoesNotExist:
                return Response({'code':status.HTTP_404_NOT_FOUND,'error': ' not found'})
            # if profile_image:
            #     encoded_image = base64.b64encode(profile_image.read()).decode('utf-8')
            #     UserProfileObj.profile_image = encoded_image
                
            if profile_url_data:
                file_extension = os.path.splitext(profile_url_data.name)[1]
                
                target_folder = os.path.join('videos', str(user_id))
                
                unique_filename = f"{profile_url_data.name}"
                os.makedirs(target_folder, exist_ok=True)
                full_path = os.path.join(target_folder, unique_filename)
                # print("full_path", full_path)
                
                with open(full_path, "wb+") as image_file:
                    # Seek to the beginning of the file
                    profile_url_data.seek(0)
                    # print("File Content:", profile_url_data.read())
                    profile_url_data.seek(0)
                    image_file.write(profile_url_data.read())
                
                image_path = os.path.join(settings.MEDIA_URL, str(user_id), unique_filename)
                base_url = config('SERVER_BASE_URL')
                # image_link = base_url + image_path
                
                image_link = image_path
                
                UserProfileObj.image_url_link = image_link
                UserProfileObj.profile_image = image_link

                
            if first_name:
                UserProfileObj.first_name = first_name
            if last_name:
                UserProfileObj.last_name = last_name
            if display_name:
                UserProfileObj.display_name = display_name
            
            UserProfileObj.save()
            serializer = UserSerializer(UserProfileObj)
            
            message = get_translation(language, 'profile_updated_successfully')
            # print("serializer.data",serializer.data)
            detail=serializer.data
            country_id = detail['country_id']
            if country_id:
                
                country_obj = Country.objects.get(id=country_id)
                detail["country_name"] = country_obj.name
                detail["country_flag"] = country_obj.flag_url 
                detail["country_code"] = country_obj.code
            return Response({'message': message, 'code': 200,'data':detail})

        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
    
import base64
import hashlib
import json
import uuid
import requests        
        
# CRYPTOMUS_API_KEY = "ZIHZXQUVzx8KKt03cCYMKQxcG6m6cr0QM19dsQ9rcsyEvFeKet4oRxvkQq2f8LtBOC7a7xvFTgYY7ZClWH4wC8vglfdD7aRMSW7tH3KXAtPRUtuFRp8UfYEy28at1hxL"
# CRYPTOMUS_MERCHANT_ID = "3e4255ea-e5f2-4c23-a9c1-a9cc4b9deb8c"   

CRYPTOMUS_API_KEY = config('CRYPTOMUS_API_KEY')
CRYPTOMUS_MERCHANT_ID = config('CRYPTOMUS_MERCHANT_ID')
SERVER_BASE_URL = config('SERVER_BASE_URL')
     
def make_request(url, invoice_data):
    try:
        encoded_data = base64.b64encode(json.dumps(invoice_data).encode("utf-8")).decode("utf-8")
        signature = hashlib.md5(f"{encoded_data}{CRYPTOMUS_API_KEY}".encode("utf-8")).hexdigest()
        headers = {
            "merchant": CRYPTOMUS_MERCHANT_ID,
            "sign": signature,
        }
        response = requests.post(url=url, json=invoice_data, headers=headers)
        # print("response",response)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return response.json()

def initiate_binance_pay(buy_credit_id,amount):
    
    try:

        invoice_data = make_request(
        url="https://api.cryptomus.com/v1/payment",
        invoice_data={
            
            "amount": str(amount),
            "currency": "USD",
            "order_id": str(buy_credit_id),
            "lifetime":1200,
            # "to_currency": "BTC",
            "url_callback":f"{SERVER_BASE_URL}/vid_user/binance/webhook-url/",
            "url_return": f"{SERVER_BASE_URL}/vid_user/binance/payment_cancel_url/",
            "url_success": f"{SERVER_BASE_URL}/vid_user/binance/payment_success_url/"
        })
        return invoice_data # Handle the response here
        # Redirect user to the payment page if needed
    except Exception as e:
        return Response({"code":400,"error": str(e)})


# class BinancePayAPIView(APIView):

#     def initiate_binance_pay(self,buy_credit_id,amount,ExpTime,coin_alloted):
#         chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
#         nonce = ''.join(random.choice(chars) for _ in range(32))
#         timestamp = str(round(time.time() * 1000))
        
#         # Get the current date
#         current_date = datetime.now()
#         # Add 15 days to the current date
#         # expiry_date = current_date + timedelta(days=15)
#         expiry_date = current_date + timedelta(seconds=ExpTime)
#         # Calculate the expiry date in milliseconds since the Unix epoch
#         expiry_ms =  int(expiry_date.timestamp() * 1000)
#         ######## jwt token ###############
#         secret_key = config('SECRET_KEY')
#         access_token_time_in_mint = 1440
#         access_token = jwt.encode({
#                     'order_id': buy_credit_id,
#                     'exp': datetime.utcnow() + timedelta(minutes=access_token_time_in_mint)  # Access token expires in 1 day
#                 }, secret_key, algorithm='HS256')
#         print("access_token",access_token)
        
#         request = {
#             "env": {
#                 "terminalType": "APP"
#             },
#             "merchantTradeNo": buy_credit_id,
#             "orderAmount": int(amount),
#             "currency": "USDT",
#             "goods": {
#                 "goodsType": "01",
#                 "goodsCategory": "D000",
#                 "referenceGoodsId": "7876763A3B",
#                 "goodsName": f"{coin_alloted} credits",
#                 "goodsDetail": f"If you pay {int(amount)} USDT,you will get {coin_alloted} credits"
#             },
#             "orderExpireTime" :expiry_ms,
#             "cancelUrl":f"http://103.117.65.42:8000/vid_user/binance/payment_cancel_url/?data={access_token}",
#             "returnUrl":f"http://103.117.65.42:8000/vid_user/binance/payment_success_url/?data={access_token}",
#         }
        
#         jsonRequest = json.dumps(request)
#         print("jsonRequest",jsonRequest)
#         payload = f"{timestamp}\n{nonce}\n{jsonRequest}\n"
#         binancePayKey = config('BINANCEPAYKEY')
#         binancePaySecret = config('BINANCEPAYSECRET')

#         signature = hmac.new(binancePaySecret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha512).hexdigest().upper()

#         headers = {
#             "Content-Type": "application/json",
#             "BinancePay-Timestamp": timestamp,
#             "BinancePay-Nonce": nonce,
#             "BinancePay-Certificate-SN": binancePayKey,
#             "BinancePay-Signature": signature
#         }

#         try:
#             response = requests.post("https://bpay.binanceapi.com/binancepay/openapi/v2/order", data=jsonRequest, headers=headers)
#             return response.json()  # Handle the response here
#             # Redirect user to the payment page if needed
#         except Exception as e:
#             return Response({"code":400,"error": str(e)})


class BuyCreditAPIView(APIView):
     def post(self,request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id'] 
                
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            credit_coin_id = request.data.get("credit_coin_id",None)
            
            ExpTime = request.data.get("ExpTime",None)
            if not credit_coin_id:
                return Response({'message':'Please provide credit coin id', 'code':status.HTTP_400_BAD_REQUEST})
          
            try:
                user_obj = UserProfile.objects.get(id = user_id)
            except UserProfile.DoesNotExist:
                return Response({"message":'user not found','code':status.HTTP_400_BAD_REQUEST})
            
            try:
                coin_obj = CoinManagement.objects.get(id = credit_coin_id)
            except CoinManagement.DoesNotExist:
                return Response({"message":'credit coin not found','code':status.HTTP_400_BAD_REQUEST})
            
            BuyCredit_obj=BuyCredit()
            BuyCredit_obj.customer_id = user_obj
            BuyCredit_obj.amount = coin_obj.amount
            BuyCredit_obj.coin_alloted = coin_obj.credit_coin
            BuyCredit_obj.save()

            response = initiate_binance_pay(BuyCredit_obj.buy_credit_id,BuyCredit_obj.amount)
            
            if response:
                uuid=response["result"]["uuid"]
                
                check_out_url=response["result"]["url"]
                
                buy_credit = BuyCredit.objects.get(buy_credit_id=BuyCredit_obj.buy_credit_id)
                buy_credit.check_out_url = check_out_url  
                buy_credit.uuid = uuid  
                buy_credit.save()
            
                return Response({'data':check_out_url,'message':'added request successfully', 'code':201})
            else:
                return Response({'message':"check your payment method response is null",'code':status.HTTP_400_BAD_REQUEST})
           
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
# class BuyCreditAPIView(APIView):
#      def post(self,request):
#         try:
#             secret_key = config('SECRET_KEY')
#             token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
#             try:
#                 decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
#                 user_id = decoded_token['user_id'] 
#             except jwt.ExpiredSignatureError:
#                 return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
#             except jwt.InvalidTokenError:
#                 return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
#             credit_coin_id = request.data.get("credit_coin_id",None)
#             ExpTime = request.data.get("ExpTime",None)
#             if not credit_coin_id:
#                 return Response({'message':'Please provide credit coin id', 'code':status.HTTP_400_BAD_REQUEST})
          
#             try:
#                 user_obj = UserProfile.objects.get(id = user_id)
#             except UserProfile.DoesNotExist:
#                 return Response({"message":'user not found','code':status.HTTP_400_BAD_REQUEST})
            
#             try:
#                 coin_obj = CoinManagement.objects.get(id = credit_coin_id)
#             except CoinManagement.DoesNotExist:
#                 return Response({"message":'credit coin not found','code':status.HTTP_400_BAD_REQUEST})
            
#             BuyCredit_obj=BuyCredit()
#             BuyCredit_obj.customer_id = user_obj
#             BuyCredit_obj.amount = coin_obj.amount
#             BuyCredit_obj.coin_alloted = coin_obj.credit_coin
#             BuyCredit_obj.save()
#             Binance_Pay = BinancePayAPIView()
#             # print(BuyCredit_obj.buy_credit_id,BuyCredit_obj.amount)
#             response = Binance_Pay.initiate_binance_pay(BuyCredit_obj.buy_credit_id,BuyCredit_obj.amount,ExpTime,BuyCredit_obj.coin_alloted)
#             # print("binance response::::::::::::::",response)
#             if 'data' in response:
#                 data = response["data"]
#                 bar_code_image = data["qrcodeLink"]
#                 check_out_url = data["checkoutUrl"]
                
#             buy_credit = BuyCredit.objects.get(buy_credit_id=BuyCredit_obj.buy_credit_id)
#             buy_credit.bar_code_image = bar_code_image
#             buy_credit.check_out_url = check_out_url
#             buy_credit.save()
            
#             return Response({'data':response,'message':'added request successfully', 'code':201})
           
#         except Exception as e:
#             return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class BinanceAndBankListAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                user_id = decoded_token['user_id'] 
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
    
            bank_accounts_queryset = BankAccount.objects.filter(user_id=user_id, is_active=True)
            binance_accounts_queryset = BinanceAccount.objects.filter(user_id=user_id, is_active=True)

            bank_accounts = list(bank_accounts_queryset.values())
            binance_accounts = list(binance_accounts_queryset.values())

            combined_data = {
                'bank_accounts': bank_accounts,
                'binance_accounts': binance_accounts,
                'bank_accounts_count': bank_accounts_queryset.count(),
                'binance_accounts_count': binance_accounts_queryset.count()
            }
           
            if bank_accounts or binance_accounts:
                result ={"data" :combined_data,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})    
        
        
        
class AmountDeductionOnCallAPIView(APIView):
    authentication_classes=()
    permission_classes=()
    
    def get_total_gift_coins(self,call_id):
        total_gift_coins = GiftManagement.objects.filter(call_id=call_id,gifts_processed=False).aggregate(Sum('gift_coin'))['gift_coin__sum'] or 0
        return total_gift_coins

    def post(self, request):
        try:
            # secret_key = config('SECRET_KEY')
            # # Extracting token from the request headers
            # token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            
                #decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                # CallCutbyid = decoded_token['user_id']  # Extract the user_id from the decoded token
                # role_id = decoded_token['role_id']
                ##############################
                CallId = request.data.get("CallId",None)
                
                ###############################
                call_detail=list(CallSession.objects.filter(vid=CallId).values())[0]
                
                if call_detail["is_demo_call"] == True:
                    duration = call_detail["duration"]
                    call_count = call_detail["call_count"]
                    if call_count == 0:
                        # print("it is a demo call")
                        Workerid=call_detail["call_started_by_id"]
                        CustomerId=call_detail["call_received_by_id"]
                        try:
                            worker = UserProfile.objects.get(id=Workerid)
                        except UserProfile.DoesNotExist:
                            return Response({'code':404,'message':'worker not found'})
                        try:
                            customer = UserProfile.objects.get(id=CustomerId)
                            user_total_coin = customer.total_earn_coin 
                        except UserProfile.DoesNotExist:
                            return Response({'code':404,'message':'customer not found'})
                        
                        current_datetime = datetime.combine(datetime.today(), duration)
                        new_datetime = current_datetime + timedelta(minutes=1)
                        duration = new_datetime.time()
                        
                        call_count +=1
                        end_datetime = datetime.utcnow()
                        queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,duration=duration,call_count=call_count)
                        data = {"call_started_by_id":call_detail["call_started_by_id"],
                            "call_started_by_role":worker.role_id,
                            "user_total_coin":user_total_coin,
                            "worker_total_coin":0.00,
                            "is_demo_call":call_detail["is_demo_call"]
                            }
                    else:
                        # print("it is a demo call 2")
                        try:
                            Workerid=call_detail["call_started_by_id"]
                            CustomerId=call_detail["call_received_by_id"]
                            worker_call_earning = call_detail["call_earning"]
                            total_gift_coins = self.get_total_gift_coins(CallId)
                            # print("total_gift_coins",total_gift_coins)
                            worker = UserProfile.objects.get(id=Workerid)
                            addition_amount = Decimal(1.00)
                            worker_total_coin = worker.total_earn_coin + addition_amount + total_gift_coins
                            worker_call_earning =  worker_call_earning + addition_amount + total_gift_coins
                            # print("worker_total_coin",worker_total_coin)
                            # print("total_call_earning",worker_call_earning)
                            worker.total_earn_coin = worker_total_coin
                            worker.save()
                            end_datetime = datetime.utcnow()
                            current_datetime = datetime.combine(datetime.today(), duration)
                            new_datetime = current_datetime + timedelta(minutes=1)
                            duration = new_datetime.time()
                            queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,call_earning=worker_call_earning,duration=duration)
                        except:
                            return Response({'code':404,'message':'worker not found'})
                        try:
                            customer = UserProfile.objects.get(id=CustomerId)
                            deduction_amount = Decimal(1.00)
                            customer_total_coin = customer.total_earn_coin - deduction_amount - total_gift_coins
                            customer.total_earn_coin = customer_total_coin
                            customer.save()
                            end_datetime = datetime.utcnow()
                        except:
                            return Response({'code':404,'message':'customer not found'})
                        gift_obj = GiftManagement.objects.filter(call_id=CallId).update(gifts_processed=True)
                        data = {"call_started_by_id":call_detail["call_started_by_id"],
                                "call_started_by_role":worker.role_id,
                                "user_total_coin":customer.total_earn_coin,
                                "worker_total_coin":worker_call_earning
                                }
                        # print("data",data)
                    return Response({'data':data,'code':200,'message':'success'}, status=status.HTTP_200_OK)
                else:
                    # print("it is not a demo call")
                    CustomerId=call_detail["call_started_by_id"]
                    Workerid=call_detail["call_received_by_id"]
                    duration = call_detail["duration"]
                    worker_call_earning = call_detail["call_earning"]
                    total_gift_coins = self.get_total_gift_coins(CallId)
                    try:
                        worker = UserProfile.objects.get(id=Workerid)
                        addition_amount = Decimal(1.00)
                        worker_total_coin = worker.total_earn_coin + addition_amount + total_gift_coins
                        worker_call_earning =  worker_call_earning + addition_amount + total_gift_coins
                        # print("total_gift_coins",total_gift_coins)
                        # print("worker_total_coin",worker_total_coin)
                        # print("total_call_earning",worker_call_earning)
                        worker.total_earn_coin = worker_total_coin
                        worker.save()
                        
                        current_datetime = datetime.combine(datetime.today(), duration)
                        new_datetime = current_datetime + timedelta(minutes=1)
                        duration = new_datetime.time()
                        end_datetime = datetime.utcnow()
                        queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,call_earning=worker_call_earning,duration=duration)
                    except:
                        return Response({'code':404,'message':'worker not found'})
                    try:
                        customer = UserProfile.objects.get(id=CustomerId)
                        deduction_amount = Decimal(1.00)
                        customer_total_coin = customer.total_earn_coin - deduction_amount - total_gift_coins
                        customer.total_earn_coin = customer_total_coin
                        # print("customer_total_coin",customer_total_coin)
                        customer.save()
                        end_datetime = datetime.utcnow()
                    except:
                        return Response({'code':404,'message':'customer not found'})
                    gift_obj = GiftManagement.objects.filter(call_id=CallId).update(gifts_processed=True)
                    data = {"call_started_by_id":call_detail["call_started_by_id"],
                            "call_started_by_role":customer.role_id,
                            "user_total_coin":customer.total_earn_coin,
                            "worker_total_coin":worker_call_earning
                            }
                    return Response({'data':data,'code':200,'message':'success'}, status=status.HTTP_200_OK)
                
                
            
                # print("duration002",duration)
                # coin_diduct=duration/60
                # print("coin_diduct",coin_diduct)
                # main_coin=int(((str(coin_diduct)).split('.'))[0])
                # print("main_coin",main_coin)
                # decimal_coin=int(((str(coin_diduct)).split('.'))[1])
                # if decimal_coin>0:
                #     decimal_coin=1
                # else:
                #     decimal_coin=0
                # gift_coin=list(GiftManagement.objects.filter(call_id=CallId).values())
                # print("gift_coin",gift_coin)
                # if gift_coin:
                #     total_gift_coin = 0
                #     # Loop through the list and add up the 'gift_coin' values
                #     for item in gift_coin:
                #         total_gift_coin += item['gift_coin']
                #     print(total_gift_coin)
                # else:
                #     total_gift_coin=0
                    
                # total_earning_coin=main_coin+decimal_coin+total_gift_coin
                # print("total_earning_coin",total_earning_coin)

                # end_datetime = datetime.utcnow()
                # print("end_datetime",end_datetime)
               # queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,call_earning=total_earning_coin)
                
                # Customer_coin =list(UserProfile.objects.filter(id=CustomerId).values("total_earn_coin"))[0]["total_earn_coin"]
                # UserProfile.objects.filter(id=CustomerId).update(total_earn_coin=Customer_coin-total_earning_coin)
                
                
                # woeker_coin =list(UserProfile.objects.filter(id=Workerid).values("total_earn_coin"))[0]["total_earn_coin"]
                # UserProfile.objects.filter(id=Workerid).update(total_earn_coin=woeker_coin+total_earning_coin)

                    
            
            # except jwt.ExpiredSignatureError:
            #     return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            # except jwt.InvalidTokenError:
            #     return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK) 
        
        
        
        
# class AmountDeductionOnCallAPIViewnew(APIView):
#     authentication_classes=()
#     permission_classes=()
#     def post(self, request):
#         try:    
#                 credit_coin=list(CallDeductionCoin.objects.filter(is_active=True).values("coin"))[0]["coin"]
#                 # print("credit_coin",credit_coin)
                
#                 CallId = request.data.get("CallId",None)
#                 # print("CallId",CallId)
#                 role = request.data.get("role",None)
#                 # print("role",role)
                
#                 call_detail=list(CallSession.objects.filter(vid=CallId).values())[0]
#                 # print("call_detail",call_detail)
#                 duration = call_detail["duration"]
#                 if call_detail["is_demo_call"] == True and role == "worker":
#                     print("--------worker started call--------")
                    
#                     call_count = call_detail["call_count"]
#                     if call_count == 0:
#                         print("in if condition ")
#                         print("it is a demo call")
#                         Workerid=call_detail["call_started_by_id"]
#                         CustomerId=call_detail["call_received_by_id"]
#                         try:
#                             worker = UserProfile.objects.get(id=Workerid)
#                         except UserProfile.DoesNotExist:
#                             return Response({'code':404,'message':'worker not found'})
#                         try:
#                             customer = UserProfile.objects.get(id=CustomerId)
#                             user_total_coin = customer.total_earn_coin 
#                         except UserProfile.DoesNotExist:
#                             return Response({'code':404,'message':'customer not found'})
                        
#                         current_datetime = datetime.combine(datetime.today(), duration)
#                         new_datetime = current_datetime + timedelta(minutes=1)
#                         duration = new_datetime.time()
                        
#                         call_count +=1
#                         end_datetime = datetime.utcnow()
#                         queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,duration=duration,call_count=call_count)
#                         data = {"call_started_by_id":call_detail["call_started_by_id"],
#                             "call_started_by_role":worker.role_id,
#                             "total_coin":0.00,
#                             "is_demo_call":call_detail["is_demo_call"],
#                             "user_total_coin":None
#                             }
#                         print("data",data)
#                         return Response({'data':data,'code':200,'message':'success'}, status=status.HTTP_200_OK)
                        
#                     else:
#                         print("in else condition free call second time call_count ",call_count)
                        
#                         try:
                            
#                             Workerid=call_detail["call_started_by_id"]
#                             CustomerId=call_detail["call_received_by_id"]
#                             user = UserProfile.objects.get(id=CustomerId)
#                             worker_call_earning = call_detail["call_earning"]
#                             print("worker_call_earning",worker_call_earning)
#                             if user.total_earn_coin>0:
#                                 # worker_call_earning = call_detail["call_earning"]
#                                 # print("worker_call_earning",worker_call_earning)
                                
#                                 worker = UserProfile.objects.get(id=Workerid)
#                                 addition_amount = Decimal(credit_coin) #Decimal(1.00)
#                                 print("before worker addition",worker.total_earn_coin)
#                                 worker_total_coin = worker.total_earn_coin + addition_amount 
#                                 print("after  worker addition",worker_total_coin)
#                                 worker_call_earning =  worker_call_earning + addition_amount 
#                                 worker.total_earn_coin = worker_total_coin
#                                 worker.save()
#                             else:
#                                 pass    

#                             end_datetime = datetime.utcnow()
#                             current_datetime = datetime.combine(datetime.today(), duration)
#                             new_datetime = current_datetime + timedelta(minutes=1)
#                             duration = new_datetime.time()
#                             queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,call_earning=worker_call_earning,duration=duration)
                        
#                         except:
#                             return Response({'code':404,'message':'worker not found'})
                        
                        
#                         data = {"call_started_by_id":call_detail["call_started_by_id"],
#                                 "call_started_by_role":role,
#                                 "call_received_by_id":call_detail["call_received_by_id"],
#                                 "call_received_by_role":user.role_id,
#                                 "total_coin":worker_call_earning,
#                                 "user_total_coin":user.total_earn_coin
#                                 }
#                         print("data",data)    
#                         return Response({'data':data,'code':200,'message':'success'}, status=status.HTTP_200_OK)
                
#                 elif call_detail["is_demo_call"] == True and role == "user":
#                     print("print in second elif loop demo call true and role user ")
#                     call_detail=list(CallSession.objects.filter(vid=CallId).values())[0]
#                     print("--------user received call--------")
#                     Workerid=call_detail["call_started_by_id"]
#                     CustomerId=call_detail["call_received_by_id"]
#                     duration = call_detail["duration"]
#                     worker_call_earning = call_detail["call_earning"]
#                     print("worker_call_earning",worker_call_earning)
#                     worker = UserProfile.objects.get(id=Workerid)
#                     try:
#                         customer = UserProfile.objects.get(id=CustomerId)
#                         print("customer total coin",customer.total_earn_coin)
#                         if customer.total_earn_coin >0.00:
#                             if call_detail["user_call_count"] ==0:
#                                 end_datetime = datetime.utcnow()
#                                 queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,user_call_count=1)
#                                 data = {"call_started_by_id":call_detail["call_started_by_id"],
#                                     "call_started_by_role":worker.role_id,
#                                     "call_received_by_id": call_detail["call_received_by_id"],
#                                     "call_received_by_role":role,
#                                     "total_coin":worker_call_earning,
#                                     "user_total_coin":None
#                                     }
#                             else:
                                    
#                                 deduction_amount = Decimal(credit_coin) #Decimal(1.00) 
#                                 print("before deduction on customer side ",customer.total_earn_coin)
#                                 customer_total_coin = customer.total_earn_coin - deduction_amount
#                                 print("after deduction on customer side ",customer_total_coin)
#                                 customer.total_earn_coin = customer_total_coin
#                                 customer.save()
                                
#                                 end_datetime = datetime.utcnow()

#                                 queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,call_earning=worker_call_earning)
#                                 data = {"call_started_by_id":call_detail["call_started_by_id"],
#                                         "call_started_by_role":worker.role_id,
#                                         "call_received_by_id": call_detail["call_received_by_id"],
#                                         "call_received_by_role":role,
#                                         "total_coin":worker_call_earning,
#                                         "user_total_coin":customer.total_earn_coin
#                                         }
#                         else:
                            
#                             if call_detail["user_call_count"] ==0:
#                                 end_datetime = datetime.utcnow()
#                                 queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,user_call_count=1)
#                                 data = {"call_started_by_id":call_detail["call_started_by_id"],
#                                     "call_started_by_role":worker.role_id,
#                                     "call_received_by_id": call_detail["call_received_by_id"],
#                                     "call_received_by_role":role,
#                                     "total_coin":worker_call_earning,
#                                     "user_total_coin":None
#                                     }
#                             else:
#                                 data = {"call_started_by_id":call_detail["call_started_by_id"],
#                                         "call_started_by_role":worker.role_id,
#                                         "call_received_by_id": call_detail["call_received_by_id"],
#                                         "call_received_by_role":role,
#                                         "total_coin":worker_call_earning,
#                                         "user_total_coin":customer.total_earn_coin
#                                         }
                                
#                     except:
#                         return Response({'code':404,'message':'customer not found'})
                    
#                     print("data",data)
#                     return Response({'data':data,'code':200,'message':'success'}, status=status.HTTP_200_OK)
                
#                 elif call_detail["is_demo_call"] == False and role == "user": 
#                     print("--------user started call-------- in 3rd elif loop ")
#                     print("it is not a demo call")
                    
#                     call_detail=list(CallSession.objects.filter(vid=CallId).values())[0]
                    
#                     CustomerId=call_detail["call_started_by_id"]
#                     Workerid=call_detail["call_received_by_id"]
#                     duration = call_detail["duration"]
#                     worker_call_earning = call_detail["call_earning"]
#                     print("worker_call_earning",worker_call_earning)
#                     duration = call_detail["duration"]
#                     worker = UserProfile.objects.get(id=Workerid)
#                     try:
#                         customer = UserProfile.objects.get(id=CustomerId)
#                         deduction_amount = Decimal(credit_coin) #Decimal(1.00) 
#                         print("before deduction",customer.total_earn_coin)
#                         if customer.total_earn_coin >0.00:
                            
#                             customer_total_coin = customer.total_earn_coin - deduction_amount
#                             print("aftre deduction",customer_total_coin)
#                             customer.total_earn_coin = customer_total_coin
#                             customer.save()
                            
#                     except:
#                         return Response({'code':404,'message':'customer not found'})
                    
#                     data = {"call_started_by_id":call_detail["call_started_by_id"],
#                             "call_started_by_role":role,
#                             "call_received_by_id": call_detail["call_received_by_id"],
#                             "call_received_by_role":worker.role_id,
#                             "total_coin":worker_call_earning,
#                             "user_total_coin":customer.total_earn_coin
#                             }
#                     print("data",data)
#                     return Response({'data':data,'code':200,'message':'success'}, status=status.HTTP_200_OK)
                
#                 else: 
#                     #call_detail=list(CallSession.objects.filter(vid=CallId).values())[0]
#                     print("--------worker received call-------- in else conditoin ", )
#                     try:
#                         CustomerId=call_detail["call_started_by_id"], 
#                         Workerid=call_detail["call_received_by_id"]
#                         worker_call_earning = call_detail["call_earning"]
#                         print("worker_call_earning",worker_call_earning)
#                         duration = call_detail["duration"]
                        
#                         worker = UserProfile.objects.get(id=Workerid)
#                         addition_amount = Decimal(credit_coin) #Decimal(1.00) 
                        
#                         customer = UserProfile.objects.get(id=CustomerId)
#                         if customer.total_earn_coin >0.00:
                            
#                             print("before addition",worker.total_earn_coin)
#                             worker_total_coin = worker.total_earn_coin + addition_amount 
#                             print("after addition",worker_total_coin)
#                             worker_call_earning =  worker_call_earning + addition_amount 
                            
#                             worker.total_earn_coin = worker_total_coin
#                             worker.save()
#                         else:
#                             pass    
                        
#                         end_datetime = datetime.utcnow()
#                         current_datetime = datetime.combine(datetime.today(), duration)
#                         new_datetime = current_datetime + timedelta(minutes=1)
#                         duration = new_datetime.time()
#                         # user = UserProfile.objects.get(id=CustomerId)
#                         print("CallId",CallId)
#                         queryset=CallSession.objects.filter(vid=CallId).update(end_datetime=end_datetime,call_earning=worker_call_earning,duration=duration)
                    
#                     except Exception as e:
#                         return Response({'code':404,'message':e})
                    
#                     data = {"call_started_by_id":call_detail["call_started_by_id"],
#                             "call_started_by_role":worker.role_id,
#                             "call_received_by_id":call_detail["call_received_by_id"],
#                             "call_received_by_role":role,
                            
                         
#                             "user_total_coin":customer.total_earn_coin
#                             }
#                     print("data",data)
#                     return Response({'data':data,'code':200,'message':'success'}, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             print("dataaaa",e)
#             return Response(data={'code':400,'message': str(e)}, status=status.HTTP_200_OK) 
        
        
        
       
class AddCoinInUserAccountAPIViewnew(APIView):
    def post(self, request):
        try:
            coin = request.data.get("coin",None)
            user_id = request.data.get("user_id",None)
            try:
                user_obj = UserProfile.objects.get(id=user_id, is_active=True)
            except UserProfile.DoesNotExist:
                return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'User not found'})
            
            total_earn_coin = user_obj.total_earn_coin 
            total_earn_coin+=Decimal(coin)
            user_obj.total_earn_coin = total_earn_coin
            user_obj.save()

            
            result ={"data" :user_obj.total_earn_coin,'code':status.HTTP_200_OK,'message': 'success'}
            return Response(data=result)
           
        except Exception as e:
            return Response({"code":400,"error": str(e)})    
        