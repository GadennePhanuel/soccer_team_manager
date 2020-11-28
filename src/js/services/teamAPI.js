import Axios from "axios"
import {ADMINS_API, TEAMS_API} from "../../config";

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

function excludeCoachOnAllTeams(coachId) {
    return Axios.patch(ADMINS_API + "/coach/" + coachId + "/excludeOnTeams")
}

function putTeam(teamId, teamLabel, teamCoach) {
    return Axios
        .put(TEAMS_API + "/" + teamId,
            {
                coach: teamCoach,
                label: teamLabel,
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
    findAllTacticsByTeam,
    excludeCoachOnAllTeams
}