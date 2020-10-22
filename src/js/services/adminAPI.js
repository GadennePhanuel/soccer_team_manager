import Axios from "axios";
import { ADMINS_API } from "../../config";


function findAdmin(){
    return Axios
            .get(ADMINS_API)
            .then(response => response.data['hydra:member'])
}

export default {
    findAdmin
}