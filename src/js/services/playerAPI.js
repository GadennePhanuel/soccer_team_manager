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

function setTeamToPlayer(player, teamId){
    return Axios.put("http://localhost:8000/api/players/" + player.id, {
            "user": "/api/users/" + player.user.id,
            "team": "/api/teams/" + teamId
            })
}

function fetchPlayerWithoutId(){
    return Axios.get("http://localhost:8000/api/players")
}

function fetchProfilePicture(picture){
    return Axios.get("http://localhost:8000/api/image/" + picture)
}

function uploadNewPicture(bodyFormData){
    return Axios({
                method: 'post',
                url: 'http://localhost:8000/api/upload',
                data: bodyFormData,
                headers: {'Content-Type': 'multipart/form-data' }
                })
}

function setPlayer(player){
    return Axios.put('http://localhost:8000/api/players/' + player.id, {
                height: parseInt(player.height),
                weight: parseInt(player.weight),
                injured: player.injured
            })
}

export default {
    sendMailToPlayer,
    findAllPlayers,
    deletePlayer,
    setTeamToPlayer,
    fetchPlayerWithoutId,
    fetchProfilePicture,
    uploadNewPicture,
    setPlayer
}