import Axios from "axios";
import { API_URL, ENCOUNTERS_API, LOCAL_URL } from "../../config";


function findAllEncounters(){
    return Axios
            .get(ENCOUNTERS_API)
            .then(response => response.data['hydra:member'])
}

function findEncountersById(teamId){
    return Axios.get('http://localhost:8000/api/teams/' + teamId + '/encounters')
}

function deleteEncounter(id){
    return Axios
            .delete(ENCOUNTERS_API + "/" + id)
}

function postEncounter(encounter) {
    return Axios.post("http://localhost:8000/api/encounters", encounter)
       // .then(response => response.data['hydra:member'])
}

export default {
    findAllEncounters,
    deleteEncounter,
    postEncounter,
    findEncountersById
}