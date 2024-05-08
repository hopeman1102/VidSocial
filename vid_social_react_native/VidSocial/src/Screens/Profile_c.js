import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import HideWithKeyboard from 'react-native-hide-with-keyboard';
import StarRating from 'react-native-star-rating';
import { ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { UserLoginPermission } from './UserLoginPermission';
export default function Profile_c({ navigation }) {

    const [CustomerProfileData, setCustomerProfileData] = React.useState({});
    const [CustomerInformation, setCustomerInformation] = React.useState({});

    const data = [{}, {}, {},]

    useFocusEffect(
        React.useCallback(() => {
            _ToGetProgileDataCalling()
            UserLoginPermission({ navigation })
            getUSerData();
        }, [])
      );

    const getUSerData = async () => {
        var UserData = await localStorage.getItemObject("UserData")
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
        let apiUrl = appBaseUrl.CustomerDetails;

        var postData = JSON.stringify({
            worker_id: UserId,
            from_date: BeforeOneMonthDate,
            to_date: TodayDate
        });

        console.log(apiUrl,'postDatapostData', postData);
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        console.log();

        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("ProfileData --->222", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setCustomerInformation(response.data.data)
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

    console.log('CustomerProfileData.country_flag------>>>>>>>>>',CustomerProfileData.country_flag);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: mobileH * 10 / 100 }}
                showsHorizontalScrollIndicator={false}>
                <ImageBackground
                    resizeMode={CustomerProfileData.image_url_link == null ? 'contain' : 'cover'}
                    // resizeMode={ 'cover'}
                    style={styles.UserFullImage}
                    imageStyle={[styles.UserFullImage, {
                    }]}
                    source={CustomerProfileData.image_url_link == null ? localimag.person_icon : {uri : appBaseUrl.imageUrl + CustomerProfileData.image_url_link} }
                    // source={ localimag.boy2 }
                >
                    <View style={styles.HeaderBaseView}>
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
                        <Text style={{ lineHeight: mobileW * 5 / 100, fontSize: mobileW * 4 / 100, textAlign: "center", fontFamily: Font.FontBold, color: Colors.whiteColor  }}>{Lang_chg.profile[config.language]}</Text>
                        </View> */}
                        <TouchableOpacity activeOpacity={0.8}
                            onPress={() => navigation.navigate('Setting')}
                            style={{ backgroundColor: '#00000070', padding: mobileW * 2 / 100, borderRadius: mobileW * 5 / 100 }}
                        >
                            <Image
                                resizeMode='contain'
                                style={[styles.onlineonuserImage,{tintColor:Colors.whiteColor}]}
                                source={localimag.icon_setting}
                            />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                {/* ----  ---- */}

                <View
                    style={[styles.FlatlistBaseView]}>

                    <View style={{ height: mobileH * 6 / 100 }}>
                        <View style={{ flexDirection: "row",alignSelf:'center', alignItems: "center", marginTop: mobileH * 0.5 / 100 }}>
                            <Image
                                resizeMode='contain'
                                style={styles.flagImage}
                                source={{uri:CustomerProfileData.country_flag}}
                            />
                            <Text style={styles.userName}>   {CustomerProfileData.display_name}</Text>
                        </View>

                        {/* <Text style={[styles.dateTimeTxt, {textAlign:'center', marginTop: mobileH * 0.5 / 100, textAlign: 'center' }]}>{Lang_chg.ID[config.language]} : {CustomerProfileData.identity_no}</Text> */}
                    </View>
                    {/* <Image
                        resizeMode='contain'
                        style={styles.cameraIcon}
                    /> */}

                </View>
                {/* ----  ---- */}

                <View style={{
                    width: mobileW,
                    height: mobileH * 5 / 100
                }}>
                    <Text style={styles.aboutTxt}>{Lang_chg.Information[config.language]}</Text>
                </View>

                <View style={styles.informationBaseView}>
                    <View style={[styles.headView, { marginTop: 0 }]}>
                        <Text style={styles.Callsin}>{Lang_chg.Callsin30day[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.last_call_in_month}</Text>
                    </View>
                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Averagetime[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.average_call_duration+' (minutes)'}</Text>
                        {/* <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>45minute(s)</Text> */}
                    </View>
                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Credits[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>$ {CustomerInformation.credits}</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: Colors.borderColour, width: mobileW * 81 / 100, height: mobileH * 0.25 / 100,
                            marginTop: mobileH * 2 / 100
                        }}
                    ></View>

                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Registered[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>
                        {CustomerInformation.registered_date != null ? moment(CustomerInformation.registered_date).format('D-MMMM-YYYY') : 'NA'}</Text>
                    </View>
                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Firstcall[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>
                        {CustomerInformation.first_call_date != null ? moment(CustomerInformation.first_call_date).format('D-MMMM-YYYY') : 'NA'}</Text>
                    </View>
                    <View style={styles.headView}>
                        <Text style={styles.Callsin}>{Lang_chg.Warnings[config.language]}</Text>
                        <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>{CustomerInformation.warning}</Text>
                    </View>
                </View>
            </ScrollView>
            <Footer
                activepage='Profile_c'
                usertype={1}
                footerpage={[
                    { name: 'Home_c', pageName:  Lang_chg.Home[config.language], countshow: false, image: require('../Icons/Home_icon.png'), activeimage: require('../Icons/Home_icon.png') },

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
    cardView: {
        width: mobileW * 85 / 100,
        borderWidth: mobileW * 0.2 / 100,
        borderRadius: mobileW * 3.5 / 100,
        borderColor: Colors.mediumDarkGrey,
        marginTop: mobileW * 8 / 100,
        backgroundColor: Colors.whiteColor
    },
    HeaderBaseView: {
        width: mobileW,
        height: mobileH * 10 / 100,
        alignItems: 'center',
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: mobileW * 5 / 100
    },
    FlatlistBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 4 / 100,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: mobileW * 3 / 100,
        marginTop: mobileH * 1 / 100,
    },
    UserCommentBaseView: {
        width: mobileW,
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: mobileW * 3 / 100,
        marginTop: mobileH * 1 / 100,
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
    UserFullImage: {
        width: mobileW,
        height: mobileH * 40 / 100,
    },
    CommentUserImage: {
        width: mobileW * 12 / 100,
        height: mobileW * 12 / 100,
        borderRadius: mobileW * 6 / 100,
    },
    onlineonuserImage: {
        width: mobileW * 5 / 100,
        height: mobileW * 5 / 100,
    },
    flagImage: {
        width: mobileW * 4.6 / 100,
        height: mobileW * 4.6 / 100
    },
    userName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 3.8 / 100
    },
    userCommentName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blackColor,
        fontSize: mobileW * 3.5 / 100
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
        fontSize: mobileW * 3.4 / 100
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
        color: Colors.blackColor,
        textAlign: 'left',
        left: mobileW * 5.5 / 100,
        fontFamily: Font.FontSemiBold,
        fontSize: mobileW * 3.8 / 100,
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
        marginTop: mobileH * 2 / 100
    },
    VerticalLine: {
        width: mobileW * 0.3 / 100,
        height: mobileH * 12 / 100,
        backgroundColor: Colors.borderColour
    }
})







// import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList } from 'react-native'
// import React, { useState } from 'react'
// import Header from '../Components/Header';
// import { localimag } from '../Provider/Localimageprovider/Localimage';
// import { Lang_chg } from '../Provider/Language_provider';
// import { Colors, Font, config, mobileH, mobileW } from '../Provider/utilslib/Utils';
// import Footer from '../Provider/Footer';
// import HideWithKeyboard from 'react-native-hide-with-keyboard';
// import StarRating from 'react-native-star-rating';

// export default function Profile_c({ navigation }) {

//     const [checked, setChecked] = React.useState('first');
//     const [checked1, setChecked1] = React.useState('first1');
//     const [modalVisible, setmodalVisible] = React.useState(false);
//     const [modalVisibleVerification, setmodalVisibleVerification] = React.useState(false);
//     const [RememberMe, setRememberMe] = React.useState(true);
//     const [activePage, setactivepage] = React.useState(0);

//     const data = [{}, {}, {},]

//     return (
//         <View style={styles.container}>
//             <Header
//                 navigation={navigation}
//                 title={'Profile'}
//                 firstImage={localimag.back_icon}
//                 secondImage={localimag.Video_Camera}
//             ></Header>



//             {/* ----  ---- */}

//             <View
//                 style={styles.FlatlistBaseView}>
//                 <Image
//                     resizeMode='contain'
//                     style={styles.UserImage}
//                     source={localimag.boy2}
//                 >
//                 </Image>
//                 <View style={{ width: mobileW * 62 / 100, height: mobileH * 9 / 100 }}>
//                     <View style={{ flexDirection: "row", alignItems: "center", marginTop: mobileH * 0.5 / 100 }}>
//                         <Image
//                             resizeMode='contain'
//                             style={styles.flagImage}
//                             source={localimag.flagonimage}
//                         />
//                         <Text style={styles.userName}>  Venus Smith</Text>
//                     </View>
//                     <StarRating
//                         containerStyle={{ width: mobileW * 22 / 100, marginLeft: mobileW * 2 / 100 }}
//                         fullStar={localimag.activeStar}
//                         halfStar={localimag.halfstar}
//                         emptyStar={localimag.deactivae_star}
//                         halfStarColor={'#FFC815'}
//                         disabled={false}
//                         maxStars={5}
//                         starSize={mobileW * 0.035}
//                         rating={3.5}
//                     // selectedStar={(rating1) => this.setState({ rating: rating1 })}
//                     />
//                     <Text style={[styles.dateTimeTxt, { marginTop: mobileH * 0.8 / 100 }]}> 5/5 50 Comments</Text>
//                 </View>
//                 <Image
//                     resizeMode='contain'
//                     style={styles.cameraIcon}
//                 />

//             </View>
//             {/* ----  ---- */}

//             <View style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 width: mobileW,
//                 alignItems: "center",
//                 height: mobileW * 8 / 100,
//                 paddingVertical: mobileW * 5 / 100,
//                 borderBottomWidth: mobileW * 1 / 100,
//                 borderBottomColor: '#ebebec',
//             }}>
//                 <TouchableOpacity
//                     activeOpacity={0.8}
//                     style={{ height: mobileW * 8 / 100, alignItems: "center", justifyContent: 'center' }}
//                     onPress={() => setactivepage(0)}
//                 >
//                     {activePage == 0 ?
//                         <View style={styles.Topbar}>
//                             <Text style={styles.aboutTxt}>Information</Text>
//                         </View>
//                         :
//                         <View style={styles.Topbar1}>
//                             <Text style={styles.aboutTxt1}>Information</Text>
//                         </View>
//                     }

//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     style={{
//                         height: mobileW * 8 / 100,
//                         alignItems: "center",
//                         justifyContent: 'center'
//                     }}
//                     activeOpacity={0.8}
//                     onPress={() => setactivepage(1)}
//                 >
//                     {activePage == 1 ?
//                         <View style={styles.Topbar}>
//                             <Text style={styles.aboutTxt}>Comments</Text>
//                         </View>
//                         // <Text style={styles.aboutTxt}>Comments</Text>
//                         :
//                         <View style={styles.Topbar1}>
//                             <Text style={styles.aboutTxt1}>Comments</Text>
//                         </View>
//                     }

//                 </TouchableOpacity>
//             </View>

//             {activePage == 0 &&
//                 <View style={styles.informationBaseView}>
//                     <View style={[styles.headView, { marginTop: 0 }]}>
//                         <Text style={styles.Callsin}>{Lang_chg.Callsin30day[config.language]}</Text>
//                         <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>50</Text>
//                     </View>
//                     <View style={styles.headView}>
//                         <Text style={styles.Callsin}>{Lang_chg.PositiveComm[config.language]}</Text>
//                         <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>100% </Text>
//                     </View>
//                     <View style={styles.headView}>
//                         <Text style={styles.Callsin}>{Lang_chg.Positives[config.language]}</Text>
//                         <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>50</Text>
//                     </View>
//                     <View style={styles.headView}>
//                         <Text style={styles.Callsin}>{Lang_chg.Negatives[config.language]}</Text>
//                         <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>0</Text>
//                     </View>

//                     <View
//                         style={{
//                             backgroundColor: Colors.borderColour, width: mobileW * 81 / 100, height: mobileH * 0.25 / 100,
//                             marginTop: mobileH * 2 / 100
//                         }}
//                     ></View>

//                     <View style={styles.headView}>
//                         <Text style={styles.Callsin}>{Lang_chg.Registered[config.language]}</Text>
//                         <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>10 December2023</Text>
//                     </View>
//                     <View style={styles.headView}>
//                         <Text style={styles.Callsin}>{Lang_chg.Firstcall[config.language]}</Text>
//                         <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>12 December2023</Text>
//                     </View>
//                     <View style={styles.headView}>
//                         <Text style={styles.Callsin}>{Lang_chg.Warnings[config.language]}</Text>
//                         <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>0</Text>
//                     </View>
//                 </View>}


//             {activePage == 1 &&
//                 <View>
//                     <View style={styles.CommentBaseView}>
//                         <View
//                             style={{ width: mobileW * 30 / 100, alignItems: 'center', justifyContent: "center" }}
//                         >
//                             <Text style={styles.RatingCount}>4.9</Text>
//                             <StarRating
//                                 containerStyle={{ width: mobileW * 22 / 100, marginLeft: mobileW * 2 / 100 }}
//                                 fullStar={localimag.activeStar}
//                                 halfStar={localimag.halfstar}
//                                 emptyStar={localimag.deactivae_star}
//                                 halfStarColor={'#FFC815'}
//                                 disabled={false}
//                                 maxStars={5}
//                                 starSize={mobileW * 0.035}
//                                 rating={3.5}
//                             />
//                             <Text style={{
//                                 marginTop: mobileH * 0.8 / 100,
//                                 fontFamily: Font.FontRegular, fontSize: mobileH * 1.6 / 100,
//                                 marginTop: mobileH * 1 / 100, color: Colors.grayColour
//                             }}>50 Reviews</Text>
//                         </View>
//                         <View
//                             style={styles.VerticalLine}
//                         ></View>
//                         <View
//                             style={{ height: mobileH * 8 / 100, width: mobileW * 45 / 100 }}
//                         >
//                             <View style={[styles.headView, { marginTop: mobileH * 1 / 100 }]}>
//                                 <Text style={styles.Callsin}>{Lang_chg.Positives[config.language]}</Text>
//                                 <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>50</Text>
//                             </View>
//                             <View style={[styles.headView, { marginTop: mobileH * 1 / 100 }]}>
//                                 <Text style={styles.Callsin}>{Lang_chg.Negatives[config.language]}</Text>
//                                 <Text style={[styles.Callsin, { color: Colors.grayColour, fontFamily: Font.FontRegular }]}>0</Text>
//                             </View>
//                         </View>
//                     </View>

//                     <FlatList
//                         data={data}
//                         showsVerticalScrollIndicator={false}
//                         contentContainerStyle={{ paddingBottom: mobileH * 58 / 100 }}
//                         renderItem={({ item, index }) =>
//                             <View>
//                                 <View
//                                     style={styles.UserCommentBaseView}>
//                                     <Image
//                                         resizeMode='contain'
//                                         style={styles.CommentUserImage}
//                                         source={localimag.girl3}
//                                     >
//                                     </Image>
//                                     <View style={{ width: mobileW * 50 / 100 }}>
//                                         <View style={{ flexDirection: "row", alignItems: "center" }}>
//                                             <Text style={styles.userCommentName}>Elizabeth</Text>
//                                         </View>
//                                         <Text style={styles.dateTimeTxt}>Feb 11, 06:36 PM</Text>
//                                     </View>
//                                     <StarRating
//                                         containerStyle={{ width: mobileW * 22 / 100, top: mobileH * 0.5 / 100, marginLeft: mobileW * 2 / 100 }}
//                                         fullStar={localimag.activeStar}
//                                         halfStar={localimag.halfstar}
//                                         emptyStar={localimag.deactivae_star}
//                                         halfStarColor={'#FFC815'}
//                                         disabled={false}
//                                         maxStars={5}
//                                         starSize={mobileW * 0.030}
//                                         rating={3.5}
//                                     // selectedStar={(rating1) => this.setState({ rating: rating1 })}
//                                     />
//                                 </View>
//                                 <View
//                                     style={[styles.UserCommentdataView, { paddingHorizontal: mobileW * 19 / 100 }]}
//                                 >
//                                     <View style={{ width: mobileW * 76 / 100 }}>
//                                         <View style={{ flexDirection: "row", alignItems: "center" }}>
//                                             <Text style={styles.userCommentName}>Great Elizabeth</Text>
//                                         </View>
//                                         <Text style={styles.commentDatatxt}>{Lang_chg.DummyData}</Text>
//                                     </View>
//                                 </View>
//                             </View>
//                         } />

//                 </View>
//             }

//             <Footer
//                 activepage='Profile_c'
//                 usertype={1}
//                 footerpage={[
//                     { name: 'Home_c', pageName: 'Home', countshow: false, image: require('../Icons/Home_icon.png'), activeimage: require('../Icons/Home_icon.png') },

//                     { name: 'Search_c', pageName: 'Search', countshow: false, image: require('../Icons/search_icon.png'), activeimage: require('../Icons/search_icon.png') },

//                     {
//                         name: 'Faourite', pageName: 'Faourite', countshow: false, image: require('../Icons/Heart_icon.png'), activeimage: require('../Icons/Heart_icon.png')
//                     },

//                     { name: 'Wallet_c', pageName: 'Wallet', countshow: false, image: require('../Icons/Wallet_icon.png'), activeimage: require('../Icons/Wallet_icon.png') },

//                     { name: 'Profile_c', pageName: 'Profile', countshow: false, image: require('../Icons/profile_icon.png'), activeimage: require('../Icons/profile_icon.png') },
//                 ]}
//                 navigation={navigation}
//                 imagestyle1={{ width: 25, height: 25, backgroundColor: '#fff', countcolor: 'white', countbackground: 'black' }}
//                 count_inbox={0}
//             />

//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: Colors.appBackground
//     },
//     FlatlistBaseView: {
//         width: mobileW,
//         flexDirection: 'row',
//         paddingHorizontal: mobileW * 4 / 100,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: mobileW * 3 / 100,
//         marginTop: mobileH * 1 / 100
//     },
//     UserCommentBaseView: {
//         width: mobileW,
//         flexDirection: 'row',
//         paddingHorizontal: mobileW * 5 / 100,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: mobileW * 3 / 100,
//         marginTop: mobileH * 1 / 100,
//     },
//     UserCommentdataView: {
//         width: mobileW,
//         flexDirection: 'row',
//         paddingHorizontal: mobileW * 5 / 100,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     UserImage: {
//         width: mobileW * 18 / 100,
//         height: mobileW * 18 / 100,
//         borderRadius: mobileW * 9 / 100,
//     },
//     CommentUserImage: {
//         width: mobileW * 12 / 100,
//         height: mobileW * 12 / 100,
//         borderRadius: mobileW * 6 / 100,
//     },
//     onlineonuserImage: {
//         width: mobileW * 2.6 / 100,
//         height: mobileW * 2.6 / 100,
//         left: mobileW * 10.5 / 100,
//         top: mobileH * 0.4 / 100
//     },
//     flagImage: {
//         width: mobileW * 4.6 / 100,
//         height: mobileW * 4.6 / 100
//     },
//     userName: {
//         fontFamily: Font.FontSemiBold,
//         color: Colors.blackColor,
//         fontSize: mobileW * 3.8 / 100
//     },
//     userCommentName: {
//         fontFamily: Font.FontSemiBold,
//         color: Colors.blackColor,
//         fontSize: mobileW * 3.5 / 100
//     },
//     RatingCount: {
//         fontFamily: Font.FontSemiBold,
//         color: Colors.blackColor,
//         fontSize: mobileW * 5.5 / 100
//     },
//     Callsin: {
//         fontFamily: Font.FontMedium,
//         color: Colors.blackColor,
//         fontSize: mobileW * 3.2 / 100
//     },
//     dateTimeTxt: {
//         fontFamily: Font.FontMedium,
//         color: Colors.darkGray,
//         fontSize: mobileW * 2.8 / 100
//     },
//     commentDatatxt: {
//         fontFamily: Font.FontMedium,
//         color: Colors.darkGray,
//         fontSize: mobileW * 2.7 / 100
//     },
//     cameraIcon: {
//         width: mobileW * 7.8 / 100,
//         height: mobileW * 7.8 / 100
//     },
//     searchBaseView: {
//         width: mobileW * 88 / 100,
//         alignSelf: "center",
//         borderRadius: mobileW * 7 / 100,
//         alignItems: "center",
//         justifyContent: "center",
//         padding: mobileW * .2 / 100,
//         height: mobileW * 11 / 100,
//         backgroundColor: Colors.whiteColor,
//         marginTop: mobileW * 2.5 / 100,
//         flexDirection: "row",
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//         shadowOffset: { width: 0, },
//         marginBottom: mobileH * 2 / 100,
//     },
//     Topbar:
//     {
//         height: mobileW * 11.5 / 100,
//         alignItems: "center",
//         justifyContent: 'center',
//         borderBottomColor: Colors.Pink,
//         width: mobileW * 50 / 100,
//         borderBottomWidth: mobileW * 0.3 / 100,
//     },
//     Topbar1: {
//         height: mobileW * 11.5 / 100,
//         alignItems: "center",
//         justifyContent: 'center',
//         borderBottomColor: '#ebebec',
//         width: mobileW * 50 / 100,
//         borderBottomWidth: mobileW * 0.3 / 100,
//     },
//     aboutTxt:
//     {
//         //  backgroundColor: 'yellow',
//         width: mobileW * 0.42,
//         color: Colors.Pink,
//         textAlign: 'center',
//         fontFamily: Font.FontMedium,
//         fontSize: mobileW * 0.035,
//     },
//     aboutTxt1:
//     {
//         // backgroundColor: 'pink',
//         width: mobileW * 0.42,
//         color: Colors.darkGray,
//         textAlign: 'center',
//         fontFamily: Font.FontMedium,
//         fontSize: mobileW * 0.035
//     },
//     informationBaseView: {
//         alignSelf: 'center',
//         backgroundColor: Colors.whiteColor,
//         width: mobileW * 90 / 100,
//         paddingVertical: mobileH * 2 / 100,
//         marginTop: mobileH * 2 / 100,
//         borderRadius: mobileW * 3 / 100,
//         alignItems: 'center',
//         elevation: 2,
//         shadowOpacity: 0.1,
//         shadowOffset: { width: 0, },
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//     },
//     CommentBaseView: {
//         alignSelf: 'center',
//         backgroundColor: Colors.whiteColor,
//         width: mobileW * 90 / 100,
//         paddingHorizontal: mobileH * 1 / 100,
//         paddingVertical: mobileH * 2 / 100,
//         marginTop: mobileH * 2 / 100,
//         borderRadius: mobileW * 3 / 100,
//         alignItems: 'center',
//         elevation: 2,
//         shadowOpacity: 0.1,
//         shadowOffset: { width: 0, },
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//         flexDirection: 'row',
//         justifyContent: 'space-around'
//     },
//     headView: {
//         flexDirection: "row",
//         justifyContent: 'space-between',
//         width: '90%',
//         marginTop: mobileH * 2 / 100
//     },
//     VerticalLine: {
//         width: mobileW * 0.3 / 100,
//         height: mobileH * 12 / 100,
//         backgroundColor: Colors.borderColour
//     }
// })

