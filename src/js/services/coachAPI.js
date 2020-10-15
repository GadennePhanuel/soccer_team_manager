import Axios from "axios"


function findAllCoach(){
    return Axios
            .get('http://localhost:8000/api/coaches')
            .then(response => response.data['hydra:member'])
}

function deleteCoach(id){
    return Axios
            .delete("http://localhost:8000/api/coaches/" + id)
}

function sendMailToCoach(email, club){
    return Axios
            .post("http://localhost:8000/api/emailCoach",
                {
                    url: 'http://localhost:3000/#/registerUser/',
                    email,
                    club
                }
                )
}

export default {
    findAllCoach,
    deleteCoach,
    sendMailToCoach
}