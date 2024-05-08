import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, ScrollView, RefreshControl } from 'react-native'
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
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

export default function PaymentHistory({ navigation }) {

    const data = [
        { Amount: 0, Incurrency: 0 }
    ]
    const [refresh, setrefresh] = useState(false)
    const [GetallCoinstoshow, setGetallCoinstoshow] = useState('NA')
    const [activePage, setactivePage] = useState(0)

    const [InPaidData, setInPaidData] = useState([])
    const [InProcessData, setInProcessData] = useState([])
    const [CancelData, setCancelData] = useState([])

    const [TotalInProcessCount, setTotalInProcessCount] = useState(0)
    const [TotalPaidCount, setTotalPaidCount] = useState(0)
    const [TotalCancelCount, setTotalCancelCount] = useState(0)
    const [ReceiptModal, setReceiptModal] = React.useState(false);
    const [ReceiptData, setReceiptData] = React.useState({});

    useFocusEffect(
        React.useCallback(() => {
            GetallCoins()
        }, [])
    );

    const GetallCoins = async () => {
        var Token = await localStorage.getItemString("AccessToken")
        global.props.showLoader();
        let apiUrl = appBaseUrl.GetPaymentHistory;

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                // Handle the successful response   request_status
                console.log("LoginResponse--->222", response);
                if (response.data.code == 200) {
                    global.props.hideLoader();

                    var InprogreddData = []
                    var InProcessCount = 0
                    var PaidData = []
                    var InPaidCount = 0
                    var CancelleddData = []
                    var CancelCount = 0
                    var AllData = response.data.data
                    for (let i = 0; i < AllData.length; i++) {
                        if (AllData[i].request_status === 'draft') {
                            InprogreddData.push(AllData[i])
                            InProcessCount += Number(AllData[i].amount)
                        }
                        if (AllData[i].request_status === 'inprocess') {
                            CancelleddData.push(AllData[i])
                            CancelCount += Number(AllData[i].amount)
                        }
                        if (AllData[i].request_status === 'paid') {
                            PaidData.push(AllData[i])
                            InPaidCount += Number(AllData[i].amount)
                        }
                    }

                    setactivePage(0)

                    setInProcessData(CancelleddData)
                    setInPaidData(PaidData)
                    setCancelData(InprogreddData)

                    setGetallCoinstoshow(InprogreddData)
                    
                    setTotalInProcessCount(InProcessCount)
                    setTotalPaidCount(InPaidCount)
                    setTotalCancelCount(CancelCount)

                    setrefresh(false)

                } else {
                    global.props.hideLoader();
                    setrefresh(false)
                    setGetallCoinstoshow('')
                    setInProcessData('')
                    setInPaidData('')
                    setCancelData('')
                    // alert(response.data.error)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---22', error);
                // Handle errors
            });
    }

    const onRefresh = async () => {
        setrefresh(true)
        setTimeout(() => {
            GetallCoins()
        }, 200);
    }


    console.log('GetallCoinstoshow--------',GetallCoinstoshow);

    return (
        <View style={styles.container}>

            {/* ---- Withdraw Credits Modal Start ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={ReceiptModal}
                onRequestClose={() => { setReceiptModal(!ReceiptModal) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.girlHeadercolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadViewForWithdraw}>

                            <View
                                style={styles.ModalHeaderView}
                            >
                                <View>
                                    <Text
                                        style={[styles.Callsin, {
                                            fontSize: mobileW * 5 / 100,
                                            fontFamily: Font.FontSemiBold
                                        }]}
                                    >{Lang_chg.PaymentReceipt[config.language]}</Text>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setReceiptModal(false)}
                                >
                                    <Image
                                        resizeMode='contain'
                                        style={styles.dollarImage}
                                        source={localimag.close}
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* -------------------------- */}
                            <View
                                style={[styles.LowerDataView, { marginTop: mobileH * 2 / 100 }]}
                            >
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3.5 / 100,
                                        fontFamily: Font.FontSemiBold,
                                        color: Colors.blackColor
                                    }]}
                                >{Lang_chg.Method[config.language]}</Text>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3 / 100,
                                        fontFamily: Font.FontMedium,
                                        color: Colors.grayColour
                                    }]}
                                > {ReceiptData.type}</Text>
                            </View>
                            {/* -------------------------- */}
                            <View
                                style={[styles.LowerDataView, {}]}
                            >
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3.5 / 100,
                                        fontFamily: Font.FontSemiBold,
                                        color: Colors.blackColor
                                    }]}
                                >{Lang_chg.PaymentRequestDate[config.language]} </Text>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3 / 100,
                                        fontFamily: Font.FontMedium,
                                        color: Colors.grayColour
                                    }]}
                                > {moment(ReceiptData.request_date).format('DD-MM-YYYY')}</Text>
                            </View>

                            {/* -------------------------- */}
                            <View
                                style={[styles.LowerDataView, {}]}
                            >
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3.5 / 100,
                                        fontFamily: Font.FontSemiBold,
                                        color: Colors.blackColor
                                    }]}
                                >{Lang_chg.PaymentReceiveDate[config.language]} </Text>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3 / 100,
                                        fontFamily: Font.FontMedium,
                                        color: Colors.grayColour
                                    }]}
                                > {ReceiptData.paid_date != null ? moment(ReceiptData.paid_date).format('DD-MM-YYYY') : 'NA'}</Text>
                            </View>
                            {/* -------------------------- */}
                            <View
                                style={[styles.LowerDataView, {}]}
                            >
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3.5 / 100,
                                        fontFamily: Font.FontSemiBold,
                                        color: Colors.blackColor
                                    }]}
                                >{Lang_chg.RequestedAmount[config.language]} </Text>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3 / 100,
                                        fontFamily: Font.FontMedium,
                                        color: Colors.grayColour
                                    }]}
                                >$ {ReceiptData.amount}</Text>
                            </View>

                            <Image
                                resizeMode='contain'
                                style={styles.PaidImage}
                                source={ReceiptData.receipts_image != null ? { uri:appBaseUrl.imageUrl +  ReceiptData.receipts_image } : localimag.person_icon}
                            />

                            {/* ------------------------- */}
                            {/* <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={styles.OkButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setReceiptModal(!ReceiptModal)
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.Oktxt}>OKAY</Text>
                                </TouchableOpacity>
                            </LinearGradient> */}
                        </View>
                    </View>
                </View>
            </Modal>
            {/* ---- Withdraw Credits Modal End ---- */}


            <Header
                backIcon={true}
                navigation={navigation}
                title={Lang_chg.Payment_historyCap[config.language]}
                firstImage={localimag.back_icon}
            ></Header>
            {/* ----  ---- */}
            <View style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: 'center', marginHorizontal: mobileW * 0.04,
                marginTop: mobileW * 0.04
            }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { setGetallCoinstoshow(InProcessData), setactivePage(2) }}
                >
                    {activePage == 2 ?
                        <Text style={styles.aboutTxt}>{Lang_chg.Inprocess[config.language]}{'\n'}{TotalCancelCount}</Text>
                        :
                        <Text style={styles.aboutTxt1}>{Lang_chg.Inprocess[config.language]}{'\n'}{TotalCancelCount}</Text>
                    }
                </TouchableOpacity>

                {/* dash-------------------------------------- */}
                <View style={{
                    backgroundColor: '#ccc', width: mobileW * 0.002,
                    height: mobileH * 0.05
                }} />
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { setGetallCoinstoshow(CancelData), setactivePage(0) }}
                >
                    {activePage == 0 ?
                        <Text style={styles.aboutTxt}>{Lang_chg.Draft[config.language]}{'\n'}{TotalInProcessCount}</Text>
                        :
                        <Text style={styles.aboutTxt1}>{Lang_chg.Draft[config.language]}{'\n'}{TotalInProcessCount}</Text>
                    }
                </TouchableOpacity>

                {/* dash-------------------------------------------*/}
                <View style={{
                    backgroundColor: '#ccc', width: mobileW * 0.002,
                    height: mobileH * 0.05
                }} />
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { setGetallCoinstoshow(InPaidData), setactivePage(1) }}
                >
                    {activePage == 1 ?
                        <Text style={styles.aboutTxt}>{Lang_chg.Paid[config.language]}{'\n'}{TotalPaidCount}</Text>
                        :
                        <Text style={styles.aboutTxt1}>{Lang_chg.Paid[config.language]}{'\n'}{TotalPaidCount}</Text>
                    }
                </TouchableOpacity>

            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: mobileH * 5 / 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refresh}
                        onRefresh={onRefresh}
                        tintColor={Colors.Pink}
                        colors={[Colors.Pink]}
                    />
                }>
                {
                    GetallCoinstoshow != '' ?
                        <View style={{ marginTop: 5 }}>
                            <FlatList
                                data={GetallCoinstoshow}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: mobileH * 15 / 100 }}
                                renderItem={({ item, index }) =>
                                    <View style={styles.informationBaseView}>
                                        <View style={{ flexDirection: "row" }}>
                                            <ImageBackground
                                                imageStyle={{
                                                    width: mobileW * 10.5 / 100,
                                                    height: mobileW * 10.5 / 100
                                                }}
                                                style={{
                                                    width: mobileW * 10.5 / 100,
                                                    height: mobileW * 10.5 / 100,
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                source={localimag.Rectangle}
                                            >
                                                {item.request_status == 'draft' &&
                                                    <Image
                                                        resizeMode='contain'
                                                        style={styles.TickImage}
                                                        source={localimag.Info}
                                                    />
                                                }
                                                {item.request_status == 'inprocess' &&
                                                    <Image
                                                        resizeMode='contain'
                                                        style={styles.TickImage}
                                                        source={localimag.Info}
                                                    />
                                                }
                                                {item.request_status == 'cancel' &&
                                                    <Image
                                                        resizeMode='contain'
                                                        style={styles.TickImage}
                                                        source={localimag.PaymentFailed}
                                                    />
                                                }
                                                {item.request_status == 'paid' &&
                                                    <Image
                                                        resizeMode='contain'
                                                        style={styles.TickImage}
                                                        source={localimag.Tick}
                                                    />
                                                }
                                                {item.request_status == 'accepted' &&
                                                    <Image
                                                        resizeMode='contain'
                                                        style={styles.TickImage}
                                                        source={localimag.Tick}
                                                    />
                                                }

                                            </ImageBackground>
                                            <View style={styles.headView}>
                                            {item.request_status == 'draft' ?
                                                <Text style={[styles.Callsin, { fontSize: mobileW * 3.2 / 100 }]}>{'Requested payment'}</Text>
                                                :
                                                <Text style={[styles.Callsin, { fontSize: mobileW * 3.2 / 100 }]}>{item.request_status}</Text>}
                                                <Text style={[styles.Callsin, { fontSize: mobileW * 2.8 / 100, color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{Lang_chg.Requeston[config.language]} {moment(item.request_date).format('DD-MM-YYYY')}</Text>
                                            </View>
                                            <View style={styles.headView1}>
                                                <Text style={styles.Callsin}>$ {item.amount}</Text>
                                                <Text style={[styles.Callsin, { fontSize: mobileW * 2.6 / 100, color: Colors.grayColour }]}>{item.type}</Text>
                                            </View>
                                        </View>
                                        {(item.request_status == 'paid') &&
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => { setReceiptData(item), setReceiptModal(!ReceiptModal) }}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: "center", top: mobileH * 1 / 100,
                                                    alignSelf: 'flex-start'
                                                }}>
                                                <Image
                                                    resizeMode='contain'
                                                    style={styles.TickImage}
                                                    source={localimag.eye}
                                                />
                                                <Text style={styles.Callsin}>  {Lang_chg.ViewReceipt[config.language]}</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                } />
                        </View>
                        :
                        <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: mobileH * 80 / 100, }}>
                            <Image resizeMode='contain' style={{ width: mobileW * 80 / 100, height: mobileH * 20 / 100, marginBottom: mobileW * 40 / 100 }}
                                source={localimag.nodata}
                            >
                            </Image>

                        </View>
                }
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
    TickImage: {
        width: mobileW * 6.5 / 100,
        height: mobileW * 6.5 / 100,
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
        paddingHorizontal: mobileW * 3 / 100,
        justifyContent: 'space-between',
    },
    headView: {
        width: mobileW * 52 / 100,
        paddingHorizontal: mobileW * 3 / 100
    },
    headView1: {
        alignItems: 'flex-end',
        width: mobileW * 22 / 100,
    },
    Callsin: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 3 / 100
    },
    aboutTxt:
    {
        // backgroundColor: 'yellow',
        width: mobileW * 0.25,
        color: Colors.Pink,
        textAlign: 'center',
        fontFamily: Font.FontSemiBold,
        fontSize: mobileW * 0.04,
    },
    aboutTxt1:
    {
        //backgroundColor: 'pink',
        width: mobileW * 0.25,
        color: Colors.blackColor,
        textAlign: 'center',
        fontFamily: Font.FontSemiBold,
        fontSize: mobileW * 0.04
    },
    ModalMainView: {
        backgroundColor: "#00000080",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20
    },
    ModalheadViewForWithdraw: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: mobileW * 6 / 100,
        width: "100%",
        height: mobileH * 80 / 100,
        alignItems: 'center'
    },
    ModalHeaderView: {
        width: '100%', height: mobileH * 11 / 100,
        borderBottomWidth: mobileW * 0.3 / 100,
        borderBottomColor: Colors.grayColour,
        alignItems: "center",
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        justifyContent: 'space-between'
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
        marginTop: mobileH * 6 / 100,
        alignItems: "center"
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
    LowerDataView: {
        width: mobileW * 90 / 100,
        height: mobileH * 5 / 100,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        justifyContent: 'space-between'
    },
    PaidImage: {
        top: mobileH * 2 / 100,
        width: mobileW * 80 / 100,
        height: mobileW * 60 / 100,
        borderWidth:mobileW*0.2/100,
        borderColor:Colors.Pink
    },
})

