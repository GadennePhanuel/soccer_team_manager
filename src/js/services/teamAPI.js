import Axios from "axios"

function findAllTeams() {
    return Axios
        .get('http://localhost:8000/api/teams')
        .then(response => response.data['hydra:member'])
}

function deleteCoachOnTeam(id) {
    return Axios.put("http://localhost:8000/api/teams/" + id,
        { coach: null }
    )
}

export default {
    deleteCoachOnTeam,
    findAllTeams
}