import React, { Component } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { config, msgProvider, localStorage, apifuntion, msgText, msgTitle, consolepro, Lang_chg, Font, Colors, mobileH, mobileW } from './utilslib/Utils';
import Splash from './Splash';
import Login from '../Screens/Login';
import SignUP from '../Screens/SignUP';
import UserProfile from '../Screens/UserProfile';
import UserEditProfile from '../Screens/UserEditProfile';
import VideoPlayer from '../Screens/VideoPlayer';
import VideoRecording from '../Screens/VideoRecording';
import PrivacyPolicy from '../Screens/PrivacyPolicy'
import CustomerHme from '../Screens/CustomerHme'
import ProviderHome from '../Screens/ProviderHome'
import Notification from '../Screens/Notification'
import Search from '../Screens/Search'
import TopGirls from '../Screens/TopGirls'
import Wallet from '../Screens/Wallet'
import Faourite from '../Screens/Faourite'
import Notifications from '../Screens/Notifications'
import SignUP1 from '../Screens/SignUP1'
import ForgotPassword from '../Screens/ForgotPassword'
import ForgotPassManual from '../Screens/ForgotPassManual'
import Home from '../Screens/Home'
import Profile from '../Screens/Profile'
import TakePicture from '../Screens/TakePicture'
import BinanceDetails from '../Screens/BinanceDetails'
import BankDetails from '../Screens/BankDetails'
import PaymentHistory from '../Screens/PaymentHistory'
import Faq from '../Screens/Faq'
import Sponsors from '../Screens/Sponsors'
import Withdraw from '../Screens/Withdraw'
import Report from '../Screens/Report'
import CustomerProfile from '../Screens/CustomerProfile'
import Payment from '../Screens/Payment'
import Terms from '../Screens/Terms'
import EditProfileWorker from '../Screens/EditProfileWorker'
import WithdrawWorker from '../Screens/WithdrawWorker'

import Search_c from '../Screens/Search_c'
import Home_c from '../Screens/Home_c'
import Wallet_c from '../Screens/Wallet_c'
import Profile_c from '../Screens/Profile_c'
import Setting from '../Screens/Setting'
import HelpSupport from '../Screens/HelpSupport'
import VideoCalling from '../Screens/VideoCalling'
import BankAccount from '../Screens/BankAccount'
import IncomingCallScreen from '../Screens/IncomingCallScreen';
import OutgoingCallScreen from '../Screens/OutgoingCallScreen';
import messaging from '@react-native-firebase/messaging'
import { notificationListener } from './Notification/PushController';
import { useNavigation } from '@react-navigation/native';

import CallRating from '../Screens/CallRating'
import TotalEarnedCoins from '../Screens/TotalEarnedCoins'
import ReportWorker from '../Screens/ReportWorker'
import Warnings from '../Screens/Warnings'

const Stack = createNativeStackNavigator();
const Stacknav = () => {
  const navigation = useNavigation(); // Use this hook to get the navigation object

  notificationListener(navigation);

  // messaging().onMessage(async remoteMessage => {
  //   console.log('[FCMService] A new FCM message arrived', remoteMessage);

  //   const data = remoteMessage.data

  //   if(data.event_name =="incoming_call"){
  //       console.log('[FCMService] A new FCM message arrived NICE NICE', data.channelname);
  //       navigation.navigate("IncomingCallScreen")
  //   }
  
  // });
  return (
    <Stack.Navigator
      initialRouteName={"Splash"}
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }}>



      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="SignUP" component={SignUP} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="SignUP1" component={SignUP1} options={{ headerShown: false, gestureEnabled: false }} />


      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="UserEditProfile" component={UserEditProfile} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayer} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="VideoRecording" component={VideoRecording} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="ForgotPassManual" component={ForgotPassManual} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="TakePicture" component={TakePicture} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="BinanceDetails" component={BinanceDetails} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="BankDetails" component={BankDetails} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistory} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Faq" component={Faq} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Sponsors" component={Sponsors} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Withdraw" component={Withdraw} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Report" component={Report} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="CustomerProfile" component={CustomerProfile} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Payment" component={Payment} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Terms" component={Terms} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="EditProfileWorker" component={EditProfileWorker} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="WithdrawWorker" component={WithdrawWorker} options={{ headerShown: false, gestureEnabled: false }} />

      {/* ----------------------------------------------------- */}
      <Stack.Screen name="Search_c" component={Search_c} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Home_c" component={Home_c} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Wallet_c" component={Wallet_c} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Profile_c" component={Profile_c} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Setting" component={Setting} options={{ headerShown: false, gestureEnabled: false }} />


      {/* ---------------VidSocial Application ----------------- */}
      <Stack.Screen name="CustomerHme" component={CustomerHme} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="ProviderHome" component={ProviderHome} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Notification" component={Notification} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Search" component={Search} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="TopGirls" component={TopGirls} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Wallet" component={Wallet} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Faourite" component={Faourite} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="HelpSupport" component={HelpSupport} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="VideoCalling" component={VideoCalling} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="BankAccount" component={BankAccount} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="IncomingCallScreen" component={IncomingCallScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="OutgoingCallScreen" component={OutgoingCallScreen} options={{ headerShown: false, gestureEnabled: false }} />     
     
      <Stack.Screen name="CallRating" component={CallRating} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="TotalEarnedCoins" component={TotalEarnedCoins} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="ReportWorker" component={ReportWorker} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Warnings" component={Warnings} options={{ headerShown: false, gestureEnabled: false }} />

    </Stack.Navigator>



  );
}
export default Stacknav