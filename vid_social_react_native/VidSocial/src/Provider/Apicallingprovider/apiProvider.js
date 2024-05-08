import NetInfo from '@react-native-community/netinfo';
import { config } from '../configProvider';
import axios from 'axios'

class ApiContainer {

  getApi = async (url, status,) => {
    return new Promise((resolve, reject) => {
      NetInfo.fetch().then(state => {
        if (state.isConnected == true) {
          if (status != 1) {
            global.props.showLoader();
          }
          axios.get(url, {
            headers: config.headersapi
          })
            .then(function (obj) {
              global.props.hideLoader();
              resolve(obj.data);
              // handle success
              console.log(obj.data);
            })
            .catch(function (error) {
              global.props.hideLoader();
              reject(error);
              // handle error
              console.log(error);
            })
            .finally(function (obj) {
              global.props.hideLoader();
              resolve(obj.data);
              // always executed
            });
        } else {
          global.props.hideLoader();
          reject('noNetwork');
        }
      })
    })
  }

  postApi = async (url, data,headerss, status) => {
    return new Promise((resolve, reject) => {
      NetInfo.fetch().then(state => {
        if (state.isConnected == true) {
          if (status != 1) {
            global.props.showLoader();
          }
          axios.post(url, {
            data: data,
            headers: headerss
          })
            .then(function (obj) {
              global.props.hideLoader();
              resolve(obj.data);
              console.log(obj.data);
            })
            .catch(function (error) {
              console.log(error);
              global.props.hideLoader();
              reject(error);
            });
        } else {
          global.props.hideLoader();
          reject('noNetwork');
        }
      })
    })
  }
}
//--------------------------- Config Provider End -----------------------
export const apifuntion = new ApiContainer();
