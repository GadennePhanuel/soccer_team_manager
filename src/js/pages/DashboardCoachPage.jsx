import React, { useEffect, useState, useContext } from "react";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import encounterAPI from "../services/encounterAPI";
import trainingsAPI from "../services/trainingsAPI";
import TeamContext from "../contexts/TeamContext";
import {Link} from "react-router-dom";
import Loader from "react-loader-spinner";
import "../../scss/pages/DashboardCoachPage.scss";

const DashboardCoachPage = (props) => {
    authAPI.setup();


    const role = usersAPI.checkRole();
    const club = usersAPI.checkClub();
    if (role === 'ROLE_ADMIN') {
        props.history.replace("/dashboardAdmin")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }


    if (club === "new") {
        props.history.replace("/createClub/new")
    }


    const { currentTeamId } = useContext(TeamContext);


    const [encounters, setEncounters] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [team, setTeam] = useState({});
    const [oldEncountersReverse, setOldEncountersReverse] = useState([]);
    const[coach,setCoach] = useState ({});
    const [loading, setLoading] = useState(false)
    //const [error, setError] = useState('');

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

        if (currentTeamId !== "") {

            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data) 
                    setCoach(response.data.coach)
                })
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
                    setOldEncountersReverse(oldEncountersArray.reverse())
                    setLoading(false)
                })

                .catch(error => console.log(error.response));
        } else {
            setLoading(false)
        }
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        , [currentTeamId])
    return (
        <div className="DashboardCoachPage wrapper_container">
            <p>{console.log(oldEncountersReverse)}</p>
            {coach.user && !loading &&
                <h1>Bonjour {coach.user.firstName}</h1>            
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
                            <Link to={"/encountersCoach"} className="btn btn-link">
                                <div id="encounter">
                                    <p><strong>{team.label} - {team.category} <span className="vs">VS</span> {encounters[0].labelOpposingTeam} - {encounters[0].categoryOpposingTeam}</strong></p>
                                    
                                </div>
                            </Link>
                        </div>
                    }
                </div>
                <div id="nextTraining">
                    <h4>Prochain entraînement</h4>
                    {trainings.length > 0 &&
                        <div>
                            <p className="date">{formattedDate(new Date (trainings[0].date))}</p>
                            <Link to={"/trainings"} className="btn btn-link">
                            <div className="nextTrainings" >
                                <p><strong>{trainings[0].label}</strong></p>
                                <p>{
                                    trainings[0].description.length > 70 && 
                                    trainings[0].description.substring(0,70) + "..."
                                    }   
                                </p>
                            </div>
                            </Link>
                        </div>
                    }
                </div>
            </div>
            }
            {!loading &&
                <div id="oldEncounters">
                    <h4>Derniers matchs</h4>
                    {oldEncountersReverse.length > 0 ?
                        oldEncountersReverse.slice(0,5).map(oldEncounter => (
                            <div key={oldEncounter.id}>
                                {(oldEncounter) ?
                                    <div >
                                        <p className="date">{formattedDate(new Date(oldEncounter.date))}</p>
                                        <Link to={"/encountersCoach"} className="btn btn-link">
                                            <div className="oldEncounters">
                                                <p>{team.label} <span className="vs"> VS </span>   {oldEncounter.labelOpposingTeam}</p>
                                                {(oldEncounter.home && oldEncounter.visitor) &&
                                                    <p>{oldEncounter.home} - {oldEncounter.visitor}</p>
                                                }

                                                {(!oldEncounter.visitor || !oldEncounter.home) &&
                                                    <p>Pas de score attribué</p>
                                                }
                                            </div>
                                       </Link>
                                    </div> 
                                    :
                                    <div className="oldEncounters">
                                        <p>Pas de match passé</p>
                                    </div>
                                }
                                
                            </div>
                        )) :
                        <div className="nextEncounters">
                            <p>Aucun match passé</p>
                        </div>

                    }    
                </div>
            }
        </div>
    );
}

export default DashboardCoachPage;