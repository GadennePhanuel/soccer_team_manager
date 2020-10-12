import Axios from "axios";


function findClub(id) {
    return Axios.get("http://localhost:8000/api/clubs/" + id)
        .then(response => response.data);
}

function putClub(id, club) {
    return Axios.put("http://localhost:8000/api/clubs/" + id, club)
}

function postClub(club) {
    return Axios.post("http://localhost:8000/api/clubs", club)
}

export default {
    findClub,
    putClub,
    postClub
}