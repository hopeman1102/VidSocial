import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import { useFocusEffect } from '@react-navigation/native';
import { UserLoginPermission } from './UserLoginPermission';

export default function BankDetails({ navigation, route }) {
  const [name, setName] = useState('');
  const [AccountType, setAccountType] = useState('');
  const [DinNumber, setDinNumber] = useState('');
  const [AccountNumber, setAccountNumber] = useState("");
  const [BankName, setBankName] = useState("");
  const [BankDetails, setBankDetails] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      GetallCoins()
      UserLoginPermission({ navigation })
    }, [])
  );

  const CoinsData = route.params.item

  console.log(CoinsData);

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
          console.log("LoginResponse--->22244444444444444", response.data.data.bank_accounts);
          var BankAccounts = response.data.data.bank_accounts;
          var BankAccountsLength = response.data.data.bank_accounts.length;
          if (BankAccountsLength == 1) {
             var jsonObj = {};
            for (var i = 0; i < BankAccounts.length; i++) {
              jsonObj = BankAccounts[i];
            }

            setName(jsonObj.owner_name)
            setAccountType(jsonObj.account_type)
            setDinNumber(jsonObj.bank_code)
            setAccountNumber(jsonObj.account_number)
            setBankName(jsonObj.bank_name)
            setBankDetails(true)
          } else {
            setName('')
            setAccountType('')
            setDinNumber('')
            setAccountNumber('')
            setBankName('')
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

  const _SubmitBankDetails = async () => {

    //email============================
    if (BankName.length <= 0) {
      msgProvider.toast(Lang_chg.emptyEmail[config.language], 'bottom')
      return false
    }
    if (BankName.length > 50) {
      msgProvider.toast(Lang_chg.emailMaxLength[config.language], 'bottom')
      return false
    }
    //Owner Name ============================
    if (name.length <= 0) {
      msgProvider.toast(Lang_chg.emptyOwnername[config.language], 'bottom')
      return false
    }
    if (name.length < 2) {
      msgProvider.toast(Lang_chg.OwnernameMinLength[config.language], 'bottom')
      return false
    }
    //DIN Number ============================
    if (DinNumber.length <= 0) {
      msgProvider.toast(Lang_chg.emptyDinNumber[config.language], 'bottom')
      return false
    }
    if (DinNumber.length < 5) {
      msgProvider.toast(Lang_chg.enterproperdinnumber[config.language], 'bottom')
      return false
    }
    //email============================
    if (AccountNumber.length <= 0) {
      msgProvider.toast(Lang_chg.emptyAccountNumber[config.language], 'bottom')
      return false
    }
    if (AccountNumber.length < 5) {
      msgProvider.toast(Lang_chg.enterValidAccountnumber[config.language], 'bottom')
      return false
    }

    //------------------name===================
    if (AccountType.length <= 0) {
      msgProvider.toast(Lang_chg.emptyAccountType[config.language], 'bottom')
      return false
    }
    if (AccountType.length <= 4) {
      msgProvider.toast(Lang_chg.enterValidAccounttype[config.language], 'bottom')
      return false
    }

    _ToGetProgileDataCalling()
  }

  const _ToGetProgileDataCalling = async () => {
    var UserCurrency = await localStorage.getItemObject("UserData")
    var User_Country_Id = UserCurrency.country_id_id
    var User_Id = UserCurrency.id
    console.log(UserCurrency);
    var Token = await localStorage.getItemString("AccessToken")
    global.props.showLoader();
    let apiUrl = appBaseUrl.AddBankAccount;

    if (BankDetails) {
      var postData = JSON.stringify({
        user_id: User_Id,
        bank_name: BankName,
        owner_name: name,
        account_number: AccountNumber,
        account_type: AccountType,
        bank_code: DinNumber,
        currency_id: User_Country_Id
      });
    } else {
      var postData = JSON.stringify({
        bank_name: BankName,
        owner_name: name,
        account_number: AccountNumber,
        account_type: AccountType,
        bank_code: DinNumber,
        currency_id: User_Country_Id
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
        if (response.data.code == 200) {
          global.props.hideLoader();
          console.log("GetBinanceresponseData--->222", response.data);
          msgProvider.toast(response.data.msg, 'bottom')
          setTimeout(() => {
            navigation.navigate("Wallet")
          }, 1000);
        } else {
          global.props.hideLoader();
          alert(response.data.message)
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
            }}>{Lang_chg.Bank_Account[config.language]}</Text>
            <Image
              resizeMode='contain'
              style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, }}
            />
          </View>
          {/* ---- Main Container ---- */}
          <View style={styles.mainContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '17%' }}>
              <Text style={{
                fontSize: mobileW * 5.2 / 100, marginTop: mobileH * 1 / 100,
                fontFamily: Font.FontSemiBold, color: Colors.blackColor,
              }}>{Lang_chg.Bank_Account[config.language]}</Text>
            </View>
            {/* --- TextInput Email --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + BankName + ""}
                maxLength={100}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.BankName[config.language]}
                onChangeText={(txt) => { setBankName(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + name + ""}
                maxLength={100}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.Owner[config.language]}
                onChangeText={(txt) => { setName(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + DinNumber + ""}
                maxLength={11}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.Identitycard[config.language]}
                onChangeText={(txt) => { setDinNumber(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + AccountNumber + ""}
                maxLength={100}
                keyboardType='number-pad'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.Accountnumber[config.language]}
                onChangeText={(txt) => { setAccountNumber(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>
            {/* --- TextInput Password --- */}
            <View style={styles.textAlignextInputBaseView}>
              <TextInput
                value={"" + AccountType + ""}
                maxLength={100}
                keyboardType='email-address'
                placeholderTextColor={Colors.darkGray}
                placeholder={Lang_chg.Accounttype[config.language]}
                onChangeText={(txt) => { setAccountType(txt) }}
                style={styles.textInputStyle}>
              </TextInput>
            </View>

            {/* --- Login Button --- */}
            <View style={{ marginTop: mobileH * 4 / 100 }}>
              <CommonButton onPressClick={() => _SubmitBankDetails()} title={Lang_chg.Submit[config.language]}></CommonButton>
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
    height: mobileH * 65 / 100,
    width: mobileW * 85 / 100,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: mobileW * 5 / 100,
    marginTop: mobileH * 10 / 100
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

