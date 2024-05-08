import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, ScrollView, RefreshControl, BackHandler, Alert, AppState } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Colors, Font, Lang_chg, config, localStorage, mediaprovider, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import moment from 'moment';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { UserLoginPermission } from './UserLoginPermission';
import zone from 'moment-timezone';
import io from 'socket.io-client';
import SocketData from './SocketData';
import CommonAlert from '../Components/CommonAlert';
import { CheckUserStatus } from '../Components/ApiCallForLogot';

export default function Home({ navigation }) {
    const [CountryPickerModal, setCountryPickerModal] = useState(false)
    const [countryCode, setCountryCode] = useState('IN');
    const [CountryID, setCountryID] = useState(null)
    const [country, setCountry] = useState(null);
    const [CountryDetails, setCountryDetails] = useState('')
    const datas = []
    const [data, setdata] = useState(datas)
    const [refresh, setrefresh] = useState(false)
    const [FlagUrl, setFlagUrl] = useState('')
    const [AlertModal, setAlertModal] = useState(false)
    const [AlertMessage, setAlertMessage] = useState('')
    const [timeZone, setTimeZone] = useState("")
    const [totalSeconds, setTotalSeconds] = useState(0);

    const [convertedDays, setConvertedDays] = useState(0);
    const [remainingHours, setRemainingHours] = useState(0);
    const [remainingMinutes, setRemainingMinutes] = useState(0);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const isFocused = useIsFocused();
    const appState = useRef(AppState.currentState);
    const [TotalMinutes, setTotalMinutes] = useState(0);
    useEffect(() => {
        var appStateChangeListener = null;
        if (isFocused) {
            setFlagUrl(''),
                setCountryID(null),
                TogetHomeData1()
            // if (props._isInternetConnected) {
            // updateUserInfo();
            // dispatch(setChatUser(user));
            appStateChangeListener = AppState.addEventListener("change", nextAppState => {
                if (appState.current.match(/inactive|background/) && nextAppState === "active") {
                    // dispatch(setChatUser(user));
                    // sendReadStatus();
                    // loadMessages(2);
                    // updateUserInfo();
                }
                appState.current = nextAppState;
            });
            // } 
        } else {
            appStateChangeListener && appStateChangeListener.remove();
        }
        return () => {
            appStateChangeListener && appStateChangeListener.remove();
        };
    }, [isFocused]);

    useEffect(() => {
        if (AlertModal) {
            convertSecondsToTime(totalSeconds)
            var intervalId = setInterval(() => {
                // Decrement the total seconds every second
                // console.error('total seconds decreased:',totalSeconds);
                setTotalSeconds((prevTotalSeconds) => prevTotalSeconds - 1);
            }, 1000);
        }
        // Clear the interval when the component is unmounted
        return () => intervalId && clearInterval(intervalId);

    }, [AlertModal, totalSeconds]);

    const convertSecondsToTime = (seconds) => {
        setTotalSeconds(seconds)

        // const convertedDays = Math.floor(seconds / (3600));
        // const remainingHours = Math.floor((seconds % (3600)) / 60);
        // const remainingMinutes = Math.floor((seconds % 3600) / 60);
        // const remainingSeconds = seconds % 60;
        const remainingHours = Math.floor(seconds / 3600);
        const remainingMinutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        // setConvertedDays(convertedDays);
        setRemainingHours(remainingHours);
        setRemainingMinutes(remainingMinutes);
        setRemainingSeconds(remainingSeconds);
    };
    const handleChildData = (data) => {
        console.log('datadata===============>>>', data);
        // Update dataArray with data from the child component
        if (data.message) {
            TogetHomeData1(false)
            setrefresh(false)
        }
    };

    useEffect(() => {
        const currentTimeZone = zone.tz.guess();
        setTimeZone(currentTimeZone)
    }, []);

    useEffect(() => {
        toGetAllCountry()
    }, [])

    useEffect(() => {
        TogetHomeData1()
    }, [CountryID]);

    // ---------- To manage Back Action ------------
    useFocusEffect(
        React.useCallback(() => {
            UserLoginPermission({ navigation })
            TogetHomeData1()
            const handleBackPress = () => {
                backAction()
                // Handle the back button press on this screen
                return true; // Return true to prevent default behavior (e.g., navigate back)
            };

            BackHandler.addEventListener('hardwareBackPress', handleBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
            };
        }, [])
    );

    const backAction = () => {
        Alert.alert(
            Lang_chg.Holdon[config.language],
            Lang_chg.AreyousureyouwanttoExit[config.language], [{
                text: Lang_chg.No[config.language],
                style: 'Yes',
            }, {
                text: Lang_chg.Yes1[config.language],
                onPress: () => BackHandler.exitApp()
            }], {
            cancelable: false
        }
        ); // works best when the goBack is async
        return true;
    }

    const onRefresh = async () => {
        setFlagUrl('');
        setrefresh(true);
        setCountryID(null);
    };

    useEffect(() => {
        TogetHomeData1();
    }, [refresh]);

    const TogetHomeData1 = async () => {

        var Token = await localStorage.getItemString("AccessToken")
        if (CountryID == null) {
            var apiUrl = appBaseUrl.HomeDataCustomer

        } else {
            global.props.showLoader();
            var apiUrl = appBaseUrl.HomeDataCustomer + '?search=' + CountryID

        }
        var headers = {
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        }
        axios.get(apiUrl, { headers })
            .then(async (response) => {

                if (response.data.code == 200) {
                    setdata(response.data.data)
                    setrefresh(false)
                    global.props.hideLoader();
                } else {
                    global.props.hideLoader();
                    // setCountryID(null)
                    setdata('NA')
                    setrefresh(false)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                // alert(error);
                onRefresh()
                console.log('Loginerror---', error);
            });
    }

    const toSelectCountry = (item) => {
        setCountryCode(item.dial_code)
        setCountryID(item.name)
        setFlagUrl(item.flag_url)
        setCountryPickerModal(false)
        // for (let i = 0; i < CountryDetails.length; i++) {
        //     if (CountryDetails[i].id == item.id) {
        //         console.log('======>>>', item);
        //         setCountryCode(item.dial_code)
        //         setCountryID(item.name)
        //         setFlagUrl(item.flag_url)
        //     }
        // }
    }

    const toGetAllCountry = async () => {
        // await localStorage.setItemString("call_status", NO_CALL.toString())

        global.props.showLoader();
        let apiUrl = appBaseUrl.CountryList;
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
        };

        axios.get(apiUrl, { headers })
            .then(async (response) => {
                // console.log("signUpResponse--->", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setCountryDetails(response.data.data)
                } else {
                    global.props.hideLoader();
                    Alert.alert("Sign Up", response.data.message);
                }
            })
            .catch(error => {
                global.props.hideLoader();
                alert(error);
                console.log('Loginerror---', error);
            });
    }

    // const ApiCallingForDataReset = () => {
    //     TogetHomeData1()
    //     setCountryPickerModal(false)
    // }

    // ------------- Call initiate ----------------
    const CallInitate = async (item) => {

        if (item.status != 'online') {
            msgProvider.toast(Lang_chg.UserOffline[config.language], 'bottom')
            return false
        }

        global.props.showLoader();
        var Token = await localStorage.getItemString("AccessToken")

        // global.props.showLoader();
        let apiUrl = appBaseUrl.WorkerWarning;

        var postData = JSON.stringify({
            receiver_id: item.id
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
                console.log('i am here in warning section==========> ', response.data);

                if (response.data.code == 200) {
                    global.props.hideLoader();
                    navigation.navigate('OutgoingCallScreen', { item: item })
                } else {
                    const integerResult = Number(response.data.remaining_time);
                    setAlertModal(true)
                    setAlertMessage(response.data.message)
                    // const initialTotalSeconds = Math.floor(integerResult / 60);
                    convertSecondsToTime(integerResult)
                    setTotalMinutes(initialTotalSeconds);
                    global.props.hideLoader();
                    // alert(response.data.error)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                // console.log('Loginerror---22', error);
                // Handle errors
            });
    }

    return (
        <View style={styles.container}>
            <SocketData onChildData={handleChildData} />

            {/* ----------- Commom alert modal ------------- */}
            <Modal
                animationType='fade'
                transparent={true}
                visible={AlertModal}
                onRequestClose={() => {
                    setAlertModal(!AlertModal)
                }}>

                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.girlHeadercolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadViewForWithdraw}>
                            <View
                                style={styles.ModalHeaderView}
                            >

                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 5 / 100,
                                        fontFamily: Font.FontSemiBold
                                    }]}
                                >{Lang_chg.Alert[config.language]}</Text>

                            </View>
                            <View style={{
                                width: '80%', height: mobileH * 12 / 100,
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 4 / 100,
                                        fontFamily: Font.FontRegular,
                                        textAlign: 'center'
                                    }]}
                                >{AlertMessage}</Text>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3.5 / 100,
                                        fontFamily: Font.FontRegular,
                                        textAlign: 'center'
                                    }]}
                                >{Lang_chg.Remaining_Time[config.language]} <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 4 / 100,
                                        fontFamily: Font.FontSemiBold,
                                        textAlign: 'center',
                                        color: Colors.blackColor
                                    }]}
                                >{`${remainingHours}:${remainingMinutes}:${remainingSeconds.toFixed(0)}`}</Text></Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => { setAlertModal(!AlertModal) }}
                                activeOpacity={0.6}
                                style={styles.OkButton}
                            >
                                <LinearGradient
                                    colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                    style={styles.OkButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </Modal>

            <Header
                backIcon={false}
                navigation={navigation}
                title={Lang_chg.Home[config.language]}
                firstImage={localimag.app_Logo}  ></Header>

            {/* ---- CountryPicker Modal ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={CountryPickerModal}
                onRequestClose={() => { setCountryPickerModal(!CountryPickerModal) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.themecolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.CountryPickerModalheadView}>

                            {/* -------------------------------------- */}
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                justifyContent: 'space-between', width: mobileW * 78 / 100
                            }}>
                                <Image
                                    resizeMode='contain'
                                    style={{ width: mobileH * 3 / 100, height: mobileH * 3 / 100 }}
                                />
                                <Text style={{
                                    textAlign: 'center', fontSize: mobileW * 4.5 / 100,
                                    fontFamily: Font.FontSemiBold, color: Colors.blackColor
                                }}>{Lang_chg.PleaseSelectCountry[config.language]}</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setCountryPickerModal(false)
                                    }}>
                                    <Image
                                        resizeMode='contain'
                                        style={{ width: mobileH * 2.5 / 100, height: mobileH * 2.5 / 100 }}
                                        source={localimag.crossb}
                                    />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={CountryDetails}
                                contentContainerStyle={{ paddingBottom: mobileH * 10 / 100 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity
                                        onPress={() => toSelectCountry(item)}
                                        activeOpacity={0.8}
                                        style={{
                                            width: mobileW * 70 / 100, top: mobileH * 2.5 / 100,
                                            justifyContent: "space-around"
                                        }}>

                                        <View style={{
                                            width: mobileW * 70 / 100, height: mobileH * 7 / 100,
                                            borderBottomColor: Colors.appBackground,
                                            borderBottomWidth: mobileW * 0.5 / 100, justifyContent: 'center'
                                        }}>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <Image
                                                    resizeMode='contain'
                                                    style={{ width: mobileH * 4 / 100, height: mobileH * 4 / 100 }}
                                                    source={{ uri: item.flag_url }}
                                                />
                                                <Text style={{
                                                    fontSize: mobileW * 2.8 / 100,
                                                    fontFamily: Font.FontSemiBold, color: Colors.blackColor
                                                }}>     {item.name}</Text>

                                                {CountryID == item.name ?
                                                    <Image
                                                        resizeMode='contain'
                                                        style={{
                                                            position: "absolute", right: 5, width: mobileH * 3 / 100,
                                                            height: mobileH * 3 / 100
                                                        }}
                                                        source={localimag.Tick}
                                                    /> : null
                                                }
                                            </View>


                                        </View>

                                    </TouchableOpacity>} />
                            {/* -------------------------------------- */}
                            {/* <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={styles.OkButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        ApiCallingForDataReset()
                                    }
                                    }
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                                </TouchableOpacity>
                            </LinearGradient> */}
                        </View>
                    </View>
                </View>
            </Modal>

            <View>
                <View
                    style={styles.girlOnlineBaseView}>
                    <View style={{ flexDirection: "row", alignItems: "center", width: mobileW * 53 / 100 }}>
                        <Image
                            resizeMode='contain'
                            style={styles.Onlineiconimg}
                            source={localimag.Online_icon}
                        />
                        <Text style={styles.girlOnlinetxt}>   {Lang_chg.UsersOnline[config.language]}</Text>
                    </View>
                    {FlagUrl != '' &&
                        <View style={{ flexDirection: "row", width: mobileW * 20 / 100, justifyContent: 'space-around', alignItems: "center" }}>
                            <Image
                                resizeMode='contain'
                                style={styles.Flagmagestyle}
                                source={{ uri: FlagUrl }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setFlagUrl(''),
                                        setCountryID(null),
                                        TogetHomeData1()
                                }}
                                activeOpacity={0.8}>
                                <Image
                                    resizeMode='contain'
                                    style={styles.CrossIcon}
                                    source={localimag.crossb}
                                />
                            </TouchableOpacity>
                        </View>
                    }
                    <TouchableOpacity onPress={() => setCountryPickerModal(true)}
                        activeOpacity={0.8}>
                        <Image
                            resizeMode='contain'
                            style={styles.filterIcon}
                            source={localimag.icon_filter}
                        />
                    </TouchableOpacity>
                </View>
                {/* ----  ---- */}
                <ScrollView
                    contentContainerStyle={{ paddingBottom: mobileH * 8 / 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={onRefresh}
                            tintColor={Colors.Pink}
                            colors={[Colors.Pink]}
                        />
                    }>
                    {data != "NA" ?
                        <View>
                            <FlatList
                                data={data}
                                contentContainerStyle={{ paddingBottom: mobileH * 20 / 100 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => navigation.navigate('UserProfile',
                                            { User_id: item.id, FlagUrl: item.country_flag_url })}
                                    >
                                        <View
                                            style={[styles.FlatlistBaseView, {
                                                marginTop: mobileH * 2 / 100,
                                                width: mobileW * 90 / 100, alignSelf: 'center'
                                            }]}>

                                            <ImageBackground
                                                resizeMode='contain'
                                                style={styles.UserImage}
                                                imageStyle={[styles.UserImage, {
                                                    borderWidth: mobileH * 0.15 / 100,
                                                    borderColor: global.UserType == 0 ? Colors.blueColour : Colors.Pink
                                                }]}
                                                source={item.image_url_link != null ?
                                                    { uri: appBaseUrl.imageUrl + item.image_url_link } : localimag.person_icon}
                                            // source={localimag.girl1}
                                            >{item.status == 'online' &&
                                                <Image
                                                    resizeMode='contain'
                                                    style={styles.onlineonuserImage}
                                                    source={localimag.Online_icon}
                                                />}
                                            </ImageBackground>


                                            <View style={{ width: mobileW * 59 / 100, left: mobileW * 0.5 / 100 }}>
                                                <View style={{
                                                    flexDirection: "row", alignItems: "center",
                                                    marginTop: mobileH * 0.3 / 100
                                                }}>
                                                    <Text style={styles.userName}>{item.display_name}</Text>
                                                </View>
                                                <Text style={styles.dateTimeTxt}>{item.online_date != null && moment(item.online_date).clone().tz(timeZone).format('MMM DD, hh:mm A')}</Text>
                                            </View>
                                            <View
                                                // style={{backgroundColor:'#ebf1fe',width:mobileW*7/100,height:mobileW*7/100,borderRadius:mobileW*1.2/100}}
                                                style={{
                                                    backgroundColor: '#ffe8ee', width: mobileW * 7.5 / 100,
                                                    alignItems: 'center', justifyContent: 'center',
                                                    height: mobileW * 7.5 / 100, borderRadius: mobileW * 1.2 / 100
                                                }}
                                            >
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                // onPress={()=>}
                                                >
                                                    <Image
                                                        resizeMode='cover'
                                                        style={styles.flagImagees}
                                                        source={{ uri: item.country_flag_url }}
                                                    // source={localimag.flagonimage}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            {/* <TouchableOpacity activeOpacity={0.8}
                                                onPress={() => CallInitate(item)}>
                                                <Image
                                                    resizeMode='contain'
                                                    style={styles.cameraIcon}
                                                    source={global.UserType == 0 ? localimag.BlueVideoCall : localimag.VideoCallicon}
                                                />
                                            </TouchableOpacity> */}
                                        </View>
                                    </TouchableOpacity>
                                } />

                        </View>

                        :
                        <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: mobileH * 100 / 100, }}>
                            <Image resizeMode='contain' style={{ width: mobileW * 80 / 100, height: mobileH * 20 / 100, marginBottom: mobileW * 40 / 100 }}
                                source={localimag.nodata}
                            >
                            </Image>

                        </View>
                    }
                </ScrollView>
            </View>

            <Footer
                activepage='Home'
                usertype={1}
                footerpage={[
                    { name: 'Home', pageName: Lang_chg.Home[config.language], countshow: false, image: require('../Icons/Home_icon.png'), activeimage: require('../Icons/Home_icon.png') },

                    { name: 'Search', pageName: Lang_chg.Search[config.language], countshow: false, image: require('../Icons/search_icon.png'), activeimage: require('../Icons/search_icon.png') },

                    { name: 'TopGirls', pageName: Lang_chg.TopGirls[config.language], countshow: false, image: require('../Icons/activeStar.png'), activeimage: require('../Icons/deactivae_star.png') },

                    { name: 'Wallet', pageName: Lang_chg.Wallet[config.language], countshow: false, image: require('../Icons/Wallet_icon.png'), activeimage: require('../Icons/Wallet_icon.png') },

                    { name: 'Profile', pageName: Lang_chg.profile[config.language], countshow: false, image: require('../Icons/profile_icon.png'), activeimage: require('../Icons/profile_icon.png') },
                ]}
                navigation={navigation}
                imagestyle1={{ width: 25, height: 25, backgroundColor: '#fff', countcolor: 'white', countbackground: 'black' }}
                count_inbox={0}
            />

            {/* activeStar */}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground
    },
    Callsin: {
        color: Colors.blackColor
    },
    girlOnlineBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 2 / 100
    },
    ModalMainView: {
        backgroundColor: "#00000080",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20
    },
    girlOnlinetxt: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor
    },
    onlineonuserImage: {
        width: mobileW * 2.6 / 100,
        height: mobileW * 2.6 / 100,
        left: mobileW * 10.5 / 100,
        top: mobileH * 0.4 / 100
    },
    flagImage: {
        width: mobileW * 4.3 / 100,
        height: mobileW * 4.3 / 100
    },
    flagImagees: {
        width: mobileW * 3.5 / 100,
        height: mobileW * 3.5 / 100,
        borderRadius: mobileW * 1.5 / 100,
        // borderWidth: mobileW * 0.15 / 100,
        // borderColor: Colors.darkGray
    },
    filterIcon: {
        width: mobileW * 5.5 / 100,
        height: mobileW * 5.5 / 100,
        tintColor: Colors.Pink,
        right: mobileW * 1 / 100
    },
    CrossIcon: {
        width: mobileW * 4.5 / 100,
        height: mobileW * 4.5 / 100,
        right: mobileW * 1 / 100
    },
    Flagmagestyle: {
        width: mobileW * 8 / 100,
        height: mobileW * 6 / 100,
        right: mobileW * 1 / 100
    },
    Onlineiconimg: {
        width: mobileW * 2.5 / 100,
        height: mobileW * 2.5 / 100,
    },
    FlatlistBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 2.8 / 100,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 3 / 100,
        borderRadius: mobileW * 2.5 / 100,
        backgroundColor: Colors.whiteColor
    },
    UserImage: {
        width: mobileW * 13 / 100,
        height: mobileW * 13 / 100,
        right: mobileW * 1 / 100,
        borderRadius: mobileW * 6.5 / 100,
        left: mobileW * 0.3 / 100,
    },
    onlineonuserImage: {
        width: mobileW * 2.6 / 100,
        height: mobileW * 2.6 / 100,
        left: mobileW * 10.5 / 100,
        top: mobileH * 0.4 / 100
    },
    flagImage: {
        width: mobileW * 4.6 / 100,
        height: mobileW * 4.6 / 100
    },
    userName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 3.8 / 100
    },
    dateTimeTxt: {
        fontFamily: Font.FontMedium,
        color: Colors.grayColour,
        fontSize: mobileW * 2.8 / 100
    },
    cameraIcon: {
        width: mobileW * 7.8 / 100,
        height: mobileW * 7.8 / 100
    },

    CountryPickerModalheadView: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: 20,
        width: "95%",
        paddingVertical: 20,
        height: mobileH * 90 / 100,
        alignItems: 'center',
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        backgroundColor: Colors.blueColour,
        marginTop: mobileH * 5 / 100
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
    ModalheadViewForWithdraw: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: mobileW * 6 / 100,
        width: "100%",
        paddingVertical: mobileH * 2 / 100,
        alignItems: 'center'
    },
    ModalHeaderView: {
        width: '100%', height: mobileH * 7 / 100,
        borderBottomWidth: mobileW * 0.3 / 100,
        borderBottomColor: Colors.grayColour,
        alignItems: "center",
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        justifyContent: 'center'
    },
    textAlignextInputBaseView: {
        height: mobileW * 11 / 100,
        width: mobileW * 72 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileW * 3.5 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2 / 100
    },
    textInputStyle: {
        width: mobileW * 67 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 2.8 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray,
    },
    AmountValue: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 4 / 100,
        // marginTop:mobileH*1/100
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        alignItems: "center"
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
})

