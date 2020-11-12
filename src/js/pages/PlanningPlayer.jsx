import React, { useContext, useEffect, useState } from 'react';
import Calendar from "../components/Calendar";
import Modal from '../components/Modal';
import AuthContext from '../contexts/AuthContext';
import encounterAPI from '../services/encounterAPI';
import trainingMissedsAPI from '../services/trainingMissedsAPI';
import trainingsAPI from '../services/trainingsAPI';
import usersAPI from '../services/usersAPI';
import '../../scss/pages/PlanningPlayer.scss'

const PlanningPlayer = (props) => {
    const { isAuthenticated } = useContext(AuthContext);

    //récupération de l'id du player concerné
    const id = props.match.params.id

    const [teamId, setTeamId] = useState('')

    const [trainings, setTrainings] = useState([])
    const [encounters, setEncounters] = useState([])

    useEffect(() => {
        if (isAuthenticated) {
            setTeamId(usersAPI.findPlayerIdTeamId())
        }

        if (teamId !== '') {
            //requete pour récupérer tous les encounters de la team du player connecté
            encounterAPI.findEncountersById(teamId)
                .then(response => {
                    setEncounters(response.data['hydra:member'])
                })
                .catch(error => {
                    console.log(error.response)
                })

            //requete pour récupérer tous les trainings de la team du player connecté
            trainingsAPI.findTrainingsById(teamId)
                .then(response => {
                    setTrainings(response.data['hydra:member'])
                })
                .catch(error => {
                    console.log(error.response)
                })
        }

    }, [id, isAuthenticated, teamId])


    const [show, setShow] = useState(false)

    const showModal = () => {
        setShow(true)
    }

    const hideModal = () => {
        setShow(false)
    }
    const [titleModal, setTitleModal] = useState('')

    const [currentDate, setCurrentDate] = useState('')

    const [trainingPlanned, setTrainingPlanned] = useState(Boolean)
    const [currentTrainingPlannedId, setCurrentTrainingPlannedId] = useState('')
    const [currentTrainingMissedId, setCurrentTrainingMissedId] = useState('')
    const [training, setTraining] = useState({})
    const [absence, setAbsence] = useState(Boolean)

    const [encounterPlanned, setEncounterPlanned] = useState(Boolean)
    const [encounter, setEncounter] = useState({})

    const [dateNotValid, setDateNotValid] = useState(true)


    function checkTrainingOfDayClick(day) {
        day = new Date(day.toLocaleDateString("en-US"))
        day.setHours(0, 0, 0, 0)
        var today = new Date()
        today.setHours(0, 0, 0, 0)

        //si la date est inférieur a la date du jour on conditionne l'affichage de la modal
        if (day < today) {
            setDateNotValid(true)
        } else {
            setDateNotValid(false)
        }

        trainingsAPI.findTrainingsById(teamId)
            .then(response => {
                setTrainings(response.data['hydra:member'])
                let trainingsTmp = response.data['hydra:member']
                //parcourir le tableau des trainings, si un training est prévu a la date cliqué on set le training trouvé et on affiche les infos dans la fenetre modale
                //et on passe setTrainingPlanned(true)
                for (var i = 0; i < trainingsTmp.length; i++) {
                    var trainingDate = new Date(trainings[i].date)
                    trainingDate.setHours(0, 0, 0, 0)
                    if (trainingDate.toLocaleDateString('fr-FR') === day.toLocaleDateString('fr-FR')) {
                        setTraining(trainingsTmp[i])
                        //on parcours les trainingMisseds du training retenu. SI l'id du player connecté y est on setAbsence(true)
                        for (var j = 0; j < trainingsTmp[i].trainingMisseds.length; j++) {
                            if (trainingsTmp[i].trainingMisseds[j].player.id === parseInt(id, 10)) {
                                setAbsence(true)
                                setCurrentTrainingMissedId(trainingsTmp[i].trainingMisseds[j].id)
                                break
                            }
                        }
                        setTrainingPlanned(true)
                        setCurrentTrainingPlannedId(trainingsTmp[i].id)
                    }
                }
            })
            .catch(error => {
                console.log(error.response)
            })

    }

    function checkEncounterOfDayClick(day) {
        //parcourir le tableau des encounters, si un match est prévu a la date cliqué on set encounter trouvé et on affiche les infos dans la fenetre modale
        //et on passe setEncounterPlanned(true)
        for (var i = 0; i < encounters.length; i++) {
            if (new Date(encounters[i].date).toLocaleDateString('fr-FR') === day.toLocaleDateString('fr-FR')) {
                setEncounter(encounters[i])
                setEncounterPlanned(true)
                break
            }
        }

    }


    const handleChangeAbsence = (event) => {
        let value = event.currentTarget.value
        if (value && typeof value === "string") {
            if (value === "true") {
                setAbsence(false)
                //envoie requete en BDD pour supprimer le trainingMissed du player connecté
                trainingMissedsAPI.delTrainingMissedId(currentTrainingMissedId)
                    .then(response => {
                        console.log(response.data)

                        checkTrainingOfDayClick(currentDate)

                    })
                    .catch(error => {
                        setAbsence(true)
                        console.log(error.response)
                    })
            }
            if (value === "false") {
                setAbsence(true)
                //envoie requete en BDD pour créer le trainingMissed du player connecté
                trainingMissedsAPI.createTrainingMissed(currentTrainingPlannedId, id)
                    .then(response => {
                        checkTrainingOfDayClick(currentDate)
                    })
                    .catch(error => {
                        console.log(error.response)
                        setAbsence(false)
                    })
            }
        }
    }



    //définir le comportement au click sur un date du calendrier
    const onDateClick = (day) => {
        setCurrentDate(day)
        setTitleModal('Détail du ' + day.toLocaleDateString('fr-FR'))
        setEncounterPlanned(false)
        setAbsence(false)
        setTrainingPlanned(false)
        setCurrentTrainingPlannedId('')

        checkTrainingOfDayClick(day)

        checkEncounterOfDayClick(day)

        showModal()
    }




    return (
        <div className="wrapper_container PlanningPlayer">
            <Calendar
                customId="calendar_mt30"
                parentCallBack={onDateClick}
                eventsT={trainings}
                eventsE={encounters}
            ></Calendar>

            <Modal
                show={show}
                handleClose={hideModal}
                title={titleModal}
            >
                {(!trainingPlanned && !encounterPlanned) && (
                    <div>
                        Aucun événements prévus...
                    </div>
                )}
                {trainingPlanned && (
                    <div>
                        <h5>Entrainement</h5>
                        <p>{training.team.label + ' ' + training.team.category + ' : ' + training.label}</p>
                        <p>{training.description}</p>
                        <div className="select-div">
                            <div>
                                {!dateNotValid && (
                                    <div>
                                        <p>Présence :</p>
                                        <div>
                                            <input type="radio" name="injured" id="Oui" value={true} checked={absence === false} onChange={handleChangeAbsence} />
                                            <label htmlFor="Oui">Oui</label>
                                        </div>
                                        <div>
                                            <input type="radio" name="injured" id="Non" value={false} checked={absence === true} onChange={handleChangeAbsence} />
                                            <label htmlFor="Non">Non</label>
                                        </div>

                                    </div>
                                )}
                                {dateNotValid && (
                                    <div>
                                        <p className="infosAbs">Vous avez été {absence ? 'absent' : 'présent'} à cet entrainement</p>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}
                {encounterPlanned && (
                    <div>
                        <h5>Match</h5>
                        <p>Adversaire: {encounter.labelOpposingTeam + ' ' + encounter.categoryOpposingTeam}</p>
                    </div>
                )}

            </Modal>
        </div>
    );


}

export default PlanningPlayer;