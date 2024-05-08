from rest_framework.response import Response
from .models import *
from rest_framework.views import APIView
from decouple import config
import base64
from django.contrib.auth.models import User
import jwt 
from rest_framework import status
from vid_user.models import UserProfile,SponserHistory,RequestCoinClaim,BankAccount,BinanceAccount,Country,CallDeductionCoin
from rest_framework import generics
from .serializers import BinanceAccountSerializer
from vid_user.serializers import *
from django.db.models import Q

from datetime import datetime
import arrow
from datetime import date
from decimal import Decimal
from PIL import Image
import io
import base64
from django.conf import settings
import os
from vid_worker.task import send_email_background,send_background_email

#accept or rejection status of worker by sponser
# url :-{{base_url}}/vid_sponser/WorkerPaymentRequestStatus/
# method:- post 
# json:- {
#     "WorkerId":2,
#     "Status":"cancel" or "Status":"accepted"
# }
class WorkerRequestStatusAPIView(APIView):
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
                WorkerId = request.data.get("WorkerId",None)
                Status = request.data.get("Status",None)
                request_id =request.data.get("request_id",None)
                
                if Status=="accepted" or Status==True :
                    subscriber_id=UserProfile.objects.filter(id=WorkerId).update(sponser_id=SponserId) 
                    subscriber_id=SponserHistory.objects.filter(worker_id=WorkerId,sponser_id=SponserId,is_active=True,end_datetime__isnull=True).update(current_status=Status) 
                else:
                    subscriber_id=UserProfile.objects.filter(id=WorkerId).update(sponser_id=None) 
                    end_datetime = datetime.utcnow()
                    subscriber_id=SponserHistory.objects.filter(worker_id=WorkerId,sponser_id=SponserId,is_active=True).update(current_status=Status,end_datetime= end_datetime)    
                return Response({'code':200,'message': f'Worker Profile {Status} successfully'}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"code":400,"error": str(e)})      


#accept or paid or cancel status update 
# url :-{{base_url}}/vid_sponser/WorkerRequestStatus/
# method:- post 
# json:- {
#     "id":id,
#     "Status":"cancel" ,or "Status":"accepted" or "Status":"paid"
#      "TransactionId": null
# }
class WorkerPaymentRequestStatusAPIView(APIView):
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
                if Status=="paid":
                    file = request.data.get('file')
                    TransactionId=request.data.get('TransactionId',None)
                    if not file:
                        return Response({'code':400,'error': 'File not found'}, status=status.HTTP_200_OK)
                    encoded_image=base64.b64encode(file.read()).decode('utf-8')
                    subscriber_id=RequestCoinClaim.objects.filter(id=id).update(request_status=Status,receipts_image=encoded_image,transaction_id=TransactionId)  
                    return Response({'code':200,'message': f'Worker payment {Status} successfully'}, status=status.HTTP_200_OK) 

                WorkerId=RequestCoinClaim.objects.filter(request_id=id).values("worker_id","coin_claim")[0]
                print("WorkerId",WorkerId)
                userobj=UserProfile.objects.get(id=WorkerId["worker_id"])
                userobj.total_earn_coin=userobj.total_earn_coin + WorkerId["coin_claim"]
                userobj.save()
                
                request_coin_obj=RequestCoinClaim.objects.filter(request_id=id).update(request_status=Status)  
                try:
                    worker_payment_request = RequestCoinClaim.objects.get(request_id=id)
                except RequestCoinClaim.DoesNotExist:
                    return Response({"code": 404, "message": "Request not found"})
                try:
                    worker_obj = UserProfile.objects.get(id = worker_payment_request.worker_id_id,is_active=True)
                except Exception as e:
                    return Response(data={"code":404,"message":"worker not found"})
                user_email = worker_obj.email
                
                server_base_url = config('SERVER_BASE_URL')
                logo =server_base_url+'/media/email_images/logo.png'

                create_date_str=worker_payment_request.request_date

                formatted_date_str = create_date_str.strftime("%B %d, %Y").upper()

                email_content = render_to_string('paymentcancel.html', {'worker_name': worker_obj.display_name,'payment_amount':worker_payment_request.amount,"payment_date":formatted_date_str,"logo":logo})
                from_mail = config('DEFAULT_FROM_EMAIL')
                
                send_mail(
                    'Payment Cancelled Successfully!',
                    email_content,
                    from_mail,  # Replace with your email address
                    [user_email],  # Receiver's email address
                    html_message=email_content,  # Specify HTML content for the email
                    
                )
                return Response({'code':200,'message': f'Worker payment {Status} successfully'}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"code":400,"error": str(e)})       
        

#accept or rejection status of worker by sponser
# url :-{{base_url}}/vid_sponser/WorkerRequestStatus/
# method:- post 
# json:- {
#     "id":id,
#     "Status":"cancel" ,or "Status":"accepted" or "Status":"paid"
#      "TransactionId": null
# }
class WorkerPaymentNotificationAPIView(APIView):
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
                subscriber_id=RequestCoinClaim.objects.filter(request_id=id).update(notify_payment_sent=True)  
                 
                return Response({'code':200,'message': f'Worker Notify successfully'}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"code":400,"error": str(e)})     
        
        
