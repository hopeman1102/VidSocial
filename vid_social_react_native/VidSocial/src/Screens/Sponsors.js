import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import LinearGradient from 'react-native-linear-gradient';
import { RadioButton } from 'react-native-paper';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CommonAlert from '../Components/CommonAlert';

export default function Sponsors({ navigation }) {

  const [checked, setChecked] = React.useState(0);
  const [SponsorModal, setSponsorModal] = React.useState(false);
  const [LeaveSponsorModal, setLeaveSponsorModal] = React.useState(false);
  const [sponsor_id, setsponsor_id] = React.useState(0);

  const datas = [
    { name: 'Carlos p', sName: 'CP' }, { name: 'John K', sName: 'JK' },
    { name: 'David M', sName: 'DM' }, { name: 'Remo F', sName: 'RF' }]
  const [data, setdata] = useState(datas)
  const [GetallCoinstoshow, setGetallCoinstoshow] = useState('NA')
  const [SponserData, setSponserData] = useState('NA')

  const [CountryPickerModal, setCountryPickerModal] = useState(false)
  const [countryCode, setCountryCode] = useState('IN');
  const [CountryID, setCountryID] = useState(null)
  const [countryName, setCountryName] = useState(null);
  const [CountryDetails, setCountryDetails] = useState('NA')
  const [CountryFlag, setCountryFlag] = useState('')

  const [AlertModal, setAlertModal] = useState(false)
  const [AlertMessage, setAlertMessage] = useState('')

  const [LeaveSponsorModalForConf, setLeaveSponsorModalForConf] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      GetUserData()
    }, [])
  );

  const GetUserData = async () => {
    var UserData = await localStorage.getItemObject("UserData")
    setCountryFlag(UserData.country_flag)
    // setCountryID(UserData.country_name)
    console.log('UserDataTome', UserData);
  }

  useEffect(() => {
    console.log('i am call first time ',CountryID);
    GetallCoins()
    toGetAllCountry()
    GetSponsorDetails()
  }, [CountryID])

  // ---------- To get Sponsor
  const GetSponsorDetails = async () => {
    var Token = await localStorage.getItemString("AccessToken")

    global.props.showLoader();
    let apiUrl = appBaseUrl.ToGetSponsorId;

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'HttpOnly',
      'Authorization': 'Bearer ' + Token,
      'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
    };

    // Make a POST request using Axios 
    axios.get(apiUrl, { headers })
      .then(async (response) => {
        if (response.data.code == 200) {
          console.log(' Sponsor ID data is here -----', response.data.data);
          global.props.hideLoader();
          setsponsor_id(response.data.data.sponser_id)
          GetSponserData(response.data.data.sponser_id)
        } else {
          global.props.hideLoader();
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('Loginerror---22', error);
        // Handle errors
      });
  }

  const toGetAllCountry = () => {
    global.props.showLoader();
    let apiUrl = appBaseUrl.CountryList;
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'HttpOnly',
    };

    axios.get(apiUrl, { headers })
      .then(async (response) => {
        if (response.data.code == 200) {
          global.props.hideLoader();
          setCountryDetails(response.data.data)
        } else {
          global.props.hideLoader();
        }
      })
      .catch(error => {
        global.props.hideLoader();
        alert(error);
        console.log('Loginerror---', error);
      });
  }

  // ------------ Api call For Sponsor Profile Data ----------------
  const GetSponserData = async (sponser_id) => {
    var Token = await localStorage.getItemString("AccessToken")
    if (sponser_id == null) {
      sponser_id = 0
    } else {
      sponser_id = sponser_id
    }
    global.props.showLoader();
    let apiUrl = appBaseUrl.SponsorAssociateDetails + sponser_id;
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
        if (response.data.code == 200) {
          global.props.hideLoader();
          setSponserData(response.data.data)
        } else {
          global.props.hideLoader();
          // alert(response.data.error)
          setSponserData('NA')
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('Loginerror---22', error);
        // Handle errors
      });
  }

  // ------------ Api call For Get List of All Sponsor ----------------
  const GetallCoins = async () => {
    var Token = await localStorage.getItemString("AccessToken")
    console.log(Token);
    global.props.showLoader();

    if (CountryID == null) {
      var apiUrl = appBaseUrl.GetSponserList;
    }
    else {
      var apiUrl = appBaseUrl.GetSponserList + '?search=' + CountryID
    }
    console.log(CountryID,'apiUrl-------',apiUrl);
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
        console.log("All App Sponsors --->222", response.data.data);
        if (response.data.code == 200) {
          global.props.hideLoader();
          setGetallCoinstoshow(response.data.data)
        } else {
          // setCountryID(null)
          setGetallCoinstoshow('NA')
          global.props.hideLoader();
          // alert(response.data.error)
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('Loginerror---22', error);
        // Handle errors
      });
  }

  // ------------ Api call For Request Sponsor ----------------
  const _ToRequestSponsor = async (sponserData) => {
    var Token = await localStorage.getItemString("AccessToken")
    global.props.showLoader();
    let apiUrl = appBaseUrl.RequestSponse;
    var postData = JSON.stringify({
      sponser_id: sponserData.id
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
        console.log("_ToRequestSponsor--->222", response.data);
        if (response.data.code == 201) {
          global.props.hideLoader();
          // setCustomerInformation(response.data.data)
          setAlertMessage(response.data.message)
          setAlertModal(true)

          console.log("_ToRequestSponsor--->222", response.data);
        } else {
          if (response.data.status == "pending") {
            setLeaveSponsorModal(true)
            setsponsor_id(response.data.sponsor_id)
          } else {
            LeaveSponserFirst(response.data.message)
            // setAlertMessage(response.data.message)
            // setLeaveSponsorModalForConf(true)
          }
          global.props.hideLoader();
          // alert(response.data.message)
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('_ToRequestSponsor---22', error);
        // Handle errors
      });
  }

  // =============== Leave sponser api ===================
  const LeaveSponser = async () => {
    setLeaveSponsorModal(false)
    var result = await localStorage.getItemObject("UserData")
    var Token = await localStorage.getItemString("AccessToken")
    // var sponser_id = 1
    // if (result.sponser_id_id == null) {
    //   sponser_id = 1
    // } else {
    //   sponser_id = result.sponser_id_id
    // }
    global.props.showLoader();
    let apiUrl = appBaseUrl.LeaveSponser;
    var postData = JSON.stringify({
      sponser_id: sponsor_id
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
        console.log("_ToRequestSponsor--->222", response.data);
        if (response.data.code == 201) {
          global.props.hideLoader();
          // setCustomerInformation(response.data.data)
          console.log("_ToRequestSponsor--->222", response.data);
          setTimeout(() => {
            setSponsorModal(false)
            navigation.navigate('Wallet')
          }, 1000);
        } else {
          global.props.hideLoader();
          setSponsorModal(false)
          setAlertMessage(response.data.message)
          setAlertModal(true)
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('_ToRequestSponsor---22', error);
        // Handle errors
      });
  }

  // ------------Leave Sponsor Alert ----------------
  const LeaveSponserFirst = (message) => {
    console.log('=========================================');
    // return false
    Alert.alert(
      Lang_chg.LeaveSponser[config.language],
      message,
      [
        {
          text: Lang_chg.No[config.language],
        },
        {
          text: Lang_chg.Yes1[config.language],
          onPress: () => {
            setSponsorModal(true)
          }
        },
      ],
      { cancelable: false },
    );
  }

  const ApiCallingForDataReset = () => {
    // setTimeout(() => {
    //   GetallCoins()
    // }, 500);
    setCountryPickerModal(false)
  }

  const toSelectCountry = (item) => {
    for (let i = 0; i < CountryDetails.length; i++) {
      if (CountryDetails[i].id == item.id) {
        console.log('======>>>', item);
        setCountryCode(item.dial_code)
        setCountryID(item.name)
        setCountryName(item.name)
        setCountryFlag(item.flag_url)
      }
    }
    ApiCallingForDataReset()
  }

  return (
    <View style={styles.container}>
      {/* ------ App Common Alert -------- */}
      <CommonAlert AlertData={AlertMessage} mediamodal={AlertModal} Canclemedia={() => { setAlertModal(false), navigation.navigate('Wallet') }}
      />
      {/* ---- Withdraw Credits Modal Start ---- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={LeaveSponsorModal}
        onRequestClose={() => { setLeaveSponsorModalForConf(!LeaveSponsorModalForConf) }}>
        <View style={styles.ModalMainView}>
          <StatusBar backgroundColor={Colors.girlHeadercolor}
            barStyle='default' hidden={false} translucent={false}
            networkActivityIndicatorVisible={true} />
          <View style={{ borderRadius: 20, width: "100%" }}>
            <View style={styles.LeaveModalheadViewForWithdraw}>
              <View
                style={styles.LeaveModalHeaderView}
              >
                <Image
                  resizeMode='contain'
                  style={styles.dollarImage}
                />
                <View>
                  <Text
                    style={[styles.Callsin, {
                      fontSize: mobileW * 5 / 100,
                      fontFamily: Font.FontSemiBold
                    }]}
                  >{Lang_chg.Alert[config.language]}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setLeaveSponsorModalForConf(false)}
                >
                  <Image
                    resizeMode='contain'
                    style={styles.dollarImage}
                    source={localimag.close}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[styles.Callsin, {
                  fontSize: mobileW * 4 / 100,
                  top: mobileH * 3 / 100,
                  fontFamily: Font.FontSemiBold
                }]}
              >{AlertMessage}</Text>
              {/* ------------------------- */}
              <TouchableOpacity
                style={styles.LeaveOkButton}
                onPress={() => {
                  LeaveSponser()
                }}
                activeOpacity={0.6}
              >
                <LinearGradient
                  colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                  style={styles.LeaveOkButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >

                  <Text style={styles.Oktxt}>{Lang_chg.LEAVE[config.language]}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---- Withdraw Credits Modal Start ---- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={LeaveSponsorModal}
        onRequestClose={() => { setLeaveSponsorModal(!LeaveSponsorModal) }}>
        <View style={styles.ModalMainView}>
          <StatusBar backgroundColor={Colors.girlHeadercolor}
            barStyle='default' hidden={false} translucent={false}
            networkActivityIndicatorVisible={true} />
          <View style={{ borderRadius: 20, width: "100%" }}>
            <View style={styles.LeaveModalheadViewForWithdraw}>
              <View
                style={styles.LeaveModalHeaderView}
              >
                <Image
                  resizeMode='contain'
                  style={styles.dollarImage}
                />
                <View>
                  <Text
                    style={[styles.Callsin, {
                      fontSize: mobileW * 5 / 100,
                      fontFamily: Font.FontSemiBold
                    }]}
                  >{Lang_chg.Alert[config.language]}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setLeaveSponsorModal(false)}
                >
                  <Image
                    resizeMode='contain'
                    style={styles.dollarImage}
                    source={localimag.close}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[styles.Callsin, {
                  fontSize: mobileW * 4 / 100,
                  top: mobileH * 3 / 100,
                  fontFamily: Font.FontSemiBold
                }]}
              >{Lang_chg.Pleaseleavecurrentsponsorrequest[config.language]}</Text>
              {/* ------------------------- */}
              <TouchableOpacity
                style={styles.LeaveOkButton}
                onPress={() => {
                  LeaveSponser()
                }}
                activeOpacity={0.6}
              >
                <LinearGradient
                  colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                  style={styles.LeaveOkButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >

                  <Text style={styles.Oktxt}>{Lang_chg.LEAVE[config.language]}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---- Withdraw Credits Modal Start ---- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={SponsorModal}
        onRequestClose={() => { setSponsorModal(!SponsorModal) }}>
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
                      fontSize: mobileW * 4 / 100,
                      fontFamily: Font.FontSemiBold
                    }]}
                  >{Lang_chg.YourSponsoris[config.language]} </Text>
                  <Text
                    style={[styles.Callsin, {
                      fontSize: mobileW * 3.6 / 100,
                      fontFamily: Font.FontSemiBold,
                      color: Colors.Pink
                    }]}
                  >{SponserData.sponsor_name}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSponsorModal(false)}
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
                    fontSize: mobileW * 3.2 / 100,
                    fontFamily: Font.FontSemiBold,
                    color: Colors.blackColor
                  }]}
                >{Lang_chg.Sponsorshiptime[config.language]}</Text>
                <Text
                  style={[styles.Callsin, {
                    fontSize: mobileW * 3 / 100,
                    fontFamily: Font.FontMedium,
                    color: Colors.grayColour
                  }]}
                >{SponserData.sponsorship_days} Days</Text>
              </View>
              {/* ------------------------- */}
              {/* -------------------------- */}
              <View
                style={styles.LowerDataView}
              >
                <Text
                  style={[styles.Callsin, {
                    fontSize: mobileW * 3.2 / 100,
                    fontFamily: Font.FontSemiBold,
                    color: Colors.blackColor
                  }]}
                >{Lang_chg.Paymentsreceived[config.language]}</Text>
                <Text
                  style={[styles.Callsin, {
                    fontSize: mobileW * 3 / 100,
                    fontFamily: Font.FontMedium,
                    color: Colors.grayColour
                  }]}
                >{SponserData.count_of_payment_received}</Text>
              </View>
              {/* ------------------------- */}
              {/* -------------------------- */}
              <View
                style={styles.LowerDataView}
              >
                <Text
                  style={[styles.Callsin, {
                    fontSize: mobileW * 3.2 / 100,
                    fontFamily: Font.FontSemiBold,
                    color: Colors.blackColor
                  }]}
                >{Lang_chg.Totalmoneyreceived[config.language]}</Text>
                <Text
                  style={[styles.Callsin, {
                    fontSize: mobileW * 3 / 100,
                    fontFamily: Font.FontMedium,
                    color: Colors.grayColour
                  }]}
                >$ {SponserData.total_money_received}</Text>
              </View>
              {/* ------------------------- */}
              {/* -------------------------- */}
              <View
                style={styles.LowerDataView}
              >
                <Text
                  style={[styles.Callsin, {
                    fontSize: mobileW * 3.2 / 100,
                    fontFamily: Font.FontSemiBold,
                    color: Colors.blackColor
                  }]}
                >{Lang_chg.Usedfrequentpayment[config.language]}</Text>
                <Text
                  style={[styles.Callsin, {
                    fontSize: mobileW * 3 / 100,
                    fontFamily: Font.FontMedium,
                    color: Colors.grayColour
                  }]}
                >{SponserData.frequent_payment_method}</Text>
              </View>
              {/* ------------------------- */}
              <LinearGradient
                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                style={styles.OkButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity
                  onPress={() => {
                    LeaveSponser()
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={styles.Oktxt}>{Lang_chg.LEAVE[config.language]}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
      {/* ---- Withdraw Credits Modal End ---- */}

      {/* --------- Country Modal Start -------- */}
      {/* ---- CountryPicker Modal ---- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={CountryPickerModal}
        onRequestClose={() => { setCountryPickerModal(!CountryPickerModal) }}>
        <View style={styles.ModalMainView}>
          <StatusBar backgroundColor={Colors.themecolor}
            barStyle='default' hidden={false} translucent={false}
            networkActivityIndicatorVisible={true} />
          <View style={{ borderRadius: 20, width: "100%" }}>
            <View style={styles.CountryPickerModalheadView}>

              {/* -------------------------------------- */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: mobileW * 78 / 100 }}>
                <Image
                  resizeMode='contain'
                  style={{ width: mobileH * 3 / 100, height: mobileH * 3 / 100 }}
                />
                <Text style={{
                  textAlign: 'center', fontSize: mobileW * 4.5 / 100,
                  fontFamily: Font.FontSemiBold, color: Colors.blackColor
                }}>{Lang_chg.SelectCountry1[config.language]}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setCountryPickerModal(false)
                  }}>
                  <Image
                    resizeMode='contain'
                    style={{ width: mobileH * 2.5 / 100, height: mobileH * 2.5 / 100 }}
                    source={localimag.crossb}
                  />
                </TouchableOpacity>
              </View>
              {CountryDetails != 'NA' ?
                <FlatList
                  data={CountryDetails}
                  contentContainerStyle={{ paddingBottom: mobileH * 10 / 100 }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) =>
                    <TouchableOpacity
                      onPress={() => toSelectCountry(item)}
                      activeOpacity={0.8}
                      style={{ width: mobileW * 70 / 100, top: mobileH * 2.5 / 100, justifyContent: "space-around" }}>

                      <View style={{
                        width: mobileW * 70 / 100, height: mobileH * 7 / 100, borderBottomColor: Colors.appBackground,
                        borderBottomWidth: mobileW * 0.5 / 100, justifyContent: 'center',
                      }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Image
                            resizeMode='contain'
                            style={{ width: mobileH * 4 / 100, height: mobileH * 4 / 100 }}
                            source={{ uri: item.flag_url }}
                          />
                          <Text style={{
                            fontSize: mobileW * 2.8 / 100,
                            fontFamily: Font.FontSemiBold, color: Colors.blackColor
                          }}>     {item.name}</Text>
                          {CountryID == item.name ?
                            <Image
                              resizeMode='contain'
                              style={{
                                position: "absolute", right: 5, width: mobileH * 3 / 100,
                                height: mobileH * 3 / 100
                              }}
                              source={localimag.Tick}
                            /> : null
                          }
                        </View>
                      </View>
                    </TouchableOpacity>} />
                :
                <Text>{Lang_chg.NodataFound[config.language]}</Text>
              }

              {/* -------------------------------------- */}
              {/* <LinearGradient
                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                style={styles.OkButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity
                  onPress={() => {
                    ApiCallingForDataReset()
                  }
                  }
                  activeOpacity={0.6}
                >
                  <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                </TouchableOpacity>
              </LinearGradient> */}
            </View>
          </View>
        </View>
      </Modal>
      {/* --------- Country Modal End -------- */}

      <Header
        navigation={navigation}
        title={Lang_chg.Sponsorss[config.language]}
        backIcon={true}
        firstImage={localimag.back_icon}
      ></Header>
      {/* ------------------------------------ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {SponserData != 'NA' &&
          <View
            style={styles.SponsorName}
          >
            <View style={{ marginLeft: mobileW * 3 / 100 }}>
              <Text
                style={[styles.Callsin, {
                  fontSize: mobileW * 4 / 100,
                  fontFamily: Font.FontSemiBold
                }]}
              >{Lang_chg.Sponsors[config.language]} </Text>
              <Text
                style={[styles.Callsin, {
                  fontSize: mobileW * 3.8 / 100,
                  fontFamily: Font.FontSemiBold,
                  color: Colors.Pink
                }]}
              >{SponserData.sponsor_name}</Text>
            </View>
          </View>}
        {/* ----  ---- */}
        <View style={styles.informationBaseView}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', width: '89%', alignSelf: 'center' }}
          >
            <Text style={{
              fontFamily: Font.FontSemiBold,
              color: Colors.blackColor,
              fontSize: mobileW * 3.5 / 100
            }}>{Lang_chg.Sponsors_in_country[config.language]}</Text>
            <TouchableOpacity
              onPress={() => setCountryPickerModal(true)}
              style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                resizeMode='cover'
                style={styles.flagImagees}
                source={CountryFlag == '' ? localimag.flagonimage : { uri: CountryFlag }}
              />
              <View style={{ width: mobileW * 20 / 100, left: mobileW * 1 / 100 }}>
                <Text style={[styles.dateTimeTxt, { fontSize: mobileW * 3 / 100 }]}>{countryName == null ? 'All Countries' : countryName}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {countryName != null &&
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {setCountryID(null), setCountryName(null), setCountryFlag('') }}
              style={{ left: mobileW * 70 / 100, width: mobileW * 6 / 100, alignItems: "center" }}>
              <Image
                resizeMode='contain'
                style={{ width: mobileH * 2.5 / 100, height: mobileH * 2.5 / 100 }}
                source={localimag.crossb}
              />
            </TouchableOpacity>}
          {GetallCoinstoshow != 'NA' ?
            <FlatList
              data={GetallCoinstoshow}
              contentContainerStyle={{ paddingBottom: mobileH * 10 / 100 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) =>
                <View style={[styles.SecondBaseView, {}]}>
                  {/* <View
                    style={{
                      backgroundColor: "#e6f8fe", width: mobileW * 9.5 / 100, height: mobileW * 9.5 / 100,
                      borderRadius: mobileW * 4.85 / 100, alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Text style={{



                      fontFamily: Font.FontSemiBold,
                      color: Colors.blueColour,
                      fontSize: mobileW * 3.5 / 100,
                    }}>{item.display_name[0].toUpperCase()}</Text>
                  </View> */}
                  <Image resizeMode='contain'
                    style={{
                      width: mobileW * 7 / 100, height: mobileH * 7 / 100
                    }}
                    source={{ uri: item.country_flag_url }}
                  ></Image>
                  <View
                    style={{ width: mobileW * 30 / 100 }}
                  >
                    <Text style={{
                      fontFamily: Font.FontSemiBold,
                      color: Colors.blackColor,
                      fontSize: mobileW * 3 / 100,
                    }}>  {item.display_name}</Text>
                  </View>
                  <LinearGradient
                    colors={['#FF87A4', '#92B8FD']}
                    style={styles.OkButton1}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        _ToRequestSponsor(item)
                      }
                      }
                      activeOpacity={0.6}
                    >
                      <Text style={styles.Oktxt1}>{Lang_chg.REQUESTSPONSOR[config.language]}</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              } />
            :
            <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: mobileH * 60 / 100, }}>
              <Image resizeMode='contain' style={{ width: mobileW * 80 / 100, height: mobileH * 20 / 100, marginBottom: mobileW * 10 / 100 }}
                source={localimag.nodata}
              >
              </Image>

            </View>
          }
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
  informationBaseView: {
    alignSelf: 'center',
    backgroundColor: Colors.whiteColor,
    width: mobileW * 90 / 100,
    paddingVertical: mobileH * 3.5 / 100,
    marginTop: mobileH * 3 / 100,
    borderRadius: mobileW * 1.5 / 100,
    elevation: 2,
    justifyContent: "space-around",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, },
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  SecondBaseView: {
    flexDirection: "row",
    width: '100%',
    marginTop: mobileH * 2 / 100,
    alignItems: 'center',
    height: mobileH * 9 / 100,
    paddingHorizontal: mobileW * 4 / 100,
    justifyContent: 'space-between',
    borderBottomColor: Colors.grayColour,
    borderBottomWidth: mobileW * 0.18 / 100
  },
  dollarImage: {
    width: mobileW * 6.5 / 100,
    height: mobileW * 6.5 / 100,
    marginTop: mobileH * 0.5 / 100
  },
  OkButton1: {
    alignSelf: "center",
    justifyContent: "center",
    height: mobileW * 6.8 / 100,
    width: mobileW * 41 / 100,
    alignItems: "center",
    borderRadius: mobileW * 5 / 100,
    alignItems: "center"
  },
  Oktxt1: {
    fontFamily: Font.FontMedium,
    fontSize: mobileW * 2.4 / 100,
    color: Colors.whiteColor
  },
  flagImagees: {
    width: mobileW * 5.5 / 100,
    height: mobileW * 5.5 / 100,
    borderRadius: mobileW * 2.5 / 100,
    borderWidth: mobileW * 0.15 / 100,
    borderColor: Colors.darkGray
  },
  dateTimeTxt: {
    fontFamily: Font.FontSemiBold,
    color: Colors.blackColor,
    fontSize: mobileW * 2.5 / 100
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
    borderRadius: mobileW * 6 / 100,
    width: "100%",
    height: mobileH * 25 / 100,
    alignItems: 'center'
  },
  ModalheadViewForWithdraw: {
    backgroundColor: "#ffffff",
    alignSelf: 'center',
    borderRadius: mobileW * 6 / 100,
    width: "100%",
    height: mobileH * 45 / 100,
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
  textAlignextInputBaseView: {
    height: mobileW * 11 / 100,
    width: mobileW * 72 / 100,
    alignSelf: "center",
    justifyContent: 'center',
    marginTop: mobileW * 3.5 / 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderColour,
    borderRadius: mobileW * 2 / 100
  },
  inputImageStyle: {
    width: mobileW * 4 / 100,
    height: mobileW * 4 / 100,
    marginTop: mobileH * -0.5 / 100
  },
  textInputStyle: {
    width: mobileW * 67 / 100,
    fontFamily: Font.FontMedium,
    fontSize: mobileW * 2.8 / 100,
    marginLeft: mobileW * 1.7 / 100,
    color: Colors.darkGray,
  },
  AmountValue: {
    fontFamily: Font.FontMedium,
    color: Colors.blackColor,
    fontSize: mobileW * 4 / 100,
    // marginTop:mobileH*1/100
  },
  OkButton: {
    alignSelf: "center",
    justifyContent: "center",
    height: mobileW * 11 / 100,
    width: mobileW * 45 / 100,
    alignItems: "center",
    borderRadius: mobileW * 2 / 100,
    marginTop: mobileH * 3 / 100,
    alignItems: "center"
  },
  Oktxt: {
    fontFamily: Font.FontMedium,
    fontSize: mobileW * 4.2 / 100,
    color: Colors.whiteColor
  },
  Callsin: {
    fontFamily: Font.FontMedium,
    color: Colors.blackColor,
    fontSize: mobileW * 2.7 / 100,
    // marginTop:mobileH*1/100
  },
  LowerDataView: {
    width: mobileW * 90 / 100,
    height: mobileH * 5 / 100,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: mobileW * 5 / 100,
    justifyContent: 'space-between'
  },
  SponsorName: {
    backgroundColor: Colors.whiteColor,
    paddingVertical: mobileW * 3 / 100,
    width: mobileW * 88 / 100,
    alignSelf: 'center',
    marginTop: mobileH * 2 / 100,
    borderRadius: mobileW * 3 / 100
  },
  ModalMainView: {
    backgroundColor: "#00000080",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  CountryPickerModalheadView: {
    backgroundColor: "#ffffff",
    alignSelf: 'center',
    borderRadius: 20,
    width: "95%",
    paddingVertical: 20,
    height: mobileH * 90 / 100,
    alignItems: 'center',
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
  ModalheadView: {
    backgroundColor: "#ffffff",
    alignSelf: 'center',
    borderRadius: 20,
    width: "95%",
    paddingVertical: 20,
    height: mobileH * 45 / 100,
    alignItems: 'center'
  },
  DatePickerModalheadView: {
    backgroundColor: "#ffffff",
    alignSelf: 'center',
    borderRadius: 20,
    width: mobileW * 100 / 100,
    paddingVertical: 20,
    height: mobileH * 58 / 100,
    alignItems: 'center'
  },
  congratstxt: {
    color: Colors.blackColor,
    fontSize: mobileW * 6.5 / 100,
    fontFamily: Font.FontSemiBold,
    alignSelf: 'center',
    marginTop: mobileH * 1.5 / 100
  },
  idPhototxt: {
    color: Colors.blackColor,
    fontSize: mobileW * 3.1 / 100,
    fontFamily: Font.FontRegular,
    alignSelf: 'center',
  },
  OkButton: {
    alignSelf: "center",
    justifyContent: "center",
    height: mobileW * 11 / 100,
    width: mobileW * 45 / 100,
    alignItems: "center",
    borderRadius: mobileW * 2 / 100,
    marginTop: mobileH * 3 / 100,
    alignItems: "center"
  },
  TakeIdView: {
    alignSelf: "center",
    justifyContent: "center",
    height: mobileW * 10 / 100,
    width: mobileW * 40 / 100,
    alignItems: "center",
    borderRadius: mobileW * 2 / 100,
    marginTop: mobileH * 4 / 100
  },
  Oktxt: {
    fontFamily: Font.FontMedium,
    fontSize: mobileW * 4.2 / 100,
    color: Colors.whiteColor
  },
  Modaltxt: {
    fontFamily: Font.FontRegular,
    color: Colors.darkGray,
    fontSize: mobileW * 4 / 100,
    textAlign: 'center',
    width: mobileW * 75 / 100
  },
  LeaveModalheadViewForWithdraw: {
    backgroundColor: "#ffffff",
    alignSelf: 'center',
    borderRadius: mobileW * 6 / 100,
    width: "100%",
    height: mobileH * 33 / 100,
    alignItems: 'center'
  },
  LeaveModalHeaderView: {
    width: '100%', height: mobileH * 11 / 100,
    borderBottomWidth: mobileW * 0.3 / 100,
    borderBottomColor: Colors.grayColour,
    alignItems: "center",
    flexDirection: 'row',
    paddingHorizontal: mobileW * 5 / 100,
    justifyContent: 'space-between'
  },
  LeaveOkButton: {
    alignSelf: "center",
    justifyContent: "center",
    height: mobileW * 11 / 100,
    width: mobileW * 45 / 100,
    alignItems: "center",
    borderRadius: mobileW * 2 / 100,
    marginTop: mobileH * 6 / 100,
    alignItems: "center",
  },
})



