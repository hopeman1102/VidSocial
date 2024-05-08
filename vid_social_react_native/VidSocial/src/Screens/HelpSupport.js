import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Header from '../Components/Header';
import { useFocusEffect } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
export default function BankDetails({ navigation }) {

    const [Content, setContent] = useState('');

    const _ReportApiCalling = async () => {

         //email============================
         if (Content.length <= 0) {
            msgProvider.toast(Lang_chg.emptyDescription[config.language], 'bottom')
            return false
        }

        var Token = await localStorage.getItemString("AccessToken")
       
        global.props.showLoader();

        let apiUrl = appBaseUrl.HelpSupport;

        var postData = JSON.stringify({
            message:Content
        });
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
        };

        console.log(postData,'-----------------',apiUrl);

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("LoginResponse--->222", response);
                if (response.data.code == 201) {
                    msgProvider.toast(response.data.message, 'bottom')
                    setTimeout(() => {
                        global.props.hideLoader();
                        navigation.goBack()
                    }, 2000);
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
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            
                    <Header
                        backIcon={true}
                        firstImage={localimag.back_icon}
                        title={Lang_chg.HelpSupports[config.language]}
                        navigation={navigation}
                    ></Header>
            </KeyboardAwareScrollView>

            <View style={styles.textAlignextInputBaseView1}>
                            <TextInput
                                maxLength={1000}
                                keyboardType='email-address'
                                textAlignVertical='top'
                                multiline={true}
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.Enterdescription[config.language]}
                                onChangeText={(txt) => { setContent(txt) }}
                                style={styles.textInputStyle11}>
                            </TextInput>
                        </View>

                        <View style={{ marginTop: mobileH * 5 / 100,alignSelf:'center',}}>
                    {/* <CommonButton onPressClick={() =>navigation.navigate('Setting')} title='Submit'></CommonButton> */}
                    <CommonButton onPressClick={() => _ReportApiCalling()} title={Lang_chg.Submit[config.language]}></CommonButton>
                </View>

                      
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
       
    },
   
    mainContainer: {
        backgroundColor: Colors.appBackground,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        height: mobileH * 67 / 100,
        width: mobileW * 85 / 100,
        alignItems: "center",
        alignSelf: "center",
        borderRadius: mobileW * 5 / 100,
        marginTop: mobileH * 10 / 100
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
        width: mobileW * 90 / 100,
        height: mobileH * 30 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileW * 3.5 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2 / 100,
        marginTop:mobileH*3/100,

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
        marginRight: mobileW * 15 / 100,
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

