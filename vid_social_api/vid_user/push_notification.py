import requests
import json



def push_notification(server_key,device_id,data):

    url = "https://fcm.googleapis.com/fcm/send"

    # payload = json.dumps({
    # "to": device_id,
    # "notification": notification
    # })
    # print("data",data)
    payload=json.dumps({
            'to': device_id,
            'data':data,
            'android': {
                'priority': 'high',
                'notification': {
                    'sound': 'default',
                },
            },
            'apns': {
                'payload': {
                    'aps': {
                        'content-available': 1,
                    },
                },
            },
        } )
    # print('----------------------------',payload)
    headers = {
    'Content-Type': 'application/json',
    'Authorization': f'key={server_key}'
    }

    response = requests.request("POST", url, headers=headers, data=payload,verify=False)

    # print(response.text,server_key,'-------------',device_id)
