import { View, Text, StyleSheet, Image, ScrollView, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import HideWithKeyboard from 'react-native-hide-with-keyboard';
import StarRating from 'react-native-star-rating';
import { useEffect } from 'react';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import moment from 'moment';
import zone from 'moment-timezone';
export default function CustomerProfile({ navigation, route }) {

    const [CustomerRatCommData, setCustomerRatCommData] = React.useState({});
    const [CustomerInformation, setCustomerInformation] = React.useState({});
    const [activePage, setactivepage] = React.useState(0);
    const [cardTab, setCardTab] = useState("strength")
    const [modalVisible, setmodalVisible] = useState(false)
    const data = [{}, {}, {},]
    const [Comments, setComments] = useState([])
    const User_id = route.params.User_id
    const FlagUrl = route.params.FlagUrl

    const [timeZone, setTimeZone] = useState("")


    console.log('FlagUrl=================>>>>',FlagUrl);

    useEffect(() => {
        const currentTimeZone = zone.tz.guess();
        console.log('Current Time Zone YNEW:', currentTimeZone);
        setTimeZone(currentTimeZone)
      }, []);

    useFocusEffect(
        React.useCallback(() => {
            _ToGetProgileDataCalling();
            _ToGetProfileRatingComments();
        }, [])
    );

    const _ToGetProgileDataCalling = async () => {

        global.props.showLoader();

        let apiUrl = appBaseUrl.GetUserDetails + User_id;

        console.log('apiUrl----->>>',apiUrl);

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

    const _ToGetProfileRatingComments = async () => {
        global.props.showLoader();
        var TodayDate = new Date().toISOString()
        const date = new Date(TodayDate);
        date.setMonth(date.getMonth() - 1);
        var BeforeOneMonthDate = date.toISOString()
        let apiUrl = appBaseUrl.WorkerDetails;

        var postData = JSON.stringify({
            worker_id: User_id,
            from_date: BeforeOneMonthDate,
            to_date: TodayDate
        });



        console.log('postDatapostData apiUrl', postData);
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("setCustomerRatCommData--->222", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setCustomerRatCommData(response.data.data)
                    setComments(response.data.data.customer_detail)
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
                contentContainerStyle={{ paddingBottom: mobileH * 15 / 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <ImageBackground
                        // resizeMode={'cover'}
                        resizeMode={CustomerInformation.image_url_link == null ? 'contain' : 'cover'}
                        style={styles.UserFullImage}
                        imageStyle={[styles.UserFullImage, {
                        }]}
                        // source={CustomerInformation.profile_image != null ? { uri: CustomerInformation.profile_image } : localimag.person_icon}
                        source={CustomerInformation.image_url_link != null ?
                            { uri: appBaseUrl.imageUrl + CustomerInformation.image_url_link} : localimag.person_icon}

                        // source={localimag.girl3}
                    >
                        <View style={{ width: mobileW, height: mobileH * 10 / 100, alignItems: 'center', justifyContent: "space-between", flexDirection: "row", paddingHorizontal: mobileW * 5 / 100 }}>
                            <TouchableOpacity activeOpacity={0.8}
                                onPress={() => navigation.goBack()}
                                style={{ backgroundColor: '#00000070', padding: mobileW * 2 / 100, borderRadius: mobileW * 5 / 100 }}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={[styles.onlineonuserImage,{tintColor:Colors.whiteColor}]}
                                    source={localimag.back_icon}
                                />
                            </TouchableOpacity>
                            {/* <View
                                style={{ backgroundColor: '#00000070', padding: mobileW * 1 / 100, borderRadius: mobileW * 1 / 100 }}
                            >
                            <Text style={{ lineHeight: mobileW * 5 / 100, fontSize: mobileW * 4 / 100, textAlign: "center", fontFamily: Font.FontBold, color: Colors.whiteColor}}>{Lang_chg.profile[config.language]}</Text>
                            </View> */}
                            <TouchableOpacity activeOpacity={0.8}
                                onPress={() => setmodalVisible(true)}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={styles.onlineonuserImage}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* <View style={{
                            backgroundColor: '#00000080', width: mobileW * 35 / 100, height: mobileH * 5 / 100,
                            left: mobileW * 62 / 100, alignItems: "center", justifyContent: "center",
                            borderRadius: mobileW * 3 / 100, top: mobileH * 26 / 100
                        }}>
                            <Text style={[styles.userCommentName, {
                                textAlign: 'center',
                                color: Colors.whiteColor, fontSize: mobileW * 3.5 / 100
                            }]}>{Lang_chg.ID[config.language]}: {CustomerInformation.identity_no}</Text>
                        </View> */}
                    </ImageBackground>
                    <View
                        style={[styles.FlatlistBaseView]}>

                        <View style={{ height: mobileH * 9 / 100 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: mobileH * 0.5 / 100 }}>
                                <Image
                                    resizeMode='contain'
                                    style={styles.flagImage}
                                    source={{ uri: FlagUrl}}
                                />
                                <Text style={styles.userName}>   {CustomerInformation.display_name}</Text>
                            </View>
                            <View
                                style={{ flexDirection: 'row' }}
                            >
                                <Text style={[styles.userCommentName, {
                                    marginTop: mobileH * 0.5 / 100, textAlign: 'center',
                                    color: Colors.darkGray, fontSize: mobileW * 4 / 100
                                }]}>{CustomerRatCommData.rating}  </Text>
                                <StarRating
                                    containerStyle={{ width: mobileW * 20 / 100, top: mobileH * 1 / 100 }}
                                    fullStar={localimag.activeStar}
                                    halfStar={localimag.halfstar}
                                    emptyStar={localimag.deactivae_star}
                                    halfStarColor={'#FFC815'}
                                    disabled={false}
                                    maxStars={5}
                                    starSize={mobileW * 0.033}
                                    rating={CustomerRatCommData.rating}
                                // selectedStar={(rating1) => this.setState({ rating: rating1 })}
                                />

                            </View>

                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                resizeMode='contain'
                                style={styles.CommentIcon}
                                source={localimag.Heart_icon}
                            />
                            <Text style={[styles.userCommentName, {
                                textAlign: 'center',
                                color: Colors.darkGray, fontSize: mobileW * 3.5 / 100
                            }]}>  {CustomerRatCommData.like_count}    </Text>
                            <Image
                                resizeMode='contain'
                                style={styles.CommentIcon}
                                source={localimag.Chat_Icon}
                            />
                            <Text style={[styles.userCommentName, {
                                textAlign: 'center',
                                color: Colors.darkGray, fontSize: mobileW * 3.5 / 100
                            }]}>  {Comments.length}</Text>
                        </View>
                    </View>
                    {/* ------------------------------------------------------------- */}
                    <View
                        style={styles.cardView}>
                        {cardTab == 'strength' ?
                            <ImageBackground
                                resizeMode='contain'
                                imageStyle={{
                                    width: mobileW * 88 / 100,
                                    height: mobileW * 78 / 100
                                }}
                                style={{
                                    width: mobileW * 88 / 100, marginLeft: mobileW * -0.2 / 100,
                                    height: mobileW * 78 / 100
                                }}
                                source={localimag.LeftIconback}>
                                <TouchableOpacity
                                    onPress={() => setCardTab(cardTab == 'strength' ? 'cardio' : 'strength')} activeOpacity={0.8}
                                    style={{
                                        position: 'absolute', flexDirection: 'row',
                                        width: mobileW * 85 / 100, alignItems: 'center', justifyContent: 'space-around',
                                        height: mobileW * 10 / 100
                                    }}>

                                    <Text style={{
                                        fontSize: mobileW * 3.5 / 100, fontFamily: Font.FontMedium, top: mobileH * 0.5 / 100,
                                        color: cardTab == 'strength' ? Colors.Pink : Colors.darkGray
                                    }}>{Lang_chg.Information[config.language]}</Text>


                                    <Text style={{
                                        fontSize: mobileW * 3.5 / 100, fontFamily: Font.FontMedium, top: mobileH * 0.5 / 100,
                                        color: cardTab == 'cardio' ? Colors.Pink : Colors.darkGray
                                    }}>{Lang_chg.Comments1[config.language]}</Text>

                                </TouchableOpacity>

                                <View style={styles.informationBaseView}>
                                    <View style={[styles.headView, { marginTop: 0 }]}>
                                        <Text style={styles.Callsin}>{Lang_chg.Callsin30day[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerRatCommData.last_call_in_month}</Text>
                                    </View>
                                    {/* <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.PositiveComm[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerRatCommData.positive_comment_percentage}% </Text>
                                    </View> */}
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Positives[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerRatCommData.positive_comment_percentage!=null? CustomerRatCommData.positive_comment_percentage.toFixed(0):"0"}%</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Negatives[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerRatCommData.negative_comment_percentage!=null? CustomerRatCommData.negative_comment_percentage.toFixed(0):'0'}%</Text>
                                    </View>

                                    <View
                                        style={{
                                            backgroundColor: Colors.borderColour, width: mobileW * 81 / 100, height: mobileH * 0.25 / 100,
                                            marginTop: mobileH * 2 / 100
                                        }}
                                    ></View>

                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Registered[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerRatCommData.registered_date != null ? moment(CustomerRatCommData.registered_date).format('D-MMMM-YYYY') : "NA"}</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Firstcall[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerRatCommData.first_call_date != null ? moment(CustomerRatCommData.first_call_date).format('D-MMMM-YYYY') : 'NA'}</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Warnings[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerRatCommData.warnings}</Text>
                                    </View>
                                </View>

                            </ImageBackground>
                            :
                            <ImageBackground
                                resizeMode='contain'
                                imageStyle={{
                                    width: mobileW * 88.3 / 100,
                                    height: mobileW * 78 / 100
                                }}
                                style={{
                                    width: mobileW * 88 / 100, marginLeft: mobileW * -0.1 / 100,
                                    height: mobileW * 78 / 100
                                }}
                                source={localimag.RightIconback}>
                                <TouchableOpacity
                                    onPress={() => setCardTab(cardTab == 'strength' ? 'cardio' : 'strength')} activeOpacity={0.8}
                                    style={{
                                        position: 'absolute', flexDirection: 'row',
                                        width: mobileW * 85 / 100, alignItems: 'center', justifyContent: 'space-around',
                                        height: mobileW * 10 / 100
                                    }}>

                                    <Text style={{
                                        fontSize: mobileW * 3.5 / 100, fontFamily: Font.FontMedium, top: mobileH * 0.5 / 100,
                                        color: cardTab == 'strength' ? Colors.Pink : Colors.darkGray
                                    }}>{Lang_chg.Information[config.language]}</Text>


                                    <Text style={{
                                        fontSize: mobileW * 3.5 / 100, fontFamily: Font.FontMedium, top: mobileH * 0.5 / 100,
                                        color: cardTab == 'cardio' ? Colors.Pink : Colors.darkGray
                                    }}>{Lang_chg.Comments1[config.language]}</Text>

                                </TouchableOpacity>
                                {/* --------------------------------------------------------- */}

                                <View
                                    style={{ marginTop: mobileH * 5.7 / 100, height: '82%' }}>
                                    {Comments.length != 0 ?
                                        <FlatList
                                            data={Comments.reverse()}
                                            contentContainerStyle={{ paddingBottom: mobileH * 2 / 100 }}
                                            nestedScrollEnabled={true}
                                            showsVerticalScrollIndicator={false}
                                            renderItem={({ item, index }) =>
                                                <View >
                                                    <View
                                                        style={styles.UserCommentBaseView}>
                                                        <Image
                                                            resizeMode='contain'
                                                            style={styles.CommentUserImage}
                                                            source={item.profile_image == null ? localimag.person_icon : { uri:appBaseUrl.imageUrl + item.profile_image }}
                                                        >
                                                        </Image>
                                                        <View style={{ width: mobileW * 45 / 100 }}>
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Text style={styles.userCommentName}>{item.name}</Text>
                                                            </View>
                                                            <Text style={styles.dateTimeTxt}>{moment(item.create_date).clone().tz(timeZone).format('MMM DD, hh:mm A')}</Text>
                                                        </View>
                                                        <StarRating
                                                            containerStyle={{ width: mobileW * 18 / 100, top: mobileH * 0.5 / 100 }}
                                                            fullStar={localimag.activeStar}
                                                            halfStar={localimag.halfstar}
                                                            emptyStar={localimag.deactivae_star}
                                                            halfStarColor={'#FFC815'}
                                                            disabled={false}
                                                            maxStars={5}
                                                            starSize={mobileW * 0.028}
                                                            rating={item.rating}
                                                        />
                                                    </View>
                                                    <View
                                                        style={[styles.UserCommentdataView, { paddingHorizontal: mobileW * 17.5 / 100 }]}
                                                    >
                                                        <View style={{ width: mobileW * 60 / 100 }}>
                                                            <View style={{ flexDirection: "row" }}>
                                                                <Text style={styles.commentDatatxt}>{item.comment} </Text>
                                                                {/* {item.comment.length > 35 &&
                                                                    <TouchableOpacity
                                                                        activeOpacity={0.8}
                                                                    >
                                                                        <Text style={[styles.commentDatatxt, { color: Colors.blueColour, textDecorationLine: 'underline' }]}> More</Text></TouchableOpacity>
                                                                } */}
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            } />
                                        :
                                         <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height:'100%' }}>
                                            <Image resizeMode='contain' style={{ width: mobileW *80 / 100, height: mobileH * 15 / 100, marginBottom: mobileW * 7 / 100 }}
                                                source={localimag.nodata}
                                            >
                                            </Image>

                                        </View>
                                    }
                                </View>
                                {/* --------------------------------------------------------- */}
                            </ImageBackground>
                        }
                    </View>
                    {/* -------------------------------------------------- */}
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
        // width: mobileW * 88 / 100,
        // borderWidth: mobileW * 0.2 / 100,
        // borderRadius: mobileW * 3.5 / 100,
        // borderColor: Colors.whiteColor,
        marginTop: mobileW * 2 / 100,
        // backgroundColor: Colors.whiteColor,
        alignSelf: "center"
    },
    UserFullImage: {
        width: mobileW,
        height: mobileH * 45 / 100,
    },
    FlatlistBaseView: {
        width: mobileW * 90 / 100,
        alignSelf: 'center',
        flexDirection: 'row',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 3 / 100,
        marginTop: mobileH * 1 / 100
    },
    UserCommentBaseView: {
        width: mobileW * 85 / 100,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 2 / 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 2 / 100,
        marginTop: mobileH * 1 / 100,
        alignSelf: "center",
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
    CommentUserImage: {
        width: mobileW * 10 / 100,
        height: mobileW * 10 / 100,
        borderRadius: mobileW * 5 / 100,
        borderWidth:mobileW*0.3/100,
        borderColor:Colors.blueColour,
        backgroundColor:Colors.whiteColor
    },
    onlineonuserImage: {
        width: mobileW * 5 / 100,
        height: mobileW * 5 / 100,
    },
    flagImage: {
        width: mobileW * 5 / 100,
        height: mobileW * 5 / 100
    },
    userName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 4.5 / 100
    },
    userCommentName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 3.3 / 100
    },
    HeaderSettings: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 3.7 / 100,
        textDecorationLine: 'underline'
    },
    HeaderSettings1: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 3.7 / 100,
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
        fontSize: mobileW * 2.8 / 100
    },
    commentDatatxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.darkGray,
        fontSize: mobileW * 2.7 / 100
    },
    cameraIcon: {
        width: mobileW * 7.8 / 100,
        height: mobileW * 7.8 / 100
    },
    CommentIcon: {
        width: mobileW * 5 / 100,
        height: mobileW * 5 / 100
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
        width: mobileW * 0.42,
        color: Colors.Pink,
        textAlign: 'center',
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 0.035,
    },
    aboutTxt1:
    {
        // backgroundColor: 'pink',
        width: mobileW * 0.42,
        color: Colors.darkGray,
        textAlign: 'center',
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 0.035
    },
    informationBaseView: {
        alignSelf: 'center',
        width: mobileW * 87 / 100,
        paddingVertical: mobileH * 0.5 / 100,
        marginTop: mobileH * 8.5 / 100,
        borderRadius: mobileW * 3 / 100,
        alignItems: 'center',

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
        marginTop: mobileH * 1.3 / 100
    },
    VerticalLine: {
        width: mobileW * 0.3 / 100,
        height: mobileH * 12 / 100,
        backgroundColor: Colors.borderColour
    },
    ModalMainView: {
        backgroundColor: "#00000080",
        flex: 1,
        paddingHorizontal: 20
    },
    ModalheadView: {
        backgroundColor: Colors.appBackground,
        alignSelf: 'flex-end',
        right: 40,
        borderRadius: mobileW * 1 / 100,
        top: mobileH * 3 / 100,
        width: "65%",
        height: mobileH * 50 / 100,
        alignItems: 'center',
        borderColor: Colors.Pink,
        borderWidth: mobileW * 0.3 / 100
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
})

