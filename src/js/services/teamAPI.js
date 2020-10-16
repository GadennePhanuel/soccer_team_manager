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

function findAllTeams(){
    return Axios
            .get("http://localhost:8000/api/teams")
            .then(response => response.data['hydra:member'])
}

export default {
    deleteCoachOnTeam,
<<<<<<< HEAD
    findAllTeams,
    
=======
    findAllTeams
>>>>>>> 1455a634c8d51999595390270daf66a8b44d8ef5
}