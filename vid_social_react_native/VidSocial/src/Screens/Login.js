import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, BackHandler, Alert, PermissionsAndroid, Platform, Modal, StatusBar, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import CommonAlert from '../Components/CommonAlert';
import { LoginUser } from '../Firebase/LoginUser';
import { updateUserStatus } from '../Components/UserOfflineOnline';
import { notificationListener, requestPermissionForDevice, requestUserPermission } from '../Provider/Notification/PushController';
import LinearGradient from 'react-native-linear-gradient';

export default function Login({ navigation }) {
  const [name, setName] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState("");
  const [PassShow, setPassShow] = useState(true);
  const [RememberMe, setRememberMe] = useState(false);
  const [AlertModal, setAlertModal] = useState(false)
  const [AlertModalForNavigation, setAlertModalForNavigation] = useState(false)
  const [AlertMessage, setAlertMessage] = useState('')

  useFocusEffect(
    React.useCallback(async () => {
      CheckRememberMe()
      requestPermissionForDevice();
      requestUserPermission();
      console.log(' hello =======================================');
      const handleBackPress = () => {
        navigation.goBack();
        // backAction()
        // Handle the back button press on this screen
        return true; // Return true to prevent default behavior (e.g., navigate back)
      };

      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, [])
  );

  const CheckRememberMe = async () => {
    var RememberData = await localStorage.getItemString("RememberMe")
    console.log('==============>>>', RememberData);
    if (RememberData != null) {
      var UserEmail = await localStorage.getItemString("UserEmail")
      var UserPassword = await localStorage.getItemString("UserPassword")
      setemail(UserEmail)
      setpassword(UserPassword)
      setRememberMe(true)
    } else {
      setemail("")
      setpassword("")
    }
  }

  useEffect(() => {
    // clearData()
    // toClearData()
    setemail("")
    setpassword("")
    VideoCallingPermission()
  }, [])


  const VideoCallingPermission = async () => {
    if (Platform.OS === 'android') { await getPermission() };
  }

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  const backAction = () => {
    Alert.alert(
      Lang_chg.Holdon[config.language],
      Lang_chg.AreyousureyouwanttoExit[config.language], [{
        text: Lang_chg.No[config.language],
        style: 'Yes',
      }, {
        text: Lang_chg.Yes1[config.language],
        onPress: () => BackHandler.exitApp()
      }], {
      cancelable: false
    }
    ); // works best when the goBack is async
    return true;
  }

  const AppUserLogin = async () => {

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
    if (password.length > 16) {
      msgProvider.toast(Lang_chg.passwordMaxLength[config.language], 'bottom')
      return false
    }




    _loginApiCalling()

  }


  const clearData = () => {
    setemail("")
    setpassword("")
  }

  const _loginApiCalling = async () => {


    // --------------- Login User on Firebase ---------------
    LoginUser(email, '123456').
      then(async (res) => {
        console.log('User FireBase LoginSuccess----->>>>', res);
      }).
      catch((err) => {
        console.log(err);
      })


    let FCM_TOKEN = await AsyncStorage.getItem('fcmTocken')
    console.log('FCM_TOKEN===>>NewLogin', FCM_TOKEN);



    global.props.showLoader();
    let apiUrl = appBaseUrl.LoginUrl;

    console.log('apiUrl=======================>>>>>>>>>', apiUrl);

    var postData = JSON.stringify({
      email: email,
      password: password,
      device_id: FCM_TOKEN

    });

    console.log('FCM_TOKEN===>>postData', postData);

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'HttpOnly'
    };

    // Make a POST request using Axios
    axios.post(apiUrl, postData, { headers })
      .then(async (response) => {
        // Handle the successful response
        console.log("LoginResponse--->222", response);
        if (response.data.code == 200) {
          global.props.hideLoader();
          await localStorage.setItemString("AccessToken", response.data.access)
          await localStorage.setItemObject("UserData", response.data.data)
          var UserLoginAccess = response.data.data.is_mail_verified
          var UserAdminApprove = response.data.data.account_approval_state
          var UserType = response.data.data.role_id
          var UserGender = response.data.data.gender
          var SignupStep = response.data.data.signup_step
          console.log("LoginResponse--->222", response.data.access);
          console.log('UserLoginAccess', UserLoginAccess);
          var language = response.data.data.language
          console.log('user Language -------->>>', language);
          // "language": "es",
          //  To set User Language ==============
          if (language == 'en') {
            config.language = 0
          } else {
            config.language = 1
          }

          updateUserStatus('online')
          // --- if User type ==  User so it can be navigate to Home Customer      //////// approve
          if (UserType == 'user') {
            if (UserLoginAccess == true) {
              // --- if User Gender ==  male so it can be navigate to Home Customer 
              if (UserGender == 'male') {
                global.UserType = 0;
                setTimeout(() => {
                  navigation.navigate('Home_c')
                }, 500);
              } else {
                global.UserType = 1;
                setTimeout(() => {
                  navigation.navigate('Home_c')
                }, 500);
              }
            } else {
              global.props.hideLoader();
              setTimeout(() => {
                setAlertMessage(response.data.error)
                setAlertModal(true)
                // alert('Your accont is not verified, Please verify first')
              }, 500);
            }
          } else {
            console.log('hello i am here');
            // Page Navigation According to SignUp Steps Worker Side ----
            if (SignupStep == 1) {
              global.UserType = 1;
              setTimeout(() => {
                navigation.navigate('TakePicture')
              }, 1000);
            } else if (SignupStep == 2) {
              setTimeout(() => {
                navigation.navigate('VideoRecording')
              }, 1000);
            } else if (SignupStep == 3) {
              global.UserType = 1;
              if (UserLoginAccess == true) {
                setTimeout(() => {
                  navigation.navigate('Home')
                }, 800);
              } else {
                global.props.hideLoader();
                setTimeout(() => {
                  // alert('Your accont is not verified, Please verify first')  
                  // if (response.data.data.account_approval_state != 'none') {
                  setAlertMessage(Lang_chg.Accountisnotverifyplease[config.language])
                  setAlertModal(true)
                }, 500);
              }
            }
          }
          if (RememberMe) {
            await localStorage.setItemString("RememberMe", "true")
            await localStorage.setItemString("UserEmail", email)
            await localStorage.setItemString("UserPassword", password)
            console.log('I am here in check !!!!!!!!!!!!', RememberMe);
          } else {
            console.log('data erased I am here in Un-check !!!!!!!!!!!!');
            await localStorage.removeItem("RememberMe")
            setemail("")
            setpassword("")
          }
        } else {
          global.props.hideLoader();
          console.log("LoginResponse--->33333", response.data);
          // alert(response.data.error)
          // =============== For Managing Account Declined By Admin  =================

          if (response.data.data != null) {
            var UserData = response.data.data
            var UserTypeForNavigation = response.data.data.role_id
            console.log(UserData.account_approval_state);
            if (UserData.is_mail_verified == true) {
              if (UserTypeForNavigation == 'worker') {
                if (UserData.account_approval_state != 'none') {
                  console.log('UserData is here ---->>>>', UserData);

                  // await localStorage.setItemObject("UserData", UserData)
                  var ToSetData = {
                    email: UserData.email,
                    last_name: UserData.first_name,
                    first_name: UserData.first_name,
                    display_name: UserData.display_name,
                    id: UserData.id,
                    identity_no: UserData.identity_no,
                    phone: UserData.phone,
                    country_id: UserData.country_id,
                    date_of_birth: UserData.date_of_birth,
                    gender: UserData.gender,
                    role_id: UserData.role_id,
                  }
                  console.log('ToSetData-------', ToSetData);
                  await localStorage.setItemObject("UserDataForSignup", ToSetData)
                  setAlertMessage(response.data.error)
                  setAlertModal(true)
                  setAlertModalForNavigation(true)
                } else {
                  setAlertMessage(response.data.error)
                  setAlertModal(true)
                  setAlertModalForNavigation(false)

                }
              }
            }
            else {
              setAlertModal(true)
              setAlertMessage(response.data.error)
              setAlertModalForNavigation(false)
            }
          } else {
            setAlertModal(true)
            setAlertMessage(response.data.error)
          }
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('Loginerror---2244', error);
        // setAlertModal(true)
        // setAlertMessage(error.error.message)
        // Handle errors
      });
  }

  // ============================================
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

      {/* ------- Custom Alert Message --------- */}
      <CommonAlert AlertData={AlertMessage} mediamodal={AlertModal}
        Canclemedia={() => {
          AlertModalForNavigation ? (setAlertModal(false), setTimeout(() => {
            navigation.navigate('SignUP')
          },
            1000)) : setAlertModal(false)
        }}
      />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground style={styles.imageBackStyle}
          imageStyle={{ height: mobileH, width: mobileW }}
          source={localimag.Background}>

          <Image
            resizeMode='contain'
            style={{ width: mobileW * 25 / 100, height: mobileW * 25 / 100, marginTop: mobileH * 6 / 100 }}
            source={localimag.app_Logo}
          />

          {/* ---- Main Container ---- */}
          <View style={styles.mainContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '30%' }}>
              <Text style={{
                width: mobileW * 65 / 100, fontSize: mobileW * 4.5 / 100,
                fontFamily: Font.FontBold, color: Colors.blueColour,
                textAlign: "center"
              }}>{Lang_chg.signInAcctoacc[config.language]}</Text>
              <Text style={{
                width: mobileW * 65 / 100, fontSize: mobileW * 3.3 / 100,
                fontFamily: Font.FontMedium, color: Colors.darkGray,
                textAlign: "center", marginTop: mobileH * 1 / 100
              }}>{Lang_chg.signInwith[config.language]}</Text>
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
                keyboardType='email-address'
                autoCapitalize="none"
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
                source={localimag.user_pass}
              />
              <TextInput
                value={"" + password + ""}
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
            {/* --- Remember Forgot Main View ---  */}
            <View style={styles.RememberForgotView}>
              <TouchableOpacity
                onPress={() => setRememberMe(!RememberMe)}
                style={{ flexDirection: 'row', alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => setRememberMe(!RememberMe)}
                >
                  <Image style={{ height: mobileW * 4 / 100, width: mobileW * 4 / 100, tintColor: Colors.blueColour }}
                    source={RememberMe == false ? localimag.checkbox1 : localimag.checkboxcheck1}
                  /></TouchableOpacity>
                <Text style={styles.Remembertxt}>   {Lang_chg.Rememberme[config.language]}</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasstxt}>{Lang_chg.ForgotPassword[config.language]}</Text>
              </TouchableOpacity>
            </View>
            {/* --- Login Button --- */}
            <View style={{ marginTop: mobileH * 1 / 100 }}>
              <CommonButton onPressClick={() => { AppUserLogin() }} title={Lang_chg.login3[config.language]}></CommonButton>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
              <Text style={styles.dontHaveAcc}
              >{Lang_chg.DontHaveAccount[config.language]}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => { setRememberMe(false), navigation.navigate('SignUP'), clearData(), { isDataClear: true } }}><Text style={styles.signUptxt}> {Lang_chg.SignUp2[config.language]}</Text></TouchableOpacity>
            </View>

            {/* ----------- language Selection ----------- */}
            <View
              style={{
                width: '100%',
                alignItems: "center", justifyContent: 'flex-end',
                flexDirection: 'row', height: mobileH * 7 / 100,
                top: mobileW * 2 / 100
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
    alignItems: 'center',
    height: mobileH, width: mobileW
    // justifyContent: 'space-evenly'
  },
  mainContainer: {
    backgroundColor: Colors.appBackground,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    height: mobileH * 60 / 100,
    width: mobileW * 85 / 100,
    alignItems: "center",
    borderRadius: mobileW * 5 / 100,
    marginTop: mobileH * 4.5 / 100
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
    tintColor: Colors.blueColour
  },
  HeaderSettings: {
    fontFamily: Font.FontRegular,
    color: Colors.blackColor,
    fontSize: mobileW * 3.7 / 100,
  },
  dollarImage: {
    width: mobileW * 5.5 / 100,
    height: mobileW * 5.5 / 100,
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
})

