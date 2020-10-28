import Axios from "axios";
import { API_URL, ENCOUNTERS_API, LOCAL_URL } from "../../config";


function findAllEncounters(){
    return Axios
            .get(ENCOUNTERS_API)
            .then(response => response.data['hydra:member'])
}


function deleteEncounter(id){
    return Axios
            .delete(ENCOUNTERS_API + "/" + id)
}


export default {
    findAllEncounters,
    deleteEncounter,
}