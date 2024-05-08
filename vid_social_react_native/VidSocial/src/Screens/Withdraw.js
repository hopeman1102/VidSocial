import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import LinearGradient from 'react-native-linear-gradient';
import { RadioButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { UserLoginPermission } from './UserLoginPermission';

export default function Withdraw({ navigation, route }) {

    const [checked, setChecked] = React.useState(0);
    const [modalVisible, setmodalVisible] = React.useState(false);
    const [ShowBackAccount, setShowBackAccount] = React.useState('NA');
    const [ShowBinanceAccount, setShowBinanceAccount] = React.useState("NA");
    const [AccountNumber, setAccountNumber] = React.useState('');
    const [SponsorID, setSponsorID] = React.useState(0);

    useFocusEffect(
        React.useCallback(async () => {
            GetallCoins()
            UserLoginPermission({ navigation })
        }, [])
    );

    const CoinsData = route.params.item

    useFocusEffect(
        React.useCallback(() => {
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
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    console.log(response.data);
                    setSponsorID(response.data.data.sponser_id)
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

    const GetallCoins = async () => {

        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);

        global.props.showLoader();
        let apiUrl = appBaseUrl.CustomerBinance;

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log(apiUrl, "LoginResponse--->22244444444444444", response.data.data.bank_accounts);
                console.log("LoginResponse--->22244444444444444", response.data.data.binance_accounts);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    //  ----------- To set Bank Account ------------------
                    var BankAccounts = response.data.data.bank_accounts;
                    if (response.data.data.bank_accounts.length > 0) {
                        var jsonObj = {};
                        for (var i = 0; i < BankAccounts.length; i++) {
                            jsonObj = BankAccounts[i];
                        }
                        setShowBackAccount(jsonObj)
                        setAccountNumber(jsonObj.account_number.slice(-4))
                    } else {
                        setShowBackAccount('NA')
                    }

                    //  ----------- To set Binance Account ------------------
                    var BinanceAccount = response.data.data.binance_accounts;
                    if (response.data.data.binance_accounts.length > 0) {
                        var jsonObj1 = {};
                        for (var i = 0; i < BinanceAccount.length; i++) {
                            jsonObj1 = BinanceAccount[i];
                        }
                        setShowBinanceAccount(jsonObj1)
                    } else {
                        setShowBinanceAccount('NA')
                    }
                    // ------------------------------------------------------
                } else {
                    global.props.hideLoader();
                    setShowBinanceAccount('NA')
                    setShowBackAccount('NA')
                    // alert(response.data.message)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---22', error);
                // Handle errors
            });
    }

    // ========================================================
    const SendPaymentRequest = async () => {
        var Token = await localStorage.getItemString("AccessToken")
        global.props.showLoader();
        let apiUrl = appBaseUrl.WorkerPaymentRequest;

        var BankTupe = checked
        if (BankTupe == 0) {
            BankTupe = false
        } else {
            BankTupe = true
        }
        var postData = JSON.stringify({
            sponser_id: SponsorID,
            coin_claim: CoinsData.credit_coin,
            amount: Number(CoinsData.amount),
            bank_received: BankTupe
        });
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };
        console.log('=======>>', postData);
        // Make a POST request using Axios
        console.log(postData, '<<<==========>>>', apiUrl, Token);
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("GetBinanceresponseData--->222", response.data);

                if (response.data.code == 201) {
                    global.props.hideLoader();
                    setTimeout(() => {
                        setmodalVisible(true)
                    }, 1500);
                } else {
                    if (response.data.code == 404) {
                        global.props.hideLoader();
                        alert(Lang_chg.selectAccount[config.language])
                    } else {
                        global.props.hideLoader();
                        alert(response.data.message)
                    }
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

            {/* ---- Congrats Modal ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { setmodalVisible(!modalVisible) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.themecolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadView}>
                            <Image
                                resizeMode='contain'
                                style={{ width: mobileW * 22 / 100, height: mobileW * 22 / 100 }}
                                source={localimag.AppRightGirl}
                            />
                            <Text style={styles.congratstxt}>{Lang_chg.Complete[config.language]}</Text>
                            <Text style={styles.Modaltxt}>{Lang_chg.ConfirmMoney[config.language]}</Text>
                            <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={styles.OkButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setmodalVisible(false)
                                        setTimeout(() => {
                                            navigation.navigate('Wallet')
                                        }, 1500);
                                    }
                                    }
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
            </Modal>
            <Header
                navigation={navigation}
                title={'Withdraw'}
                backIcon={true}
                firstImage={localimag.back_icon}
            ></Header>
            {/* ----  ---- */}
            {ShowBackAccount != 'NA' || ShowBinanceAccount != 'NA' ?
                <View style={styles.informationBaseView}>
                    <View
                        style={{ left: mobileW * 5.5 / 100 }}
                    >
                        <Text style={{
                            fontFamily: Font.FontSemiBold,
                            color: Colors.blackColor,
                            fontSize: mobileW * 3.5 / 100
                        }}>{Lang_chg.payment_method_to_withdraw[config.language]}</Text>
                    </View>
                    {ShowBinanceAccount != 'NA' &&
                        <TouchableOpacity
                            onPress={() => setChecked(0)}
                            style={[styles.SecondBaseView, {}]}>
                            <RadioButton
                                value="worker"
                                color={Colors.Pink}
                                status={checked === 0 ? 'checked' : 'unchecked'}
                                onPress={() => setChecked(0)}
                            />
                            <View
                                style={{ width: mobileW * 60 / 100, height: mobileH * 7 / 100 }}
                            >
                                <Text style={{
                                    fontFamily: Font.FontSemiBold,
                                    color: Colors.blackColor,
                                    fontSize: mobileW * 3.8 / 100,
                                    marginTop: mobileH * 0.5 / 100
                                }}>{Lang_chg.Binance[config.language]}</Text>
                                <Text style={{
                                    fontFamily: Font.FontMedium,
                                    color: Colors.grayColour,
                                    fontSize: mobileW * 3 / 100
                                }}>{ShowBinanceAccount.binance_pay_id}</Text>
                            </View>
                            <Image
                                resizeMode='contain'
                                style={styles.dollarImage}
                                source={localimag.Binance}
                            />
                        </TouchableOpacity>
                    }
                    {ShowBackAccount != 'NA' &&
                        <View style={[styles.SecondBaseView, {}]}>
                            <RadioButton
                                value="worker"
                                color={Colors.Pink}
                                status={checked === 1 ? 'checked' : 'unchecked'}
                                onPress={() => setChecked(1)}
                            />
                            <View
                                style={{ width: mobileW * 60 / 100, height: mobileH * 7 / 100 }}
                            >
                                <Text style={{
                                    fontFamily: Font.FontSemiBold,
                                    color: Colors.blackColor,
                                    fontSize: mobileW * 3.8 / 100,
                                    marginTop: mobileH * 0.5 / 100
                                }}>{Lang_chg.Bank[config.language]}</Text>
                                <Text style={{
                                    fontFamily: Font.FontMedium,
                                    color: Colors.grayColour,
                                    fontSize: mobileW * 3 / 100
                                }}>{ShowBackAccount.bank_name} {Lang_chg.Ac[config.language]} ******{AccountNumber}</Text>
                            </View>
                            <Image
                                resizeMode='contain'
                                style={styles.dollarImage}
                                source={localimag.customer}
                            />
                        </View>
                    }
                    {ShowBinanceAccount || ShowBinanceAccount != 'NA' ?
                        <LinearGradient
                            colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                            style={styles.OkButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    SendPaymentRequest()
                                }
                                }
                                activeOpacity={0.6}
                            >
                                <Text style={styles.Oktxt}>{Lang_chg.Submit[config.language]}</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                        :
                        null
                    }
                </View>
                :
                <View
                    style={styles.informationBaseView}
                >
                    <Text style={[styles.Oktxt, {
                        color: Colors.blackColor, alignSelf: 'center'
                    }]}>{Lang_chg.Pleaseaddyourpaymentmethod[config.language]}</Text>
                    <LinearGradient
                        colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                        style={styles.OkButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('Wallet')
                            }
                            }
                            activeOpacity={0.6}
                        >
                            <Text style={styles.Oktxt}>{Lang_chg.Back[config.language]}</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>}

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
        paddingVertical: mobileH * 3.5 / 100,
        marginTop: mobileH * 3 / 100,
        borderRadius: mobileW * 1.5 / 100,
        elevation: 2,
        justifyContent: "space-around",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    SecondBaseView: {
        flexDirection: "row",
        width: '100%',
        marginTop: mobileH * 2 / 100,
        // alignItems: 'center',
        height: mobileH * 9 / 100,
        paddingHorizontal: mobileW * 4 / 100,
        justifyContent: 'space-between',
        borderBottomColor: Colors.grayColour,
        borderBottomWidth: mobileW * 0.18 / 100
    },
    dollarImage: {
        width: mobileW * 6.5 / 100,
        height: mobileW * 6.5 / 100,
        marginTop: mobileH * 0.5 / 100
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 5 / 100,
        alignItems: "center"
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
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
        width: "98%",
        paddingVertical: 20,
        height: mobileH * 46 / 100,
        alignItems: 'center',
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
        marginTop: mobileH * 3 / 100,
        alignItems: "center"
    },
    TakeIdView: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 10 / 100,
        width: mobileW * 40 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 4 / 100
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
    Modaltxt: {
        fontFamily: Font.FontRegular,
        color: Colors.darkGray,
        fontSize: mobileW * 4 / 100,
        textAlign: 'center',
        width: mobileW * 75 / 100,
        marginTop: mobileH * 1 / 100
    },
})

