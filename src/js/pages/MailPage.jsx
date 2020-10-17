import React, { useEffect, useState } from 'react';
import Textarea from '../components/forms/Textarea';
import Field from '../components/forms/Field';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import coachAPI from '../services/coachAPI';
import playerAPI from '../services/playerAPI';
import teamAPI from '../services/teamAPI';
import Axios from 'axios';
import "../../scss/pages/MailPage.scss";

const MailPage = (props) => {
    authAPI.setup();
    //si c'est un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }

    const [email, setEmail] = useState({
        receivers: '',
        subject: '',
        message: ''
    })
    const [errors, setErrors] = useState({
        receivers: '',
        subject: '',
        message: ''
    })

    const [coachs, setCoachs] = useState([]);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        coachAPI.findAllCoach()
            .then(data => setCoachs(data))
            .catch(error => console.log(error.response));

        playerAPI.findAllPlayers()
            .then(data => setPlayers(data))
            .catch(error => console.log(error.response));

        teamAPI.findAllTeams()
            .then(data => setTeams(data))
            .catch(error => console.log(error.response))
    }, [])

    const handleChange = (event) => {
        const value = event.currentTarget.value;
        const name = event.currentTarget.name;
        setEmail({ ...email, [name]: value });
    }

    const handleSelect = (event) => {
        event.preventDefault()
        //je récupére la value du button (->correspond au tableau à l'id du même nom )
        const value = event.currentTarget.innerText;
        //je hide and show le tableau au clique et je passe les autre buttons en disabled
        if (document.getElementById(value).hidden === true) {
            document.getElementById(value).hidden = false
            //je selectionne tous les buttons de la class btnSelectList
            let btnList = document.querySelectorAll(".btnSelectList")
            //je parcours le tableau des buttons et je disabled tout ceux qui ne correspondent pas à celui cliqué 
            btnList.forEach(btn => {
                if (btn.innerText !== value) {
                    btn.disabled = true
                }
            })
        } else {
            document.getElementById(value).hidden = true
            //je selectionne tous les buttons de la class btnSelectList
            let btnList = document.querySelectorAll(".btnSelectList")
            //je parcours le tableau des buttons et je disabled tout ceux qui ne correspondent pas à celui cliqué 
            btnList.forEach(btn => {
                if (btn.innerText !== value) {
                    btn.disabled = false
                }
            })
        }
    }

    const handleAdd = (emailTo) => {
        document.getElementById(emailTo + '_add').hidden = true
        document.getElementById(emailTo + '_remove').hidden = false
        setEmail({
            ...email,
            'receivers': email.receivers + emailTo + ";"
        })
    }
    const handleRemove = (emailTo) => {
        document.getElementById(emailTo + '_add').hidden = false
        document.getElementById(emailTo + '_remove').hidden = true
        setEmail({
            ...email,
            'receivers': email.receivers.replace(emailTo + ";", '')
        })
    }
    const handleAddTeam = (team) => {
        let emailTo = ""
        document.getElementById(team.label + team.category + '_add').hidden = true
        document.getElementById(team.label + team.category + '_remove').hidden = false
        //je parcours la liste des players
        players.forEach((player) => {
            team.players.forEach((playerTeam) => {
                if (player.id === playerTeam.id) {
                    emailTo = emailTo + player.user.email + ";"
                }
            })
        })
        setEmail({
            ...email,
            'receivers': email.receivers + emailTo
        })
    }
    const handleRemoveTeam = (team) => {
        let emailTo = ""
        document.getElementById(team.label + team.category + '_add').hidden = false
        document.getElementById(team.label + team.category + '_remove').hidden = true
        //je parcours la liste des players
        players.forEach((player) => {
            team.players.forEach((playerTeam) => {
                if (player.id === playerTeam.id) {
                    emailTo = emailTo + player.user.email + ";"
                }
            })
        })
        setEmail({
            ...email,
            'receivers': email.receivers.replace(emailTo, '')
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const apiErrors = {};
        if (email.receivers.length === 0) {
            apiErrors.receivers =
                "Veuillez sélectionner au moins un destinataire";
            setErrors(apiErrors);
            return;
        }
        if (email.subject.length === 0) {
            apiErrors.subject =
                "Veuillez préciser le sujet de votre email";
            setErrors(apiErrors);
            return;
        }
        if (email.message.length === 0) {
            apiErrors.message =
                "Veuillez saisir un message...";
            setErrors(apiErrors);
            return;
        }

        setErrors('')

        //envoie des données saisies vers le BACK pour traitement et envoie du mail
        Axios.post("http://localhost:8000/api/sendEmail", {
            email
        })
        //TODO : flash success
        //on vide le formulaire


    }

    return (
        <div className="MailPage">
            <h1>Page de messagerie</h1>
            <div>
                <button onClick={handleSelect} className="btnSelectList">
                    Coachs
                </button>
                <button onClick={handleSelect} className="btnSelectList">
                    Joueurs
                </button>
                <button onClick={handleSelect} className="btnSelectList">
                    Equipes
                </button>
            </div>
            <div>
                <table id="Coachs" hidden>
                    <tbody>
                        {coachs.map((coach) => (
                            <tr key={coach.id}>
                                <td>
                                    <button onClick={() => handleAdd(coach.user.email)} id={coach.user.email + '_add'}>
                                        +
                                    </button>
                                    <button onClick={() => handleRemove(coach.user.email)} id={coach.user.email + '_remove'} hidden>
                                        -
                                    </button>
                                </td>
                                <td>{coach.user.lastName} {coach.user.firstName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table id="Joueurs" hidden>
                    <tbody>
                        {players.map((player) => (
                            <tr key={player.id}>
                                <td>
                                    <button onClick={() => handleAdd(player.user.email)} id={player.user.email + '_add'}>
                                        +
                                    </button>
                                    <button onClick={() => handleRemove(player.user.email)} id={player.user.email + '_remove'} hidden>
                                        -
                                    </button>
                                </td>
                                <td>{player.user.lastName} {player.user.firstName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table id="Equipes" hidden>
                    <tbody>
                        {teams.map((team) => (
                            <tr key={team.id}>
                                <td>
                                    <button onClick={() => handleAddTeam(team)} id={team.label + team.category + '_add'}>
                                        +
                                    </button>
                                    <button onClick={() => handleRemoveTeam(team)} id={team.label + team.category + '_remove'} hidden>
                                        -
                                    </button>
                                </td>
                                <td>{team.label} {team.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <Textarea
                        name="receivers"
                        label="Destinataires"
                        placeholder="Destinataires"
                        value={email.receivers}
                        error={errors.receivers}
                        onChange={handleChange}
                        rows="5"
                        cols="90"
                        disabled={true}
                    ></Textarea>
                    <Field
                        name="subject"
                        label="Sujet"
                        placeholder="Sujet de l'email..."
                        value={email.subject}
                        error={errors.subject}
                        onChange={handleChange}
                    ></Field>
                    <Textarea
                        name="message"
                        label="Votre message"
                        placeholder="Ecrivez votre message..."
                        value={email.message}
                        error={errors.message}
                        onChange={handleChange}
                        rows="15"
                        cols="90"
                    ></Textarea>
                    <button>
                        Envoyer
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MailPage;