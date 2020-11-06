import Axios from "axios"
import { TRAININGS_API, TRAININGMISSEDS_API } from "../../config";


function findTrainingMissedsOfTrainingId(trainingId) {
    return Axios.get(TRAININGS_API + '/' + trainingId + '/training_misseds')
}

function createTrainingMissed(trainingId, playerId) {
    return Axios.post(TRAININGMISSEDS_API, {
        training: '/api/trainings/' + trainingId,
        player: '/api/players/' + playerId
    })
}

function delTrainingMissedId(trainingMissedId) {
    return Axios.delete(TRAININGMISSEDS_API + '/' + trainingMissedId)
}


export default {
    findTrainingMissedsOfTrainingId,
    createTrainingMissed,
    delTrainingMissedId
}