import { View, Text, TouchableOpacity, StyleSheet, Platform, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import CommonButton from '../Components/CommonButton'
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import SmallButton from '../Components/SmallButton'
import { Lang_chg } from '../Provider/Language_provider'
import { Colors, Font } from '../Provider/Colorsfont'
import { config, localStorage, mobileW } from '../Provider/utilslib/Utils'
 import axios from 'axios'
import Footer from '../Provider/Footer'

const DATA = [ 
    { 
      id:"1", 
      title:"Data Structures"
    }, 
    { 
      id:"2", 
      title:"STL"
    }, 
    { 
      id:"3", 
      title:"C++"
    }, 
    { 
      id:"4", 
      title:"Java"
    }, 
    { 
      id:"5", 
      title:"Python"
    }, 
    { 
      id:"6", 
      title:"CP"
    }, 
    { 
      id:"7", 
      title:"ReactJs"
    }, 
    { 
      id:"8", 
      title:"NodeJs"
    }, 
    { 
      id:"9", 
      title:"MongoDb"
    }, 
    { 
      id:"10", 
      title:"ExpressJs"
    }, 
    { 
      id:"11", 
      title:"PHP"
    }, 
    { 
      id:"12", 
      title:"MySql"
    }, 
  ]; 
    
  const Item = ({title}) => { 
    return(  
      <View style={[styles.item,{flexDirection:'row',alignItems:'center' }]}> 
      <Image
        style={{width:40,height:40, borderRadius:20}}
        source={{
          uri: 'https://reactnative.dev/img/tiny_logo.png',
        }}
      />
        <Text style={{width:mobileW*65/100,fontSize:mobileW*3.7/100}}>     {title}</Text> 
      <Image
        style={{width:40,height:40, borderRadius:20}}
        source={require('../Icons/camera1.png')}
      />
      </View> 
    ); 
  } 


export default function ProviderHome({ navigation }) {

    const [selectcard, setSelectCard] = useState('beginners')

    const [beginnerlist, setBeginners] = useState([])
    const [userName, setUserName] = useState("AP")

    const renderItem = ({item})=>(  
        <Item title={item.title}/> 
      ); 

    return (
        <View style={{ flex: 1, backgroundColor: global.UserType== 0 ? Colors.girlbackgroundcolor : Colors.boybackgroundcolor }}>
            <Header 
            backIcon={false}
            navigation={navigation} 
            title={Lang_chg.ProviderHome[config.language]}
            secondImage={userName}></Header>
            <FlatList 
       data={DATA} 
       renderItem={renderItem} 
       keyExtractor={item => item.id} 
    /> 
                     <Footer
                    activepage='ProviderHome'
                    usertype={1}
                    footerpage={[
                        { name: 'ProviderHome', pageName: 'ProviderHome', countshow: false, image: require('../Icons/home_bank.png'), activeimage: require('../Icons/home_active.png') },

                        { name: 'Notifications', pageName: 'Notifications', countshow: false, image: require('../Icons/notification.png') , activeimage: require('../Icons/notification_active.png')   },

                        { name: 'Search', pageName: 'Search', countshow: false, image: require('../Icons/heart.png'), activeimage: require('../Icons/heart_full.png') },

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

const styles = StyleSheet.create({
    cardView: {
        width: mobileW * 75 / 100,
        borderWidth: mobileW * 0.2 / 100,
        borderColor: Colors.lightGreyColor,
        height: mobileW * 40 / 100,
        borderRadius: mobileW * 4 / 100,
        padding: mobileW * 3 / 100,
        marginTop: mobileW * 5 / 100
    },
    cardTitle: {
        color: Colors.whiteColor,
        fontFamily: Font.DrunkBold,
        marginTop: mobileW * 4 / 100,
        textAlign: 'center',
        fontSize: mobileW * 8.1 / 100
    },
    item: { 
        backgroundColor: Colors.girlHeadercolor, 
        padding: 15, 
        marginVertical: 5, 
        marginHorizontal: 18, 
      }, 
})


 