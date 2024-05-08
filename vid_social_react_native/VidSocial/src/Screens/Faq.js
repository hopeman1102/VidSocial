import React, { Component } from 'react';
import { Text, BackHandler, SafeAreaView, StatusBar, KeyboardAvoidingView, Alert, View, StyleSheet, Keyboard, Dimensions, ImageBackground, TouchableOpacity, Image, Modal, FlatList, ScrollView, RadioButton, Button, TextInput, Linking } from 'react-native'
import { Colors, Font } from '../Provider/Colorsfont';
import { mobileW, mobileH, localStorage } from '../Provider/utilslib/Utils';
import { localimag } from '../Provider/utilslib/Utils';
import { Lang_chg } from '../Provider/utilslib/Utils';
import { config } from '../Provider/utilslib/Utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Header from '../Components/Header';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import HTMLView from 'react-native-htmlview'

class Faq extends Component {
    constructor(props) {
        super(props)
        this.state = {
            status: false,
            user_id: '',
            show: false,
            faq_arr: "NA",
        }
    }

    componentDidMount() {
        this.GetallCoins()
    }

    GetallCoins = async () => {

        var Token = await localStorage.getItemString("AccessToken")
        console.log(Token);

        global.props.showLoader();
        let apiUrl = appBaseUrl.FrequentQuestions;

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly',
            'Authorization': 'Bearer ' + Token,
            'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
        };

        // Make a POST request using Axios
        axios.get(apiUrl, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("FAQ--->22244444444444444", response.data.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    this.setState({ faq_arr: response.data.data })
                } else {
                    global.props.hideLoader();
                    alert(response.data.error)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---22', error);
            });
    }

    setFAQ = (item, index) => {
        let data1 = this.state.faq_arr;
        data1[index].is_active = !data1[index].is_active;
        var send_data = [];
        for (let i = 0; i < data1.length; i++) {
            if (data1[i].is_active == true) {
                send_data.push(data1[i].answer);
            }
        }
        if (send_data.length <= 0) {
            this.setState({
                faq_arr: data1,
            })
        } else {
            this.setState({
                faq_arr: data1,
            })
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    hidden={false}
                    translucent={false}
                    // barStyle="dark-content"
                    networkActivityIndicatorVisible={true}
                />
                <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>

                    <Header
                        backIcon={true}
                        navigation={this.props.navigation}
                        title={global.UserType == 0 ? Lang_chg.Frequent_questions_for_user[config.language] : Lang_chg.Frequent_questions[config.language]}
                        firstImage={localimag.back_icon}
                    ></Header>

                    <KeyboardAwareScrollView
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ width: mobileW, paddingBottom: mobileH * 5 / 100 }}
                        keyboardShouldPersistTaps='handled'>
                        <View style={{ marginTop: mobileH * 1 / 100 }}>
                            {this.state.faq_arr != 'NA' ?
                                <FlatList
                                    data={this.state.faq_arr}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item, index }) =>
                                        <TouchableOpacity
                                            onPress={() => { this.setFAQ(item, index) }}
                                            activeOpacity={0.9}
                                        >
                                            {item.is_active == true ?
                                                <View style={{ marginBottom: mobileH * 0.02 }}>
                                                    <View
                                                        style={styles.HeadView}
                                                    >
                                                        <View style={{ flexDirection: 'row', width: mobileW * 70 / 100 }}>
                                                            {/* <Text style={styles.QuestionText}>{item.question}</Text> */}
                                                            <HTMLView
                                                                value={item.question}
                                                                stylesheet={styles12}
                                                            />
                                                        </View>
                                                        <Image
                                                            resizeMode='contain'
                                                            style={styles.AddSubIcon}
                                                            source={localimag.AddFaq}
                                                        ></Image>
                                                    </View>
                                                </View>
                                                :
                                                <View style={styles.AnswereHeadView}>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                                            width: mobileW * 95 / 100, alignSelf: 'center',
                                                            paddingHorizontal: mobileW * 3.2 / 100,
                                                        }}
                                                    >
                                                        <View style={{ flexDirection: 'row', width: mobileW * 70 / 100 }}>
                                                            {/* <Text style={styles.QuestionText}>{index + 1}. {item.question}</Text> */}
                                                            <HTMLView
                                                                value={item.question}
                                                                stylesheet={styles12}
                                                            />
                                                        </View>
                                                        <Image
                                                            resizeMode='contain'
                                                            style={styles.AddSubIcon}
                                                            source={localimag.SubFaq}
                                                        ></Image>

                                                    </View>
                                                    <View>
                                                        {/* <Text style={{ color: Colors.darkGray, fontSize: mobileW * 3 / 100, fontFamily: Font.FontMedium, textAlign: 'justify', marginTop: mobileW * 1.5 / 100, width: mobileW * 75 / 100 }}>{item.answer}</Text> */}
                                                        <HTMLView
                                                            value={item.answer}
                                                            stylesheet={styles12}
                                                        />
                                                    </View>
                                                </View>}
                                        </TouchableOpacity>}

                                /> : <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: mobileH * 60 / 100 }}>
                                    <Image resizeMode='contain' style={{ width: mobileW * 80 / 100, height: mobileW * 80 / 100 }} source={localimag.nodata}></Image>
                                </View>}


                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>
        )
    }
} export default Faq

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        backgroundColor: Colors.white_color
    },
    headview:
    {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: mobileW * 90 / 100,
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: mobileH * 3.5 / 100
    },
    left_icon: {
        width: mobileW * 6 / 100,
        height: mobileW * 6 / 100
    },
    right_icon: {
        width: mobileW * 5.5 / 100,
        height: mobileW * 5.5 / 100
    },
    headtitle: {
        color: Colors.black_color,
        fontFamily: Font.FontSemiBold,
        fontSize: mobileW * 4 / 100,
        marginLeft: mobileW * 4 / 100,

    },
    AddSubIcon: {
        width: mobileW * 7 / 100,
        height: mobileW * 7 / 100
    },
    HeadView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: mobileW * 95 / 100,
        alignSelf: 'center',
        paddingVertical: mobileH * 3 / 100,
        backgroundColor: Colors.blueColour,
        paddingHorizontal: mobileW * 3.2 / 100,
        backgroundColor: Colors.whiteColor,
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 1 / 100
    },
    QuestionText: {
        color: Colors.blackColor,
        fontSize: mobileW * 4 / 100,
        fontFamily: Font.FontSemiBold
    },
    AnswereHeadView: {
        width: mobileW * 95 / 100, alignSelf: 'center',
        paddingVertical: mobileH * 2 / 100,
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 1 / 100,
        borderRadius: 7,
        backgroundColor: Colors.whiteColor,
        paddingHorizontal: mobileW * 3.2 / 100,
    }
})

const styles12 = StyleSheet.create({
    textfont: {
        fontSize: 13,
        fontWeight: '300',
        color: Colors.blackColor,
        fontStyle: 'normal',
    },
    p: {
        fontWeight: '300',
        color: Colors.blackColor,
        fontStyle: 'normal',
    },

})
