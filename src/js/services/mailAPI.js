import Axios from "axios"
import { API_URL } from "../../config";



function sendMail(email){
    return Axios
            .post(API_URL + "sendEmail", {
            email
            })
}

export default {
    sendMail
}