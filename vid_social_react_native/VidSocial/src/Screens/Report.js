import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Cameragallery, Colors, Font, Lang_chg, config, localStorage, mediaprovider, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Header from '../Components/Header';
import { useFocusEffect } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';

import axios from 'axios';
export default function BankDetails({ navigation }) {

    const [Subject, setSubject] = useState('');
    const [Content, setContent] = useState('');
    const [mediamodal, setmediamodal] = useState(false)
    const [imagefile, setimagefile] = useState('NA')
    const [SponserData, setSponserData] = useState({})
    const [sponsor_id, setsponsor_id] = useState(0)

    useFocusEffect(
        React.useCallback(() => {
            GetSponsorDetails()

        }, [])
    );
    // ---------- To get Sponsor
    const GetSponsorDetails = async () => {
        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);

        global.props.showLoader();
        let apiUrl = appBaseUrl.ToGetSponsorId;

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios 
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                if (response.data.code == 200) {
                    console.log(' Sponsor ID data is here -----', response.data.data);
                    global.props.hideLoader();
                    console.log(response.data);
                    setsponsor_id(response.data.data.sponser_id)
                    GetSponserData(response.data.data.sponser_id)
                } else {
                    global.props.hideLoader();
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---22', error);
                // Handle errors
            });
    }

    // ------------ Api call For Sponsor Profile Data ----------------
    const GetSponserData = async (sponser_id) => {
        var result = await localStorage.getItemObject("UserData")
        var Token = await localStorage.getItemString("AccessToken")
        if (sponser_id == null) {
            sponser_id = 0
        } else {
            sponser_id = sponser_id
        }
        global.props.showLoader();
        let apiUrl = appBaseUrl.SponsorAssociateDetails + sponser_id;
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };
        console.log('---------------', sponser_id, apiUrl);
        // Make a POST request using Axios
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("LoginResponse--->222", response);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setSponserData(response.data.data)
                } else {
                    global.props.hideLoader();
                    alert(response.data.error)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---22', error);
                // Handle errors
            });
    }

    //-----------------------------function to access images from camera 
    const Camerapopen = async () => {
        mediaprovider.launchCamera(true).then((res) => {
            console.log('camerares', res)
            setmediamodal(false)
            setimagefile(res.path)
        }).catch((error) => {
            setmediamodal(false)
            // consolepro.consolelog(' camera error ', error);
            if (config.device_type == 'ios') {
                if (error == 'Error: Cannot access images. Please allow access if you want to be able to select images.') {
                    // consolepro.consolelog('i am here ')
                    setTimeout(() => {
                        open_settings();
                    }, 1000);
                }
            }
            else {
                if (error == 'Error: Required permission missing') {
                    open_settings();
                }
            }
        })
    }

    //-----------------------------function to access images from gallery 
    const Galleryopen = () => {
        mediaprovider.launchGellery(true).then((res) => {
            console.log('camerares', res)
            setmediamodal(false)
            setimagefile(res.path)
            ImageToBase64()
        }).catch((error) => {
            setmediamodal(false)
            // consolepro.consolelog('gallery error', error);
            if (config.device_type == 'ios') {
                if (error == 'Error: Cannot access images. Please allow access if you want to be able to select images.') {
                    // consolepro.consolelog('i am here ')
                    setTimeout(() => {
                        open_settings();
                    }, 1000);
                }
            }
            else {
                if (error == 'Error: Required permission missing') {
                    open_settings();
                }
            }
        })
    }


    const _ReportApiCalling = async () => {

        //email============================
        if (Subject.length <= 0) {
            msgProvider.toast(Lang_chg.emptySubject[config.language], 'bottom')
            return false
        }
        if (Subject.length > 50) {
            msgProvider.toast(Lang_chg.subjectTooLong[config.language], 'bottom')
            return false
        }

        //email============================
        if (Content.length <= 0) {
            msgProvider.toast(Lang_chg.emptyDescription[config.language], 'bottom')
            return false
        }

        if (Content.length < 3) {
            msgProvider.toast(Lang_chg.emptyDescription[config.language], 'bottom')
            return false
        }

        var Token = await localStorage.getItemString("AccessToken")
        var UserDataToGet = await localStorage.getItemObject("UserData")
        var UserId = UserDataToGet.id
        global.props.showLoader();

        let apiUrl = appBaseUrl.ReportByWorker;

        var data = new FormData();
        data.append('user_id', sponsor_id);
        data.append('subject_line', Subject);
        data.append('content', Content);
        if (imagefile != 'NA') {
            data.append('file', {
                uri: imagefile,
                type: 'image/jpg', // or photo.type
                name: 'image.jpg'
            });
        }

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
        };

        console.log(data, '-----------------', apiUrl);
        

        // Make a POST request using Axios
        axios.post(apiUrl, data, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("LoginResponse--->222", response);
                if (response.data.code == 201) {
                    var message = response.data.message
                    global.props.hideLoader();
                    msgProvider.toast(message, 'bottom')
                    setTimeout(() => {
                        navigation.goBack()
                    }, 500);
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---23', error);
                // Handle errors
            });
    }

    return (
        <View style={styles.container}>

            <Cameragallery mediamodal={mediamodal} Camerapopen={() => { Camerapopen() }}
                Galleryopen={() => { Galleryopen() }} Canclemedia={() => { setmediamodal(false) }}
            />

            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground style={styles.imageBackStyle}
                    imageStyle={styles.imageBackStyle}
                    source={localimag.AppBackGirl}>
                    <Header
                        backIcon={true}
                        firstImage={localimag.back_icon}
                        title={Lang_chg.Report[config.language]}
                        navigation={navigation}
                    ></Header>
                    {/* ---- Main Container ---- */}
                    <View style={styles.mainContainer}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '17%' }}>
                            <View style={{ marginTop: mobileH * 4 / 100 }}>
                                <CommonButton title={Lang_chg.YourSponsoris[config.language]}></CommonButton>
                            </View>
                            <Text style={{
                                fontSize: mobileW * 5 / 100, marginTop: mobileH * 1 / 100,
                                fontFamily: Font.FontSemiBold, color: Colors.Pink,
                            }}>{SponserData.sponsor_name}</Text>
                        </View>
                        {/* --- TextInput Email --- */}
                        <View style={styles.textAlignextInputBaseView}>
                            <TextInput
                                // value={"" + this.state.email + ""}
                                maxLength={100}
                                keyboardType='email-address'
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.EnterSubject[config.language]}
                                onChangeText={(txt) => { setSubject(txt) }}
                                style={styles.textInputStyle}>
                            </TextInput>
                        </View>
                        <View style={styles.textAlignextInputBaseView1}>
                            <TextInput
                                // value={"" + this.state.email + ""}
                                maxLength={1000}
                                keyboardType='email-address'
                                textAlignVertical='top'
                                multiline={true}
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.Enterdescription2[config.language]}
                                onChangeText={(txt) => { setContent(txt) }}
                                style={styles.textInputStyle11}>
                            </TextInput>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => { setmediamodal(true) }}
                            style={{
                                backgroundColor: Colors.whiteColor, width: mobileW * 70 / 100, height: mobileH * 5 / 100,
                                marginTop: mobileH * 2 / 100, alignItems: 'center', borderRadius: mobileW * 2 / 100,
                                flexDirection: 'row', justifyContent: "center"
                            }}
                        >
                            {imagefile != 'NA' &&
                                <Image
                                    resizeMode='contain'
                                    style={styles.TickImage}
                                    source={localimag.Tick}
                                />
                            }
                            <Text style={{
                                fontSize: mobileW * 3.5 / 100,
                                fontFamily: Font.FontSemiBold, color: Colors.Pink,
                            }}>{imagefile == 'NA' ? Lang_chg.Attachfile[config.language] : Lang_chg.Attachedfile[config.language]}</Text>
                        </TouchableOpacity>

                        {/* --- Login Button --- */}
                        <View style={{ marginTop: mobileH * 2 / 100 }}>
                            <CommonButton onPressClick={() => _ReportApiCalling()} title={Lang_chg.Submit[config.language]}></CommonButton>
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
    TickImage: {
        width: mobileW * 6.5 / 100,
        height: mobileW * 6.5 / 100,
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
    }
})

