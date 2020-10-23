import Axios from "axios"
import { TEAMS_API } from "../../config";

function findAllTeams() {
    return Axios
        .get(TEAMS_API)
        .then(response => response.data['hydra:member'])
}

function findTeam(id){
    return Axios
        .get("http://localhost:8000/api/teams/" + id)
}

function postTeam(team) {
    return Axios.post("http://localhost:8000/api/teams", team)
        .then(response => response.data['hydra:member'])
}

function deleteTeam(id){
    return Axios
        .delete("http://localhost:8000/api/teams/" + id)
}

function deleteCoachOnTeam(id) {
    return Axios.put(TEAMS_API + "/" + id,
        { coach: null }
    )
}

function putTeam(teamId, teamLabel, teamCoach){
    console.log("test-Axios");
    return Axios
        .put("http://localhost:8000/api/teams/" + teamId,
            {
                coach: teamCoach,
                label: teamLabel,
            }
        )
        .then(response => response.data['hydra:member'])
}

export default {
    deleteCoachOnTeam,
    postTeam,
    findAllTeams,
    findTeam,
    deleteTeam,
    putTeam
}