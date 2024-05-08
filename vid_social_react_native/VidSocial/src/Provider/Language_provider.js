import { Alert, ToastAndroid, I18nManager, Platform } from "react-native";
import { localStorage } from './localStorageProvider';
import AsyncStorage from "@react-native-community/async-storage";
import { config } from "./configProvider";

global.language_key = 1;
class Language_provider {

  language_get = async () => {
    var item = await AsyncStorage.getItem('language');
    console.log('check launguage option', item)
    if (item != null) {
      config.language = item;
    }
    console.log('language_key123', config.language)
  }

  language_set = (value) => {
    config.language = value;
    localStorage.setItemObject('language', value)
  }


  //common text this  application 
  // Media option ///////////////////
  selectLeveltxt = ["Select level", "Selecciona el nivel"];
  MediaCamera = ['Camera', 'Cámara'];
  Mediagallery = ['Gallery', 'Galería'];
  cancelmedia = ['Cancel', 'Cancelar'];
  //  ----===============Login=========================
  signInAcctoacc = ["Sign in to Account", "Iniciar sesión en la cuenta"]
  signInwith = ["Sign in with email and password to use your Account", "Inicie sesión con correo electrónico y contraseña para utilizar su cuenta"]
  Rememberme = ["Remember me", "Recuerdame"]
  ForgotPassword = ["Forgot Password", "Olvidé mi contraseña"]
  cretaeAcc = ["Create Your Account", "Crea tu cuenta"]
  AccCreatewith = ["Create an account", "Cree una cuenta"]
  cngtxt = ["Congrats !"]
  Complete = ["Complete", "Completo"]
  email1 = ["Email Address", 'Dirección de correo electrónico']
  Password5 = ["Password", 'contraseña']
  DoyouHaveaccount = ["Don't have an account", "No tienes una cuenta"]
  SignUp2 = ["Sign Up", "Registrarse"]
  login3 = ["LOGIN", "ENTRAR"]
  //  ==============================================login page end=============================================

  // ==============================sinup.js====================================

  fullname1 = ["Full Name", "Nombre completo"]
  Nikename1 = ["Nick Name", "Apodo"]
  Repeatpassword1 = ["Repeat Password", "Repita la contraseña"]
  NEXT1 = ["NEXT", "SIGUIENTE"]

  // ============================signup ennd================================

  // ==============================signup1 start=============================

  thankYoutxt = ["Thank you for registering.", "Gracias por registrarte."]
  pleaseConfirm = ["Please confirm your email address using the link that was sent to you.", "Confirme su dirección de correo electrónico utilizando el enlace que se le envió."]
  SelectCountry1 = ["Please Select Country", "Por favor seleccione país"]
  IDNumber1 = ["ID Number", "Número de identificación"]
  RepetNumber1 = ["Repeat ID Number", "Repetir número de identificación"]
  PhoneNumber1 = ["Phone Number", "Número de teléfono"]
  Birthday1 = ["Date of Birth", "Fecha de nacimiento"]
  Choosegender = ["Choose your gender", "Elige tu género"]
  Male1 = ["Male", "Masculino"]
  Female1 = ["Female", "Femenino"]
  selectOption1 = ["Select Option", "Seleccionar opción"]
  Member1 = ["Member", "Miembro"]

  Worker1 = ["Worker", "Streamer"]
  UserCert = ["I certify that I am of legal age", "Certifico que soy mayor de edad"]
  OKtxt = ["OKAY", "BUENO"]
  cngtxt = ["Congrats !", "Felicitaciones !"]
  SignUpsucc = ["SignUp successfully", "Regístrese exitosamente"]
  DontHaveAccount = ["Don't have an account?", "¿No tienes una cuenta?"]
  // =============================signup1 end===============================================================

  //==================forgot password =========================================
  forgotPass = ["Forgot Password", "Has olvidado tu contraseña"]
  resetPasslongtxt = ["Enter your email and we'll send you a link to reset your password.", "Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña."]
  Trouble1 = ["Trouble Logging in?", "¿Problemas para iniciar sesión?"]
  RESETPASSWORD = ["RESET PASSWORD", "RESTABLECER LA CONTRASEÑA"]
  Returnto = ["Return to", "Volver a"]
  login = ["Login", "Entrar"]
  //===================forgot password end =====================================

  //=====================Settings screen =====================================
  editprofile1 = ["Edit Profile", "Editar perfil"]
  HelpSupports = ["Help & Supports", "Ayuda y soporte"]
  languages = ["Languages", "Idiomas"]
  PrivacyPolicy1 = ["Privacy Policy", "Política de privacidad"]
  TermsConditions1 = [" Terms & Conditions", " Términos y condiciones"]
  FAQ = ["FAQ", "PREGUNTAS FRECUENTES"]
  Warnings = ["Warnings", "Advertencias"]
  logout1 = ["Logout", "Cerrar sesión"]
  SelectLang = ["Select Language", "Seleccione el idioma"]

  //=========================HelpSupports ================================================
  Enterdescription = ["Enter description", "Ingrese descripción"]
  Submit = ['SUBMIT', 'ENVIAR']
  Pleaseaddyourpaymentmethod = ["Please add your payment method", "Por favor agregue su método de pago"]
  Back = ["Back", "Atrás"]

  //============================Profile==============================================
  profile = ["Profile", "Perfil"]
  ID = ["ID", "IDENTIFICACIÓN"]
  Information = ["Information", "Información"]
  Comments1 = ["Comments", "Comentarios"]
  PositiveComments = ["Positive Comments", "Comentarios positivos"]
  AllComments = ["All Comments", "Todos los comentarios"]
  NegativeComment = ["Negative Comment", "Comentario negativo"]
  Callsin30day = ["Calls in the last 30 days", "Llamadas en los últimos 30 días"]

  // =========================profile======================================================

  ConfirmMoney = ["Congratulations in approximately 7 business days. You will receive your money in your account", "Felicitaciones en aproximadamente 7 días hábiles. Recibirás tu dinero en tu cuenta."]
  Verificationtxt = ["Verification", "Verificación"]
  correctinfotxt = ["Please send the correct information.", "Por favor envíe la información correcta."]
  verificationprocesstxt = ["Verification process are manual and take from 24 hours to 72 working hours.", "El proceso de verificación es manual y demora entre 24 y 72 horas hábiles."]
  Registered = ["Registered", "Registrado"]
  Firstcall = ["First call", "Primera llamada"]
  Warnings = ["Warnings", "Advertencias"]
  Negatives = ["Negatives", "Negativos"]
  Positives = ["Positives", "Positivos"]

  // =====================profile_c=====================================
  Credits = ["Credits", "Créditos"]
  Averagetime = ["Average time per call", "Tiempo medio por llamada"]

  //=====================profile_c end====================================

  //======================Home==============================
  Home = ["Home", "Inicio"]
  PleaseSelectCountry = ["Please SelectCountry ", "Por favor seleccione país"]
  UsersOnline = ["Users Online", "Usuarios en línea"]

  // =================home_c=================================
  GirlsOnline = ["Girls Online", "Chicas en línea"]


  //  =====================Edit Proflle Page ===========================
  editProfileCapitalTxt = ["EDIT PROFILE", "EDITAR PERFIL"]
  nameSurname = ["Name Surname", "Nombre Apellido"]
  eMailAddress = ["E-mail Address", "Dirección de correo electrónico"]
  Password = ["Password", 'contraseña']
  saveChanges = ["Save changes", "Guardar cambios"]
  leaveWithoutSaving = ["Leave without saving", "Salir sin guardar"]

  // ++++++ Reset Password 
  NewPassword = ["New Password", "Nueva contraseña"]
  ConfirmPassword = ["Confirm Password", "Confirmar Contraseña"]

  //=======================Take photo ============================
  takeidphototxt = ["TAKE ID PHOTO", "TOMAR FOTO DE IDENTIFICACIÓN"]
  takeVideo = ["TAKING A SELFIE VIDEO", "TOMAR UN VIDEO SELFIE"]
  uploadPic = ["UPLOAD ID PICTURE", "CARGAR IMAGEN DE IDENTIFICACIÓN"]

