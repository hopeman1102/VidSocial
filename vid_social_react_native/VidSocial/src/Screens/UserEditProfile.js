import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import CommonButton from '../Components/CommonButton'
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import SmallButton from '../Components/SmallButton'
import { Lang_chg } from '../Provider/Language_provider'
import { config } from '../Provider/configProvider'
import { Colors, Font } from '../Provider/Colorsfont'
import { Cameragallery, localStorage, mediaprovider, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils'
import { ScrollView } from 'react-native-gesture-handler'
import axios from 'axios'
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants'

export default function UserEditProfile({ navigation }) {
  const [name, setName] = useState('');
  const [email, setemail] = useState('alicecasiraghi@gmail.com');
  const [secureText, setSecureText] = useState(true);
  const [password, setpassword] = useState('123456');

  const [media_pop_up, setmedia_pop_up] = useState('123456');
  const [profile_image, setprofile_image] = useState('NA');
  const [formateUserName, setFormateUserName] = useState("AA")

  useEffect(() => {
    getUserData()
  }, [])

  const getUserData = async () => {
    let UserData = await localStorage.getItemObject("UserData")
    const formattedName = config.getFormateName(UserData.name);
    console.log("UserDataName==>", formattedName)
    setFormateUserName(formattedName)
    setName(UserData.name)
    setemail(UserData.email)
    setpassword(UserData.password)
  }




  const _UpadteProfile = async () => {

    //------------------ ProfileImage ===================
    // if (profile_image == 'NA') {
    //   msgProvider.toast(Lang_chg.emptyProfileImage[config.language], 'center')
    //   return false
    // }
    //------------------ name ===================
    if (name.length <= 0) {
      msgProvider.toast(Lang_chg.emptyName[config.language], 'center')
      return false
    }
    if (name.length <= 2) {
      msgProvider.toast(Lang_chg.fullNameMinLength[config.language], 'center')
      return false
    }
    var namevalidation = config.namevalidationNum;
    if (namevalidation.test(name) !== true) {
      msgProvider.toast(Lang_chg.nameNumCheck[config.language], 'center')
      return false
    }

    // var postData = JSON.stringify({
    //   email: email,
    //   password: password,
    // });

    var data = new FormData();
    data.append('name', name)
    data.append('email', email)
    data.append('password', password)
    if (profile_image != 'NA') {
      data.append('profile_img', {
        uri: profile_image,
        type: 'image/jpg', // or photo.type
        name: 'image.jpg'
      })
    }
    global.props.showLoader();
    console.log(data);
    setTimeout(() => {
      global.props.hideLoader();
      navigation.navigate('UserProfile')
    }, 500);
     global.props.showLoader();
    let apiUrl = appBaseUrl.LoginUrl;
    const headers = config.headersapi

    // Make a POST request using Axios
    axios.post(apiUrl, postData, { headers })
      .then(async (response) => {
        // Handle the successful response
        console.log("LoginResponse--->222", response.data);
        if (response.data.ErrorCode == "200") {
          global.props.hideLoader();
          await localStorage.setItemObject("UserData", response.data.getAllActiveModelusers)
          navigation.navigate('UserProfile')
        } else {

          alert(response.data.ErrorMessage)
          global.props.hideLoader();
        }
      })
      .catch(error => {
        global.props.hideLoader();
        console.log('Loginerror---22', error);
        // Handle errors
      });



    return false

  }


  const data = [
    {
      id: 1,
      image: localimag.icon_ractangle,
    },
    {
      id: 1,
      image: localimag.icon_bedges,
    },
    {
      id: 1,
      image: localimag.icon_ractangle,
    },
  ]

  const _openCamera = () => {
    mediaprovider.launchCamera().then((obj) => {
      console.log(obj.path);
      setmedia_pop_up(false)
      setprofile_image(obj.path)
    })
  }

  const _openGellery = () => {
    mediaprovider.launchGellery().then((obj) => {
      console.log(obj.path);
      setmedia_pop_up(false)
      setprofile_image(obj.path)
    })
  }

  const closeMediaPopup = () => {
    setmedia_pop_up(false)
  }

  return (
    <View style={styles.container}>
      {/* ----- Gallery Camera Picker ---- */}
      <Cameragallery
        mediamodal={media_pop_up}
        Camerapopen={_openCamera}
        Galleryopen={_openGellery}
        Canclemedia={closeMediaPopup} />

      <ImageBackground style={{ height: mobileH, width: mobileW }}
        imageStyle={{ height: mobileH, width: mobileW }}
        source={localimag.backgroud_gradient}>

        <Header
          backIcon={true}
          navigation={navigation}
          title={Lang_chg.editProfileCapitalTxt[config.language]}
          secondImage='' />

        {/* --- Profile Section --- */}
        <ScrollView contentContainerStyle={{}}>

          <View
            style={styles.ProfileBaseView} >
            {profile_image == 'NA' ?
              <TouchableOpacity
                onPress={() => setmedia_pop_up(true)}
                activeOpacity={0.7}
                style={styles.ProfilePicView} >
                <Text style={styles.profileTxtView}>{formateUserName}</Text>
              </TouchableOpacity>
              :
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setmedia_pop_up(true)}
              >
                <Image
                  resizeMode='contain'
                  source={{ uri: profile_image }}
                  style={styles.ProfilePicView}
                ></Image></TouchableOpacity>}
            <TouchableOpacity
              onPress={() => setmedia_pop_up(true)}
              style={{
                position: 'absolute',
                left: mobileW * 55 / 100,
                top: mobileH * 10 / 100
              }}
              activeOpacity={0.8}>
              <Image
                resizeMode='contain'
                source={localimag.icon_download}
                style={styles.BlankImageView}
              ></Image>
            </TouchableOpacity>
          </View>

          {/*  --- Name Input --- */}
          <View style={{ alignItems: 'center', justifyContent: 'center', width: mobileW }}>
            <View
              style={[styles.BaseView, { marginTop: mobileH * 5.5 / 100 }]}>
              <Text style={styles.EmailAddtxt}
              >{Lang_chg.nameSurname[config.language]}</Text>
              <View style={styles.InputView}>
                <TextInput
                  value={name}
                  maxLength={30}
                  placeholderTextColor="black"
                  onChangeText={(txt) => { setName(txt) }}
                  style={styles.TextInputs}></TextInput>
                <TouchableOpacity
                  onPress={() => setName('')}
                  activeOpacity={0.8}>
                  <Image resizeMode='contain'
                    source={localimag.icon_close}
                    style={styles.ImageStyle}
                  ></Image></TouchableOpacity>
              </View>
            </View>

            {/*  --- Email Input --- */}
            <View style={[styles.BaseView]}>
              <Text style={styles.EmailAddtxt}
              >{Lang_chg.eMailAddress[config.language]}</Text>
              <View style={styles.InputView}>
                <TextInput
                  value={email}
                  maxLength={30}
                  placeholderTextColor="black"
                  onChangeText={(txt) => { setemail(txt) }}
                  style={styles.TextInputs}></TextInput>
                <TouchableOpacity
                  onPress={() => setemail('')} activeOpacity={0.8}>
                  <Image resizeMode='contain'
                    source={localimag.icon_close}
                    style={styles.ImageStyle}
                  ></Image></TouchableOpacity>
              </View>
            </View>

            {/*  --- Password Input --- */}
            <View style={styles.BaseView}>
              <Text style={styles.EmailAddtxt}
              >{Lang_chg.Password[config.language]}</Text>
              <View style={styles.InputView}>
                <TextInput
                  value={password}
                  maxLength={15}
                  placeholderTextColor="black"
                  secureTextEntry={secureText}
                  // onChangeText={(txt) => { this.setState({ name: txt }) }}
                  style={[styles.TextInputs, { color: Colors.orangeColor }]}></TextInput>
                <TouchableOpacity
                  onPress={() => setSecureText(!secureText)}
                  activeOpacity={0.8}>
                  {secureText ? <Image resizeMode='contain' source={localimag.icon_close}
                    style={styles.ImageStyle}></Image> :
                    <Image resizeMode='contain' source={localimag.icon_eye}
                      style={styles.eyeImageStyle}></Image>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ marginTop: mobileH * 9 / 100 }}>
            <CommonButton
              ScreenName={'UserProfile'}
              onPressClick={() => {
                _UpadteProfile()
              }}
              navigation={navigation}
              title={Lang_chg.saveChanges[config.language]}></CommonButton>
          </View>

          {/* --- Privacy Notice --- */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <Text
              style={[
                styles.EmailAddtxt, {
                  marginTop: mobileH * 3 / 100,
                  textAlign: 'center',
                  fontSize: mobileW * 3.5 / 100,
                  color: Colors.lightAccent
                }]
              }>{Lang_chg.leaveWithoutSaving[config.language]}</Text>
          </TouchableOpacity>
        </ScrollView>

      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
  },
  headView: {
    width: mobileW,
    paddingBottom: mobileH * 3 / 100
  },
  EmailAddtxt: {
    color: Colors.lightAccent,
    fontFamily: Font.FontRegularFono,
    textAlign: 'center',
    fontSize: mobileW * 3 / 100,
    color: Colors.whiteColor
  },
  NameStyle: {
    color: Colors.lightAccent,
    fontFamily: Font.aeonikRegular,
    textAlign: 'center',
    fontSize: mobileW * 4 / 100,
    color: Colors.whiteColor
  },
  profileTxtView: {
    color: Colors.whiteColor,
    fontSize: mobileW * 7 / 100,
    fontFamily: Font.FontRegularFono
  },
  Emailtxt: {
    color: Colors.lightGreyColor,
    fontFamily: Font.FontRegularFono,
    textAlign: 'center',
    fontSize: mobileW * 3.2 / 100,
    marginTop: mobileH * 1 / 100,
    color: Colors.whiteColor
  },
  ProfileBaseView: {
    width: mobileW,
    paddingVertical: mobileH * 2 / 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: mobileH * 5 / 100
  },
  BlankImageView: {
    width: mobileW * 7.5 / 100,
    height: mobileW * 7.5 / 100,
    // position: 'absolute',
    // left: mobileW * 56 / 100,
    // top: mobileH * 11 / 100
  },
  ProfilePicView: {
    backgroundColor: Colors.IconBG,
    width: mobileW * 25 / 100,
    height: mobileW * 25 / 100,
    borderRadius: mobileW * 12.5 / 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  BaseView: {
    width: mobileW * 74 / 100,
    marginTop: mobileH * 2 / 100
  },
  InputView: {
    width: mobileW * 74 / 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: Colors.whiteColor,
    borderBottomWidth: mobileH * 0.12 / 100,
    justifyContent: 'space-between'
  },
  EmailAddtxt: {
    color: Colors.lightAccent,
    fontSize: mobileW * 3 / 100,
    fontFamily: Font.aeonikRegular
  },
  TextInputs: {
    height: mobileW * 10 / 100,
    marginTop: mobileW * 1 / 100,
    width: mobileW * 67 / 100,
    fontFamily: Font.FontRegularFono,
    color: Colors.lightAccent,
    fontSize: mobileW * 4 / 100,
  },
  ImageStyle: {
    height: mobileW * 3 / 100,
    width: mobileW * 3 / 100,
    right: mobileW * 2 / 100
  },
  eyeImageStyle: {
    height: mobileW * 4.3 / 100,
    width: mobileW * 4.3 / 100,
    right: mobileW * 2 / 100
  },
})