class BankDetailCreateAPIView(APIView):
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
            
        language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]
 
                
        if request.data.get("user_id",None) == None:
            bank_name = request.data.get("bank_name")
            owner_name=request.data.get("owner_name")
            account_number=request.data.get("account_number")  
            start_four_digits = account_number[:4]
            # print("start_four_digits",start_four_digits)
            
            country_id = list(UserProfile.objects.filter(id=user_id).values("country_id"))[0]["country_id"]
            # print("country_id",country_id)
            prohibitedabnkcode = prohibitedbank.objects.filter(country_id=country_id,prohibitedbankcode=start_four_digits)
            # print("prohibitedabnkcode",prohibitedabnkcode)
            if prohibitedabnkcode:
                message = get_translation(language, 'this_bank_account_has_been_prohibited')
                return Response(data={"code":400,"message":message},status=status.HTTP_200_OK)    
                
            account_type=request.data.get("account_type")
            bank_code=request.data.get("bank_code") 
            
            currency_id=Country.objects.get(id=country_id) #request.data.get("currency_id")) 
            user_id=UserProfile.objects.get(id=user_id)
            
            existing_account = BankAccount.objects.filter(user_id=user_id)

            if existing_account:
                message = get_translation(language, 'this_bank_account_is_already_exist')
                return Response(data={"code":400,"message":message},status=status.HTTP_200_OK)
            else:
                try:
                    bank_detail = BankAccount(bank_name=bank_name,owner_name=owner_name,account_number=account_number,account_type=account_type,bank_code=bank_code,currency_id=currency_id,user_id=user_id)
                    bank_detail.save()
                    message = get_translation(language, 'bank_detail_created_successfully')
                    return Response(data={'code':200,"msg":message},status=status.HTTP_200_OK)
                except Exception as e:
                    return Response(data={"code":200,"exception":f"{e}"},status=status.HTTP_200_OK)  
        else:
            bank_name = request.data.get("bank_name")
            owner_name=request.data.get("owner_name")
            account_number=request.data.get("account_number")  
            
            start_four_digits = account_number[:4]
            # print("start_four_digits",start_four_digits)
            
            country_id = list(UserProfile.objects.filter(id=user_id).values("country_id"))[0]["country_id"]
            # print("country_id",country_id)
            prohibitedabnkcode = prohibitedbank.objects.filter(country_id=country_id,prohibitedbankcode=start_four_digits)
            # print("prohibitedabnkcode",prohibitedabnkcode)
            if prohibitedabnkcode:
                message = get_translation(language, 'this_bank_account_has_been_prohibited')
                return Response(data={"code":400,"message":message},status=status.HTTP_200_OK)
            
            account_type=request.data.get("account_type")
            bank_code=request.data.get("bank_code") 
            currency_id=Country.objects.get(id=country_id) #request.data.get("currency_id"))
            user_id=request.data.get("user_id",None)
            try:
                bank_detail = BankAccount.objects.filter(user_id=user_id).update(bank_name=bank_name,owner_name=owner_name,account_number=account_number,account_type=account_type,bank_code=bank_code,currency_id=currency_id)
               
                message = get_translation(language, 'bank_details_updated_successfully')
                return Response(data={"code":200,"msg":message},status=status.HTTP_200_OK)
            except Exception as e:
                return Response(data={"code":400,"exception":f"{e}"},status=status.HTTP_200_OK)    
    
    
    
    def get(self,request):
        secret_key = config('SECRET_KEY')
          # Assuming the token is in the 'Authorization' header
        try:
            token = request.headers.get('Authorization').split(' ')[1]
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            user_id = decoded_token['user_id']  # Extract the user_id from the decoded token
            bank_detail = BankAccount.objects.filter(user_id=user_id).values()
            return Response(data={"code":200,"bank_detail":bank_detail},status=200)

        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)        
                  
        

class BinanceAccountAPIView(APIView):
    def get(self, request, pk=None):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            user_id = decoded_token['user_id']  # Extract the user_id from the decoded token
            binance_account = BinanceAccount.objects.filter(user_id=user_id).values()
            return Response({"binance_account": binance_account},status=200)
        except BinanceAccount.DoesNotExist:
            return Response({"code":404,"detail": "BinanceAccount not found"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"code":500,"detail": str(e)}, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
 
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
            user_id = decoded_token['user_id'] # Extract the user_id from the decoded token
            language = UserProfile.objects.filter(id=user_id).values("language")[0]["language"]

            # print("request.data",request.data)
            if request.data.get("user_id",None) == None:
                request.data['user_id'] = user_id
                if BinanceAccount.objects.filter(user_id=request.data['user_id']).exists():
                    message = get_translation(language, 'binance_account_already_exists')
                    return Response({"code": 400, "detail": message}, status=status.HTTP_200_OK)
                serializer = BinanceAccountSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save()
                message = get_translation(language, 'binance_account_created_successfully')    
                return Response({"code":201,"detail": message}, status=status.HTTP_200_OK)
            else:
                binance_accounts = BinanceAccount.objects.filter(user_id=user_id)
                # Check if there are any instances
                if binance_accounts.exists():
                    # Loop through instances and update each one
                    for binance_account in binance_accounts:
                        request.data['user_id'] = user_id
                        serializer = BinanceAccountSerializer(binance_account, data=request.data)
                        
                        if serializer.is_valid():
                            serializer.save()
                        else:
                            return Response({'code':400,'error':serializer.errors}, status=status.HTTP_200_OK)
                    message = get_translation(language, 'binance_account_updated_successfully') 
                    return Response({"code":200,"detail": message}, status=status.HTTP_200_OK)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"code":500,"error": str(e)}, status=status.HTTP_200_OK)







#------------------------neha ma'am code here---------------------------



