import { View, Text, Alert } from 'react-native'
import React from 'react'
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';
import { localStorage } from '../Provider/localStorageProvider';

export async function CheckUserStatus({ navigation }) {
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
      console.log('CheckUserStatus--->', response.data);
      if (response.data.code == 200) {
        Alert.alert(
          'Account deactivated',
          'Your account has been deactivated by Admin',
          [
            {
              text: 'OK',
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
    })
    .catch(error => {
      global.props.hideLoader();
      console.log('homeLevelError---', error);
      // Handle errors
    });
}