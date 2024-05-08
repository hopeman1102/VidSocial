import React, { Component } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider, AppConsumer } from './src/Provider/context/AppProvider';
import Stacknav from './src/Provider/Routenavigation';
import { notificationListener, requestPermissionForDevice, requestUserPermission } from './src/Provider/Notification/PushController';
import { updateUserStatus } from './src/Components/UserOfflineOnline';
global.UserType = 0;
import { AppState } from 'react-native';

class App extends Component {

  componentDidMount() {
    // console.log('I am here');
    // if (Platform.OS == "android") {
    requestPermissionForDevice();
    requestUserPermission();
    // notificationListener();

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    // Handle app state changes (background/foreground)
    console.log('App State:', nextAppState);

    // Update user status based on the app state (online/offline)
    if (nextAppState === 'active') {
      // App is in the foreground
      updateUserStatus('online');
    } else {
      // App is in the background or inactive
      updateUserStatus('offline');
    }
  };



  render() {

    const linking = {
      prefixes: ["nrth://"], //prefixes can be anything depend on what you have wrote in intent filter 
      config: {
        initialRouteName: "Login",  //define initial page jis page pr redirect krna h 
        screens: {
          ResetPassword: {    //define page name 
            path: "ResetPassword/:token",   //define url path pagename/:id ka name option h ydi aap is page pr use kr rhe ho to hi likhna h 
          },
        }
      }
    }

    return (
      <NavigationContainer linking={linking}>
        <AppProvider {...this.props}>
          <AppConsumer>{funcs => {
            global.props = { ...funcs }
            return <Stacknav {...funcs} />
          }}
          </AppConsumer>
        </AppProvider>
      </NavigationContainer>

    );
  }
}

export default App;


 