#name -  Sponsorship list
#utility - returns list of Sponsorship with filter,search,sorting and pagination
class SponsorshipListAPIView(APIView):
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
            worker_status = request.GET.get("status",None)  
            skip = limit*page-limit
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            queryset = SponserHistory.objects.filter(sponser_id=sponsor_id, is_active=True).order_by('-id')

            if worker_status == "accepted":
                queryset = queryset.filter(current_status="accepted")
            elif worker_status == "cancel":
                queryset = queryset.filter(current_status="cancel")
            elif worker_status == "pending":
                queryset = queryset.filter(current_status="pending")
            elif worker_status == "all":
                queryset = queryset.all()
                
            if start_date!=None:
                queryset= queryset.filter(start_datetime__date__range = (start_date,end_date))
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
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = SponserHistorySerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],is_active=True).values("country_id","display_name","profile_image","email","phone"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_email'] = worker["email"]
                    item['worker_phone'] = worker["phone"]
                    item['worker_profile_image'] = worker["profile_image"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['country_name'] = country.name
                    item["country_flag"] = country.flag_url
                result ={"data" :data,"count":count,'code':200,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':404,'message':"No data available"})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        

#name -  Payment Request list
#utility - returns list of Payment Request with filter,search,sorting and pagination
class WorkerPaymentRequestListAPIView(APIView):
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
            queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,is_active=True,request_status="draft").order_by('-request_id')
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)| Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_worker_ids:
                    queryset = queryset.filter(worker_id__in=check_worker_ids)
                    count = queryset.count()
                # queryset = queryset.filter(Q(request_status__icontains=search_field)) 
                # count = queryset.count()
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
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],is_active=True).values("country_id","display_name","profile_image"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_profile_image'] = worker["profile_image"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag_url'] = country.flag_url
                    bank_received =  item['bank_received']
                    if bank_received:
                        bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                        item['account_id']=bank_account.bank_acc_id
                        BankDetail={
                            "account_id":bank_account.bank_acc_id,
                            "BankName":bank_account.bank_name,
                            "owner_name":bank_account.owner_name,
                            "account_number":bank_account.account_number,
                            "account_type":bank_account.account_type,
                            "bank_code":bank_account.bank_code
                            }
                        item['BankDetail']=BankDetail
                        item["active_payment_method"] = "Bank"
                    else:
                        binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                        item['account_id']=binance_account.binance_acc_id
                        BankDetail={
                            "account_id":binance_account.binance_acc_id,
                            "BinanceEmailId":binance_account.binance_email_id,
                            "BinancePayId":binance_account.binance_pay_id
                            }
                        item['BankDetail']=BankDetail
                        item["active_payment_method"] = "Binance"
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
#name -  Payment in process list
#utility - returns list of Payment in process with filter,search,sorting and pagination
class SponsorPaymentInProcessListAPIView(APIView):
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
            queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,notify_payment_sent=False,is_active=True).order_by('-request_id')
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)| Q(country_id__name__icontains=search_field))
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
                serializer = RequestCoinClaimSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],is_active=True).values("country_id","display_name","profile_image"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_profile_image'] = worker["profile_image"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag_url'] = country.flag_url
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
#name -  Payment history list
#utility - returns list of Payment history with filter,search,sorting and pagination
class SponsorPaymentHistoryListAPIView(APIView):
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
            queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,notify_payment_sent=True,receipts_image__isnull=False,request_status ="paid",is_active=True).order_by('-request_id')
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
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = RequestCoinClaimSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],is_active=True).values("email","country_id","display_name","profile_image"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_profile_image'] = worker["profile_image"]
                    item['worker_email'] = worker["email"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag_url'] = country.flag_url
                    try:
                        bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                    except BankAccount.DoesNotExist:
                        bank_account = None
                    try:
                        binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                    except BinanceAccount.DoesNotExist:
                        binance_account = None
                    if bank_account:
                        item["payment_method"] = "Bank"
                    elif binance_account:
                        item["payment_method"] = "Binance"
                    else:
                        item["payment_method"] = "None"
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
#name -  Payment history with worker list
#utility - returns list of Payment history with worker and with filter,search,sorting and pagination
class SponsorPaymentHistoryWithWorkerListAPIView(APIView):
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
            queryset = PaymentRequest.objects.filter(sponser_id=user_id,is_active=True).order_by('-payment_request_id')
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
                serializer = PamentRequestSerializer(queryset, many=True)
                data = serializer.data
                for item in data:
                    sponser_id = item['sponser_id']
                    sponser =list(UserProfile.objects.filter(id=sponser_id,role_id__in=["sponser", "Sponser"],is_active=True).values("email","display_name","country_id"))[0]
                    item['sponser_name'] = sponser["display_name"]
                    item['sponser_email'] = sponser["email"]
                    country = Country.objects.get(id =sponser["country_id"])
                    item['country_name'] = country.name
                    item['country_flag_url'] = country.flag_url
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        

class ClientListAPIView(APIView):
    def duration_in_days(self,start_datetime,end_datetime):
        if end_datetime:
            start_datetime_new = arrow.get(start_datetime)
            end_datetime_new = arrow.get(end_datetime)
            duration = end_datetime_new - start_datetime_new
            return duration.days
        return None
    
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sponsor_id = decoded_token["user_id"]
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
            
            queryset = SponserHistory.objects.filter(sponser_id=sponsor_id,is_active=True,current_status="accepted").order_by('-id')
            if start_date!=None:
                queryset = queryset.filter(start_datetime__date__range=(start_date,end_date))
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
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            if queryset:
                serializer = SponserHistorySerializer(queryset, many=True)
                data = serializer.data
                # current_datetime = timezone.now().date()  # Get today's date
                # current_datetime_new = arrow.get(current_datetime).format("YYYY-MM-DD")
                for item in data:
                    if item["end_datetime"] is not None:
                        item["sponsorship_days"] =  self.duration_in_days(item["start_datetime"],item["end_datetime"])
                    else:
                        current_datetime_new = datetime.now() 
                        item["sponsorship_days"] =  self.duration_in_days(item["start_datetime"],current_datetime_new)
                    user_obj = UserProfile.objects.filter(id=item['worker_id'],is_active=True)
                    if user_obj:
                        worker =list(user_obj.values("country_id","display_name","profile_image","email","phone","total_warning","total_earn_coin"))[0]
                        item['worker_name'] = worker["display_name"]
                        item['worker_email'] = worker["email"]
                        item['worker_phone'] = worker["phone"]
                        item['worker_profile_image'] = worker["profile_image"]
                        item['worker_total_warning'] = worker["total_warning"]
                        item['worker_total_earn_coin'] = worker["total_earn_coin"]
                        country = Country.objects.get(id =worker["country_id"])
                        item['country_name'] = country.name
                        item['country_flag_url'] = country.flag_url
                        try:
                            bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                        except BankAccount.DoesNotExist:
                            bank_account = None

                        try:
                            binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                        except BinanceAccount.DoesNotExist:
                            binance_account = None

                        if bank_account is not None or binance_account is not None:
                            item["active_payment_method"] = "Yes"
                        else:
                            item["active_payment_method"] = "No"
                        try:
                            # print("item['worker_id']",item['worker_id'])
                            call_count = CallSession.objects.filter(Q(call_started_by=item['worker_id']) | Q(call_received_by=item['worker_id']),is_active=True).count()
                            # print("call_count",call_count)
                            item['call_count'] = call_count
                        except ObjectDoesNotExist:
                            # print("CallSession model does not exist.")
                            item['call_count'] = 0
                            
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                
                language = UserProfile.objects.filter(id=sponsor_id).values("language")[0]["language"]
                message = get_translation(language, 'no_data_available')
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': message})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
        

class WorkerPaymentRequesAcceptedByAdminListAPIView(APIView):
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
            queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,is_active=True,payment_request_id__isnull=False,accepted_by_admin=True).order_by('-request_id')
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field) | Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_worker_ids:
                    queryset = queryset.filter(worker_id__in=check_worker_ids)
                    count = queryset.count()
                # queryset = queryset.filter(Q(request_status__icontains=search_field)) 
                # count = queryset.count()
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
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],is_active=True).values("country_id","display_name","profile_image"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_profile_image'] = worker["profile_image"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag_url'] = country.flag_url
                    try:
                        bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                    except BankAccount.DoesNotExist:
                        bank_account = None
                    try:
                        binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                    except BinanceAccount.DoesNotExist:
                        binance_account = None
                    if bank_account:
                        item["active_payment_method"] = "Bank"
                    elif binance_account:
                        item["active_payment_method"] = "Binance"
                    else:
                        item["active_payment_method"] = "None"
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
        

