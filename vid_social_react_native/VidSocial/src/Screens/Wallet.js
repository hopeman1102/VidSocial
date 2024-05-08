import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Cameragallery, Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import CommonAlert from '../Components/CommonAlert';
import { UserLoginPermission } from './UserLoginPermission';

export default function Wallet({ navigation }) {

    const [modalVisibleForBank, setmodalVisibleForBank] = useState(false)
    const [WithdrawCreditsModal, setWithdrawCreditsModal] = useState(false)
    const [Amount, setAmount] = useState(0)
    const [CreditAmount, setCreditAmount] = useState(0)
    const [SponsorID, setSponsorID] = useState(0)
    const [AlertModal, setAlertModal] = useState(false)
    const [AlertMessage, setAlertMessage] = useState('')

    useFocusEffect(
        React.useCallback(() => {
            GetallCoins()
            UserLoginPermission({ navigation })
            GetSponsorDetails()
        }, [])
    );

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
                console.log('I am here ',response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                     console.log(response.data);
                     setSponsorID(response.data.data.sponser_id)
                } else {
                    setSponsorID(0)
                    global.props.hideLoader();
                 }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---22', error);
                // Handle errors
            });
    }

    const GetallCoins = async () => {
        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);

        global.props.showLoader();
        let apiUrl = appBaseUrl.TotalCoinOfWorker;

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
                    global.props.hideLoader();
                    setCreditAmount(response.data.data.Total_earn_coin)
                    console.log('=============????',response.data.data.Total_earn_coin);
                } else {
                    global.props.hideLoader();
                    setCreditAmount(0)
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

            {/* ---- Payment Methods Modal Start ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisibleForBank}
                onRequestClose={() => { setmodalVisibleForBank(!modalVisibleForBank) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.girlHeadercolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadView}>
                            <View
                                style={styles.ModalHeaderView}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={styles.dollarImage}
                                />
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 4 / 100,
                                        fontFamily: Font.FontSemiBold
                                    }]}
                                >{Lang_chg.Payment_methods[config.language]}</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setmodalVisibleForBank(false)}
                                >
                                    <Image
                                        resizeMode='contain'
                                        style={styles.dollarImage}
                                        source={localimag.close}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.SecondBaseView}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setmodalVisibleForBank(false),
                                            navigation.navigate('BinanceDetails')
                                    }}
                                    style={styles.BaseViewCard}>
                                    <Image
                                        resizeMode='contain'
                                        style={styles.BankIconstyle}
                                        source={localimag.BinanceIcon}
                                    />
                                    <Text style={styles.Callsin}>{Lang_chg.Binance[config.language]}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setmodalVisibleForBank(false),
                                            navigation.navigate('BankDetails', { item: null })
                                    }}
                                    style={styles.BaseViewCard}>
                                    <Image
                                        resizeMode='contain'
                                        style={styles.BankIconstyle}
                                        source={localimag.BankIcon}
                                    />
                                    <Text style={styles.Callsin}>{Lang_chg.Bank_Account[config.language]}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* ---- Payment Methods Modal End ---- */}
            {/* ---- Withdraw Credits Modal Start ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={WithdrawCreditsModal}
                onRequestClose={() => { setWithdrawCreditsModal(!WithdrawCreditsModal) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.girlHeadercolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadViewForWithdraw}>
                            <View
                                style={styles.ModalHeaderView}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={styles.dollarImage}
                                />
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 4 / 100,
                                        fontFamily: Font.FontSemiBold
                                    }]}
                                >{Lang_chg.Withdraw[config.language]}</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setWithdrawCreditsModal(false)}
                                >
                                    <Image
                                        resizeMode='contain'
                                        style={styles.dollarImage}
                                        source={localimag.close}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.SecondBaseView, { flexDirection: 'column' }]}>
                                {/* --- TextInput Password --- */}
                                <View style={styles.textAlignextInputBaseView}>
                                    <TextInput
                                        maxLength={100}
                                        keyboardType='email-address'
                                        placeholderTextColor={Colors.darkGray}
                                        placeholder={Lang_chg.Enterwithdrawcredit[config.language]}
                                        onChangeText={(txt) => { setAmount(txt) }}
                                        style={styles.textInputStyle}>
                                    </TextInput>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: mobileH * 3 / 100 }}>
                                    <Text style={[styles.AmountValue, { color: Colors.Pink }]}>{Lang_chg.EquivivalentValue[config.language]} :</Text>
                                    <Text style={styles.AmountValue}>  $ {Amount * 100 / 1000}</Text>
                                </View>
                            </View>
                            <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={styles.OkButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setWithdrawCreditsModal(false)
                                        setTimeout(() => {
                                            navigation.navigate('Withdraw')
                                        }, 1500);
                                    }
                                    }
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.DONE[config.language]}</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* ---- Withdraw Credits Modal End ---- */}
            <CommonAlert AlertData={AlertMessage} mediamodal={AlertModal} Canclemedia={() => { setAlertModal(false) }}
            />
            <Header
                backIcon={false}
                navigation={navigation}
                title={Lang_chg.Wallet[config.language]}
                firstImage={localimag.app_Logo}
            ></Header>
            {/* ----  ---- */}

            <View
                style={styles.FlatlistBaseView}>
                <ImageBackground
                    resizeMode='contain'
                    style={styles.UserImage}
                    imageStyle={styles.UserImage}
                    source={localimag.WalletCard}
                >
                    <Text style={styles.userCommentName}>{Lang_chg.YOUR_CREDITS[config.language]}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                        <Image
                            resizeMode='contain'
                            style={styles.onlineonuserImage}
                            source={localimag.WalletWhite}
                        />

                        <Text style={[styles.WalletAmount]}>  {CreditAmount}</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            SponsorID == 0 ?
                                   ( setAlertMessage(Lang_chg.Youdonthaveanysponsor[config.language]),
                                    setAlertModal(true))
                                : navigation.navigate('WithdrawWorker')
                        }
                        }
                        style={styles.InnerWhiteView}>
                        <Image
                            resizeMode='contain'
                            style={styles.dollarImage}
                            source={localimag.dollar}
                        />
                        <Text style={styles.buyCreditTxt}>   {Lang_chg.Withdraw_CREDITS[config.language]}</Text>
                    </TouchableOpacity>
                </ImageBackground>
            </View>
            <View
                style={{ left: mobileW * 5.5 / 100, marginTop: mobileH * 5 / 100 }}
            >
                <Text style={{
                    fontFamily: Font.FontSemiBold,
                    color: Colors.blackColor,
                    fontSize: mobileW * 3.8 / 100
                }}>{Lang_chg.Payment_List[config.language]}</Text>
            </View>

            <View style={styles.informationBaseView}>
                <View style={{ flexDirection: "row", width: '100%', alignItems: 'center', justifyContent: "space-around" }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setmodalVisibleForBank(true)}
                        style={styles.BaseViewCard}>
                        <Image
                            resizeMode='contain'
                            style={styles.BankIconstyle}
                            source={localimag.PaymentMethod}
                        />
                        <Text style={styles.Callsin}>{Lang_chg.Payment_methods[config.language]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            navigation.navigate('PaymentHistory')
                        }}
                        style={styles.BaseViewCard}>
                        <Image
                            resizeMode='contain'
                            style={styles.BankIconstyle}
                            source={localimag.PayHistoryIcon}
                        />
                        <Text style={styles.Callsin}>{Lang_chg.Payment_history[config.language]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Faq')}
                        style={styles.BaseViewCard}>
                        <Image
                            resizeMode='contain'
                            style={styles.BankIconstyle}
                            source={localimag.FaqIcon}
                        />
                        <Text style={styles.Callsin}>{Lang_chg.Frequent_questions[config.language]}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.SecondBaseView}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Sponsors')}
                        style={styles.BaseViewCard}>
                        <Image
                            resizeMode='contain'
                            style={styles.BankIconstyle}
                            source={localimag.SponsorsIcon}
                        />
                        <Text style={styles.Callsin}>{Lang_chg.Sponsors[config.language]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => { SponsorID == 0 ?  ( setAlertMessage(Lang_chg.Youdonthaveanysponsor[config.language]),
                        setAlertModal(true)) : navigation.navigate('Report') }}
                        style={styles.BaseViewCard}>
                        <Image
                            resizeMode='contain'
                            style={styles.BankIconstyle}
                            source={localimag.ReportIcon}
                        />
                        <Text style={styles.Callsin}>{Lang_chg.Report_sponsor[config.language]}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Footer
                activepage='Wallet'
                usertype={1}
                footerpage={[
                    { name: 'Home', pageName: Lang_chg.Home[config.language], countshow: false, image: require('../Icons/Home_icon.png'), activeimage: require('../Icons/Home_icon.png') },

                    { name: 'Search', pageName: Lang_chg.Search[config.language], countshow: false, image: require('../Icons/search_icon.png'), activeimage: require('../Icons/search_icon.png') },

                    { name: 'TopGirls', pageName: Lang_chg.TopGirls[config.language], countshow: false, image: require('../Icons/activeStar.png'), activeimage: require('../Icons/deactivae_star.png') },

                    { name: 'Wallet', pageName: Lang_chg.Wallet[config.language], countshow: false, image: require('../Icons/Wallet_icon.png'), activeimage: require('../Icons/Wallet_icon.png') },

                    { name: 'Profile', pageName: Lang_chg.profile[config.language], countshow: false, image: require('../Icons/profile_icon.png'), activeimage: require('../Icons/profile_icon.png') },
                ]}
                navigation={navigation}
                imagestyle1={{ width: 25, height: 25, backgroundColor: '#fff', countcolor: 'white', countbackground: 'black' }}
                count_inbox={0}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground
    },
    FlatlistBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: mobileW * 3 / 100,
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
    userCommentName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.whiteColor,
        fontSize: mobileW * 4.2 / 100,
        marginTop: mobileH * 2 / 100
    },
    WalletAmount: {
        fontFamily: Font.FontBold,
        color: Colors.whiteColor,
        fontSize: mobileW * 6.2 / 100,
        marginTop: mobileH * 0.5 / 100
    },
    onlineonuserImage: {
        width: mobileW * 6.5 / 100,
        height: mobileW * 6.5 / 100,
    },
    BankIconstyle: {
        width: mobileW * 13 / 100,
        height: mobileW * 13 / 100,
    },
    dollarImage: {
        width: mobileW * 5.5 / 100,
        height: mobileW * 5.5 / 100,
    },
    buyCreditTxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blueColour,
        fontSize: mobileW * 3.2 / 100,
    },
    informationBaseView: {
        alignSelf: 'center',
        backgroundColor: Colors.whiteColor,
        width: mobileW * 90 / 100,
        paddingVertical: mobileH * 3.5 / 100,
        marginTop: mobileH * 3 / 100,
        borderRadius: mobileW * 7 / 100,
        elevation: 2,
        justifyContent: "space-around",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    Callsin: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 2.7 / 100,
        // marginTop:mobileH*1/100
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
    },
    BaseViewCard: {
        alignItems: "center",
        width: mobileW * 29 / 100,
        height: mobileH * 12 / 100,
        alignItems: 'center',
        justifyContent: "space-around"
    },
    SecondBaseView: {
        flexDirection: "row",
        width: '67%',
        marginTop: mobileH * 2 / 100,
        alignItems: 'center',
        justifyContent: "space-around"
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
        borderRadius: mobileW * 6 / 100,
        width: "100%",
        height: mobileH * 25 / 100,
        alignItems: 'center'
    },
    ModalheadViewForWithdraw: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: mobileW * 6 / 100,
        width: "100%",
        height: mobileH * 35 / 100,
        alignItems: 'center'
    },
    ModalHeaderView: {
        width: '100%', height: mobileH * 7 / 100,
        borderBottomWidth: mobileW * 0.3 / 100,
        borderBottomColor: Colors.grayColour,
        alignItems: "center",
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        justifyContent: 'space-between'
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
        width: mobileW * 67 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 2.8 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray,
    },
    AmountValue: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 4 / 100,
        // marginTop:mobileH*1/100
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 3 / 100,
        alignItems: "center"
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
})

