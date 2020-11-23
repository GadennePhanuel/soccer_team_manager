import Axios from "axios"
import { TACTICS_API } from "../../config";

function findTactic(id) {
    return Axios
        .get(TACTICS_API + "/" + id)
}

function postTactic(tacticTab) {
    return Axios.post(TACTICS_API, tacticTab)
}

function putTactic(tacticId, tacticTab) {
    return Axios
        .put(TACTICS_API + "/" + tacticId, tacticTab)
}

function deleteTactic(id) {
    return Axios
        .delete(TACTICS_API + "/" + id)
}

export default {
    findTactic,
    postTactic,
    putTactic,
    deleteTactic
}