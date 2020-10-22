import Axios from "axios";


function findAdmin(){
    return Axios
            .get('http://localhost:8000/api/admins')
            .then(response => response.data['hydra:member'])
}

export default {
    findAdmin
}