  ////==================ForgotpassManual==================================

  //============================EditProfileWorker==============================
  editProfile = ["Edit Profile", 'Editar Perfil']
  UPDATE = ["UPDATE", "ACTUALIZAR"]
  MyBadges = ["My badges", "Mis insignias"]
  liveChallenges = ["LIVE CHALLENGES"]
  trophyCabinet = ["TROPHY CABINET"]
  logOut = ["Log Out"]

  //==========================search===========================================
  Search = ["Search", "Buscar"]
  search1 = ["Search", "'Buscar...'"]

  //=====================Favourite================================
  Favourite = ["Favourite", "Favorita"]

  //====================wallet_c=============================================
  YOUR_CREDITS = ["YOUR CREDITS", "TUS CRÉDITOS"]
  BUY_CREDITS = ["BUY CREDITS", "COMPRAR CREDITOS"]
  Wallet = ["Wallet", "Billetera"]
  Payment_historyCap = ["Payment History", "Historial de pagos"]
  Binance = ["Binance", "Binance"]
  Bank_Account = ["Bank Account", "Cuenta bancaria"]
  Withdraw = ["Withdraw", "Retirar"]
  Enterwithdrawcredit = ["Enter withdraw credit", "Ingresar retirar crédito"]
  EquivivalentValue = ["Equivalent Value", "Valor equivalente"]
  DONE = ["DONE", "Aceptar"]
  Withdraw_CREDITS = ["WITHDRAW CREDITS", "RETIRAR CRÉDITOS"]
  Payment_List = ["Payment List", "Lista de pagos"]
  Payment_methods = ["Payment methods", "Métodos de pago"]
  Payment_history = ["Payment history", "Historial de pagos"]
  Frequent_questions = ["Frequent questions", "Preguntas frecuentes"]
  Sponsors = ["Sponsor", "Patrocinador"]
  Sponsorss = ["Sponsors", "Patrocinadores"]
  Report_sponsor = ["Report sponsor", "Reportar patrocinador"]
  Settings = ["Settings", "Ajustes"]

  //================Sponser===========================

  Alert = ["Alert", "Alerta"]
  LEAVE = ["LEAVE", "DEJAR"]
  Pleaseleavecurrentsponsorrequest = ["Please leave current sponsor request", "Por favor deje la solicitud de patrocinador actual"]
  YourSponsoris = ["Your Sponsor is", "Tu Patrocinador es"]
  Sponsorshiptime = ["Sponsorship time", "tiempo de patrocinio"]
  Paymentsreceived = ["Payments received", "pagos recibidos"]
  Totalmoneyreceived = ["Total money received", "dinero total recibido"]
  Usedfrequentpayment = ["Used frequent payment", "Pago frecuente usado"]
  NodataFound = ["No data Found!", "¡Datos no encontrados!"]
  REQUESTSPONSOR = ["REQUEST SPONSOR", "SOLICITAR PATROCINADOR"]

  // ===========================Binance details==============================================
  Binance_Details = ["Binance Details", "Detalles de Binance"]
  email5 = ["Email", "Correo electrónico"]
  PayID = ["Binance Pay ID", "ID de pago de Binance"]
  RepeatPayID = ["Repeat Binance Pay ID", "Repetir ID de pago de Binance"]

  // ===============================Bank details========================================
  BankName = ["Bank Name", "Nombre del banco"]
  Owner = ["Owner", "Propietario"]
  Identitycard = ["Identity card (DNI NUMBER)", "cedula de identidad (NÚMERO DNI)"]

  //===============================PaymentHistory============================================
  PaymentReceipt = ["Payment Receipt", "Recibo de pago"]
  PaymentRequestDate = ["Payment Request Date", "Fecha de solicitud de pago"]
  Method = ["Method", "Método"]
  PaymentReceiveDate = ["Payment Receive Date", "Fecha de recepción del pago"]
  RequestedAmount = ["Requested Amount", "Monto requerido"]
  Inprocess = ["Inprocess", "En proceso"]
  Draft = ["Requested Payment", "Pago solicitado"]
  Paid = ["Paid", "Pagado"]
  Requeston = ["Request on", "Solicitado en"]
  ViewReceipt = ["View Receipt", "Ver recibo"]

  //===============================Withdraw=screens=====================================================
  payment_method_to_withdraw = ["Select your payment method to withdraw", "Seleccione su método de pago para retirar"]
  Bank = ["Bank", "Banco"]
  Ac = ["A/c", "C.A"]

  //=================================Report screen================================================================
  Report = ["Report", "Reporte"]
  EnterSubject = ["Enter Subject", "Ingresar Asunto"]
  Enterdescription2 = ["Enter description", "Introduce la descripción"]
  submitReport = ["Report submitted successfully.", "Reporte enviado exitosamente."]
  More = ["More", "Más"]

  //================================Payment====================================
  Payment = ["Payment", "Pago"]

  // ===================================ProviderHome screen=========================================
  ProviderHome = ["ProviderHome", "ProveedorInicio"]
  // =============================Notification====================================
  Notification = ["Notification", "Notificación"]

  //=============================TopGirls===================================
  TopGirls = ["Top Girls", "Chicas top"]
  Rightnowthereisnotopgirlavailableinthe = ["Right now there is no top girl available in the VidSocial, you want to be one of them, you will have to perform well.", "En este momento no hay ninguna chica top disponible en VidSocial, si quieres ser una de ellas, tendrás que desempeñarte bien."]

  // =======================BankAccount screen==================================
  BankList = ["Bank List", "Banco Lis"]
  Bank_And_binance_Accounts = ["Bank and binance accounts", "Cuentas bancarias y binance"]
  SELECT = ["SELECT", "SELECCIONAR"]

  // =================================AgoraChatying=============================================================
  Enterusername = ["Enter usernam", "Introduzca su nombre de usuario"]
  EnterchatToken = ["Enter chatToken", "Ingrese al token de chat"]
  Entertheusernameyouwanttosend = ["Enter the username you want to send", "Introduce el nombre de usuario que deseas enviar"]
  Entercontent = ["Enter content", "Introducir contenido"]

  // ===================================CallRating Screen==============================================================
  Howwasthecallwith = ["How was the call with", "¿Cómo estuvo la llamada con"]
  Type = ["Type...", "Escribir..."]
  Wouldtolikeadd = ["Would to like add", "Agregar a"]
  to_your_favourites = ["to your favourites?", "a tus favoritas?"]
  Post = ["SEND", "ENVIAR"]
  RatingSendSuccess = ["Rating sent successfully.", "Calificación enviada exitosamente."]
  markFavSuccess = ["Mark favourite successfully.", "Agregada a favoritas"]


  // =====================================TotalEarnedCoins Screen=========================================================
  Congratulations = ["Congratulations", "Felicidades"]
  Inthisvideocallyouobtain = ["In this video call you obtain", "En esta videollamada obtienes"]
  credits = ["credits.", "créditos."]
  UserReport = ["USER REPORT", "Reportar Usuario"]

  //================================ReportWorker screen=======================================================
  Report_against = ["Report against", "Reportes en contra"]

  // =============================== Video Calling 
  VideoPause = ["Video Paused...", "Vídeo en pausa..."]
  TypeHere = ["Type Here...", "Escriba aquí..."]

  // ========================= Incommimg Call Screen ================================
  VideoCall = ["Video Call", "Videollamada"]

  // ========================= Outgoing Call Screen ================================
  Calling = ["Calling", "Llamando"]

