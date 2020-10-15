import Axios from "axios";

function findAllPlayers(){
    return Axios
            .get("http://localhost:8000/api/players")
            .then(response => response.data['hydra:member'])
}

function deletePlayer(id){
    return Axios
            .delete("http://localhost:8000/api/players/" + id)
}

function sendMailToPlayer(email, club) {
    return Axios
        .post("http://localhost:8000/api/emailPlayer",
            {
                url: 'http://localhost:3000/#/registerUser/',
                email,
                club
            }
        )
}

export default {
    sendMailToPlayer,
    findAllPlayers,
    deletePlayer
}