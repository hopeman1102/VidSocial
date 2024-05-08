import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, RefreshControl, BackHandler } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { ApiConstants, Colors, Font, config, localStorage, mobileH, mobileW, } from '../Provider/utilslib/Utils';
import { useFocusEffect } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import { Lang_chg } from '../Provider/Language_provider';

export default function Faourite({ navigation, route }) {

    const checkoutUrl = route.params.checkoutUrl

    console.log('checkoutUrl--------------------------------->>>>>', checkoutUrl);

    const [OpenUrl, setOpenUrl] = useState(checkoutUrl)

    useFocusEffect(
        React.useCallback(() => {
        }, [])
    );

    const _onNavigationStateChange = (webViewState) => {
        console.log('======>>>.', webViewState.url)
        // var UrlToGet = webViewState.url.split('/').pop().split('?')[0]
        var UrlToGet = webViewState.url.split('/')[5]
        console.log('UrlToGet---->>', UrlToGet);
        console.log(UrlToGet);
        if ('payment_cancel_url' == UrlToGet) {
            setTimeout(() => {
                navigation.navigate('Wallet_c')
            }, 1000);
        }
        else if ('payment_success_url' == UrlToGet) {
            setTimeout(() => {
                navigation.navigate('Wallet_c')
            }, 1000);
        }
    }

    const handleNavigationStateChange = (navState) => {
        // Check the URL in navState to determine success or failure
        const currentUrl = navState.url;
        // Example: Check if the URL contains a success or failure indicator
        if (currentUrl.includes('success')) {
            // Handle successful payment
            console.log('Payment successful!');
        } else if (currentUrl.includes('failure')) {
            // Handle failed payment
            console.log('Payment failed.');
        }
    }

    return (
        <View style={styles.container}>
            <Header
                backIcon={false}
                navigation={navigation}
                title={Lang_chg.Payment[config.language]}
                firstImage={localimag.app_Logo}  ></Header>
            <WebView
                source={{ uri: checkoutUrl }}
                // ref={(webView) => { webView.ref = webView; }}
                // onNavigationStateChange={handleNavigationStateChange}
                onNavigationStateChange={_onNavigationStateChange}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground
    },
    girlOnlineBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 2 / 100
    },
    girlOnlinetxt: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor
    },
    filterIcon: {
        width: mobileW * 5.5 / 100,
        height: mobileW * 5.5 / 100,
        tintColor: Colors.Pink,
        right: mobileW * 1 / 100
    },
    Onlineiconimg: {
        width: mobileW * 2.5 / 100,
        height: mobileW * 2.5 / 100
    },
    FlatlistBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 3 / 100,
    },
    UserImage: {
        width: mobileW * 13 / 100,
        height: mobileW * 13 / 100,
        right: mobileW * 1 / 100,
        borderRadius: mobileW * 6.5 / 100,
        left: mobileW * 0.3 / 100
    },
    onlineonuserImage: {
        width: mobileW * 2.6 / 100,
        height: mobileW * 2.6 / 100,
        left: mobileW * 10.5 / 100,
        top: mobileH * 0.4 / 100
    },
    flagImage: {
        width: mobileW * 5 / 100,
        height: mobileW * 5 / 100,
        borderRadius: mobileW * 2.5 / 100,
        borderWidth: mobileW * 0.15 / 100,
        borderColor: Colors.darkGray
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
        width: mobileW * 5.5 / 100,
        height: mobileW * 5.5 / 100,
        tintColor: Colors.Pink,
        right: mobileW * 1 / 100
    },
    searchBaseView: {
        width: mobileW * 88 / 100,
        alignSelf: "center",
        borderRadius: mobileW * 7 / 100,
        alignItems: "center",
        justifyContent: "center",
        padding: mobileW * .2 / 100,
        height: mobileW * 11 / 100,
        backgroundColor: Colors.whiteColor,
        marginTop: mobileW * 2.5 / 100,
        flexDirection: "row",
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        marginBottom: mobileH * 2 / 100,
    }
})

