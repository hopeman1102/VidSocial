//import liraries
// import React, { Component } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// // create a component
// const CommonButton = (props) => {
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//       onPress={()=>props.onPressClick()}>
//       <Text>CommonButton</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // define your styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#2c3e50',
//   },
// });

// //make this component available to the app
// export default CommonButton;


import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Font, Colors } from '../Provider/Colorsfont'
import { apifuntion, mobileW } from '../Provider/utilslib/Utils'
import LinearGradient from 'react-native-linear-gradient'
const CommonButton = ({ ScreenName, title, navigation, apiData, onPressClick, keys, ButtonColor }) => {

  const _apiCalling = async (status = 0) => {
    let url = 'https://dummy.restapiexample.com/api/v1/employees'
    apifuntion.getApi(url).then((obj) => {
      // console.log('obj---', obj);
      apiData(obj)
    }).catch((error) => {
      console.log('error---', error);
    })
  }

  return (
    <TouchableOpacity
      // key={keys}
      onPress={onPressClick}
      activeOpacity={0.6}
      style={{ height: mobileW * 12 / 100, width: mobileW * 75 / 100, justifyContent: 'center', alignItems: 'center', borderRadius: mobileW * 2 / 100, }}
      >
      <LinearGradient
        colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
        style={{ height: mobileW * 12 / 100, width: mobileW * 75 / 100, justifyContent: 'center', alignItems: 'center', borderRadius: mobileW * 2 / 100, }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
          <Text
            style={{
              fontFamily: Font.FontMedium,
              fontSize: mobileW * 4.2 / 100,
              color: Colors.whiteColor
            }}>{title}</Text>
       
      </LinearGradient>
    </TouchableOpacity>
  )
}
export default CommonButton