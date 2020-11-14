import Axios from "axios"
import { TACTICS_API } from "../../config";


//function postTactic(tacticTeam, tacticType, tacticPos1, tacticPos2, tacticPos3, tacticPos4, tacticPos5, tacticPos6, tacticPos7, tacticPos8, tacticPos9, tacticPos10, tacticPos11) {
function postTactic(tacticTab) {
    return Axios.post(TACTICS_API, tacticTab)
}

//function putTactic(tacticId, tacticTeam, tacticType, tacticPos1, tacticPos2, tacticPos3, tacticPos4, tacticPos5, tacticPos6, tacticPos7, tacticPos8, tacticPos9, tacticPos10, tacticPos11){
function putTactic(tacticId, tacticTab){
    return Axios
        .put(TACTICS_API + "/" + tacticId, tacticTab)
}

function deleteTactic(id){
    return Axios
        .delete("http://localhost:8000/api/tactics/" + id)
}

export default {
    postTactic,
    putTactic,
    deleteTactic
}