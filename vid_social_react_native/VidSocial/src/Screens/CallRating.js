import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, BackHandler, Alert, FlatList, Dimensions, Animated } from 'react-native'
import React, { useEffect } from 'react'
import Header from '../Components/Header';
import { Colors, Font } from '../Provider/Colorsfont';
import { Lang_chg, config, localStorage, localimag, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import StarRating from 'react-native-star-rating';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { CALL_ENDED, CALL_RECEIVED, NO_CALL } from '../Provider/Notification/CallConstants';

export default function CallRating({ navigation, route }) {

    const [rating, setrating] = React.useState(0);
    const [Content, setContent] = React.useState('');
    const [CustomerProfileData, setCustomerProfileData] = React.useState({});
    const [UserName, setUserName] = React.useState('');
    const [profile_image, setprofile_image] = React.useState('');
    const [FavStatus, setFavStatus] = React.useState(false);
    const item = route.params.data

    useFocusEffect(
        React.useCallback(() => {
            getUSerData();
            const handleBackPress = () => {
                backAction()
                // Handle the back button press on this screen
                return true; // Return true to prevent default behavior (e.g., navigate back)
            };

            BackHandler.addEventListener('hardwareBackPress', handleBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
            };
        }, [])
    );

    const backAction = () => {
        return true;
    }


    useEffect(() => {
        _ToCheckFavouriteStatus()
    }, [])
    
    // ---------------- To get All All Gift Details ------------------------------
    const _ToCheckFavouriteStatus = async () => {
        let apiUrl = appBaseUrl.GetWorkerGift + item.CallId;
        console.log(apiUrl);
        var headers = {
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        }
        console.log('apiUrlapiUrlapiUrl', apiUrl);
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                if (response.data.code == 200) {
                    setFavStatus(response.data.favorite)
                } else {
                    setFavStatus(false)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                // alert(error);
                console.log(error);
            });
    }


    const getUSerData = async () => {
        await localStorage.setItemString("call_status", CALL_ENDED.toString())
        setUserName(item.worker_name)
        setprofile_image(item.worker_image)
    }

    // =====================Api calling==============================
    const _ReportApiCalling = async () => {

        //email============================
        if (rating == 0) {
            msgProvider.toast(Lang_chg.plsGiveRate[config.language], 'bottom')
            return false
        }
        //email============================
        if (Content.length <= 0) {
            msgProvider.toast(Lang_chg.emptyDescription[config.language], 'bottom')
            return false
        }

        if (Content.length <= 3) {
            msgProvider.toast(Lang_chg.emptyDescription[config.language], 'bottom')
            return false
        }

        var Token = await localStorage.getItemString("AccessToken")
        // global.props.showLoader();
        let apiUrl = appBaseUrl.CreateReview;
        var postData = JSON.stringify({
            WorkerId: item.user_id,
            rating: rating,
            content: Content,
            like: false
        });
        console.log(postData, item);
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };
        global.props.showLoader();
        // Make a POST request using Axios
        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                // Handle the successful response
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    msgProvider.toast(Lang_chg.RatingSendSuccess[config.language], 'bottom')
                    setTimeout(() => {
                        global.props.hideLoader();
                        navigation.navigate("Home_c")
                    }, 1000);
                } else {
                    global.props.hideLoader();
                    alert(response.data.error)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                // Handle errors
            });
    }


    const MArkFavUnMark = async () => {
        console.log(item);
        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);
        global.props.showLoader();
        let apiUrl = appBaseUrl.MarkUnmarkFav;

        var postData = JSON.stringify({
            WorkerId: item.worker_id,
            Status: true,
        });

        console.log('postData------>>>', postData);

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
                console.log("Mark Favourite Response", response);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    setFavStatus(true)
                    msgProvider.toast(Lang_chg.markFavSuccess[config.language], 'bottom')
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
        // <ScrollView contentContainerStyle={styles.container}>
        // <View style={styles.container}>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            <ImageBackground style={styles.imageBackStyle}
                imageStyle={styles.imageBackStyle}
                source={localimag.Background}>
                {/* <View
                        style={{
                            position: "absolute", alignSelf: 'center',
                            alignItems: 'center', height: mobileH,
                            width: mobileW, backgroundColor: Colors.appBackground
                        }}
                    > */}
                <View style={{
                    width: mobileW * 88 / 100, paddingVertical: mobileH * 5 / 100, backgroundColor: 'white',
                    marginTop: mobileH * 8 / 100, borderRadius: mobileW * 8 / 100
                }}>

                    <Image
                        source={profile_image != null ? { uri:appBaseUrl.imageUrl + profile_image } : localimag.person_icon}
                        style={{
                            height: mobileW * 35 / 100, alignSelf: 'center', marginTop: mobileH * 3 / 100,
                            borderRadius: mobileW * 17.5 / 100, width: mobileW * 35 / 100,
                            borderWidth: mobileW * 0.3 / 100, borderColor: Colors.Pink

                        }}></Image>
                    <Text style={[styles.ProfileName, { top: mobileH * 0.5 / 100 }]}>{UserName}</Text>

                    <View style={{ width: mobileW * 88 / 100, height: mobileW * 15 / 100 }}>
                        <Text style={[styles.userCommentName,{color:Colors.blackColor}]}>{Lang_chg.Howwasthecallwith[config.language]} {UserName} ?</Text>
                    </View>
                    <View style={{ top: mobileW * 1 / 100 }}>
                        <View style={{ width: mobileW * 50 / 100, height: mobileW * 7 / 100, marginLeft: mobileW * 2 / 100 }}>
                            <Text style={styles.userCommentName1}>{Lang_chg.Ratings[config.language]}</Text>
                        </View>

                        <StarRating
                            containerStyle={{ width: mobileW * 50 / 100, marginLeft: mobileW * 7 / 100 }}
                            fullStar={localimag.activeStar}
                            halfStar={localimag.halfstar}
                            emptyStar={localimag.deactivae_star}
                            halfStarColor={'#FFC815'}
                            selectedStar={(rating) => setrating(rating)}
                            rating={rating}
                            disabled={false}
                            maxStars={5}
                            starSize={mobileW * 0.078}
                        // rating={4.9}
                        // selectedStar={(rating1) => this.setState({ rating: rating1 })}
                        />
                        <View style={styles.textAlignextInputBaseView1}>
                            <TextInput
                                // value={"" + this.state.email + ""}
                                maxLength={250}
                                keyboardType='email-address'
                                textAlignVertical='top'
                                multiline={true}
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.Type[config.language]}
                                onChangeText={(txt) => { setContent(txt) }}
                                style={styles.textInputStyle11}>
                            </TextInput>
                        </View>
                        {FavStatus == false &&
                            <View
                                style={{
                                    width: mobileW * 73 / 100,
                                    alignSelf: 'center',
                                    paddingHorizontal: mobileW * 2 / 100,
                                    paddingVertical: mobileW * 3 / 100,
                                    flexDirection: 'row', alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Text style={styles.LikeIcon}>{Lang_chg.Wouldtolikeadd[config.language]} {UserName} {Lang_chg.to_your_favourites[config.language]}</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => MArkFavUnMark()}
                                >
                                    <Image
                                        resizeMode='contain'
                                        style={{
                                            width: mobileW * 8 / 100, height: mobileW * 8 / 100,
                                            tintColor: Colors.Pink
                                        }}
                                        source={localimag.EmptyHeart}
                                    />
                                </TouchableOpacity>
                            </View>
                        }
                        {/* --- Login Button --- */}
                        <View style={{ marginTop: mobileH * 2 / 100, alignSelf: 'center', marginLeft: mobileW * 1 / 100 }}>
                            <CommonButton onPressClick={() => _ReportApiCalling()} title={Lang_chg.Post[config.language]}></CommonButton>
                        </View>

                        <View style={{ marginTop: mobileH * 2 / 100, alignSelf: 'center', marginLeft: mobileW * 1 / 100 }}>
                            <CommonButton onPressClick={() => navigation.navigate('Home_c')} title={Lang_chg.CANCEL[config.language]}></CommonButton>
                        </View>
                    </View>
                </View>
                {/* </View> */}
            </ImageBackground>
        </KeyboardAwareScrollView>
        // </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground
    },

    imageBackStyle: {
        alignItems: 'center',
        height: mobileH, width: mobileW
        // justifyContent: 'space-evenly'
    },


    background2: {
        alignItems: 'center',
        height: mobileH, width: mobileW
        // justifyContent: 'space-evenly'
    },


    triangle: {
        width: mobileW * 7 / 100,
        alignSelf: 'center',
        height: mobileW * 10 / 100,
        transform: [{ rotate: '180deg' }],
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: mobileW * 4.5 / 100,
        borderRightWidth: mobileW * 4.5 / 100,
        borderBottomWidth: mobileW * 8 / 100,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "white",
        position: 'absolute',
        bottom: -29

    },
    userCommentName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.Pink,
        fontSize: mobileW * 4.5 / 100,
        marginTop: mobileH * 1.5 / 100,
        alignSelf: 'center',
    },
    LikeIcon: {
        fontFamily: Font.FontSemiBold,
        color: Colors.Pink,
        fontSize: mobileW * 3 / 100,
        alignSelf: 'center',
        width: mobileW * 60 / 100
    },
    TimeText: {
        color: Colors.whiteColor,
        fontFamily: Font.FontRegular,
        textAlign: 'center',
        fontSize: mobileW * 4.1 / 100,
        //   marginTop: mobileH * 2 / 100
    },
    textInputStyle11: {
        width: mobileW * 70 / 100,
        height: mobileH * 15 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 3.5 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray,
        // height: mobileH * 30 / 100,
        // backgroundColor:'red'
    },
    ProfileName: {
        fontFamily: Font.FontSemiBold,
        color: Colors.Pink,
        fontSize: mobileW * 4 / 100,
        alignSelf: 'center',
    },
    userCommentName1: {
        fontFamily: Font.FontRegular,
        color: Colors.darkGray,
        fontSize: mobileW * 4 / 100,
        // alignSelf: 'center',
        left:mobileW*6/100
    },
    textAlignextInputBaseView1: {
        width: mobileW * 74 / 100,
        height: mobileH * 15 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileW * 5.5 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2.7 / 100,
        marginLeft: mobileW * 1 / 100
    },



    button: {
        paddingHorizontal: 25,
        paddingVertical: 4,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0055cc',
        margin: 5,
    },
    main: { flex: 1, alignItems: 'center' },
    scroll: { flex: 1, backgroundColor: '#ddeeff', width: '100%' },
    scrollContainer: { alignItems: 'center' },
    videoView: { width: mobileW, height: mobileH, },

    videoView2: {
        width: mobileW * 30 / 100, height: mobileH * 25 / 100,
        position: "absolute", top: 10, right: 10
    },

    videoView1: {
        width: mobileW * 30 / 100, height: mobileH * 25 / 100,
    },

    btnContainer: { flexDirection: 'row', justifyContent: 'center' },
    head: { fontSize: 20 },
    info: { backgroundColor: '#ffffe0', color: '#0000ff' },

    circle: {
        height: mobileH * 18 / 100,
        width: mobileW * 25 / 100,
        borderRadius: mobileW * 5 / 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000020'
    }
})
