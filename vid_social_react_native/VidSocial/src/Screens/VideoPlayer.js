import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ImageBackground, Modal, StatusBar } from 'react-native';
import Video from 'react-native-video';
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import { Lang_chg } from '../Provider/Language_provider'
import { Colors, Font } from '../Provider/Colorsfont'
import { config, localStorage, mobileH, mobileW } from '../Provider/utilslib/Utils'
import Slider from 'react-native-slider'
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import { appBaseUrl } from '../Provider/Apicallingprovider/ApiConstants';
import axios from 'axios';

const VideoPlayer = ({ navigation, route }) => {

  const VideoUrl = route.params.data;

  const videoRef = useRef();
  const [isMuted, setIsMuted] = useState(true); // Initialize with full volume

  const [currentTime, setCurrentTime] = useState(0);
  // console.log("currentTime",currentTime);
  const [duration, setDuration] = useState(0);
  // console.log("duration",duration);
  const [paused, setPaused] = useState(true);

  const [userName, setUserName] = useState("Ac")


  const [modalVisibleVerification, setmodalVisibleVerification] = React.useState(false);
  const [IdSelfieDoneModal, setIdSelfieDoneModal] = React.useState(false);


  useEffect(() => {
    getUserData()
  }, [])

  const getUserData = async () => {
    let UserData = await localStorage.getItemObject("UserData")
    const formattedName = config.getFormateName(UserData.name);
    console.log("UserDataName==>", formattedName)
    setUserName(formattedName)
  }


  // const formattedTime = `${String(currentTime).padStart(2, '0')}:${String(currentTime).padStart(2, '0')}:${String(currentTime).padStart(2, '0')}`;
  // const formattedTime = `${String(currentTime).padStart(2, '0')}`;

  const togglePlayPause = () => {
    setPaused(!paused);

  };
  const toggleMuteValume = () => {
    setIsMuted(!isMuted);
  };

  const onVolumeChange = (value) => {
    videoRef.current.setIsMuted(value);
  };

  const onSeek = (value) => {
    videoRef.current.seek(value);
  };
  const onFastForward = (seconds) => {
    const newTime = currentTime + seconds;
    if (newTime < duration) {
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };
  const onRewind = (seconds) => {
    const newTime = currentTime - seconds;
    if (newTime >= 0) {
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    } else {
      videoRef.current.seek(0); // If rewinding beyond the start, go to the beginning
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds) => {
    let minutes
    if (seconds > 599) {
      minutes = Math.floor(seconds / 60);
    } else {
      minutes = '0' + Math.floor(seconds / 60);
    }
    const remainingSeconds = seconds % 60;
    console.log(remainingSeconds);
    const TimeInSecond = Math.trunc(remainingSeconds)
    return `${minutes}:${TimeInSecond < 10 ? '0' : ''}${TimeInSecond}`;
  };


  const toSavevideoFile = async () => {
    var UserData = await localStorage.getItemObject("UserData")
    console.log('-------->>>', UserData.id);
    var WorkerUser_id = UserData.id
    var data = new FormData();
    data.append('user_id', WorkerUser_id)
    data.append('video_file', {
      uri: VideoUrl.uri,
      type: 'video/mp4',
      name: 'VideoFile.mp4',
    });
    global.props.showLoader();
    console.log('datadatadatadatadatadata', data);
    global.props.showLoader();
    let apiUrl = appBaseUrl.WorkerVideo;
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
        if (response.data.code == 200) {
          global.props.hideLoader();
          // alert(response.data.message)
          setTimeout(() => {
            setIdSelfieDoneModal(true)
          }, 500);
        } else {
          alert(response.data.error)
          global.props.hideLoader();
        }
      })
      .catch(async (error) => {
        localStorage.clear()
        // await localStorage.setItemString("AccessToken", null)
        // await localStorage.setItemObject("UserData", null)
        global.props.hideLoader();
        console.log('UpdateError---22', error);
        // Handle errors
      });
  }


  return (
    <View style={styles.container}>
      <ImageBackground style={{ flex: 1 }}
        imageStyle={{ flex: 1 }}
        source={localimag.Background}>


        {/* ---- Verification Modal ---- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={IdSelfieDoneModal}
          onRequestClose={() => { setIdSelfieDoneModal(!IdSelfieDoneModal) }}>
          <View style={styles.ModalMainView}>
            <StatusBar backgroundColor={Colors.themecolor}
              barStyle='default' hidden={false} translucent={false}
              networkActivityIndicatorVisible={true} />
            <View style={{ borderRadius: 20, width: "100%" }}>
              <View style={styles.ModalheadView}>
                <Text style={styles.congratstxt}>{Lang_chg.Verificationtxt[config.language]}</Text>

                <View style={{ marginTop: mobileH * 5 / 100, width: mobileW * 75 / 100 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      resizeMode='contain'
                      style={{ width: mobileW * 10 / 100, height: mobileW * 10 / 100 }}
                      source={localimag.AppRightGirl}
                    />
                    <Text style={styles.idPhototxt}>  {Lang_chg.idphotodonetxt[config.language]}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: mobileH * 2 / 100 }}>
                    <Image
                      resizeMode='contain'
                      style={{ width: mobileW * 10 / 100, height: mobileW * 10 / 100 }}
                      source={localimag.AppRightGirl}
                    />
                    <Text style={styles.idPhototxt}>  {Lang_chg.videoSelfiedonetxt[config.language]}</Text>
                  </View>
                </View>

                <LinearGradient
                  colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                  style={[styles.TakeIdView, { marginTop: mobileH * 8 / 100 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setIdSelfieDoneModal(false)
                      setTimeout(() => {
                        setmodalVisibleVerification(true)
                      }, 1000);
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
        </Modal>


        {/* ---- Verification ID and Selfie Video ---- */}
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
                  source={localimag.AppRightGirl}
                />
                <Text style={styles.congratstxt}>{Lang_chg.Verificationtxt[config.language]}</Text>
                <Text style={[styles.Modaltxt, { fontSize: mobileW * 3.5 / 100, marginTop: mobileH * 1.5 / 100 }]}
                >{Lang_chg.verificationwithin[config.language]}</Text>
                <LinearGradient
                  colors={global.UserType == 0 ? ['#92B8FD', '#FF87A4'] : ['#FF87A4', '#92B8FD']}
                  style={[styles.TakeIdView]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setmodalVisibleVerification(true)
                      setTimeout(() => {
                        navigation.navigate('Login')
                        localStorage.clear()
                      }, 1000);
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
        </Modal>

        <View style={{ flex: 1, width: mobileW * 92 / 100, alignSelf: 'center', justifyContent: 'center' }}>


          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>


            <View style={{ backgroundColor: Colors.blackColor, width: mobileW * 90 / 100, borderRadius: mobileW * 3 / 100 }}>
              <Video
                ref={videoRef}
                source={{ uri: VideoUrl.uri }}
                onProgress={(e) => setCurrentTime(e.currentTime)}
                onLoad={(e) => setDuration(e.duration)}
                onEnd={() => setCurrentTime(0)}
                onValueChange={onVolumeChange}
                paused={paused}
                volume={isMuted ? 0 : 1}
                resizeMode='cover'
                style={{
                  width: mobileW * 90 / 100, height: mobileH * 70 / 100,
                  borderTopRightRadius: mobileW * 3 / 100, borderTopLeftRadius: mobileW * 3 / 100,
                  // backgroundColor:'green'
                }}

              />
              <Text style={styles.videoCurrentTime}>{formatTime(currentTime.toFixed(2))}</Text>
              {/* <Text style={styles.videoCurrentTime}>{formattedTime}</Text> */}
              <View style={{}}>

                <View style={{ flexDirection: 'row' }}>
                  <View style={{ height: mobileW * 2.5 / 100, width: mobileW * 0.5 / 100, backgroundColor: Colors.whiteColor }}></View>
                  <Slider
                    value={currentTime}
                    minimumValue={0}
                    maximumValue={duration}
                    step={0.01}
                    onValueChange={onSeek}
                    minimumTrackTintColor={Colors.mediumDarkGrey}
                    maximumTrackTintColor={Colors.blackColor}
                    // thumbTintColor="red"
                    thumbStyle={{ width: 2, height: 12, backgroundColor: Colors.whiteColor }}
                    trackStyle={{ height: 12, }}
                    thumbTouchSize={{ width: 20, height: 20 }}
                    onSlidingStart={() => console.log('Sliding started')}
                    onSlidingComplete={() => console.log('Sliding completed')}
                    style={{ width: '99%', height: mobileW * 2.5 / 100, backgroundColor: 'red' }} />
                  <View style={{ height: mobileW * 2.5 / 100, width: mobileW * 0.5 / 100, backgroundColor: Colors.whiteColor }}></View>
                </View>


                <View style={{ flexDirection: 'row', marginTop: mobileW * 2 / 100, alignItems: 'center', marginBottom: mobileW * 2 / 100, marginHorizontal: mobileW * 3 / 100 }}>
                  <TouchableOpacity onPress={togglePlayPause} >
                    {paused ? <Image resizeMode='contain' style={{
                      width: mobileW * 4 / 100, height: mobileW * 4 / 100, tintColor: Colors.whiteColor,
                    }}
                      source={localimag.icon_play}></Image> :
                      <Image resizeMode='contain' style={{ width: mobileW * 4 / 100, height: mobileW * 4 / 100, tintColor: Colors.whiteColor, }}
                        source={localimag.icon_pause}></Image>
                    }
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => onRewind(10)} style={{ marginHorizontal: mobileW * 4 / 100 }}>
                    <Image resizeMode='contain' style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, tintColor: Colors.whiteColor, }}
                      source={localimag.icon_left_skip}></Image>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => onFastForward(10)} >
                    <Image resizeMode='contain' style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, tintColor: Colors.whiteColor, }}
                      source={localimag.icon_right_skip}></Image>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={toggleMuteValume} style={{ marginHorizontal: mobileW * 4 / 100 }}>
                    {isMuted ?
                      <Image resizeMode='contain' style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, tintColor: Colors.whiteColor, }}
                        source={localimag.icon_enable_sound}></Image> :
                      <Image resizeMode='contain' style={{ width: mobileW * 5 / 100, height: mobileW * 5 / 100, tintColor: Colors.whiteColor, }}
                        source={localimag.icon_volume}></Image>
                    }
                  </TouchableOpacity>
                </View>

              </View>

            </View>
          </View>
          <View style={{ flexDirection: 'row', width: mobileW * 90 / 100, justifyContent: "space-around" }}>
            <LinearGradient
              colors={['#92B8FD', '#FF87A4',]}
              style={[styles.TakeIdView]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('VideoRecording')
                }
                }
                activeOpacity={0.6}
              >
                <Text style={styles.Oktxt}>{Lang_chg.RETAKE[config.language]}</Text>
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
                  toSavevideoFile()
                }
                }
                activeOpacity={0.6}
              >
                <Text style={styles.Oktxt}>{Lang_chg.DONE[config.language]}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default VideoPlayer;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundcolor
  },
  everydayForTxt: {
    fontSize: mobileW * 4 / 100,
    marginHorizontal: mobileW * 5 / 100,
    color: Colors.lightAccent,
    alignSelf: 'flex-end',
    fontFamily: Font.FontRegularFono
  },
  iconNextPrevies: {
    width: mobileW * 8 / 100,
    height: mobileW * 8 / 100,
    borderRadius: mobileW * 5 / 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundcolor
  },
  videoCurrentTime: {
    color: Colors.whiteColor,
    position: 'absolute',
    alignSelf: 'center',
    bottom: mobileW * 17 / 100,
    fontSize: mobileW * 4 / 100,
    fontFamily: Font.aeonikRegular
  },
  backToChallengesTxt: {
    fontSize: mobileW * 3.5 / 100,
    textAlign: 'center',
    color: Colors.lightAccent,
    fontFamily: Font.FontRegularFono
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
    alignItems: 'center'
  },
  DatePickerModalheadView: {
    backgroundColor: "#ffffff",
    alignSelf: 'center',
    borderRadius: 20,
    width: mobileW * 100 / 100,
    paddingVertical: 20,
    height: mobileH * 58 / 100,
    alignItems: 'center'
  },
  congratstxt: {
    color: Colors.blackColor,
    fontSize: mobileW * 6.5 / 100,
    fontFamily: Font.FontSemiBold,
    alignSelf: 'center',
    marginTop: mobileH * 1.5 / 100
  },
  idPhototxt: {
    color: Colors.blackColor,
    fontSize: mobileW * 3.1 / 100,
    fontFamily: Font.FontRegular,
    alignSelf: 'center',
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
  Modaltxt: {
    fontFamily: Font.FontRegular,
    color: Colors.darkGray,
    fontSize: mobileW * 4 / 100,
    textAlign: 'center',
    width: mobileW * 75 / 100
  },
})