import React, { useContext, useEffect, useState } from "react";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import Field from "../components/forms/Field";
import playerAPI from "../services/playerAPI";
import "../../scss/pages/PlayersAdminPage.scss";
import TeamContext from "../contexts/TeamContext";


const PlayersAdminPage = (props) => {
    authAPI.setup();
    // si role != ROLE_ADMIN -> redirection vers le dashboard qui lui correspond
    const role = usersAPI.checkRole();
    if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }

    //si c'est bien un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }
    //déclare une variable d'état "players", son état initial est un tableau vide
    const [players, setPlayers] = useState([]);
    const [search, setSearch] = useState("");

    const [email, setEmail] = useState('')

    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { value } = event.currentTarget;
        setEmail(value);
    };

    const { currentTeamId } = useContext(TeamContext)

    useEffect(() => {
        playerAPI.findAllPlayers()
            .then(data => setPlayers(data))
            .catch(error => console.log(error.response));
    }, [])


    const handleDelete = id => {
        //copie le tableau players
        const originalPlayers = [...players];

        //Delete l'affichage du player avant de le delete en bdd
        setPlayers(players.filter(player => player.id !== id))

        //si la suppression coté serveur n'a pas fonctionné, je raffiche mon tableau initial 
        playerAPI.deletePlayer(id)
            .then(response => console.log("ok"))
            .catch(error => {
                setPlayers(originalPlayers);
            });
    };

    const handleSearch = event => {
        const value = event.currentTarget.value;
        setSearch(value);
    }


    const filteredPlayers = players.filter(p =>
        p.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        (p.team && p.team.label.toLowerCase().includes(search.toLowerCase())))




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


    const handleChoice = (player) => {
        playerAPI.setTeamToPlayer(player, currentTeamId)
            .then(response => {
                playerAPI.findAllPlayers()
                    .then(data => setPlayers(data))
                    .catch(error => console.log(error.response));
            })
            .catch(error => console.log(error.response))
    }



    return (
        <div className="wrapper_container PlayersAdminPage">

            <h1>Joueurs inscrits</h1>

            {role === 'ROLE_ADMIN' &&
                <div className="div-invit">
                    <div id="btn-invit">
                        <button className="btn btn-primary" onClick={() => handleInvit()}>
                            Inviter un nouveau joueur
                    </button>
                    </div>
                    <div id="form-invit" hidden>
                        <form onSubmit={handleSubmit}>
                            <button type="button" onClick={() => handleCancelInvit()} className="cancelBtn">

                            </button>
                            <Field
                                type="email"
                                name="email"
                                value={email}
                                placeholder="adresse email"
                                onChange={handleChange}
                                error={error}
                            >
                            </Field>
                            <button type="submit" className="sendBtn">

                            </button>

                        </form>
                    </div>

                </div>
            }

            <div>
                <div id="div-search" className="form-group">
                    <input id="search" type="text" onChange={handleSearch} value={search} className="form-control" placeholder="Rechercher" />
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr className="thead-color">
                            <th scope="col">Joueur</th>
                            <th scope="col">Email</th>
                            <th scope="col">Telephone</th>
                            <th scope="col">Equipe</th>
                            {(role === 'ROLE_ADMIN' || role === 'ROLE_COACH') &&
                                <th> </th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            // repetition pour chaque player
                        }
                        {filteredPlayers.map(player => (
                            <tr key={player.id}>
                                <td>{player.user.lastName + ' ' + player.user.firstName}</td>
                                <td>{player.user.email}</td>
                                <td>{player.user.phone}</td>
                                <td>{
                                    player.team ? (player.team.label + ' ' + player.team.category) : 'non attribué'
                                }
                                </td>
                                {role === 'ROLE_ADMIN' &&
                                    <td>
                                        <button
                                            onClick={() => handleDelete(player.id)}
                                            className="btn btn-sm btn-danger">
                                            Supprimer
                                        </button>
                                    </td>
                                }
                                {(role === 'ROLE_COACH' && currentTeamId !== '') &&
                                    <td>
                                        {!player.team &&
                                            <button onClick={() => handleChoice(player)} className="btn btn-success">
                                                Selectionner
                                            </button>
                                        }
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export default PlayersAdminPage;