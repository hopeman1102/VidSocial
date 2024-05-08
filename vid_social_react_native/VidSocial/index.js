/**
 * @format
 */

import { AppRegistry, NativeModules } from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';

import { name as appName } from './app.json';


messaging().setBackgroundMessageHandler(async remoteMessage => {
  const { CallNotificationModule } = NativeModules;
  CallNotificationModule.setCallerInfo(data, user);
  CallNotificationModule.startVibration();
  CallNotificationModule.showNotification(callInfo, user.displayname);
  console.log('Message handled in the background!DDD', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
