import React, { Component } from 'react';
import { Text, View, Image, StyleSheet, Modal, TouchableOpacity, Dimensions, Alert, FlatList, BackHandler } from 'react-native';
// import Icon1 from 'react-native-vector-icons/Entypo'
import { Colors, Font } from '../Provider/Colorsfont'
import { config, localStorage, Lang_chg, msgProvider, mobileW, mobileH } from './utilslib/Utils';
const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);
export default class Footer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      color: '',
      modalVisible1: false,
      loading: false,
      isConnected: true,
    }
    BackHandler.removeEventListener('hardwareBackPress',
      () => { return true });
  }
  componentDidMount() {
    // firebaseprovider.messagecountforfooter()
  }
  messagecountforfooter = async () => {

    console.log('getMyInboxAllDatagetinboxaccount');
    userdata = await localStorage.getItemObject('user_arr')
    //------------------------------ firbase code get user inbox ---------------
    if (userdata != null) {
      // alert("himanshu");
      var id = 'u_' + userdata.user_id;
      if (inboxoffcheck > 0) {
        console.log('getMyInboxAllDatainboxoffcheck');
        var queryOffinbox = firebase.database().ref('users/' + id + '/myInbox/').child(userChatIdGlobal);
        //queryOff.off('child_added');
        queryOffinbox.off('child_changed');
      }

      var queryUpdatemyinbox = firebase.database().ref('users/' + id + '/myInbox/');
      queryUpdatemyinbox.on('child_changed', (data) => {
        console.log('inboxkachildchange', data.toJSON())
        //  this.showUserInbox()
        firebaseprovider.firebaseUserGetInboxCount();
      })
    }
  }
  usercheckbtn = async (page) => {
    this.props.functionremove
    const navigation = this.props.navigation;
    let userdata = await localStorage.getItemObject('user_arr')
    console.log('userdata', userdata)
    if (userdata != null) {
      if (this.props.usertype == 1) {
        navigation.navigate(page)
      }
      else {
        if (userdata.profile_complete == 0 && userdata.otp_verify == 1) {
          for (let i = 0; i < this.props.footerpage.length; i++) {
            if (page == this.props.footerpage[i].name) {
              navigation.navigate(page)
            }
          }
        }
        else {
          this.setState({ modalVisible1: true })
        }
      }
    } else {
      if (this.props.usertype == 1) {
        navigation.navigate(page)
      }
      else {
        this.setState({ modalVisible1: true })
      }
    }
  }
  
   Checkuser = () => {
      Alert.alert(
             'confirm',
             'please first login',
              [
                  {
                      text: msgTitle.cancel[0], 
                  },
                  {
                      text: msgTitle.ok[0], 
                      // onPress: () =>  this.btnPageLoginCall(),
                      onPress: ()=>{this.props.navigation.navigate('Userlogin')}
                  },
              ],
              {cancelable: false},
          );
    }

 
  render() {

    // console.log('this.props.color', this.props.color + '/n')
    const navigation = this.props.navigation;

    let footerwidth = parseInt(100 / this.props.footerpage.length)
    return (
      <View style={[style1.footercontainer, { backgroundColor: this.props.imagestyle1.backgroundColor }]}>
        <FlatList
          data={this.props.footerpage}
          //    horizontal={true}
          scrollEnabled={false}
          numColumns={this.props.footerpage.length}
          renderItem={({ item, index }) => {
            return (
              <View style={{ width: screenWidth * footerwidth / 100, alignSelf: 'center', alignItems: 'center' }}>
                {item.name == this.props.activepage ? <TouchableOpacity activeOpacity={0.8} style={style1.footericon} onPress={() => { this.usercheckbtn(item.name) }}>
                  <View style={style1.footericonview}>
                    <Image tintColor={ global.UserType == 0?Colors.blueColour:Colors.Pink } source={item.activeimage} resizeMethod='resize' style={[style1.footerimage, {
                      width: this.props.imagestyle1.width,
                      height: this.props.imagestyle1.height,
                    }]} />
                    {item.countshow == true && <View style={{ position: 'absolute', top: -2, left: 10, alignItems: 'center', justifyContent: 'center' }}>
                      {item.inbox_count > 0 &&
                        <View style={{ alignSelf: 'center', width: 23, height: 18, borderRadius: 5, backgroundColor: "red", justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#ffffff', textAlign: 'center', textAlignVertical: 'center', fontFamily: "Poppins-Bold", fontSize: 15, }}>{item.inbox_count > 9 ? '+9' : item.inbox_count}</Text>
                        </View>}

                    </View>}
                    {
                      item.name == this.props.activepage ?  <Text style={{color: global.UserType == 0?Colors.blueColour:Colors.Pink ,textAlign:'center',textAlignVertical:'center',fontFamily:Font.FontMedium,fontSize:10,marginTop:mobileH*1/100}}>{item.pageName}</Text>
                      :
                      <Text style={{color:'#9f9f9f',textAlign:'center',textAlignVertical:'center',fontFamily:Font.FontMedium,fontSize:10,marginTop:mobileH*1/100}}>zxxcv</Text>
                    }
                  </View>
                </TouchableOpacity> :
                  <TouchableOpacity activeOpacity={0.8} style={[style1.footericon]} onPress={() => { this.usercheckbtn(item.name) }}>
                    <View style={style1.footericonview}>
                      <Image tintColor={Colors.grayColour} source={item.image} resizeMethod='resize' style={[style1.footerimage, {
                        width: this.props.imagestyle1.width,
                        height: this.props.imagestyle1.height,
                      }]} />
                      {item.countshow == true && <View style={{ position: 'absolute', top: -2, left: 10, alignItems: 'center', justifyContent: 'center' }}>
                        {item.inbox_count > 0 &&
                          <View style={{ alignSelf: 'center', width: 23, height: 18, borderRadius: 5, backgroundColor: 'red', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color:'#ffffff', textAlign: 'center', textAlignVertical: 'center', fontFamily: Font.FontMedium, fontSize1015, }}>{item.inbox_count > 9 ? '+9' : item.inbox_count}</Text>
                          </View>}

                      </View>}
                      {
                      item.name == this.props.activepage ?  <Text style={{color:global.UserType== 0 ? Colors.girlHeadercolor : Colors.boyHeader,textAlign:'center',textAlignVertical:'center',fontFamily:Font.FontMedium,fontSize:10,marginTop:mobileH*1/100}}>{item.pageName}</Text>
                      :
                      <Text style={{color:'#9f9f9f',textAlign:'center',textAlignVertical:'center',fontFamily:Font.FontMedium,fontSize:10,marginTop:mobileH*1/100}}>{item.pageName}</Text>
                    }
                    </View>
                  </TouchableOpacity>
                }
              </View>
            )
          }}
        />
      </View>

    )
  }
}
const style1 = StyleSheet.create({

  footercontainer: {
    flexDirection: 'row', 
    width: screenWidth,
    height:mobileH*9/100,
    // backgroundColor:'#e6e6e6',
    position: 'absolute',
    elevation: 20,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    borderTopWidth: 1,
    borderTopColor: '#f7f7f7',
    shadowColor: 'black',
    bottom: 0,
    borderTopEndRadius:mobileW*3.5/100,
    borderTopStartRadius :mobileW*3.5/100
  },
  footericon: {
    width: screenWidth * 25 / 100,
    paddingTop: 8,
    paddingBottom: 6

  },
  footericonview: {
    alignSelf: 'center',
    paddingVertical: 7
  },
  footertext: {
    color: 'gray',
    fontSize: 13,
    fontFamily: "Poppins-Medium"
  },
  footerimage: {
    alignSelf: 'center',
    resizeMode: 'contain'
  }

})