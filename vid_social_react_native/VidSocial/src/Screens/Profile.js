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
import { UserLoginPermission } from './UserLoginPermission';

export default function Profile({ navigation }) {

    const [CustomerProfileData, setCustomerProfileData] = React.useState({});
    const [CustomerInformation, setCustomerInformation] = React.useState({});
    const [CommentCustomer, setCommentCustomer] = React.useState([]);
    const [cardTab, setCardTab] = useState("strength")
    const [modalVisible, setmodalVisible] = useState(false)
    const data = [{}, {}, {},]
    const [activePage, setactivePage] = useState(0)

    const [NegativeComments, setNegativeComments] = useState([])
    const [PositiveComments, setPositiveComments] = useState([])
    const [AllCustomer, setAllCustomer] = useState([])
    const [timeZone, setTimeZone] = useState("")

    useEffect(() => {
        const currentTimeZone = zone.tz.guess();
        console.log('Current Time Zone YNEW:', currentTimeZone);
        setTimeZone(currentTimeZone)
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            getUSerData();
            _ToGetProgileDataCalling();
            UserLoginPermission({ navigation })
        }, [])
    );



    const getUSerData = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        console.log('UserDataTome', UserData);
        setCustomerProfileData(UserData)
    }

    const _ToGetProgileDataCalling = async () => {
        var Token = await localStorage.getItemString("AccessToken")
        var UserDataToGet = await localStorage.getItemObject("UserData")
        var UserId = UserDataToGet.id
        console.log(Token);
        global.props.showLoader();

        // console.log(new Date().toISOString().replace('T', ' '))
        var TodayDate = new Date().toISOString()
        const date = new Date(TodayDate);
        date.setMonth(date.getMonth() - 1);
        // November 10, 2021: year decreased by 1
        var BeforeOneMonthDate = date.toISOString()
        let apiUrl = appBaseUrl.WorkerDetails;

        var postData = JSON.stringify({
            worker_id: UserId,
            from_date: BeforeOneMonthDate,
            to_date: TodayDate
        });
        console.log('===================================>>>>', apiUrl);
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
                // Handle the successful response
                console.log("setCustomerInformation--->1111111", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setCustomerInformation(response.data.data)
                    setCommentCustomer(response.data.data.customer_detail.reverse())
                    setAllCustomer(response.data.data.customer_detail)
                    var Comments = response.data.data.customer_detail
                    var PositiveComm = []
                    var NegativeComm = []
                    // -------- Sort Comments Data --------
                    for (let i = 0; i < Comments.length; i++) {
                        if (Comments[i].rating >= 3) {
                            PositiveComm.push(Comments[i])
                            setPositiveComments(PositiveComm)
                        }
                        if (Comments[i].rating < 3) {
                            NegativeComm.push(Comments[i])
                            setNegativeComments(NegativeComm)
                        }
                    }
                    setactivePage(0)
                    // setCommentCustomer   rating
                    console.log("setCustomerInformation--->222", response.data.access);


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
                        resizeMode={CustomerProfileData.image_url_link == null ? 'contain' : 'cover'}
                        style={styles.UserFullImage}
                        imageStyle={[styles.UserFullImage, {
                        }]}
                        source={CustomerProfileData.image_url_link == null ? localimag.person_icon : { uri: appBaseUrl.imageUrl + CustomerProfileData.image_url_link }}

                    // source={localimag.girl3}
                    >
                        <View style={{ width: mobileW, height: mobileH * 10 / 100, alignItems: 'center', justifyContent: "space-between", flexDirection: "row", paddingHorizontal: mobileW * 5 / 100 }}>
                            <TouchableOpacity activeOpacity={0.8}
                                onPress={() => navigation.goBack()}
                                style={{ backgroundColor: '#00000070', padding: mobileW * 2 / 100, borderRadius: mobileW * 5 / 100 }}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={[styles.onlineonuserImage, { tintColor: Colors.whiteColor }]}
                                    source={localimag.back_icon}
                                />
                            </TouchableOpacity>

                            {/* <View
                                style={{ backgroundColor: '#00000070', padding: mobileW * 1 / 100, borderRadius: mobileW * 1 / 100 }}
                            >
                                <Text style={{
                                    lineHeight: mobileW * 5 / 100, fontSize: mobileW * 4 / 100,
                                    textAlign: "center", fontFamily: Font.FontBold, color: Colors.whiteColor
                                }}>{Lang_chg.profile[config.language]}</Text>
                            </View> */}

                            <TouchableOpacity activeOpacity={0.8}
                                onPress={() => navigation.navigate('Setting')
                                    // setmodalVisible(true)
                                }
                                style={{ backgroundColor: '#00000070', padding: mobileW * 2 / 100, borderRadius: mobileW * 5 / 100 }}
                            >
                                <Image
                                    resizeMode='contain'
                                    style={[styles.onlineonuserImage, { tintColor: Colors.whiteColor }]}
                                    source={localimag.icon_setting}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* <View style={{
                            backgroundColor: '#00000080', width: mobileW * 35 / 100, height: mobileH * 5 / 100,
                            left: mobileW * 62 / 100, alignItems: "center", justifyContent: "center",
                            borderRadius: mobileW * 3 / 100
                        }}>
                            <Text style={[styles.userCommentName, {
                                textAlign: 'center',
                                color: Colors.whiteColor, fontSize: mobileW * 3.5 / 100
                            }]}>{Lang_chg.ID[config.language]} : {CustomerProfileData.identity_no}</Text>
                        </View> */}
                    </ImageBackground>
                    <View
                        style={[styles.FlatlistBaseView]}>

                        <View style={{ height: mobileH * 9 / 100 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: mobileH * 0.5 / 100 }}>
                                <Image
                                    resizeMode='contain'
                                    style={styles.flagImage}
                                    // source={localimag.flagonimage}
                                    source={{ uri: CustomerProfileData.country_flag }}
                                />
                                <Text style={styles.userName}>  {CustomerProfileData.display_name}</Text>
                            </View>
                            <View
                                style={{ flexDirection: 'row' }}
                            >
                                <Text style={[styles.userCommentName, {
                                    marginTop: mobileH * 0.5 / 100, textAlign: 'center',
                                    color: Colors.darkGray, fontSize: mobileW * 4 / 100
                                }]}>{CustomerInformation.rating}  </Text>
                                <StarRating
                                    containerStyle={{ width: mobileW * 20 / 100, top: mobileH * 1 / 100 }}
                                    fullStar={localimag.activeStar}
                                    halfStar={localimag.halfstar}
                                    emptyStar={localimag.deactivae_star}
                                    halfStarColor={'#FFC815'}
                                    disabled={false}
                                    maxStars={5}
                                    starSize={mobileW * 0.033}
                                    rating={CustomerInformation.rating}
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
                            }]}>  {CustomerInformation.like_count}    </Text>
                            <Image
                                resizeMode='contain'
                                style={styles.CommentIcon}
                                source={localimag.Chat_Icon}
                            />
                            <Text style={[styles.userCommentName, {
                                textAlign: 'center',
                                color: Colors.darkGray, fontSize: mobileW * 3.5 / 100
                                // }]}>  {CustomerInformation.customer_detail.length}</Text>
                            }]}>  {CommentCustomer.length}</Text>
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

                                {/* <View style={styles.informationBaseView}>
                                    <View style={[styles.headView, { marginTop: 0 }]}>
                                        <Text style={styles.Callsin}>{Lang_chg.Callsin30day[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>50</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.PositiveComm[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>100% </Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Positives[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>50</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Negatives[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>0</Text>
                                    </View>

                                    <View
                                        style={{
                                            backgroundColor: Colors.borderColour, width: mobileW * 81 / 100, height: mobileH * 0.25 / 100,
                                            marginTop: mobileH * 2 / 100
                                        }}
                                    ></View>

                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Registered[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>10 December2023</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Firstcall[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>12 December2023</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Warnings[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>0</Text>
                                    </View>
                                </View> */}
                                <View style={styles.informationBaseView}>
                                    <View style={[styles.headView, { marginTop: 0 }]}>
                                        <Text style={styles.Callsin}>{Lang_chg.Callsin30day[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.last_call_in_month}</Text>
                                    </View>
                                    {/* <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.PositiveComm[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.positive_comment_percentage}% </Text>
                                    </View> */}
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Positives[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.positive_comment_percentage != null ? CustomerInformation.positive_comment_percentage.toFixed(0) : '0'}%</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Negatives[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.negative_comment_percentage != null ? CustomerInformation.negative_comment_percentage.toFixed(0) : '0'}%</Text>
                                    </View>

                                    <View
                                        style={{
                                            backgroundColor: Colors.borderColour, width: mobileW * 81 / 100, height: mobileH * 0.25 / 100,
                                            marginTop: mobileH * 2 / 100
                                        }}
                                    ></View>

                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Registered[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.registered_date != null ? moment(CustomerInformation.registered_date).format('D-MMMM-YYYY') : "NA"}</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Firstcall[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.first_call_date != null ? moment(CustomerInformation.first_call_date).format('D-MMMM-YYYY') : 'NA'}</Text>
                                    </View>
                                    <View style={styles.headView}>
                                        <Text style={styles.Callsin}>{Lang_chg.Warnings[config.language]}</Text>
                                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.warnings}</Text>
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
                                    }}>{Lang_chg.Comments[config.language]}</Text>

                                </TouchableOpacity>
                                {/* --------------------------------------------------------- */}
                                <View
                                    style={{ marginTop: mobileH * 5.7 / 100, height: '82%' }}>
                                    {/* ----  ---- */}
                                    <View style={{
                                        flexDirection: "row", justifyContent: "space-between",
                                        alignItems: 'center', marginHorizontal: mobileW * 0.02,
                                        marginTop: mobileW * 0.02
                                    }}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => { setCommentCustomer(AllCustomer), setactivePage(0) }}
                                        >
                                            {activePage == 0 ?
                                                <Text style={styles.aboutTxt}>{Lang_chg.AllComments[config.language]}</Text>
                                                :
                                                <Text style={styles.aboutTxt1}>{Lang_chg.AllComments[config.language]}</Text>
                                            }
                                        </TouchableOpacity>

                                        {/* dash-------------------------------------- */}
                                        <View style={{
                                            backgroundColor: '#ccc', width: mobileW * 0.002,
                                            height: mobileH * 0.05
                                        }} />
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => { setCommentCustomer(PositiveComments), setactivePage(1) }}
                                        >
                                            {activePage == 1 ?
                                                <Text style={styles.aboutTxt}>{Lang_chg.PositiveComments[config.language]}</Text>
                                                :
                                                <Text style={styles.aboutTxt1}>{Lang_chg.PositiveComments[config.language]}</Text>
                                            }
                                        </TouchableOpacity>

                                        {/* dash-------------------------------------------*/}
                                        <View style={{
                                            backgroundColor: '#ccc', width: mobileW * 0.002,
                                            height: mobileH * 0.05
                                        }} />
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => { setCommentCustomer(NegativeComments), setactivePage(2) }}
                                        >
                                            {activePage == 2 ?
                                                <Text style={styles.aboutTxt}>{Lang_chg.NegativeComment[config.language]}</Text>
                                                :
                                                <Text style={styles.aboutTxt1}>{Lang_chg.NegativeComment[config.language]}</Text>
                                            }
                                        </TouchableOpacity>

                                    </View>
                                    {CommentCustomer.length != 0 ?
                                        <FlatList
                                            data={CommentCustomer}
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
                                                            source={item.profile_image == null ? localimag.person_icon : { uri: appBaseUrl.imageUrl + item.profile_image }}
                                                        >
                                                        </Image>
                                                        <View style={{ width: mobileW * 45 / 100 }}>
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Text style={styles.userCommentName}>{item.name}</Text>
                                                            </View>
                                                            {/* <Text style={styles.dateTimeTxt}>{zone.tz(moment(moment().format(item.create_date)),timeZone).format('MMM DD, hh:mm A')}</Text> */}

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
                                                                {/* {CommentCustomer.length > 35 &&
                                                                     <TouchableOpacity
                                                                         activeOpacity={0.8}>
                                                                        <Text style={[styles.commentDatatxt, { color: Colors.blueColour, textDecorationLine: 'underline' }]}> More</Text></TouchableOpacity>
                                                                } */}
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            } />
                                        :
                                        <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: '100%' }}>
                                            <Image resizeMode='contain' style={{ width: mobileW * 80 / 100, height: mobileH * 15 / 100, marginBottom: mobileW * 7 / 100 }}
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


            <Footer
                activepage='Profile'
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
        alignSelf: "center"
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
        fontFamily: Font.FontMedium,
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
        width: mobileW * 0.20,
        color: Colors.Pink,
        textAlign: 'center',
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 0.030,
    },
    aboutTxt1:
    {
        // backgroundColor: 'pink',
        width: mobileW * 0.20,
        color: Colors.darkGray,
        textAlign: 'center',
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 0.030
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

