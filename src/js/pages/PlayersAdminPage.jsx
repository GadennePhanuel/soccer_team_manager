import React, { useContext, useEffect, useState } from "react";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import Field from "../components/forms/Field";
import playerAPI from "../services/playerAPI";
import "../../scss/pages/PlayersAdminPage.scss";
import TeamContext from "../contexts/TeamContext";
import Modal from '../components/Modal';
import notification from "../services/notification";
import Loader from "react-loader-spinner";
import CurrentUser from "../components/CurrentUser";


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
    const [playersNoTeam, setPlayersNoTeam] = useState([])

    const [search, setSearch] = useState("");
    const [search2, setSearch2] = useState("");

    const [email, setEmail] = useState('')

    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { value } = event.currentTarget;
        setEmail(value);
    };

    const { currentTeamId } = useContext(TeamContext)

    const [refreshKey, setRefreshKey] = useState(0)

    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)

    const [show, setShow] = useState(false)
    const [idTarget, setIdTarget] = useState('')
    const [modalType, setModalType] = useState('')

    
    const showModal = (modalType,idTarget) => {
        setModalType(modalType)
        setIdTarget(idTarget)
        setShow(true)
    }

    const hideModal = () => {
        setShow(false)
    }

    useEffect(() => {
        setLoading(true)
        setLoading2(true)
        playerAPI.findAllPlayers()
            .then(data => {
                var playersTmp = []
                var playersNoTeamTmp = []
                data.forEach(player => {
                    if (player.team) {
                        playersTmp.push(player)
                    } else {
                        playersNoTeamTmp.push(player)
                    }
                })
                setPlayers(playersTmp)
                setPlayersNoTeam(playersNoTeamTmp)
                setLoading(false)
                setLoading2(false)
            })
            .catch(error => console.log(error.response));
    }, [refreshKey])


    const handleDelete = id => {
        //copie le tableau players
        const originalPlayers = [...players];

        //Delete l'affichage du player avant de le delete en bdd
        setPlayers(players.filter(player => player.id !== id))

        //si la suppression coté serveur n'a pas fonctionné, je raffiche mon tableau initial
        hideModal() 
        playerAPI.deletePlayer(id)
            .then(response => {
                notification.successNotif("Le joueur a bien été supprimé") 
            })
            .catch(error => {
                setPlayers(originalPlayers);
                notification.errorNotif("Une erreur s'est produite")
            });
    };

    const handleSearch = event => {
        const value = event.currentTarget.value;
        setSearch(value);
    }
    const handleSearch2 = event => {
        const value = event.currentTarget.value;
        setSearch2(value);
    }


    const filteredPlayers = players.filter(p =>
        p.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        (p.team && p.team.label.toLowerCase().includes(search.toLowerCase())))
    const filteredPlayersNT = playersNoTeam.filter(p =>
        p.user.firstName.toLowerCase().includes(search2.toLowerCase()) ||
        p.user.lastName.toLowerCase().includes(search2.toLowerCase()) ||
        (p.team && p.team.label.toLowerCase().includes(search2.toLowerCase())))




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
        setLoading2(true)
        //call ajax vers controller particulier
        //1.envoie de l'adresse email (et de l'url du front correspondant à la page d'inscription du coach) vers le back qui se chargera d'envoyer un mail au coach qui se fait inviter
        playerAPI.sendMailToPlayer(email, club)
            .then(response => {
                console.log(response.data)
                //2.si tout s'est bien passé -> flash success, on cache le formulaire et on fait réaparaitre le button d'invit & on vide le formulaire email -> setEmail("") et setError('')
                setError('');
                //TODO : flash success
                setLoading2(false)
                document.getElementById('btn-invit').hidden = false
                document.getElementById('form-invit').hidden = true
                setEmail('');
                notification.successNotif("L'invitation a bien été envoyée")  
            })
            .catch(error => {
                const { violations } = error.response.data;
                if (violations) {
                    setError(violations);
                    notification.errorNotif("Une erreur s'est produite lors de l'envoi de l'invitation")
                }
            })

    }


    const handleChoice = (player) => {
        setLoading(true)
        playerAPI.setTeamToPlayer(player, currentTeamId)
            .then(response => {
                notification.successNotif("Le joueur a bien été séléctionné") 
                setRefreshKey(refreshKey + 1)
            })
            .catch(error => notification.errorNotif("Une erreur s'est produite lors de la sélection"))
    }

    const HandleHS = () => {
        if (document.getElementById('table_playersT').hidden === true) {
            document.getElementById('btn_players').classList.remove("active", "focus")
            document.getElementById('table_playersT').hidden = false
            document.getElementById('table_playersNT').hidden = true
        } else {
            document.getElementById('btn_players').classList.add("active", "focus")
            document.getElementById('btn_players').blur()
            document.getElementById('table_playersT').hidden = true
            document.getElementById('table_playersNT').hidden = false
        }
    }



    return (
        <div className="wrapper_container PlayersAdminPage">
            <CurrentUser />
            <h1>Joueurs inscrits</h1>
            {(loading2 && role === 'ROLE_ADMIN') && (
                <div className="invit-loader">
                    <Loader type="ThreeDots" height="20" width="508" color="LightGray" />
                </div>
            )}
            {(role === 'ROLE_ADMIN' && !loading2) &&
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
                            <button type="submit" className="sendBtn"></button>
                        </form>
                    </div>

                </div>
            }
            {loading && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}
            {!loading && (
                <div className="tables_container">
                    <button id="btn_players" className="btn btn-secondary" onClick={HandleHS}>Joueurs non selectionnés</button>

                    <div id="table_playersT">
                        <div id="div-search" className="form-group">
                            <input className="search form-control" type="text" onChange={handleSearch} value={search} placeholder="Rechercher" />
                        </div>
                        <table className="table table-hover">
                            <thead>
                                <tr className="thead-color">
                                    <th scope="col">Joueur</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Telephone</th>
                                    <th scope="col">Equipe</th>
                                    {(role === 'ROLE_ADMIN') &&
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
                                        <td>{player.team.label + ' ' + player.team.category}
                                        </td>
                                        {role === 'ROLE_ADMIN' &&
                                            <td>
                                                <button
                                                    onClick={() => showModal("Supprimer le joueur",player.id)}
                                                    className="btn btn-sm btn-danger">
                                                    Supprimer
                                                </button>
                                            </td>
                                        }
                                    </tr>
                                ))}
                                {filteredPlayers.length === 0 && (
                                    <tr className="no-player">
                                        <td> Aucun joueurs </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div id="table_playersNT" hidden>
                        <div id="div-search" className="form-group">
                            <input className="search form-control" type="text" onChange={handleSearch2} value={search2} placeholder="Rechercher" />
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
                                {filteredPlayersNT.map(player => (
                                    <tr key={player.id}>
                                        <td>{player.user.lastName + ' ' + player.user.firstName}</td>
                                        <td>{player.user.email}</td>
                                        <td>{player.user.phone}</td>
                                        <td>non attribué</td>
                                        {role === 'ROLE_ADMIN' &&
                                            <td>
                                                <button
                                                    onClick={() => showModal("Supprimer le joueur",player.id)}
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
                                {filteredPlayersNT.length === 0 && (
                                    <tr className="no-player">
                                        <td> Aucun joueur </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                show={show}
                handleClose={hideModal}
                title= {modalType}
            >
                {modalType === "Supprimer le joueur" &&
                    <div>
                        <h6>Êtes-vous sur de vouloir supprimer ce joueur ? </h6>
                        <button onClick={() => handleDelete(idTarget)} className="btn btn-primary">Confirmer</button>
                    </div>
                }
            </Modal>
        </div>

    );
}

export default PlayersAdminPage;