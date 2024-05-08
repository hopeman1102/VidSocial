import { Platform, Alert, Linking } from "react-native";
import base64 from 'react-native-base64' 
global.player_id_me1 = '123456';
//--------------------------- Config Provider Start -----------------------
class configProvider {
	// baseURL = 'https://trustme.host/app/webservice/';
	img_url = 'https://trustme.host/app/webservice/images/200X200/';
	img_url1 = 'https://trustme.host/app/webservice/images/400X400/';
	img_url2 = 'https://trustme.host/app/webservice/images/700X700/';
	img_url3 = 'https://trustme.host/app/webservice/images/';
	pdf_url = 'https://trustme.host/app/webservice/pdf_file/';
	digimax_url = 'https://digmax.com'
	advertisement_url = 'https://digmax.com'
	login_type = 'app';
	onesignalappid = '7d842355-8f4e-4d05-9dc4-0b495f99ab71'
	mapkey = 'AIzaSyAsY7gLt7cZpkJ49AjpXD5clwXDz0f9VaM';
	maplanguage = 'en';
	language = 0;   // 0 for english , 1 for spanish
	player_id = '123456';
	player_id_me = '123456';
	device_type = Platform.OS;
	loading_type = false;
	latitude = 37.0902;
	longitude = 95.7129;
	namevalidation = /^[^-\s][a-zA-Z0-9_\s-]+$/;
	spaceValidation = /^\S*$/;;
	namevalidationNum = /^([^0-9]*)$/;
	BinanceValidation = /^[a-zA-Z0-9]+$/
	emailvalidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	mobilevalidation = /^[0-9\_]+$/;
	amountvalidation = /^[0-9\_.]+$/;
	passwordvalidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
	messagevalidation = /^[^-\s][a-zA-Z0-9_\s- ,]+$/;
	country_code = '+64';
	country_code_signup = '64';
	dishvalidation = /^[^-\s][a-zA-Z0-9_\s- ]+$/;
	url_validation = new RegExp("^(http|https)://", "i");
	numberValidation = /\d/;
	spacailValidation = /[!@#$%^&*()_+×÷={}\[\]:;<>,.|`€£¥₩°•○●□■♤♡◇♧☆▪︎¤《》¡¿?~\\/-]/;
	upperCaseValidation =  /[A-Z]/;


	curreny = '$'



	headersapi = {
		'Authorization': 'Basic ' + base64.encode(base64.encode('mario') + ":" + base64.encode('carbonell')),
		"Accept": 'application/json',
		'Content-Type': 'multipart/form-data',
		'Cache-Control': 'no-cache,no-store,must-revalidate',
		'Pragma': 'no-cache',
		'Expires': 0,
		'Cookie': 'HttpOnly'
	}
	GetPlayeridfunctin = (player_id) => {
		player_id_me1 = player_id
	}


	 getFormateName = (name) => {
        const words = name.split(" ");
        const initials = words.map(word => word.charAt(0).toUpperCase());
        return initials.join('');
      };

	//---------app logout --------------//
	// AppLogout = async (navigation) => {
	// 	console.log('AppLogout');
	// 	//----------------------- if get user login type -------------
	// 	var userdata = await localStorage.getItemObject('user_arr');
	// 	var password = await localStorage.getItemString('password');
	// 	var email = await localStorage.getItemString('email');
	// 	var remember_me = await localStorage.getItemString('remember_me');

	// 	console.log(password);
	// 	console.log(email);
	// 	console.log(remember_me);

	// 	if (userdata != null) {
	// 		if (userdata.login_type == 'app') {
	// 			localStorage.clear();
	// 			if (remember_me == 'yes') {
	// 				localStorage.setItemString('password', password);
	// 				localStorage.setItemString('email', email);
	// 				localStorage.setItemString('remember_me', remember_me);

	// 			} else {
	// 				localStorage.setItemString('password', password);
	// 				localStorage.setItemString('email', email);
	// 			}
	// 			localStorage.setItemString('user_id', '0')
	// 			navigation.navigate('Login');

	// 		} else if (userdata.login_type == 'facebook') {
	// 			console.log('face boook login');
	// 			LoginManager.logOut();
	// 			localStorage.clear();
	// 			localStorage.setItemString('user_id', '0')
	// 			navigation.navigate('Login')
	// 		} else if (userdata.login_type == 'google') {
	// 			console.log('google login')
	// 			try {
	// 				await GoogleSignin.revokeAccess();
	// 				await GoogleSignin.signOut();
	// 			} catch (error) {
	// 				consolepro.consolelog({ error })
	// 				//alert(error);
	// 			}
	// 			localStorage.clear();
	// 			localStorage.setItemString('user_id', '0')
	// 			navigation.navigate('Login')
	// 		} else if (userdata.login_type == 5) {
	// 			console.log('face boook login')
	// 		}
	// 	} else {
	// 		console.log('user arr not found');
	// 	}
	// }

};
//--------------------------- Config Provider End -----------------------

export const config = new configProvider();





