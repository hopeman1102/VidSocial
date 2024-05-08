import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity, StatusBar, Modal, Alert, FlatList } from 'react-native'
import React, { useState } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mediaprovider, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { RadioButton } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import { useEffect } from 'react';
import { useRoute } from '@react-navigation/native'
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import CommonAlert from '../Components/CommonAlert';
import Firebase from '../Firebase/firebaseConfig';
import { SignUpUser } from '../Firebase/SignUp';
import { AddUser } from '../Firebase/Users';

export default function SignUP1({ navigation }) {

    const [checked, setChecked] = React.useState('male');
    const [checked1, setChecked1] = React.useState('user');
    const [modalVisible, setmodalVisible] = React.useState(false);
    const [modalVisibleVerification, setmodalVisibleVerification] = React.useState(false);
    const [RememberMe, setRememberMe] = React.useState(true);
    const [profile_image, setprofile_image] = React.useState('');
    const [countryCode, setCountryCode] = useState('US');
    const [country, setCountry] = useState(null);
    const [DatePickerModal, setDatePickerModal] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState('')
    const [BdayDateforApi, setBdayDateforApi] = useState('')
    const [BirthDate, setBirthDate] = useState('NA')
    const [IdNumber, setIdNumber] = useState('')
    const [RepeatIdNumber, setRepeatIdNumber] = useState('')
    const [phoneNumber, setphoneNumber] = useState('')
    const [CountryID, setCountryID] = useState(240)
    const [CountryDetails, setCountryDetails] = useState('')
    const [CountryPickerModal, setCountryPickerModal] = useState(false)
    const [IsUserAlreadyPresent, setIsUserAlreadyPresent] = useState(false)
    const [User_id, setUser_id] = useState(0)

    const [DOBFullFormate, setDOBFullFormate] = useState('')
    const [FlagUrl, setFlagUrl] = useState('https://flagcdn.com/120x90/us.png')

    const route = useRoute()
    const name = route.params?.name
    const email = route.params?.email
    const password = route.params?.password
    const display_name = route.params?.display_name
    const language = route.params?.language

    const [AlertModal, setAlertModal] = useState(false)
    const [AlertMessage, setAlertMessage] = useState('')

    useEffect(() => {
        toGetAllCountry()
    }, [])

    useEffect(() => {
        ToGetUserData()
    }, [])

    const ToGetUserData = async () => {
        var result = await localStorage.getItemObject("UserDataForSignup")
        if (result != null) {
            setIsUserAlreadyPresent(true)
            console.log('hello i am here ', result);
            setUser_id(result.id)
            setIdNumber(result.identity_no)
            setRepeatIdNumber(result.identity_no)
            setphoneNumber(result.phone)
            setCountryID(result.country_id)
            // ======== TO set USer Type ============
            if (result.role_id == "worker") {
                setChecked('female')
                setChecked1('worker')
                global.UserType = 1
            }
            // ======= To Set Date Formate ===========
            setBdayDateforApi(result.date_of_birth)
            //   setNickName(result.date_of_birth)
            const inputDateStr = result.date_of_birth;
            // Convert the input date to moment object
            const inputDate = moment(inputDateStr, "YYYY-MM-DD");
            // Format the date as "DD MM YYYY"
            const outputDateStr = inputDate.format("DD-MM-YYYY");
            setBirthDate(outputDateStr)
        }
    }

    const toGetAllCountry = () => {
        global.props.showLoader();

        let apiUrl = appBaseUrl.CountryList;
        console.log(apiUrl);
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': 'HttpOnly'
        };

        axios.get(apiUrl, { headers })
            .then(async (response) => {
                 if (response.data.code == 200) {
                    global.props.hideLoader();
                    setCountryDetails(response.data.data)

                } else {
                    global.props.hideLoader();
                    Alert.alert("Sign Up", response.data.message);
                }
            })
            .catch(error => {
                global.props.hideLoader();
                alert(error);
                console.log('Loginerror---', error);
            });
    }

    const onSelect = (selectedCountry) => {
        console.log('---->>>', selectedCountry);
        setCountryCode(selectedCountry.cca2);
        setCountry(selectedCountry);
        setCountryID(selectedCountry.callingCode);
    };

    const _openCamera = () => {
        navigation.navigate('TakePicture')
    }

    const onDateChange = (date, type) => {
        let newDate = moment(date).format('DD-MM-YYYY')
        let newDateforApi = moment(date).format('YYYY-MM-DD')
        console.log('.................', newDate);
        //function to handle the date change
        console.log(newDate, "=============> newDate <===========");
        setSelectedStartDate(newDate);
        setBdayDateforApi(newDateforApi);
        setBirthDate(newDate);
        setDOBFullFormate(date);

    };

    const ToUSerSignUP = () => {

        //email============================
        if (IdNumber.length <= 0) {
            msgProvider.toast(Lang_chg.emptyIdNumber[config.language], 'bottom')
            return false
        }
        if (IdNumber.length < 5) {
            msgProvider.toast(Lang_chg.emptyIdNumberlength[config.language], 'bottom')
            return false
        }

        //------------------name===================
        if (RepeatIdNumber.length <= 0) {
            msgProvider.toast(Lang_chg.emptyrepeatIdNumber[config.language], 'bottom')
            return false
        }
        if (RepeatIdNumber.length < 5) {
            msgProvider.toast(Lang_chg.emptyrepeatIdNumberlength[config.language], 'bottom')
            return false
        }

        if (IdNumber != RepeatIdNumber) {
            msgProvider.toast(Lang_chg.repeatIdNumbersame[config.language], 'bottom')
            return false
        }


        //======================================mobile============================
        if (phoneNumber.length <= 0) {
            msgProvider.toast(Lang_chg.emptyMobile[config.language], 'center')
            return false
        }

        if (phoneNumber.length < 7) {
            msgProvider.toast(Lang_chg.mobileMinLength[config.language], 'center')
            return false
        }
        if (phoneNumber.length > 15) {
            msgProvider.toast(Lang_chg.mobileMaxLength[config.language], 'center')
            return false
        }
        var mobilevalidation = config.mobilevalidation;
        if (mobilevalidation.test(phoneNumber) !== true) {
            msgProvider.toast(Lang_chg.validMobile[config.language], 'center')
            return false
        }

        //======================================mobile============================
        if (BirthDate == "NA") {
            msgProvider.toast(Lang_chg.selectbirthDate[config.language], 'center')
            return false
        }

        const currentDate = moment();
        const selectedDateMoment = moment(DOBFullFormate, 'DD MM YYYY');

        if (selectedDateMoment.isValid()) {
            const age = currentDate.diff(selectedDateMoment, 'years');
            if (age < 18) {
                msgProvider.toast('You must be at least 18 years old.', 'center')
                return false
            }
        }
        //======================================mobile============================
        if (RememberMe == true) {
            msgProvider.toast(Lang_chg.legalAge[config.language], 'center')
            return false
        }

        if (IsUserAlreadyPresent) {
            _signUpApiCallingForExixtingUser()

        } else {
            _signUpApiCalling()
        }
    }

    // ================ API CAlling For New User ===================
    const _signUpApiCalling = async () => {
        global.props.showLoader();
        let apiUrl = appBaseUrl.SignUpUrl;
        var UserType = 'user'
        if(checked=='male'){
            UserType = 'user'
        }else{
            UserType = 'worker'
        }

        var postData = JSON.stringify({
            first_name: name,
            last_name: '',
            email: email,
            password: password,
            display_name: display_name,
            identity_no: IdNumber,
            date_of_birth: BdayDateforApi,
            country_id: CountryID,
            phone: phoneNumber,
            gender: checked,
            role_id: UserType,
            language: language
        });
        console.log('apiUrl-----------', apiUrl);
        console.log('postData-----------', postData);

         const headers = {
            'Content-Type': 'application/json',
        };

        axios.post(apiUrl, postData, { headers })
            .then(async (response) => {
                console.log("signUpResponse--->", response.data);
                if (response.data.code == 201) {
                    global.props.hideLoader();
                    var UserType = response.data.data.role_id
                    await localStorage.setItemObject("UserData", response.data.data)
                    ToSignUpUserOnFirebase(response.data.data.id)
                    if (UserType == 'worker') {
                        setTimeout(() => {
                            navigation.navigate('TakePicture')
                        }, 500);
                    } else {
                        setTimeout(() => {
                            msgProvider.toast(Lang_chg.SignUpsucc[config.language], 'center')
                            setmodalVisible(true)
                        }, 500);
                    }
                } else if (response.data.code == 400) {
                    global.props.hideLoader();
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                    // alert(response.data.message);
                } else {
                    global.props.hideLoader();
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---', error);
                if (error.response) {
                    // alert(error.response.data.message);
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                    console.error('Server Error Data:', error.response.data.message);
                    console.error('Server Error Status:', error.response.status);
                    console.error('Server Error Headers:', error.response.headers);
                }
            });
    }

    // ----------------- Code to be use for Firebase ----------------
    const ToSignUpUserOnFirebase = async (User_id) => {
        await SignUpUser(email, '123456').
            then(async (res) => {
                console.log('res', res);
                var userUID = Firebase.auth().currentUser.uid;
                var Name = name
                console.log('Person UUID is here:', userUID);
                // GetUUIDFromFunction(userUID)
                // setloader(true)
                await AddUser(Name, email, User_id).
                    then(async (res) => {
                        console.log(' i am hare', res);
                    }).
                    catch((error) => {
                        // alert(error);
                        console.log('error', error);
                    })
                console.log(userUID);
            }).
            catch((err) => {
                // alert(err);
                console.log('err-----', err);
            })
    }
    // ================ API CAlling For Existing User ===================
    const _signUpApiCallingForExixtingUser = async () => {

        global.props.showLoader();
        let apiUrl = appBaseUrl.SignUpUrl + '/' + User_id;

        var UserRoleforApp = 'user';
        if (checked1 == 'male') {
            UserRoleforApp = 'user'
        } else {
            UserRoleforApp = 'worker'
        }
        // const [checked, setChecked] = React.useState('male');

        var postData = JSON.stringify({
            first_name: name,
            last_name: '',
            email: email,
            password: password,
            display_name: display_name,
            identity_no: IdNumber,
            date_of_birth: BdayDateforApi,
            country_id: CountryID,
            phone: phoneNumber,
            gender: checked,
            role_id: UserRoleforApp
        });

        console.log('--------------------',apiUrl);
        console.log('--------------------',postData);
        const headers = {
            'Content-Type': 'application/json',
        };

        axios.put(apiUrl, postData, { headers })
            .then(async (response) => {
                console.log("signUpResponse--->", response.data);
                if (response.data.code == 200) {
                    global.props.hideLoader();
                    var UserType = response.data.data.role_id
                    await localStorage.setItemObject("UserData", response.data.data)
                    if (UserType == 'worker') {
                        setTimeout(() => {
                            navigation.navigate('TakePicture')
                        }, 500);
                    } else {
                        setTimeout(() => {
                            msgProvider.toast("SignUp successfully", 'center')
                            setmodalVisible(true)
                        }, 500);
                    }
                } else if (response.data.code == 400) {
                    global.props.hideLoader();
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                    // alert(response.data.message);
                } else {
                    global.props.hideLoader();
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('Loginerror---', error);
                if (error.response) {
                    // alert(error.response.data.message);
                    setAlertMessage(response.data.message)
                    setAlertModal(true)
                    console.error('Server Error Data:', error.response.data.message);
                    console.error('Server Error Status:', error.response.status);
                    console.error('Server Error Headers:', error.response.headers);
                }
            });
    }

    // --------------------------------
    const toSelectCountry = (item) => {
        for (let i = 0; i < CountryDetails.length; i++) {
            if (CountryDetails[i].id == item.id) {
                console.log('======>>>', item);
                setCountryCode(item.dial_code)
                setCountryID(item.id)
                setFlagUrl(item.flag_url)
            }
        }
        setCountryPickerModal(false)
    }

    return (
        <View style={styles.container}>
            <CommonAlert AlertData={AlertMessage} mediamodal={AlertModal} Canclemedia={() => { setAlertModal(false) }}
            />
            {/* ---- Congrats Modal ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { setmodalVisible(!modalVisible) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.themecolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadView}>
                            <Image
                                resizeMode='contain'
                                style={{ width: mobileW * 22 / 100, height: mobileW * 22 / 100 }}
                                source={localimag.Right_icon}
                            />
                            <Text style={styles.congratstxt}>{Lang_chg.cngtxt[config.language]}</Text>
                            <Text style={[styles.Modaltxt, { marginTop: mobileH * 1.5 / 100 }]}
                            >{Lang_chg.thankYoutxt[config.language]}</Text>
                            <Text style={styles.Modaltxt}>{Lang_chg.pleaseConfirm[config.language]}</Text>
                            <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={styles.OkButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setmodalVisible(false)
                                        global.props.showLoader();
                                        setTimeout(() => {
                                            global.props.hideLoader();
                                            navigation.navigate('Login')
                                        }, 1500);
                                    }
                                    }
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ---- CountryPicker Modal ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={CountryPickerModal}
                onRequestClose={() => { setCountryPickerModal(!CountryPickerModal) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.themecolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.CountryPickerModalheadView}>


                            {/* -------------------------------------- */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: mobileW * 78 / 100 }}>
                                <Image
                                    resizeMode='contain'
                                    style={{ width: mobileH * 3 / 100, height: mobileH * 3 / 100 }}
                                />
                                <Text style={{
                                    textAlign: 'center', fontSize: mobileW * 4.5 / 100,
                                    fontFamily: Font.FontSemiBold, color: Colors.blackColor
                                }}>{Lang_chg.SelectCountry1[config.language]}</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setCountryCode('IN')
                                        setCountryID(105)
                                        setCountryPickerModal(false)
                                    }}>
                                    <Image
                                        resizeMode='contain'
                                        style={{ width: mobileH * 2.5 / 100, height: mobileH * 2.5 / 100 }}
                                        source={localimag.crossb}
                                    />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={CountryDetails}
                                contentContainerStyle={{ paddingBottom: mobileH * 10 / 100 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity
                                        onPress={() => toSelectCountry(item)}
                                        activeOpacity={0.8}
                                        style={{ width: mobileW * 70 / 100, top: mobileH * 2.5 / 100, justifyContent: "space-around" }}>

                                        <View style={{
                                            width: mobileW * 70 / 100, height: mobileH * 7 / 100, borderBottomColor: Colors.appBackground,
                                            borderBottomWidth: mobileW * 0.5 / 100, justifyContent: 'center'
                                        }}>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>

                                                <Image
                                                    resizeMode='contain'
                                                    style={{ width: mobileH * 4 / 100, height: mobileH * 4 / 100 }}
                                                    source={{ uri: item.flag_url }}
                                                />
                                                <Text style={{
                                                    fontSize: mobileW * 2.8 / 100,
                                                    fontFamily: Font.FontSemiBold, color: Colors.blackColor
                                                }}>     {item.name}</Text>


                                                {CountryID == item.id ?
                                                    <Image
                                                        resizeMode='contain'
                                                        style={{ position: "absolute", right: 5, width: mobileH * 3 / 100, height: mobileH * 3 / 100 }}
                                                        source={localimag.Tick}
                                                    /> : null
                                                }
                                            </View>
                                        </View>
                                    </TouchableOpacity>} />
                            {/* -------------------------------------- */}
                            {/* <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={styles.OkButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setCountryPickerModal(false)
                                    }
                                    }
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.OKtxt[config.language]}</Text>
                                </TouchableOpacity>
                            </LinearGradient> */}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ---- Verification Modal ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisibleVerification}
                onRequestClose={() => { setmodalVisibleVerification(!modalVisibleVerification) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.themecolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.ModalheadView}>
                            <Image
                                resizeMode='contain'
                                style={{ width: mobileW * 22 / 100, height: mobileW * 22 / 100 }}
                                source={localimag.success_worker}
                            />
                            <Text style={styles.congratstxt}>{Lang_chg.Verificationtxt[config.language]}</Text>
                            <Text style={[styles.Modaltxt, { fontSize: mobileW * 3.5 / 100, marginTop: mobileH * 1.5 / 100 }]}
                            >{Lang_chg.correctinfotxt[config.language]}</Text>
                            <Text style={[styles.Modaltxt, { fontSize: mobileW * 3.5 / 100, }]}>{Lang_chg.verificationprocesstxt[config.language]}</Text>
                            <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={[styles.TakeIdView]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setmodalVisibleVerification(false)
                                        setTimeout(() => {
                                            _openCamera()
                                        }, 300);
                                    }
                                    }
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.Oktxt}>{Lang_chg.takeidphototxt[config.language]}</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* ---- Verification Modal ---- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={DatePickerModal}
                onRequestClose={() => { setDatePickerModal(!DatePickerModal) }}>
                <View style={styles.ModalMainView}>
                    <StatusBar backgroundColor={Colors.themecolor}
                        barStyle='default' hidden={false} translucent={false}
                        networkActivityIndicatorVisible={true} />
                    <View style={{ borderRadius: 20, width: "100%" }}>
                        <View style={styles.DatePickerModalheadView}>
                            <CalendarPicker
                                startFromMonday={true}
                                minDate={new Date(1850, 1, 1)}
                                maxDate={new Date()}
                                weekdays={
                                    ['Sun', 'Mon', 'Tue', 'Wed', 'Th', 'Fr', 'Sa',]}
                                months={['January', 'Febraury', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',]}
                                selectedDayColor={Colors.blueColour}
                                selectedDisabledDatesTextStyle="purple"
                                DateChangedCallback={'green'}
                                customDatesStyles={[<View style={{ width: 20, height: 20, borderRadius: mobileW * 10 / 100, backgroundColor: "blue" }}></View>]}
                                // markedDates={nextDays}
                                markedDates={{ "1850, 1, 1": { selectedEndDate: true, marked: true, selectedColor: "orange" }, "2050, 6, 3": { selectedStartDate: true, marked: true, selectedColor: "red" }, }}
                                onDayPress={({ dateString }) => markDate(dateString)}
                                allowBackwardRangeSelect="true"
                                dayLabelsWrapper={{ color: "pink" }}
                                scaleFactor={355}
                                dayShape="circle"
                                todayBackgroundColor={'lightgray'}
                                //dayLabelsWrapper={{ color: "pink" }}
                                //scaleFactor={375}
                                selectedDayTextColor={'white'}
                                // dayShape= 'oval' 
                                // todayBackgroundColor={'lightgray'}
                                textStyle={{
                                    fontFamily: 'Cochin',
                                    color: '#000000',
                                    //  color:selectedEndDate==='Sun'?'red':'green'
                                    onDateChange: selectedStartDate === 'Sun' ? 'red' : 'green'
                                }}
                                onDateChange={onDateChange} />
                            <View style={{ flexDirection: 'row', width: mobileW * 90 / 100, justifyContent: "space-around" }}>
                                <LinearGradient
                                    colors={['#92B8FD', '#FF87A4',]}
                                    style={[styles.TakeIdView]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            setDatePickerModal(false)
                                        }
                                        }
                                        activeOpacity={0.6}
                                    >
                                        <Text style={styles.Oktxt}>{Lang_chg.CANCEL[config.language]}</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                                <LinearGradient
                                    colors={['#92B8FD', '#FF87A4',]}
                                    style={[styles.TakeIdView]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            console.log('BirthDate', BirthDate);
                                            if (BirthDate == 'NA') {
                                                onDateChange(new Date())
                                            }
                                            setDatePickerModal(false)
                                        }
                                        }
                                        activeOpacity={0.6}
                                    >
                                        <Text style={styles.Oktxt}>{Lang_chg.DONE[config.language]}</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>


            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground style={styles.imageBackStyle}
                    imageStyle={{ height: mobileH, width: mobileW }}
                    source={localimag.Background}>
                    <View style={{
                        width: mobileW, height: mobileH * 8 / 100, alignItems: 'center', justifyContent: 'space-between',
                        paddingHorizontal: mobileW * 7 / 100, flexDirection: 'row'
                    }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            // onPress={() =>{localStorage.clear(), navigation.navigate('Login')}}
                            onPress={() => { localStorage.clear(), navigation.goBack() }}
                        >
                            <Image
                                resizeMode='contain'
                                style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100 }}
                                source={localimag.back_icon}
                            />
                        </TouchableOpacity>
                        <Text style={{
                            width: mobileW * 65 / 100, fontSize: mobileW * 4 / 100,
                            fontFamily: Font.FontSemiBold, color: Colors.whiteColor,
                            textAlign: "center"
                        }}>{Lang_chg.SignUp2[config.language]}</Text>
                        <Image
                            resizeMode='contain'
                            style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100 }}
                        />
                    </View>
                    {/* ---- Main Container ---- */}
                    <View style={styles.mainContainer}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '80%', height: '15%' }}>
                            <Text style={{
                                width: mobileW * 65 / 100, fontSize: mobileW * 4.5 / 100,
                                fontFamily: Font.FontBold, color: Colors.blueColour,
                                textAlign: "center"
                            }}>{Lang_chg.cretaeAcc[config.language]}</Text>
                            {/* <Text style={{
                                width: mobileW * 65 / 100, fontSize: mobileW * 3.3 / 100,
                                fontFamily: Font.FontMedium, color: Colors.darkGray,
                                textAlign: "center", marginTop: mobileH * 1 / 100, width: '80%'
                            }}>{Lang_chg.AccCreatewith[config.language]}</Text> */}
                        </View>
                        {/* --- TextInput Email --- */}
                        <View style={styles.textAlignextInputBaseView}>
                            <Image
                                resizeMode='contain'
                                style={styles.inputImageStyle}
                                source={localimag.Id_icon}
                            />
                            <TextInput
                                value={"" + IdNumber + ""}
                                maxLength={14}
                                keyboardType='number-pad'
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.IDNumber1[config.language]}
                                onChangeText={(txt) => { setIdNumber(txt) }}
                                style={styles.textInputStyle}>
                            </TextInput>
                        </View>
                        {/* --- TextInput Password --- */}
                        <View style={styles.textAlignextInputBaseView}>
                            <Image
                                resizeMode='contain'
                                style={styles.inputImageStyle}
                                source={localimag.Id_icon}
                            />
                            <TextInput
                                value={"" + RepeatIdNumber + ""}
                                maxLength={14}
                                keyboardType='number-pad'
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.RepetNumber1[config.language]}
                                onChangeText={(txt) => { setRepeatIdNumber(txt) }}
                                style={styles.textInputStyle}>
                            </TextInput>
                        </View>
                        {/* --- TextInput Password --- */}
                        <View style={styles.textAlignextInputBaseView}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setCountryPickerModal(true)}
                                style={{
                                    flexDirection: 'row', alignItems: "center",
                                    width: mobileW * 17 / 100, justifyContent: "space-around",
                                    height: mobileH * 6 / 100,
                                }}>
                                <Image
                                    resizeMode='contain'
                                    style={styles.inputImageStyle}
                                    source={{ uri: FlagUrl }}
                                />
                                <Text style={{
                                    fontFamily: Font.FontMedium,
                                    fontSize: mobileW * 3 / 100,
                                    color: Colors.darkGray
                                }}>+{countryCode}</Text>
                            </TouchableOpacity>
                            <TextInput
                                value={"" + phoneNumber + ""}
                                maxLength={10}
                                keyboardType='phone-pad'
                                placeholderTextColor={Colors.darkGray}
                                placeholder={Lang_chg.PhoneNumber1[config.language]}
                                onChangeText={(txt) => { setphoneNumber(txt) }}
                                style={[styles.textInputStyle, { width: mobileW * 53 / 100, left: 5, top: 0.5 }]}>
                            </TextInput>
                        </View>
                        {/* --- TextInput Password --- */}
                        <TouchableOpacity
                            onPress={() => setDatePickerModal(true)}
                            activeOpacity={0.8}
                            style={styles.textAlignextInputBaseView}>
                            <Image
                                resizeMode='contain'
                                style={styles.inputImageStyle}
                                source={localimag.calender}
                            />
                            <Text
                                style={styles.textInputStyle}
                            >  {BirthDate == 'NA' ? 'Date of Birth' : BirthDate}</Text>
                        </TouchableOpacity>
                        {/* --- Male Female Main View ---  */}
                        <View style={styles.RememberForgotView}>
                            <Text style={styles.forgotPasstxt}>{Lang_chg.Choosegender[config.language]}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <RadioButton
                                        value="male"
                                        color={Colors.blueColour}
                                        status={checked === 'male' ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            setChecked('male')
                                            setChecked1('user')
                                            global.UserType = 0
                                        }}
                                    />
                                    <Text style={styles.maleFemaleTxt}>{Lang_chg.Male1[config.language]}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', left: 5 }}>
                                    <RadioButton
                                        value="female"
                                        color={Colors.Pink}
                                        status={checked === 'female' ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            setChecked('female'),
                                                global.UserType = 1
                                        }}
                                    />
                                    <Text style={styles.maleFemaleTxt}>{Lang_chg.Female1[config.language]}</Text>
                                </View>
                            </View>
                        </View>

                        {/* --- Select Option View ---  */}
                        <View style={[styles.RememberForgotView, { marginTop: mobileH * 1.5 / 100 }]}>
                            <Text style={styles.forgotPasstxt}>{Lang_chg.selectOption1[config.language]}</Text>
                            {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
                                {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <RadioButton
                                        value="user"
                                        color={global.UserType == 0 ? Colors.blueColour : Colors.Pink}
                                        status={checked1 === 'user' ? 'checked' : 'unchecked'}
                                        onPress={() => setChecked1('user')}
                                    />
                                    <Text style={styles.maleFemaleTxt}>{Lang_chg.Member1[config.language]}</Text>
                                </View> */}
                                
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <RadioButton
                                            value="female"
                                            color={Colors.Pink}
                                            status={checked === 'female' ? 'checked' : 'unchecked'}
                                            onPress={() => setChecked1('worker')}
                                        />
                                        <Text style={styles.maleFemaleTxt}>{Lang_chg.Worker1[config.language]}</Text>
                                    </View>
                                
                            {/* </View> */}
                            <TouchableOpacity
                                onPress={() => setRememberMe(!RememberMe)}
                                style={{ flexDirection: 'row', width: mobileW * 55 / 100, alignItems: "center", marginTop: mobileH * 1 / 100 }}>
                                <TouchableOpacity
                                    onPress={() => setRememberMe(!RememberMe)}
                                >
                                    <Image style={{
                                        height: mobileW * 4 / 100, width: mobileW * 4 / 100,
                                        tintColor: global.UserType == 0 ? Colors.blueColour : Colors.Pink
                                    }}
                                        source={RememberMe ? localimag.checkbox1 : localimag.checkboxcheck1}
                                    /></TouchableOpacity>
                                <Text style={styles.Remembertxt}>    {Lang_chg.UserCert[config.language]}</Text>
                            </TouchableOpacity>
                        </View>


                        {/* --- Login Button --- */}
                        <View style={{ marginTop: mobileH * 8 / 100 }}>
                            <CommonButton onPressClick={() => {
                                ToUSerSignUP();
                            }}
                                title={Lang_chg.NEXT1[config.language]}></CommonButton>
                        </View>

                    </View>

                </ImageBackground>
            </KeyboardAwareScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackStyle: {
        height: mobileH, width: mobileW
    },
    mainContainer: {
        backgroundColor: Colors.appBackground,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        height: mobileH * 72 / 100,
        width: mobileW * 85 / 100,
        alignItems: "center",
        alignSelf: "center",
        borderRadius: mobileW * 5 / 100,
        marginTop: mobileH * 7 / 100,
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
        borderRadius: mobileW * 2 / 100,
    },
    inputImageStyle: {
        width: mobileW * 4.5 / 100,
        height: mobileW * 4 / 100,
        marginTop: mobileH * -0.5 / 100
    },
    textInputStyle: {
        width: mobileW * 61 / 100,
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 2.8 / 100,
        marginLeft: mobileW * 1.7 / 100,
        color: Colors.darkGray
    },
    RememberForgotView: {
        height: mobileW * 12 / 100,
        width: mobileW * 73 / 100,
        // alignSelf: "center",
        // alignItems: "center",
        // justifyContent: 'space-between',
    },
    Remembertxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.grayColour,
        fontSize: mobileW * 2.6 / 100
    },
    dontHaveAcc: {
        fontFamily: Font.FontSemiBold,
        color: Colors.darkGray,
        fontSize: mobileW * 3 / 100,
        marginTop: mobileH * 2 / 100
    },
    signUptxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.blueColour,
        fontSize: mobileW * 3 / 100,
        marginTop: mobileH * 2 / 100
    },
    forgotPasstxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.darkGray,
        fontSize: mobileW * 3.2 / 100,
        marginTop: mobileH * 1.5 / 100
    },
    maleFemaleTxt: {
        fontFamily: Font.FontSemiBold,
        color: Colors.grayColour,
        fontSize: mobileW * 2.6 / 100,
    },
    Modaltxt: {
        fontFamily: Font.FontRegular,
        color: Colors.darkGray,
        fontSize: mobileW * 4 / 100,
        textAlign: 'center',
        width: mobileW * 75 / 100
    },
    ModalMainView: {
        backgroundColor: "#00000080",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20
    },
    ModalheadView: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: 20,
        width: "95%",
        paddingVertical: 20,
        height: mobileH * 45 / 100,
        alignItems: 'center',
    },
    CountryPickerModalheadView: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: 20,
        width: "95%",
        paddingVertical: 20,
        height: mobileH * 90 / 100,
        alignItems: 'center',
    },
    DatePickerModalheadView: {
        backgroundColor: "#ffffff",
        alignSelf: 'center',
        borderRadius: 20,
        width: mobileW * 100 / 100,
        paddingVertical: mobileH * 3 / 100,
        alignItems: 'center',
    },
    congratstxt: {
        color: Colors.blackColor,
        fontSize: mobileW * 6.5 / 100,
        fontFamily: Font.FontSemiBold,
        alignSelf: 'center',
        marginTop: mobileH * 1.5 / 100
    },
    OkButton: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 11 / 100,
        width: mobileW * 45 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 3 / 100,
        alignItems: "center"
    },
    TakeIdView: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 10 / 100,
        width: mobileW * 40 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 4 / 100
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
})

