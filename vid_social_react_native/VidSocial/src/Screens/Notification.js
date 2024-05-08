import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
 import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font } from '../Provider/Colorsfont'
import { localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils'
import { useIsFocused } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import firebase from '../Firebase/firebaseConfig';
import { SendMessage, RecieveMessage } from '../Firebase/Message';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Notification({ navigation, route }) {

  const [message, setmessage] = useState('')
  const [currentUid, setcurrentUid] = useState('')
  const [allMessages, setallMessages] = useState([])
  const [inputHeight, setInputHeight] = useState(0);
  const guestUid = route.params.item.id;
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getUUID();
    _togetAllMessages();
  }, [isFocused]);

  console.log('guestUid1-----', currentUid);
  console.log('guestUid1-----', guestUid);

  const getUUID = async () => {
    var UserData = await localStorage.getItemObject("UserData")
    console.log('UserData', UserData);
    setcurrentUid(UserData.id)
  }

  // ------------ To Get message ------------------
  const _togetAllMessages = async () => {
    var UserData = await localStorage.getItemObject("UserData")
    console.log('UserData', UserData);
    const User_id = UserData.id
    const guestUid = route.params.item.id;
    try {
      firebase.database().
        ref('messages').
        child(User_id).
        child(guestUid).
        on("value", (dataSnapshot) => {
          let message = [];
          dataSnapshot.forEach((data) => {
            message.push({
              sendBy: data.val().messege.sender,
              recieveBy: data.val().messege.reciever,
              msg: data.val().messege.msg,
              image: data.val().messege.image,
              date: data.val().messege.date,
              time: data.val().messege.time,
            });
          })
          setallMessages(message.reverse())
          console.log(message);

        })
    } catch (error) {
      console.log(error);
      alert('User Not Found !!');
    }
  }

  // ------------ To Send Message --------------------
  const sendMessagesss = async () => {
    //  const currentUid111 = await AsyncStorage.getItem('UID');
    // const guestUid111 = route.params.guestuuid;
    var blockStatus = false;
    console.log(currentUid, '============');
    if (message) {
      SendMessage(currentUid, guestUid, message, "", blockStatus).
        then((res) => {
          // console.log(res);
          setmessage('')
        }).catch((err) => {
          alert(err)
        })
      // ------------ To Receive Messages -----------------
      RecieveMessage(currentUid, guestUid, message, "", blockStatus).
        then((res) => {
          // console.log(res);
          setmessage('')
        }).catch((err) => {
          alert(err)
        })
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        backIcon={true}
        navigation={navigation}
        title={'Chatting'}
        firstImage={localimag.back3}
        secondImage='' />

      <Text>Hello i ma here</Text>

      <View 
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        style={{
          flexDirection: "row", 
          alignItems: "center", 
          width: mobileW * 93 / 100,
          paddingHorizontal: mobileW * 2 / 100, 
          borderRadius: mobileW * 6 / 100, 
          elevation: 2,
          height: mobileW * 12 / 100,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, },
          shadowColor: '#000',
          shadowOpacity: 0.1,
          bottom: mobileW * 3 / 100 , 
          backgroundColor: Colors.whiteColor
        }}>
          <TouchableOpacity
            activeOpacity={0.8}
            
          >
            <Image
              resizeMode='contain'
              style={{ 
              height: mobileW * 5 / 100, 
              width: mobileW * 5 / 100, 
              marginLeft: mobileW * 3 / 100 
            }}
             />
          </TouchableOpacity>
          <TextInput
            maxLength={1000}
            placeholderTextColor={Colors.Pink}
            // multiline={true}
            // numberOfLines={6}
            value={message}
            placeholder='Type Here...'
            onChangeText={(text) => setmessage(text)}
            style={{
              width: mobileW * 68 / 100, fontFamily: Font.FontMedium,
              fontSize: mobileW * 3.6 / 100, marginLeft: mobileW * 3 / 100
            }}></TextInput> 
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => sendMessagesss()}
          >
            <Image
              resizeMode='contain'
              style={{ 
                height: mobileW * 8.5 / 100, 
                width: mobileW * 8.5 / 100, 
                marginLeft: mobileW * 2 / 100
              }}
              source={localimag.Binance} />
          </TouchableOpacity>
        </View>

      {/* <Footer
        activepage='Notification'
        usertype={1}
        footerpage={[
          { name: 'CustomerHme', pageName: 'CustomerHme', countshow: false, image: require('../Icons/home_bank.png'), activeimage: require('../Icons/home_active.png') },

          { name: 'Notification', pageName: 'Notification', countshow: false, image: require('../Icons/notification.png'), activeimage: require('../Icons/notification_active.png') },

          { name: 'TopGirls', pageName: 'TopGirls', countshow: false, image: require('../Icons/saved.png'), activeimage: require('../Icons/saved_active.png') },

          { name: 'Wallet', pageName: 'Wallet', countshow: false, image: require('../Icons/voter.png'), activeimage: require('../Icons/voter.png') },

          { name: 'UserProfile', pageName: 'UserProfile', countshow: false, image: require('../Icons/profile.png'), activeimage: require('../Icons/profile_active.png') },
        ]}
        navigation={navigation}
        imagestyle1={{ width: 25, height: 25, backgroundColor: '#fff', countcolor: 'white', countbackground: 'black' }}
        count_inbox={0}
      /> */}
    </View>
  )
}