  // ========================= Incommimg Call Screen ================================
  Call_ended = ["Call ended", "Llamada terminada"]
  passChangeCorrecttxt = ["Password changed correctly", "La contraseña se cambió correctamente"]
  PositiveComm = ["Positive comments"]
  Comments = ["Comments", "Comentarios"]
  Ratings = ["Rating", "Califica tu llamada"]
  Yourcredits = ["Your credits", "Tus créditos"]
  sixtyfive = ["6500", "seis mil quinientos"]
  Bank3 = ["Bank Account Name", " Nombre de la cuenta bancaria"]
  Sponsors_in_country = ["Sponsors in your country", "Patrocinadores en tu país"]
  Accountnumber = [" Account number", "Número de cuenta"]
  Accounttype = [" Account type", "Tipo de cuenta"]
  DummyData = ["Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type", "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type"]
  verificationwithin = ["Within 24 hours to 72 hours you will receive an email confirmation that you can access your account and work with us.", "En un plazo de 24 a 72 horas, recibirá una confirmación por correo electrónico de que puede acceder a su cuenta y trabajar con nosotros."]
  CANCEL = ["CANCEL", "CANCELAR"]
  RETAKE = ["RETAKE", " VOLVER A TOMAR"]
  idphotodonetxt = ["ID Photo done", "Foto de identificación realizada"]
  videoSelfiedonetxt = ["Video selfie done", "Video selfie hecho"]
  selectAccount = ["Please select account", "Por favor seleccione cuenta"]
  Frequent_questions_for_user = ["FAQ's", "Preguntas frecuentes"]
  Remaining_Time = ["Remaining Time: ", "Tiempo restante: "]
  English = ['English', "Ingles"]
  Spanish = ['Spanish', "Español"]
  Call_Busy = ["Call is Busy", "La llamada está ocupada"]
  YouTxt = ["You", "Tú"]

  // ================ Worning Screen =========================
  Reason = ["Reason", "Razón"]
  WarningDate = ["Warning Date", "Fecha de advertencia"]
  CoinsDeducted = ["Coins Deducted", "Monedas deducidas"]
  Action = ["Action", "Acción"]
  Attachfile = ["Attach file", "Adjuntar archivo"]
  Attachedfile = ['   File Attached', "   Archivo adjunto"]
  UserOffline = ['User offline', "Usuario desconectado"]
  ValidEmailadd = ['Please enter valid email address.', "Por favor ingrese una dirección de correo electrónico válida."]

  // ========================= Account Deactivate ================
  AccountDeactivate = ['Account deactivated', 'Cuenta desactivada']
  AccountDeactivateByAdmin = ['Your account has been deactivated by Admin.', 'El administrador ha desactivado su cuenta.']

  // ================================= Added By Rupesh Validation =================================
  emptyBank = ['Please enter bank name', 'Por favor ingrese el nombre del banco']
  banknameMaxLength = ['Bank name is too long', 'El nombre del banco es demasiado largo']
  emptyOwnername = ['Please enter owner name', 'Por favor ingrese el nombre del propietario']
  OwnernameMinLength = ['Owner name is too short', 'El nombre del propietario es demasiado corto']
  emptyDinNumber = ['Please enter din number', 'Por favor ingrese el número cedula']
  enterproperdinnumber = [' Please enter vaild DNI number', 'Por favor introduzca el número de cedula válido']
  emptyAccountNumber = ['Please enter account number', 'Por favor ingrese el número de cuenta']
  enterValidAccountnumber = ['Please enter valid account number', 'Por favor ingrese un número de cuenta válido']
  emptyAccountType = ['Please enter account type', 'Por favor ingrese el tipo de cuenta']
  enterValidAccounttype = ['Please enter valid account type', 'Ingrese un tipo de cuenta válido']


  // ================================= Login =================================
  emptyEmail = ['Please enter email address', 'Por favor ingrese la dirección de correo electrónico']
  emailMaxLength = ['Email is too long', "El correo electrónico es demasiado largo"]
  outLookHotmail = ["Please enter a valid domain, Hotmail and Outlook mail are not accepted.","Por favor ingrese un dominio válido, no se aceptan correo de Hotmail ni Outlook."]
  validEmail = ['Email address is not correct , Please enter a valid email address.', 'La dirección de correo electrónico no es correcta. Introduzca una dirección de correo electrónico válida.']
  emailNotRegistered = ['Entered email address not registered with us.', "'La dirección de correo electrónico introducida no está registrada con nosotros.'"]

  // ============================== identification =====================================
  emptyIdNumber = ['Please enter identification number', "'Por favor ingrese el número de identificación'"]
  emptyIdNumberlength = ['Identification number too short', 'Número de identificación demasiado corto']

  // ============================== Repeat identification ==============================
  emptyrepeatIdNumber = ['Please enter repeat identification number', 'Por favor ingrese repetir número de cedula']
  emptyrepeatIdNumberlength = ['Repeat identification number too short', 'Número de cedula repetido demasiado corto']
  repeatIdNumbersame = ['Identification number and repeat identification number must be same', 'El número de cedula y el número de cedula repetido deben ser los mismos']

  // ===================================================================================
  emptyMobile = ['Please enter a mobile number', "Por favor, introduzca un número de teléfono móvil"]
  mobileMaxLength = ['Enter a valid mobile number', 'Por favor, introduzca un número de teléfono móvil']
  mobileMinLength = ['Enter a valid mobile number', 'Ingrese un número de móvil válido']
  validMobile = ['Spaces and special characters not allowed in mobile number', 'No se permiten espacios ni caracteres especiales en el número de móvil']
  selectbirthDate = ['Please select birth date', 'Por favor seleccione la fecha de nacimiento']

  // ================================= Password =================================
  emptyPassword = ['Please enter your password', 'Por favor, introduzca su contraseña']
  passBlank = ['Please enter password.', 'Contraseña demasiado larga']
  passwordMinLength = ['Password cannot be less than 8 characters.', 'La contraseña no puede tener menos de 8 caracteres.']
  passMaxLength = ['Password cannot be greater than 17 characters.', 'La contraseña no puede tener más de 17 caracteres.']
  caseSensitivePass = ['Password must be case sensitive.', 'La contraseña debe distinguir entre mayúsculas y minúsculas.']
  validPassword = ['Spaces not allowed in password', 'Espacios no permitidos en contraseña']
  passFormate = ['Password use atleast 8 characters long, one upper and lower case characters, numeric number and special character.', 'La contraseña utiliza al menos 8 caracteres, uno en mayúscula y otro en minúscula, un número numérico y un carácter especial.']
  cPassBlank = ['Please enter repeat password.', 'Por favor, introduzca la contraseña repetida.']
  cPassCharLess = ['Repeat password cannot be less than 8 characters.', 'La contraseña repetida no puede tener menos de 8 caracteres.']
  cPassMaxLength = ['Repeat password cannot be greater than 17 characters.', 'La contraseña repetida no puede tener más de 17 caracteres.']
  cPassNotMatch = ['Passowrd and repeat password fields must be equal.', 'Los campos Contraseña y Repetir contraseña deben ser iguales.']
  passNotFormate = ['Password must be at least 8 characters long, contain at least one number and special character and have a mixture of uppercase and lowercase letters.', 'La contraseña debe tener al menos 8 caracteres, contener al menos un número y un carácter especial y tener una combinación de letras mayúsculas y minúsculas.']
  emailPassNotCorrect = ['Entered email addres or password are not correct, Please try again.', "La dirección de correo electrónico o la contraseña ingresadas no son correctas. Inténtelo de nuevo."]
  emailPassNotCorrect1 = ['Entered email address and password are invaild.', 'La dirección de correo electrónico y la contraseña ingresadas no son válidas.']
  inCorrectPass = ['Entered password are incorrect, Please Try again', 'La contraseña ingresada es incorrecta, inténtelo nuevamente']
  Sign_In_or_Login_error_msg = ['Please enter the above fields', 'Por favor ingrese los campos anteriores']


  // ================================= contact us =================================
  emptyFullName = ['Please enter full name', 'Por favor ingrese el nombre completo']
  emptyNickName = ['Please enter nick name', 'Por favor ingrese el apodo']
  fullNameMinLength = ['Full name is too short', 'El nombre completo es demasiado corto']
  fullNameMaxLength = ['Please enter full name between 2 to 32 characters.', 'Por favor ingrese el nombre completo entre 2 y 32 caracteres.']
  validName = ['Spaces not allowed in full name', 'Espacios no permitidos en nombre completo']
  messageSend = ['Message sent successfully ', 'Mensaje enviado con éxito ']
  validMessage = ['Spaces not allowed in message', 'Espacios no permitidos en el mensaje']
  ifNumAvailinName = ['Please enter vaild credentials, full name not only numeric', 'Ingrese credenciales válidas, nombre completo, no solo numérico']
  emptyName = ['Please enter email address.', 'Por favor, introduzca la dirección de correo electrónico.']
  inCorrectEmail = ['Email address is not correct, Please enter valid email address.', 'La dirección de correo electrónico no es correcta. Introduzca una dirección de correo electrónico válida.']
  alreadyUsedEmail = ['Entered email address already being in use.', 'La dirección de correo electrónico ingresada ya está en uso.'
  ]

