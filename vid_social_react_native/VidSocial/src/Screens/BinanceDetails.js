import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { UserLoginPermission } from './UserLoginPermission';

export default function BinanceDetails({ navigation }) {
  const [name, setName] = useState('');
  const [email, setemail] = useState('');
  const [PayId, setPayId] = useState('');
  const [CPayId, setCPayId] = useState('');
  const [BinanceDetails, setBinanceDetails] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      GetallCoins()
      UserLoginPermission({ navigation })
    }, [])
  );

  const GetallCoins = async () => {

    var Token = await localStorage.getItemString("AccessToken")
    console.log(Token);

    global.props.showLoader();
    let apiUrl = appBaseUrl.CustomerBinance;

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
          console.log("LoginResponse--->22244444444444444", response.data.data.binance_accounts);
          var BankAccounts = response.data.data.binance_accounts;
          var BankAccountsLength = response.data.data.binance_accounts.length;
          if (BankAccountsLength == 1) {
            var jsonObj = {};
            for (var i = 0; i < BankAccounts.length; i++) {
              jsonObj = BankAccounts[i];
            }

            setemail(jsonObj.binance_email_id)
            setPayId(jsonObj.binance_pay_id)
            setCPayId(jsonObj.binance_pay_id)
            setBinanceDetails(true)
            console.log('jsonObj-------', jsonObj);
          } else {
            setemail('')
            setPayId('')
            setCPayId('')
          }
        } else {
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


  const _SubmitBinanceDetails = () => {

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

    //------------------name===================
    if (PayId.length <= 0) {
      msgProvider.toast(Lang_chg.emptyPayID[config.language], 'bottom')
      return false
    }

    if (PayId.length > 25) {
      msgProvider.toast(Lang_chg.minLengthpayId[config.language], 'bottom')
      return false
    }

    // var regex = config.BinanceValidation;
    // if (regex.test(PayId) !== true) {
    //   console.log(regex.test(PayId));
    //   msgProvider.toast(Lang_chg.EnterAValidPayID[config.language], 'bottom')
    //   return false
    // }

    if (PayId !== CPayId) {
      msgProvider.toast(Lang_chg.cBinanceMatch[config.language], 'bottom')
      return false
    }

    _ToGetProgileDataCalling()

  }

  const _ToGetProgileDataCalling = async () => {
    var Token = await localStorage.getItemString("AccessToken")
    var UserCurrency = await localStorage.getItemObject("UserData")
    var User_Id = UserCurrency.id
    global.props.showLoader();
    let apiUrl = appBaseUrl.AddBinanceAccount;

    if (BinanceDetails) {
      var postData = JSON.stringify({
        user_id: User_Id,
        binance_email_id: email,
        binance_pay_id: PayId,
        is_active: true
      });
    } else {
      var postData = JSON.stringify({
        binance_email_id: email,
        binance_pay_id: PayId,
        is_active: true
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'HttpOnly',
      'Authorization': 'Bearer ' + Token,
      'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
    };
    // Make a POST request using Axios
    console.log(postData, '<<<==========>>>', apiUrl, Token);
    axios.post(apiUrl, postData, { headers })
      .then(async (response) => {
        // Handle the successful response
        console.log("GetBinanceresponseData--->222", response.data);
        if (response.data.code == BinanceDetails ? 201 : 200) {
          global.props.hideLoader();
          console.log("GetBinanceresponseData--->222", response.data);
          msgProvider.toast(response.data.detail, 'bottom')
          setTimeout(() => {
            navigation.goBack()
          }, 100);
        } else {
          global.props.hideLoader();
          alert(response.data.detail)
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
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground style={styles.imageBackStyle}
          imageStyle={{ height: mobileH, width: mobileW }}
          source={localimag.AppBackGirl}>
          <View
            style={{
              flexDirection: 'row', alignItems: "center", paddingHorizontal: mobileW * 7 / 100,
              justifyContent: 'space-between', height: mobileH * 8 / 100
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Wallet')}
            >
              <Image
                resizeMode='contain'
                style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, }}
                source={localimag.back_icon}
              />
            </TouchableOpacity>
            <Text style={{
              fontSize: mobileW * 4.3 / 100,
              fontFamily: Font.FontSemiBold, color: Colors.whiteColor,
            }}>{Lang_chg.Binance[config.language]}</Text>
            <Image
              resizeMode='contain'
              style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, }}
            />
          </View>
          {/* ---- Main Container ---- */}
          <View style={styles.mainContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '25%' }}>
              <Text style={{
                fontSize: mobileW * 5.2 / 100, marginTop: mobileH * 1 / 100,
                fontFamily: Font.FontSemiBold, color: Colors.blackColor,
              }}>{Lang_chg.Binance_Details[config.language]}</Text>
            </View>
            {/* --- TextInput Email --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + email + ""}
                maxLength={100}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.email5[config.language]}
                onChangeText={(txt) => { setemail(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + PayId + ""}
                maxLength={26}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.PayID[config.language]}
                onChangeText={(txt) => { setPayId(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>

            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + CPayId + ""}
                maxLength={26}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.RepeatPayID[config.language]}
                onChangeText={(txt) => { setCPayId(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>

            {/* --- Login Button --- */}
            <View style={{ marginTop: mobileH * 3 / 100 }}>
              <CommonButton onPressClick={() => _SubmitBinanceDetails()} title={Lang_chg.Submit[config.language]}></CommonButton>
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
    height: mobileH * 47 / 100,
    width: mobileW * 85 / 100,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: mobileW * 5 / 100,
    marginTop: mobileH * 17 / 100
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
  }
})

