module.exports = {

    InCommingCallUserLogoutState :3,
    InCommingCallRequest : 2,
    InCommingCallAccept : 1, // When receiver accept call
    InCommingCallReject : 0, // when receiver reject call
    InCommingCallEngaged :-1, // when already in a call
    InCommingCallCancel : -2, //when sender disconnect call
    InCommingVideoCallCancel : -3,
    CallBusy:-9,
    RemoteCallEnded:-10,
    
   
    //Local Call Status Constants
    NO_CALL:-2,
    CALL_ENDED:-1,
    CALL_INITIATED:0,
    CALL_RECEIVED:1,
    CALL_ACCEPTED:2,
    CALL_STARTED:3,
    CALL_RUNNING:4,

    

    
  

}