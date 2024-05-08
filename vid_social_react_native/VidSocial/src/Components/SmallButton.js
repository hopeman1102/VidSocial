import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Font, Colors } from '../Provider/Colorsfont'
import { mobileW } from '../Provider/utilslib/Utils'

export default function SmallButton({navigation, screenName, title,onPressClick}) {
  return (
    <View style={{   }}>
      <TouchableOpacity
      // onPress={()=>navigation.navigate(screenName)}
      onPress={onPressClick}
        activeOpacity={0.6}
        style={[{
          alignSelf: "center", justifyContent: "center",
          height: mobileW * 14 / 100, width: mobileW * 65 / 100,
          alignItems: "center", borderRadius: mobileW * 4 / 100,
          backgroundColor: Colors.buttonColor
        }]}>
        <Text
          style={{
            fontFamily: Font.DrunkBold,
            fontWeight:"500",
            fontSize: mobileW * 3.5 / 100,
            color: Colors.lightAccent
          }}>{title||"Complete"}</Text>
      </TouchableOpacity>
    </View>
  )
}