class WorkerPaymentRequestInProcessListAPIView(APIView):
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
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            status = request.GET.get("status")
            # print("status",status)
            
            if status == "all":
                # queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,is_active=True,request_status="inprocess").order_by('-payment_done_by_admin','-request_id') 
                # print("dddddd",queryset)
                # queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,is_active=True).order_by('-request_id',"-paid_date")
                queryset = RequestCoinClaim.objects.filter(
                        Q(sponser_id=user_id, is_active=True, request_status='inprocess') |
                        Q(sponser_id=user_id, is_active=True, request_status='draft')
                    ).order_by('-request_id', '-paid_date')
                
                count = queryset.count() 
                # print("queryset",queryset)
            elif status == "approve":
                queryset = RequestCoi+---------nClaim.objects.filter(sponser_id=user_id,is_active=True,request_status="inprocess",payment_done_by_admin=True).order_by('-request_id',"-paid_date")
                count = queryset.count() 
            elif status == "notapprove":
                queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,is_active=True,request_status="draft",payment_done_by_admin=False).order_by('-request_id',"-paid_date")
                count = queryset.count() 
            if start_date!=None:
                queryset = queryset.filter(request_date__range=(start_date,end_date)).order_by('-request_id')
                count = queryset.count()
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field) | Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_worker_ids:
                    queryset = queryset.filter(worker_id__in=check_worker_ids)
                    count = queryset.count()
                # queryset = queryset.filter(Q(request_status__icontains=search_field)) 
                # count = queryset.count()
            if ordering_field!=None:
                if sortingOrder=="asc":
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count()
                else:
                    ordering_field="-"+ordering_field
                    queryset = queryset.order_by(ordering_field) 
                    count = queryset.count() 
            # else:
            #     queryset = queryset.all() if queryset.exists() else None
            #     print("dattatatatatatattata",queryset)
            #     count = queryset.count() if queryset is not None else 0
            if(page > 0):
                queryset = queryset[skip:skip+limit] if not queryset == None  else []
            # print("queryset",queryset)    
            if queryset:
                serializer = RequestCoinClaimSerializer(queryset, many=True)
                data = serializer.data
                
                for item in data:
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],is_active=True).values("country_id","display_name","profile_image"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_profile_image'] = worker["profile_image"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag_url'] = country.flag_url
                    bank_received = item['bank_received']
                    # print(bank_received)
                    # print(type(bank_received))
                    if bank_received:
                        bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                        BankDetail={
                            "account_id":bank_account.bank_acc_id,
                            "BankName":bank_account.bank_name,
                            "owner_name":bank_account.owner_name,
                            "account_number":bank_account.account_number,
                            "account_type":bank_account.account_type,
                            "bank_code":bank_account.bank_code
                            }
                        
                        item['account_id']=bank_account.bank_acc_id
                        item['BankDetail']=BankDetail
                        item["active_payment_method"] = "Bank"
                    else:
                        binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                        BankDetail={
                            "account_id":binance_account.binance_acc_id,
                            "BinanceEmailId":binance_account.binance_email_id,
                            "BinancePayId":binance_account.binance_pay_id
                            }
                        
                        item['account_id']=binance_account.binance_acc_id
                        item['BankDetail']=BankDetail
                        item["active_payment_method"] = "Binance"
                    
                result ={"data" :data,"count":count,'code':200,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':404,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        

class WorkerPaymentHistoryListAPIView(APIView):
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
            
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            
            queryset = RequestCoinClaim.objects.filter(sponser_id=user_id,is_active=True,request_status="paid").order_by('-paid_date')
           
            if start_date!=None:
                queryset = RequestCoinClaim.objects.filter(request_date__range=(start_date,end_date),sponser_id=user_id,is_active=True,request_status="paid").order_by('-request_id')
                count = queryset.count()
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field) | Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_worker_ids:
                    queryset = queryset.filter(worker_id__in=check_worker_ids)
                    count = queryset.count()
                # queryset = queryset.filter(Q(request_status__icontains=search_field)) 
                # count = queryset.count()
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
                    
                    worker =list(UserProfile.objects.filter(id=item['worker_id'],is_active=True).values("country_id","display_name","profile_image","email"))[0]
                    item['worker_name'] = worker["display_name"]
                    item['worker_email'] = worker["email"]
                    item['worker_profile_image'] = worker["profile_image"]
                    country = Country.objects.get(id =worker["country_id"])
                    item['worker_country_name'] = country.name
                    item['worker_country_flag_url'] = country.flag_url
                    if item ["bank_received"]==True:
                        try:
                            bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                            item['bank_account_id']=bank_account.bank_acc_id
                            BankDetail={
                                "account_id":bank_account.bank_acc_id,
                                "BankName":bank_account.bank_name,
                                "owner_name":bank_account.owner_name,
                                "account_number":bank_account.account_number,
                                "account_type":bank_account.account_type,
                                "bank_code":bank_account.bank_code
                                }
                            item['BankDetail']=BankDetail
                            item["active_payment_method"] = "Bank"
                        except BankAccount.DoesNotExist:
                            bank_account = None
                            item["active_payment_method"] = "Bank"
                            item['BankDetail']={}
                    else:
                        try:
                            binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                            item['binance_account_id']=binance_account.binance_acc_id
                            BankDetail={
                                "account_id":binance_account.binance_acc_id,
                                "BinanceEmailId":binance_account.binance_email_id,
                                "BinancePayId":binance_account.binance_pay_id
                                }
                            item['BankDetail']=BankDetail
                            item["active_payment_method"] = "Binance"
                            
                        except BinanceAccount.DoesNotExist:
                            binance_account = None
                            item["active_payment_method"] = "Binance"
                            item['BankDetail']={}
                    # if bank_account:
                    #     item["active_payment_method"] = "Bank"
                    # elif binance_account:
                    #     item["active_payment_method"] = "Binance"
                    # else:
                    #     item["active_payment_method"] = "None"
                        
                    if item['payment_request_id']:
                        admin_receipt = PaymentRequest.objects.get(payment_request_id=item['payment_request_id'])
                        item['admin_receipt'] = admin_receipt.receipts_image
                        
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
       

