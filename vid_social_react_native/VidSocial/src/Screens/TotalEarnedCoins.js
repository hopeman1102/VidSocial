import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Cameragallery, Colors, Font, Lang_chg, config, localStorage, mediaprovider, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Header from '../Components/Header';
import { useFocusEffect } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { CALL_ENDED } from '../Provider/Notification/CallConstants';
export default function TotalEarnedCoins({ navigation, route }) {


    // const [UserName, setUserName] = useState();
    // const [profile_image, setprofile_image] = useState();
    const [TotalEarnedCoins, setTotalEarnedCoins] = useState(0);
    const [UserName, setUserName] = useState('');
    const [profile_image, setprofile_image] = useState(0);
    const [WorkerName, setWorkerName] = useState('');
    const data = route.params.data

    useEffect(() => {
        getUSerData()
        _TogetWorkerGiftList()
        msgProvider.toast(Lang_chg.Call_ended[config.language], 'bottom')
    }, [])


    useFocusEffect(
        React.useCallback(() => {
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
        return true;
    }

    // ---------------- To get All All Gift Details ------------------------------
    const _TogetWorkerGiftList = async () => {
        // global.props.showLoader();
        let apiUrl = appBaseUrl.GetWorkerGift + data.CallId;
        console.log(apiUrl);
        var headers = {
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        }
        console.log('apiUrlapiUrlapiUrl', apiUrl);
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                if (response.data.code == 200) {
                    // global.props.hideLoader();
                    // console.log('All Getted Gifts --------------', response.data.data); WorkerCallEarning
                    console.log('response.data.WorkerCallEarning------', response.data.WorkerCallEarning);
                    setTotalEarnedCoins(response.data.WorkerCallEarning)

                } else {
                    setTotalEarnedCoins(0)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                // alert(error);
                console.log(error);
            });
    }

    const getUSerData = async () => {
        await localStorage.setItemString("call_status", CALL_ENDED.toString())
        setUserName(route.params.data.Customer_neme)
        setprofile_image(route.params.data.customer_image)
        setWorkerName(route.params.data.worker_name)
        // }
    }

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground style={styles.imageBackStyle}
                    imageStyle={styles.imageBackStyle}
                    source={localimag.AppBackGirl}>
                    <View style={{
                        width: mobileW * 88 / 100, paddingVertical: mobileH * 5 / 100,
                        backgroundColor: 'white', alignSelf: 'center',
                        marginTop: mobileH * 8 / 100, borderRadius: mobileW * 8 / 100
                    }}>
                        <View
                            style={{
                                height: mobileW * 30 / 100,
                                borderRadius: mobileW * 15 / 100,
                                width: mobileW * 30 / 100,
                                alignItems: 'center',
                                alignSelf: 'center',
                                marginTop: mobileH * 6 / 100,
                                justifyContent: 'center'
                            }}
                        >
                            <Image
                                source={profile_image != null ? { uri: appBaseUrl.imageUrl + profile_image } : localimag.person_icon}
                                style={{
                                    height: mobileW * 35 / 100,
                                    borderRadius: mobileW * 17.5 / 100, width: mobileW * 35 / 100, borderWidth: mobileW * 0.3 / 100, borderColor: Colors.blueColour

                                }}></Image>
                            <Text style={[styles.Oktxt, { color: Colors.blueColour }]}>{UserName}</Text>
                        </View>
                        <View style={{ alignSelf: 'center', justifyContent: "center", width: mobileW * 80 / 100, marginTop: mobileH * 7 / 100 }}>
                            <Text style={styles.Oktxt}>{Lang_chg.Congratulations[config.language]} {'\n'} {WorkerName} {'\n'} {Lang_chg.Inthisvideocallyouobtain[config.language]} {TotalEarnedCoins} {Lang_chg.credits[config.language]}</Text>
                        </View>
                        <Image
                            source={localimag.filled_heart}
                            resizeMode='contain'
                            style={{
                                alignSelf: 'center',
                                marginTop: mobileH * 4 / 100,
                                height: mobileW * 22 / 100,
                                width: mobileW * 22 / 100,
                            }}></Image>
                        <View style={{ marginTop: mobileH * 2 / 100, alignSelf: 'center', marginLeft: mobileW * 1 / 100 }}>
                            <CommonButton onPressClick={() => navigation.navigate('Home')} title={Lang_chg.DONE[config.language]}></CommonButton>
                        </View>
                        <View style={{ marginTop: mobileH * 2 / 100, alignSelf: 'center', marginLeft: mobileW * 1 / 100 }}>
                            <CommonButton onPressClick={() => navigation.navigate('ReportWorker', { data: data })} title={Lang_chg.UserReport[config.language]}></CommonButton>

                        </View>
                    </View>
                </ImageBackground>
            </KeyboardAwareScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackStyle: {
        height: mobileH, width: mobileW
    },
    mainContainer: {
        backgroundColor: Colors.appBackground,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        height: mobileH * 72 / 100,
        width: mobileW * 85 / 100,
        alignItems: "center",
        alignSelf: "center",
        borderRadius: mobileW * 5 / 100,
        marginTop: mobileH * 6 / 100
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
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 4 / 100
    },
    textAlignextInputBaseView1: {
        width: mobileW * 72 / 100,
        height: mobileH * 30 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileW * 3.5 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2 / 100
    },
    inputImageStyle: {
        width: mobileW * 4 / 100,
        height: mobileW * 4 / 100,
        marginTop: mobileH * -0.5 / 100
    },
    textInputStyle: {
        width: mobileW * 67 / 100,
        height: mobileH * 30 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 3.5 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray,
    },
    textInputStyle11: {
        width: mobileW * 67 / 100,
        height: mobileH * 30 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 3.5 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray,
        height: mobileH * 30 / 100,
    },
    RememberForgotView: {
        height: mobileW * 12 / 100,
        width: mobileW * 73 / 100,
        alignSelf: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: 'space-between',
        marginTop: mobileH * 1 / 100
    },
    Remembertxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.darkGray,
        fontSize: mobileW * 2.6 / 100
    },
    dontHaveAcc: {
        fontFamily: Font.FontSemiBold,
        color: Colors.darkGray,
        fontSize: mobileW * 3 / 100,
        marginTop: mobileH * 2 / 100
    },
    signUptxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blueColour,
        fontSize: mobileW * 3 / 100,
        marginTop: mobileH * 2 / 100
    },
    forgotPasstxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blueColour,
        fontSize: mobileW * 2.8 / 100
    },
    Oktxt: {
        fontFamily: Font.FontSemiBold,
        fontSize: mobileW * 5.5 / 100,
        color: Colors.Pink,
        textAlign: "center",
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 4.5 / 100,
        alignSelf: 'center',
    },
})

