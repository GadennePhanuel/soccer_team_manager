import Axios from "axios";
import { API_URL, PLAYERS_API, LOCAL_URL, TEAMS_API } from "../../config";

function findAllPlayers() {
    return Axios
        .get(PLAYERS_API)
        .then(response => response.data['hydra:member'])
}

function findPlayer(id) {
    return Axios
        .get(PLAYERS_API + "/" + id)
}


function deletePlayer(id) {
    return Axios
        .delete(PLAYERS_API + "/" + id)
}

function sendMailToPlayer(email, club) {
    return Axios
        .post(API_URL + "emailPlayer",
            {
                url: LOCAL_URL + 'registerUser/',
                email,
                club
            }
        )
}

function setTeamToPlayer(player, teamId) {
    return Axios.put(PLAYERS_API + "/" + player.id, {
        "user": "/api/users/" + player.user.id,
        "team": "/api/teams/" + teamId
    })
}

function fetchPlayerWithoutId() {
    return Axios.get(PLAYERS_API)
}

function fetchProfilePicture(picture) {
    return Axios.get(API_URL + "image/" + picture)
}

function uploadNewPicture(bodyFormData) {
    return Axios({
        method: 'post',
        url: API_URL + 'upload',
        data: bodyFormData,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

function setPlayer(player) {
    return Axios.put(PLAYERS_API + "/" + player.id, {
        height: parseInt(player.height),
        weight: parseInt(player.weight),
        injured: player.injured
    })
}

function findPlayersOfTeamId(teamId) {
    return Axios.get(TEAMS_API + '/' + teamId + '/players')
}

function excludePlayerOfTeam(id) {
    return Axios.put(PLAYERS_API + '/' + id, {
        team: null
    })
}

export default {
    sendMailToPlayer,
    findAllPlayers,
    findPlayer,
    deletePlayer,
    setTeamToPlayer,
    fetchPlayerWithoutId,
    fetchProfilePicture,
    uploadNewPicture,
    setPlayer,
    findPlayersOfTeamId,
    excludePlayerOfTeam
}