class UploadReciptOfWorkerAPIView(APIView):
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
                request_id = request.data.get("id",None)
                Status = request.data.get("Status",None)
                if Status=="paid":
                    file = request.data.get('file')
                    if not file:
                        return Response({'code':404,'message': 'File not found'})
                    
                    encoded_image=base64.b64encode(file.read()).decode('utf-8')
                    decoded_image = base64.b64decode(encoded_image)
                    file_extension = os.path.splitext(file.name)[1]
                    target_folder = os.path.join('videos',f"reqworker_{request_id}")
                    unique_filename = f"{request_id}{file_extension}"
                    os.makedirs(target_folder, exist_ok=True)
                    full_path = os.path.join(target_folder, unique_filename)
                    
                    with open(full_path, "wb") as file:
                        file.write(decoded_image)
                    
                    image_path = os.path.join(settings.MEDIA_URL,f"reqworker_{request_id}", unique_filename)
                    base_url = config('SERVER_BASE_URL')
                    # image_link =base_url+image_path
                    
                    image_link =image_path
                    
                    current_date_time = timezone.now()
                    # print("current_date_time",current_date_time)
                    try:
                        worker_payment_request = RequestCoinClaim.objects.get(request_id=request_id)
                    except RequestCoinClaim.DoesNotExist:
                        return Response({"code": 404, "message": "Request not found"})
                    # Update the object.
                    worker_payment_request.request_status = Status
                    worker_payment_request.receipts_image = image_link
                    worker_payment_request.paid_date = current_date_time
                    worker_payment_request.notify_payment_sent = True
                    worker_payment_request.save()
                    worker_id = worker_payment_request.worker_id_id
                    sponsor_id = worker_payment_request.sponser_id_id
                    try:
                        worker_obj = UserProfile.objects.get(id = worker_id,is_active=True)
                    except Exception as e:
                        return Response(data={"code":404,"message":"worker not found"})
                    user_email = worker_obj.email
                    
                    try:
                        sponsor_obj = UserProfile.objects.get(id = sponsor_id,is_active=True)
                    except Exception as e:
                        return Response(data={"code":404,"message":"sponsor not found"})
                    sponsor_name = sponsor_obj.display_name
                    

                    logo =base_url+'/media/email_images/logo.png'
                    # print("logo",logo)
                    
                    # print(image_link)
                    image_html = f'<img src="{image_link}" alt="Payment Confirmation Attachment" style="width: 300px; height: auto;">'
                    # email_content = f'''
                    #     <h2 style="color: #333;">Payment Confirmation</h2>
                    #     <p>Dear {worker_obj.display_name},</p>
                        
                    #     <p>Your payment has been processed successfully.</p>
                        
                    #     <p>To view your payment confirmation receipt, please <a href="{image_link}">click here</a>.</p>
                        
                    #     <h3>Payment Details:</h3>
                        
                    #     <ul>
                    #         <li><strong>Amount:</strong> {worker_payment_request.amount}</li>
                    #         <li><strong>Date:</strong> {worker_payment_request.request_date.date()}</li>
                    #     </ul>
                        
                    #     <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
                        
                    #     <p>Thank you for choosing our service!</p>
                        
                    #     <p>Best regards,<br>
                    #     {sponsor_name}</p>
                        
                    # '''
                    html_content = render_to_string('paymentconformation.html', {'worker_name': worker_obj.first_name,"image_link":base_url + image_path, 'payment_amount':worker_payment_request.amount,'sponsor_name':sponsor_name,"create_date_str":worker_payment_request.request_date.date(),"logo":logo})
                    send_background_email.delay(user_email, html_content)
                    # from_mail = config('DEFAULT_FROM_EMAIL')
                    # send_mail(
                    #     'Welcome to our platform!',
                    #     email_content,
                    #     from_mail,  # Replace with your email address
                    #     [user_email],  # Receiver's email address
                    #     html_message=email_content,  # Specify HTML content for the email
                    # )
                    return Response({'code':200,'message': f'Worker payment {Status}, upload receipt and send email successfully to {worker_obj.email}'}, status=status.HTTP_200_OK) 
                worker_payment_request_object=RequestCoinClaim.objects.filter(request_id=request_id).update(request_status=Status)     
                return Response({'message': f'Sponser payment {Status} successfully','code':200}, status=status.HTTP_200_OK)
            
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'message': str(e),'code':400}, status=200)       


