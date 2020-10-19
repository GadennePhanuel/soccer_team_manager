import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import Field from '../components/forms/Field'
import coachAPI from '../services/coachAPI';
import teamAPI from '../services/teamAPI';
import "../../scss/pages/CoachsAdminPage.scss";

const CoachAdminPage = (props) => {
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


    const [coachs, setCoachs] = useState([])

    const [email, setEmail] = useState('')

    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { value } = event.currentTarget;
        setEmail(value);
    };


    useEffect(() => {
        coachAPI.findAllCoach()
            .then(data => setCoachs(data))
            .catch(error => console.log(error.response))
    }, [])


    const handleDelete = (id) => {
        //copie du tableau original
        const originalCoachs = [...coachs];

        //supression de l'affichage du coach selectionné
        setCoachs(coachs.filter((coach) => coach.id !== id));

        coachAPI.deleteCoach(id)
            .then(response => console.log("ok"))
            .catch(error => {
                setCoachs(originalCoachs);
                console.log(error.response);
            })
    }

    const handeDeleteTeam = (id) => {
        teamAPI.deleteCoachOnTeam(id)
            .then(response => {
                console.log("ok")
                coachAPI.findAllCoach()
                    .then(data => setCoachs(data))
            })
            .catch(error => {
                console.log(error.response);
            })
    }


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
        coachAPI.sendMailToCoach(email, club)
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
        <div className="CoachsAdminPage wrapper_container">
            <h1>Coachs</h1>

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

            <div>
                <table className="table table-striped">
                    <thead>
                        <tr>
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
                                    <table >
                                        <tbody >
                                            {coach.teams.map((team) => (
                                                <tr key={team.id}>
                                                    <td>{team.label} - {team.category}</td>
                                                    <td>
                                                        <button onClick={() => handeDeleteTeam(team.id)} className="cancelBtn"></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <button onClick={() => handleDelete(coach.id)} className="btn btn-warning">
                                        Supprimer
                                </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CoachAdminPage;