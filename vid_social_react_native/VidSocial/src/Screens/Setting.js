import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, Linking, Alert } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header';
import { localimag } from '../Provider/Localimageprovider/Localimage';
import { Lang_chg } from '../Provider/Language_provider';
import { Colors, Font, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import Footer from '../Provider/Footer';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { updateUserStatus } from '../Components/UserOfflineOnline';
import LinearGradient from 'react-native-linear-gradient';

export default function Setting({ navigation }) {

  const [languageSelection, setlanguageSelection] = useState(false)

  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languageArray = [
    { name: Lang_chg.English[config.language], code: 'en', localCode: 0, status: false },
    { name: Lang_chg.Spanish[config.language], code: 'es', localCode: 1, status: false },
  ];


  console.log('selectedLanguage------>>>', selectedLanguage);

  useEffect(() => {
    if (selectedLanguage != null) {
      var Language = selectedLanguage.localCode
      config.language = Language
    }
  }, [selectedLanguage])

  useEffect(() => {
    // 0 for English 1 for Spanish
    if (config.language == 0) {
      setSelectedLanguage(languageArray[0])
    } else {
      setSelectedLanguage(languageArray[1])
    }
  }, [])


  // ================ API CAlling For New User ===================
  const _UpdateUserLAnguage = async () => {
    var UserData = await localStorage.getItemObject("UserData")
    global.props.showLoader();
    let apiUrl = appBaseUrl.UpdateLanguage;

    var postData = JSON.stringify({
      Id: UserData.id,
      language: selectedLanguage.code
    });
    console.log(apiUrl, 'postData-----------', postData);
    const headers = {
      'Content-Type': 'application/json',
    };
     axios.post(apiUrl, postData, { headers })
      .then(async (response) => {
        console.log("signUpResponse--->", response.data);
        if (response.data.code == 200) {
          global.props.hideLoader();
          setlanguageSelection(false)
          msgProvider.toast(response.data.CallDetail, 'bottom')
        } else {
          global.props.hideLoader();
          alert(response.data.CallDetail)
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('Loginerror---', error);
      });
  }

  // ============================hansdle back press--------------------
  const LogOutAlert = () => {
    Alert.alert(

      Lang_chg.Holdon[config.language],
      Lang_chg.AreyousureyouwanttoExit[config.language], [{

        text: Lang_chg.No[config.language],

        onPress: () => console.log('Yes'),

        style: 'Yes',

      }, {
        textext: Lang_chg.Yes1[config.language],
        onPress: async () => {
          updateUserStatus('offline');
          setTimeout(async () => {
            await localStorage.removeItem("UserData")
            navigation.navigate('Login')
          }, 1000);
        }
      }], {
      cancelable: false
    }

    ); // works best when the goBack is async  
    return true;
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.languageView]}
        onPress={() => handleLanguageSelection(item)}>
        {selectedLanguage && selectedLanguage.code === item.code && (
          <Image
            resizeMode='contain'
            style={styles.dollarImage}
            source={localimag.Tick}
          />
        )}
        {selectedLanguage && selectedLanguage.code === item.code ?
          <Text style={styles.languageText}>  {item.name}</Text>
          :
          <Text style={styles.languageText}>       {item.name}</Text>
        }
      </TouchableOpacity>
    );
  };


  const handleLanguageSelection = (item) => {
    setSelectedLanguage(item);
  };

  return (
    <View style={styles.container}>

      <Header
        navigation={navigation}
        title={Lang_chg.Settings[config.language]}
        backIcon={true}
        firstImage={localimag.back_icon}
      ></Header>

      {/* ---- Withdraw Credits Modal Start ---- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageSelection}
        onRequestClose={() => { setlanguageSelection(!languageSelection) }}>
        <View
          style={styles.ModalBaseView}
        >
          <StatusBar backgroundColor={Colors.girlHeadercolor}
            barStyle='default' hidden={false} translucent={false}
            networkActivityIndicatorVisible={true} />

          <View
            style={styles.ModalBackView}
          >
            <View
              style={styles.ModalHeaderView}
            >
              <Image
                resizeMode='contain'
                style={styles.dollarImage}
              />
              <Text
                style={styles.ModalHeader}
              >{Lang_chg.SelectLang[config.language]}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setlanguageSelection(false)}
              >
                <Image
                  resizeMode='contain'
                  style={styles.dollarImage}
                  source={localimag.close}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languageArray}
              renderItem={renderItem}
              keyExtractor={(item) => item.code}
              contentContainerStyle={{ top: mobileH * 1 / 100 }}
            />
            <LinearGradient
              colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
              style={styles.OkButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                onPress={() => _UpdateUserLAnguage()}
                // onPress={() => {
                //     setWithdrawCreditsModal(false)
                //     setTimeout(() => {
                //         navigation.navigate('Withdraw')
                //     }, 1500);
                // }
                // }
                activeOpacity={0.6}
              >
                <Text style={styles.Oktxt}>{Lang_chg.DONE[config.language]}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ----  ---- */}
      <View style={{ borderRadius: 20, width: "90%", alignSelf: "center", top: mobileH * 3 / 100, }}>
        <View style={styles.ModalheadView}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EditProfileWorker')}
            style={{
              width: '100%', flexDirection: 'row', height: mobileH * 7 / 100,
              marginTop: mobileH * 3 / 100,
            }}>
            <Image
              resizeMode='contain'
              style={styles.onlineonuserImage}
              source={localimag.edit}
            />
            <Text style={styles.HeaderSettings}>    {Lang_chg.editprofile1[config.language]}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('HelpSupport')}
            style={{ width: '100%', flexDirection: 'row', height: mobileH * 7 / 100 }}>
            <Image
              resizeMode='contain'
              style={styles.onlineonuserImage}
              source={localimag.phone}
            />
            <Text style={styles.HeaderSettings}>    {Lang_chg.HelpSupports[config.language]}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setlanguageSelection(!languageSelection)}
            style={{ width: '100%', flexDirection: 'row', height: mobileH * 7 / 100 }}>
            <Image
              resizeMode='contain'
              style={styles.onlineonuserImage}
              source={localimag.translate}
            />
            <Text style={styles.HeaderSettings}>    {Lang_chg.languages[config.language]}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Terms', { pageName: Lang_chg.PrivacyPolicy1[config.language] })}
            style={{ width: '100%', flexDirection: 'row', height: mobileH * 7 / 100 }}>
            <Image
              resizeMode='contain'
              style={styles.onlineonuserImage}
              source={localimag.privacy_policy}
            />
            <Text style={styles.HeaderSettings}>    {Lang_chg.PrivacyPolicy1[config.language]}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Terms', { pageName: Lang_chg.TermsConditions1[config.language] })}
            style={{ width: '100%', flexDirection: 'row', height: mobileH * 7 / 100 }}>
            <Image
              resizeMode='contain'
              style={styles.onlineonuserImage}
              source={localimag.TANDC}
            />
            <Text style={styles.HeaderSettings}>   {Lang_chg.TermsConditions1[config.language]}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Warnings')}
            style={{ width: '100%', flexDirection: 'row', height: mobileH * 7 / 100 }}>
            <Image
              resizeMode='contain'
              style={styles.onlineonuserImage}
              source={localimag.warning}
            />
            <Text style={styles.HeaderSettings}>   {Lang_chg.Warnings[config.language]}</Text>
          </TouchableOpacity>

          {global.UserType == 0 &&
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Faq')}
              style={{ width: '100%', flexDirection: 'row', height: mobileH * 7 / 100 }}>
              <Image
                resizeMode='contain'
                style={styles.onlineonuserImage}
                source={localimag.faqquestion}
              />
              <Text style={styles.HeaderSettings}>    {Lang_chg.FAQ[config.language]}</Text>
              {/* <Text style={styles.HeaderSettings}>   {Lang_chg.Frequent_questions_for_user[config.language]}</Text> */}
            </TouchableOpacity>
          }

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              LogOutAlert()
            }
            }
            style={{ width: '100%', flexDirection: 'row', height: mobileH * 7 / 100 }}>
            <Image
              resizeMode='contain'
              style={styles.onlineonuserImage}
              source={localimag.logout1}
            />
            <Text style={styles.HeaderSettings}>    {Lang_chg.logout1[config.language]}</Text>
          </TouchableOpacity>
        </View>
      </View>


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
  ModalHeader: {
    fontSize: mobileW * 4 / 100,
    fontFamily: Font.FontSemiBold,
    color: Colors.blackColor
  },
  ModalBaseView: {
    backgroundColor: "#00000080",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  ModalBackView: {
    backgroundColor: Colors.whiteColor,
    width: mobileW * 80 / 100,
    borderRadius: mobileW * 3 / 100,
    height: mobileH * 32 / 100,
  },
  languageView: {
    width: '100%',
    height: mobileH * 7 / 100,
    top: mobileH * 2 / 100,
    // justifyContent: "center",
    paddingHorizontal: mobileW * 3 / 100,
    flexDirection: 'row'
  },
  languageText: {
    fontSize: mobileW * 4 / 100,
    fontFamily: Font.FontMedium,
    color: Colors.blackColor
  },
  onlineonuserImage: {
    width: mobileW * 6 / 100,
    height: mobileW * 6 / 100,
    tintColor: global.UserType == 0 ? Colors.blueColour : Colors.Pink
  },
  headView: {
    flexDirection: "row",
    justifyContent: 'space-between',
    width: '90%',
  },
  HeaderSettings: {
    fontFamily: Font.FontMedium,
    color: Colors.blackColor,
    fontSize: mobileW * 3.7 / 100,
  },
  OkButton: {
    alignSelf: "center",
    justifyContent: "center",
    height: mobileW * 11 / 100,
    width: mobileW * 45 / 100,
    alignItems: "center",
    borderRadius: mobileW * 2 / 100,
    marginTop: mobileH * 1 / 100,
    alignItems: "center",
    bottom: mobileW * 4 / 100
  },
  Oktxt: {
    fontFamily: Font.FontMedium,
    fontSize: mobileW * 4.2 / 100,
    color: Colors.whiteColor
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
  dollarImage: {
    width: mobileW * 5.5 / 100,
    height: mobileW * 5.5 / 100,
  },
})

