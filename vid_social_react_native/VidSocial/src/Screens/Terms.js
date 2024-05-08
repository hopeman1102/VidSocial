import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, Linking } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import HTMLView from 'react-native-htmlview'

export default function Terms({ navigation, route }) {

    const pageName = route.params.pageName
    const [TermsData, setTermsData] = useState(null);

    console.log(pageName);

    useEffect(() => {
        GetTermsData()
    }, [])

    const GetTermsData = async () => {

        global.props.showLoader();

        let apiUrl = appBaseUrl.PrivacyPolicy;

        if (pageName === 'Privacy Policy') {
            apiUrl = appBaseUrl.PrivacyPolicy;
        } else {
            apiUrl = appBaseUrl.TermsCondition;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a GET request using Axios
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                global.props.hideLoader();
                // Handle the successful response
                console.log("FAQ--->22244444444444444", response);
                if (response.data != null) {
                    setTermsData(response.data)
                } else {
                    global.props.hideLoader();
                    alert('Something went wrong!')
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('PrivacyPolicy---', error);
            });
    }

    return (
        <View style={styles.container}>
            <Header
                navigation={navigation}
                title={pageName}
                backIcon={true}
                firstImage={localimag.back_icon}
            ></Header>
            {/* ----  ---- */}
            <ScrollView
                contentContainerStyle={{ paddingBottom: mobileH * 5 / 100 }}
            >
                <View
                    style={{
                        borderRadius: 20,
                        width: "88%",
                        alignSelf: "center",
                        top: mobileH * 3 / 100,
                    }}>
                    {TermsData != null &&
                        <HTMLView
                            value={TermsData}
                            stylesheet={styles12}
                        />
                    }
                </View>

            </ScrollView>
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
})

const styles12 = StyleSheet.create({
    textfont: {
        fontSize: 13,
        fontWeight: '300',
        color: Colors.blackColor,
        fontStyle: 'normal',
    },
    p: {
        fontWeight: '300',
        color: Colors.blackColor,
        fontStyle: 'normal',
    },

})

