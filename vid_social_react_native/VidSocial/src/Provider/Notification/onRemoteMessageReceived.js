// import { useNavigation } from '@react-navigation/native';

import axios from "axios";
import { appBaseUrl } from "../Apicallingprovider/ApiConstants";
import { msgProvider } from "../Messageconsolevalidationprovider/messageProvider";
import { localStorage } from "../localStorageProvider";
import { CALL_ENDED, CALL_RECEIVED, CallBusy, InCommingCallAccept, InCommingCallCancel, InCommingCallReject, NO_CALL } from "./CallConstants";
import { Lang_chg } from "../Language_provider";
import { config } from "../configProvider";
import { StackActions } from "@react-navigation/native";


export const onRemoteMessageReceived = async (navigation, remoteMessage) => {
    const data = remoteMessage;

    switch (data.event_name) {
        case "incoming_call":

            const call_status = await localStorage.getItemString("call_status");

            if (call_status != CALL_RECEIVED) {
                navigation.navigate("IncomingCallScreen", { data: data })
            } else {
                var UserData = await localStorage.getItemObject("UserData")
                var Token = await localStorage.getItemString("AccessToken")
                console.log(Token);
                var apiUrl = appBaseUrl.SendVideoCallingRequest
                var headers = {
                    'Authorization': 'Bearer ' + Token,
                    'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy',
                    'Content-Type': 'application/json',
                }
                var postData = JSON.stringify({
                    event_name: "calling_response",
                    user_id: UserData.id,
                    receiver_id: data.user_id,
                    callerroom: data.channelname == null ? data.callerroom : data.channelname,
                    callresponse: CallBusy
                });

                // Make a POST request using Axios
                axios.post(apiUrl, postData, { headers })
                    .then(async (response) => {
                        // Handle the successful response
                        if (response.data.code == 200) {
                            global.props.hideLoader();
                        } else {
                            global.props.hideLoader();
                            alert(response.data.msg)
                        }
                    })
                    .catch(error => {
                        global.props.hideLoader();
                        console.log('Busy_END---22', error);
                        // Handle errors
                    });
            }

            break;
        case "calling_response":
            if (data.callresponse == InCommingCallCancel || data.callresponse == InCommingCallReject) {

                await localStorage.setItemString("call_status", NO_CALL.toString())

                global.UserType == 0 ? navigation.navigate("Home_c") : navigation.navigate("Home")

            } else if (data.callresponse == CALL_ENDED) {

                await localStorage.setItemString("call_status", NO_CALL.toString())

                if (global.UserType == 0) {

                    navigation.dispatch(
                        StackActions.replace("CallRating", { data: data })
                    );

                } else {

                    navigation.dispatch(
                        StackActions.replace("TotalEarnedCoins", { data: data })
                    );

                }
            }
            else if (data.callresponse == InCommingCallAccept) {

                navigation.navigate("VideoCalling", { data: data })
                
            } else if (data.callresponse == CallBusy) {
                msgProvider.toast(Lang_chg.Call_Busy[config.language], "bottom")
                global.UserType == 0 ? navigation.navigate("Home_c") : navigation.navigate("Home")
            }
            break;
    }
}