  // ====================================  Pay ID ======================================
  emptyPayID = ['Please enter Binance Pay ID', 'Ingrese su Pay ID de Binance']
  minLengthpayId = ["Please enter valid Pay ID", "Por favor ingrese un Pay ID de Binance válido"
  ]
  EnterAValidPayID = ["Enter a valid Pay ID", "Ingrese una Pay ID de Binance válido"]
  cBinanceMatch = ['Pay id and repeat Pay ID fields must be equal.',
    'Los campos de Pay ID de Binance y de Pay ID de Binance repetido deben ser iguales.']
  // ================================= Level Configuratin =================================
  levelNotSelected = ['Please select Type', 'Por favor seleccione Tipo']
  excerciseNotSelect = ['Please select excercise ', 'Por favor seleccione ejercicio '
  ]

  // ================================= Add Excercise =================================
  chooseExcercise = ['Please choose an exercise.', 'Por favor, elija un ejercicio.']

  // ================================= Complete =================================
  selectChallenge = ['Please select a challengee.', 'Por favor seleccione un desafiado.']

  // ================================= Edit Profile =================================
  emptyProfileImage = ['Please select profile image.', 'Seleccione la imagen de perfil.']
  emptyName = ['Please enter your Name Surname.', 'Por favor ingrese su Nombre Apellido.']
  nameMaxLength = ['Please enter a full name between 2 to 32 characters.', 'Por favor, introduzca un nombre completo de entre 2 y 32 caracteres.']
  nameNumCheck = ['Please enter valid credentials, Your full name cannot only contain numbers.', 'Ingrese credenciales válidas. Su nombre completo no puede contener solo números.']
  incorrectEmailAddress = ['Your email address is incorrect, Please enter a valid email address.', 'Su dirección de correo electrónico es incorrecta. Introduzca una dirección de correo electrónico válida.']
  emailAlreadyInUse = ['This email address already being in use.', "Esta dirección de correo electrónico ya está en uso."]

  // ================================= App logout =================================
  logoutPress = ['Are you sure you want to log out?', '¿Estás segura de que quieres cerrar sesión?']

  // ================================= Delete Account =================================
  deleteAccoutValidation = ['Are you sure you want to delete your account?', '¿Estás seguro de que deseas eliminar tu cuenta?']
  legalAge = ['Please check first legal age documentation.', "Por favor, consulte la documentación de primera edad legal."]

  // ======================================================
  emptySubject = ['Please enter subject', 'Por favor ingrese el asunto']
  subjectTooLong = ['Entered subject is too long', 'El asunto ingresado es demasiado largo']
  emptyDescription = ['Please enter description', 'Por favor ingrese la descripción']
  plsGiveRate = ['Please give rating.', 'Por favor califica.']

  // ===============================model language===================================================

  Holdon = ["Hold on!", "¡Esperar!"]
  AreyousureyouwanttoExit = ["Are you sure you want to Exit?", '¿Estás segura de que quieres salir?']
  No = ["No", "No"]
  Yes1 = ["Yes", "Sí"]
  Accountisnotverifyplease = ["'Account is not verify, please verify first.'", "La cuenta no está verificada, verifíquela primero."]
  Nowitstimetotakeselfievideo = ["Now it's time to take selfie video", "Ahora es el momento de tomar un video selfie"]
  LeaveSponser = ["Leave Sponsor", "Dejar Patrocinador"]
  Youdonthaveanysponsor = ["You don't have any sponsor!", "¡No tienes ningún patrocinador!"]
  Tusmonedasestánpuntodeagotarse = ["Your coins are about to run out, The  call will be automatically disconnected.", "Tus monedas están a punto de agotarse. La llamada se desconectará automáticamente."]
  Cantsendemptymessage = ["Can't send empty message", "No se puede enviar un mensaje vacío"]
  NoSufficientCredit = ["No Sufficient Credit", "No tienes crédito suficiente"]
  Yourcoinsareabouttorunout = ["Your coins are about to run out, The  call will be automatically disconnected.", "Tus monedas están a punto de agotarse. La llamada se desconectará automáticamente."]








  //   //common text this  application 

  // //  ----===============Login=========================
  //  signInAcctoacc = ["Sign in to Account", "Iniciar sesión en la cuenta"]
  //  signInwith = ["Sign in with email and password to use your Account", "Inicie sesión con correo electrónico y contraseña para utilizar su cuenta"]
  //  Rememberme = ["Remember me", "Recuerdame"]
  //  ForgotPassword = ["Forgot Password", "Olvidé mi contraseña"]
  //  cretaeAcc = ["Create Your Account", "Crea tu cuenta"]
  //  AccCreatewith = ["Create an account to Q Allure to get all features", "Cree una cuenta en Q Allure para obtener todas las funciones"]
  //  cngtxt = ["Congrats !"]
  //  Complete = ["Complete","Completa"]
  //  email1 = ["Email Address",'Dirección de correo electrónico']
  //  Password5 =  ["Password",'contraseña']
  //  DoyouHaveaccount =["Don't have an account","No tienes una cuenta"]
  //  SignUp2 =["Sign Up","Registrarse"]
  //  login3 =["LOGIN", "ENTRAR"]
  // //  ==============================================login page end=============================================

  // // ==============================sinup.js====================================

  // fullname1 =["Full Name", "Nombre completo"]
  // Nikename1 =["Nick Name", "Apodo"]
  // Repeatpassword1 =["Repeat Password", "Repita la contraseña"]
  // NEXT1 =["NEXT", "SIGUIENTE"]

  // // ============================signup ennd================================

  // // ==============================signup1 start=============================

  // thankYoutxt = ["Thank you for registering.", "Gracias por registrarte."]
  // pleaseConfirm = ["Please confirm your email address using the link that was sent to you.", "Confirme su dirección de correo electrónico utilizando el enlace que se le envió."]
  // SelectCountry1 =["Please Select Country", "Por favor seleccione país"]
  // IDNumber1 = ["ID Number", "Número de identificación"]
  // RepetNumber1 =["Repeat ID Number", "Repetir número de identificación"]
  // PhoneNumber1 = ["Phone Number" ,"Número de teléfono"]
  // Birthday1 = ["Date of Birth", "Fecha de nacimiento"]
  // Choosegender = ["Choose your gender", "Elige tu género"]
  // Male1 = ["Male","Masculino"]
  // Female1 =["Female","Femenino"]
  // selectOption1 = ["Select Option", "Seleccionar opción"]
  // Member1 = ["Member","Miembro"]

  // Worker1= ["Worker", "Streamer"]
  // UserCert = ["I certify that I am of legal age", "Certifico que soy mayor de edad"]
  // OKtxt = ["OKAY", "BUENO"]
  // cngtxt = ["Congrats !", "Felicitaciones !"]
  // SignUpsucc = ["SignUp successfully", "Regístrese exitosamente"]
  // DontHaveAccount = ["Don't have an account?", "¿No tienes una cuenta?"]
  // // =============================signup1 end===============================================================

  // //==================forgot password =========================================
  // forgotPass = ["Forgot Password", "Has olvidado tu contraseña" ]
  // resetPasslongtxt = ["Enter your email and we'll send you a link to reset your password.", "Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña."]
  // Trouble1 = ["Trouble Logging in?", "¿Problemas para iniciar sesión?"]
  // RESETPASSWORD = ["RESET PASSWORD","RESTABLECER LA CONTRASEÑA" ]
  // Returnto = ["Return to", "Volver a"]
  // login =["Login" ,"Acceso"] 
  // //===================forgot password end =====================================

