import { View, Text, Alert } from 'react-native'
import React from 'react'
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { Colors, Font, Lang_chg, config, localStorage, mediaprovider, mobileH, mobileW, msgProvider } from '../Provider/utilslib/Utils';

export async function UserLoginPermission({ navigation }) {
    global.props.hideLoader();
    // global.props.showLoader();
    var User_Data = await localStorage.getItemObject("UserData");
    var User_Id = User_Data.id;
    console.log('User_Id----->>', User_Id);
    let apiUrl = appBaseUrl.CheckUserStatus;
    console.log(apiUrl, 'User_Id----->>', User_Id);

    var postData = JSON.stringify({
        Id: User_Id,
    });
    console.log(apiUrl, 'postData-----------', postData);
    const headers = {
        'Content-Type': 'application/json',
    };
    // Make a POST request using Axios
    axios.post(apiUrl, postData, { headers })
        .then(async (response) => {
            global.props.hideLoader();
            var LoginStatus = response.data.StatusData.login_permission
             if (response.data.code == 200) {
                if (LoginStatus==true) {
                    console.log('-------------');
                } else {
                    Alert.alert(
                        Lang_chg.AccountDeactivate[config.language],
                        Lang_chg.AccountDeactivateByAdmin[config.language],
                        [
                            {
                                text: Lang_chg.OKtxt[config.language],
                                onPress: () => {
                                    setTimeout(() => {
                                        navigation.navigate('Login')
                                    }, 500);
                                },
                            },
                        ],
                        { cancelable: false }
                    )
                }
            }
        })
        .catch(error => {
            global.props.hideLoader();
            console.log('homeLevelError---', error);
            // Handle errors
        });
}