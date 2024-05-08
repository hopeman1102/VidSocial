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
import { Button } from 'react-native';
import { UserLoginPermission } from './UserLoginPermission';

export default function Wallet_c({ navigation }) {

    const data = [
        { Amount: 0, Incurrency: 0 }
    ]

    const [GetallCoinstoshow, setGetallCoinstoshow] = useState(data)
    const [CreditAmount, setCreditAmount] = useState(0)

    useEffect(() => {
        GetallCoins()
    }, [])


    useFocusEffect(
        React.useCallback(() => {
            // getUSerData();
            ToGetUserCoins()
            UserLoginPermission({ navigation })
        }, [])
    );

    const getUSerData = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        console.log('UserData', UserData.total_earn_coin);
        setCreditAmount(UserData.total_earn_coin)
    }

    const GetallCoins = async () => {

        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);

        global.props.showLoader();
        let apiUrl = appBaseUrl.GetCoustomorCoins;

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
                console.log("LoginResponse--->222", response);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setGetallCoinstoshow(response.data.data)
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

    const ToGetCoins = async (item) => {
        var Token = await localStorage.getItemString("AccessToken")
        global.props.showLoader();
        let apiUrl = appBaseUrl.getPurchaseCoins;
        var postData = JSON.stringify({
            credit_coin_id: item.id,
            ExpTime: 600
        });

        console.log('postDatapostData', postData);
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                console.log("LoginResponse--->222", response.data);
                // Handle the successful response
                var checkoutUrl = response.data.data;
                // var checkoutUrl =  response.data.data.data.qrcodeLink;
                if (response.data.code == 201) {
                    console.log('checkoutUrlcheckoutUrl', checkoutUrl);
                    global.props.hideLoader();
                    navigation.navigate('Payment', { checkoutUrl: checkoutUrl })
                    // openUrl(checkoutUrl)
                    //  await Linking.canOpenURL(checkoutUrl);

                    // setCustomerInformation(response.data.data)
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

    const ToGetUserCoins = async (item) => {
        var Token = await localStorage.getItemString("AccessToken")
        global.props.showLoader();
        let apiUrl = appBaseUrl.baseURL + 'vid_worker/total_coin_of_worker/';
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };
        // Make a POST request using Axios
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                console.log('response', response);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setCreditAmount(response.data.data.Total_earn_coin)
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


    const openUrl = (checkoutUrl) => {
        const url = checkoutUrl; // Replace this with the URL you want to open

        Linking.openURL(url)
            .then((supported) => {
                if (!supported) {
                    console.error('Cannot handle URL: ' + url);
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const share_btn = () => {
        var other_user_id = this.state.other_user_id
        consolepro.consolelog('i am in share business ', other_user_id)
        var share_url = config.baseURL + 'shareurllink.php/?link=localbusiness://BussinesDetails/' + other_user_id;
        consolepro.consolelog({ share_url })
        let shareOptions = {
            message: share_url,
            failOnCancel: false,
        };
        Share.open(shareOptions)
    }

    // =============================================================================
    // ================ API CAlling For New User ===================
    const _ToPurchaseCoins = async (item) => {
        var UserData = await localStorage.getItemObject("UserData")

        global.props.showLoader();

        let apiUrl = appBaseUrl.baseURL + 'vid_customer/add_coin_in_user_account/';

        var postData = JSON.stringify({
            coin: item.credit_coin,
            user_id: UserData.id
        });
        const headers = {
            'Content-Type': 'application/json',
        };

        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                console.log("Total Coins--->", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    ToGetUserCoins();
                } else {
                    global.props.hideLoader();
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---', error);
            });
    }

    return (
        <View style={styles.container}>
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
                    <View style={styles.InnerWhiteView}>
                        <Image
                            resizeMode='contain'
                            style={styles.dollarImage}
                            source={localimag.dollar}
                        />
                        <Text style={styles.buyCreditTxt}>   {Lang_chg.BUY_CREDITS[config.language]}</Text>
                    </View>
                </ImageBackground>
            </View>
            <View style={{ marginTop: 10 }}>
                <FlatList
                    data={GetallCoinstoshow}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: mobileH * 50 / 100 }}
                    renderItem={({ item, index }) =>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => ToGetCoins(item)}
                            style={styles.informationBaseView}>
                            <View style={styles.headView}>
                                <Text style={[styles.Callsin, { fontSize: mobileW * 4 / 100 }]}>$ {item.amount}</Text>
                                <Text style={styles.Callsin}>{item.credit_coin}</Text>
                            </View>
                            <View style={[styles.headView,{alignItems:'center'}]}>
                                {/* <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>       </Text> */}
                                {/* <Button
                                    onPress={() => _ToPurchaseCoins(item)}
                                    title='Test'
                                    style={{backgroundColor:Colors.blueColour,width:mobileW*30/100}}
                                ></Button> */}

                                {/* <TouchableOpacity 
                                 onPress={() => _ToPurchaseCoins(item)}
                                 activeOpacity={0.8}
                                style={[styles.InnerWhiteView,{backgroundColor:Colors.blueColour,paddingVertical:mobileW*0.5/100}]}>
                                    <Text style={[styles.buyCreditTxt,{color:Colors.whiteColor}]}>Test</Text>
                                </TouchableOpacity> */}
                                <Text>    </Text>
                                <Text style={[styles.Callsin, { color: Colors.greenColour }]}>{Lang_chg.Credits[config.language]}</Text>
                            </View>
                        </TouchableOpacity>
                    } />
            </View>
            <Footer
                activepage='Wallet_c'
                usertype={1}
                footerpage={[
                    { name: 'Home_c', pageName: Lang_chg.Home[config.language], countshow: false, image: require('../Icons/Home_icon.png'), activeimage: require('../Icons/Home_icon.png') },

                    { name: 'Search_c', pageName: Lang_chg.Search[config.language], countshow: false, image: require('../Icons/search_icon.png'), activeimage: require('../Icons/search_icon.png') },

                    {
                        name: 'Faourite', pageName: Lang_chg.Favourite[config.language], countshow: false, image: require('../Icons/Heart_icon.png'), activeimage: require('../Icons/Heart_icon.png')
                    },

                    { name: 'Wallet_c', pageName: Lang_chg.Wallet[config.language], countshow: false, image: require('../Icons/Wallet_icon.png'), activeimage: require('../Icons/Wallet_icon.png') },

                    { name: 'Profile_c', pageName: Lang_chg.profile[config.language], countshow: false, image: require('../Icons/profile_icon.png'), activeimage: require('../Icons/profile_icon.png') },
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
    headView: {
        flexDirection: "row",
        justifyContent: 'space-between',
        width: '90%',
    },
    Callsin: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 3 / 100
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