  // //=====================Settings screen =====================================
  // editprofile1 = ["Edit Profile", "Editar perfil"]
  // HelpSupports = ["Help & Supports", "Ayuda y soporte"]
  // languages = ["languages", "idiomas"]
  // PrivacyPolicy1 =["Privacy Policy", "Política de privacidad"]
  // TermsConditions1 =[" Terms & Conditions"," Términos y condiciones"]
  // FAQ =["FAQ", "PREGUNTAS MÁS FRECUENTES"]
  // Warnings =["Warnings", "Advertencias"]
  // logout1 =["Logout","Cerrar sesión"]
  // SelectLang =["Select Language","Seleccione el idioma"]

  // //=========================HelpSupports ================================================
  // Enterdescription =["Enter description", "Ingrese descripción"]
  // Submit = ['SUBMIT', 'ENVIAR']
  // Pleaseaddyourpaymentmethod =["Please add your payment method","Por favor agregue su método de pago"]
  // Back=["Back","Atrás"]
  // //=======================Helpsupport ends=======================================


  // //============================Profile==============================================
  // profile = ["Profile", "Perfil"]
  // ID=["ID", "IDENTIFICACIÓN"]
  // Information =["Information", "Información"]
  // Comments1 =["Comments", "Comentarios"]
  // PositiveComments =["Positive Comments", "Comentarios positivos"]
  // AllComments = ["All Comments", "Todos los comentarios"]
  // NegativeComment =["Negative Comment", "Comentario negativo"]
  // Callsin30day = ["Calls in the last 30 days", "Llamadas en los últimos 30 días"]

  // // =========================profile======================================================

  // ConfirmMoney = ["Congratulations in approximately 7 business days. You will receive your money in your account","Felicitaciones en aproximadamente 7 días hábiles. Recibirás tu dinero en tu cuenta."]
  //  Verificationtxt = ["Verification", "Verificación"]
  //  correctinfotxt = ["Please send the correct information.", "Por favor envíe la información correcta."]
  //  verificationprocesstxt = ["Verification process are manual and take from 24 hours to 72 working hours.", "El proceso de verificación es manual y demora entre 24 y 72 horas hábiles."]
  //  Registered = ["Registered", "Registrada"]
  //  Firstcall = ["First call", "Primera llamada"]
  //  Warnings = ["Warnings", "Advertencias"]
  //  Negatives = ["Negatives", "Negativos"]
  //  Positives = ["Positives",  "Positivos"]

  // // =====================profile_c=====================================
  // Credits = ["Credits", "Créditos"]
  // Averagetime = ["Average time per call", "Tiempo medio por llamada"]

  // //=====================profile_c end====================================

  // //======================Home==============================
  // Home = ["Home", "Inicio"]
  // PleaseSelectCountry = ["Please SelectCountry ", "Por favor seleccione país"]
  // UsersOnline = ["Users Online", "Usuarios en línea"]

  // // =================home_c=================================
  // GirlsOnline =["Girls Online", "Chicas en línea"]


  //   //  =====================Edit Proflle Page ===========================
  //   editProfileCapitalTxt = ["EDIT PROFILE",   "EDITAR PERFIL"]
  //   nameSurname = ["Name Surname", "Nombre Apellido"]
  //   eMailAddress = ["E-mail Address", "Dirección de correo electrónico"]
  //   Password = ["Password", 'contraseña']
  //   saveChanges = ["Save changes", "Guardar cambios"]
  //   leaveWithoutSaving = ["Leave without saving", "Salir sin guardar"]

  //   // ++++++ Reset Password 
  //   NewPassword = ["New Password", "Nueva contraseña"]
  //   ConfirmPassword = ["Confirm Password", "Confirmar Contraseña"]


  //   //=======================Take photo ============================
  //   takeidphototxt = ["TAKE ID PHOTO", "TOMAR FOTO DE IDENTIFICACIÓN"]
  //   takeVideo = ["TAKING A SELFIE VIDEO", "TOMAR UN VIDEO SELFIE"]
  //   uploadPic = ["UPLOAD ID PICTURE", "CARGAR IMAGEN DE IDENTIFICACIÓN"]

  // ////==================ForgotpassManual==================================

  // //============================EditProfileWorker==============================

  // editProfile = ["Edit Profile", 'Editar Perfil']
  // UPDATE = [ "UPDATE","ACTUALIZAR"]

  // MyBadges = ["My badges", "Mis insignias"]
  // liveChallenges = ["LIVE CHALLENGES"]
  // trophyCabinet = ["TROPHY CABINET"]
  // logOut = ["Log Out"]

  // //==========================search===========================================
  // Search= ["Search", "Buscar"]
  // search1 = [  "Search",  "'Buscar...'"]

  // //=====================Favourite================================
  // Favourite = ["Favourite", "Favorita"]

  // //====================wallet_c=============================================
  // YOUR_CREDITS = ["YOUR CREDITS", "TUS CRÉDITOS"]
  // BUY_CREDITS = ["BUY CREDITS", "COMPRA CREDITOS"]
  // Wallet = ["Wallet", "Billetera"]
  // Payment_historyCap = ["Payment History", "Historial de pagos"]
  // Binance = ["Binance", "Binance"]
  // Bank_Account = ["Bank Account", "Cuenta bancaria"]
  // Withdraw = ["Withdraw", "Retirar"]
  // Enterwithdrawcredit = ["Enter withdraw credit", "Ingresar retirar crédito"]
  // EquivivalentValue = ["Equivalent Value","Valor equivalente"]
  // DONE = ["DONE", "Aceptar"]
  // Withdraw_CREDITS = ["WITHDRAW CREDITS", "RETIRAR CRÉDITOS"]
  // Payment_List = ["Payment List", "Lista de pagos"]
  // Payment_methods = ["Payment methods", "Métodos de pago"]
  // Payment_history = ["Payment history", "Historial de pagos"]
  // Frequent_questions = ["Frequent questions", "Preguntas frecuentes"]
  // Sponsors = ["Sponsor", "Patrocinador"]
  // Sponsorss = ["Sponsors", "Patrocinadores"]
  // Report_sponsor = ["Report sponsor", "Reportar patrocinador"]
  // Settings= ["Settings","Ajustes"]

  // //================Sponser===========================

  // Alert =["Alert","Alerta"]
  // LEAVE = ["LEAVE", "DEJAR"]
  // Pleaseleavecurrentsponsorrequest =["Please leave current sponsor request","Por favor deje la solicitud de patrocinador actual"]
  // YourSponsoris =["Your Sponsor is", "Tu Patrocinador es"]
  // Sponsorshiptime = ["Sponsorship time", "tiempo de patrocinio"]
  // Paymentsreceived= ["Payments received", "pagos recibidos"]
  // Totalmoneyreceived =["Total money received","dinero total recibido"]
  // Usedfrequentpayment =["Used frequent payment","Pago frecuente usado"]
  // NodataFound =["No data Found!","¡Datos no encontrados!" ]
  // REQUESTSPONSOR =["REQUEST SPONSOR","SOLICITAR PATROCINADOR" ]

  // // ===========================Binance details==============================================
  // Binance_Details = ["Binance Details", "Detalles de Binance"]
  // email5 =["Email", "Correo electrónico"]
  // PayID =["Pay ID", "Pagar identificación"]
  // RepeatPayID =["Repeat Pay ID", "Repetir ID de pago"]

  // // ===============================Bank details========================================
  // BankName =["Bank Name","Nombre del banco"]
  // Owner = ["Owner","Propietario"]
  // Identitycard =["Identity card (DNI NUMBER)","Tarjeta de identidad (NÚMERO DNI)"]


  // //===============================PaymentHistory============================================
  // PaymentReceipt =["Payment Receipt", "Recibo de pago"]
  // PaymentRequestDate =["Payment Request Date", "Fecha de solicitud de pago"]
  // Method =["Method", "Método"]
  // PaymentReceiveDate =["Payment Receive Date","Fecha de recepción del pago"]
  // RequestedAmount =["Requested Amount", "Monto requerido"]
  // Inprocess= ["Inprocess","En proceso"]
  // Draft =["Requested Payment","Pago solicitado"]
  // Paid =["Paid", "Pagado"]
  // Requeston =["Request on", "Solicitar en"]
  // ViewReceipt =["View Receipt","Ver recibo"]


