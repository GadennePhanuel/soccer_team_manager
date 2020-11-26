import React, { useEffect, useState } from "react";
import encounterAPI from "../services/encounterAPI";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import coachAPI from '../services/coachAPI';
import adminAPI from '../services/adminAPI';
import clubAPI from '../services/clubAPI';
import Field from '../components/forms/Field';
import {Link} from "react-router-dom";
import Loader from "react-loader-spinner";
import playerAPI from "../services/playerAPI";
import teamAPI from "../services/teamAPI";
import "../../scss/pages/DashboardAdminPage.scss";

const DashboardAdminPage = (props) => {
    authAPI.setup();
    // si role != ROLE_ADMIN -> redirection vers le dashboard qui lui correspond
    const role = usersAPI.checkRole();
    if (role === 'ROLE_COACH') {
        props.history.replace("/dashboardCoach")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }
    //si c'est bien un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const clubN = usersAPI.checkClub();
    if (clubN === "new") {
        props.history.replace("/createClub/new")
    }

    const [coaches, setCoaches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [encounters, setEncounters] = useState([]);
    const [adminName, setAdminName] = useState("");
    const [ id, setId ] = useState("");
    const [club, setClub] = useState({
        label: ""
    });

    const [errors, setErrors] = useState({
         label: ""
     });

    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false)

    const handleChange = (event) => {
        const value = event.currentTarget.value;
        const name = event.currentTarget.name;

        setClub({ ...club, [name]: value });
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(club)
        setLoading2(true)
        try {
            await clubAPI.putClub(id, club)
                setLoading2(false)
                setErrors('')
            }catch (error) {
                console.log(error.response)
                const { violations } = error.response.data;
                const apiErrors = [''];
                if (violations) {
                    violations.forEach((violation) => {
                        apiErrors[violation.propertyPath] = violation.message;
                    });
                    setErrors(apiErrors);
            }
        }
    }



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
        adminAPI.findAdmin()
        .then(response => {
            setAdminName(response[0].user.firstName)
            setId(response[0].user.club.id)
            setClub(response[0].user.club)
        })

        coachAPI.findAllCoach()
        .then(response => {
            setCoaches(response)
            setLoading(false)
            setLoading2(false)
        })

        playerAPI.findAllPlayers()
        .then(response => {
            setPlayers(response)
            setLoading(false)
            setLoading2(false)
        })

        teamAPI.findAllTeams()
        .then(response => {
            setTeams(response)
            setLoading(false)
            setLoading2(false)
        })

        encounterAPI.findAllEncounters()
            .then(response => {
                var encountersArray = [];
                response.forEach(function (encounter) {
                    let day = new Date()
                    let today = day.setHours(0, 0, 0, 0)

                    let encounterD = new Date(encounter.date)
                    let encounterDay = encounterD.setHours(0, 0, 0, 0)


                    if (today <= encounterDay) {

                        encountersArray.push(encounter)

                    }
                })
                    setEncounters(encountersArray)
                    setLoading(false)
                
            })
            .catch(error => console.log(error.response));

    }, [])



    return (
        <div className= "DashboardAdminPage wrapper_container">
             {loading && (
                    <div className="bigLoader">
                        <Loader type="Circles" height="200" width="200" color="LightGray" />
                    </div>
                )}
            <h1>Bonjour {adminName}</h1>
            <div>
                {!loading && (
                    <form onSubmit={handleSubmit} className='formClub'>
                        <fieldset>
                            <legend>Edition du club</legend>
                            <Field
                                name="label"
                                label="Nom du club"
                                value={club.label}
                                placeholder="Nom du club..."
                                error={errors.label}
                                onChange={handleChange}
                            >
                            </Field>
                            <div id='center'>
                                {!loading2 && (
                                    <button type="submit" className="btn btn-primary">
                                        Enregistrer
                                    </button>
                                )}
                                {loading2 && (
                                    <div className="LoaderModal">
                                        <Loader type="ThreeDots" height="20" width="508" color="LightGray" />
                                    </div>
                                )}
                            </div>
                        </fieldset>
                    </form>
                )}
        </div>
        {!loading &&
            <div id="nb">
                <div>
                    <p>Coachs</p>
                    <Link to={"/coachs"} className="btn btn-link">
                        <p className="rowNb">{coaches.length}</p>
                    </Link>
                </div>
                <div>
                    <p>Joueurs</p>
                    <Link to={"/players"} className="btn btn-link">
                        <p className="rowNb">{players.length}</p>
                    </Link>
                </div>
                <div>
                    <p>Equipes</p>
                    <Link to={"/encountersAdmin"} className="btn btn-link">
                        <p className="rowNb">{teams.length}</p>
                    </Link>
                </div>
            </div>
        }
        {!loading &&
            <div id="nextEvent">
                <div id="nextEncounter">
                    <h4>Prochain match</h4>
                    {encounters.length > 0 && 
                        <div>
                            <p className="date">{formattedDate(new Date (encounters[0].date))}</p>
                            <Link to={"/encountersAdmin"} className="btn btn-link">
                                <div id="encounter">
                                    <p><strong>{encounters[0].team.label} - {encounters[0].team.category} <span className="vs">VS</span> {encounters[0].labelOpposingTeam} - {encounters[0].categoryOpposingTeam}</strong></p>    
                                </div>
                            </Link>
                        </div>
                    }
                </div>
            </div>
            }
        </div>
    );
}

export default DashboardAdminPage;