class SponsorDashboradCountAPIView(APIView):

    def get(self, request):
        secret_key = config('SECRET_KEY')
        token = request.headers.get('Authorization').split(' ')[1]  

        try:
            decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  
            sponsor_id = decoded_token['user_id'] 
        except jwt.ExpiredSignatureError:
            return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)

        current_datetime = timezone.now().date()  # Get today's date
        current_datetime_new = arrow.get(current_datetime).format("YYYY-MM-DD")  # Format as string
        try:
           
            total_sponsorship_pending_request = SponserHistory.objects.filter(sponser_id=sponsor_id, current_status="pending", is_active=True).count()
            today_sponsorship_pending_request = SponserHistory.objects.filter(sponser_id=sponsor_id,start_datetime__date=current_datetime_new, current_status="pending", is_active=True).count()
            total_pending_payment_request = RequestCoinClaim.objects.filter(sponser_id=sponsor_id,is_active=True,request_status="draft").count()
            today_pending_payment_request = RequestCoinClaim.objects.filter(sponser_id=sponsor_id,request_date=current_datetime_new,is_active=True,request_status="draft").count()
         
            total_sponsorship_pending_request = total_sponsorship_pending_request if total_sponsorship_pending_request else 0
            today_sponsorship_pending_request = today_sponsorship_pending_request if today_sponsorship_pending_request else 0
            total_pending_payment_request = total_pending_payment_request if total_pending_payment_request else 0
            today_pending_payment_request = today_pending_payment_request if today_pending_payment_request else 0
            
            count = {
                "pending_sponsorship_request": total_sponsorship_pending_request,
                "today_sponsorship_request": today_sponsorship_pending_request,
                "pending_payments": total_pending_payment_request,
                "today_payments": today_pending_payment_request
            }
            return Response({'code': 200, 'message': "success", 'data': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'data':{},'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        
        
        

class AdminToSponsorPaymentHistoryAPIView(APIView):
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            # Extracting token from the request headers
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sponsor_id = decoded_token['user_id']  # Extract the user_id from the decoded token
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
            
            queryset = PaymentRequest.objects.filter(sponser_id=sponsor_id,is_active=True,request_status="paid").order_by('-paid_date')
            count = queryset.count()
            if start_date!=None:
                queryset = queryset.filter(create_date_time__date__range=(start_date,end_date))
                count = queryset.count()
            if search_field!=None:
                check_worker_ids = UserProfile.objects.filter(
                    Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))
                ).values_list("id", flat=True)

                if check_worker_ids:
                    queryset = queryset.filter(worker_id__in=check_worker_ids)
                    count = queryset.count()
                # queryset = queryset.filter(Q(request_status__icontains=search_field)) 
                # count = queryset.count()
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
                    # print("item",item["sponser_id"])
                    sponser =list(UserProfile.objects.filter(id=item['sponser_id'],is_active=True).values("country_id","display_name","profile_image","email"))[0]
                    item['sponser_name'] = sponser["display_name"]
                    item['sponser_email'] = sponser["email"]
                    item['sponser_profile_image'] = sponser["profile_image"]
                    country = Country.objects.get(id =sponser["country_id"])
                    item['sponser_country_name'] = country.name
                    item['sponser_country_flag_url'] = country.flag_url
                    try:
                        bank_account = BankAccount.objects.get(user_id=item['sponser_id'])
                        item['bank_account_id']=bank_account.bank_acc_id
                    except BankAccount.DoesNotExist:
                        bank_account = None
                    try:
                        binance_account = BinanceAccount.objects.get(user_id=item['sponser_id'])
                        item['binance_account_id']=binance_account.binance_acc_id
                    except BinanceAccount.DoesNotExist:
                        binance_account = None
                    if bank_account:
                        item["active_payment_method"] = "Bank"
                    elif binance_account:
                        item["active_payment_method"] = "Binance"
                    else:
                        item["active_payment_method"] = "None"
                result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                return Response(data=result)
            else:
                return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"code":400,"error": str(e)})
        
        
def get_month_name(date_str):
    date_obj = datetime.strptime(date_str, '%Y-%m')
    month_name = date_obj.strftime('%B')
    return month_name    

