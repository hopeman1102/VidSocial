import { Alert, ToastAndroid, Platform } from "react-native";
import Toast from 'react-native-simple-toast';
//--------------------------- Message Provider Start -----------------------
class messageFunctionsProviders {
	toast(message, position) {
		if (position == 'center') {
			Toast.showWithGravity(message, Toast.short, Toast.CENTER);
		}
		else if (position == 'top') {
			Toast.showWithGravity(message, Toast.short, Toast.TOP);
		}
		else if (position == 'bottom') {
			Toast.showWithGravity(message, Toast.short, Toast.BOTTOM);

		}
		else if (position == 'long') {
			Toast.showWithGravity(message, Toast.long, Toast.CENTER);
		}

	}

	alert(title, message, callback) {
		if (callback === false) {
			Alert.alert(
				title,
				message,
				[
					{
						text: msgTitle.ok[0],
					},
				],
				{ cancelable: false },
			);
		} else {
			Alert.alert(
				title,
				message,
				[
					{
						text: msgTitle.ok[0],
						onPress: () => callback,
					},
				],
				{ cancelable: false },
			);
		}

	}

	confirm(title, message, callbackOk, callbackCancel) {
		if (callbackCancel === false) {
			Alert.alert(
				title,
				message,
				[
					{
						text: msgTitle.cancel[0],
					},
					{
						text: msgTitle.ok[0],
						onPress: () => this.btnPageLoginCall(),
					},
				],
				{ cancelable: false },
			);
		} else {
			Alert.alert(
				title,
				message,
				[
					{
						text: msgTitle.cancel[0],
						onPress: () => callbackCancel,
					},
					{
						text: msgTitle.ok[0],
						onPress: () => callbackOk,
					},
				],
				{ cancelable: false },
			);
		}

	}

	later(title, message, callbackOk, callbackCancel, callbackLater) {
		Alert.alert(
			title,
			message,
			[
				{
					text: 'Ask me later',
					onPress: () => msgTitle.later[0],
				},
				{
					text: 'Cancel',
					onPress: () => msgTitle.cancel[0],
				},
				{
					text: 'OK',
					onPress: () => msgTitle.ok[0],
				},
			],
			{ cancelable: false },
		);
	}


}

//--------------------------- Title Provider Start -----------------------

class messageTitleProvider {
	//----------------- message buttons
	ok = ['Ok', 'Okay', 'Está bem'];
	cancel = ['Cancel', 'Cancelar', 'Cancelar'];
	later = ['Later', 'Más tarde', 'Mais tarde'];


	//--------------- message title 
	information = ['Information Message', 'Mensaje informativo', 'Mensagem Informativa'];
	alert = ['Alert', 'Alerta', 'Alerta'];
	confirm = ['Information Message', 'Mensaje informativo', 'Mensagem Informativa'];
	validation = ['Information Message', 'Mensaje informativo', 'Mensagem Informativa'];
	success = ['Information Message', 'Mensaje informativo', 'Mensagem Informativa'];
	error = ['Information Message', 'Mensaje informativo', 'Mensagem Informativa'];
	response = ['Response', 'Respuesta', 'Resposta'];
	server = ['Connection Error', 'Error de conexión', 'Erro de conexão'];
	internet = ['Connection Error', 'Error de conexión', 'Erro de conexão']
	deactivate_msg = ['Account deactived']
	deactivate = [0,]
	usernotexit = ["User id does not exist"]
	account_deactivate_title = ['your account deactivated please try again']
}

//--------------------------- Message Provider Start -----------------------

class messageTextProvider {

	emptyLastName = ['Please enter  last name']
	lastNameMinLength = ['Last name is too short']
	lastNameMaxLength = ['Last name is too long']
	validLastName = ['Spaces not allowed in last name']

	emptyFullName = ['Please enter  full name']
	fullNameMinLength = ['Full name is too short']
	fullNameMaxLength = ['Full name is too long']
	validFullName = ['Spaces not allowed in full name']



	emptyMobile = ['Please enter a mobile number']
	mobileMaxLength = ['Enter a valid mobile number']
	mobileMinLength = ['Enter a valid mobile number']
	validMobile = ['Spaces and special characters not allowed in mobile number']



	//=========================Links tax
	link_not_avail = ["Link not available"]


	loginFirst = ['Please login first',];
	emptyContactResion = ['Please select contact reason',];

	networkconnection = ['Unable to connect. Please check that you are connected to the Internet and try again.', 'Unable to connect. Please check that you are connected to the Internet and try again.'];
	internet = ['Connection Error', 'Error de conexión', 'Erro de conexão']
	information = ['Information Message', 'Mensaje informativo', 'Mensagem Informativa'];
	internet = ['Connection Error', 'Error de conexión', 'Erro de conexão']
	servermessage = ['An Unexpected error occured , Please try again .If the problem continues , Please do contact us', 'An Unexpected error occured , Please try again .If the problem continues , Please do contact us'];
	//--------------------All Field Require-------------

	name_mobile_enter_message = ['Please enter name and mobile']
	openingHourShouldBeGreaterThenClosingHour = ['Opening hour should be greater then closing hour'];
	Start_time_End_time_greater_validation = ['End time should be greater than start time'];


	//-----------------localbusiness  app -------------------
	emptyFirstName = ['Please enter  first name']
	firstNameMinLength = ['First Name is too short']
	firstNameMaxLength = ['First Name is too long']
	validFirstName = ['Spaces not allowed in first name']

