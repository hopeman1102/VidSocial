import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import CommonButton from '../Components/CommonButton'
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import SmallButton from '../Components/SmallButton'
import { Lang_chg } from '../Provider/Language_provider'
import { config } from '../Provider/configProvider'
import { Colors, Font } from '../Provider/Colorsfont'
import { localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils'
import { ScrollView } from 'react-native-gesture-handler'
import { appBaseUrl } from './Apicallingprovider/ApiConstants'
import axios from 'axios'

global.UserType = 'NA';

export default function Splash({ navigation }) {
    global.props.hideLoader();

    useEffect(() => {
        authenticationSession()

    }, [])

    // --------- To check AutoLogin Status ----------------
    const authenticationSession = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        if (UserData != null) {
            var UserToken = await localStorage.getItemString("AccessToken")
            ToRefreshToken(UserToken)
            console.log('----======>>>', UserToken);
        } else {
            setTimeout(() => {
                navigation.replace('Login')
            }, 2000);
        }
        return false

    };

    // ---------------- To refresh Token ----------------------
    const ToRefreshToken = async (UserToken) => {
        let apiUrl = appBaseUrl.RefreshToken;
        var postData = JSON.stringify({
            refresh_token: UserToken,
        });
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly'
        };
        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("Token Response Data--->222", response.data);
                if (response.data.code == 200) {
                    var UserData = response
                    _loginApiCalling(UserData)
                } else {
                    setTimeout(() => {
                        navigation.replace('Login')
                    }, 2000);
                }
            })
            .catch(error => {
                // Handle errors
                global.props.hideLoader();
                navigation.replace('Login')
                console.log('Loginerror---22', error);
            });
    }

    // ---------------- To save Login data and navigate to screen -----------
    const _loginApiCalling = async (response) => {
        // Handle the successful response
        console.log("LoginResponse--->222", response);
        if (response.data.code == 200) {
            global.props.hideLoader();
            await localStorage.setItemObject("UserData", response.data.data)
            await localStorage.setItemString("AccessToken", response.data.access)
            var UserLoginAccess = response.data.data.is_mail_verified
            var UserType = response.data.data.role_id
            var UserGender = response.data.data.gender
            var SignupStep = response.data.data.signup_step
            var language = response.data.data.language
            console.log('user Language -------->>>', language);
            // "language": "es",
            //  To set User Language ==============
            if (language == 'en') {
                config.language = 0
            } else {
                config.language = 1
            }

            console.log("LoginResponse--->222", response.data.data);
            // --- if User type ==  User so it can be navigate to Home Customer 
            if (UserType == 'user') {
                if (UserLoginAccess == true) {
                    // --- if User Gender ==  male so it can be navigate to Home Customer 
                    if (UserGender == 'male') {
                        global.UserType = 0;
                        setTimeout(() => {
                            navigation.navigate('Home_c')
                        }, 500);
                    } else {
                        global.UserType = 1;
                        setTimeout(() => {
                            navigation.navigate('Home_c')
                        }, 500);
                    }
                } else {
                    global.props.hideLoader();
                    navigation.replace('Login')
                    // setTimeout(() => {
                    //     alert('Your accont is not verified, Please verify first')
                    // }, 500);
                }
            } else {
                console.log('hello i am here');
                // Page Navigation According to SignUp Steps Worker Side ----
                // if (SignupStep == 1) {
                //     global.UserType = 1;
                //     setTimeout(() => {
                //         navigation.navigate('TakePicture')
                //     }, 1000);
                // } else if (SignupStep == 2) {
                //     setTimeout(() => {
                //         navigation.navigate('VideoRecording')
                //     }, 1000);
                if (SignupStep == 3) {
                    global.UserType = 1;
                    if (UserLoginAccess == true) {
                        setTimeout(() => {
                            navigation.navigate('Home')
                        }, 800);
                    } else {
                        global.props.hideLoader();
                        navigation.replace('Login')
                    }
                }
                else {
                    global.props.hideLoader();
                    navigation.replace('Login')
                }
            }
        } else {
            global.props.hideLoader();
            alert(response.data.error)
            navigation.replace('Login')
        }
    }


    return (
        <View style={styles.container}>
            <Image
                resizeMode='contain'
                style={{ width: mobileW * 26 / 100, height: mobileW * 26 / 100, marginTop: mobileH * 6 / 100 }}
                source={localimag.app_Logo}
            />

            <Text
                style={{
                    fontFamily: Font.FontSemiBold,
                    fontSize: mobileW * 6.5 / 100,
                    color: Colors.blackColor,
                    marginTop: mobileH * 1 / 100
                }}>VID SOCIAL</Text>


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    LogoImage: {
        height: mobileW * 45 / 100,
        width: mobileW * 72 / 100,
        marginTop: mobileH * 20 / 100
    },
});


