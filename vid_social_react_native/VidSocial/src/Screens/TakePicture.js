import { View, Text, StyleSheet, Image, ImageBackground, TextInput, TouchableOpacity,PermissionsAndroid, BackHandler, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Colors, Font, Lang_chg, config, localStorage, mediaprovider, mobileH, mobileW } from '../Provider/utilslib/Utils';
import CommonButton from '../Components/CommonButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';

export default function TakePicture({ navigation }) {

    const [profile_image, setprofile_image] = React.useState('NA');
    const [UploadStatus, setUploadStatus] = React.useState(false);


    const _openCamera = () => {
        mediaprovider.launchCamera().then((obj) => {
            console.log(obj.path);
            setprofile_image(obj.path)
        })
    }
 
    const toSavePhotoId = async () => {
        var UserData = await localStorage.getItemObject("UserData")
        console.log('-------->>>', UserData.id);
        var WorkerUser_id = UserData.id
        var data = new FormData();
        data.append('user_id', WorkerUser_id)
        if (profile_image !== 'NA') {
            data.append('file', {
                uri: profile_image,
                type: 'image/jpeg',
                name: 'yourFileName.jpg',
            });
        }
        global.props.showLoader();
        console.log('datadatadatadatadatadata', data);
        global.props.showLoader();
        let apiUrl = appBaseUrl.WorkerIdImage;
        let headers = {
            "Accept": 'application/json',
            'Content-Type': 'multipart/form-data',
            'Cache-Control': 'no-cache,no-store,must-revalidate',
            'Pragma': 'no-cache',
            'Expires': 0,
            'Cookie': 'HttpOnly'
        }
        console.log('apiUrl------', apiUrl);

        // Make a POST request using Axios
        axios.post(apiUrl, data, { headers })
            .then(async (response) => {
                // Handle the successful response
                console.log("UpdateResponse--->222", response.data);
                if (response.data.code == 201) {
                    global.props.hideLoader();
                    // alert(response.data.message)
                    setTimeout(() => {
                        setUploadStatus(true)
                    }, 500);
                } else {
                    alert(response.data.message)
                    global.props.hideLoader();
                }
            })
            .catch(error => {
                global.props.hideLoader();
                console.log('UpdateError---22', error);
                // Handle errors
            });
    }

    const navigateToNextScreen = () => {
        navigation.navigate('VideoRecording')
    }

    useEffect(() => {
        requestCameraPermission()
    }, [])


    async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'App needs access to your camera.',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Camera permission granted');
          } else {
            console.log('Camera permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                {profile_image == "NA" ?
                    <ImageBackground style={styles.imageBackStyle}
                        imageStyle={{ height: mobileH, width: mobileW }}
                        source={localimag.GirlPhotoID}>
                        <Image
                            resizeMode='cover'
                            style={styles.inputImageStyle}
                            source={localimag.icon_video_down}
                        />
                        <TouchableOpacity
                            style={[styles.TakeIdView, {}]}
                            onPress={() => {
                                setTimeout(() => {
                                    _openCamera()
                                }, 300);
                            }
                            }
                            activeOpacity={0.6}
                        >
                            <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={[styles.TakeIdView]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >

                                <Text style={styles.Oktxt}>{Lang_chg.takeidphototxt[config.language]}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ImageBackground>
                    :
                    <ImageBackground style={styles.imageBackStyle}
                        imageStyle={{ height: mobileH, width: mobileW }}
                        source={{ uri: profile_image }}>
                        <View style={{
                            alignItems: 'center',
                            alignSelf: 'center', marginTop: mobileH * 35 / 100
                        }}>
                            <Image
                                resizeMode='contain'
                                style={{ width: mobileW * 22 / 100, height: mobileW * 22 / 100 }}
                                source={localimag.AppRightGirl}
                            />
                            <Text style={[styles.Oktxt, { fontSize: mobileW * 6 / 100 }]}>{Lang_chg.idphotodonetxt[config.language]}</Text>
                            {UploadStatus &&
                                <Text style={styles.Oktxt}>{Lang_chg.Nowitstimetotakeselfievideo[config.language]}</Text>}
                        </View>
                        <Image
                            resizeMode='cover'
                            style={styles.inputImageStyle}
                            source={localimag.icon_video_down}
                        />
                        <TouchableOpacity
                         style={[styles.TakeIdView]}
                            onPress={() => {
                                setTimeout(() => {
                                    UploadStatus ?
                                        navigateToNextScreen() :
                                        toSavePhotoId()
                                }, 300);
                            }
                            }
                            activeOpacity={0.6}
                        >
                            <LinearGradient
                                colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                                style={[styles.TakeIdView]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >

                                <Text style={styles.Oktxt}>{UploadStatus ? Lang_chg.takeVideo[config.language] : Lang_chg.uploadPic[config.language]}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ImageBackground>
                }
            </KeyboardAwareScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackStyle: {
        alignItems: 'center',
        height: mobileH, width: mobileW
        // justifyContent: 'space-evenly'
    },
    inputImageStyle: {
        width: mobileW,
        height: mobileW * 80 / 100,
        position: 'absolute',
        bottom: 0
    },
    TakeIdView: {
        alignSelf: "center",
        justifyContent: "center",
        height: mobileW * 15 / 100,
        width: mobileW * 65 / 100,
        alignItems: "center",
        borderRadius: mobileW * 2 / 100,
        marginTop: mobileH * 4 / 100,
        position: 'absolute',
        bottom: mobileH * 5 / 100
    },
    Oktxt: {
        fontFamily: Font.FontMedium,
        fontSize: mobileW * 4.2 / 100,
        color: Colors.whiteColor
    },
})

