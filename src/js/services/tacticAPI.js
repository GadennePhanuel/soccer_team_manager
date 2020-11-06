import Axios from "axios"
import { TACTICS_API } from "../../config";


function postTactic(tactic) {
    return Axios.post("http://localhost:8000/api/taxtics", tactic)
}

function putTactic(tactic){
    return Axios
        .put("http://localhost:8000/api/tactic/" + tactic.id,
            {
                type: tactic.type,
                team: tactic.team,
                pos1Id: tactic.pos1,
                pos2Id: tactic.pos2,
                pos3Id: tactic.pos3,
                pos4Id: tactic.pos4,
                pos5Id: tactic.pos5,
                pos6Id: tactic.pos6,
                pos7Id: tactic.pos7,
                pos8Id: tactic.pos8,
                pos9Id: tactic.pos9,
                pos10Id: tactic.pos10,
                pos11Id: tactic.pos11,
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