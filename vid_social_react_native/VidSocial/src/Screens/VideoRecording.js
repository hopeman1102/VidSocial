import React, { useState, useRef, useEffect } from 'react';
import { RNCamera } from 'react-native-camera';
// import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, FlatList, ImageBackground, Button, TouchableHighlight, Platform } from 'react-native'
import CommonButton from '../Components/CommonButton'
import Header from '../Components/Header'
import { localimag } from '../Provider/Localimageprovider/Localimage'
import SmallButton from '../Components/SmallButton'
import { Lang_chg, config, mobileH, mobileW } from '../Provider/utilslib/Utils'
import { Colors, Font } from '../Provider/utilslib/Utils'
import { useIsFocused } from '@react-navigation/native';
 const VideoRecording = ({ navigation }) => {
    const cameraRef = useRef(null);
    const [isStopwatchStart, setIsStopwatchStart] = useState(false);
    const [showStopWatch, setshowStopWatch] = useState(true);
    const [CompleteStatus, setCompleteStatus] = useState(0);
    const [Time, setTime] = useState('');
    const [timer, setTimer] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [showHideCounter, setShowHideCounter] = useState(true);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    const [count, setCount] = useState(3);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            setTimer(0)
        }
    }, [isFocused]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (count > 1) {
                setCount(count - 1);

            } else {
                setShowHideCounter(false)
                clearInterval(timer);
            }
        }, 2000);

        return () => {
            clearInterval(timer);
        };
    }, [count]);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isRecording]);

    const startRecording = async () => {
        if (cameraRef.current) {
            try {
                setIsRecording(true);

                const options = {
                    quality: RNCamera.Constants.VideoQuality['720p'],
                    maxDuration: 5, // Set the maximum video duration in seconds (adjust as needed)
                };

                const data = await cameraRef.current.recordAsync(options);

                navigation.navigate('VideoPlayer', { data })

            } catch (error) {
                console.error('Error recording video: ', error);
            }
        }
    };

    const stopRecording = async () => {
        if (cameraRef.current) {
            try {
                setIsRecording(false);
                cameraRef.current.stopRecording();
            } catch (error) {
                console.error('Error stopping video recording: ', error);
            }
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
        console.log('minutes', remainingSeconds);
        if (remainingSeconds <= 5) {
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        } else {
            setTimer(5)
            stopRecording()
            return '00:05'
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <RNCamera
                ref={cameraRef}
                style={{ flex: 1 }}
                type={isFrontCamera ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back}
                captureAudio={true} />
            {/* --- CArd View --- */}
            <ImageBackground resizeMode='cover'
                source={localimag.icon_video_up}
                style={{
                    width: mobileW, height: mobileW * 80 / 100, position: 'absolute'
                }} />

            {showHideCounter ?
                <View style={{
                    height: "98%", width: mobileW, position: 'absolute', alignItems: 'center',
                    justifyContent: 'center'
                }}>

                    <View style={{ marginTop: mobileW * -8 / 100 }}>
                        {count == 3 ? <Image resizeMode='contain'
                            style={styles.CounterIcon}
                            source={localimag.icon_3}></Image> : null}
                        {count == 2 ? <Image resizeMode='contain'
                            style={styles.CounterIcon}
                            source={localimag.icon_2}></Image> : null}
                        {count == 1 ? <Image resizeMode='contain'
                            style={styles.CounterIcon}
                            source={localimag.icon_1}></Image> : null}
                    </View>


                </View>
                :
                <View style={{ height: mobileH, width: mobileW, position: 'absolute', }}>

                    <ImageBackground resizeMode='cover'
                        source={localimag.icon_video_down}
                        style={{ width: mobileW, height: mobileW * 80 / 100, position: 'absolute', bottom: 0 }} />
                    <View style={{ position: 'absolute', bottom: mobileH * 2 / 100, width: mobileW }}>
                        <Text style={styles.TimeText}>{formatTime(timer)}</Text>
                        <View style={{
                            justifyContent: 'space-around',
                            alignItems: 'center', flexDirection: 'row'
                        }}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setIsFrontCamera(!isFrontCamera)}
                                style={{ alignItems: 'center', width: mobileW * 30 / 100, marginTop: mobileH * 2 / 100 }}>
                                {timer == 0 &&
                                    <Image resizeMode='contain'
                                        style={styles.SideIcons}
                                        source={localimag.Camera_iconback}></Image>}
                            </TouchableOpacity>
                            <TouchableHighlight
                                style={[styles.onOffTimer]}
                                onPress={() => {
                                    setIsRecording(!isRecording);
                                    if (isRecording) {
                                        stopRecording()
                                    } else {
                                        startRecording()
                                    }
                                    if (isStopwatchStart) {
                                        setshowStopWatch(false);
                                        setCompleteStatus(1)
                                        setTimeout(() => {
                                            setCompleteStatus(2)
                                        }, 3000);
                                    }
                                }}>
                                <View style={styles.onOffInView}>
                                    {!isStopwatchStart ?
                                        <Image
                                            resizeMode='contain'
                                            source={localimag.icon_ellipse}
                                            style={styles.LogoImage}></Image>
                                        :
                                        <Image
                                            resizeMode='contain'
                                            source={localimag.icon_ellipse}
                                            style={styles.LogoImage}></Image>
                                    }
                                </View>
                            </TouchableHighlight>
                            <TouchableOpacity onPress={() => { navigation.navigate('TakePicture'), setTime(0) }}>
                                <View style={{ alignItems: 'center', width: mobileW * 30 / 100, marginTop: mobileH * 2 / 100 }}>
                                    <Image resizeMode='contain'
                                        style={[styles.SideIcons, { tintColor: Colors.lightAccent }]}
                                        source={localimag.icon_close}></Image>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>}
        </View >
    );
};
const styles = StyleSheet.create({
    daysTxt: {
        color: Colors.whiteColor,
        fontFamily: Font.DrunkBold,
        textAlign: 'center',
        fontSize: mobileW * 5 / 100,
        marginTop: mobileW * 2 / 100
    },
    cardView: {
        justifyContent: "center",
        width: mobileW * 82 / 100,
        borderWidth: mobileW * 0.3 / 100,
        borderColor: Colors.lightAccent,
        paddingVertical: mobileW * 3 / 100,
        paddingHorizontal: mobileW * 2 / 100,
        borderRadius: mobileW * 3 / 100,
        // padding: mobileW * 3 / 100,
        paddingBottom: mobileH * 4 / 100,
        backgroundColor: '#00000000',
        marginTop: mobileH * 8 / 100,
        alignSelf: 'center',
    },
    textView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: mobileW * 2 / 100,
        // marginTop: mobileW * -1 / 100
    },
    eliteText: {
        color: Colors.orangeColor,
        fontFamily: Font.DrunkBold,
        fontSize: mobileW * 2.5 / 100,
    },
    strengthText: {
        color: Colors.mediumGreyColor,
        fontFamily: Font.DrunkBold,
        fontSize: mobileW * 2.5 / 100,
    },
    pullText: {
        color: Colors.whiteColor,
        fontFamily: Font.DrunkBold,
        textAlign: 'center',
        fontSize: mobileW * 5 / 100,
        marginTop: mobileW * 2 / 100,
    },
    completeText: {
        color: Colors.whiteColor,
        fontFamily: Font.DrunkBold,
        textAlign: 'center',
        fontSize: mobileW * 5 / 100,
        marginTop: mobileH * 3 / 100
    },
    TimeText: {
        color: Colors.whiteColor,
        fontFamily: Font.DrunkBold,
        textAlign: 'center',
        fontSize: mobileW * 11 / 100,
        //   marginTop: mobileH * 2 / 100
    },
    minutestxt: {
        color: Colors.whiteColor,
        fontFamily: Font.DrunkBold,
        textAlign: 'center',
        fontSize: mobileW * 5.5 / 100,
    },
    everyTxt: {
        color: Colors.whiteColor,
        fontFamily: Font.FontRegularFono,
        textAlign: 'center',
        fontSize: mobileW * 3.8 / 100,
        marginTop: mobileW * 3 / 100
    },
    preferenceTxt: {
        color: Colors.whiteColor,
        fontFamily: Font.FontRegularFono,
        textAlign: 'center',
        fontSize: mobileW * 3 / 100,
        marginTop: mobileW * 3 / 100
    },
    startTxt: {
        color: Colors.whiteColor,
        fontFamily: Font.FontRegularFono,
        textAlign: 'center',
        fontSize: mobileW * 3.5 / 100,
        marginBottom: "3%"
    },
    timerText: {
        color: Colors.whiteColor,
        fontFamily: Font.FontBoldFono,
        fontSize: mobileW * 6 / 100,
        textAlign: "center",
        alignSelf: 'center'
    },
    TabInActive: {
        width: mobileW * 35 / 100,
        marginTop: mobileH * 3 / 100,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        height: mobileW * 10 / 100,
        borderRadius: mobileW * 3 / 100,
        borderWidth: mobileW * 0.3 / 100,
        backgroundColor: Colors.backgroundcolor
    },
    watchIcon1: {
        width: mobileW * 8.5 / 100,
        height: mobileW * 8.5 / 100,
        alignSelf: 'center',
        marginTop: mobileH * 1 / 100
    },
    buttonText: {
        backgroundColor: Colors.whiteColor
    },
    LogoImage: {
        height: mobileW * 14.5 / 100,
        width: mobileW * 14.5 / 100,
        alignSelf: 'center',
        tintColor: Colors.Pink
    },
    onOffTimer: {
        width: mobileW * 17 / 100,
        height: mobileW * 17 / 100,
        backgroundColor: Colors.whiteColor,
        borderRadius: mobileW * 8.5 / 100,
        alignSelf: 'center',
        marginTop: mobileH * 5 / 100,
        alignItems: "center",
        justifyContent: 'center'
    },
    onOffInView: {
        width: mobileW * 18 / 100,
        height: mobileW * 18 / 100,
        backgroundColor: '#00000000',
        borderRadius: mobileW * 9 / 100,
        alignItems: 'center',
        alignSelf: 'center',
        borderWidth: 0.2 / 100,
        borderColor: Colors.whiteColor,
        justifyContent: "center"
    },
    ReadyTxt: {
        fontSize: mobileW * 5 / 100,
        fontFamily: Font.DrunkBold,
        color: Colors.lightAccent
    },
    Intxt: {
        fontSize: mobileW * 3 / 100,
        fontFamily: Font.FontBoldFono,
        color: Colors.lightAccent
    },
    CounterIcon: {
        width: mobileW * 40 / 100,
        height: mobileW * 40 / 100
    },
    CounterHeadView: {
        width: mobileW,
        paddingHorizontal: mobileW * 8 / 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    watchIcon: {
        width: mobileW * 4 / 100,
        height: mobileW * 4 / 100,
        marginHorizontal: mobileW * 0.5 / 100
    },
    counterTxt: {
        color: Colors.whiteColor,
        fontSize: mobileW * 3 / 100,
        fontFamily: Font.FontBoldFono
    },
    cameraIcon: {
        width: mobileW * 6 / 100,
        height: mobileW * 6 / 100,
        marginHorizontal: mobileW * 0.5 / 100
    },
    whiteLogo: {
        width: mobileW * 20 / 100,
        height: mobileW * 10 / 100,
        marginTop: mobileW * 15 / 100
    },
    SideIcons: {
        width: mobileW * 7 / 100,
        height: mobileW * 7 / 100,
        marginTop: mobileW * 3 / 100
    }

});

export default VideoRecording;