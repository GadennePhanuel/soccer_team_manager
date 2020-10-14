import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import Field from "../components/forms/Field";
import playerAPI from "../services/playerAPI";


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

    const [email, setEmail] = useState('')

    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { value } = event.currentTarget;
        setEmail(value);
    };

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


    const handleInvit = () => {
        document.getElementById('btn-invit').hidden = true
        document.getElementById('form-invit').hidden = false
    }

    const handleCancelInvit = () => {
        document.getElementById('btn-invit').hidden = false
        document.getElementById('form-invit').hidden = true
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        //call ajax vers controller particulier
        //1.envoie de l'adresse email (et de l'url du front correspondant à la page d'inscription du coach) vers le back qui se chargera d'envoyer un mail au coach qui se fait inviter
        playerAPI.sendMailToPlayer(email, club)
            .then(response => {
                console.log(response.data)
                //2.si tout s'est bien passé -> flash success, on cache le formulaire et on fait réaparaitre le button d'invit & on vide le formulaire email -> setEmail("") et setError('')
                setError('');
                //TODO : flash success
                document.getElementById('btn-invit').hidden = false
                document.getElementById('form-invit').hidden = true
                setEmail('');
            })
            .catch(error => {
                const { violations } = error.response.data;
                if (violations) {
                    setError(violations);
                }
            })

    }

    return (
        <>
            <h1>Page des joueurs pour l'admin</h1>

            <div>
                <div id="btn-invit">
                    <button onClick={() => handleInvit()}>
                        Inviter un nouveau joueur
                    </button>
                </div>
                <div id="form-invit" hidden>
                    <form onSubmit={handleSubmit}>
                        <Field
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            placeholder="adresse email"
                            onChange={handleChange}
                            error={error}
                        >
                        </Field>
                        <div>
                            <button type="button" onClick={() => handleCancelInvit()}>
                                Annuler
                            </button>
                            <button type="submit">
                                Envoyer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div>
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
            </div>
        </>
    );
}

export default PlayersAdminPage;