import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import Field from '../components/forms/Field'
import coachAPI from '../services/coachAPI';
import teamAPI from '../services/teamAPI';
import Modal from '../components/Modal';
import notification from "../services/notification";
import "../../scss/pages/CoachsAdminPage.scss";
import Loader from 'react-loader-spinner';
import Modal from "../components/Modal";

const CoachAdminPage = (props) => {
    authAPI.setup();
    // si role != ROLE_ADMIN -> redirection vers le dashboard qui lui correspond
    const role = usersAPI.checkRole();
    if (role === 'ROLE_COACH') {
        props.history.replace("/dashboardCoach")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    } else if (role === 'ROLE_NOT_ALLOWED') {
        props.history.replace("/notAllowedUser")
    }
    //si c'est bien un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub")
    }

    const [refreshKey, setRefreshKey] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)

    const [coachs, setCoachs] = useState([])

    const [email, setEmail] = useState('')

    const [error, setError] = useState('')

    const handleChange = (event) => {
        const {value} = event.currentTarget;
        setEmail(value);
    };

    const [show, setShow] = useState(false)
    const [idTarget, setIdTarget] = useState('')
    const[modalType, setModalType] = useState('')

    
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
        coachAPI.findAllCoach()
            .then(data => {
                setCoachs(data)
                setLoading(false)
                setLoading2(false)
            })
            .catch(error => console.log(error.response))
    }, [refreshKey])

    /*const handleDelete = (id) => {
        /!*const handleDelete = (id) => {
            //copie du tableau original
            const originalCoachs = [...coachs];

            setCoachs(coachs.filter((coach) => coach.id !== id));
        hideModal()
        coachAPI.deleteCoach(id)
            .then(response => {
                notification.successNotif("Le coach a bien été supprimé")                
            })
            .catch(error => {
                setCoachs(originalCoachs);
                notification.errorNotif("Une erreur s'est produite lors de la suppression")
            })
    }*!/*/

        const handeDeleteTeam = (id) => {
            teamAPI.deleteCoachOnTeam(id)
            .then(response => {
                notification.successNotif("Le coach a bien été supprimé de l'équipe")
                setRefreshKey(refreshKey + 1)
                
            })
            .catch(error => {
                notification.errorNotif("Une erreur s'est produite lors de la suppression")
            })
        }

        const handleAllowed = (coach, allowed) => {
            hideModal()
            usersAPI.switchAllowed(coach.user.id, "coach", allowed)
                .then(response => {
                    if (allowed === "bloquer") {
                        teamAPI.excludeCoachOnAllTeams(coach.id)
                            .then(response => {
                                console.log(response)
                            })
                            .catch(error => {
                                console.log(error.response)
                            })
                    }
                    console.log(response)
                    setRefreshKey(refreshKey + 1)
                })
                .catch(error => {
                    console.log(error.response)
                })
        }

        const handleInvit = () => {
            document.getElementById('btn-invit').hidden = true
            document.getElementById('form-invit').hidden = false
            console.log(process.env)
        }

        const handleCancelInvit = () => {
            document.getElementById('btn-invit').hidden = false
            document.getElementById('form-invit').hidden = true
        }


        const handleSubmit = (event) => {
            event.preventDefault()
            setLoading2(true)
            //call ajax vers controller particulier
            //1.envoie de l'adresse email (et de l'url du front correspondant à la page d'inscription du Coach) vers le back qui se chargera d'envoyer un mail au Coach qui se fait inviter
            coachAPI.sendMailToCoach(email, club)
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
                    const {violations} = error.response.data;
                    if (violations) {
                        setError(violations);
                        notification.errorNotif("Une erreur s'est produite lors de l'envoi de l'invitation")
                    }
                })

        }

    const [modalType, setModalType] = useState({})
    const [show, setShow] = useState(false)
    const showModal = (modalType, coachTarget) => {
        setModalType({ type: modalType, target: coachTarget })
        setShow(true)
    }
    const hideModal = () => {
        setShow(false)
        setModalType('')
    }

        return (
            <div className="CoachsAdminPage wrapper_container">
                <h1>Coachs</h1>

                {(loading2 && role === 'ROLE_ADMIN') && (
                    <div className="invit-loader">
                        <Loader type="ThreeDots" height="20" width="508" color="LightGray"/>
                    </div>
                )}
                {!loading2 && (
                    <div>
                        <div id="btn-invit">
                            <button onClick={() => handleInvit()} className="btn btn-primary">
                                Inviter un nouveau coach
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
                )}
                {loading && (
                    <div className="bigLoader">
                        <Loader type="Circles" height="200" width="200" color="LightGray"/>
                    </div>
                )}
                {!loading && (
                    <div>
                        <table className="table table-hover">
                            <thead>
                            <tr className="thead-color">
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th className="text-center">Equipes</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {coachs.map((coach) => (
                                <tr key={coach.id}>
                                    <td>{coach.user.lastName} {coach.user.firstName}</td>
                                    <td>{coach.user.email}</td>
                                    <td>{coach.user.phone}</td>
                                    <td>

                                        <table>
                                            <tbody>
                                            {coach.teams.map((team) => (
                                                <tr key={team.id}>
                                                    <td>{team.label} - {team.category}</td>
                                                    <td>
                                                        <button onClick={() => showModal("Supprimer l'équipe",team.id)} className="cancelBtn"></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </td>
                                    <td>
                                        {/*<button onClick={() => showModal("Supprimer un coach",coach.id)} className="btn btn-sm btn-danger">Supprimer</button>*/}
                                        {coach.user.roles[0] === "ROLE_NOT_ALLOWED" ?
                                            <button className="btn btn-sm btn-success"
                                                 //   onClick={() => handleAllowed(coach, "debloquer")}>
                                                    onClick={() => showModal("debloquer", coach)}>
                                                Autoriser
                                            </button>
                                            :
                                            <button className="btn btn-sm btn-danger"
                                                   // onClick={() => handleAllowed(coach, "bloquer")}>
                                                    onClick={() => showModal("bloquer", coach)}>
                                                Bloquer
                                            </button>
                                        }
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal show={show} handleClose={hideModal} title={modalType.type}>

                    {modalType === "Supprimer l'équipe" &&
                    <div>
                        <h6>Êtes-vous sur de vouloir supprimer cette équipe ? </h6>
                        <button onClick={() => handleDeleteTeam(idTarget)} className="btn btn-primary">Confirmer</button>
                    </div>
                    }

                    {/*{modalType === "Supprimer un coach" &&
                    <div>
                        <h6>Êtes-vous sur de vouloir supprimer ce coach ? </h6>
                        <button onClick={() => handleDelete(idTarget)} className="btn btn-primary">Supprimer</button>
                    </div>
                    }*/}

                    {modalType && modalType.type === "debloquer" && (
                        <div>
                            <p>Débloquer {modalType.target.user.firstName} {modalType.target.user.lastName} ? </p>
                            <button type="button" className="btn btn-danger" onClick={() => handleAllowed(modalType.target, "debloquer")}>
                                Comfirmer
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => hideModal()}>
                                Annuler
                            </button>
                        </div>
                    )
                    }

                    {modalType && modalType.type === "bloquer" && (
                        <div>
                            <p>Bloquer {modalType.target.user.firstName} {modalType.target.user.lastName} ?</p>
                            <p>Attention, le bloquage exclura de toutes équipe l'utilisateur. Il n'aura pluq accès qu'à un contact admin et à son profile</p>
                            <button type="button" className="btn btn-danger" onClick={() => handleAllowed(modalType.target, "bloquer")}>
                                Comfirmer
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => hideModal()}>
                                Annuler
                            </button>
                        </div>
                    )}
                </Modal>

            </div>
        )
}

export default CoachAdminPage;