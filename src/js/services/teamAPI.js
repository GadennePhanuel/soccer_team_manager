import Axios from "axios"

function deleteCoachOnTeam(id){
    return Axios.put("http://localhost:8000/api/teams/" + id,
            { coach: null }
            )
}


export default {
    deleteCoachOnTeam,
    
}