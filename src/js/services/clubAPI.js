import Axios from "axios";
import { CLUBS_API } from "../../config";


function findClub(id) {
    return Axios.get(CLUBS_API + "/" + id)
        .then(response => response.data);
}

function putClub(id, club) {
    return Axios.put(CLUBS_API + "/" + id, club)
}

function postClub(club) {
    return Axios.post(CLUBS_API, club)
}

export default {
    findClub,
    putClub,
    postClub
}