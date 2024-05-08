import { View, Text, StyleSheet, Image, ImageBackground, ScrollView, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, localStorage, mobileH, mobileW, config, msgProvider, } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import HideWithKeyboard from 'react-native-hide-with-keyboard';
import { useEffect } from 'react';
import axios from 'axios';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import zone from 'moment-timezone';
import SocketData from './SocketData';
import { UserLoginPermission } from './UserLoginPermission';
import LinearGradient from 'react-native-linear-gradient';

export default function Search_c({ navigation }) {

  const datas = []

  const [data, setdata] = useState(datas)
  const [dataForSearch, setdataForSearch] = useState('NA')
  const [refresh, setrefresh] = useState(false)
  const [searchText, setSearchText] = useState('');

  const [timeZone, setTimeZone] = useState("")

  const [AlertModal, setAlertModal] = useState(false)
  const [AlertMessage, setAlertMessage] = useState('')

  const [remainingHours, setRemainingHours] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [TotalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    const currentTimeZone = zone.tz.guess();
    console.log('Current Time Zone YNEW:', currentTimeZone);
    setTimeZone(currentTimeZone)
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      TogetHomeData1()
      UserLoginPermission({ navigation })
      setSearchText('')
    }, [])
  );

  useEffect(() => {
    if (AlertModal) {
      convertSecondsToTime(totalSeconds)
      var intervalId = setInterval(() => {
        // Decrement the total seconds every second
        // console.error('total seconds decreased:',totalSeconds);
        setTotalSeconds((prevTotalSeconds) => prevTotalSeconds - 1);
      }, 1000);
    }
    // Clear the interval when the component is unmounted
    return () => intervalId && clearInterval(intervalId);

  }, [AlertModal, totalSeconds]);

  const handleChildData = (data) => {
    // Update dataArray with data from the child component
    console.log('data get from socket customer list----------', data.message.UpdateToWorker);

    if (data.message) {
      TogetHomeData1(false)
    }
  };

  const onRefresh = async () => {
    setrefresh(true)
    setTimeout(() => {
      TogetHomeData1()
    }, 500);
  }
  const TogetHomeData1 = async () => {
    var Token = await localStorage.getItemString("AccessToken")
    console.log(Token);
    var apiUrl = appBaseUrl.HomeData
    var headers = {
      'Authorization': 'Bearer ' + Token,
      'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
    }
    axios.get(apiUrl, { headers })
      .then(async (response) => {
        console.log("Search screen data --->", response.data);
        if (response.data.code == 200) {
          setdata(response.data.data)
          setdataForSearch(response.data.data)
          setrefresh(false)
          global.props.hideLoader();
        } else {
          setdata('NA')
          setdataForSearch('NA')
          setrefresh(false)
        }
      })
      .catch(error => {
        global.props.hideLoader();
        // alert(error);
        onRefresh()
        console.log('Loginerror---', error);
      });
  }


  const _searchBusiness = (textToSearch) => {
    setSearchText(textToSearch);
    var textToSearch = textToSearch.toString().toLowerCase();
    let data1 = dataForSearch
    if (data1 != 'NA') {
      console.log('data1', data1);
      if (data1 != 'NA') {
        var text_data = textToSearch.trim();
        let newData = data1.filter(function (item) {
          var name = item.display_name
          return (
            name.toString().toLowerCase().indexOf(text_data) >= 0
          )
        });

        if (newData.length > 0) {
          setdata(newData)
        } else if (newData.length <= 0) {
          setdata('NA')
        }
      }
    }
  }

  // =========== Clear Search Field =============
  const ClearSearchFieldData = () => {
    setSearchText('')
    TogetHomeData1()
  }

  const MArkFavUnMark = async (item) => {
    console.log(item);
    var Token = await localStorage.getItemString("AccessToken")
    console.log(Token);
    var favworkerId = item.id;
    var LikeStatus = item.favorite
    if (LikeStatus == true) {
      LikeStatus = false
    } else {
      LikeStatus = true
    }

    // global.props.showLoader();
    let apiUrl = appBaseUrl.MarkUnmarkFav;

    var postData = JSON.stringify({
      WorkerId: favworkerId,
      Status: LikeStatus,
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
        console.log("LoginResponse--->222", response);
        if (response.data.code == 200) {
          global.props.hideLoader();
          TogetHomeData1();
          setTimeout(() => {
            setSearchText('');
          }, 1000);
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

  const CallInitate = async (item) => {

    if(item.status != 'online'){
        msgProvider.toast(Lang_chg.UserOffline[config.language], 'bottom')
        return false
    }

    global.props.showLoader();
    var Token = await localStorage.getItemString("AccessToken")

    // global.props.showLoader();
    let apiUrl = appBaseUrl.WorkerWarning;

    var postData = JSON.stringify({
        receiver_id: item.id
    });

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
            console.log('i am here in warning section==========> ', response.data);

            if (response.data.code == 200) {
                global.props.hideLoader();
                navigation.navigate('OutgoingCallScreen', { item: item })
            } else {
                const integerResult = Number(response.data.remaining_time);
                setAlertModal(true)
                setAlertMessage(response.data.message)
                // const initialTotalSeconds = Math.floor(integerResult / 60);
                convertSecondsToTime(integerResult)
                setTotalMinutes(initialTotalSeconds);
                global.props.hideLoader();
                // alert(response.data.error)
            }
        })
        .catch(error => {
            global.props.hideLoader();
            // console.log('Loginerror---22', error);
            // Handle errors
        });
}

const convertSecondsToTime = (seconds) => {
  setTotalSeconds(seconds)

  // const convertedDays = Math.floor(seconds / (3600));
  // const remainingHours = Math.floor((seconds % (3600)) / 60);
  // const remainingMinutes = Math.floor((seconds % 3600) / 60);
  // const remainingSeconds = seconds % 60;


  const remainingHours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // setConvertedDays(convertedDays);
  setRemainingHours(remainingHours);
  setRemainingMinutes(remainingMinutes);
  setRemainingSeconds(remainingSeconds);
};

  return (
    <View style={styles.container}>

                      {/* ----------- Commom alert modal ------------- */}
                      <Modal
                animationType='fade'
                transparent={true}
                visible={AlertModal}
                onRequestClose={() => {
                    setAlertModal(!AlertModal)
                }}>

                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.girlHeadercolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadViewForWithdraw}>
                            <View
                                style={styles.ModalHeaderView}
                            >

                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 5 / 100,
                                        fontFamily: Font.FontSemiBold
                                    }]}
                                >{Lang_chg.Alert[config.language]}</Text>

                            </View>
                            <View style={{
                                width: '80%', height: mobileH * 12 / 100,
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 4 / 100,
                                        fontFamily: Font.FontRegular,
                                        textAlign: 'center'
                                    }]}
                                >{AlertMessage}</Text>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 3.5 / 100,
                                        fontFamily: Font.FontRegular,
                                        textAlign: 'center'
                                    }]}
                                >{Lang_chg.Remaining_Time[config.language]} <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 4 / 100,
                                        fontFamily: Font.FontSemiBold,
                                        textAlign: 'center',
                                        color: Colors.blackColor
                                    }]}
                                >{`${remainingHours}:${remainingMinutes}:${remainingSeconds.toFixed(0)}`}</Text></Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => { setAlertModal(!AlertModal) }}
                                activeOpacity={0.6}
                                style={styles.OkButton}
                            >
                                <LinearGradient
                                    colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                    style={styles.OkButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </Modal>



      <SocketData onChildData={handleChildData} />
      <Header
        navigation={navigation}
        title={Lang_chg.Search[config.language]}
        backIcon={false}
        firstImage={localimag.app_Logo}  ></Header>
      {/* --------------Search Input ------------ */}
      <View style={styles.searchBaseView}>
        <Image resizeMode='contain' source={localimag.search}
          style={{
            height: mobileW * 4.8 / 100, width: mobileW * 4.8 / 100
          }}></Image>

        <TextInput maxLength={50}
          keyboardType='email-address'
          placeholderTextColor={Colors.grayColour}
          // ref={(input) => { this.searchfield = input; }}
          onChangeText={(txt) => _searchBusiness(txt)}
          value={searchText}
          placeholder={Lang_chg.search1[config.language]}
          // placeholder='Search...'
          style={{
            width: mobileW * 65 / 100,
            height: mobileW * 65 / 100,
            marginTop: mobileW * 1 / 100,
            fontFamily: Font.FontMedium, fontSize: mobileW * 3.4 / 100,
            marginLeft: mobileW * 1.5 / 100, color: Colors.grayColour
          }}></TextInput>
        {searchText.length > 0 ?
          <TouchableOpacity
            onPress={() => {
              ClearSearchFieldData()
            }}
            style={{ width: '10%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Image resizeMode='contain'
              style={{ width: mobileW * 4 / 100, height: mobileW * 4 / 100, tintColor: Colors.grayColour }}
              source={localimag.crossb}
            ></Image>
          </TouchableOpacity>
          :
          <View
            style={{ width: '10%' }}
          ></View>}
      </View>

      {/* ----  ---- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={onRefresh}
            tintColor={Colors.themecolor}
            colors={[Colors.themecolor]}
          />
        }
      >
        {
          data != "NA" ?
            <FlatList
              data={data}
              contentContainerStyle={{ paddingBottom: mobileH * 15 / 100 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) =>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('CustomerProfile', { User_id: item.id, FlagUrl: item.country_flag_url })}>
                  <View
                    style={[styles.FlatlistBaseView,
                    { marginTop: mobileH * 2 / 100, width: mobileW * 90 / 100, alignSelf: 'center' }]}>

                    <ImageBackground
                      resizeMode='contain'
                      style={styles.UserImage}
                      imageStyle={[styles.UserImage, {
                        borderWidth: mobileH * 0.15 / 100,
                        borderColor: global.UserType == 0 ? Colors.blueColour : Colors.Pink
                      }]}
                      source={item.image_url_link != null ?
                        { uri: appBaseUrl.imageUrl + item.image_url_link } : localimag.person_icon}
                    // source={localimag.girl1}
                    >{item.status == 'online' &&
                      <Image
                        resizeMode='contain'
                        style={styles.onlineonuserImage}
                        source={localimag.Online_icon}
                      />}
                    </ImageBackground>

                    <View style={{ width: mobileW * 24 / 100, left: mobileW * 2 / 100 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {/* <Image
                    resizeMode='cover'
                    style={styles.flagImagees}
                    source={{uri:item.country_flag_url}}
                  /> */}
                        <Text style={styles.userName}>{item.display_name}</Text>
                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', left: mobileW * 3 / 100 }}>
                    <Image
                      resizeMode='cover'
                      style={[styles.flagImage, {tintColor:item.rating==null&&Colors.blueColour, width: mobileW * 3.6 / 100, height: mobileW * 3.6 / 100 }]}
                      source={localimag.activeStar}
                    />
                    <Text style={[styles.userName, { fontSize: mobileW * 2.7 / 100, top: mobileH * 0.2 / 100 }]}>   {item.rating==null?'Newbie':item.rating}</Text>
                   </View> */}
                      </View>
                      <Text style={styles.dateTimeTxt}>  {item.online_date != null && moment(item.online_date).clone().tz(timeZone).format('MMM DD, hh:mm A')}</Text>
                    </View>
                    {/* ------------------------------------- */}
                    <View style={{ flexDirection: "row", width: mobileW * 47 / 100, justifyContent: "space-around", paddingHorizontal: mobileW * 1.5 / 100, paddingVertical: mobileH * 1 / 100, borderRadius: mobileW * 2 / 100, alignItems: 'center' }}>
                      <View
                        style={{
                          backgroundColor: '#ebf1fe', width: mobileW * 7.5 / 100,
                          alignItems: 'center', justifyContent: 'center',
                          height: mobileW * 7.5 / 100, borderRadius: mobileW * 1.2 / 100
                        }}
                      >
                        <Image
                          resizeMode='cover'
                          style={styles.flagImagees}
                          source={{ uri: item.country_flag_url }}
                        // source={localimag.flagonimage}
                        />
                      </View>
                      <View style={{ alignItems: "center", justifyContent: 'center', left: mobileW * 0.5 / 100 }}>
                        <Image
                          resizeMode='contain'
                          style={[styles.flagImage, {
                            top: item.rating ? mobileH * 0.9 / 100 : 0,
                            tintColor: item.rating == null && '#797982',
                            width: mobileW * 8 / 100, height: mobileW * 8 / 100
                          }]}
                          source={localimag.EmptyStart}
                        />
                        {item.rating != null &&
                          <Text style={[styles.dateTimeTxt, { top: mobileH * 1 / 100, fontSize: mobileW * 2.3 / 100 }]}> {item.rating}</Text>}

                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: item.favorite == false ? '#ebf1fe' : '#ffe8ee', width: mobileW * 7.5 / 100,
                          alignItems: 'center', justifyContent: 'center',
                          height: mobileW * 7.5 / 100, borderRadius: mobileW * 1.2 / 100
                        }}
                        onPress={() => MArkFavUnMark(item)}
                        activeOpacity={0.8}
                      >
                        <Image
                          resizeMode='contain'
                          style={styles.flagImagees}
                          source={item.favorite == false ? localimag.Heart_icon : localimag.filled_heart2}
                        />
                      </TouchableOpacity>
                      {/* <Image
                      resizeMode='contain'
                      style={styles.cameraIcon}
                      source={global.UserType == 0 ? localimag.BlueVideoCall : localimag.VideoCallicon}
                    /> */}
                      <TouchableOpacity activeOpacity={0.8}
                        onPress={() =>CallInitate(item)}>
                        <Image
                          resizeMode='contain'
                          style={styles.cameraIcon}
                          source={global.UserType == 0 ? localimag.BlueVideoCall : localimag.VideoCallicon}
                        />
                      </TouchableOpacity>
                    </View>
                    {/* --------------------------------------- */}
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
      </ScrollView>
      <HideWithKeyboard>
        <Footer
          activepage='Search_c'
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
      </HideWithKeyboard>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground
  },
  girlOnlineBaseView: {
    width: mobileW,
    flexDirection: 'row',
    paddingHorizontal: mobileW * 5 / 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: mobileW * 2 / 100
  },
  girlOnlinetxt: {
    fontFamily: Font.FontMedium,
    color: Colors.blackColor
  },
  filterIcon: {
    width: mobileW * 5.5 / 100,
    height: mobileW * 5.5 / 100,
    tintColor: Colors.Pink,
    right: mobileW * 1 / 100
  },
  Onlineiconimg: {
    width: mobileW * 2.5 / 100,
    height: mobileW * 2.5 / 100
  },
  FlatlistBaseView: {
    width: mobileW,
    flexDirection: 'row',
    paddingHorizontal: mobileW * 2.2 / 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: mobileW * 3 / 100,
    borderRadius: mobileW * 2.5 / 100,
    backgroundColor: Colors.whiteColor
  },
  UserImage: {
    width: mobileW * 13 / 100,
    height: mobileW * 13 / 100,
    right: mobileW * 1 / 100,
    borderRadius: mobileW * 6.5 / 100,
    left: mobileW * 0.3 / 100
  },
  onlineonuserImage: {
    width: mobileW * 2.6 / 100,
    height: mobileW * 2.6 / 100,
    left: mobileW * 10.5 / 100,
    top: mobileH * 0.4 / 100
  },
  flagImage: {
    width: mobileW * 4.6 / 100,
    height: mobileW * 4.6 / 100
  },
  flagImagees: {
    width: mobileW * 3.7 / 100,
    height: mobileW * 3.7 / 100,
    borderRadius: mobileW * 1.8 / 100,
    // borderWidth: mobileW * 0.15 / 100,
    // borderColor: Colors.darkGray
  },
  userName: {
    fontFamily: Font.FontSemiBold,
    color: Colors.blackColor,
    fontSize: mobileW * 3.8 / 100
  },
  dateTimeTxt: {
    fontFamily: Font.FontMedium,
    color: Colors.grayColour,
    fontSize: mobileW * 2.5 / 100
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
  HeartIcon: {
    width: mobileW * 8 / 100,
    height: mobileW * 8 / 100,
    right: 5
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
  paddingVertical: mobileH * 2 / 100,
  alignItems: 'center'
},
ModalHeaderView: {
  width: '100%', height: mobileH * 7 / 100,
  borderBottomWidth: mobileW * 0.3 / 100,
  borderBottomColor: Colors.grayColour,
  alignItems: "center",
  flexDirection: 'row',
  paddingHorizontal: mobileW * 5 / 100,
  justifyContent: 'center'
},
Oktxt: {
  fontFamily: Font.FontMedium,
  fontSize: mobileW * 4.2 / 100,
  color: Colors.whiteColor
},
Callsin: {
  color: Colors.blackColor
},
OkButton: {
  alignSelf: "center",
  justifyContent: "center",
  height: mobileW * 11 / 100,
  width: mobileW * 45 / 100,
  alignItems: "center",
  borderRadius: mobileW * 2 / 100,
  alignItems: "center"
},
Oktxt: {
  fontFamily: Font.FontMedium,
  fontSize: mobileW * 4.2 / 100,
  color: Colors.whiteColor
},
})

