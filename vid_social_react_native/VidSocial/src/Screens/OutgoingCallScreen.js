
// Import necessary dependencies
import React, { useEffect, useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { mobileW, Colors, Font, localStorage, Lang_chg, config } from '../Provider/utilslib/Utils';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { CALL_ENDED, CALL_STARTED, InCommingCallCancel, InCommingCallReject } from '../Provider/Notification/CallConstants';
import { useIsFocused } from '@react-navigation/native';

// OutgoingCallScreen component
const OutgoingCallScreen = ({ route, navigation }) => {
    const User = route.params.item
    const [videoCallSent, setVideoCallSent] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {

        initVideoCallRequest();
        setVideoCallSent(false)
    }, [])

    const setCallStatus = async (status) => {
        await localStorage.setItemString("call_status", status.toString())
    }


    // useEffect(() => {
    //     var timeout;
    //     if (videoCallSent) {
    //         timeout = setTimeout(() => {
    //             if (isFocused) {
    //                 // navigation.goBack();
    //                 sendCallResponse(InCommingCallCancel)
    //             }
    //         }, 30000);
    //     }

    //     return () => {
    //         clearTimeout(timeout);
    //     }
    // }, [videoCallSent])

    useEffect(() => {
        let timeoutId;

        if (videoCallSent) {
            timeoutId = setTimeout(() => {
                if (isFocused) {
                    // send the call response if the screen is still focused after 10 seconds
                    if (route.name == 'OutgoingCallScreen') {
                        sendCallResponse(InCommingCallCancel);
                    }
                }
            }, 27000);
        }

        return () => {
            // clear the timeout when the component unmounts or when videoCallSent changes
            clearTimeout(timeoutId);
        };
    }, [videoCallSent, isFocused, sendCallResponse]);

    const initVideoCallRequest = async () => {
        setCallStatus(CALL_STARTED)
        var CurrentUserData = await localStorage.getItemObject("UserData")
        var Token = await localStorage.getItemString("AccessToken")
        const channelName = CurrentUserData.phone + Date.now();
        // const channelName = "test1"


        var apiUrl = appBaseUrl.SendVideoCallingRequest
        console.log('apiUrl---', apiUrl);
        var headers = {
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy',
            'Content-Type': 'application/json',
        }

        if (global.UserType == 0) {
            var message = {
                event_name: "incoming_call",
                sender_name: CurrentUserData.name,
                // profile_image: CurrentUserData.profile_image,
                profile_image: CurrentUserData.image_url_link,
                sender_mobile: CurrentUserData.phone,
                display_name: CurrentUserData.display_name,
                user_id: CurrentUserData.id,
                receiver_id: User.id,
                channelname: channelName,
                // ------- Added by Rupesh 
                userRole: 0,
                Customer_neme: CurrentUserData.display_name,
                worker_name: User.display_name,
                worker_id: User.id,
                Customer_id: CurrentUserData.id,
                customer_image: CurrentUserData.image_url_link,
                worker_image: User.image_url_link,
            };
        } else {
            var message = {
                event_name: "incoming_call",
                sender_name: CurrentUserData.display_name,
                profile_image: CurrentUserData.image_url_link,
                sender_mobile: CurrentUserData.phone,
                display_name: CurrentUserData.display_name,
                user_id: CurrentUserData.id,
                receiver_id: User.id,
                channelname: channelName,
                // ------- Added by Rupesh 
                userRole: 1,
                Customer_neme: User.display_name,
                worker_name: CurrentUserData.display_name,
                worker_id: CurrentUserData.id,
                Customer_id: User.id,
                customer_image: User.image_url_link,
                worker_image: CurrentUserData.image_url_link
            };
        }

        console.log(global.UserType, 'postDataSendCallRequest==>', message);

        axios.post(apiUrl, JSON.stringify(message), { headers })
            .then(async (response) => {
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    // setMessage(message);
                    // setCallInfo(message);
                    // storage.set('call_status', CALL_RECEIVED);
                    setVideoCallSent(true);
                    console.log("CallSendRequestResponse--->", response.data);
                } else {
                    global.props.hideLoader();
                    alert(response.data.message)
                    navigation.goBack();
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('VideoSendRequestError---22', error);
                // Handle errors
            });

    }


    const sendCallResponse = async (status) => {
        // if (!props._isInternetConnected) {
        //     goBack();
        // }
        setCallStatus(CALL_ENDED)

        var UserData = await localStorage.getItemObject("UserData")
        // setCustomerProfileData(UserData)
        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);
        // const channelName = UserData.phone + Date.now();

        var apiUrl = appBaseUrl.SendVideoCallingRequest
        console.log('apiUrl---', apiUrl);
        var headers = {
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy',
            'Content-Type': 'application/json',

        }

        var userType = 0

        if (global.UserType == 0) {
            userType = 0
        } else {
            userType = 1
        }
        var postData = JSON.stringify({
            event_name: "calling_response",
            user_id: UserData.id,
            profile_image: UserData.image_url_link,
            receiver_id: User.id,
            callerroom: "test",
            callresponse: status,
            display_name: User.display_name,
            userRole: userType
        });

        console.log('calling_responseRequestOut==>', postData);

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("calling_responseEndCallResponse--->", response.data);
                if (response.data.code == 200) {
                    // joinCall(channelName)
                    global.props.hideLoader();
                    // storage.set('call_status', CALL_ENDED);
                    // setCallResponse(undefined);
                    navigation.goBack();

                } else {
                    global.props.hideLoader();
                    alert(response.data.msg)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('VideoSendRequestError---22', error);
                // Handle errors
            });
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, alignItems: "center", alignContent: "center" }}>


                <Image
                    resizeMode='contain'
                    style={{ borderRadius: mobileW * 50 / 100, width: mobileW * 25 / 100, height: mobileW * 25 / 100, marginTop: mobileW * 20 / 100 }}
                    // source={localimag.girl1}
                    source={User.image_url_link != null ? { uri: appBaseUrl.imageUrl + User.image_url_link } : localimag.person_icon}
                />

                <Text style={styles.callerName}>{User.display_name}</Text>
                <Text style={styles.titleName}>{Lang_chg.Calling[config.language]}</Text>

            </View>

            <View style={{ justifyContent: "space-around", flexDirection: "row", bottom: 80 }}>
                <TouchableOpacity onPress={() => { }}
                    activeOpacity={0.8}>
                    <Image
                        resizeMode='contain'
                        style={{ width: mobileW * 13 / 100, height: mobileW * 13 / 100 }}
                        source={localimag.mic2}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { sendCallResponse(InCommingCallCancel) }}
                    activeOpacity={0.8}>
                    <Image
                        resizeMode='contain'
                        style={{ width: mobileW * 13 / 100, height: mobileW * 13 / 100 }}
                        source={localimag.disconnect}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { }}
                    activeOpacity={0.8}>
                    <Image
                        resizeMode='contain'
                        style={{ width: mobileW * 13 / 100, height: mobileW * 13 / 100 }}
                        source={localimag.VideoCallicon}
                    />
                </TouchableOpacity>

            </View>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground
    },
    callerName: {
        fontSize: mobileW * 6 / 100,
        marginTop: mobileW * 8 / 100,
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
    },
    titleName: {
        fontSize: mobileW * 4 / 100,
        marginTop: mobileW * 1 / 100,
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
    },
    acceptButton: {
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    rejectButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default OutgoingCallScreen;
