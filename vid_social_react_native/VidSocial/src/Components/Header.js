import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { Font, Colors } from '../Provider/Colorsfont'
import { mobileW, mobileH, config, localStorage } from '../Provider/utilslib/Utils'
import { localimag } from '../Provider/utilslib/Utils'
import LinearGradient from 'react-native-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants'

export default function Header({ title, firstImage, secondImage, navigation, navigateHome, backIcon }) {

    const [CustomerProfileData, setCustomerProfileData] = React.useState('');

    useFocusEffect(
        React.useCallback(() => {
            getUSerData();
        }, [])
    );

    const getUSerData = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        console.log('UserDataUserData===>>',UserData);
         setCustomerProfileData(UserData)
    }
    
    return (
        <View style={{}}>
            <LinearGradient
                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                style={styles.LinearStyle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View style={styles.MainView}>
                    <TouchableOpacity
                        onPress={() => backIcon && navigation.goBack()}
                        activeOpacity={0.7}
                        style={styles.BackIconView}>
                        <Image
                            resizeMode='contain'
                            style={{
                                width:  mobileW * 9 / 100,
                                height: backIcon ? mobileW * 4.7 / 100 : mobileW * 9 / 100,
                                left: secondImage ? -11 : -6
                            }}
                            source={firstImage}></Image>
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', alignSelf: 'center',left:mobileW*2.8/100 }}>
                        {title ?
                            <Text style={styles.TextStyle}>{title}</Text>
                            : null}
                    </View>
                    {CustomerProfileData.image_url_link != null ?
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={{
                                alignItems: 'center', justifyContent: 'center',
                                width:mobileW*12/100,top:mobileH*1/100
                            }}
                            onPress={() =>
                                global.UserType == 0
                                    ?
                                    navigation.navigate('Profile_c')
                                    :
                                    navigation.navigate('Profile')
                            }
                        >
                            <Image
                                resizeMode='contain'
                                style={{
                                    width: mobileW * 9 / 100,
                                    height: mobileW * 9 / 100,
                                    borderRadius: mobileW * 4.5 / 100,
                                    borderWidth: mobileW * 0.2 / 100,
                                    borderColor: global.UserType == 0 ? '#92B8FD' : '#FF87A4'
                                }}
                                source={CustomerProfileData.image_url_link == null ? localimag.person_icon : { uri: appBaseUrl.imageUrl + CustomerProfileData.image_url_link }}
                            ></Image>
                            <Text style={{
                                fontSize: mobileW * 2.5 / 100,
                                textAlign: "center",
                                fontFamily: Font.FontSemiBold,
                                color: Colors.whiteColor,
                                width:mobileW*15/100,
                             }}>{CustomerProfileData.display_name}</Text>

                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                global.UserType == 0
                                    ?
                                    navigation.navigate('Profile_c')
                                    :
                                    navigation.navigate('Profile')
                            }
                        >
                            <View
                                style={{
                                    width: mobileW * 9 / 100,
                                    height: mobileW * 9 / 100,
                                    borderRadius: mobileW * 4.5 / 100,
                                    backgroundColor: global.UserType == 0 ? '#92B8FD' : '#FF87A4',
                                    alignItems: 'center',
                                    justifyContent: "center"
                                }}
                            >
                                {
                                    CustomerProfileData != '' &&
                                    <Text style={[styles.TextStyle,{width:mobileW*15/100}]}>{CustomerProfileData.display_name[0]}</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    }
                    
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    LinearStyle: {
        width: mobileW,
        alignItems: 'center',
        elevation: 1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    MainView: {
        paddingVertical: mobileH * 2 / 100,
        flexDirection: 'row',
        alignItems: 'center',
        width: mobileW * 94 / 100,
        justifyContent: 'space-between',
     },
    BackIconView: {
        width: mobileW * 5 / 100,
        height: mobileW * 9 / 100,
        alignItems: 'center',
        justifyContent: 'center',
        left:mobileW*5/100
    },
    TextStyle: {
        lineHeight: mobileW * 5 / 100,
        marginTop: config.device_type == "ios" ? mobileW * 1.5 / 100 : 0,
        fontSize: mobileW * 4 / 100,
        textAlign: "center",
        fontFamily: Font.FontBold,
        color: Colors.whiteColor,
    },
    secondIconView: {
        width: mobileW * 8 / 100,
        height: mobileW * 8 / 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    secondIconImage: {
        width: mobileW * 7 / 100,
        height: mobileW * 7 / 100,
        right: -12
    }
})

