import Axios from "axios"
import { TEAMS_API } from "../../config";

function findAllTeams() {
    return Axios
        .get(TEAMS_API)
        .then(response => response.data['hydra:member'])
}

function deleteCoachOnTeam(id) {
    return Axios.put(TEAMS_API + "/" + id,
        { coach: null }
    )
}

export default {
    deleteCoachOnTeam,
    findAllTeams
}