import React, { useContext, useEffect, useState } from "react";
import TeamContext from '../contexts/TeamContext';
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
import Field from "../components/forms/Field";
import Textarea from "../components/forms/Textarea";
import '../../scss/pages/TrainingsPage.scss';
import trainingsAPI from '../services/trainingsAPI';
import playerAPI from "../services/playerAPI";
import trainingMissedsAPI from "../services/trainingMissedsAPI"
import Loader from "react-loader-spinner";
import CurrentUser from "../components/CurrentUser";
import notification from '../services/notification'
import usersAPI from "../services/usersAPI";

const TrainingsPage = (props) => {
    const { currentTeamId } = useContext(TeamContext)

    const [trainings, setTrainings] = useState([])
    const [players, setPlayers] = useState([])
    const [playersMisseds, setPlayersMisseds] = useState([])
    const [refreshKey, setRefershKey] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)

    useEffect(() => {
        //série de controle, est-ce bien un Coach de connecté?
        let role = usersAPI.checkRole()
        if (role === "ROLE_ADMIN") {
            props.history.replace("/dashboardAdmin")
        } else if (role === "ROLE_PLAYER") {
            props.history.replace("/dashboardPlayer")
        }

        setLoading(true)
        //au chargement de la page on récupére l'id de la currentTeam selectionné
        if (currentTeamId !== '') {
            // on charge tous les entrainements la concernant
            // !!!! -> la tableau trainings doit ressembler à ça:  trainings = [ {training.date, training.id ...}, {training.date, training.id ...}, ....]
            trainingsAPI.findTrainingsById(currentTeamId)
                .then(response => {
                    setTrainings(response.data['hydra:member'])
                    setLoading(false)
                })
                .catch(error => {
                    console.log(error.response)
                })


        } else {
            setLoading(false)
        }
    }, [currentTeamId, props.history, refreshKey])


    const [show, setShow] = useState(false)

    const showModal = () => {
        setShow(true)
    }

    const hideModal = () => {
        setShow(false)
    }

    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setTraining({ ...training, [name]: value });
    };

    const [titleModal, setTitleModal] = useState('')
    const [newer, setNewer] = useState(true)

    const [training, setTraining] = useState({
        team: "",
        date: "",
        label: "",
        description: ""
    })
    const [errors, setErrors] = useState({
        label: "",
        description: ""
    })
    const [currentTrainingId, setCurrentTrainingId] = useState('')

    const [dateNotValid, setDateNotValid] = useState(true)

    const onDateClick = (day) => {
        setLoading2(true)
        //par defaut dateNotValid = true
        setDateNotValid(true)

        var today = new Date()
        today.setHours(0, 0, 0, 0)

        day = new Date(day.toLocaleDateString("en-US"))
        day.setHours(0, 0, 0, 0)


        //si la date est inférieur a la date du jour on conditionne l'affichage de la modal
        if (day < today) {
            setDateNotValid(true)
        } else {
            setDateNotValid(false)
        }

        //parcours trainings, si un item training correspond a la date cliqué  on set training avec celui-ci trouvé & on change title avec "Modifier l'entrainement"
        setTraining({
            ...training,
            team: "/api/teams/" + currentTeamId,
            date: day.toLocaleDateString('fr-CA'),
            label: "",
            description: "",
        })
        setCurrentTrainingId('')
        setTitleModal('Ajouter un entrainement au ' + day.toLocaleDateString('fr-FR'))
        setNewer(true)
        setErrors('');
        for (var i = 0; i < trainings.length; i++) {
            var trainingDate = new Date(trainings[i].date)
            trainingDate.setHours(0, 0, 0, 0)
            if (trainingDate.toLocaleDateString('fr-FR') === day.toLocaleDateString('fr-FR')) {
                setLoading2(true)
                setTraining({
                    ...training,
                    team: "/api/teams/" + currentTeamId,
                    date: day.toLocaleDateString('fr-CA'),
                    label: trainings[i].label,
                    description: trainings[i].description,
                })
                setCurrentTrainingId(trainings[i].id)
                setTitleModal('Editer l\'entrainement du ' + day.toLocaleDateString('fr-FR'))
                setNewer(false)
                let trainId = trainings[i].id
                //on charge aussi la liste de tous les joureurs de la team courante
                playerAPI.findPlayersOfTeamId(currentTeamId)
                    .then(response => {
                        let playerTmp = response.data['hydra:member']


                        //on peux charger la liste des absents de cette entrainement
                        trainingMissedsAPI.findTrainingMissedsOfTrainingId(trainId)
                            .then(response => {
                                setPlayersMisseds(response.data['hydra:member'])
                                //crée un tableau
                                let copyPlayers = [...playerTmp]
                                response.data['hydra:member'].forEach((playersMissedsItem) => {
                                    //console.log("test 1: " + playersMissedsItem.player.id)
                                    //parcours ma copie du tableau player
                                    playerTmp.forEach(player => {
                                        //et si mon player.id === playersMissedsItem.player.id alors je le dégage du tableau
                                        if (player.id === playersMissedsItem.player.id) {
                                            var index = copyPlayers.indexOf(player)
                                            if (index >= 0) {
                                                copyPlayers.splice(index, 1)
                                            }
                                        }
                                    })
                                })
                                setPlayers(copyPlayers)
                                setLoading2(false)
                            })
                            .catch(error => {
                                console.log(error.response)
                            })
                    })
                    .catch(error => {
                        console.log(error.response)
                    })
                break;
            }
            setLoading2(false)
        }
        showModal()
        if (day >= today) {
            if (document.getElementById('formTraining')) {
                document.getElementById('formTraining').hidden = false
                if (document.getElementById('abs_pres')) {
                    if (document.getElementById('abs_pres').hidden === false) {
                        document.getElementById('abs_pres').hidden = true
                    }
                }
            }
        }
        if (day < today) {
            setTitleModal('Evénement du ' + day.toLocaleDateString('fr-FR'))
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setLoading2(true)
        //si newer == true ---> requete en POST pour création d'un nouveau training
        if (newer === true) {
            trainingsAPI.createTrainings(training)
                .then(response => {
                    //flash success
                    notification.successNotif("L'entrainement a bien été créé")
                    //vider les message d'erreur eventuels
                    setErrors('');
                    //fermer la fenetre modal
                    hideModal()
                    setRefershKey(refreshKey + 1)
                })
                .catch(error => {
                    notification.errorNotif("Erreur dans le formulaire")
                    //si echec ---> affichage des violations dans le formulaire
                    const violations = error.response.data.violations;
                    const apiErrors = {};
                    if (violations) {
                        violations.forEach((violation) => {
                            apiErrors[violation.propertyPath] = violation.message;
                        });
                    }
                    setErrors(apiErrors);
                    setLoading2(false)
                })
        } else {    //si newer == false ---->requete en PUT  pour modif training existant au jour selectionné
            trainingsAPI.putTraining(currentTrainingId, training)
                .then(response => {
                    //si réussite ---> refaire la requete http du useEffect pour mettre a jour le tableau trainings
                    trainingsAPI.findTrainingsById(currentTeamId)
                        .then(response => {
                            setTrainings(response.data['hydra:member'])
                        })
                        .catch(error => {
                            console.log(error.response)
                        })
                    //flash success
                    notification.successNotif("L'entrainement a bien été modifié")
                    //vider les message d'erreur eventuels
                    setErrors('');
                    //fermer la fenetre modal
                    hideModal()
                })
                .catch(error => {
                    notification.errorNotif("Erreur dans le formulaire")
                    //si echec ---> affichage des violations dans le formulaire
                    const violations = error.response.data.violations;
                    const apiErrors = {};
                    if (violations) {
                        violations.forEach((violation) => {
                            apiErrors[violation.propertyPath] = violation.message;
                        });
                    }
                    setErrors(apiErrors);
                    setLoading2(false)
                })
        }








    }

    const handleDelete = (trainingId) => {
        setLoading2(true)
        //copie du tableau trainings
        const originalTrainings = [...trainings]
        //retirer du tableau trainings le training selectionné
        setTrainings(trainings.filter((trainingItem) => trainingItem.id !== trainingId))
        //requete DEL pour le dégager de la BDD
        trainingsAPI.delTraining(trainingId)
            .then(response => {
                //si réussite --> falsh success
                notification.successNotif("L'entrainement a bien été supprimé")
                hideModal()
            })
            .catch(error => {
                //en cas d'echec remettre le tableau trainings comme avant
                notification.errorNotif("Une erreur est survenue")
                setTrainings(originalTrainings)
            })
    }


    const handleAbsence = (playerId, trainingId) => {
        setLoading3(true)
        //on veut créer un trainingMisseds
        trainingMissedsAPI.createTrainingMissed(trainingId, playerId)
            .then(response => {
                trainingMissedsAPI.findTrainingMissedsOfTrainingId(trainingId)
                    .then(response => {
                        setPlayersMisseds(response.data['hydra:member'])

                        response.data['hydra:member'].forEach((playersMissedsItem) => {
                            setPlayers(players.filter((playerItem) => playerItem.id !== playersMissedsItem.player.id))
                        })
                        setLoading3(false)
                    })
                    .catch(error => {
                        notification.errorNotif("Une erreur est survenue")
                    })
            })
            .catch(error => {
                notification.errorNotif("Une erreur est survenue")
            })
    }

    const handlePresent = (trainingMissedId, trainingId) => {
        setLoading3(true)
        trainingMissedsAPI.delTrainingMissedId(trainingMissedId)
            .then(response => {
                playerAPI.findPlayersOfTeamId(currentTeamId)
                    .then(response => {
                        let playerTmp = response.data['hydra:member']
                        //on peux charger la liste des absents de cette entrainement
                        trainingMissedsAPI.findTrainingMissedsOfTrainingId(trainingId)
                            .then(response => {
                                setPlayersMisseds(response.data['hydra:member'])
                                //crée un tableau
                                let copyPlayers = [...playerTmp]
                                response.data['hydra:member'].forEach((playersMissedsItem) => {
                                    //console.log("test 1: " + playersMissedsItem.player.id)
                                    //parcours ma copie du tableau player
                                    playerTmp.forEach(player => {
                                        //et si mon player.id === playersMissedsItem.player.id alors je le dégage du tableau
                                        if (player.id === playersMissedsItem.player.id) {
                                            var index = copyPlayers.indexOf(player)
                                            if (index >= 0) {
                                                copyPlayers.splice(index, 1)
                                            }
                                        }
                                    })
                                })
                                setPlayers(copyPlayers)
                                setLoading3(false)
                            })
                            .catch(error => {
                                notification.errorNotif("Une erreur est survenue")
                            })
                    })
                    .catch(error => {
                        notification.errorNotif("Une erreur est survenue")
                    })
            })
            .catch(error => {
                notification.errorNotif("Une erreur est survenue")
            })
    }

    const handleManagement = () => {
        if (document.getElementById('formTraining').hidden === true) {
            document.getElementById('abs_pres').hidden = true
            document.getElementById('formTraining').hidden = false
        } else if (document.getElementById('formTraining').hidden === false) {
            document.getElementById('abs_pres').hidden = false
            document.getElementById('formTraining').hidden = true
        }
    }

    return (
        <div className="wrapper_container TrainingsPage">
            <CurrentUser />
            {loading && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}
            {!loading && (

                <Calendar
                    parentCallBack={onDateClick}
                    eventsT={trainings}
                >
                </Calendar>
            )}

            <Modal
                show={show}
                handleClose={hideModal}
                title={titleModal}
            >
                {loading2 && (
                    <div className="LoaderModal">
                        <Loader type="Grid" height="100" width="100" color="LightGray" />
                    </div>
                )}
                {/* si la date selectionnée est inférieur a la date du jour */}
                {(dateNotValid && !newer && !loading2) && (
                    <div>
                        <div>
                            <h5>{training.label}</h5>
                            <p>{training.description}</p>
                        </div>
                        <div className="invalidDate">
                            <h5>Absents</h5>
                            {playersMisseds.map((playerMissed, index) => (
                                <p key={index} type="button"> {playerMissed.player.user.lastName + ' ' + playerMissed.player.user.firstName} </p>
                            ))}
                        </div>
                    </div>
                )}
                {(dateNotValid && !loading2) && (
                    <div className='note'>
                        <p>Note : Vous ne pouvez pas créer ou modifier un événement à une date ultérieur a aujourd'hui</p>
                    </div>
                )}


                {/* si la date selectionné est supérieur ou egale a la date du jour */}
                {(!dateNotValid && !loading2) && (

                    <form onSubmit={handleSubmit} id="formTraining">
                        <Field
                            name="label"
                            label="Titre"
                            placeholder="Titre de l'entrainement..."
                            value={training.label}
                            onChange={handleChange}
                            error={errors.label}
                        ></Field>
                        <Textarea
                            name="description"
                            label="Description"
                            placeholder="Programme de l'entrainement..."
                            value={training.description}
                            onChange={handleChange}
                            error={errors.description}
                        ></Textarea>
                        <div className="form-group submit-btn">
                            <button type="submit" className="btn btn-primary ">
                                {newer ? 'Créer' : 'Modifier'}
                            </button>
                            {!newer && (
                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(currentTrainingId)}>
                                    Supprimer
                                </button>
                            )}
                        </div>
                    </form>
                )}
                {(!newer && !dateNotValid && !loading2) && (
                    <div className="absence-div">
                        <button type="button" className="btn btn-secondary btn-absence" onClick={handleManagement}>Gérer les absences</button>
                        <div className="col_abs_pres" id="abs_pres" hidden>
                            {loading3 && (
                                <div className="LoaderModal">
                                    <Loader type="Puff" width="100" height="100" color="LightGray" />
                                </div>
                            )}
                            {!loading3 && (
                                <div className="present">
                                    <h5>Présent</h5>
                                    {players.map((player, index) => (
                                        <button key={index} type="button" onClick={() => handleAbsence(player.id, currentTrainingId)} className="btn-abs-pres">
                                            {player.user.lastName + ' ' + player.user.firstName}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!loading3 && (
                                <div className="absent">
                                    <h5>Absents</h5>
                                    {playersMisseds.map((playerMissed, index) => (
                                        <button key={index} type="button" onClick={() => handlePresent(playerMissed.id, currentTrainingId)} className="btn-abs-pres">
                                            {playerMissed.player.user.lastName + ' ' + playerMissed.player.user.firstName}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>


        </div>
    );
}

export default TrainingsPage;