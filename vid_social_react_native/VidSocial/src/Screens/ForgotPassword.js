import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal } from 'react-native'
import React, { useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { RadioButton } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';

export default function ForgotPassword({ navigation }) {

    const [email, setemail] = React.useState('');
    
    const ForgotPassCall = async () => {

        //email============================
        if (email.length <= 0) {
            msgProvider.toast(Lang_chg.emptyEmail[config.language], 'bottom')
            return false
        }
        if (email.length > 50) {
            msgProvider.toast(Lang_chg.emailMaxLength[config.language], 'bottom')
            return false
        }
        var reg = config.emailvalidation;
        if (reg.test(email) !== true) {
            msgProvider.toast(Lang_chg.validEmail[config.language], 'bottom')
            return false
        }
        _loginApiCalling()

    }


    const clearData = () => {
        setemail("")
        setpassword("")
    }

    const _loginApiCalling = async () => {

        var Language = 'en'
        if(config.language==0){
            Language = 'en'
        }else{
            Language = 'es'
        }

        global.props.showLoader();
        let apiUrl = appBaseUrl.ForgetPassword;

        var postData = JSON.stringify({
            email: email,
            language: Language
        });
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly'
        };

        console.log('----------',postData);

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("LoginResponse--->222", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    alert(response.data.message)
                   setTimeout(() => {
                    navigation.navigate('Login')
                   }, 500);
                }else if(response.data.code == 400){
                    global.props.hideLoader();
                    alert(Lang_chg.ValidEmailadd[config.language])
                }else{
                    global.props.hideLoader();
                    alert(response.data.message)
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
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground style={styles.imageBackStyle}
                    imageStyle={{ height: mobileH, width: mobileW }}
                    source={localimag.Background}>
                    <View style={{
                        width: mobileW, height: mobileH * 8 / 100, alignItems: 'center', justifyContent: 'space-between',
                        paddingHorizontal: mobileW * 7 / 100, flexDirection: 'row'
                    }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Image
                                resizeMode='contain'
                                style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100 }}
                                source={localimag.back_icon}
                            />
                        </TouchableOpacity>
                        <Text style={{
                            width: mobileW * 65 / 100, fontSize: mobileW * 4 / 100,
                            fontFamily: Font.FontSemiBold, color: Colors.whiteColor,
                            textAlign: "center"
                        }}>{Lang_chg.forgotPass[config.language]}</Text>
                        <Image
                            resizeMode='contain'
                            style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100 }}
                        />
                    </View>
                    <Image
                        resizeMode='contain'
                        style={{
                            width: mobileW * 16 / 100, height: mobileW * 16 / 100, marginTop: mobileH * 5 / 100,
                            tintColor: Colors.whiteColor
                        }}
                        source={localimag.user_pass}
                    />

                    {/* ---- Main Container ---- */}
                    <View style={styles.mainContainer}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '30%' }}>
                            <Text style={{
                                width: mobileW * 65 / 100, fontSize: mobileW * 4.5 / 100,
                                fontFamily: Font.FontBold, color: Colors.blueColour,
                                textAlign: "center", marginTop: mobileH * 3 / 100
                            }}>{Lang_chg.Trouble1[config.language]}</Text>
                            <Text style={{
                                width: mobileW * 65 / 100, fontSize: mobileW * 3.1 / 100,
                                fontFamily: Font.FontMedium, color: Colors.darkGray,
                                textAlign: "center", marginTop: mobileH * 1 / 100
                            }}>{Lang_chg.resetPasslongtxt[config.language]}</Text>
                        </View>
                        {/* --- TextInput Email --- */}
                        <View style={styles.textAlignextInputBaseView}>
                            <Image
                                resizeMode='contain'
                                style={styles.inputImageStyle}
                                source={localimag.user_email}
                            />
                            <TextInput
                                // value={"" + this.state.email + ""}
                                maxLength={100}
                                keyboardType='email-address'
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.email1[config.language]}
                                onChangeText={(txt) => {setemail(txt)}}
                                style={styles.textInputStyle}>
                            </TextInput>
                        </View>

                        {/* --- Login Button --- */}
                        <View style={{ marginTop: mobileH * 3 / 100 }}>
                            <CommonButton onPressClick={() => ForgotPassCall() } title={Lang_chg.RESETPASSWORD[config.language]}></CommonButton>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <Text style={styles.dontHaveAcc}
                            >{Lang_chg.Returnto[config.language]} </Text>
                            <TouchableOpacity activeOpacity={0.8}
                                onPress={() => navigation.navigate('Login')}><Text style={styles.signUptxt}> {Lang_chg.login[config.language]}</Text></TouchableOpacity>
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
        height: mobileH, width: mobileW,
        alignItems: 'center'
    },
    mainContainer: {
        backgroundColor: Colors.appBackground,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        height: mobileH * 45 / 100,
        width: mobileW * 85 / 100,
        alignItems: "center",
        borderRadius: mobileW * 5 / 100,
        marginTop: mobileH * 6 / 100
    },
    textAlignextInputBaseView: {
        height: mobileW * 11 / 100,
        width: mobileW * 72 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileH * 5 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2 / 100,
    },
    inputImageStyle: {
        width: mobileW * 4.5 / 100,
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
        // alignSelf: "center",
        // alignItems: "center",
        // justifyContent: 'space-between',
    },
    Remembertxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.grayColour,
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
        color: Colors.darkGray,
        fontSize: mobileW * 3.2 / 100,
        marginTop: mobileH * 1.5 / 100
    },
    maleFemaleTxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.grayColour,
        fontSize: mobileW * 2.6 / 100,
    },
    Modaltxt: {
        fontFamily: Font.FontRegular,
        color: Colors.darkGray,
        fontSize: mobileW * 4 / 100,
        textAlign: 'center',
        width: mobileW * 75 / 100
    },
    ModalMainView: {
        backgroundColor: "#00000080",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20
    },
    ModalheadView: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: 20,
        width: "95%",
        paddingVertical: 20,
        height: mobileH * 45 / 100,
        alignItems: 'center'
    },
    congratstxt: {
        color: Colors.blackColor,
        fontSize: mobileW * 6.5 / 100,
        fontFamily: Font.FontSemiBold,
        alignSelf: 'center',
        marginTop: mobileH * 1.5 / 100
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        backgroundColor: Colors.blueColour,
        marginTop: mobileH * 3 / 100
    },
    TakeIdView: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 10 / 100,
        width: mobileW * 40 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        backgroundColor: Colors.blueColour,
        marginTop: mobileH * 4 / 100
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.lightAccent
    }
})

