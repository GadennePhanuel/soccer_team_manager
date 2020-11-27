import Axios from "axios"
import { TEAMS_API } from "../../config";

function findAllTeams() {
    return Axios
        .get(TEAMS_API)
        .then(response => response.data['hydra:member'])
}

function findTeam(id) {
    return Axios
        .get(TEAMS_API + "/" + id)
}

function postTeam(team) {
    if(team.coach) {team.coach = team.coach["@id"]}
    return Axios.post(TEAMS_API, team)
}

function deleteTeam(id) {
    return Axios
        .delete(TEAMS_API + "/" + id)
}

function deleteCoachOnTeam(id) {
    return Axios.put(TEAMS_API + "/" + id,
        { coach: null }
    )
}

function putTeam(teamId, label, coach) {
    return Axios.put(TEAMS_API + "/" + teamId,{coach: coach,label: label})
}

function findAllTacticsByTeam(id){
    return Axios.get(TEAMS_API + "/" +id+"/tactics")
}

export default {
    deleteCoachOnTeam,
    postTeam,
    findAllTeams,
    findTeam,
    deleteTeam,
    putTeam,
    findAllTacticsByTeam
}