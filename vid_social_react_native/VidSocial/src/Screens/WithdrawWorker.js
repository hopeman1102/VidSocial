// import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList } from 'react-native'
// import React, { useState } from 'react'
// import Header from '../Components/Header';
// import { localimag } from '../Provider/Localimageprovider/Localimage';
// import { Lang_chg } from '../Provider/Language_provider';
// import { Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
// import Footer from '../Provider/Footer';
// import LinearGradient from 'react-native-linear-gradient';
// import { useFocusEffect } from '@react-navigation/native';

// export default function WithdrawWorker({ navigation }) {

//     const [CreditAmount, setCreditAmount] = useState(0)

//     useFocusEffect(
//         React.useCallback(() => {
//             getUSerData();
//          }, [])
//     );

//     const getUSerData = async () => {
//         var UserData = await localStorage.getItemObject("UserData")
//         console.log('UserData', UserData.total_earn_coin);
//         setCreditAmount(UserData.total_earn_coin)
//     }

//     return (
//              <View style={styles.container}>


//                 {/* ----  ---- */}
//                      <View style={{width:mobileW*88/100,height:mobileW*140/100,backgroundColor:'white'
//                      ,borderRadius:mobileW*8/100,alignSelf:'center',marginTop:mobileW*5/100}}>
// {/* ====================================credit box===================================================== */}
//                      <View style={{width:mobileW*84/100,height:mobileW*10/100,backgroundColor:'green',
//                      borderRadius:mobileW*10/100,marginTop:mobileW*2.5/100,flexDirection:'row',justifyContent:'space-between'}}>

//                         <View style= {{width:mobileW*40/100,height:mobileW*10/100,backgroundColor:'red',
//                         borderRadius:mobileW*10/100,}}>
//                             <Text style={styles.userCommentName1}>{Lang_chg.Yourcredits[config.language]}</Text>
//                         </View>

//                         <View style= {{width:mobileW*21/100,height:mobileW*10/100,backgroundColor:'red',
//                         borderRadius:mobileW*10/100,flexDirection:'row'}}>
//                             <Text style={styles.userCommentName2}>{Lang_chg.sixtyfive[config.language]}</Text>
//                             <Image
//                              resizeMode='contain'
//                              style={{ width: mobileW * 6 / 100, height: mobileW * 6/ 100,}}
//                             source={localimag.dollar}
//                             />
//                         </View>

//                      </View>
//                      {/* ============================credit box end======================================== */}

//                        </View>


//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: Colors.appBackground
//     },
//     userCommentName1: {
//         fontFamily: Font.FontSemiBold,
//         color: Colors.whiteColor,
//         fontSize: mobileW * 4 / 100,
//         marginLeft:mobileW*2/100

//     },

//     userCommentName2: {
//         fontFamily: Font.FontSemiBold,
//         color: Colors.whiteColor,
//         fontSize: mobileW * 4 / 100,
//         marginLeft:mobileW*2/100

//     },
// })


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
import { UserLoginPermission } from './UserLoginPermission';

export default function WithdrawWorker({ navigation }) {

    const data = []

    const [GetallCoinstoshow, setGetallCoinstoshow] = useState(data)

    useFocusEffect(
        React.useCallback(() => {
            GetallCoins()
            UserLoginPermission({ navigation })
        }, [])
    );

    const [CreditAmount, setCreditAmount] = useState(0)

    useFocusEffect(
        React.useCallback(() => {
            getUSerData();
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
        let apiUrl = appBaseUrl.coin_list_for_worker;

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

    const ToGetCoins = async () => {

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

    return (
        <View style={styles.container}>
            <Header
                backIcon={true}
                navigation={navigation}
                title={Lang_chg.Withdraw[config.language]}
                firstImage={localimag.back_icon}
            ></Header>
            {/* ----  ---- */}

            <View style={{ marginTop: 10 }}>
                {GetallCoinstoshow != '' ?
                    <FlatList
                        data={GetallCoinstoshow}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: mobileH * 50 / 100 }}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Withdraw', { item: item })}
                                style={styles.informationBaseView}>
                                <View style={styles.headView}>
                                    <Text style={[styles.Callsin, { top: mobileH * 1.5 / 100, fontSize: mobileW * 4.5 / 100 }]}>$ {item.amount}</Text>
                                    <Text style={[styles.Callsin, { color: Colors.greenColour }]}>{Lang_chg.Credits[config.language]}</Text>
                                </View>
                                <View style={[styles.headView, { justifyContent: "flex-end" }]}>
                                    {/* <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>       </Text> */}
                                    {/* <Image
                            resizeMode='contain'
                            style={styles.dollarImage}
                            source={localimag.dollar}
                        /> */}
                                    <Text style={styles.Callsin}>  {item.credit_coin}</Text>
                                </View>
                            </TouchableOpacity>
                        } />
                    :
                    <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: mobileH * 80 / 100, }}>
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
        fontSize: mobileW * 3.5 / 100
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



