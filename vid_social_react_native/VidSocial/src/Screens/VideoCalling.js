import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, BackHandler, Alert, FlatList, Dimensions, Animated } from 'react-native'
import React, { useRef, useState, useEffect, useId } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import { StackActions, useFocusEffect, useNavigationState, useIsFocused } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import firebase from '../Firebase/firebaseConfig';
import { SendMessage, RecieveMessage, SendPauserStatus, ReceivePauserStatus, ClearFireBaseChattingData, ClearFireBaseVideoPauseData } from '../Firebase/Message';
import HideWithKeyboard from 'react-native-hide-with-keyboard';
import CommonAlert from '../Components/CommonAlert';
import BackgroundTimer from 'react-native-background-timer';
import VideoCallPopup from '../Screens/VideoCallPopup'
import { PermissionsAndroid, Platform } from 'react-native';
import {
    ClientRoleType,
    createAgoraRtcEngine,
    IRtcEngine,
    RtcSurfaceView,
    ChannelProfileType,
} from 'react-native-agora';
import moment from 'moment';
import KeyboardAvoidingView from 'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView';
import { CALL_ENDED, CALL_RECEIVED, NO_CALL } from '../Provider/Notification/CallConstants';
import KeepAwake from 'react-native-keep-awake';

export default function VideoCalling({ route, navigation }) {

    const [modalVisible, setmodalVisible] = React.useState(false);
    const [modalVisibleForWorker, setmodalVisibleForWorker] = React.useState(false);
    // const WorkerId = route.params.item.id
    const guestUid = route.params.data.user_id
    const User = route.params.data

    const appId = '22a0df60a5624fe7813cd010df44549d';


    const channelName = User.channelname == null ? User.callerroom : User.channelname;
    const token = User.agora_token;
    const uid = 0;
    //   ==============  FireBase Chatting Code Start ==========================
    const [Firebasemessage, setFirebasemessage] = useState('')
    const [currentUid, setcurrentUid] = useState('')
    const [currentUserRole, setCurrentUserRole] = useState('')
    const [ProfileImage, setProfileImage] = useState('')
    const [DisplayName, setDisplayName] = useState('')

    const [allMessages, setallMessages] = useState([])
    const [inputHeight, setInputHeight] = useState(0);
    const [ShowChat, setShowChat] = useState(false);
    const [GiftList, setGiftList] = useState([]);
    const [CallId, setCallId] = useState(User.CallId);
    const [TotalDeductedCoins, setTotalDeductedCoins] = useState(0);
    const [TotalEarnedCoins, setTotalEarnedCoins] = useState(0);
    // const guestUid = route.params.data;
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    // ========= For Timer =========
    const [timer, setTimer] = useState(0);
    const [isRecording, setIsRecording] = useState(true);
    const [AllGifts, setAllGifts] = useState([]);
    const [GiftLength, setGiftLength] = useState(0);
    const [CallingView, setCallingView] = useState(true);
    const [User_id, setUser_id] = useState(0);
    const [VideoPaused, setVideoPaused] = useState(false);
    const [CustomerCoins, setCustomerCoins] = useState();
    const [CustomerCoinsForMinus, setCustomerCoinsForMinus] = useState(0);
    const [WorkerCoins, setWorkerCoins] = useState(0);
    const [CallRate, setCallRate] = useState(1);
    const [DemoCall, setDemoCall] = useState(true);

    function usePrevious(value) {
        const ref = useRef();

        // Get previous value
        const ret = ref.current;

        // Store current value in ref
        ref.current = value;

        // Return previous value
        return ret;
    }

    // ------------- State for Call Alert --------------------
    const [AlertModal, setAlertModal] = useState(false)
    const [AlertMessage, setAlertMessage] = useState('')
    // ------------- State for gift Animation ----------------
    const [selected, setSelected] = useState(false)
    const [WorkerGiftPopup, setWorkerGiftPopup] = useState(false)
    const [JsonGiftData, setJsonGiftData] = useState({})
    const [JsonGiftDataForWoker, setJsonGiftDataForWoker] = useState({})
    const selectedAnim = useRef(new Animated.Value(1)).current;
    const selectedAnimForWorker = useRef(new Animated.Value(1)).current;
    const [isCallActive, setIsCallActive] = useState(true);
    const [StartAfter, setStartAfter] = useState('') // To check call init by 
    const [callDuration, setCallDuration] = useState(0); // Call Dutarion counter
    const agoraEngineRef = useRef(); // Agora engine instance
    const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
    const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
    const [message, setMessage] = useState(''); // Message to the user
    const [isMutes, setIsMutes] = useState(false); // Message to the user
    const [isVideo, setIsVideo] = useState(false); // Message to the user
    const currentRouteName = useNavigationState(state => state.routes[state.index]);
    //   for showing mssages count 
    const [previmessageCount, setprevimessageCount] = useState(0)

    useFocusEffect(
        React.useCallback(() => {
            console.log('calling from usefocuseffect 1111');
            const handleBackPress = () => {
                backAction()
                setmessageCount(0)
                // Handle the back button press on this screen
                return true; // Return true to prevent default behavior (e.g., navigate back)
            };

            BackHandler.addEventListener('hardwareBackPress', handleBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
            };
        }, [])
    );

    useEffect(() => {
        console.log('11111111111111111111');
        if (CallId != 0) {
            _StartCallApiCalling()
        }
    }, [CallId])


    const handleMinimize = () => {
        setIsCallActive(false);
    };

    const handleRestore = () => {
        setIsCallActive(true);
    };


    useEffect(() => {
        getUUID();
        GetUserId()

        // Initialize Agora engine when the app starts
        setTimeout(() => {
            join();
        }, 1000);

        console.log('11111111111111111111');
        // To keep the screen awake
        KeepAwake.activate();
        // Initialize Agora engine when the app starts
        setupVideoSDKEngine();

    }, []);

    const backAction = () => {
        setShowChat(false)
        return true;
    }

    const GetUserId = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        setUser_id(UserData.id)
    }


    useEffect(() => {
        console.log('22222222222222222222');
        getUUID();
        _togetPauseStatus()
        _TogetAllGiftDetails()
        _togetAllMessages()
    }, [isFocused]);

    useEffect(() => {
        console.log('33333333333333333333');
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior of leaving the screen
            e.preventDefault();

            leave2();

            navigation.dispatch(e.data.action);
            //   // Show an alert to confirm leaving the screen
            //   Alert.alert(
            //     'Leave the screen?',
            //     'Are you sure you want to leave this screen?',
            //     [
            //       {
            //         text: 'Cancel',
            //         style: 'cancel',
            //         onPress: () => {},
            //       },
            //       {
            //         text: 'Leave',
            //         onPress: () => {
            //           // Perform the default action of leaving the screen
            //           navigation.dispatch(e.data.action);
            //         },
            //       },
            //     ],
            //   );

            // sendCallResponse(CALL_ENDED)
        });

        return unsubscribe;
    }, [navigation]);

    const sendCallResponse = async (status) => {


        console.log('--------------------------------------------00000');

        var UserData = await localStorage.getItemObject("UserData")
        // setCustomerProfileData(UserData)
        var Token = await localStorage.getItemString("AccessToken")
        // const channelName = UserData.phone + Date.now();
        var apiUrl = appBaseUrl.SendVideoCallingRequest
        var headers = {
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy',
            'Content-Type': 'application/json',
        }

        var UserProfilepic = null;
        var UserDisplayName = '';

        if (User.userType == 0) {
            UserProfilepic = User.profile_image
            UserDisplayName = User.display_name
        } else {
            UserProfilepic = UserData.image_url_link
            UserDisplayName = UserData.display_name
        }

        var postData = JSON.stringify({
            event_name: "calling_response",
            user_id: UserData.id,
            receiver_id: User.user_id,
            callerroom: User.channelname == null ? User.callerroom : User.channelname,
            callresponse: status,
            profile_image: UserProfilepic,
            display_name: UserDisplayName,
            CallId: User.CallId,
            // ------- Added by Rupesh 
            userRole: User.userRole,
            Customer_neme: User.Customer_neme,
            worker_name: User.worker_name,
            worker_id: User.worker_id,
            Customer_id: User.Customer_id,
            customer_image: User.customer_image,
            worker_image: User.worker_image

        });

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                if (response.data.code == 200) {
                    // joinCall(channelName)
                    global.props.hideLoader();
                    // storage.set('call_status', CALL_ENDED);
                    // setCallResponse(undefined);
                } else {
                    global.props.hideLoader();
                    alert(response.data.msg)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('ROOM_END---22', error);
                // Handle errors
            });
    }

    // ---------------- To get All All Gift Details ------------------------------
    const _TogetWorkerGiftList = async () => {
        // global.props.showLoader();
        let apiUrl = appBaseUrl.GetWorkerGift + CallId;
        var headers = {
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        }
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                if (response.data.code == 200) {
                    setTotalEarnedCoins(response.data.WorkerCallEarning)
                    var AllData = response.data.data
                    var GiftLengthByApi = response.data.data.length
                    if (GiftLengthByApi > GiftLength) {
                        if (global.UserType == 1) {
                            ToShowPopupForWorker(true)
                            setWorkerGiftPopup(true)
                            setJsonGiftDataForWoker(AllData[0])
                            HandleReceiveGiftLocally(AllData[0].gift_coin)
                        }
                    }
                    setAllGifts(AllData)
                    setGiftLength(GiftLengthByApi);

                } else {
                    setAllGifts([])
                }
            })
            .catch(error => {
                global.props.hideLoader();
                // alert(error);
                console.log(error);
            });
    }

    const toShowGiftsToWorker = async (AllData) => {
        var AlldataToshow = AllGifts.length
        if (AllData.length > AlldataToshow) {
            for (let i = 0; i < AllData.length; i++) {
                setJsonGiftData(AllData[0])
                setmodalVisibleForWorker(true)
            }
            ToShowPopup()
        }
    }

    useEffect(() => {
        console.log('44444444444444444444',GiftLength);
        const intervalId = setInterval(_TogetWorkerGiftList, 2000);
        return () => clearInterval(intervalId);
    }, [GiftLength]);

    //   =============== For Timer ============
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isRecording]);

    const getUUID = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        setcurrentUid(UserData.id)
        setCurrentUserRole(UserData.role_id)
        setProfileImage(UserData.image_url_link)
        setDisplayName(UserData.display_name)
    }

    // =================== Call Start Api ===========================
    // =====================Api calling==============================
    const _StartCallApiCalling = async () => {

        var Token = await localStorage.getItemString("AccessToken")
        // global.props.showLoader();
        let apiUrl = appBaseUrl.CallInitiate;
        var postData = JSON.stringify({
            CallId: CallId
        });

        console.warn(apiUrl, "customerIdforCallId==>", postData)

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                console.log('------->>>>', response.data);
                // Handle the successful response
                if (response.data.code == 200) {
                    var callInitBy = response.data.CallDetail.call_started_role
                    var CusromerTotalCoins = response.data.CallDetail.usercoin
                    var perCallRate = response.data.CallDetail.coin_exchange_rate
                    var DemoCall = response.data.CallDetail.is_demo_call
                    setCustomerCoins(CusromerTotalCoins)
                    // setCustomerCoins(0)
                    // setCustomerCoins(0)
                    setCustomerCoinsForMinus(CusromerTotalCoins)
                    setCallRate(perCallRate)
                    setDemoCall(DemoCall)
                    if (callInitBy == "worker") {
                        setStartAfter("worker")
                    } else {
                        setStartAfter("user")
                    }
                } else {
                    global.props.hideLoader();
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Api Error---', error);
                // Handle errors
            });
    }

    // ---------------- To get All All Gift Details ------------------------------
    const _TogetAllGiftDetails = async () => {

        var Token = await localStorage.getItemString("AccessToken")

        // global.props.showLoader();
        let apiUrl = appBaseUrl.GiftList;
        var headers = {
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        }

        axios.get(apiUrl, { headers })
            .then(async (response) => {
                if (response.data.code == 200) {
                    // global.props.hideLoader();
                    setGiftList(response.data.data)
                } else {
                    // global.props.hideLoader();
                    alert(response.data.message);
                }
            })
            .catch(error => {
                global.props.hideLoader();
                // alert(error);
                console.log(error);
            });
    }

    const [messageCount, setmessageCount] = useState(0)
    // ------------ To Get message ------------------
    const _togetAllMessages = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        const User_id = UserData.id
        const guestUid = route.params.data.user_id;
        console.log('messageCountmessageCount', messageCount);
        try {
            firebase.database().
                ref('messages').
                child(User_id).
                child(guestUid).
                on("value", (dataSnapshot) => {
                    let message = [];
                    dataSnapshot.forEach((data) => {
                        message.push({
                            sendBy: data.val().messege.sender,
                            recieveBy: data.val().messege.reciever,
                            msg: data.val().messege.msg,
                            image: data.val().messege.image,
                            date: data.val().messege.date,
                            time: data.val().messege.time,
                            isGift: data.val().messege.isGift,
                        });
                    })
                    setallMessages(message.reverse())
                })
        } catch (error) {
            alert('User Not Found !!');
        }
    }

    useEffect(() => {
        MessageCount()
    }, [allMessages])


    const MessageCount = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        var RoleID = UserData.role_id
        for (let i = 0; i < allMessages.length; i++) {
            if (RoleID == 'worker') {
                if (User_id != allMessages[i].sendBy) {
                    // Calculate message count and set it
                    setmessageCount(messageCount + 1)
                }
            } else {
                if (User_id != allMessages[i].sendBy) {
                    if (allMessages[i].isGift == false) {
                        // Calculate message count and set it
                        console.log('selected==========', selected);
                        if (selected == false) {
                            setmessageCount(messageCount + 1)
                        }
                    }
                }
            }
        }
    }
    // ------------ To Get message ------------------
    const _togetPauseStatus = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        const User_id = UserData.id
        const guestUid = route.params.data.user_id;
        try {
            firebase.database().
                ref('VideoPause').
                child(User_id).
                child(guestUid).
                on("value", (dataSnapshot) => {
                    let message = [];
                    if (dataSnapshot.val() != null) {
                        if (User_id == dataSnapshot.val().pausedTo) {
                            setVideoPaused(dataSnapshot.val().pauseVideo)
                        }
                    }
                    setallMessages(message.reverse())
                })
        } catch (error) {
            alert('User Not Found !!');
        }
    }

    const pauseStatus = () => {
        SendPauserStatus(currentUid, guestUid, !isVideo).
            then((res) => {
            }).catch((err) => {
                // alert(err)
                console.log(err);
            })
        // ------------ To Receive Messages -----------------
        ReceivePauserStatus(currentUid, guestUid, !isVideo).
            then((res) => {
            }).catch((err) => {
                // alert(err)
                console.log(err);
            })
    }

    // ------------ To Send Message --------------------
    const sendMessagesss = async () => {
        if (Firebasemessage.trim() != '') {
            SendMessage(currentUid, guestUid, Firebasemessage, '', "", '', false).
                then((res) => {
                    setFirebasemessage('')
                }).catch((err) => {
                    // alert(err)
                    console.log(err);
                })
            // ------------ To Receive Messages -----------------
            RecieveMessage(currentUid, guestUid, Firebasemessage, '', "", '', false).
                then((res) => {
                    setFirebasemessage('')
                }).catch((err) => {
                    // alert(err)
                    console.log(err);
                })
        } else {
            msgProvider.toast(Lang_chg.Cantsendemptymessage[config.language], 'center')
        }
    }

    // ------------ To Send Message --------------------
    const sendGiftInMessages = async (item) => {
        var blockStatus = false;
        SendMessage(currentUid, guestUid, item.name, item.gift_image, item.name, item.coin, true).
            then((res) => {
                setFirebasemessage('')
            }).catch((err) => {
                // alert(err)
                console.log(err);
            })
        // ------------ To Receive Messages -----------------
        RecieveMessage(currentUid, guestUid, item.name, item.gift_image, item.name, item.coin, true).
            then((res) => {
                setFirebasemessage('')
            }).catch((err) => {
                // alert(err)
                console.log(err);
            })
    }

    const setupVideoSDKEngine = async () => {
        console.log('--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------');
        try {
            await localStorage.setItemString("call_status", CALL_RECEIVED.toString())

            // use the helper function to get permissions
            if (Platform.OS === 'android') { await getPermission() };
            agoraEngineRef.current = createAgoraRtcEngine();
            const agoraEngine = agoraEngineRef.current;
            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    showMessage('Successfully joined the channel Prr ' + channelName);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, Uid) => {
                    showMessage('Remote user joined with uid ' + Uid);
                    setRemoteUid(Uid);
                },
                onUserOffline: (_connection, Uid) => {
                    showMessage('Remote user left the channel. uid: ' + Uid);
                    setRemoteUid(0);
                },
            });
            agoraEngine.initialize({
                appId: appId,
                channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
            });
            agoraEngine.enableVideo();

        } catch (e) {
            console.log(e);
        }
    };

    // ==== For Camere Switching ==========
    const switchCamera = () => {
        agoraEngineRef.current = createAgoraRtcEngine();
        const agoraEngine = agoraEngineRef.current;
        agoraEngine.switchCamera();
    };

    // useFocusEffect(
    //     React.useCallback(() => {
    //         setTimeout(() => {
    //             if (isJoined) {
    //                 return;
    //             }
    //         }, 1000);
    //         if (isJoined) {
    //             join()
    //         }
    //     }, [])
    // );

    useFocusEffect(
        React.useCallback(() => {
            console.log('i am here in join call useFocusEffect');
            const timeoutId = setTimeout(() => {
                if (isJoined) {
                    return;
                }
            }, 1000);

            if (isJoined) {
                join();
            }

            // Cleanup function
            return () => clearTimeout(timeoutId);
        }, [isJoined, join])
    );


    const join = async () => {

        if (isJoined) {
            return;
        }
        try {
            agoraEngineRef.current?.setChannelProfile(
                ChannelProfileType.ChannelProfileCommunication,
            );
            agoraEngineRef.current?.startPreview();
            agoraEngineRef.current?.joinChannel(token, channelName, uid, {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });
        } catch (e) {
            console.log(e);
        }
    };

    const leave2 = async () => {

        ClearFireBaseChattingData()
        ClearFireBaseVideoPauseData()

        try {
            agoraEngineRef.current?.leaveChannel();
            setRemoteUid(0);
            setIsJoined(false);
            showMessage('You left the channel');
        } catch (e) {
            console.log(e);
        }
        await localStorage.setItemString("call_status", CALL_ENDED.toString())
        if (global.UserType == 0) {
            navigation.dispatch(
                StackActions.replace("CallRating", { data: User })
            );
        } else {
            navigation.dispatch(
                StackActions.replace("TotalEarnedCoins", { data: User })
            );
            // navigation.navigate("TotalEarnedCoins", { data: User })
        }

        //    setTimeout(() => {
        //           global.UserType == 0 ? navigation.navigate("CallRating") : navigation.navigate("TotalEarnedCoins")
        //    }, 500);
        // To allow the screen to sleep
        KeepAwake.deactivate();

    };

    const leave = async (status) => {
        isMute()
        _EndCallApiCalling(status)
        await localStorage.setItemString("call_status", NO_CALL.toString())

        try {
            agoraEngineRef.current?.leaveChannel();
            setRemoteUid(0);
            setIsJoined(false);
            showMessage('You left the channel');
        } catch (e) {
            console.log(e);
        }

        sendCallResponse(CALL_ENDED)

        // To allow the screen to sleep
        KeepAwake.deactivate();

    };

    const getPermission = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.CAMERA,
            ]);
        }
    };

    function showMessage(msg) {
        setMessage(msg);
    }

    const isMute = () => {

        // if(isJoined === false)
        // {
        //     Alert.alert("Join the channel to mute and unmute the remote user");
        //     return;
        // }
        // if (remoteUid.length !== 0) {
        //     agoraEngineRef.current?.muteRemoteAudioStream(remoteUid[0], mute);
        // }
        // else {
        //     Alert.alert("No remote user in the channel");
        // }

        setIsMutes(!isMutes)
        agoraEngineRef.current?.muteLocalAudioStream(!isMutes);
    };

    const isVideos = () => {
        setIsVideo(!isVideo)
        agoraEngineRef.current?.muteLocalVideoStream(!isVideo);
        pauseStatus()
    };

    const getMessageDay = (lastTime) => {
        // return false
        // console.log('lastTime======',lastTime);
        const diff = moment(moment(lastTime)).diff(moment(), 'days');
        // console.log('lastTime======',diff);
        let time = "";
        if (diff == -1) {
            time += "Yesterday";
        } else if (diff < -1) {
            time += moment(lastTime).locale('en').format('DD MMMM YYYY') + "";
        } else {
            time += "Today";
        }
        return time;
    }

    // ==============  To send gift to Worker ======================
    const ToSendGift = async (data) => {

        if (data.coin > CustomerCoins) {
            setAlertMessage(Lang_chg.NoSufficientCredit[config.language],)
            setAlertModal(true)
            return false
        }

        setSelected(true)
        setJsonGiftData(data)
        sendGiftInMessages(data)
        setmodalVisible(false)

        // return fals
        var UserData = await localStorage.getItemObject("UserData")

        var Token = await localStorage.getItemString("AccessToken")

        let apiUrl = appBaseUrl.SendGiftToWorker;
        var postData = JSON.stringify({
            call_id: CallId,
            gift_name: data.name,
            gift_coin: data.coin
        });
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };
        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                if (response.data.code == 200) {
                    ToShowPopup()
                    var GetRemainingCoins = response.data.data;
                    setTotalDeductedCoins(GetRemainingCoins.user_total_coin);
                    setTotalEarnedCoins(GetRemainingCoins.worker_total_coin);

                    if (GetRemainingCoins.user_total_coin == 5) {
                        setAlertMessage(Lang_chg.Yourcoinsareabouttorunout[config.language],)
                        setAlertModal(true)
                    }

                    if (GetRemainingCoins.user_total_coin <= 0) {
                        sendCallResponse(CALL_ENDED)
                        if (UserData.role_id == "user") {
                            setAlertMessage(Lang_chg.NoSufficientCredit[config.language],)
                            setAlertModal(true)
                        }
                    }

                    HandleGiftLocally(data.coin)
                } else {
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                }
            })
            .catch(error => {
                console.log('_ToRequestSponsor---22', error);
                // Handle errors
            });
    }

    const formatTime = (seconds) => {
        let minutes
        if (seconds > 599) {
            minutes = Math.floor(seconds / 60);
        } else {
            minutes = '0' + Math.floor(seconds / 60);
        }
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const ToShowPopup = () => {
        Animated.sequence([
            Animated.timing(selectedAnim, {
                toValue: 2,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(selectedAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start(() => setSelected(prev => !prev));
    }

    const ToShowPopupForWorker = () => {
        Animated.sequence([
            Animated.timing(selectedAnimForWorker, {
                toValue: 2,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(selectedAnimForWorker, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start(() => setWorkerGiftPopup(prev => !prev));
    }

    // =================================================================

    useEffect(() => {
        console.log('6666666666666666666666');
        // Start the timer when the component mounts
        const intervalId = BackgroundTimer.setInterval(() => {
            setCallDuration((prevDuration) => prevDuration + 1);
        }, 1000);

        // Clean up the interval when the component unmounts
        return () => {
            BackgroundTimer.clearInterval(intervalId);
        };
    }, []);

    const formatTimeFromAgora = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const formatTimeForApi = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}.${String(remainingSeconds).padStart(2, '0')}`;
    };


    useEffect(() => {
        let interval;

        // --------- if call started by Customer first
        if (StartAfter === 'user') {
            handleAddition();
        }
        // --------- if call started by Worker first
        interval = setInterval(handleAddition, 62000);

        // Clear interval on component unmount
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [StartAfter, CallRate]);


    // ================== Coins management ========================
    const handleAddition = async () => {
        setCustomerCoins(prevValue => prevValue - 1 * CallRate);
        setWorkerCoins(prevValue => prevValue + 1 * CallRate);
    };

    useEffect(() => {
        toCheckCallEndDuration()
    }, [CustomerCoins])

    useEffect(() => {
        // Initialize intervalId variable outside the if block
        let intervalId;
        if (CustomerCoins <= 0) {
            // Set an interval          if (currentRouteName == 'VideoCalling') {
            intervalId = setInterval(() => {
                if (global.UserType === 0) {
                    if (currentRouteName.name == 'VideoCalling') {
                        setAlertMessage(Lang_chg.NoSufficientCredit[config.language])
                        setAlertModal(true)
                        leave(true)
                        clearInterval(intervalId) // Clear interval after executing once
                    }
                }
            }, 58000)
        }
        // Clear interval on component unmount
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [CustomerCoins]);

    const toCheckCallEndDuration = async () => {
        // ------------ If call started by user -------------
        if (StartAfter == 'user') {
            // Update the state using the previous state
            var UserData = await localStorage.getItemObject("UserData")
            if (CustomerCoins < CallRate * 2) {
                if (UserData.role_id == "user") {
                    setAlertMessage(Lang_chg.Yourcoinsareabouttorunout[config.language],)
                    setAlertModal(true)
                }
            }

            if (UserData.role_id == "user") {
                if (CustomerCoins <= 0) {
                    setAlertMessage(Lang_chg.NoSufficientCredit[config.language])
                    setAlertModal(true)
                    if (global.UserType == 0) {
                        leave(false)
                    }
                }
            }
        }
        // ------------ If call started by Worker -------------
        else {
            if (CustomerCoins <= 0) {
                console.log('i am here !!!');
            } else {
                var UserData = await localStorage.getItemObject("UserData")
                if (CustomerCoins < CallRate * 2) {
                    if (UserData.role_id == "user") {
                        setAlertMessage(Lang_chg.Yourcoinsareabouttorunout[config.language])
                        setAlertModal(true)
                    }
                }

                if (UserData.role_id == "user") {
                    if (CustomerCoins <= 0) {
                        setAlertMessage(Lang_chg.NoSufficientCredit[config.language])
                        setAlertModal(true)
                        if (global.UserType == 0) {
                            leave(false)
                        }
                    }
                }
            }
        }

    }

    const HandleGiftLocally = (coins) => {
        setCustomerCoins(prevValue => prevValue - Number(coins));
    }

    const HandleReceiveGiftLocally = (coins) => {
        setWorkerCoins(prevValue => prevValue + Number(coins));
    }

    // =====================Api calling for call End==============================
    const _EndCallApiCalling = async (status) => {

        var UserData = await localStorage.getItemObject("UserData")
        var total_Coins = 0;
        if (UserData.role_id == 'user') {
            total_Coins = CustomerCoinsForMinus - CustomerCoins
        } else {
            total_Coins = WorkerCoins
        }

        let apiUrl = appBaseUrl.EndCalling;

        if (status) {
            var postData = JSON.stringify({
                CallId: CallId,
                Totalcoin: total_Coins,
                Duration: "00.58"
            });
        } else {
            var postData = JSON.stringify({
                CallId: CallId,
                Totalcoin: total_Coins,
                Duration: formatTimeForApi(callDuration)
            });
        }

        console.log(postData, '=======================', apiUrl);

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                console.log('response is here -------------------------->>>>>', response.data);
                // Handle the successful response
                if (response.data.code == 200) {
                    leave2();
                    console.log(response.data.data);
                } else {
                    global.props.hideLoader();
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Api Error---', error);
                // Handle errors
            });
    }


    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.container}
            >
                <CommonAlert AlertData={AlertMessage} mediamodal={AlertModal}
                    Canclemedia={() => { setAlertModal(false) }}
                />
                {/* ------------------------------------------------- */}
                {isCallActive ? (
                    <>
                        {/* ---------- To Hide Show Video Calling View ---------- */}
                        {CallingView ?
                            <>
                                {isJoined &&
                                    <>
                                        {/* ----------- IF Video Paused so work ----------- */}
                                        <React.Fragment key={remoteUid}>
                                            <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.videoView} />
                                        </React.Fragment>
                                    </>
                                }

                                {isJoined && remoteUid != 0 &&
                                    <View style={styles.videoView2}>
                                        {isVideo ?
                                            <View
                                                style={{
                                                    width: mobileW * 30 / 100, height: mobileH * 25 / 100, backgroundColor: '#000000',
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <Image
                                                    resizeMode='cover'
                                                    style={{ width: mobileW * 25 / 100, height: mobileW * 25 / 100, borderRadius: mobileW * 12.5 / 100 }}
                                                    source={ProfileImage != null ? { uri: appBaseUrl.imageUrl + ProfileImage } : localimag.person_icon}

                                                />
                                                <Text
                                                    style={[styles.TimeText, { fontSize: mobileW * 4.5 / 100, marginTop: mobileW * 0.5 / 100 }]}
                                                >{DisplayName}</Text>
                                            </View>
                                            :
                                            <TouchableOpacity
                                                onPress={() => { setCallingView(!CallingView) }}
                                                style={[styles.videoView1, { top: 5, right: 10, height: mobileH * 40 / 100, }]}
                                            >
                                                <View
                                                    style={{ backgroundColor: '#000000' }}
                                                >
                                                    {(global.UserType == 0) &&
                                                        <Text style={styles.TimeText}>{!CallingView ? User.worker_name : Lang_chg.YouTxt[config.language]}</Text>
                                                    }
                                                    {(global.UserType == 1) &&
                                                        <Text style={styles.TimeText}>{!CallingView ? User.Customer_neme : Lang_chg.YouTxt[config.language]}</Text>
                                                    }
                                                </View>
                                                <React.Fragment key={0}>
                                                    <RtcSurfaceView
                                                        canvas={{ uid: 0 }}
                                                        style={[styles.videoView1, { top: 26 }]}
                                                    />
                                                </React.Fragment>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                }
                            </>
                            :
                            <>
                                {isJoined &&
                                    <>
                                        {!isVideo ?
                                            <>
                                                <React.Fragment key={0}>
                                                    <RtcSurfaceView canvas={{ uid: 0 }} style={styles.videoView} />
                                                </React.Fragment>
                                            </>
                                            :
                                            <View
                                                style={styles.videoView}
                                            >
                                                <View
                                                    style={{
                                                        height: mobileH,
                                                        width: mobileW, alignItems: "center", justifyContent: 'center'
                                                    }}
                                                >
                                                    <Image
                                                        resizeMode='cover'
                                                        style={{ width: mobileW * 30 / 100, height: mobileW * 30 / 100, borderRadius: mobileW * 15 / 100 }}
                                                        source={ProfileImage != null ? { uri: appBaseUrl.imageUrl + ProfileImage } : localimag.person_icon}
                                                    />
                                                    <Text
                                                        style={[styles.TimeText, {
                                                            fontSize: mobileW * 4.5 / 100,
                                                            color: Colors.blackColor,
                                                            marginTop: mobileW * 0.5 / 100
                                                        }]}
                                                    >{DisplayName}</Text>
                                                    <Text
                                                        style={[styles.TimeText, {
                                                            fontSize: mobileW * 4.5 / 100,
                                                            color: Colors.blackColor,
                                                            marginTop: mobileW * 0.5 / 100
                                                        }]}
                                                    >{Lang_chg.VideoPause[config.language]}</Text>
                                                </View>
                                            </View>
                                        }
                                    </>
                                }

                                {isJoined && remoteUid != 0 &&
                                    <View style={styles.videoView2}>
                                        {isVideo ?
                                            <>
                                                <View
                                                    style={{ backgroundColor: '#000000' }}
                                                >
                                                    {(global.UserType == 0) &&
                                                        <Text style={styles.TimeText}>{!CallingView ? User.worker_name : 'Me '}</Text>
                                                    }
                                                    {(global.UserType == 1) &&
                                                        <Text style={styles.TimeText}>{!CallingView ? User.Customer_neme : 'Me '}</Text>
                                                    }
                                                </View>
                                                <React.Fragment key={remoteUid}>
                                                    <RtcSurfaceView
                                                        canvas={{ uid: remoteUid }}
                                                        style={[styles.videoView1, { top: 26 }]}
                                                    />
                                                </React.Fragment>
                                            </>
                                            // <View
                                            //     style={{
                                            //         width: mobileW * 30 / 100, height: mobileH * 25 / 100, backgroundColor: '#000000',
                                            //         alignItems: 'center', justifyContent: 'center'
                                            //     }}
                                            // >
                                            //     <Image
                                            //         resizeMode='cover'
                                            //         style={{ width: mobileW * 25 / 100, height: mobileW * 25 / 100, borderRadius: mobileW * 12.5 / 100 }}
                                            //         source={ProfileImage != null ? { uri: ProfileImage } : localimag.person_icon}

                                            //     />
                                            //     <Text
                                            //         style={[styles.TimeText, { fontSize: mobileW * 4.5 / 100, marginTop: mobileW * 0.5 / 100 }]}
                                            //     >{DisplayName}</Text>
                                            // </View>
                                            :
                                            <TouchableOpacity
                                                onPress={() => { setCallingView(!CallingView) }}
                                                style={[styles.videoView1, { top: 5, right: 10, height: mobileH * 40 / 100, }]}
                                            >
                                                <View
                                                    style={{ backgroundColor: '#000000' }}
                                                >
                                                    {(global.UserType == 0) &&
                                                        <Text style={styles.TimeText}>{!CallingView ? User.worker_name : 'Me '}</Text>
                                                    }
                                                    {(global.UserType == 1) &&
                                                        <Text style={styles.TimeText}>{!CallingView ? User.Customer_neme : 'Me '}</Text>
                                                    }
                                                </View>
                                                <React.Fragment key={remoteUid}>
                                                    <RtcSurfaceView
                                                        canvas={{ uid: remoteUid }}
                                                        style={[styles.videoView1, { top: 26 }]}
                                                    />
                                                </React.Fragment>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                }
                            </>}
                    </>
                ) : (
                    <VideoCallPopup onRestore={handleRestore} />
                )}


                {(VideoPaused && CallingView) &&
                    <View
                        style={[styles.videoView, { position: 'absolute', backgroundColor: "white" }]}
                    >
                        {/* 
                        <View
                            style={[styles.videoView1, { top: 5, right: 10, height: mobileH * 40 / 100, }]}
                        >
                            <View
                                style={{ backgroundColor: '#000000' }}
                            >
                                {(global.UserType == 0) &&
                                    <Text style={styles.TimeText}>{!CallingView ? User.worker_name : 'Me '}</Text>
                                }
                                {(global.UserType == 1) &&
                                    <Text style={styles.TimeText}>{!CallingView ? User.Customer_neme : 'Me '}</Text>
                                }
                            </View>
                            <React.Fragment key={0}>
                                <RtcSurfaceView
                                    canvas={{ uid: 0 }}
                                    style={[styles.videoView1, { top: 26 }]}
                                />
                            </React.Fragment>
                        </View> */}
                        {isVideo ?
                            <View
                                style={[styles.videoView1, {
                                    width: mobileW * 30 / 100, height: mobileH * 25 / 100,
                                    right: mobileW * 3 / 100,
                                    top: mobileW * 3 / 100,
                                    backgroundColor: '#000000',
                                    alignItems: 'center',

                                    justifyContent: 'center'
                                }]}
                            >
                                <Image
                                    resizeMode='cover'
                                    style={{ width: mobileW * 25 / 100, height: mobileW * 25 / 100, borderRadius: mobileW * 12.5 / 100 }}
                                    source={ProfileImage != null ? { uri: appBaseUrl.imageUrl + ProfileImage } : localimag.person_icon}

                                />
                                <Text
                                    style={[styles.TimeText, { fontSize: mobileW * 4.5 / 100, marginTop: mobileW * 0.5 / 100 }]}
                                >{DisplayName}</Text>
                            </View>
                            :
                            <View
                                style={[styles.videoView1, { top: 5, right: 10, height: mobileH * 40 / 100, }]}
                            >
                                <View
                                    style={{ backgroundColor: '#000000' }}
                                >
                                    {(global.UserType == 0) &&
                                        <Text style={styles.TimeText}>{!CallingView ? User.worker_name : Lang_chg.YouTxt[config.language]}</Text>
                                    }
                                    {(global.UserType == 1) &&
                                        <Text style={styles.TimeText}>{!CallingView ? User.Customer_neme : Lang_chg.YouTxt[config.language]}</Text>
                                    }
                                </View>
                                <React.Fragment key={0}>
                                    <RtcSurfaceView
                                        canvas={{ uid: 0 }}
                                        style={[styles.videoView1, { top: 26 }]}
                                    />
                                </React.Fragment>
                            </View>
                        }

                        <View
                            style={{
                                height: mobileH,
                                width: mobileW, alignItems: "center", justifyContent: 'center'
                            }}
                        >
                            <Image
                                resizeMode='cover'
                                style={{ width: mobileW * 30 / 100, height: mobileW * 30 / 100, borderRadius: mobileW * 15 / 100 }}
                                source={(global.UserType == 1) ?
                                    (User.customer_image != null ? { uri: appBaseUrl.imageUrl + User.customer_image } : localimag.person_icon)
                                    :
                                    (User.worker_image != null ? { uri: appBaseUrl.imageUrl + User.worker_image } : localimag.person_icon)
                                }
                            />
                            <Text
                                style={[styles.TimeText, {
                                    fontSize: mobileW * 4.5 / 100,
                                    color: Colors.blackColor,
                                    marginTop: mobileW * 0.5 / 100
                                }]}
                            >{(global.UserType == 1) ?
                                User.Customer_neme
                                :
                                User.worker_name}</Text>
                            <Text
                                style={[styles.TimeText, {
                                    fontSize: mobileW * 4.5 / 100,
                                    color: Colors.blackColor,
                                    marginTop: mobileW * 0.5 / 100
                                }]}
                            >{Lang_chg.VideoPause[config.language]}</Text>
                        </View>
                    </View>}
                {(VideoPaused && !CallingView) &&
                    <View
                        style={[styles.videoView, { position: 'absolute', backgroundColor: "#00000010" }]}
                    >
                        <View
                            style={[styles.videoView1, { top: mobileH * 1 / 100, width: mobileW * 35 / 100, right: mobileW * 2.5 / 100, height: mobileH * 30 / 100, backgroundColor: Colors.blackColor, alignItems: 'center' }]}
                        >
                            <View
                                style={{
                                    width: mobileW * 30 / 100, height: mobileH * 28 / 100,
                                    alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Image
                                    resizeMode='cover'
                                    style={{ width: mobileW * 25 / 100, height: mobileW * 25 / 100, borderRadius: mobileW * 12.5 / 100 }}
                                    source={(global.UserType == 1) ?
                                        (User.customer_image != null ? { uri: appBaseUrl.imageUrl + User.customer_image } : localimag.person_icon)
                                        :
                                        (User.worker_image != null ? { uri: appBaseUrl.imageUrl + User.worker_image } : localimag.person_icon)
                                    }

                                />
                                <Text
                                    style={[styles.TimeText, { fontSize: mobileW * 4.5 / 100, marginTop: mobileW * 0.5 / 100 }]}
                                >{(global.UserType == 1) ?
                                    User.Customer_neme
                                    :
                                    User.worker_name}</Text>
                            </View>
                        </View>


                    </View>
                }

                {/* --------- StarRating View End ------------- */}
                {ShowChat &&
                    <View style={{ position: 'absolute', bottom: 0, width: mobileW, height: mobileH }}>
                        <KeyboardAvoidingView
                            style={[styles.messageList, { height: mobileH * 92 / 100 }]}
                            // style={[styles.messageList, { marginBottom: inputHeight + hp('12%') }]}
                            behavior={Platform.OS === 'android' ? null : 'padding'}
                        // keyboardVerticalOffset={Platform.OS === 'android' ? 0 : inputHeight + hp('7%')}>
                        >
                            <View
                                style={{ height: mobileH * 62 / 100, top: mobileH * 30.5 / 100 }}
                            >
                                <FlatList
                                    style={{ width: mobileW, paddingHorizontal: mobileW * 3 / 100, flex: 1 }}
                                    inverted
                                    data={allMessages}
                                    keyExtractor={(_, index) => index.toString()}
                                    renderItem={({ item, index }) => (
                                        <View style={{}}>
                                            <View style={{
                                                marginVertical: 5, maxWidth: Dimensions.get('window').width / 2 + 10,
                                                alignSelf: currentUid === item.sendBy ? 'flex-end' : 'flex-start'
                                            }}>
                                                <View style={currentUid === item.sendBy ?
                                                    {
                                                        backgroundColor: global.UserType == 0 ? '#92B8FD' : '#FF87A4', borderTopLeftRadius: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 20
                                                    }
                                                    :
                                                    {
                                                        backgroundColor: global.UserType == 1 ? '#92B8FD' : '#FF87A4',
                                                        borderTopRightRadius: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 20
                                                    }
                                                }>
                                                    {item.isGift ?
                                                        <Text
                                                            style={{ padding: 10, fontSize: 16, fontWeight: 'bold' }}>
                                                            {currentUid === item.sendBy ? ('Send ' + item.msg) : (' Receive ' + item.msg)}
                                                            {"  "}

                                                            <Image
                                                                resizeMode='contain'
                                                                style={{
                                                                    height: mobileW * 5 / 100,
                                                                    width: mobileW * 5 / 100,
                                                                }}
                                                                source={{ uri: appBaseUrl.imageUrl + item.image }}
                                                            />
                                                            <Text
                                                                style={{ fontSize: 0.5 }}>{getMessageDay(item.date)}</Text>
                                                            <Text
                                                                style={{ fontSize: 12 }}>{item.time}</Text>

                                                        </Text>
                                                        :
                                                        <Text
                                                            style={{ padding: 10, fontSize: 16, fontWeight: 'bold' }}>
                                                            {item.msg}
                                                            {"  "}
                                                            {
                                                                item.isGift &&
                                                                <Image
                                                                    resizeMode='contain'
                                                                    style={{
                                                                        height: mobileW * 5 / 100,
                                                                        width: mobileW * 5 / 100,
                                                                    }}
                                                                    source={{ uri: item.image }}
                                                                />
                                                            }
                                                            {"   "}
                                                            <Text
                                                                style={{ fontSize: 0.5 }}>{getMessageDay(item.date)}</Text>
                                                            <Text
                                                                style={{ fontSize: 12 }}>{item.time}</Text>

                                                        </Text>
                                                    }

                                                </View>
                                            </View>
                                        </View>
                                    )}
                                />
                            </View>
                        </KeyboardAvoidingView>
                        <View
                            style={{ position: 'absolute', bottom: 0, width: mobileW }}
                        >
                            <View
                                onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    width: mobileW * 93 / 100,
                                    paddingHorizontal: mobileW * 2 / 100,
                                    borderRadius: mobileW * 6 / 100,
                                    elevation: 2,
                                    height: mobileW * 12 / 100,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    shadowOffset: { width: 0, },
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    bottom: mobileW * 3 / 100,
                                    backgroundColor: Colors.whiteColor,
                                    alignSelf: 'center'
                                }}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setprevimessageCount(allMessages.length)
                                        console.log('allMessages.length', allMessages.length);
                                        setmessageCount(0)
                                        setShowChat(false)
                                    }}
                                >
                                    <Image
                                        resizeMode='contain'
                                        style={{
                                            height: mobileW * 9 / 100,
                                            width: mobileW * 9 / 100,
                                            marginLeft: mobileW * 1 / 100
                                        }}
                                        source={localimag.message2}
                                    />
                                </TouchableOpacity>
                                <TextInput
                                    maxLength={1000}
                                    // multiline={true}
                                    // numberOfLines={6}
                                    value={Firebasemessage}
                                    placeholder={Lang_chg.TypeHere[config.language]}
                                    placeholderTextColor={global.UserType == 0 ? Colors.blueColour : Colors.Pink}
                                    onChangeText={(text) => setFirebasemessage(text)}
                                    style={{
                                        width: mobileW * 65 / 100, fontFamily: Font.FontMedium,
                                        fontSize: mobileW * 3.6 / 100, marginLeft: mobileW * 3 / 100, color: Colors.blackColor
                                    }}></TextInput>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => sendMessagesss()}
                                >
                                    <Image
                                        resizeMode='contain'
                                        style={{
                                            height: mobileW * 6 / 100,
                                            width: mobileW * 6 / 100,
                                            marginLeft: mobileW * 2 / 100,
                                            tintColor: global.UserType == 0 ? Colors.blueColour : Colors.Pink
                                        }}
                                        source={localimag.send} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>}
                {/* ===================== end box commet ======================== */}
                <View
                    style={{
                        position: "absolute", left: 20, top: 10, backgroundColor: '#00000030',
                        paddingHorizontal: mobileW * 4 / 100, borderRadius: mobileW * 4 / 100,
                        flexDirection: "row", justifyContent: "space-around", alignItems: "center",
                        paddingVertical: mobileH * 0.5 / 100
                    }}
                >
                    <Image
                        resizeMode='contain'
                        style={{ width: mobileW * 2.3 / 100, height: mobileW * 2.3 / 100, bottom: 1 }}
                        source={localimag.RedDot}

                    />
                    <Text style={styles.TimeText}>  {formatTimeFromAgora(callDuration)}</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => switchCamera()}
                    style={{
                        position: "absolute", left: 20, top: mobileH * 13 / 100, backgroundColor: '#00000030',
                        paddingHorizontal: mobileW * 2 / 100, borderRadius: mobileW * 4 / 100,
                        flexDirection: "row", justifyContent: "space-around", alignItems: "center",
                        paddingVertical: mobileH * 0.5 / 100
                    }}
                >
                    <Image resizeMode='contain' style={{
                        height: mobileW * 8 / 100, width: mobileW * 8 / 100,
                        tintColor: 'white'
                    }}
                        source={localimag.Camera_flip} />
                </TouchableOpacity>
                {/* --------- To show Usert Name ---------------------- */}
                <View
                    style={{
                        position: "absolute", left: mobileW * 40 / 100, top: 10, backgroundColor: '#00000030',
                        paddingHorizontal: mobileW * 4 / 100, borderRadius: mobileW * 4 / 100,
                        flexDirection: "row", justifyContent: "space-around", alignItems: "center",
                        paddingVertical: mobileH * 0.5 / 100
                    }}
                >
                    {(User.userRole == global.UserType) ?
                        <Text style={styles.TimeText}>{CallingView ? User.Customer_neme : Lang_chg.YouTxt[config.language]}</Text>
                        :
                        <Text style={styles.TimeText}>{CallingView ? User.worker_name : Lang_chg.YouTxt[config.language]}</Text>
                    }
                </View>
                {/* ------------- Timer of User -------------- */}
                {global.UserType == 0 &&
                    <View
                        style={{
                            position: "absolute", left: 20, top: 50, backgroundColor: '#00000030',
                            paddingHorizontal: mobileW * 4 / 100, borderRadius: mobileW * 4 / 100,
                            flexDirection: "row", justifyContent: "space-around", alignItems: "center",
                            paddingVertical: mobileH * 1 / 100
                        }}
                    >
                        <Image
                            resizeMode='contain'
                            style={{ width: mobileW * 6 / 100, height: mobileW * 6 / 100, bottom: 1 }}
                            source={localimag.dollar}

                        />
                        <Text style={styles.TimeText}> {CustomerCoins}</Text>
                        {/* <Text style={styles.TimeText}> {TotalDeductedCoins}</Text> */}
                    </View>
                }
                {/* ------------- Timer of Worker -------------- */}
                {global.UserType == 1 &&
                    <View
                        style={{
                            position: "absolute", left: 20, top: 50, backgroundColor: '#00000030',
                            paddingHorizontal: mobileW * 4 / 100, borderRadius: mobileW * 4 / 100,
                            flexDirection: "row", justifyContent: "space-around", alignItems: "center",
                            paddingVertical: mobileH * 1 / 100
                        }}
                    >
                        <Image
                            resizeMode='contain'
                            style={{ width: mobileW * 6 / 100, height: mobileW * 6 / 100, bottom: 1 }}
                            source={localimag.dollar}

                        />
                        <Text style={styles.TimeText}> + {WorkerCoins}</Text>
                        {/* <Text style={styles.TimeText}> + {TotalEarnedCoins}</Text> */}
                    </View>
                }
                {/* ----------- Chatting View Start ------------ */}
                {ShowChat == false &&
                    <View style={{ position: 'absolute', bottom: 0, width: mobileW }}>
                        <HideWithKeyboard>
                            <View>
                                <Image
                                    resizeMode='cover'
                                    style={{
                                        width: mobileW * 100 / 100, position: 'absolute',
                                        height: mobileW * 30 / 100, bottom: 0
                                    }}
                                    source={global.UserType == 1 ? localimag.vectorrrG : localimag.vectorr2}
                                />
                                <View style={{
                                    width: mobileW, height: mobileH * 16 / 100,
                                    position: 'absolute', bottom: 0, flexDirection: 'row',
                                    justifyContent: 'space-around', alignItems: 'center',
                                    left: mobileW * 3 / 100
                                }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setmessageCount(0)
                                            setprevimessageCount(allMessages.length)
                                            console.log('allMessages.length', allMessages.length);
                                            setShowChat(true)
                                            setmodalVisible(false)
                                            setmodalVisibleForWorker(false)
                                        }}
                                    >
                                        {messageCount > 0 &&
                                            <ImageBackground
                                                resizeMode='contain'
                                                style={{ width: mobileW * 4 / 100, height: mobileW * 4 / 100, position: 'absolute', left: mobileW * 5 / 100, top: mobileH * -1 / 100, alignItems: "center", justifyContent: 'center' }}
                                                imageStyle={{ width: mobileW * 4 / 100, height: mobileW * 4 / 100, tintColor: Colors.blueColour }}
                                                source={localimag.RedDot}
                                            >
                                                <Text
                                                    style={{ fontSize: messageCount > 99 ? mobileW * 1.5 / 100 : mobileW * 2.1 / 100, fontFamily: Font.FontSemiBold, color: Colors.whiteColor }}>{messageCount > 99 ? '99+' : messageCount}</Text>
                                            </ImageBackground>
                                        }

                                        <Image
                                            resizeMode='contain'
                                            style={{ width: mobileW * 6 / 100, height: mobileW * 6 / 100, }}
                                            source={localimag.chat}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { leave(false) }}
                                        activeOpacity={0.8}>
                                        <Image
                                            resizeMode='contain'
                                            style={{
                                                width: mobileW * 7 / 100, height: mobileW * 7 / 100,
                                                marginRight: mobileW * 5 / 100
                                            }}
                                            source={localimag.phonee2}
                                        />
                                    </TouchableOpacity>
                                    <Image
                                        resizeMode='contain'
                                        style={{ width: mobileW * 13 / 100, height: mobileW * 13 / 100, }}

                                    />
                                    <TouchableOpacity onPress={() => isMute()}
                                    >
                                        <View style={{
                                            width: mobileW * 13 / 100, height: mobileW * 13 / 100, left: mobileW * 1 / 100,
                                            alignItems: "center", justifyContent: "center"
                                        }}>

                                            <Image
                                                resizeMode='contain'
                                                style={{
                                                    width: isMutes ? mobileW * 7 / 100 : mobileW * 7 / 100,
                                                    height: isMutes ? mobileW * 7 / 100 : mobileW * 7 / 100,
                                                }}
                                                source={isMutes ? localimag.micPause : localimag.miccall}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => isVideos()}>
                                        <View style={{
                                            width: mobileW * 13 / 100, height: mobileW * 13 / 100,
                                            alignItems: "center", justifyContent: "center"
                                        }}>
                                            <Image
                                                resizeMode='contain'
                                                style={{
                                                    width: isVideo ? mobileW * 7 / 100 : mobileW * 7 / 100,
                                                    height: isVideo ? mobileW * 7 / 100 : mobileW * 7 / 100,
                                                }}
                                                source={isVideo ? localimag.VideoPause : localimag.videocallingg2}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                {global.UserType == 0 &&
                                    <TouchableOpacity onPress={() => setmodalVisible(!modalVisible)}
                                        activeOpacity={0.8}
                                        style={{ bottom: 60, position: 'absolute', alignSelf: 'center' }}>
                                        <Image
                                            resizeMode='contain'
                                            style={{ width: mobileW * 25 / 100, height: mobileW * 25 / 100 }}
                                            source={localimag.giftbox2}
                                        />
                                    </TouchableOpacity>
                                }

                                {global.UserType == 1 &&
                                    <TouchableOpacity onPress={() => setmodalVisibleForWorker(!modalVisibleForWorker)}
                                        activeOpacity={0.8}
                                        style={{ bottom: 60, position: 'absolute', alignSelf: 'center' }}>
                                        <Image
                                            resizeMode='contain'
                                            style={{ width: mobileW * 25 / 100, height: mobileW * 25 / 100 }}
                                            source={localimag.giftbox2}
                                        />
                                    </TouchableOpacity>
                                }
                            </View>
                        </HideWithKeyboard>
                    </View>
                }
                {/* ----------- Chatting View End ------------ */}
                {/* -----------------Gift Animation Start -------------- */}
                {selected &&
                    <View style={{
                        position: "absolute", alignItems: 'center',
                        justifyContent: 'center', backgroundColor: '#00000010',
                        height: mobileH * 100 / 100, width: mobileW * 100 / 100
                    }}>
                        <Animated.View style={[{ transform: [{ scale: selectedAnim }] }]}>
                            <TouchableOpacity
                                style={styles.circle}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={{ width: mobileW * 15 / 100, height: mobileW * 12 / 100 }}
                                    source={{ uri: appBaseUrl.imageUrl + JsonGiftData.gift_image }}
                                />
                                <Text style={{
                                    fontSize: mobileW * 5 / 100,
                                    color: Colors.blackColor
                                }}>{JsonGiftData.name}</Text>
                                <Text style={{
                                    fontSize: mobileW * 5 / 100,
                                    color: Colors.blackColor
                                }}>{JsonGiftData.coin}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                }
                {/* --------------------------------------------------- */}
                {WorkerGiftPopup &&
                    <View style={{
                        position: "absolute", alignItems: 'center',
                        justifyContent: 'center', backgroundColor: '#00000010',
                        height: mobileH * 100 / 100, width: mobileW * 100 / 100
                    }}>
                        <Animated.View style={[{ transform: [{ scale: selectedAnimForWorker }] }]}>
                            <TouchableOpacity
                                style={styles.circle}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={{ width: mobileW * 15 / 100, height: mobileW * 12 / 100 }}
                                    source={{ uri: appBaseUrl.imageUrl + JsonGiftDataForWoker.gift_image }}
                                />
                                <Text style={{
                                    fontSize: mobileW * 5 / 100,
                                    color: Colors.blackColor
                                }}>{JsonGiftDataForWoker.gift_name}</Text>
                                <Text style={{
                                    fontSize: mobileW * 5 / 100,
                                    color: Colors.blackColor
                                }}>{JsonGiftDataForWoker.gift_coin}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                }
                {/* -----------------Gift Animation End -------------- */}
                {/* --------- Gift View Start ------------- */}
                {modalVisible &&
                    <View style={{
                        position: 'absolute',
                        bottom: mobileH * 24 / 100,
                        alignSelf: 'center'
                    }}>
                        <View style={{
                            width: mobileW * 94 / 100,
                            height: mobileW * 18 / 100,
                            borderRadius: mobileW * 10 / 100,
                            backgroundColor: '#00000030',
                            alignSelf: 'center', flexDirection: 'row',
                            justifyContent: 'space-around', alignItems: 'center',
                            paddingHorizontal: mobileW * 3 / 100,
                        }}>
                            <FlatList
                                data={GiftList}
                                showsHorizontalScrollIndicator={false}
                                horizontal={true}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={{
                                            left: mobileW * 2 / 100,
                                            alignItems: 'center',
                                            justifyContent: "center"
                                        }}
                                        onPress={() => {
                                            ToSendGift(item)
                                        }}
                                    >
                                        <Image
                                            resizeMode='contain'
                                            style={{ width: mobileW * 15 / 100, height: mobileW * 12 / 100 }}
                                            source={{ uri: appBaseUrl.imageUrl + item.gift_image }}
                                        />
                                        <View style={{ flexDirection: "row" }}>
                                            <Image
                                                resizeMode='contain'
                                                style={{ width: mobileW * 3 / 100, height: mobileW * 3 / 100 }}
                                                source={localimag.dollar}
                                            />
                                            <Text
                                                style={{
                                                    color: Colors.whiteColor,
                                                    fontFamily: Font.FontSemiBold,
                                                    fontSize: mobileW * 2 / 100
                                                }}
                                            >  {item.coin}</Text>
                                        </View>
                                    </TouchableOpacity>
                                } />
                        </View>
                        <View style={[styles.triangle, { top: mobileH * 8.9 / 100 }]}></View>
                    </View>
                }
                {/* --------- Gift View End ------------- */}
                {/* --------- Gift View Start ------------- */}
                {modalVisibleForWorker &&
                    <View style={{
                        position: 'absolute',
                        bottom: mobileH * 24 / 100,
                        alignSelf: 'center'
                    }}>
                        <View style={{
                            width: mobileW * 94 / 100,
                            height: mobileW * 18 / 100,
                            borderRadius: mobileW * 10 / 100,
                            backgroundColor: '#00000030',
                            alignSelf: 'center', flexDirection: 'row',
                            justifyContent: 'space-around', alignItems: 'center',
                            paddingHorizontal: mobileW * 3 / 100,
                        }}>
                            {AllGifts != [] ?
                                <FlatList
                                    data={AllGifts}
                                    showsHorizontalScrollIndicator={false}
                                    horizontal={true}
                                    renderItem={({ item, index }) =>
                                        <View
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: "center"
                                            }}
                                        >
                                            <Image
                                                resizeMode='contain'
                                                style={{ width: mobileW * 15 / 100, height: mobileW * 12 / 100 }}
                                                source={{ uri: appBaseUrl.imageUrl + item.gift_image }}
                                            />
                                            <View style={{ flexDirection: "row" }}>
                                                <Image
                                                    resizeMode='contain'
                                                    style={{ width: mobileW * 3 / 100, height: mobileW * 3 / 100 }}
                                                    source={localimag.dollar}
                                                />
                                                <Text
                                                    style={{
                                                        color: Colors.whiteColor,
                                                        fontFamily: Font.FontSemiBold,
                                                        fontSize: mobileW * 2 / 100
                                                    }}
                                                >  {item.gift_coin}</Text>
                                            </View>
                                        </View>
                                    } />
                                :
                                <View>

                                </View>
                            }
                        </View>
                        <View style={[styles.triangle, { top: mobileH * 8.9 / 100 }]}></View>
                    </View>
                }
                {/* --------- Gift View End ------------- */}
                {/* </ImageBackground> */}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    imageBackStyle: {
        alignItems: 'center',
        height: mobileH, width: mobileW
        // justifyContent: 'space-evenly'
    },


    background2: {
        alignItems: 'center',
        height: mobileH, width: mobileW
        // justifyContent: 'space-evenly'
    },


    triangle: {
        width: mobileW * 7 / 100,
        alignSelf: 'center',
        height: mobileW * 10 / 100,
        transform: [{ rotate: '180deg' }],
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: mobileW * 4.5 / 100,
        borderRightWidth: mobileW * 4.5 / 100,
        borderBottomWidth: mobileW * 8 / 100,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#00000030",
        position: 'absolute',
        bottom: -29

    },
    userCommentName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 6 / 100,
        marginTop: mobileH * 1.5 / 100,
        alignSelf: 'center',
    },
    TimeText: {
        color: Colors.whiteColor,
        fontFamily: Font.FontRegular,
        textAlign: 'center',
        fontSize: mobileW * 4.1 / 100,
        //   marginTop: mobileH * 2 / 100
    },
    textInputStyle11: {
        width: mobileW * 70 / 100,
        height: mobileH * 20 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 3.5 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray,
        // height: mobileH * 30 / 100,
        // backgroundColor:'red'
    },
    userCommentName1: {
        fontFamily: Font.FontRegular,
        color: Colors.darkGray,
        fontSize: mobileW * 4 / 100,
        alignSelf: 'center',
    },
    textAlignextInputBaseView1: {
        width: mobileW * 74 / 100,
        height: mobileH * 20 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileW * 5.5 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2.7 / 100,
        marginLeft: mobileW * 1 / 100
    },



    button: {
        paddingHorizontal: 25,
        paddingVertical: 4,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0055cc',
        margin: 5,
    },
    main: { flex: 1, alignItems: 'center' },
    scroll: { flex: 1, backgroundColor: '#ddeeff', width: '100%' },
    scrollContainer: { alignItems: 'center' },

    videoView: { width: mobileW, height: mobileH },

    videoView2: {
        width: mobileW * 30 / 100, height: mobileH * 25 / 100,
        position: "absolute", top: 10, right: 10,
    },

    videoView1: {
        width: mobileW * 30 / 100, height: mobileH * 25 / 100, position: 'absolute',
        right: 0, top: 0
    },

    btnContainer: { flexDirection: 'row', justifyContent: 'center' },
    head: { fontSize: 20 },
    info: { backgroundColor: '#ffffe0', color: '#0000ff' },

    circle: {
        height: mobileH * 18 / 100,
        width: mobileW * 25 / 100,
        borderRadius: mobileW * 5 / 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000020'
    }
})