  // //===============================Withdraw=screens=====================================================
  // payment_method_to_withdraw = ["Select your payment method to withdraw","Seleccione su método de pago para retirar"]
  // Bank = ["Bank","Banco"]
  // Ac =["A/c","C.A"]

  // //=================================Report screen================================================================
  // Report =["Report","Informe"]
  // EnterSubject =["Enter Subject","Ingresar Asunto"]
  // Enterdescription2 =["Enter description","Introduce la descripción"]
  // submitReport =["Report submitted successfully.","Informe enviado exitosamente."]
  // More =["More","Más"]


  // //================================Payment====================================
  // Payment =["Payment","Pago"]


  // //====================================WithdrawWorker screen==============================================

  // // ===================================ProviderHome screen=========================================
  // ProviderHome =["ProviderHome","ProveedorInicio"]
  // // =============================Notification====================================
  // Notification=["Notification","Notificación"]

  // //=============================TopGirls===================================
  // TopGirls =["Top Girls","Chicas top"]
  // Rightnowthereisnotopgirlavailableinthe=["Right now there is no top girl available in the VidSocial, you want to be one of them, you will have to perform well","En este momento no hay ninguna chica top disponible en VidSocial, si quieres ser una de ellas, tendrás que desempeñarte bien."]

  // // =======================BankAccount screen==================================
  // BankList=["Bank List","Banco Lis"]
  // Bank_And_binance_Accounts = ["Bank and binance accounts","Cuentas bancarias y binance"]
  // SELECT =["SELECT","SELECCIONAR"]


  // //================================IncomingCallScreen========================================



  // //=================================Outgoingcall screen=============================================


  // // =================================AgoraChatying=============================================================
  // Enterusername =["Enter usernam","Introduzca su nombre de usuario"]
  // EnterchatToken =["Enter chatToken","Ingrese al token de chat"]
  // Entertheusernameyouwanttosend=["Enter the username you want to send","Introduce el nombre de usuario que deseas enviar"]
  // Entercontent =["Enter content","Introducir contenido"]

  // // ===================================CallRating Screen==============================================================
  // Howwasthecallwith=["How was the call with","¿Cómo estuvo la llamada con"]
  // Type=["Type...","Escribir..."]
  // Wouldtolikeadd =["Would to like add","Agregar a"]
  // to_your_favourites=["to your favourites?","a tus favoritas?"]
  // Post=["SEND","ENVIAR"] 
  // RatingSendSuccess=["Rating sent successfully.","Calificación enviada exitosamente."]
  // markFavSuccess=["Mark favourite successfully.","Marca favorita con éxito."]


  // // =====================================TotalEarnedCoins Screen=========================================================
  // Congratulations =["Congratulations","Felicidades"]
  // Inthisvideocallyouobtain=["In this video call you obtain","En esta videollamada obtienes"]
  // credits=["credits.","créditos."]
  // UserReport=["USER REPORT","Reportar Usuario"]

  // //================================ReportWorker screen=======================================================
  // Report_against =["Report against","Informe en contra"]

  // // =============================== Video Calling 
  // VideoPause =["Video Paused...","Vídeo en pausa..."]
  // TypeHere =["Type Here...","Escriba aquí..."]

  // // ========================= Incommimg Call Screen ================================
  // VideoCall = ["Video Call", "Videollamada"]

  // // ========================= Outgoing Call Screen ================================
  // Calling = ["Calling", "Llamando"]

  // // ========================= Incommimg Call Screen ================================
  // Call_ended = ["Call ended", "Llamada terminada"]


  //  passChangeCorrecttxt = ["Password changed correctly",  "La contraseña se cambió correctamente"]
  //  PositiveComm = ["Positive comments"]
  //  Comments = ["Comments","Comentarios"]
  //  Ratings = ["Rating","Califica tu llamada"]
  //  Yourcredits= ["Your credits","Tus créditos"]
  //  sixtyfive= ["6500","seis mil quinientos"]
  //  Bank3= ["Bank Account Name"," Nombre de la cuenta bancaria"]

  //  Sponsors_in_country = ["Sponsors in your country","Patrocinadores en tu país"]
  //  Accountnumber =[" Account number", "Número de cuenta"]
  //  Accounttype =[" Account type", "Tipo de cuenta"]
  //  DummyData = ["Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type", "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type"]
  //  verificationwithin = ["Within 24 hours to 72 hours you will receive an email confirmation that you can access your account and work with us.", "En un plazo de 24 a 72 horas, recibirá una confirmación por correo electrónico de que puede acceder a su cuenta y trabajar con nosotros."]
  //  CANCEL = ["CANCEL","CANCELAR"]
  //  RETAKE = ["RETAKE"," VOLVER A TOMAR"]

  //  idphotodonetxt = ["ID Photo done","Foto de identificación hecha"]

  //  videoSelfiedonetxt = ["Video selfie done", "Video selfie hecho"]
  //  selectAccount = ["Please select account", "Por favor seleccione cuenta"]

  // //  YOUR_CREDITS = ["YOUR CREDITS"]
  // //  BUY_CREDITS = ["BUY CREDITS"]
  // //  Withdraw_CREDITS = ["WITHDRAW CREDITS"]
  // //  Credits = ["Credits"]
  // //  Payment_List = ["Payment List"]
  // //  Withdraw = ["Withdraw"]
  // //  Comments = ["Comments"]
  // //  Ratings = ["Rating"]
  // //  Yourcredits= ["Your credits"]
  // //  sixtyfive= ["6500"]
  // //  Bank3= ["Bank Account Name"]

  // //  payment_method_to_withdraw = ["Select your payment method to withdraw"]

  // //  Sponsors_in_country = ["Sponsors in your country"]

  // //  Bank_And_binance_Accounts = ["Bank and binance accounts"]

  // //  Payment_methods = ["Payment methods"]
  // //  Payment_history = ["Payment history"]
  // //  Payment_historyCap = ["Payment History"]
  // //  Frequent_questions = ["Frequent questions"]
  //  Frequent_questions_for_user = ["FAQ's", "Preguntas frecuentes"]
  //  Remaining_Time = ["Remaining Time: ", "Tiempo restante: "]


  //  English = ['English',"Ingles"]
  //  Spanish = ['Spanish',"Español"]
  //  Call_Busy = ["Call is Busy","La llamada está ocupada"]
  //  YouTxt = ["You","Tú"]

  // //  Sponsors = ["Sponsors"]
  // //  Report_sponsor = ["Report sponsor"]
  // //  Binance = ["Binance"]
  // //  Bank_Account = ["Bank Account"]
  // //  Binance_Details = ["Binance Details"]
  // //  Bank = ["Bank"]
  // //  EquivivalentValue = ["Equivalent Value"]

  // //  DummyData = ["Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type"]

  // //  verificationwithin = ["Within 24 hours to 72 hours you will receive an email confirmation that you can access your account and work with us."]

  // //  CANCEL = ["CANCEL"]
  // //  DONE = ["DONE"]
  // //  RETAKE = ["RETAKE"]

  // //  idphotodonetxt = ["ID Photo done"]
  // //  videoSelfiedonetxt = ["Video selfie done"]

  // // ================ Worning Screen =========================
  // Reason = ["Reason","Razón"]
  // WarningDate = ["Warning Date","Fecha de advertencia"]
  // CoinsDeducted = ["Coins Deducted","Monedas deducidas"]
  // Action = ["Action","Acción"]
  // Attachfile = ["Attach file","Adjuntar archivo"]
  // Attachedfile = ['   File Attached',"   Archivo adjunto"]
  // UserOffline = ['User offline',"Usuario desconectado"]
  // ValidEmailadd = ['Please enter valid email address.',"Por favor ingrese una dirección de correo electrónico válida."]




























