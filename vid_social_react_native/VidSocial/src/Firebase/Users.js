import Firebase from './firebaseConfig';
import moment from 'moment';
 
// ---------------- To add User For Invitation --------------------
export const AddUser = async (name, email, uid) => {
    try {
        return await Firebase
            .database()
            .ref("users/" + uid)
            .set({
                name: name,
                email: email,
                uuid: uid,
            });
    } catch (error) {
        return error;
    }
}

// -------------- To Update User Data ------------------------------
export const UpdateUserImage = async (image, uid) => {
    try {
        return await Firebase
            .database()
            .ref("users/" + uid)
            .update({
                image:image
            })
    } catch (error) {
        return error;
    }
}
// -------------- To Update User Data ------------------------------
export const ToUpdateToken = async (uid,DeviceToken) => {
    try {
        return await Firebase
            .database()
            .ref("users/" + uid)
            .update({
                tocken:DeviceToken
            })
    } catch (error) {
        return error;
    }
}

// -------------- To Update User Data ------------------------------
export const OnlineStatausUpdate = async (uid,checkTocken) => {
    try {
        return await Firebase
            .database()
            .ref("users/" + uid)
            .update({
                tocken:checkTocken
            })
    } catch (error) {
        return error;
    }
}

// -------------- To Update User Data ------------------------------
export const OfflineStatausUpdate = async (uid) => {
    console.log('i am here in status update');
    try {
        return await Firebase
            .database()
            .ref("users/" + uid)
            .update({
                Onlinestatus:'Offline'
            })
    } catch (error) {
        return error;
    }
}

 

// ------------------ Function For Send Invitation -----------------
export const AddInvitedUser = async (currentUserId, guestUserId,userName,image,isGroup) => {
    var todayDate=moment();
    try {
        return await Firebase.
            database().
            ref('AcceptdFriendList/' + currentUserId)
            .child(guestUserId).
            set({
                sender: currentUserId,
                reciever: guestUserId,
                name: userName,
                image: image,
                inviteStatus: 'Accepted',
                date:todayDate.format('DD-MM'),
                time:todayDate.format('hh:mm A'),
                Onlinestatus:' ',
                isGroup:isGroup
            })
    } catch (error) {
        return error;
    }
}
// ------------------ Function For Receive Invitation -----------------
export const AddInvitedUserReceiver = async (currentUserId,guestUserId,userName,image,isGroup) => {
    var todayDate=moment();
    try {
        return await Firebase.
            database().
            ref('AcceptdFriendList/' + guestUserId)
            .child(currentUserId).
            set({
                sender: guestUserId,
                reciever: currentUserId,
                name: userName,
                image: image,
                inviteStatus: 'Accepted',
                date:todayDate.format('DD-MM'),
                time:todayDate.format('hh:mm A'),
                Onlinestatus:' ',
                isGroup:isGroup
            })
    } catch (error) {
        return error;
    }
}
// ------------------ Function For Receive Invitation -----------------
export const AddInvitedUserReceiver11 = async (currentUserId,guestUserId,userName,isGroup) => {
    var todayDate=moment();
    try {
        return await Firebase.
            database().
            ref('AcceptdFriendList/' + guestUserId)
            .child(currentUserId).
            set({
                sender: guestUserId,
                reciever: currentUserId,
                name: userName,
                date:todayDate.format('DD-MM'),
                time:todayDate.format('hh:mm A'),
                Onlinestatus:' ',
                isGroup:isGroup
            })
    } catch (error) {
        return error;
    }
}


// ------------------ Function For Send Invitation -----------------
export const blockedUser = async (currentUserId, guestUserId,status) => {
    try {
        return await Firebase.
            database().
            ref('blockFriendList/' + currentUserId)
            .child(guestUserId).
            set({
                blockedStatus:status, 
                blockBy:currentUserId
            })
    } catch (error) {
        return error;
    }
}
// ------------------ Function For Receive Invitation -----------------
export const blockedUserReceiver = async (currentUserId,guestUserId,status) => {
    var todayDate=moment();
    try {
        return await Firebase.
            database().
            ref('blockFriendList/' + guestUserId)
            .child(currentUserId).
            set({
                blockedStatus:status,
                blockBy:currentUserId
            })
    } catch (error) {
        return error;
    }
}


