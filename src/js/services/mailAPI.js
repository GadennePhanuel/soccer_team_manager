import Axios from "axios"



function sendMail(email){
    return Axios
            .post("http://localhost:8000/api/sendEmail", {
            email
            })
}

export default {
    sendMail
}