  //   // //RUPESH CHANGES /////////////////////
  //   //common text this  application 
  //   appName = ["N R T H"]
  //   Grittxt = ['GRIT']
  //   Stamina = ['STAMINA']
  //   Resilence = ["RESlLENCE"]
  //   Logintxt = ['Log in']
  //   Signup = ['Sign Up']
  //   Successfully = ['Successfully']
  //   verifyToken = ['VerifyToken']



  //   // // login  screen
  //   Welcomeback = ['Welcome back! Log in here:']

  //   EmailAddress = ['E-mail Address']
  //   Password = ['Password']
  //   Privacynotice = ['Privacy notice']
  //   Bysigningupyouare = ['By signing up you are agreeing to']
  //   ourtxt = ['our']
  //   Recoverpassword = ['Recover password']
  //   Sendmagiclink = ['Send magic link']
  //   TermsServices = ['Terms & Services ']
  //   and = ['and']
  //   PrivacyPolicy = ['Privacy Policy']

  //   //Sign up screen
  //   Signupandgetmoving = ['Sign up and get moving']
  //   NameSurname = ['Name Surname']
  //   Repeatpassword = ['Repeat password']
  //   LogIn = ['Log In']

  //   // Recover Password Screen
  //   RecoverPasswordHere = ['Recover Password in here:']



  //   // +++++ Shubham Mahajan
  //   // +++++ Challenges configurator
  //   challengeConfigurator = ["CHALLENGE \n CONFIGURATOR"]
  //   beginner = ["BEGINNER"];
  //   strength = ["Strength"];
  //   strengthCapitalTxt = ["STRENGTH"];
  //   cardio = ["Cardio"];
  //   elite = ["ELITE"];
  //   savage = ["SAVAGE"]

  //   // // +++++ Challenges configurator - Strength
  //   setyourfirstexercise = ["Set your first exercise"];
  //   everydayFor = ["Everyday for"];
  //   days = ["Days"];
  //   completingThisActivity = ["Completing this activity \nwill earn you your 1st trophy"];
  //   addExercise = ["Add exercise"];

  //   // // +++++ Challenges configurator - Cardio
  //   every = ["Every"]
  //   for = ["for"]

  //   // // +++++ Exercise List - First One 
  //   exerciseList = ["EXERCISE LIST"]
  //   yourChallenges = ["Your challenges"]
  //   addAnotherChallenge = ["Add another challenge"]
  //   complete = ["Complete"]
  //   setStartingTime = ["Set starting time"]
  //   confirm = ["Confirm"]
  //   removeStartingTime = ["Remove starting time"]

  //   //  +++++ Daily Exercise List  
  //   yourDailyExercise = ["YOUR DAILY EXERCISE"]
  //   TodayIsTheDay = ["Today is the day to take it to the next level"]
  //   todayIsTheDayToTakeIt = ["Today is the day to take it to the next level"]
  //   yourActiveChallenges = ["Your active challenges"]
  //   clickOnTheBadgeToStart = ["Click on the badge to start the challenge, hold to rearrange, swipe left to delete"]
  //   delete = ["Delete"]
  //   editStartingTime = ["Edit starting time"]
  //   areYouSureYouWantToDeleteChallenge = ["Are you sure you want to delete this challenge?"]
  //   youCanAchieveYourBadgeInJust = ["You can achieve your badge in just"]
  //   yesIWantToDelete = ["Yes, I want to delete"]
  //   doNotDelete = ["Do not delete"]

  //   //  ++++++ Proflle Page 




  //   //  ++++++ Start Challenge
  //   startChallenge = ["START CHALLENGE"]
  //   areYouReady = ["ARE YOU READY?"]
  //   startNow = ["Start now"]
  //   startWithoutVideo = ["Start without video"]
  //   nextChallengeCapitalTxt = ["NEXT CHALLENGE:"]
  //   pause = ["Pause"]

  //   // //  ++++++ Start and Record
  //   startingIn = ["Starting in"]
  //   inProgress = ["In progress"]
  //   completeCapitalTxt = ["COMPLETE!"]
  //   addToGallery = ["Add to gallery"]
  //   minutes = ["minutes"]
  //   challengeRecords = ["CHALLENGE RECORDS"]
  //   start = ["Start"]
  //   end = ["End"]
  //   nextChallenge = ["Next challenge"]
  //   readySet = ["Ready, Set,"]
  //   _in = ["in"]
  //   backToChallenges = ["Back to challenges"]
  //   preferences = ["Preferences"]
  //   cancelRecoding = ["Cancel recording"]
  //   countdownTimer = ["Countdown timer"]
  //   defaultCamera = ["Default camera"]
  //   claimYourBadge = ["Claim your badge!"]
  //   youHaveEarnedYourNewBadge = ["YOU HAVE EARNED YOUR NEW BADGE!"]
  //   saveInProfile = ["Save in profile"]


  //   workoutCompletedForToday = ["WORKOUT COMPLETED FOR TODAY!"]
  //   yourAthleteBadgesAreOne = ["Your athlete badges are one step closer again"]
  //   seeYouTomorrow = ["SEE YOU TOMORROW!"]
  //   daysToachieve = ['Days to achieve your badges:']
  //   readyFor = ['Ready for tomorrow!']




  //   // ========================= Account Deactivate ================
  //   AccountDeactivate  = ['Account deactivated','Cuenta desactivada']
  //   AccountDeactivateByAdmin  = ['Your account has been deactivated by Admin.','El administrador ha desactivado su cuenta.']







  //   // ================================= Added By Rupesh Validation =================================
  //   emptyBank = ['Please enter bank name','Por favor ingrese el nombre del banco']
  //   banknameMaxLength = ['Bank name is too long','El nombre del banco es demasiado largo']

  //   emptyOwnername = ['Please enter owner name', 'Por favor ingrese el nombre del propietario']
  //   OwnernameMinLength = ['Owner name is too short', 'El nombre del propietario es demasiado corto']

  //   emptyDinNumber = ['Please enter din number', 'Por favor ingrese el número din']
  //   enterproperdinnumber = [' Please enter vaild DNI number', 'Por favor introduzca el número de DNI válido']

  //   emptyAccountNumber = ['Please enter account number', 'Por favor ingrese el número de cuenta']
  //   enterValidAccountnumber = ['Please enter valid account number', 'Por favor ingrese un número de cuenta válido'
  // ]

  //   emptyAccountType = ['Please enter account type', 'Por favor ingrese el tipo de cuenta'] 

  //   enterValidAccounttype = ['Please enter valid account type',  'Ingrese un tipo de cuenta válido']


  //   // ================================= Login =================================
  //   emptyEmail = ['Please enter email address', 'Por favor ingrese la dirección de correo electrónico']

  //   emailMaxLength = ['Email is too long', "El correo electrónico es demasiado largo"]
  //   validEmail = ['Email address is not correct , Please enter a valid email address.', 'La dirección de correo electrónico no es correcta. Introduzca una dirección de correo electrónico válida.']

  //   emailNotRegistered = ['Entered email address not registered with us.', "'La dirección de correo electrónico introducida no está registrada con nosotros.'"]

  //   // ============================== identification =====================================
  //   emptyIdNumber = ['Please enter identification number',"'Por favor ingrese el número de identificación'"]
  //   emptyIdNumberlength = ['Identification number too short',  'Número de identificación demasiado corto'] 


  //   // ============================== Repeat identification ==============================
  //   emptyrepeatIdNumber = ['Please enter repeat identification number','Por favor ingrese repetir número de identificación']
  //   emptyrepeatIdNumberlength = ['Repeat identification number too short', 'Número de identificación repetido demasiado corto']

  //   repeatIdNumbersame = ['Identification number and repeat identification number must be same','El número de identificación y el número de identificación repetido deben ser los mismos']

  //   // ===================================================================================
  //   emptyMobile=['Please enter a mobile number',"Por favor, introduzca un número de teléfono móvil"]
  //   mobileMaxLength=['Enter a valid mobile number','Por favor, introduzca un número de teléfono móvil']
  //   mobileMinLength=['Enter a valid mobile number','Ingrese un número de móvil válido']
  //   validMobile=['Spaces and special characters not allowed in mobile number','No se permiten espacios ni caracteres especiales en el número de móvil'] 


  //   selectbirthDate=['Please select birth date', 'Por favor seleccione la fecha de nacimiento']