class WorkerCountForGraphAPIView(APIView):
    def post(self, request):
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
            
            year = request.data.get("year")
            dataset =[]
            worker_queryset = SponserHistory.objects.filter(sponser_id=sponsor_id,start_datetime__year=year,current_status="accepted", is_active=True).order_by('-id')
            month_counts_worker = {datetime(year, month, 1).strftime('%Y-%m'): 0 for month in range(1, 13)}
            for profile in worker_queryset:
                month_key = profile.start_datetime.strftime('%Y-%m')
                month_counts_worker[month_key] += 1

            # Preparing the result
            month_name_list = []
            worker_count_list = []
            for month in month_counts_worker:
                month_name = get_month_name(month)
                month_name_list.append(month_name)
                worker_count_list.append(month_counts_worker[month])

            dataset.append({
                "label": "Worker",
                "data": worker_count_list,
                "backgroundColor": "rgba(255, 99, 132, 0.5)"
            })
            result = {
                "labels": month_name_list,
                'datasets': dataset
            }
          
            return Response({'data':result,'code':status.HTTP_200_OK,'message': 'success'})
          
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
class RevenueCountForGraphAPIView(APIView):
    def post(self, request):
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
            
            year = request.data.get("year")
            dataset =[]
            revenue_queryset = PaymentRequest.objects.filter(sponser_id=sponsor_id,create_date_time__year=year,request_status="paid", is_active=True).order_by('-payment_request_id')
            month_totals_revenue = {datetime(year, month, 1).strftime('%Y-%m'): 0 for month in range(1, 13)}
            for revenue in revenue_queryset:
                month_key = revenue.create_date_time.strftime('%Y-%m')
                month_totals_revenue[month_key] += revenue.total_amount_request

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
        
        
        
        
class WorkersBasedOnPaymentRequestAPIView(APIView):
        
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

     
class ExcelDownloadOfSponsorReportAPIView(APIView):
    def duration_in_days(self,start_datetime,end_datetime):
        if end_datetime:
            start_datetime_new = arrow.get(start_datetime)
            end_datetime_new = arrow.get(end_datetime)
            duration = end_datetime_new - start_datetime_new
            return duration.days
        return None
    def post(self, request):
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
                queryset = PaymentRequest.objects.filter(create_date_time__date__range=(start_date, end_date),sponser_id=sponsor_id,is_active=True,request_status="paid").order_by('-payment_request_id')
                if queryset:
                    serializer = PamentRequestSerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        sponsor_id = item['sponser_id']
                        sponser_query =UserProfile.objects.filter(id=sponsor_id,is_active=True).values()
                        if sponser_query.exists():
                            sponser =list(sponser_query.values("country_id","display_name","profile_image","email"))[0]
                        item['sponser_name'] = sponser["display_name"]
                        item['sponser_profile_image'] = sponser["profile_image"]
                        country = Country.objects.get(id =sponser["country_id"])
                        item['sponser_country_name'] = country.name
                        item['sponser_country_flag_url'] = country.flag_url
                        if item['sponser_binance_acc_id'] is not None:
                            try:
                                binance_account = BinanceAccount.objects.get(binance_acc_id=item['sponser_binance_acc_id'])
                                item['binance_account_id']=binance_account.binance_acc_id
                                item["active_payment_method"] = "Binance"
                            except BinanceAccount.DoesNotExist:
                                pass
                        else:
                             item["active_payment_method"] = "None"
                        
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
                
                queryset = queryset = SponserHistory.objects.filter(start_datetime__date__range=(start_date, end_date),sponser_id=sponsor_id,is_active=True,current_status="accepted").order_by('-id')
                if queryset:
                    serializer = SponserHistorySerializer(queryset, many=True)
                    data = serializer.data
                    for item in data:
                        if item["end_datetime"] is not None:
                            item["sponsorship_days"] =  self.duration_in_days(item["start_datetime"],item["end_datetime"])
                        else:
                            current_datetime_new = datetime.now() 
                            item["sponsorship_days"] =  self.duration_in_days(item["start_datetime"],current_datetime_new)
                        user_obj = UserProfile.objects.filter(id=item['worker_id'],is_active=True)
                        if user_obj:
                            worker =list(user_obj.values("country_id","display_name","profile_image","total_warning","total_earn_coin"))[0]
                            item['worker_name'] = worker["display_name"]
                            # item['worker_profile_image'] = worker["profile_image"]
                            item['worker_total_warning'] = worker["total_warning"]
                            item['worker_total_earn_coin'] = worker["total_earn_coin"]
                            country = Country.objects.get(id =worker["country_id"])
                            item['country_name'] = country.name
                            # item['country_flag_url'] = country.flag_url
                            try:
                                bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                            except BankAccount.DoesNotExist:
                                bank_account = None

                            try:
                                binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                            except BinanceAccount.DoesNotExist:
                                binance_account = None

                            if bank_account is not None or binance_account is not None:
                                item["active_payment_method"] = "Yes"
                            else:
                                item["active_payment_method"] = "No"
                            try:
                                count = CallSession.objects.filter(Q(call_started_by=item['worker_id']) | Q(call_received_by=item['worker_id']),is_active=True).count()
                                item['call_count'] = count
                            except ObjectDoesNotExist:
                                item['call_count'] = 0
                                
                            item.pop("end_datetime", None)
                            item.pop("is_active", None)       
                            item.pop("sponser_id", None)    
                            item.pop("worker_id", None)      
                            item.pop("worker_profile_image", None)      
                        
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
                
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
        
        
        
       
        
