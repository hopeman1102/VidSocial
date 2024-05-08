import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, Linking } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Cameragallery, Colors, Font, config, localStorage, mediaprovider, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import CommonButton from '../Components/CommonButton';

export default function EditProfileWorker({ navigation }) {

    const [mediamodal, setmediamodal] = useState(false)
    const [imagefile, setimagefile] = useState('NA')
    const [FlagUrl, setFlagUrl] = useState(null)
    const [countryCode, setCountryCode] = useState('IN');
    const [first_name, setfirst_name] = useState('');
    const [last_name, setlast_name] = useState('');
    const [display_name, setdisplay_name] = useState('');
    const [phoneNumber, setphoneNumber] = useState('');
    const [email, setemail] = useState('');
    const [identity_no, setidentity_no] = useState('');
    const [IsBase64Image, setIsBase64Image] = useState(false);

    useEffect(() => {
        _setUserProfile()
    }, [])

    const _setUserProfile = async () => {
        var result = await localStorage.getItemObject("UserData")
        console.log(result);
        if (result != null) {
            setfirst_name(result.first_name);
            setlast_name(result.first_name);
            setphoneNumber(result.phone)
            setemail(result.email)
            setidentity_no(result.identity_no)
            setdisplay_name(result.display_name)
            setCountryCode(result.country_code)

            if (result.country_flag != null) {
                setFlagUrl(result.country_flag)
            }

            if (result.image_url_link != null) {
                // setimagefile(result.profile_image);  
                setimagefile(appBaseUrl.imageUrl + result.image_url_link);
                // setIsBase64Image(true)
            } else {
                setimagefile('NA')
                // setIsBase64Image(false)
            }
        }

    }


    const Camerapopen = async () => {
        mediaprovider.launchCamera(true).then((res) => {
            console.log('camerares', res)
            setmediamodal(false)
            setIsBase64Image(false)
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
            setIsBase64Image(false)
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

    // ========================api=======================================

    const _loginApiCalling = async () => {
        global.props.showLoader();
        let apiUrl = appBaseUrl.UpdateProfile;
        var Token = await localStorage.getItemString("AccessToken")
        var data = new FormData();
        data.append('first_name', first_name);
        data.append('last_name', first_name);
        data.append('display_name', display_name);
        // if (IsBase64Image == false) {
        if (imagefile == 'NA') {
            data.append('profile_image', '');
        } else {
            data.append('profile_image', {
                uri: imagefile,
                type: 'image/jpg', // or photo.type
                name: imagefile.split('/').pop(),
            });
        }

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
        };

        console.log('------->>>', data);
        // Make a POST request using Axios
        axios.post(apiUrl, data, { headers })
            .then(async (response) => {
                // Handle the successful response
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    console.log("EditProfile Data is here --->222", response.data.data);
                    await localStorage.setItemObject("UserData", response.data.data)
                    msgProvider.toast(response.data.message, 'bottom')
                    setTimeout(() => {
                        navigation.navigate('Setting')
                    }, 1000);
                } else {
                    msgProvider.toast(response.data.message, 'bottom')
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---22', error);
                // Handle errors
            });
    }
    return (
        <View style={styles.container}>
            <Header
                backIcon={true}
                navigation={navigation}
                title={Lang_chg.editProfile[config.language]}
                firstImage={localimag.back_icon}
            ></Header>

            <Cameragallery mediamodal={mediamodal} Camerapopen={() => { Camerapopen() }}
                Galleryopen={() => { Galleryopen() }} Canclemedia={() => { setmediamodal(false) }}
            />
            {/* ----  ---- */}

            <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    padding: mobileW * 2 / 100,
                    marginTop: mobileW * 2.5 / 100,
                    alignSelf: "center"
                }}>
                <TouchableOpacity
                    style={{
                        height: mobileW * 30 / 100,
                        borderRadius: mobileW * 15 / 100,
                        width: mobileW * 30 / 100,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => { setmediamodal(true) }}>
                    <Image
                        source={imagefile != 'NA' ? { uri: imagefile } : localimag.person_icon}
                        style={{
                            height: mobileW * 30 / 100,
                            borderRadius: mobileW * 15 / 100, width: mobileW * 30 / 100,
                            borderWidth: mobileW * 0.3 / 100, borderColor: Colors.Pink
                        }} />

                    <View style={{
                        height: mobileW * 6 / 100, width: mobileW * 6 / 100,
                        marginLeft: mobileW * 26 / 100, marginTop: mobileW * -11 / 100,
                        alignItems: "center", justifyContent: "center",
                        backgroundColor: Colors.Pink, borderRadius: mobileW * 10 / 100
                    }}>

                        <Image resizeMode='contain' style={{
                            height: mobileW * 4 / 100, width: mobileW * 4 / 100,
                            tintColor: 'white'
                        }}
                            source={localimag.Camera_icon} />
                    </View>

                </TouchableOpacity>
            </View>
            {/* ---- Main Container ---- */}
            <View style={styles.mainContainer}>
                {/* --- TextInput Email --- */}
                <View style={styles.textAlignextInputBaseView}>
                    <Image
                        resizeMode='contain'
                        style={styles.inputImageStyle}
                        source={localimag.user_email}
                    />
                    <TextInput
                        value={email}
                        maxLength={100}
                        editable={false}
                        keyboardType='email-address'
                        placeholderTextColor={Colors.darkGray}
                        placeholder='Email Address'
                        onChangeText={(txt) => { setemail(txt) }}
                        style={styles.textInputStyle}>
                    </TextInput>
                </View>
                {/* --- TextInput Password --- */}
                <View style={styles.textAlignextInputBaseView}>
                    <Image
                        resizeMode='contain'
                        style={styles.inputImageStyle}
                        source={localimag.icon_user}
                    />
                    <TextInput
                        value={"" + first_name + ""}
                        maxLength={100}
                        editable={false}
                        keyboardType='email-address'
                        placeholderTextColor={Colors.darkGray}
                        placeholder='Diana'
                        onChangeText={(txt) => { setfirst_name(txt) }}
                        style={styles.textInputStyle}>
                    </TextInput>
                </View>
                {/* --- TextInput Password --- */}
                <View style={styles.textAlignextInputBaseView}>
                    <Image
                        resizeMode='contain'
                        style={styles.inputImageStyle}
                        source={localimag.icon_user}
                    />
                    <TextInput
                        value={"" + display_name + ""}
                        maxLength={11}
                        editable={false}
                        keyboardType='email-address'
                        placeholderTextColor={Colors.darkGray}
                        placeholder='Diana'
                        onChangeText={(txt) => { setdisplay_name(txt) }}
                        style={styles.textInputStyle}>
                    </TextInput>
                </View>
                {/* --- TextInput Password --- */}
                <View style={styles.textAlignextInputBaseView}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        // onPress={() => setCountryPickerModal(true)}
                        style={{
                            flexDirection: 'row', alignItems: "center",
                            width: mobileW * 17 / 100, justifyContent: "space-around",
                            height: mobileH * 6 / 100,
                        }}>
                        {FlagUrl != null &&
                            <Image
                                resizeMode='contain'
                                style={styles.inputImageStyle}
                                source={{ uri: FlagUrl }}
                            />}
                        <Text style={{
                            fontFamily: Font.FontMedium,
                            fontSize: mobileW * 3 / 100,
                            color: Colors.darkGray
                        }}>+{countryCode}</Text>
                    </TouchableOpacity>
                    <TextInput
                        value={"" + phoneNumber + ""}
                        maxLength={10}
                        editable={false}
                        keyboardType='phone-pad'
                        placeholderTextColor={Colors.darkGray}
                        placeholder='9854745874'
                        onChangeText={(txt) => { setphoneNumber(txt) }}
                        style={[styles.textInputStyle, { width: mobileW * 53 / 100, left: 5, top: 0.5 }]}>
                    </TextInput>
                </View>
                {/* --- TextInput Password --- */}
                <View style={styles.textAlignextInputBaseView}>
                    <Image
                        resizeMode='contain'
                        style={styles.inputImageStyle}
                        source={localimag.Id_icon}
                    />
                    <TextInput
                        value={"" + identity_no + ""}
                        editable={false}
                        maxLength={100}
                        keyboardType='email-address'
                        placeholderTextColor={Colors.darkGray}
                        placeholder='123456'
                        onChangeText={(txt) => { setidentity_no(txt) }}
                        style={styles.textInputStyle}>
                    </TextInput>
                </View>
                {/* --- Login Button --- */}
                <View style={{ marginTop: mobileH * 10 / 100 }}>
                    <CommonButton onPressClick={() => _loginApiCalling()} title={Lang_chg.UPDATE[config.language]}></CommonButton>
                </View>

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground
    },
    UserImage: {
        width: mobileW * 80 / 100,
        height: mobileW * 40 / 100,
        marginTop: mobileH * 1.2 / 100,
        alignItems: 'center',
        justifyContent: "center",
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    onlineonuserImage: {
        width: mobileW * 6 / 100,
        height: mobileW * 6 / 100,
        tintColor: global.UserType == 0 ? Colors.blueColour : Colors.Pink
    },
    headView: {
        flexDirection: "row",
        justifyContent: 'space-between',
        width: '90%',
    },
    HeaderSettings: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 3.7 / 100,
    },
    mainContainer: {
        //  height: mobileH * 0 / 100,
        width: mobileW * 85 / 100,
        alignItems: "center",
        alignSelf: "center",
        marginTop: mobileH * 7 / 100,
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
    inputImageStyle: {
        width: mobileW * 4 / 100,
        height: mobileW * 4 / 100,
        marginTop: mobileH * -0.5 / 100
    },
    textInputStyle: {
        width: mobileW * 61 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 2.8 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray
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

