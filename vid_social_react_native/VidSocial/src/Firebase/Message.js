import firebase from './firebaseConfig';
import moment from 'moment';

export const SendMessage = async (currentUserId, guestUserId, msgValue, imgSource, giftName, coin, blockStatus) => {
    var todayDate = moment();
    try {
        return await firebase.
            database().
            ref('messages/' + currentUserId)
            .child(guestUserId).
            push({
                messege: {
                    sender: currentUserId,
                    reciever: guestUserId,
                    msg: msgValue,
                    image: imgSource,
                    giftName: giftName,
                    coin: coin,
                    isGift: blockStatus,
                    date: todayDate.format("YYYY-MM-DD"),
                    time: todayDate.format('hh:mm A'),
                },
            })
    } catch (error) {
        return error;
    }
}
export const RecieveMessage = async (currentUserId, guestUserId, msgValue, imgSource, giftName, coin, blockStatus) => {
    try {
        var todayDate = moment();
        return await firebase.
            database().
            ref('messages/' + guestUserId)
            .child(currentUserId).
            push({
                messege: {
                    sender: currentUserId,
                    reciever: guestUserId,
                    msg: msgValue,
                    image: imgSource,
                    giftName: giftName,
                    coin: coin,
                    isGift: blockStatus,
                    date: todayDate.format("YYYY-MM-DD"),
                    time: todayDate.format('hh:mm A'),
                },
            })
    } catch (error) {
        return error;
    }
}

// ------------------ Function For Send Invitation -----------------
export const SendPauserStatus = async (currentUserId, guestUserId, isVideo) => {
    var todayDate = moment();
    try {
        return await firebase.
            database().
            ref('VideoPause/' + currentUserId)
            .child(guestUserId).
            set({
                pausedBy:currentUserId ,
                pausedTo: guestUserId,
                pauseVideo: isVideo
            })
    } catch (error) {
        return error;
    }
}
// ------------------ Function For Receive Invitation -----------------
export const ReceivePauserStatus = async (currentUserId, guestUserId, isVideo) => {
    var todayDate = moment();
    try {
        return await firebase.
            database().
            ref('VideoPause/' + guestUserId)
            .child(currentUserId).
            set({
                pausedBy: currentUserId,
                pausedTo: guestUserId,
                pauseVideo: isVideo
            })
    } catch (error) {
        return error;
    }
}
// --------------- Clear All data --------------------

export const ClearFireBaseVideoPauseData = async () => {
    var todayDate = moment();
    try {
        return await firebase.
            database().
            ref('VideoPause/').
            set(null)
    } catch (error) {
        return error;
    }
}
// --------------- Clear All data --------------------

export const ClearFireBaseChattingData = async () => {
    var todayDate = moment();
    try {
        return await firebase.
            database().
            ref('messages/').
            set(null)
    } catch (error) {
        return error;
    }
}