class ReportForSponsorAPIView(APIView):
    def duration_in_days(self,start_datetime,end_datetime):
        if end_datetime:
            start_datetime_new = arrow.get(start_datetime)
            end_datetime_new = arrow.get(end_datetime)
            duration = end_datetime_new - start_datetime_new
            return duration.days
        return None
    def post(self, request):
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
                queryset = PaymentRequest.objects.filter(sponser_id=sponsor_id,is_active=True,request_status="paid").order_by('-create_date_time', '-payment_request_id')
                count = queryset.count()
                if start_date!=None:
                    queryset = queryset.filter(create_date_time__date__range=(start_date,end_date))
                    count = queryset.count()
                if search_field!=None:
                    check_worker_ids = UserProfile.objects.filter(
                        Q(role_id="worker") & Q(is_active=True) & (Q(email__icontains=search_field) | Q(display_name__icontains=search_field)|Q(country_id__name__icontains=search_field))
                    ).values_list("id", flat=True)

                    if check_worker_ids:
                        queryset = queryset.filter(worker_id__in=check_worker_ids)
                        count = queryset.count()
                    # queryset = queryset.filter(Q(request_status__icontains=search_field)) 
                    # count = queryset.count()
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
                        sponser =list(UserProfile.objects.filter(id=item['sponser_id'],is_active=True).values("country_id","display_name","profile_image","email"))[0]
                        item['sponser_name'] = sponser["display_name"]
                        item['sponser_email'] = sponser["email"]
                        item['sponser_profile_image'] = sponser["profile_image"]
                        country = Country.objects.get(id =sponser["country_id"])
                        item['sponser_country_name'] = country.name
                        item['sponser_country_flag_url'] = country.flag_url
                        try:
                            bank_account = BankAccount.objects.get(user_id=item['sponser_id'])
                            item['bank_account_id']=bank_account.bank_acc_id
                        except BankAccount.DoesNotExist:
                            bank_account = None
                        try:
                            binance_account = BinanceAccount.objects.get(user_id=item['sponser_id'])
                            item['binance_account_id']=binance_account.binance_acc_id
                        except BinanceAccount.DoesNotExist:
                            binance_account = None
                        if bank_account:
                            item["active_payment_method"] = "Bank"
                        elif binance_account:
                            item["active_payment_method"] = "Binance"
                        else:
                            item["active_payment_method"] = "None"

                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result)
                else:
                    return Response(data={'data':[],'count':0,'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
                
            elif key == "worker_request":
                queryset = SponserHistory.objects.filter(sponser_id=sponsor_id,is_active=True,current_status="accepted").order_by('-id')
                if start_date!=None:
                    queryset = queryset.filter(start_datetime__date__range=(start_date,end_date))
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
                if(page > 0):
                    queryset = queryset[skip:skip+limit] if not queryset == None  else []
                if queryset:
                    serializer = SponserHistorySerializer(queryset, many=True)
                    data = serializer.data
                    # current_datetime = timezone.now().date()  # Get today's date
                    # current_datetime_new = arrow.get(current_datetime).format("YYYY-MM-DD")
                    for item in data:
                        if item["end_datetime"] is not None:
                            item["sponsorship_days"] =  self.duration_in_days(item["start_datetime"],item["end_datetime"])
                        else:
                            current_datetime_new = datetime.now() 
                            item["sponsorship_days"] =  self.duration_in_days(item["start_datetime"],current_datetime_new)
                        user_obj = UserProfile.objects.filter(id=item['worker_id'],is_active=True)
                        if user_obj:
                            worker =list(user_obj.values("country_id","display_name","profile_image","email","phone","total_warning","total_earn_coin"))[0]
                            item['worker_name'] = worker["display_name"]
                            item['worker_email'] = worker["email"]
                            item['worker_phone'] = worker["phone"]
                            item['worker_profile_image'] = worker["profile_image"]
                            item['worker_total_warning'] = worker["total_warning"]
                            item['worker_total_earn_coin'] = worker["total_earn_coin"]
                            country = Country.objects.get(id =worker["country_id"])
                            item['country_name'] = country.name
                            item['country_flag_url'] = country.flag_url
                            try:
                                bank_account = BankAccount.objects.get(user_id=item['worker_id'])
                            except BankAccount.DoesNotExist:
                                bank_account = None

                            try:
                                binance_account = BinanceAccount.objects.get(user_id=item['worker_id'])
                            except BinanceAccount.DoesNotExist:
                                binance_account = None

                            if bank_account is not None or binance_account is not None:
                                item["active_payment_method"] = "Yes"
                            else:
                                item["active_payment_method"] = "No"
                            try:
                                call_count = CallSession.objects.filter(Q(call_started_by=item['worker_id']) | Q(call_received_by=item['worker_id']),is_active=True).count()
                                item['call_count'] = call_count
                            except ObjectDoesNotExist:
                                item['call_count'] = 0
                            
                    result ={"data" :data,"count":count,'code':status.HTTP_200_OK,'message': 'success'}
                    return Response(data=result, status=200)
                else:
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available'})
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})
    
    
class AddSponserBinanceAccount(APIView):
    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sponsor_id = decoded_token['user_id']
                
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            BinanceId = request.data.get("BinanceId",None)
            BinanceEmailId = request.data.get("BinanceEmailId")
            BinancePayId = request.data.get("BinancePayId")
            language = UserProfile.objects.filter(id=sponsor_id).values("language")[0]["language"]


            if BinanceId == None:
                queryset =BinanceAccount.objects.filter(user_id=sponsor_id).values()

                if queryset:

                    message = get_translation(language, 'you_cannot_create_more_than_one_binance_account')
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': message})
                else:
                    binance_detail = BinanceAccount(binance_email_id=BinanceEmailId,binance_pay_id=BinancePayId,user_id=UserProfile.objects.get(id=sponsor_id))
                    binance_detail.save()
                    
                    message = get_translation(language, 'binance_account_created_successfully')
                    return Response({'code':status.HTTP_200_OK,'message': message})
            else:
                queryset =BinanceAccount.objects.filter(binance_acc_id=BinanceId).update(binance_email_id=BinanceEmailId,binance_pay_id=BinancePayId)
                message = get_translation(language, 'binance_account_updated_sucessfully')
                return Response({'code':status.HTTP_200_OK,'message': message})
          
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})    
    
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sponsor_id = decoded_token['user_id']
                
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            queryset =BinanceAccount.objects.filter(user_id=sponsor_id).values()

            if queryset:
               result ={'code':status.HTTP_200_OK,'message': 'success',"BinanceAccountDetail":queryset[0]}
            else:
               result ={'code':status.HTTP_404_NOT_FOUND,'message': 'No data available',"BinanceAccountDetail":[]} 
                   
            return Response(data=result)
            
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})    
        
class CallDeductionCoinapi(APIView):
    def post(self, request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sponsor_id = decoded_token['user_id']
                
                
                
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

            
            
            CoinId = request.data.get("CoinId",None)
            CoinAmount = request.data.get("CoinAmount")
            
            if CoinId == None:
                queryset =CallDeductionCoin.objects.filter(is_active=True).values()
                if queryset:
                    message = get_translation(language, 'you_cannot_create_more_than_one_call_deduction_coin_data')
                    return Response(data={'code':status.HTTP_404_NOT_FOUND,'message': message})
                else:
                    CallDeduction = CallDeductionCoin(coin=CoinAmount)
                    CallDeduction.save()
                    message = get_translation(language, 'call_deduction_coin_data_created_sucessfully')
                    return Response({'code':status.HTTP_200_OK,'message': message})
            else:
                queryset =CallDeductionCoin.objects.filter(is_active=True).update(coin=CoinAmount)
                message = get_translation(language, 'call_deduction_coin_data_updated_sucessfully')
                return Response({'code':status.HTTP_200_OK,'message': message})
          
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})    
    
    def get(self, request):
        try:
            secret_key = config('SECRET_KEY')
            token = request.headers.get('Authorization').split(' ')[1]  # Assuming the token is in the 'Authorization' header
            try:
                decoded_token = jwt.decode(token,secret_key, algorithms=['HS256'])  # Decode the JWT token
                sponsor_id = decoded_token['user_id']
                
            except jwt.ExpiredSignatureError:
                return Response({'code':401,'error': 'Token expired'}, status=status.HTTP_200_OK)
            except jwt.InvalidTokenError:
                return Response({'code':401,'error': 'Invalid token'}, status=status.HTTP_200_OK)
            
            language = UserProfile.objects.filter(role_id="admin").values("language")[0]["language"]

            
            queryset =list(CallDeductionCoin.objects.filter(is_active=True).values())
            if queryset:
               result ={'code':status.HTTP_200_OK,'message': 'success',"CallDeductionCoin":queryset[0]}
            else:
               message = get_translation(language, 'no_data_available') 
               result ={'code':status.HTTP_404_NOT_FOUND,'message':message,"CallDeductionCoin":[]} 
                   
            return Response(data=result)
            
        except Exception as e:
            return Response({"error":str(e),'code':status.HTTP_400_BAD_REQUEST})            
        