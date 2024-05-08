import axios from "axios";
import { appBaseUrl } from "../Provider/Apicallingprovider/ApiConstants";
import { localStorage } from "../Provider/localStorageProvider";

export async function updateUserStatus(status) {

    var UserDetails = await localStorage.getItemObject("UserData")
    var User_Id = 0;
    if (UserDetails != null) {
        User_Id = UserDetails.id;
    } else {
        User_Id = 0;
    }

    var Token = await localStorage.getItemString("AccessToken")

    // let apiUrl = appBaseUrl.UserOnlineStatus;
    // var postData = JSON.stringify({
    //     user_id: User_Id,
    //     status: status
    // });


    const headers = {
        'Content-Type': 'application/json',
        'Cookie': 'HttpOnly',
        'Authorization': 'Bearer ' + Token,
        'Cookie': 'csrftoken=wNlWuyA1igtBFz2NBXvlG2zcwfdeBcPy'
    };

    // console.log('=======>>', postData);
    // // Make a POST request using Axios
    // console.log(postData, '<<<==========>>>', apiUrl, Token);
    // axios.post(apiUrl, postData, { headers })
    //     .then(async (response) => {
    //         // Handle the successful response
    //         console.log("Online Status Details", response.data);
    //         if (response.data.code == 200) {
    //             console.log('Online status done successfully!');
    //         } else {
    //             global.props.hideLoader();
    //             console.log('Getting Error');
    //         }
    //     })
    //     .catch(error => {
    //         global.props.hideLoader();
    //         console.log('Loginerror---22', error);
    //         // Handle errors
    //     });


    let newapiUrl = appBaseUrl.StatusUpdateLogout;

    var newpostData = JSON.stringify({
        PersonId: User_Id,
        Status: status
    });

    axios.post(newapiUrl, newpostData, { headers })
    .then(async (response) => {
        // Handle the successful response

        if (response.data.code == 200) {
            console.log('Online status done successfully! h');
        }
    })
    .catch(error => {
        global.props.hideLoader();

        // Handle errors
    });
};