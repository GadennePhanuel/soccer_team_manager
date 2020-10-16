import React, {useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";

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
        teamAPI.findAllTeams()
            .then(data => setTeams(data))
            .catch(error => console.log(error.response));
    },[]);

    console.log(teams)

    const TeamComponent = (team) => (
        <>
            <td>{team.label}</td>
            <td>{team.category}</td>
            <td>
                <CoachComponent coach={team.coach}/>
            </td>
            <td><button onClick={() => teamAPI.changePlayers(team.players)}>voir joueurs</button></td>
        </>
    )

    const CoachComponent = (coach) => (
        <table key={coach.id}>
            <thead>
                <tr colSpan={4}>
                    <td>Coach</td>
                </tr>
            </thead>
            <tbody>
                <UserComponent user={coach.user} />
            </tbody>
        </table>
    )

    const UserComponent = (user) => (
        <>
            <tr><td>{user.firstName}</td></tr>
            <tr><td>{user.lastName}</td></tr>
            <tr><td>{user.email}</td></tr>
            <tr><td>{user.phone}</td></tr>
        </>
    )

    //todo
    const PlayerComponent = (id, picture, user) => (
        <div key={id}>
            <img src={"http://localhost:8000/public/storage/images/"+picture} alt=""/>
            <UserComponent key={user.id} user={user}/>
        </div>
    )
    return (
        <>
            <h1>Equipes du club</h1>

            <div id="teamsBox">
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
                    {teams.map(team => (
                        <tr key={team.id}>
                                <td>{team.label}</td>
                                <td>{team.category}</td>
                                <td>
                                    <table key={team.coach.id}>
                                        <thead>
                                        <tr colSpan={4}>
                                            <td>Coach</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td>{team.coach.user.firstName}</td></tr>
                                            <tr><td>{team.coach.user.lastName}</td></tr>
                                            <tr><td>{team.coach.user.email}</td></tr>
                                            <tr><td>{team.coach.user.phone}</td></tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td><button onClick={() => teamAPI.changePlayers(team.players)}>voir joueurs</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div id="playersBox">
            </div>
        </>
    );
}

export default TeamsAdminPage;