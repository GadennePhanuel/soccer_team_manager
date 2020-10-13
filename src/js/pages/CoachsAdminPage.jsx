import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import Field from '../components/forms/Field'

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
        Axios.get('http://localhost:8000/api/coaches')
            .then(response => response.data['hydra:member'])
            .then(data => setCoachs(data))
    }, [])


    const handleDelete = (id) => {
        //copie du tableau original
        const originalCoachs = [...coachs];

        //supression de l'affichage du coach selectionné
        setCoachs(coachs.filter((coach) => coach.id !== id));

        Axios.delete("http://localhost:8000/api/coaches/" + id)
            .then(response => console.log("ok"))
            .catch(error => {
                setCoachs(originalCoachs);
                console.log(error.response);
            })
    }

    const handeDeleteTeam = (id) => {
        console.log(id)
        Axios.put("http://localhost:8000/api/teams/" + id,
            { coach: null }
        )
            .then(response => {
                console.log("ok")
                Axios.get('http://localhost:8000/api/coaches')
                    .then(response => response.data['hydra:member'])
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
        Axios.post("http://localhost:8000/api/emailCoach", 
            {params: {
                url: 'http://localhost:3000/#/registerCoach/',
                email: {email}
            }}
            )
            .then(response => {
                console.log(response.data)
                //2.si tout s'est bien passé -> flash success, on cache le formulaire et on fait réaparaitre le button d'invit & on vide le formulaire email -> setEmail("")
            })
            .catch(error => {
                console.log(error.response)

            })

    }

    return (
        <>
            <h1>Page des coachs pour l'admin</h1>

            <div>
                <div id="btn-invit">
                    <button onClick={() => handleInvit()}>
                        Inviter un nouveau coach
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
                            <button onClick={() => handleCancelInvit()}>
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
                <h2>Liste des coachs du club</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>phone</th>
                            <th>Equipes</th>
                            <th>action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coachs.map((coach) => (
                            <tr key={coach.id}>
                                <td>{coach.user.lastName}</td>
                                <td>{coach.user.firstName}</td>
                                <td>{coach.user.email}</td>
                                <td>{coach.user.phone}</td>
                                <td>
                                    <table >
                                        <tbody >
                                            {coach.teams.map((team) => (
                                                <tr key={team.id}>
                                                    <td>{team.label} - {team.category}</td>
                                                    <td>
                                                        <button onClick={() => handeDeleteTeam(team.id)}>-X-</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <button onClick={() => handleDelete(coach.id)}>
                                        Supprimer
                                </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default CoachAdminPage;