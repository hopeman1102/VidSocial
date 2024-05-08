import React, { Component } from "react"
import {
    View, Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Text,
    SafeAreaView,
} from "react-native"
import { Colors,Font,config,Lang_chg,mobileW } from '../utilslib/Utils';
const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);


export default class Cameragallery extends Component {
    render() {
        return (
            <Modal
             animationType='fade'
             transparent={true}
             visible={this.props.mediamodal}
             onRequestClose={() => {
                  this.setState({modalVisible:false})
             }}>
               {/* '#92B8FD', '#FF87A4' */}
            <View style={{ flex: 1, backgroundColor: '#00000030', alignItems: 'center' }}>
                <View style={{ position: 'absolute', bottom:25, width:screenWidth, }}>
                     <View style={{ backgroundColor: global.UserType == 0 ? '#92B8FD' :'#FF87A4', borderRadius: 15, width:'94%', paddingVertical:mobileW*3.3/100,alignSelf:'center' }}>
                                <TouchableOpacity
                                >
                                    <Text style={{ color: Colors.whiteColor, fontSize: 17, alignSelf: 'center', fontFamily: Font.FontRegular }}>{Lang_chg.selectLeveltxt[config.language]}</Text>
                                </TouchableOpacity>
                                <View style={{ borderBottomColor: Colors.border, borderBottomWidth: 2, marginTop: 10 }}></View>
                                <TouchableOpacity
                                onPress={()=>{this.props.Camerapopen()}}
                                >
                                    <Text style={{ color: Colors.whiteColor, fontSize: 18, alignSelf: 'center', fontFamily: Font.FontRegular ,marginTop: 10,}}>{Lang_chg.MediaCamera[config.language]}</Text>
                                </TouchableOpacity>
                                <View style={{ borderBottomColor: Colors.border, borderBottomWidth: 2, marginTop: 10 }}></View>
                                <TouchableOpacity
                                onPress={()=>{this.props.Galleryopen()}}
                                >
                                    <Text style={{ color: Colors.whiteColor, fontSize: 18, alignSelf: 'center', fontFamily: Font.FontRegular ,marginTop: 10,}}>{Lang_chg.Mediagallery[config.language]}</Text>
                                </TouchableOpacity>

                            </View>
                    <View style={{ marginTop: 15, alignSelf: 'center', borderRadius: 15, backgroundColor:Colors.white_color, width: '94%', justifyContent: 'center', alignItems: 'center',  }}>
                        <TouchableOpacity onPress={() => {this.props.Canclemedia() }} style={{ alignSelf: 'center',  width: '94%',  alignItems: 'center', justifyContent: 'center',paddingVertical:screenWidth*3.5/100}}>
                            <Text style={{fontFamily:Font.FontRegular, fontSize: screenWidth*4/100, color:'red'}}>{Lang_chg.cancelmedia[config.language]}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
      
        </Modal>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        justifyContent: "center",
        backgroundColor: '#00000040',
        top: 0, left: 0, bottom: 0, right: 0
    },

    activityIndicatorWrapper: {
        height: 80,
        width: 80,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 6,
        justifyContent: "space-around",
        alignItems: "center",
        alignSelf: "center",
    }
})
