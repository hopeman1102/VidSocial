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
    StatusBar,
} from "react-native"
import { Colors, Font, config, Lang_chg, mobileW, mobileH, localimag } from "../Provider/utilslib/Utils";
import LinearGradient from "react-native-linear-gradient";
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
                    this.setState({ modalVisible: false })
                }}>

                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.girlHeadercolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadViewForWithdraw}>
                            <View
                                style={styles.ModalHeaderView}
                            >

                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 5 / 100,
                                        fontFamily: Font.FontSemiBold
                                    }]}
                                >{Lang_chg.Alert[config.language]}</Text>

                            </View>
                            <View style={{width:'80%',height:mobileH*12/100, 
                        alignItems:'center',justifyContent:'center'
                        }}>
                                <Text
                                    style={[styles.Callsin, {
                                        fontSize: mobileW * 4 / 100,
                                        fontFamily: Font.FontRegular,
                                        textAlign:'center'
                                    }]}
                                >{this.props.AlertData}</Text>
                            </View>
                            <TouchableOpacity
                                    onPress={() => {this.props.Canclemedia() }}
                                    activeOpacity={0.6}
                                    style={styles.OkButton}
                                >
                            <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={styles.OkButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                    <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                            </LinearGradient>
                                </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    Callsin: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 2.7 / 100,
        // marginTop:mobileH*1/100
    },

    ModalMainView: {
        backgroundColor: "#00000080",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    ModalheadViewForWithdraw: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: mobileW * 6 / 100,
        width: "100%",
       paddingVertical:mobileH*2/100,
        alignItems: 'center'
    },
    ModalHeaderView: {
        width: '100%', height: mobileH * 7 / 100,
        borderBottomWidth: mobileW * 0.3 / 100,
        borderBottomColor: Colors.grayColour,
        alignItems: "center",
        flexDirection: 'row',
        paddingHorizontal: mobileW * 5 / 100,
        justifyContent: 'center'
    },
    textAlignextInputBaseView: {
        height: mobileW * 11 / 100,
        width: mobileW * 72 / 100,
        alignSelf: "center",
        justifyContent: 'center',
        marginTop: mobileW * 3.5 / 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.borderColour,
        borderRadius: mobileW * 2 / 100
    },
    textInputStyle: {
        width: mobileW * 67 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 2.8 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray,
    },
    AmountValue: {
        fontFamily: Font.FontMedium,
        color: Colors.blackColor,
        fontSize: mobileW * 4 / 100,
        // marginTop:mobileH*1/100
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        alignItems: "center"
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
})

