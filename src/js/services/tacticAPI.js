import Axios from "axios"
import { TACTICS_API } from "../../config";


function postTactic(tacticTeam, tacticType, tacticPos1, tacticPos2, tacticPos3, tacticPos4, tacticPos5, tacticPos6, tacticPos7, tacticPos8, tacticPos9, tacticPos10, tacticPos11) {
    return Axios.post(TACTICS_API,
        {
            type: tacticType,
            team: tacticTeam,
            pos1: tacticPos1,
            pos2: tacticPos2,
            pos3: tacticPos3,
            pos4: tacticPos4,
            pos5: tacticPos5,
            pos6: tacticPos6,
            pos7: tacticPos7,
            pos8: tacticPos8,
            pos9: tacticPos9,
            pos10: tacticPos10,
            pos11: tacticPos11,
        }
    )
}

function putTactic(tacticId, tacticTeam, tacticType, tacticPos1, tacticPos2, tacticPos3, tacticPos4, tacticPos5, tacticPos6, tacticPos7, tacticPos8, tacticPos9, tacticPos10, tacticPos11){
    return Axios
        .put("http://localhost:8000/api/tactics/" + tacticId,
            {
                type: tacticType,
                team: tacticTeam,
                pos1: tacticPos1,
                pos2: tacticPos2,
                pos3: tacticPos3,
                pos4: tacticPos4,
                pos5: tacticPos5,
                pos6: tacticPos6,
                pos7: tacticPos7,
                pos8: tacticPos8,
                pos9: tacticPos9,
                pos10: tacticPos10,
                pos11: tacticPos11,
            }
        )
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