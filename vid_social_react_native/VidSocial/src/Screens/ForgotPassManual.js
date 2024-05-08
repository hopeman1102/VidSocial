import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal } from 'react-native'
import React, { useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, mobileH, mobileW } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { RadioButton } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';

export default function ForgotPassManual({ navigation }) {

    const [checked, setChecked] = React.useState('first');
    const [checked1, setChecked1] = React.useState('first1');
    const [modalVisible, setmodalVisible] = React.useState(false);
    const [modalVisibleVerification, setmodalVisibleVerification] = React.useState(false);
    const [RememberMe, setRememberMe] = React.useState(true);


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
                                source={localimag.Right_icon}
                            />
                            <Text style={styles.congratstxt}>{Lang_chg.passChangeCorrecttxt[config.language]}</Text>
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
                                            navigation.navigate('Login')
                                        }, 1000);
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

            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground style={styles.imageBackStyle}
                    imageStyle={{ height: mobileH, width: mobileW }}
                    source={localimag.Background}>
                    <View style={{
                        width: mobileW, height: mobileH * 8 / 100, alignItems: 'center', justifyContent: 'space-between',
                        paddingHorizontal: mobileW * 7 / 100, flexDirection: 'row'
                    }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Image
                                resizeMode='contain'
                                style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100 }}
                                source={localimag.back_icon}
                            />
                        </TouchableOpacity>
                        <Text style={{
                            width: mobileW * 65 / 100, fontSize: mobileW * 4 / 100,
                            fontFamily: Font.FontSemiBold, color: Colors.whiteColor,
                            textAlign: "center"
                        }}>{Lang_chg.forgotPass[config.language]}</Text>
                        <Image
                            resizeMode='contain'
                            style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100 }}
                        />
                    </View>
                    <Image
                        resizeMode='contain'
                        style={{
                            width: mobileW * 16 / 100, height: mobileW * 16 / 100, marginTop: mobileH * 5 / 100,
                            tintColor: Colors.whiteColor
                        }}
                        source={localimag.user_pass}
                    />

                    {/* ---- Main Container ---- */}
                    <View style={styles.mainContainer}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '30%' }}>
                            <Text style={{
                                width: mobileW * 65 / 100, fontSize: mobileW * 4.5 / 100,
                                fontFamily: Font.FontBold, color: Colors.blueColour,
                                textAlign: "center", marginTop: mobileH * 3 / 100
                            }}>{Lang_chg.Trouble1[config.language]}</Text>
                            <Text style={{
                                width: mobileW * 65 / 100, fontSize: mobileW * 3.1 / 100,
                                fontFamily: Font.FontMedium, color: Colors.darkGray,
                                textAlign: "center", marginTop: mobileH * 1 / 100
                            }}>{Lang_chg.resetPasslongtxt[config.language]}</Text>
                        </View>
                        {/* --- TextInput Email --- */}
                        <View style={styles.textAlignextInputBaseView}>
                            <Image
                                resizeMode='contain'
                                style={styles.inputImageStyle}
                                source={localimag.user_pass}
                            />
                            <TextInput
                                // value={"" + this.state.email + ""}
                                maxLength={100}
                                keyboardType='email-address'
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.Password5[config.language]}
                                // onChangeText={(txt) => { this.setState({ email: txt }) }}
                                style={styles.textInputStyle}>
                            </TextInput>
                        </View>
                        {/* --- TextInput Email --- */}
                        <View style={styles.textAlignextInputBaseView}>
                            <Image
                                resizeMode='contain'
                                style={styles.inputImageStyle}
                                source={localimag.user_pass}
                            />
                            <TextInput
                                // value={"" + this.state.email + ""}
                                maxLength={100}
                                keyboardType='email-address'
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.Repeatpassword1[config.language]}
                                // onChangeText={(txt) => { this.setState({ email: txt }) }}
                                style={styles.textInputStyle}>
                            </TextInput>
                        </View>

                        {/* --- Login Button --- */}
                        <View style={{ marginTop: mobileH * 3 / 100 }}>
                            <CommonButton onPressClick={() => setmodalVisible(true)} title={Lang_chg.RESETPASSWORD[config.language]}></CommonButton>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <Text style={styles.dontHaveAcc}
                            >{Lang_chg.Returnto[config.language]}</Text>
                            <TouchableOpacity activeOpacity={0.8}
                                onPress={() => navigation.navigate('Login')}><Text style={styles.signUptxt}> {Lang_chg.login[config.language]}</Text></TouchableOpacity>
                        </View>
                    </View>

                </ImageBackground>
            </KeyboardAwareScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackStyle: {
        height: mobileH, width: mobileW,
        alignItems: 'center'
    },
    mainContainer: {
        backgroundColor: Colors.appBackground,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        height: mobileH * 50 / 100,
        width: mobileW * 85 / 100,
        alignItems: "center",
        borderRadius: mobileW * 5 / 100,
        marginTop: mobileH * 6 / 100
    },
    textAlignextInputBaseView: {
        height: mobileW * 11 / 100,
        width: mobileW * 72 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileH * 2 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2 / 100,
    },
    inputImageStyle: {
        width: mobileW * 4.5 / 100,
        height: mobileW * 4 / 100,
        marginTop: mobileH * -0.5 / 100
    },
    textInputStyle: {
        width: mobileW * 61 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 2.8 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray
    },
    RememberForgotView: {
        height: mobileW * 12 / 100,
        width: mobileW * 73 / 100,
        // alignSelf: "center",
        // alignItems: "center",
        // justifyContent: 'space-between',
    },
    Remembertxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.grayColour,
        fontSize: mobileW * 2.6 / 100
    },
    dontHaveAcc: {
        fontFamily: Font.FontSemiBold,
        color: Colors.darkGray,
        fontSize: mobileW * 3 / 100,
        marginTop: mobileH * 2 / 100
    },
    signUptxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blueColour,
        fontSize: mobileW * 3 / 100,
        marginTop: mobileH * 2 / 100
    },
    forgotPasstxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.darkGray,
        fontSize: mobileW * 3.2 / 100,
        marginTop: mobileH * 1.5 / 100
    },
    maleFemaleTxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.grayColour,
        fontSize: mobileW * 2.6 / 100,
    },
    Modaltxt: {
        fontFamily: Font.FontRegular,
        color: Colors.darkGray,
        fontSize: mobileW * 4 / 100,
        textAlign: 'center',
        width: mobileW * 75 / 100
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
        width: "95%",
        paddingVertical: 20,
        height: mobileH * 40 / 100,
        alignItems: 'center'
    },
    congratstxt: {
        color: Colors.blackColor,
        fontSize: mobileW * 5 / 100,
        fontFamily: Font.FontSemiBold,
        alignSelf: 'center',
        width: mobileW * 50 / 100,
        marginTop: mobileH * 3 / 100,
        textAlign: 'center'
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        backgroundColor: Colors.blueColour,
        marginTop: mobileH * 5 / 100
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    }
})

