import Axios from "axios"

function findAllTeams(){
    return Axios
        .get('http://localhost:8000/api/teams')
        .then(response => response.data['hydra:member'])
}

function postTeam(team) {
    return Axios.post("http://localhost:8000/api/clubs", team)
}

function deleteTeam(id){
    return Axios
        .delete("http://localhost:8000/api/teams/" + id)
}

function deleteCoachOnTeam(id){
    return Axios.put("http://localhost:8000/api/teams/" + id,
            { coach: null }
            )
}

function putTeam(team){
    console.log("test-Axios");
    return Axios
        .put("http://localhost:8000/api/teams/" + team.id,
            {
                club: team.club.id,
                coach: team.coach.id,
                label: team.label,
                category: team.category
            }
        )
}

export default {
    deleteCoachOnTeam,
    postTeam,
    findAllTeams,
    deleteTeam,
    putTeam
}