  //   // ================================= Password =================================
  //   emptyPassword = ['Please enter your password', 'Por favor, introduzca su contraseña']

  //   passwordMaxLength = ['Password too long']
  //   passBlank = ['Please enter password.','Contraseña demasiado larga']
  //   passwordMinLength = ['Password cannot be less than 8 characters.', 'La contraseña no puede tener menos de 8 caracteres.']
  //   passMaxLength = ['Password cannot be greater than 17 characters.', 'La contraseña no puede tener más de 17 caracteres.']

  //   caseSensitivePass = ['Password must be case sensitive.','La contraseña debe distinguir entre mayúsculas y minúsculas.']
  //   validPassword = ['Spaces not allowed in password',  'Espacios no permitidos en contraseña']

  //   passFormate = ['Password use atleast 8 characters long, one upper and lower case characters, numeric number and special character.','La contraseña utiliza al menos 8 caracteres, uno en mayúscula y otro en minúscula, un número numérico y un carácter especial.']
  //   cPassBlank = ['Please enter repeat password.','Por favor, introduzca la contraseña repetida.']

  //   cPassCharLess = ['Repeat password cannot be less than 8 characters.', 'La contraseña repetida no puede tener menos de 8 caracteres.']
  //   cPassMaxLength = ['Repeat password cannot be greater than 17 characters.', 'La contraseña repetida no puede tener más de 17 caracteres.']

  //   cPassNotMatch = ['Passowrd and repeat password fields must be equal.', 'Los campos Contraseña y Repetir contraseña deben ser iguales.']
  //   passNotFormate = ['Password must be at least 8 characters long, contain at least one number and special character and have a mixture of uppercase and lowercase letters.', 'La contraseña debe tener al menos 8 caracteres, contener al menos un número y un carácter especial y tener una combinación de letras mayúsculas y minúsculas.']
  //   emailPassNotCorrect = ['Entered email addres or password are not correct, Please try again.', "La dirección de correo electrónico o la contraseña ingresadas no son correctas. Inténtelo de nuevo."]

  //   emailPassNotCorrect1 = ['Entered email address and password are invaild.',  'La dirección de correo electrónico y la contraseña ingresadas no son válidas.']


  //   inCorrectPass = ['Entered password are incorrect, Please Try again', 'La contraseña ingresada es incorrecta, inténtelo nuevamente']

  //   Sign_In_or_Login_error_msg = ['Please enter the above fields', 'Por favor ingrese los campos anteriores']


  //   // ================================= contact us =================================
  //   emptyFullName = ['Please enter full name','Por favor ingrese el nombre completo']
  //   emptyNickName = ['Please enter nick name', 'Por favor ingrese el apodo']

  //   fullNameMinLength = ['Full name is too short', 'El nombre completo es demasiado corto']
  //   fullNameMaxLength = ['Please enter full name between 2 to 32 characters.', 'Por favor ingrese el nombre completo entre 2 y 32 caracteres.']
  //   validName = ['Spaces not allowed in full name', 'Espacios no permitidos en nombre completo'] 

  //   messageSend = ['Message sent successfully ','Mensaje enviado con éxito ']
  //   validMessage = ['Spaces not allowed in message', 'Espacios no permitidos en el mensaje']

  //   ifNumAvailinName = ['Please enter vaild credentials, full name not only numeric', 'Ingrese credenciales válidas, nombre completo, no solo numérico']
  //   emptyName = ['Please enter email address.', 'Por favor, introduzca la dirección de correo electrónico.']
  //   inCorrectEmail = ['Email address is not correct, Please enter valid email address.', 'La dirección de correo electrónico no es correcta. Introduzca una dirección de correo electrónico válida.']

  //   alreadyUsedEmail = ['Entered email address already being in use.', 'La dirección de correo electrónico ingresada ya está en uso.'
  // ]

  //   // ====================================  Pay ID ======================================
  //   emptyPayID = ['Please enter binance pay id', 'Ingrese la identificación de pago de Binance']
  //   minLengthpayId = ["Please enter valid pay id", "Por favor ingrese una identificación de pago válida"
  // ]
  //   EnterAValidPayID = ["Enter a valid pay id", "Ingrese una identificación de pago válida"]
  //   cBinanceMatch = ['Pay id and repeat pay id fields must be equal.', 
  //   'Los campos de identificación de pago y de identificación de pago repetido deben ser iguales.']
  //   // ================================= Level Configuratin =================================

  //   levelNotSelected = ['Please select Type', 'Por favor seleccione Tipo']

  //   excerciseNotSelect = ['Please select excercise ', 'Por favor seleccione ejercicio '
  // ]

  //   // ================================= Add Excercise =================================

  //   chooseExcercise = ['Please choose an exercise.', 'Por favor, elija un ejercicio.']

  //   // ================================= Add another challenge =================================

  //   // addAnotherChallenge = ['Please add another challengee.']

  //   // ================================= Complete =================================

  //   selectChallenge = ['Please select a challengee.',  'Por favor seleccione un desafiado.'] 


  //   // ================================= Edit Profile =================================

  //   emptyProfileImage = ['Please select profile image.','Seleccione la imagen de perfil.'] 

  //   emptyName = ['Please enter your Name Surname.', 'Por favor ingrese su Nombre Apellido.']
  //   nameMaxLength = ['Please enter a full name between 2 to 32 characters.', 'Por favor, introduzca un nombre completo de entre 2 y 32 caracteres.']

  //   nameNumCheck = ['Please enter valid credentials, Your full name cannot only contain numbers.', 'Ingrese credenciales válidas. Su nombre completo no puede contener solo números.']
  //   incorrectEmailAddress = ['Your email address is incorrect, Please enter a valid email address.',  'Su dirección de correo electrónico es incorrecta. Introduzca una dirección de correo electrónico válida.']

  //   emailAlreadyInUse = ['This email address already being in use.',"Esta dirección de correo electrónico ya está en uso."]


  //   // ================================= App logout =================================

  //   logoutPress = ['Are you sure you want to log out?', '¿Estás segura de que quieres cerrar sesión?']

  //   // ================================= Delete Account =================================

  //   deleteAccoutValidation = ['Are you sure you want to delete your account?', '¿Estás seguro de que deseas eliminar tu cuenta?']



  //   legalAge = ['Please check first legal age documentation.', "Por favor, consulte la documentación de primera edad legal."]


  // // ======================================================
  // emptySubject = ['Please enter subject', 'Por favor ingrese el asunto']
  // subjectTooLong = ['Entered subject is too long', 'El asunto ingresado es demasiado largo']
  // emptyDescription = ['Please enter description', 'Por favor ingrese la descripción']
  // plsGiveRate = ['Please give rating.', 'Por favor califica.']

  // // ===============================model language===================================================

  // Holdon=["Hold on!","¡Esperar!"]
  // AreyousureyouwanttoExit= ["Are you sure you want to Exit?",'¿Estás segura de que quieres salir?']
  // No=["No", "No"]
  // Yes1=["Yes","Sí"]
  // Accountisnotverifyplease=["'Account is not verify, please verify first.'", "La cuenta no está verificada, verifíquela primero."]
  // Nowitstimetotakeselfievideo=["Now it's time to take selfie video","Ahora es el momento de tomar un video selfie"]
  // LeaveSponser=["Leave Sponsor","Dejar Patrocinadora"]
  // Youdonthaveanysponsor=["You don't have any sponsor!","¡No tienes ningún patrocinador!"]
  // Tusmonedasestánpuntodeagotarse=["Your coins are about to run out, The  call will be automatically disconnected.","Tus monedas están a punto de agotarse. La llamada se desconectará automáticamente."]
  // Cantsendemptymessage=["Can't send empty message","No se puede enviar un mensaje vacío"]
  // NoSufficientCredit=["No Sufficient Credit","No hay crédito suficiente"]
  // Yourcoinsareabouttorunout=["Your coins are about to run out, The  call will be automatically disconnected.","Tus monedas están a punto de agotarse. La llamada se desconectará automáticamente."]







}
export const Lang_chg = new Language_provider();