	emptyContactMessage = ['Please enter message', ''];

	//==============================overview=============================
	overview = ["Please enter overview"]
	report_txt = ["Please enter report"]
	review_txt = ["Please enter review"]
	no_category_available = ['No category available']

	//==========================Reason==================
	reason_txt = ["Please enter reason"]
	//==============================Social URl=============================
	facebook = ["Please enter Facebook url"]
	validfacebook = ["Please enter valid Facebook url"]

	instagram = ["Please enter Instagram url"]
	validinstagram = ["Please enter valid Instagram url"]

	linkedin = ["Please enter LinkedIn url"]
	validlinkedin = ["Please enter valid LinkedIn url"]

	google = ["Please enter Google url"]
	validgoogle = ["Please enter valid Google url"]

	entername = ['Please enter your name']

	// emptyname = ['Please enter your name']
	// emptyName = ['Please enter your name']
	// nameMinLength = ['Name is too short']
	// nameMaxLength = ['Name is too long']
	// validname = ['Spaces not allowed an name']

	//=============================Add Upcoming Holidays
	holiday_name = ['Please enter Holiday name']
	holiday_min_name = ['Holiday name is too short']
	holiday_Max_Length = ['Holoday name is too long']


	date_Validaytion = ['Please select date']

	//==============================Login===============================
	emptyEmail = ['Please enter email address']

	validEmail = ['Email address is not correct , Please enter a valid email address.']

	emptyLastName = ['Please enter  last name']
	lastNameMinLength = ['Last name is too short']
	lastNameMaxLength = ['Last name is too long']
	validLastName = ['Spaces not allowed in last name']

	emptyFullName = ['Please enter  full name']
	fullNameMinLength = ['Full name is too short']
	fullNameMaxLength = ['Full name is too long']
	validFullName = ['Spaces not allowed in full name']



	emptyMobile = ['Please enter a mobile number']
	mobileMaxLength = ['Enter a valid mobile number']
	mobileMinLength = ['Enter a valid mobile number']
	validMobile = ['Spaces and special characters not allowed in mobile number']
	//=================================Password===================
	emptyPassword = ['Please enter your password']
	passwordMaxLength = ['Password too long']
	passwordMinLength = ['Password should be atleast 6 digit']
	validPassword = ['Spaces not allowed in password']

	emptyAddress = ['Please Enter Addrees']
	addressMinLength = [' Addrees is too short']
	addressMaxLength = [' Addrees is too long']
	validAddress = ['Spaces not allowed in addrees']

	emptyPincode = ['Please enter pincode']
	pincodeMinLength = ['Pincode is too short']
	pincodeMaxLength = ['Pincode is too long']
	validPincode = ['Spaces and special characters not allowed in pin code']

	emptyOldPassword = ['Please enter old password']
	oldPasswordMaxLength = ['Old Password too long']
	oldPasswordMinLength = [' Old Password should be atleast 6 digit']
	validOldPassword = ['Spaces not allowed in old password']


	emptyNewPassword = ['Please enter new password']
	newPasswordMaxLength = [' New password too long']
	newPasswordMinLength = [' New password should be atleast 6 digit']
	validNewPassword = ['Spaces not allowed in new password']

	emptyPassword = ['Please enter your password']
	passwordMaxLength = ['Password too long']
	passwordMinLength = ['Password should be atleast 6 digit']
	validPassword = ['Spaces not allowed in password']

	emptyConfirmPassword = ['Please enter confirm password']
	confirmPasswordMaxLength = [' Confirm password too long']
	confirmPasswordMinLength = [' Confirm password should be atleast 6 digit']
	validConfirmPassword = ['Spaces not allowed in confirm password']
	passwordNotMatch = ['New password and confirm password fields must be equal.']
	passwordNot = ['Password and confirm password fields must be equal']
	passwordMatch = ['Old password and new password fields must not be equal']

	acceptTerms = ['Please accept Terms and Conditions to continue.']
	emptyOtp = ['Please enter OTP']
	otpMinLength = ['OTP should be atleast 4 digit']

	Start_End_time_greater = ['End time should be greater than start time']


	//-------------------------contact us ---------------------
	emptyFullName = ['Please enter full name']
	fullNameMinLength = ['Full name is too short']
	fullNameMaxLength = ['Full name is too long']
	validName = ['Spaces not allowed in full name']
	messageSend = ['Message sent successfully ']
	validMessage = ['Spaces not allowed in message']

	//-----------------add report----------------
	emptyReportMessage = ['Please enter report message']
	validReportMessage = ['Please enter valid report message']


	//----------------select slot ---------
	emptyDate = ['Please select Date']
	emptyTime = ['Please select time']
	emptyPeople = ['Please select no of people']
	restaurant_close = ['Restaurant close on that day']
	emptySlot = ['Please select slot']
	selectAnotherSlot = ['Please select another slot']
	slotTimeOver = ['Slot time is over']

	//----------reservation history------------//
	already_checkin = ['You already check-in']
	checkin_first = ['Please check-in first']

	//----------------home filter -----------//
	emptyRestauCategory = ['Please select Restaurant Category']
	emptyReviewType = ['Please select Review Type']
	emptyFilterOption = ['Please select Filter Option']

	// =============================NO Yes
	No_txt = ["No"]
	Yes_txt = ["Yes"]

}

export const msgText = new messageTextProvider();
export const msgTitle = new messageTitleProvider();
export const msgProvider = new messageFunctionsProviders();
//--------------------------- Message Provider End -----------------------