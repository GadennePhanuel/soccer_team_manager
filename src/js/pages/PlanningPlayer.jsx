import Axios from 'axios';
import React, { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Calendar from "../components/Calendar";
import AuthContext from '../contexts/AuthContext';
import encounterAPI from '../services/encounterAPI';
import usersAPI from '../services/usersAPI';

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
                    console.log(response.data)
                    setEncounters(response.data['hydra:member'])
                })
                .catch(error => {
                    console.log(error.response)
                })

            //requete pour récupérer tous les trainings de la team du player connecté
            Axios.get("http://localhost:8000/api/teams/" + teamId + "/trainings")
                .then(response => {
                    setTrainings(response.data['hydra:member'])
                })
                .catch(error => {
                    console.log(error.response)
                })
        }

    }, [id, isAuthenticated, teamId])


    const onDateClick = (day) => {
        console.log(day.toLocaleDateString('fr-FR'))

        //définir le comportement au click sur un date du calendrier
    }




    return (
        <div className="wrapper_container PlanningPlayer">
            <Calendar
                customId="calendar_mt30"
                parentCallBack={onDateClick}
                eventsT={trainings}
                eventsE={encounters}
            ></Calendar>
        </div>
    );


}

export default PlanningPlayer;