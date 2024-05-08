import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, Modal, StatusBar, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export default function SignUP({ route, navigation }) {
  const [name, setName] = useState('');
  const [email, setemail] = useState('');
  const [NickName, setNickName] = useState('');
  const [password, setpassword] = useState("");
  const [cpassword, setcpassword] = useState("");
  const [secureText, setSecureText] = useState(false);
  const [secureTextRepeat, setSecureTextRepeat] = useState(false);
  const [PassShow, setPassShow] = useState(true);
  const [CPassShow, setCPassShow] = useState(true);

  const [languageSelection, setlanguageSelection] = useState(false)

  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languageArray = [
    { name: Lang_chg.English[config.language], code: 'en', localCode: 0, status: false },
    { name: Lang_chg.Spanish[config.language], code: 'es', localCode: 1, status: false },
  ];

  useEffect(() => {
    if (selectedLanguage != null) {
      var Language = selectedLanguage.localCode
      config.language = Language
    }
  }, [selectedLanguage])

  useFocusEffect(
    React.useCallback(async () => {
      // 0 for English 1 for Spanish
      console.log('------->>>', config.language);
      if (config.language == 0) {
        setSelectedLanguage(languageArray[0])
      } else {
        setSelectedLanguage(languageArray[1])
      }
    }, [])
  );

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

  const isDataClear = route.params?.isDataClear
  if (isDataClear) {

  }

  useEffect(() => {
    ToGetUserData()
  }, [])

  const ToGetUserData = async () => {
    console.log('i am ere in localstorage calling');
    var result = await localStorage.getItemObject("UserDataForSignup")
    console.log('result is here ---->>', result);
    if (result != null) {
      console.log('hello i am here ', result.first_name);
      setemail(result.email)
      setName(result.first_name)
      setNickName(result.display_name)
    }
  }

  const SignUpUser = () => {

    //email============================
    if (email.length <= 0) {
      msgProvider.toast(Lang_chg.emptyEmail[config.language], 'bottom')
      return false
    }
    if (email.length > 50) {
      msgProvider.toast(Lang_chg.emailMaxLength[config.language], 'bottom')
      return false
    }
    var reg = config.emailvalidation;
    if (reg.test(email) !== true) {
      msgProvider.toast(Lang_chg.validEmail[config.language], 'bottom')
      return false
    }

    // Check if email is from outlook.com
    var emailDomain = email.split('@')[1];
    if (emailDomain === 'outlook.com' || emailDomain === 'Outlook.com' || emailDomain === 'hotmail.com' || emailDomain === 'Hotmail.com') {
      msgProvider.toast(Lang_chg.outLookHotmail[config.language], 'bottom')
      return false
    }

    //------------------name===================
    if (name.length <= 0) {
      msgProvider.toast(Lang_chg.emptyFullName[config.language], 'bottom')
      return false
    }
    if (name.length <= 2) {
      msgProvider.toast(Lang_chg.fullNameMinLength[config.language], 'bottom')
      return false
    }
    var namevalidation = config.namevalidationNum;
    if (namevalidation.test(name) !== true) {
      msgProvider.toast(Lang_chg.nameNumCheck[config.language], 'bottom')
      return false
    }

    //------------------name===================
    if (NickName.length <= 0) {
      msgProvider.toast(Lang_chg.emptyNickName[config.language], 'bottom')
      return false
    }

    //password===================
    if (password.length <= 0) {
      msgProvider.toast(Lang_chg.emptyPassword[config.language], 'bottom')
      return false
    }
    if (password.length < 8) {
      msgProvider.toast(Lang_chg.passwordMinLength[config.language], 'bottom')
      return false
    }
    // var pattern = config.passwordvalidation;
    // if (pattern.test(password) !== true) {
    //   msgProvider.toast(Lang_chg.passFormate[config.language], 'bottom')
    //   return false
    // }
    var numberValidation = config.numberValidation;
    var spacailValidation = config.spacailValidation;
    var upperCaseValidation = config.upperCaseValidation;

    if (password == '' || password.length < 8 || numberValidation.test(password) !== true
      || spacailValidation.test(password) !== true || upperCaseValidation.test(password) !== true) {
      msgProvider.toast(Lang_chg.passFormate[config.language], 'bottom')
      return false
    }

    var pattern = config.spaceValidation;
    if (pattern.test(password) !== true) {
      msgProvider.toast(Lang_chg.validPassword[config.language], 'bottom')
      return false
    }
    if (password.length > 16) {
      msgProvider.toast(Lang_chg.passwordMaxLength[config.language], 'bottom')
      return false
    }
    //==================================confirmpassword===================
    if (cpassword.length <= 0) {
      msgProvider.toast(Lang_chg.cPassBlank[config.language], 'bottom')
      return false
    }

    if (cpassword.length < 8) {
      msgProvider.toast(Lang_chg.cPassCharLess[config.language], 'bottom')
      return false
    }
    // var pattern = config.passwordvalidation;
    // if (pattern.test(password) !== true) {
    //   msgProvider.toast(Lang_chg.passFormate[config.language], 'bottom')
    //   return false
    // }
    var numberValidation = config.numberValidation;
    var spacailValidation = config.spacailValidation;
    var upperCaseValidation = config.upperCaseValidation;

    if (cpassword == '' || cpassword.length < 8 || numberValidation.test(cpassword) !== true
      || spacailValidation.test(cpassword) !== true || upperCaseValidation.test(cpassword) !== true) {
      msgProvider.toast(Lang_chg.passFormate[config.language], 'bottom')
      return false
    }
    var pattern = config.spaceValidation;
    if (pattern.test(password) !== true) {
      msgProvider.toast(Lang_chg.validPassword[config.language], 'bottom')
      return false
    }
    if (password.length > 16) {
      msgProvider.toast(Lang_chg.passwordMaxLength[config.language], 'bottom')
      return false
    }
    if (cpassword !== password) {
      msgProvider.toast(Lang_chg.cPassNotMatch[config.language], 'bottom')
      return false
    }

    _signUpApiCalling()

  }


  // ================ API CAlling For New User ===================
  const _signUpApiCalling = async () => {
    global.props.showLoader();
    let apiUrl = appBaseUrl.SignUpFirstUrl;

    var postData = JSON.stringify({
      NickName: NickName,
      Email: email,
      language: selectedLanguage.code
    });

    console.log("postDataValidation--->", postData);
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'HttpOnly',
      'Accept': "*/*"
    };

    axios.post(apiUrl, postData, { headers })
      .then(async (response) => {
        console.log("signUpResponseCheckValidation--->", response.data);
        if (response.data.code == 200) {
          global.props.hideLoader();

          console.log('i am here ');
          navigation.navigate('SignUP1', {
            name: name,
            email: email,
            password: password,
            display_name: NickName,
            language: selectedLanguage.code
          })
        } else if (response.data.code == 400) {
          global.props.hideLoader();

          msgProvider.toast(response.data.message, 'bottom')
        } else {
          global.props.hideLoader();

          msgProvider.toast(response.data.message, 'bottom')
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('SignEerror---', error);
        if (error.response) {
          // alert(error.response.data.message);
          msgProvider.toast(error.response.data.message, 'bottom')
          console.error('Server Error Data:', error.response.data.message);
          console.error('Server Error Status:', error.response.status);
          console.error('Server Error Headers:', error.response.headers);
        }
      });
  }


  return (
    <View style={styles.container}>

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
                onPress={() => setlanguageSelection(false)}
                activeOpacity={0.6}
              >
                <Text style={styles.Oktxt}>{Lang_chg.DONE[config.language]}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ----  ---- */}

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground style={styles.imageBackStyle}
          imageStyle={{ height: mobileH, width: mobileW }}
          source={localimag.Background}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => { localStorage.clear(), navigation.navigate('Login') }}
          >
            <Image
              resizeMode='contain'
              style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, top: mobileH * 3 / 100, left: mobileW * 7 / 100 }}
              source={localimag.back_icon}
            />
          </TouchableOpacity>
          {/* ---- Main Container ---- */}
          <View style={styles.mainContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '25%' }}>
              <Text style={{
                width: mobileW * 65 / 100, fontSize: mobileW * 4.5 / 100,
                fontFamily: Font.FontBold, color: Colors.blueColour,
                textAlign: "center"
              }}>{Lang_chg.cretaeAcc[config.language]}</Text>
              <Text style={{
                width: mobileW * 65 / 100, fontSize: mobileW * 3.3 / 100,
                fontFamily: Font.FontMedium, color: Colors.darkGray,
                textAlign: "center", marginTop: mobileH * 1 / 100, width: '80%'
              }}>{Lang_chg.AccCreatewith[config.language]}</Text>
            </View>
            {/* --- TextInput Email --- */}
            <View style={styles.textAlignextInputBaseView}>
              <Image
                resizeMode='contain'
                style={styles.inputImageStyle}
                source={localimag.user_email}
              />
              <TextInput
                value={"" + email + ""}
                maxLength={100}
                autoCapitalize="none"
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.email1[config.language]}
                onChangeText={(txt) => { setemail(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <Image
                resizeMode='contain'
                style={styles.inputImageStyle}
                source={localimag.icon_user}
              />
              <TextInput
                value={"" + name + ""}
                maxLength={100}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.fullname1[config.language]}
                onChangeText={(txt) => { setName(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <Image
                resizeMode='contain'
                style={styles.inputImageStyle}
                source={localimag.icon_user}
              />
              <TextInput
                value={"" + NickName + ""}
                maxLength={11}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.Nikename1[config.language]}
                onChangeText={(txt) => { setNickName(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            {/* <View style={styles.textAlignextInputBaseView}>
              <Image
                resizeMode='contain'
                style={styles.inputImageStyle}
                source={localimag.user_pass}
              />
              <TextInput
                // value={"" + this.state.email + ""}
                maxLength={16}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder='Password'
                secureTextEntry={true}
                onChangeText={(txt) => { setpassword(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View> */}
            <View style={styles.textAlignextInputBaseView}>
              <Image
                resizeMode='contain'
                style={styles.inputImageStyle}
                source={localimag.user_pass}
              />
              <TextInput
                secureTextEntry={PassShow}
                maxLength={16}
                onChangeText={(txt) => { setpassword(txt) }}
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.Password5[config.language]}
                autoCapitalize="none"
                style={[styles.textInputStyle, { width: mobileW * 57 / 100 }]}
              ></TextInput>
              <TouchableOpacity
                onPress={() => setPassShow(!PassShow)}
                activeOpacity={0.8}
              >
                <Image
                  resizeMode='contain'
                  style={styles.inputImageStyle}
                  source={PassShow ? localimag.eye : localimag.eye_close}
                />
              </TouchableOpacity>
            </View>
            {/* --- TextInput Password --- */}
            {/* <View style={styles.textAlignextInputBaseView}>
              <Image
                resizeMode='contain'
                style={styles.inputImageStyle}
                source={localimag.user_pass}
              />
              <TextInput
                // value={"" + this.state.email + ""}
                maxLength={16}
                keyboardType='email-address'
                secureTextEntry={true}
                placeholderTextColor={Colors.darkGray}
                placeholder='Repeat Password'
                onChangeText={(txt) => { setcpassword(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View> */}
            <View style={styles.textAlignextInputBaseView}>
              <Image
                resizeMode='contain'
                style={styles.inputImageStyle}
                source={localimag.user_pass}
              />
              <TextInput
                secureTextEntry={CPassShow}
                maxLength={16}
                onChangeText={(txt) => { setcpassword(txt) }}
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.Repeatpassword1[config.language]}
                autoCapitalize="none"
                style={[styles.textInputStyle, { width: mobileW * 57 / 100 }]}
              ></TextInput>
              <TouchableOpacity
                onPress={() => setCPassShow(!CPassShow)}
                activeOpacity={0.8}
              >
                <Image
                  resizeMode='contain'
                  style={styles.inputImageStyle}
                  source={CPassShow ? localimag.eye : localimag.eye_close}
                />
              </TouchableOpacity>
            </View>

            {/* --- Login Button --- */}
            <View style={{ marginTop: mobileH * 3 / 100 }}>
              <CommonButton onPressClick={() => SignUpUser()} title={Lang_chg.NEXT1[config.language]}></CommonButton>
            </View>
            <View
              style={{
                width: '100%',
                alignItems: "center", justifyContent: 'flex-end',
                flexDirection: 'row', height: mobileH * 7 / 100,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setlanguageSelection(!languageSelection)}
                style={{
                  alignItems: "center", right: mobileW * 6 / 100,
                  flexDirection: 'row',
                }}>
                <Image
                  resizeMode='contain'
                  style={styles.onlineonuserImage}
                  source={localimag.translate}
                />
                <Text style={styles.HeaderSettings}>  {Lang_chg.languages[config.language]}</Text>
              </TouchableOpacity>
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
    height: mobileH, width: mobileW
  },
  mainContainer: {
    backgroundColor: Colors.appBackground,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    height: mobileH * 70 / 100,
    width: mobileW * 85 / 100,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: mobileW * 5 / 100,
    marginTop: mobileH * 12 / 100
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
  ModalHeader: {
    fontSize: mobileW * 4 / 100,
    fontFamily: Font.FontSemiBold,
    color: Colors.blackColor
  },
  onlineonuserImage: {
    width: mobileW * 6 / 100,
    height: mobileW * 6 / 100,
    tintColor: Colors.blueColour
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
  HeaderSettings: {
    fontFamily: Font.FontRegular,
    color: Colors.blackColor,
    fontSize: mobileW * 3.7 / 100,
  },
  inputImageStyle: {
    width: mobileW * 4 / 100,
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
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: 'space-between',
    marginTop: mobileH * 1 / 100
  },
  Remembertxt: {
    fontFamily: Font.FontSemiBold,
    color: Colors.darkGray,
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
    color: Colors.blueColour,
    fontSize: mobileW * 2.8 / 100
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

