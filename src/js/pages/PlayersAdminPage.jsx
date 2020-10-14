import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';


const PlayersAdminPage = (props) => {
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
    //déclare une variable d'état "players", son état initial est un tableau vide
    const [players, setPlayers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/players")
            .then(response => response.data['hydra:member'])
            .then(data => setPlayers(data))
            .catch(error => console.log(error.response));
    }, [])


    const handleDelete = id => {
        //copie le tableau players
        const originalPlayers = [...players];

        //Delete l'affichage du player avant de le delete en bdd
        setPlayers(players.filter(player => player.id !== id))

        //si la suppression coté serveur n'a pas fonctionné, je raffiche mon tableau initial 
        axios
            .delete("http://localhost:8000/api/players/" + id)
            .then(response => console.log("ok"))
            .catch(error => {
                setPlayers(originalPlayers);
            });
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    }

    const itemsPerPage = 15;
    const paginatedPlayers = Pagination.getData(players, currentPage, itemsPerPage);

    return (
        <>
            <h1>Page des joueurs pour l'admin</h1>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Joueur</th>
                        <th>Email</th>
                        <th>Telephone</th>
                        <th>Equipe</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {
                        // repetition pour chaque player
                    }
                    {paginatedPlayers.map(player => (
                        <tr key={player.id}>
                            <td>{player.user.firstName} {player.user.lastName}</td>
                            <td>{player.user.email}</td>
                            <td>{player.user.phone}</td>
                            <td>{player.team.label}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(player.id)}
                                    className="btn btn-sm btn-danger">
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} length={players.length} onPageChanged={handlePageChange} />
        </>
    );
}

export default PlayersAdminPage;