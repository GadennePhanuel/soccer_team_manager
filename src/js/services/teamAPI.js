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
    // .then(response => response.data['hydra:member'])
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

function putTeam(team) {
    console.log("teamAPI")
    console.log(team)
    return Axios
        .put(TEAMS_API + "/" + team.id,
            {
                coach: team.coach,
                label: team.label,
            }
        )
    //.then(response => response.data['hydra:member'])
}

function findAllTacticsByTeam(id){
    return Axios.get(TEAMS_API + "/" +id+"/tactics")
        .then(response => response.data['hydra:member'])
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