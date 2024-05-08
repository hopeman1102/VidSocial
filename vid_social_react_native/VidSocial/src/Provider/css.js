import React, { Component } from 'react'
import { Text, BackHandler, SafeAreaView, StatusBar, KeyboardAvoidingView, Alert, View, StyleSheet, Keyboard, Dimensions, ImageBackground, TouchableOpacity, Image, TextInput, Modal, FlatList, KeyboardAwareScrollView, Platform } from 'react-native'
import { Colors, Font } from '../Provider/utilslib/Utils'
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const CSSstyle = StyleSheet.create({
  backb: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  searchimg: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  profilimage_large: { width: 65, height: 70, resizeMode: 'contain', alignSelf: 'center', borderRadius: 5 },
  profilimage_prelarge: { width: 50, height: 50, resizeMode: 'contain', borderRadius: 5 },
  profilimage_big: { width: 40, height: 40, resizeMode: 'cover', borderRadius: 5 },
  profilimage_med: { width: 30, height: 30, resizeMode: 'cover', borderRadius: 5 },
  profilimage_small: { width: 25, height: 25, resizeMode: 'cover', borderRadius: 5 },
  liketxt: { marginRight: 25, fontSize: 12, color: 'gray' },
  sell_purchase_txt: { marginRight: 5, fontSize: 14, fontFamily: 'Gilroy-Regular' },
  arrow: { width: 10, height: 10, resizeMode: 'contain', alignSelf: 'center' },
  socialtouch: { marginRight: 10, flexDirection: 'row', backgroundColor: Colors.white_light, padding: 5, alignItems: 'center', borderRadius: 5 },
  socialimg: {
    width: 17,
    height: 17,
    resizeMode: 'contain'
  },
  socialimg1: {
    width: 11,
    height: 11,
    resizeMode: 'contain'
  },
  socialtxt: {
    marginRight: 5,
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: Colors.gray_color,
    marginLeft: 5
  },
  smallicon: { width: 15, height: 15, resizeMode: 'contain' },
  moresmallicon: { width: 10, height: 10, resizeMode: 'contain' },
  headerView: { width: windowWidth, alignContent: 'center', alignItems: 'center', justifyContent: 'center', },
  headertext: { alignSelf: 'center', fontSize: 18, color: Colors.whiteColor, fontFamily: 'Gilroy-Bold', paddingVertical: windowHeight * 3 / 100 },
  lockview: { position: 'absolute', left: 10, bottom: 30, backgroundColor: 'black', padding: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 50 },
  locktxt: { width: '100%', fontFamily: 'Gilroy-Regular', fontSize: 12, position: 'absolute', left: 10, bottom: 10, color: 'black' },
  // on task------------------------------------
  inputTile: { position: 'absolute', marginTop: windowHeight * -1.8 / 100, marginLeft: windowWidth * 5 / 100, backgroundColor: Colors.whiteColor, paddingHorizontal: windowWidth * 1.2 / 100, },
  search: {
    flexDirection: 'row', backgroundColor: Colors.whiteColor, paddingVertical: windowWidth * .1 / 100,
    marginHorizontal: windowWidth * 3.5 / 100, borderRadius: windowWidth * 2 / 100,
    elevation: 2, marginTop: windowHeight * 1.5 / 100
  },

  InputView:
  {
    width: '90%',
    paddingVertical: windowHeight * 1.5 / 100,
    flexDirection: 'row',
    borderColor: Colors.theme_color,
    borderWidth: windowWidth * 0.7 / 100,
    alignSelf: 'center',
    marginTop: windowHeight * 2.8 / 100,
    marginHorizontal: windowWidth * 5 / 100
  },
  icon: {
    width: windowWidth * 6 / 100,
    height: windowWidth * 6 / 100,
    resizeMode: 'contain', alignSelf: 'center'
  },
  iconView:
    { width: '15%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },

  loginBtnView:
  {
    backgroundColor: Colors.theme_color,
    paddingVertical: windowHeight * 2 / 100,
    marginHorizontal: windowWidth * 5.5 / 100,
    borderRadius: windowWidth * 3 / 100,
    marginTop: windowWidth * 5.5 / 100
  },
  loginBtnTxt:
  {
    textAlign: 'center',
    fontFamily: Font.fontsemibold,
    color: Colors.whiteColor,
    fontSize: windowWidth * 4 / 100,
    textAlignVertical: 'center'
  },
  //--------------default button css----------
  defautlButtonView:
  {
    backgroundColor: Colors.theme_color
    , paddingVertical: windowHeight * 2 / 100,
    marginHorizontal: windowWidth * 5.5 / 100,
    borderRadius: windowWidth * 3 / 100,
    marginTop: windowWidth * 5.5 / 100
  },
  defaultButtomTxt:
  {
    textAlign: 'center',
    fontFamily: Font.fontsemibold,
    color: Colors.whiteColor,
    fontSize: windowWidth * 4 / 100,
    textAlignVertical: 'center'
  },

  //--------------title style-------------------
  Headertitle: {
    alignItems: 'center',
    paddingHorizontal: windowWidth * 5 / 100,
    flexDirection: 'row',
    width: windowWidth,
    paddingVertical: windowHeight * 3 / 100,

  },
  title_head: {
    color: Colors.whiteColor,
    fontFamily: Font.fontsemibold,
    fontSize: windowWidth * 5.5 / 100,

  },
  //------------------------search -------------------------
  mainView:
  {
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
    paddingVertical: windowWidth * 0.5 / 100,
    marginHorizontal: windowWidth * 5 / 100,
    borderRadius: windowWidth * 2 / 100,
    elevation: 2,
    shadowRadius: 2,
    shadowOpacity: 0.3,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1 },
    // elevation:  Platform.OS=='ios'?0.5:1.8,
    // shadowOpacity: 1,

    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 0 },
    marginTop: windowHeight * 1.5 / 100,

  },
  SearchiconView:
  {
    width: windowWidth * 10 / 100,
    justifyContent: 'center',
    paddingLeft: windowWidth * 4.5 / 100,
  },
  SearchTxt:
  {
    fontSize: windowWidth * 3.6 / 100,
    fontFamily: Font.fontregular,
    width: windowWidth * 73.0 / 100,
    color: Colors.blackColor,
    paddingVertical: windowHeight * 1 / 100
    //paddingHorizontal:windowWidth*2.5/100
  },
  searchIcon:
  {
    width: windowWidth * 4 / 100,
    height: windowHeight * 4 / 100,
    resizeMode: 'contain'
  },

  //--------------otp style-------------
  OtpInput:
  {
    marginHorizontal: windowWidth * 5 / 100,
    marginTop: windowHeight * 2 / 100,
    //alignContent:'center'
  },
  otptitle: {
    fontFamily: Font.fontbold,
    fontSize: windowWidth * 4.5 / 100,
    textAlign: 'center',
    marginTop: windowHeight * 1.8 / 100,
    color: Colors.blackColor
  },
  optTxt: {
    textAlign: 'center',
    fontFamily: Font.fontsemibold,
    fontSize: windowWidth * 3.5 / 100,
    color: '#CBC9C9',
    marginTop: windowHeight * 1.6 / 100
  },
  otpInpoutType: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '90%',
    alignSelf: 'center',
    //textAlign: 'center',
    height: 40,
    marginTop: 10,
    paddingHorizontal: windowWidth * 4.5 / 100,
    borderRadius: windowWidth * 1 / 100,
    borderColor: Colors.theme_color,
    borderWidth: windowWidth * 0.5 / 100,
    fontSize: windowWidth * 4.5 / 100,
    textAlignVertical: 'center'
  },
  verifyBox: {
    flexDirection: 'row',
    //borderTopWidth: 1,
    //borderColor: '#ccc',
    marginTop: 10,
    justifyContent: "space-between",
    marginHorizontal: windowWidth * 4 / 100,
    paddingTop: windowHeight * 2 / 100,
    paddingBottom: windowHeight * 3.5 / 100,
  },
  resendboxLeft: {


  },
  resendbox: {
    width: '50%',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  OTpLeftverify: {
    color: Colors.theme_color,
    fontFamily: Font.fontsemibold,
    fontSize: windowWidth * 4 / 100,
  },

  //on task--------------
  dashAndroid:
  {
    borderBottomWidth: windowHeight * 0.001,
    borderTopWidth: windowHeight * 0.001,
    borderColor: '#ccc',
    marginTop: windowHeight * 1 / 100,
    backgroundColor: "white",
    elevation: 0.5,
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
  },
  dashAndroidTop:
  {
    //borderBottomWidth: windowHeight * 0.001,
    borderTopWidth: windowHeight * 0.001,
    borderColor: '#ddd',
    marginTop: windowHeight * 1 / 100,
    //backgroundColor: Colors.whiteColor, 
    elevation: 0.5,
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
  },

  //=====================common button ========================//
  fill_button_touch: {
    backgroundColor: Colors.theme_color
    , paddingVertical: windowHeight * 2 / 100,
    marginHorizontal: windowWidth * 5.5 / 100,
    borderRadius: windowWidth * 3 / 100,
    marginTop: windowWidth * 5.5 / 100
  },
  fill_button_txt: {
    textAlign: 'center',
    fontFamily: Font.fontsemibold,
    color: Colors.whiteColor,
    fontSize: windowWidth * 4.5 / 100,
    textAlignVertical: 'center'
  },
  unfill_button_touch: {
    borderWidth: windowWidth * .6 / 100,
    borderColor: Colors.theme_color,
    borderRadius: windowWidth * 2 / 100,
    paddingVertical: windowHeight * 1.7 / 100,
    marginTop: windowHeight * 1.5 / 100,
    marginHorizontal: windowWidth * 5 / 100
  },
  unfill_button_txt: {
    textAlign: 'center',
    fontSize: windowWidth * 4.5 / 100,
    fontFamily: Font.fontbold,
    color: Colors.theme_color
  },
})
export default CSSstyle;