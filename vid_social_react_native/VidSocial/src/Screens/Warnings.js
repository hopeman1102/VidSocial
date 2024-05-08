import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, Linking, Alert } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useEffect } from 'react';
import CommonAlert from '../Components/CommonAlert';
import moment from 'moment';
import zone from 'moment-timezone';

export default function Warnings({ navigation }) {

    const [WarningsArr, setWarningsArr] = useState('NA');
    const [AlertModal, setAlertModal] = useState(false)
    const [AlertMessage, setAlertMessage] = useState('')
    const [timeZone, setTimeZone] = useState("")

    useEffect(() => {
        _UpdateUserLAnguage()
    }, [])

    useEffect(() => {
        const currentTimeZone = zone.tz.guess();
        setTimeZone(currentTimeZone)
    }, []);

    // ================ API CAlling For New User ===================
    const _UpdateUserLAnguage = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        global.props.showLoader();
        let apiUrl = appBaseUrl.GetAllWarnings + UserData.id;

        console.log(apiUrl, 'postData-----------');
        const headers = {
            'Content-Type': 'application/json',
        };
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                console.log("signUpResponse--->", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setWarningsArr(response.data.data)
                } else {
                    global.props.hideLoader();
                    setWarningsArr("NA")
                    // setAlertMessage(response.data.message)
                    // setAlertModal(true)
                    // alert(response.data.message)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---', error);
            });
    }

    return (
        <View style={styles.container}>
            {/* ------ App Common Alert -------- */}
            <CommonAlert AlertData={AlertMessage} mediamodal={AlertModal} Canclemedia={() => { setAlertModal(false) }}
            />
            <Header
                navigation={navigation}
                title={Lang_chg.Warnings[config.language]}
                backIcon={true}
                firstImage={localimag.back_icon}
            ></Header>

            {/* ----  ---- */}
            <View style={{ borderRadius: 20, width: "90%", alignSelf: "center", top: mobileH * 1 / 100, }}>
                {WarningsArr != 'NA' ?
                    <View style={{ marginTop: mobileH * 1 / 100 }}>
                        <FlatList
                            data={WarningsArr}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: mobileH * 50 / 100 }}
                            renderItem={({ item, index }) =>

                                <View
                                    activeOpacity={0.8}
                                    style={styles.informationBaseView}>

                                    <View style={styles.headView}>
                                        <Text style={[styles.Callsin]}> {Lang_chg.WarningDate[config.language]} :- </Text>
                                        <Text style={styles.ApiText}>{item.create_date_time != null && moment(item.create_date_time).clone().tz(timeZone).format('MMM DD, YYYY, hh:mm A')}</Text>
                                    </View>

                                    <View style={styles.headView}>
                                        <Text style={[styles.Callsin]}> {Lang_chg.CoinsDeducted[config.language]} :- </Text>
                                        <Text style={styles.ApiText}>{item.amount == null ? 0 : item.amount}</Text>
                                    </View>

                                    <View style={styles.headView}>
                                        <Text style={[styles.Callsin]}> {Lang_chg.Reason[config.language]} :- </Text>
                                        <Text style={[styles.ApiText, { width: mobileW * 68 / 100 }]}>{item.reason}</Text>
                                    </View>

                                    <View style={[styles.headView]}>
                                        <Text style={[styles.Callsin]}> {Lang_chg.Action[config.language]} :- </Text>
                                        <Text style={[styles.ApiText, { width: mobileW * 68 / 100 }]}>{item.user_warning_action}</Text>
                                    </View>

                                </View>
                            } />
                    </View>
                    :
                    <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: mobileH * 100 / 100, }}>
                        <Image resizeMode='contain' style={{ width: mobileW * 80 / 100, height: mobileH * 20 / 100, marginBottom: mobileW * 40 / 100 }}
                            source={localimag.nodata}
                        >
                        </Image>

                    </View>}
            </View>


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground
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
        paddingHorizontal: mobileW * 2 / 100,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        // backgroundColor: 'yellow'
    },
    headView: {
        flexDirection: "row",
        // justifyContent: 'space-between',
        width: '100%',
        // alignItems: 'center'
    },
    Callsin: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 3.2 / 100
    },
    ApiText: {
        fontFamily: Font.FontMedium,
        color: Colors.darkGray,
        fontSize: mobileW * 3 / 100,
        marginTop: mobileH * 0.1 / 100
    },
    InnerWhiteView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        backgroundColor: Colors.whiteColor,
        paddingVertical: mobileH * 0.8 / 100,
        paddingHorizontal: mobileW * 3.8 / 100,
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 1.5 / 100
    }
})

