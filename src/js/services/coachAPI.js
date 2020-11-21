import Axios from "axios"
import { API_URL, COACHS_API, LOCAL_URL } from "../../config";


function findAllCoach(){
    return Axios
            .get(COACHS_API)
            .then(response => response.data['hydra:member'])
}

function findCoach(id) {
    return Axios
        .get(COACHS_API + "/" + id)
}


function deleteCoach(id){
    return Axios
            .delete(COACHS_API + "/" + id)
}

function sendMailToCoach(email, club){
    return Axios
            .post(API_URL + "emailCoach",
                {
                    url: LOCAL_URL + 'registerUser/',
                    email,
                    club
                }
                )
}

export default {
    findAllCoach,
    findCoach,
    deleteCoach,
    sendMailToCoach
}