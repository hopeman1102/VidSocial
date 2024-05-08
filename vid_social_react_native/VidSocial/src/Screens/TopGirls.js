import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import CommonButton from '../Components/CommonButton'
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import SmallButton from '../Components/SmallButton'
import { Lang_chg } from '../Provider/Language_provider'
import { config } from '../Provider/configProvider'
import { Colors, Font } from '../Provider/Colorsfont'
import { localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils'
import { ScrollView } from 'react-native-gesture-handler'
import Footer from '../Provider/Footer'
import axios from 'axios'
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants'
import { useFocusEffect } from '@react-navigation/native'
import zone from 'moment-timezone';
import moment from 'moment';
import { UserLoginPermission } from './UserLoginPermission'

export default function TopGirls({ navigation }) {

  const data = [{ Amount: 0 }]


  const [TopGirlsData, setTopGirlsData] = useState('NA')

  const [timeZone, setTimeZone] = useState("")

  useEffect(() => {
    const currentTimeZone = zone.tz.guess();
    console.log('Current Time Zone YNEW:', currentTimeZone);
    setTimeZone(currentTimeZone)
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      GetTopGirls()
      UserLoginPermission({ navigation })
    }, [])
  );

  const GetTopGirls = async () => {
    // console.log(new Date().toISOString().replace('T', ' '))



    // var TodayDate = new Date().toISOString()
    // const date = new Date(TodayDate);
    // date.setMonth(date.getMonth() - 1);
    // // November 10, 2021: year decreased by 1
    // console.log(date.toISOString().replace('T', ' '));
    // // console.log(date.toISOString().replace('T', ' '));
    // var BeforeOneMonthDate = date.toISOString()
    // global.props.showLoader();
    // let apiUrl = appBaseUrl.TopWorkerList;
    // var Token = await localStorage.getItemString("AccessToken")

    // var postData = JSON.stringify({
    //   from_date: BeforeOneMonthDate,
    //   to_date: TodayDate
    // });


    var Token = await localStorage.getItemString("AccessToken")
    // ==========================================================
    // Get the current date
    const currentDate = moment();

    // Subtract one month to get the previous month
    const previousMonth = currentDate.clone().subtract(1, 'months');

    // Get the start date of the previous month
    const startDateOfPreviousMonth = previousMonth.clone().startOf('month');

    // Get the end date of the previous month
    const endDateOfPreviousMonth = previousMonth.clone().endOf('month');

    var postData = JSON.stringify({
      from_date: startDateOfPreviousMonth,
      to_date: endDateOfPreviousMonth
    });

    console.log(postData);
    let apiUrl = appBaseUrl.TopWorkerList;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + Token,
    };

    axios.post(apiUrl, postData, { headers })
      .then(async (response) => {
        console.log("signUpResponse--->", response.data);
        if (response.data.code == 200) {
          global.props.hideLoader();
          setTopGirlsData(response.data.data)
        } else {
          global.props.hideLoader();
          setTopGirlsData('NA')
        }
      })
      .catch(error => {
        global.props.hideLoader();
        alert(error);
        console.log('Loginerror---', error);
      });
  }


  return (
    <View style={{ flex: 1 }}>
      <Header
        backIcon={false}
        navigation={navigation}
        title={Lang_chg.TopGirls[config.language]}
        firstImage={localimag.app_Logo}  ></Header>

      {/* ----  ---- */}
      {TopGirlsData != 'NA' ?
        <FlatList
          data={TopGirlsData}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: mobileH * 10 / 100, marginTop: mobileH * 2 / 100 }}
          renderItem={({ item, index }) =>
            <View
              style={[styles.FlatlistBaseView, { marginTop: mobileH * 2 / 100, width: mobileW * 90 / 100, alignSelf: 'center' }]}>
              <ImageBackground
                resizeMode='contain'
                style={styles.UserImage}
                imageStyle={[styles.UserImage, {
                  borderWidth: mobileH * 0.13 / 100,
                  borderColor: Colors.Pink
                }]}
                // source={localimag.girl1}
                source={item.image_url_link != null ? { uri: appBaseUrl.imageUrl + item.image_url_link } : localimag.person_icon}
              >
                <Image
                  resizeMode='contain'
                  style={styles.onlineonuserImage}
                  source={localimag.Online_icon}
                />
              </ImageBackground>
              <View style={{ width: mobileW * 45 / 100 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    resizeMode='cover'
                    style={[item.country_flag_url != null ? styles.flagImagees : styles.flagImage1]}
                    source={item.country_flag_url == null ? localimag.flagonimage : { uri: item.country_flag_url }}
                  />
                  <Text style={styles.userName}>  {item.first_name}</Text>
                </View>
                <Text style={styles.dateTimeTxt}> {item.online_date != null && moment(item.online_date).clone().tz(timeZone).format('MMM DD, hh:mm A')}</Text>
              </View>
              <View style={{ flexDirection: 'row', }}>
                <Image
                  resizeMode='contain'
                  style={styles.cameraIcon}
                  source={localimag.dollar}
                />
                <Text style={[styles.userName, { alignSelf: "center", width: mobileW * 16 / 100 }]}>   {item.call_earning}</Text>
              </View>
            </View>
          } />
        :
        <View style={{ alignItems: 'center', justifyContent: "center", flex: 1 }}>
          <Text style={[styles.userName, { width: mobileW * 90 / 100, textAlign: "center" }]}>{Lang_chg.Rightnowthereisnotopgirlavailableinthe[config.language]}</Text>
        </View>
      }

      <Footer
        activepage='TopGirls'
        usertype={1}
        footerpage={[
          { name: 'Home', pageName: Lang_chg.Home[config.language], countshow: false, image: require('../Icons/Home_icon.png'), activeimage: require('../Icons/Home_icon.png') },

          { name: 'Search', pageName: Lang_chg.Search[config.language], countshow: false, image: require('../Icons/search_icon.png'), activeimage: require('../Icons/search_icon.png') },

          {
            name: 'TopGirls', pageName: Lang_chg.TopGirls[config.language], countshow: false, image: require('../Icons/activeStar.png'), activeimage: require('../Icons/deactivae_star.png')
          },

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
  flagImagees: {
    width: mobileW * 5 / 100,
    height: mobileW * 5 / 100,
    borderRadius: mobileW * 2.5 / 100,
    borderWidth: mobileW * 0.15 / 100,
    borderColor: Colors.darkGray
  },
  Onlineiconimg: {
    width: mobileW * 2.5 / 100,
    height: mobileW * 2.5 / 100
  },
  FlatlistBaseView: {
    width: mobileW,
    flexDirection: 'row',
    paddingHorizontal: mobileW * 2 / 100,
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
  flagImage1: {
    width: mobileW * 4.6 / 100,
    height: mobileW * 4.6 / 100,
    borderRadius: mobileW * 2.3 / 100,
  },
  userName: {
    fontFamily: Font.FontSemiBold,
    color: Colors.blackColor,
    fontSize: mobileW * 3.8 / 100
  },
  dateTimeTxt: {
    fontFamily: Font.FontMedium,
    color: Colors.grayColour,
    fontSize: mobileW * 2.8 / 100
  },
  cameraIcon: {
    width: mobileW * 7.5 / 100,
    height: mobileW * 7.5 / 100
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
  }
})

