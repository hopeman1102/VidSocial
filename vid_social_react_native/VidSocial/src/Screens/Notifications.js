import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import CommonButton from '../Components/CommonButton'
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import SmallButton from '../Components/SmallButton'
import { Lang_chg } from '../Provider/Language_provider'
import { config } from '../Provider/configProvider'
import { Colors, Font } from '../Provider/Colorsfont'
import { localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils'
import { ScrollView } from 'react-native-gesture-handler'
import Footer from '../Provider/Footer'

export default function Notifications({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Header
        backIcon={true}
        navigation={navigation}
        title={Lang_chg.Notification[config.language]}
        firstImage={localimag.back3}
        secondImage='' />

      <Footer
        activepage='Notifications'
        usertype={1}
        footerpage={[
          { name: 'ProviderHome', pageName: 'ProviderHome', countshow: false, image: require('../Icons/home_bank.png'), activeimage: require('../Icons/home_active.png') },

          { name: 'Notifications', pageName: 'Notifications', countshow: false, image: require('../Icons/notification.png'), activeimage: require('../Icons/notification_active.png') },

          { name: 'Faourite', pageName: 'Favourite', countshow: false, image: require('../Icons/heart.png'), activeimage: require('../Icons/heart_full.png') },

          { name: 'WalletW', pageName: 'WalletW', countshow: false, image: require('../Icons/voter.png'), activeimage: require('../Icons/voter.png') },

          { name: 'UserProfile', pageName: 'UserProfile', countshow: false, image: require('../Icons/profile.png'), activeimage: require('../Icons/profile_active.png') },
        ]}
        navigation={navigation}
        imagestyle1={{ width: 25, height: 25, backgroundColor: '#fff', countcolor: 'white', countbackground: 'black' }}
        count_inbox={0}
      />
    </View>
  )
}