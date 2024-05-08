import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, FlatList, Alert } from 'react-native'
import React, { useState } from 'react'
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
export default function Sponsors({ navigation, route }) {

  const [checked, setChecked] = React.useState(0);
  const [SponsorModal, setSponsorModal] = React.useState(false);

  const datas = [
    { name: 'Carlos p', sName: 'CP' }, { name: 'John K', sName: 'JK' },
    { name: 'David M', sName: 'DM' }, { name: 'Remo F', sName: 'RF' }]
  const [data, setdata] = useState(datas)
  const [GetallCoinstoshow, setGetallCoinstoshow] = useState('NA')

  useFocusEffect(
    React.useCallback(() => {
      GetallCoins()
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
        console.log("LoginResponse--->22244444444444444", response);
        if (response.data.code == 200) {
          global.props.hideLoader();
          var ConcateArray = response.data.data.bank_accounts.concat(response.data.data.binance_accounts);
          setGetallCoinstoshow(ConcateArray)
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
    <View style={styles.container}>
      <Header
        navigation={navigation}
        title={Lang_chg.BankList[config.language]}
        backIcon={true}
        firstImage={localimag.back_icon}
      ></Header>
      {/* ----  ---- */}
      <View style={styles.informationBaseView}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', width: '89%', alignSelf: 'center' }}
        >
          <Text style={{
            fontFamily: Font.FontSemiBold,
            color: Colors.blackColor,
            fontSize: mobileW * 3.5 / 100
          }}>{Lang_chg.Bank_And_binance_Accounts[config.language]}</Text>
        </View>
        {GetallCoinstoshow != 'NA' &&
          <FlatList
            data={GetallCoinstoshow}
            contentContainerStyle={{}}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) =>
              <View style={[styles.SecondBaseView, {}]}>

                <Image
                  resizeMode='cover'
                  style={styles.bankimage}
                  source={item.bank_name != null ? localimag.customer : localimag.Binance}
                />

                <View
                  style={{ width: mobileW * 50 / 100 }}
                >
                  {item.bank_name != null ?
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: Font.FontSemiBold,
                        color: Colors.blackColor,
                        fontSize: mobileW * 3.2 / 100,
                      }}>{item.bank_name}</Text>
                    :
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: Font.FontSemiBold,
                        color: Colors.blackColor,
                        fontSize: mobileW * 3.2 / 100,
                      }}>{item.binance_email_id}</Text>
                  }
                  {item.bank_name != null ?
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: Font.FontSemiBold,
                        color: Colors.blackColor,
                        fontSize: mobileW * 2.3 / 100,
                      }}>{Lang_chg.Ac[config.language]} : {item.account_number}</Text>
                    :
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: Font.FontSemiBold,
                        color: Colors.blackColor,
                        fontSize: mobileW * 2.3 / 100,
                      }}>{Lang_chg.PayID[config.language]} : {item.binance_pay_id}</Text>
                  }
                </View>
                <TouchableOpacity
                  style={styles.OkButton1}
                  onPress={() => {
                    navigation.navigate('BankDetails', { item: item })
                  }
                  }
                  activeOpacity={0.6}
                >
                  <LinearGradient
                    colors={['#FF87A4', '#92B8FD']}
                    style={styles.OkButton1}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >

                    <Text style={styles.Oktxt1}>{Lang_chg.SELECT[config.language]}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            } />
        }
      </View>

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
    width: mobileW * 20 / 100,
    alignItems: "center",
    borderRadius: mobileW * 5 / 100,
    alignItems: "center"
  },
  Oktxt1: {
    fontFamily: Font.FontMedium,
    fontSize: mobileW * 2.8 / 100,
    color: Colors.whiteColor
  },
  flagImagees: {
    width: mobileW * 5.5 / 100,
    height: mobileW * 5.5 / 100,
    borderRadius: mobileW * 2.5 / 100,
    borderWidth: mobileW * 0.15 / 100,
    borderColor: Colors.darkGray
  },
  bankimage: {
    width: mobileW * 7 / 100,
    height: mobileW * 7 / 100,
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
  }
})



