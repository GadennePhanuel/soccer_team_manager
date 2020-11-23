import React, { useEffect, useState} from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import playerAPI from "../services/playerAPI";
import encounterAPI from "../services/encounterAPI";
import trainingsAPI from "../services/trainingsAPI";
import "../../scss/pages/DashboardPlayerPage.scss";
import {Link} from "react-router-dom";
import Loader from "react-loader-spinner";

const DashboardPlayerPage = (props) => {
    authAPI.setup();

    const role = usersAPI.checkRole();
    const club = usersAPI.checkClub();
    if (role === 'ROLE_ADMIN') {
        props.history.replace("/dashboardAdmin")
    } else if (role === 'ROLE_COACH') {
        props.history.replace("/dashboardCoach")
    }


    if (club === "new") {
        props.history.replace("/createClub/new")
    }


    const [encounters, setEncounters] = useState([]);
    const [oldEncounters, setOldEncounters] = useState([]);
    const [trainings, setTrainings] = useState([])
    const [team, setTeam] = useState({});
    const[player,setPlayer] = useState ({});
    const [playerId, setPlayerId] = useState('');
    const [loading, setLoading] = useState(false)
    //const [error, setError] = useState('')

    function formattedDate(d) {
        let month = String(d.getMonth() + 1);
        let day = String(d.getDate());
        const year = String(d.getFullYear());
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return `${day}/${month}/${year}`;
    }

    useEffect(() => {
        setLoading(true)
        setPlayerId(usersAPI.findPlayerId());
        let idPlayer = usersAPI.findPlayerId();
        let currentTeamId = usersAPI.findPlayerIdTeamId()
        
        playerAPI.findPlayer(idPlayer)
            .then(response => {
                setPlayer(response.data)
            })
            .catch(error => console.log(error.response));

        if (currentTeamId !== "") {
             teamAPI.findTeam(currentTeamId)
                .then(response => { setTeam(response.data) })
                .catch(error => console.log(error.response));

                trainingsAPI.findTrainingsById(currentTeamId)
                    .then(response => {
                        setTrainings(response.data['hydra:member'])
                        setLoading(false)
                    })
                    .catch(error => {
                        console.log(error.response)
                    })

            encounterAPI.findEncountersById(currentTeamId)
                .then(response => {
                    var encountersArray = [];
                    var oldEncountersArray = [];
                    response.data['hydra:member'].forEach(function (encounter) {
                        let day = new Date()
                        let today = day.setHours(0, 0, 0, 0)

                        let encounterD = new Date(encounter.date)
                        let encounterDay = encounterD.setHours(0, 0, 0, 0)

                        if (today <= encounterDay) {

                            encountersArray.push(encounter)

                        } else {

                            oldEncountersArray.push(encounter)
                        }

                    })
                    setEncounters(encountersArray)
                    setOldEncounters(oldEncountersArray)

                    setLoading(false)
                })

                .catch(error => console.log(error.response));
        } else {
            setLoading(false)
        }
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        , [])

    return (
        
        <div className="DashboardPlayerPage wrapper_container">
            {player.user && !loading &&
                <h1>Bonjour {player.user.firstName}</h1>            
            }
            {loading && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}
            {!loading &&
            <div id="nextEvent">
                <div id="nextEncounter">
                    <h4>Prochain match</h4>
                    {encounters.length > 0 && 
                        <div>
                            <p className="date">{formattedDate(new Date (encounters[0].date))}</p>
                            <Link to={"/player/" + playerId +  "/planning"} className="btn btn-link">
                                <div id="encounter">
                                    <p><strong>{team.label} - {team.category} <span className="vs">VS</span> {encounters[0].labelOpposingTeam} - {encounters[0].categoryOpposingTeam}</strong></p>
                                    
                                </div>
                            </Link>
                        </div>
                    }
                </div>
            </div>
            }
            {!loading &&
            <div className="encounters-left">
                <div id="nextEncounters">
                    <h6>Matchs à venir</h6>
                    {encounters.length > 0 ?
                        encounters.slice(1,6).map(nextEncounter => (
                            <div key={nextEncounter.id}>
                                {(nextEncounter) ?
                                    <div >
                                        <p className="date">{formattedDate(new Date(nextEncounter.date))}</p>
                                        <Link to={"/player/" + playerId +  "/planning"} className="btn btn-link">
                                            <div className="nextEncounters">
                                                <p>{team.label} <span className="vs"> VS </span>   {nextEncounter.labelOpposingTeam}</p>
                                            </div>
                                       </Link>
                                    </div> 
                                    :
                                    <div className="nextEncounters">
                                        <p>Pas de match prévu</p>
                                    </div>
                                }
                                
                            </div>
                        )) :
                        <div className="nextEncounters">
                            <p>Aucun match de prévu</p>
                        </div>

                    }    
                </div>
                <div id="nextTrainings">
                    <h6>Entraînements à venir</h6>
                    {trainings.length > 0 ?
                        trainings.slice(0,4).map(nextTraining => (
                            <div  key={nextTraining.id}>
                                {nextTraining &&
                                <div>
                                    <p className="date">{formattedDate(new Date (trainings[0].date))}</p>
                                    <Link to={"/player/" + playerId +  "/planning"} className="btn btn-link">
                                        <div className="nextTrainings" >
                                            <p><strong>{nextTraining.label}</strong></p>
                                            <p>{
                                                nextTraining.description.length > 70 && 
                                                nextTraining.description.substring(0,70) + "..."
                                                }   
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                                }

                                {!nextTraining &&
                                    <div className="nextTrainings">
                                        <p>Pas d'entraînement prévu</p>
                                    </div>
                                }
                            </div>
                        )) :
                        <div className="nextTrainings">
                            <p>Aucun entraînement prévu</p>
                        </div>

                    }
                </div>
            </div>
        }
        </div>
        
    );
}

export default DashboardPlayerPage;