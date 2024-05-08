import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import HideWithKeyboard from 'react-native-hide-with-keyboard';
import StarRating from 'react-native-star-rating';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import moment from 'moment';
export default function UserProfile({ navigation, route }) {

    const [CustomerInformation, setCustomerInformation] = useState({})
    const [CustomerCallingData, setCustomerCallingData] = useState({})

    const User_id = route.params.User_id
    const FlagUrl = route.params.FlagUrl

    console.log('User_id----->>>', User_id);

    useFocusEffect(
        React.useCallback(() => {
            _ToGetProgileDataCalling()
            _ToGetUserCallingData()
        }, [])
    );


    const _ToGetProgileDataCalling = async () => {

        global.props.showLoader();

        let apiUrl = appBaseUrl.GetUserDetails + User_id;

        console.log('apiUrl----->>>', apiUrl);

        // Make a POST request using Axios
        axios.get(apiUrl)
            .then(async (response) => {
                // Handle the successful response
                console.log("LoginResponse--->222", response.data.data);
                if (response.data.code == 200) {
                    var UserData = response.data.data
                    global.props.hideLoader();
                    var jsonObj = {};
                    for (var i = 0; i < UserData.length; i++) {
                        jsonObj = UserData[i];
                    }
                    setCustomerInformation(jsonObj)
                    console.log('jsonObj', jsonObj);
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


    const _ToGetUserCallingData = async () => {

        global.props.showLoader();

        // console.log(new Date().toISOString().replace('T', ' '))
        var TodayDate = new Date().toISOString()
        const date = new Date(TodayDate);
        date.setMonth(date.getMonth() - 1);
        // November 10, 2021: year decreased by 1
        var BeforeOneMonthDate = date.toISOString()
        let apiUrl = appBaseUrl.CustomerDetails;

        var postData = JSON.stringify({
            worker_id: User_id,
            from_date: BeforeOneMonthDate,
            to_date: TodayDate
        });

        console.log(apiUrl, 'postDatapostData', postData);
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        console.log();

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("ProfileData --->222", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setCustomerCallingData(response.data.data)
                    console.log("ProfileData --->222", response.data.access);
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


    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: mobileH * 5 / 100 }}
                showsHorizontalScrollIndicator={false}>
                <ImageBackground
                    resizeMode={CustomerInformation.profile_image != null ? 'cover' : 'contain'}
                    style={styles.UserFullImage}
                    imageStyle={[styles.UserFullImage, {
                    }]}
                    // source={localimag.boy2}
                    source={CustomerInformation.image_url_link != null ? { uri: appBaseUrl.imageUrl + CustomerInformation.image_url_link } : localimag.person_icon}
                >
                    <View style={{ width: mobileW, height: mobileH * 10 / 100, alignItems: 'center', justifyContent: "space-between", flexDirection: "row", paddingHorizontal: mobileW * 5 / 100 }}>
                        <TouchableOpacity activeOpacity={0.8}
                            onPress={() => navigation.goBack()}
                            style={{ backgroundColor: '#00000070', padding: mobileW * 2 / 100, borderRadius: mobileW * 5 / 100 }}
                        >
                            <Image
                                resizeMode='contain'
                                style={[styles.onlineonuserImage, { tintColor: Colors.whiteColor }]}
                                // style={styles.onlineonuserImage}
                                source={localimag.back_icon}
                            />
                        </TouchableOpacity>
                        {/* <View
                            style={{ backgroundColor: '#00000070', padding: mobileW * 1 / 100, borderRadius: mobileW * 1 / 100 }}
                        >
                            <Text style={{ lineHeight: mobileW * 5 / 100, marginTop: config.device_type == "ios" ? mobileW * 1.5 / 100 : 0, fontSize: mobileW * 4 / 100, textAlign: "center", fontFamily: Font.FontBold, color: Colors.whiteColor }}>{Lang_chg.profile[config.language]}</Text>
                        </View> */}
                        <Text style={{ lineHeight: mobileW * 5 / 100, marginTop: config.device_type == "ios" ? mobileW * 1.5 / 100 : 0, fontSize: mobileW * 4 / 100, textAlign: "center", fontFamily: Font.FontBold, color: Colors.whiteColor }}>     </Text>
                    </View>
                </ImageBackground>

                {/* ----  ---- */}

                <View
                    style={[styles.FlatlistBaseView]}>

                    <View style={{ height: mobileH * 9 / 100, width: mobileW * 90 / 100, alignItems: 'center', justifyContent: "center" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: mobileH * 0.5 / 100 }}>
                            <Image
                                resizeMode='contain'
                                style={styles.flagImage}
                                source={{ uri: FlagUrl }}
                            />
                            <Text style={styles.userName}>   {CustomerInformation.display_name}</Text>
                        </View>

                        {/* <Text style={[styles.dateTimeTxt, { marginTop: mobileH * 0.5 / 100, }]}>{Lang_chg.ID[config.language]} : {CustomerInformation.identity_no}</Text> */}
                    </View>
                </View>
                {/* ----  ---- */}

                <View style={{
                    width: mobileW,
                    height: mobileH * 5 / 100
                }}>
                    <Text style={styles.aboutTxt}>{Lang_chg.Information[config.language]}</Text>
                </View>

                <View style={styles.informationBaseView}>
                    <View style={[styles.headView, { marginTop: 0 }]}>
                        <Text style={styles.Callsin}>{Lang_chg.Callsin30day[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerCallingData.last_call_in_month}</Text>
                    </View>
                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Averagetime[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerCallingData.average_call_duration + ' (minutes)'}</Text>
                    </View>
                    {/* <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Credits[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>$ 500</Text>
                    </View> */}

                    <View
                        style={{
                            backgroundColor: Colors.borderColour, width: mobileW * 81 / 100, height: mobileH * 0.25 / 100,
                            marginTop: mobileH * 2 / 100
                        }}
                    ></View>

                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Registered[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>
                            {CustomerCallingData.registered_date != null ? moment(CustomerCallingData.registered_date).format('D-MMMM-YYYY') : 'NA'}</Text>
                    </View>
                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Firstcall[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerCallingData.first_call_date != null ? moment(CustomerCallingData.first_call_date).format('D-MMMM-YYYY') : 'NA'}</Text>
                    </View>
                    {/* <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Warnings[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.total_warning}</Text>
                    </View> */}
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
    cardView: {
        width: mobileW * 85 / 100,
        borderWidth: mobileW * 0.2 / 100,
        borderRadius: mobileW * 3.5 / 100,
        borderColor: Colors.mediumDarkGrey,
        marginTop: mobileW * 8 / 100,
        backgroundColor: Colors.whiteColor
    },
    FlatlistBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 1 / 100,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: mobileW * 3 / 100,
        marginTop: mobileH * 1 / 100,
    },
    UserCommentBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 3 / 100,
        marginTop: mobileH * 1 / 100,
    },
    UserCommentdataView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    UserImage: {
        width: mobileW * 18 / 100,
        height: mobileW * 18 / 100,
        borderRadius: mobileW * 9 / 100,
    },
    UserFullImage: {
        width: mobileW,
        height: mobileH * 40 / 100,
    },
    CommentUserImage: {
        width: mobileW * 12 / 100,
        height: mobileW * 12 / 100,
        borderRadius: mobileW * 6 / 100,
    },
    onlineonuserImage: {
        width: mobileW * 5 / 100,
        height: mobileW * 5 / 100,
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
    userCommentName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 3.5 / 100
    },
    RatingCount: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 5.5 / 100
    },
    Callsin: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 3.2 / 100
    },
    dateTimeTxt: {
        fontFamily: Font.FontMedium,
        color: Colors.darkGray,
        fontSize: mobileW * 3.4 / 100
    },
    commentDatatxt: {
        fontFamily: Font.FontMedium,
        color: Colors.darkGray,
        fontSize: mobileW * 2.7 / 100
    },
    cameraIcon: {
        width: mobileW * 7.8 / 100,
        height: mobileW * 7.8 / 100
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
    },
    Topbar:
    {
        height: mobileW * 11.5 / 100,
        alignItems: "center",
        justifyContent: 'center',
        borderBottomColor: Colors.Pink,
        width: mobileW * 50 / 100,
        borderBottomWidth: mobileW * 0.3 / 100,
    },
    Topbar1: {
        height: mobileW * 11.5 / 100,
        alignItems: "center",
        justifyContent: 'center',
        borderBottomColor: '#ebebec',
        width: mobileW * 50 / 100,
        borderBottomWidth: mobileW * 0.3 / 100,
    },
    aboutTxt:
    {
        //  backgroundColor: 'yellow',
        color: Colors.blackColor,
        textAlign: 'left',
        left: mobileW * 5.5 / 100,
        fontFamily: Font.FontSemiBold,
        fontSize: mobileW * 3.8 / 100,
    },
    informationBaseView: {
        alignSelf: 'center',
        backgroundColor: Colors.whiteColor,
        width: mobileW * 90 / 100,
        paddingVertical: mobileH * 2 / 100,
        marginTop: mobileH * 2 / 100,
        borderRadius: mobileW * 3 / 100,
        alignItems: 'center',
        elevation: 2,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    CommentBaseView: {
        alignSelf: 'center',
        backgroundColor: Colors.whiteColor,
        width: mobileW * 90 / 100,
        paddingHorizontal: mobileH * 1 / 100,
        paddingVertical: mobileH * 2 / 100,
        marginTop: mobileH * 2 / 100,
        borderRadius: mobileW * 3 / 100,
        alignItems: 'center',
        elevation: 2,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    headView: {
        flexDirection: "row",
        justifyContent: 'space-between',
        width: '90%',
        marginTop: mobileH * 2 / 100
    },
    VerticalLine: {
        width: mobileW * 0.3 / 100,
        height: mobileH * 12 / 100,
        backgroundColor: Colors.borderColour
    }
})

