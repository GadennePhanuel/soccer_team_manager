import React, {useEffect, useState } from 'react';
import {Image} from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import Axios from "axios";

const TeamsAdminPage = (props) => {
    authAPI.setup();
    // si role != ROLE_ADMIN -> redirection vers le dashboard qui lui correspond
    const role = usersAPI.checkRole();
    if (role === 'ROLE_COACH') {
        props.history.replace("/dashboardCoach")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }
    //si c'est bien un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }

    const [teams, setTeams] = useState([])

    useEffect(() => {
        Axios.get('http://localhost:8000/api/teams')
            .then(response => response.data['hydra:member'])
            .then(data => setTeams(data))
            .catch(error => console.log(error.response));
    },[]);

    function DisplayPlayers(props) {
        return (
            <>
            {props.map((player) => (
                <table>
                    <tr key={player.id}>
                    <td rowpan={5}>
                        <img src={"http://localhost:8000/storage/images/"+player.picture} alt=""/>
                    </td></tr>
                    <tr><td>{player.firstName}</td> </tr>
                    <tr> <td>{player.lastName}</td> </tr>
                    <tr> <td>{player.email}</td> </tr>
                    <tr> <td>{player.phone}</td> </tr>
                </table>
                ))}
            </>
            );
    }

    function changePlayers(props){
        console.log(props);
    }

    console.log(teams);

    return (
        <>
            <h1>Pages des équipes pour l'admin</h1>

            <div>
                <h2>Liste des teams du club</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Coach</th>
                            <th>Category</th>
                            <th>Joueur</th>
                        </tr>
                    </thead>
                    <tbody>
                    {teams.map((team) => (
                        <tr key={team.id}>
                            <td>{team.label}</td>
                            <td>{team.coach.user.firstName} {team.coach.user.lastName}</td>
                            <td>{team.category}</td>
                            <td>
                                <button  onClick={changePlayers.bind(team)}>voir</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div id="dPlay">
                {teams.map((team) => (
                    <DisplayPlayers player={team.players} />
                ))}
            </div>
        </>
    );
}

export default TeamsAdminPage;