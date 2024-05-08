// Import necessary dependencies
import React, { useEffect, useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { mobileW, Colors, Font, localStorage, Lang_chg, config } from '../Provider/utilslib/Utils';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { InCommingCallAccept, InCommingCallCancel, InCommingCallReject } from '../Provider/Notification/CallConstants';
import { StackActions, useFocusEffect, useIsFocused, useNavigationState } from '@react-navigation/native';
import Sound from 'react-native-sound';
import RingtoneComponent from '../Components/RIngtoneComponent';


// IncomingCallScreen component
const IncomingCallScreen = ({ route, navigation }) => {
    const currentRouteName = useNavigationState(state => state.routes[state.index]);

    const data = route.params.data
    const isFocused = useIsFocused();
    const [sound, setSound] = useState();

    useEffect(() => {
        const ringtone = new Sound(require('./ringtone.mp3'), (error) => {
          if (error) {
            console.log('Error loading sound:', error);
          } else {
            // Play the sound
            ringtone.play((success) => {
              if (success) {
                console.log('Sound played successfully');
              } else {
                console.log('Error playing sound');
              }
            });
          }
        });
    
        return () => {
          ringtone?.stop();
          ringtone?.release();
        };
      }, []);

    const sendCallResponse = async (status) => {
        // pauseSound()
        var UserData = await localStorage.getItemObject("UserData")
        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);
        const channelName = UserData.phone + Date.now();

        var apiUrl = appBaseUrl.SendVideoCallingRequest
        console.log('apiUrl---', apiUrl);
        var headers = {
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy',
            'Content-Type': 'application/json',
        }

        var postData = JSON.stringify({
            event_name: "calling_response",
            user_id: UserData.id,
            receiver_id: data.user_id,
            callerroom: data.channelname,
            callresponse: status,
            CallId: data.CallId,
            profile_image: data.profile_image,
            Other_profile_image: data.Other_profile_image,
            display_name: data.display_name,
            // ------------ Added By Rupesh 
            userRole: data.userRole,
            Customer_neme: data.Customer_neme,
            worker_name: data.worker_name,
            worker_id: data.worker_id,
            Customer_id: UserData.Customer_id,
            worker_image: data.worker_image,
            customer_image: data.customer_image
        });

        // { "CallId": "1026", "Customer_id": "140", "Customer_neme": "Rock", "agora_token": "006a9899e227ce94e45a4737b57c8f14dd5IADb5xcLOByH11O/uwXvV7lGnZFvqaR7n0/OnvNLnUByQgx+f9gAAAAAIgCO+tADv6XEZQQAAQC/pcRlAgC/pcRlAwC/pcRlBAC/pcRl", "channelname": "test", "customer_image": "http://103.117.65.42:8000/media/140/image.jpg", "display_name": "Rosy", "event_name": "incoming_call", "profile_image": "http://103.117.65.42:8000/media/80/image.jpg", "receiver_id": "140", "sender_mobile": "9784549469", "userRole": "1", "user_id": "80", "worker_id": "80", "worker_image": "http://103.117.65.42:8000/media/80/image.jpg", "worker_name": "Rosy" }

         axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                console.log("VideoAcceptRequestResponse--->", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    switch (status) {

                        case InCommingCallAccept:
                            navigation.dispatch(
                                StackActions.replace("VideoCalling", { data: data })
                            );
                            // navigation.replace("VideoCalling", { data: data })
                            break;
                        case InCommingCallCancel:
                        case InCommingCallReject:
                            // stopRingtone()
                            // storage.set('call_status', CALL_ENDED);
                            // if (Platform.OS === 'android') {
                            //     const { AppStateModule } = NativeModules;
                            //     if (await AppStateModule.isPhoneLocked()) {
                            //         AppStateModule.lockPhone();
                            //     }
                            // }
                            navigation.goBack();
                            break;
                    }

                } else {
                    global.props.hideLoader();
                    alert(response.data.msg)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('VideoSendRequestError---22', error);

            });

    }


    return (
        <View style={styles.container}>
            <View style={{ flex: 1, alignItems: "center", alignContent: "center" }}>


                <Image
                    resizeMode='contain'
                    style={{ borderRadius: mobileW * 50 / 100, width: mobileW * 25 / 100, height: mobileW * 25 / 100, marginTop: mobileW * 20 / 100 }}
                    // source={localimag.girl1}
                    source={data.profile_image != null ? { uri: appBaseUrl.imageUrl + data.profile_image } : localimag.person_icon}

                />

                {/* <Text style={styles.callerName}>{"Pradeep"}</Text> */}
                <Text style={styles.callerName}>{data.display_name}</Text>
                <View
                    style={{ flexDirection: "row", alignItems: 'center', justifyContent: "center" }}
                >
                    <Image
                        resizeMode='contain'
                        style={{ width: mobileW * 7 / 100, height: mobileW * 7 / 100 }}
                        source={localimag.app_Logo}
                    />
                    <Text style={styles.titleName}>{"   "+Lang_chg.VideoCall[config.language]}</Text>
                </View>
            </View>

            <View style={{ justifyContent: "space-around", flexDirection: "row", bottom: 80 }}>
                <TouchableOpacity onPress={() => { sendCallResponse(InCommingCallReject) }}
                    activeOpacity={0.8}>
                    <Image
                        resizeMode='contain'
                        style={{ width: mobileW * 13 / 100, height: mobileW * 13 / 100 }}
                        source={localimag.disconnect}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { sendCallResponse(InCommingCallAccept) }}
                    activeOpacity={0.8}>
                    <Image
                        resizeMode='contain'
                        style={{ width: mobileW * 13 / 100, height: mobileW * 13 / 100 }}
                        source={localimag.connect}
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

export default IncomingCallScreen;
