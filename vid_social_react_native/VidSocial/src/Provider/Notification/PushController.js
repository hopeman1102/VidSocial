
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-community/async-storage';
import notifee from '@notifee/react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { onRemoteMessageReceived } from './onRemoteMessageReceived';
import { NativeModules } from 'react-native';


export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
console.log('i am check that -----',enabled);
  if (enabled) {
   getFcmToken();
  }
}


export async function requestPermissionForDevice() {
  const checkPermission = await checkNotificationPermission();
  console.log('i am here in requestrequestrequest -------111',checkPermission);

  if (checkPermission !== RESULTS.GRANTED) {
    const request = await requestNotificationPermission();
    console.log('i am here in requestrequestrequest -------222',request);
    if (request == 'blocked') {
      // permission not granted
      const request = await requestNotificationPermission();

    }  
    // if (request == RESULTS.GRANTED) {
    //   // permission not granted
    // }  
  }
 };

const requestNotificationPermission = async () => {
  const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
   return result;
};

const checkNotificationPermission = async () => {
  const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
   return result;
};

const getFcmToken = async () => {
  let checkTocken = await AsyncStorage.getItem('fcmTocken')
  console.log("the old tocken", checkTocken);
  if (!checkTocken) {
    try {
      var FcmToken = await messaging().getToken()
      if (!!FcmToken) {
        console.log('------>', FcmToken);
        await AsyncStorage.setItem('fcmTocken', FcmToken)
      }
    } catch (error) {
      console.log('-------->', error);
      alert(error?.message)
    }
  }
}

let notificationListenerInitialized = false;

export const notificationListener = async (navigation) => {
  if (notificationListenerInitialized) {
    return; // Already initialized, do not register the listener again
  }

  notificationListenerInitialized = true;

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open from background state:', remoteMessage.notification);
    console.log('Background state:', remoteMessage.notification);
    // Process the notification
    onRemoteMessageReceived(navigation, remoteMessage.data);
  });

  // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        console.log('Remote message:', remoteMessage.notification);
        // Process the initial notification
        onRemoteMessageReceived(navigation, remoteMessage.data);
      }
    });

  messaging().onMessage(async remoteMessage => {
     // Process the notification
    onRemoteMessageReceived(navigation, remoteMessage.data);
    // You can add additional logic for displaying notifications, if needed
  });
};


// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   const { AppStateModule, CallNotificationModule } = NativeModules;
//   CallNotificationModule.showNotification(remoteMessage, user.displayname);
// });


// export const notificationListener = async (navigation) => {
//   messaging().onNotificationOpenedApp(remoteMessage => {
//     console.log(
//       'Notification caused app to open from background state:',

//       remoteMessage.notification,
//     );
//     console.log("background state", remoteMessage.notification)
//   });

//   // Check whether an initial notification is available
//   messaging()
//     .getInitialNotification()
//     .then(remoteMessage => {
//       if (remoteMessage) {
//         console.log(
//           'Notification caused app to open from quit state:',
//           remoteMessage.notification,
//         );
//         console.log("remote message", remoteMessage.notification)
//       }
//     });
//   messaging().onMessage(async remoteMessage => {
//     console.log('[FCMService] A new FCM message arrived GOOD', remoteMessage);

//     const data = remoteMessage.data

//     onRemoteMessageReceived(navigation,data)
    
//     // onDisplayNotification(remoteMessage.data.channelname, remoteMessage.data.sender_mobile);
//     // onDisplayNotification(remoteMessage.notification.body, remoteMessage.notification.title);


//     // if (remoteMessage) {
//     //   PushNotificationIOS.addNotificationRequest({
//     //     id:'notificationWithSound',
//     //     title:remoteMessage.notification.title,
//     //     body:remoteMessage.notification.body,
//     //     // badge: 1,
//     //     // userInfo:data
//     // });
//     // }
//   });

//   //   =====================display ============================

// }

async function onDisplayNotification(body, title) {
  // Request permissions (required for iOS)
  await notifee.requestPermission()

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: title,
    body: body,
    android: {
      channelId,
      smallIcon: '@mipmap/ic_launcher_round',
      largeIcon: '@mipmap/ic_launcher_round',
       // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
      },
    },
  });
}


















// import messaging from '@react-native-firebase/messaging'
// import AsyncStorage from '@react-native-community/async-storage';
// import notifee from '@notifee/react-native';


// export async function requestUserPermission() {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     console.log(authStatus,'Authorization status:', authStatus, enabled);
//     getFcmToken();
//   }
// }

// const getFcmToken= async()=>{
//   let checkTocken = await AsyncStorage.getItem('fcmTocken')
//   console.log("the old tocken",checkTocken);
//   if(!checkTocken) {
//     try {
//       var  FcmToken = await messaging().getToken()
//       if (!! FcmToken) {
//       console.log('------>',FcmToken);
//       await AsyncStorage.setItem('fcmTocken',FcmToken)
//     }
//     } catch (error) {
//         console.log('-------->',error);
//         alert(error?.message)
//     }
// }
// }

// export const notificationListener = async() => {
//   messaging().onNotificationOpenedApp(remoteMessage => {
//     console.log(
//       'Notification caused app to open from background state:',
      
//       remoteMessage.notification,
//     );
//     console.log("background state",remoteMessage.notification)
//   });

//   // Check whether an initial notification is available
//   messaging()
//     .getInitialNotification()
//     .then(remoteMessage => {
//       if (remoteMessage) {
//         console.log(
//           'Notification caused app to open from quit state:',
//           remoteMessage.notification,
//         );
//         console.log("remote message",remoteMessage.notification)
//       }
//     });
//   messaging().onMessage(async remoteMessage => {
//     console.log('[FCMService] A new FCM message arrived', remoteMessage);
//     onDisplayNotification( 'errtt',remoteMessage.notification.title);
//     // if (remoteMessage) {
//     //   PushNotificationIOS.addNotificationRequest({
//     //     id:'notificationWithSound',
//     //     title:remoteMessage.notification.title,
//     //     body:remoteMessage.notification.body,
//     //     // badge: 1,
//     //     // userInfo:data
//     // });
//     // }
//   });

// //   =====================display ============================


// }

// async function onDisplayNotification(body,title) {
//     // Request permissions (required for iOS)
//     await notifee.requestPermission()

//     // Create a channel (required for Android)
//     const channelId = await notifee.createChannel({
//         id: 'default',
//         name: 'Default Channel',
//     });

//     // Display a notification
//     await notifee.displayNotification({
//         title: title,
//         body: body,
//         android: {
//             channelId,
//             // smallIcon: require('./assets/amazon.png'), // optional, defaults to 'ic_launcher'.
//             // pressAction is needed if you want the notification to open the app when pressed
//             pressAction: {
//                 id: 'default',
//             },
//         },
//     });
// }