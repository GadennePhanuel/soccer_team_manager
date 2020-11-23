import Axios from "axios";
import { ENCOUNTERS_API, TACTICARCH_API } from "../../config";


function postTacticArch(tacticArch) {
    return Axios.post(TACTICARCH_API, tacticArch)
}

function putEncounterTacticArch(encounterID, tacticArchIRI) {
    return Axios.put(ENCOUNTERS_API + '/' + encounterID, tacticArchIRI)
}


export default {
    postTacticArch,
    putEncounterTacticArch
}