import Axios from "axios";
import { TEAMS_API, TRAININGS_API } from "../../config";



function findTrainingsById(teamId) {
    return Axios.get(TEAMS_API + '/' + teamId + '/trainings')
}

function createTrainings(training) {
    return Axios.post(TRAININGS_API, training)
}

function putTraining(trainingId, training) {
    return Axios.put(TRAININGS_API + '/' + trainingId, training)
}

function delTraining(trainingId) {
    return Axios.delete(TRAININGS_API + '/' + trainingId)
}



export default {
    findTrainingsById,
    createTrainings,
    putTraining,
    delTraining
}