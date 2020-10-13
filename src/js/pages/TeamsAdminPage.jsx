import React, {useEffect, useState } from 'react';
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
    },[])

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
                                {team.players.map((player) =>
                                    <ul>
                                        <li>{player.user.firstName}
                                            {player.user.lastName}
                                            <img href="public/storage/images"{player.picture}
                                        </li>
                                    </ul>
                                )}
                                {/*
                                <button onClick={() => handleDelete(team.id)}>
                                    Supprimer
                                </button>
                                */}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div>
            </div>
        </>
    );
}

export default TeamsAdminPage;