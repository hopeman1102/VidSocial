import { View, Text } from 'react-native'
import React from 'react'
import { Lang_chg } from '../Provider/Language_provider'
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import WebView from 'react-native-webview'
import { useRoute } from '@react-navigation/native'
import { Font } from '../Provider/Colorsfont'

export default function PrivacyPolicy({ navigation }) {
    const route = useRoute()
    const titles = route.params?.titles


    return (
        <View style={{ flex: 1 }}>
            <Header
                backIcon={true}
                navigation={navigation}
                title={titles}
                firstImage={localimag.icon_back} />

            <Text style={{ fontFamily: Font.FontRegularFono, padding: 10 }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                It has survived not only five centuries, but also the leap into electronic typesetting,
                remaining essentially unchanged. It was popularised in the 1960s with the release of
                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum.

            </Text>

            {/* <WebView source={{ uri: 'https://reactnative.dev/' }}  /> */}

        </View>
    )
}