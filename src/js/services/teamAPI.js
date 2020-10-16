import Axios from "axios"

function deleteCoachOnTeam(id){
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
    findAllTeams,
    
}