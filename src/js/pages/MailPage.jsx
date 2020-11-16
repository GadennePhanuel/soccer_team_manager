import React, { useEffect, useState } from 'react';
import Textarea from '../components/forms/Textarea';
import Field from '../components/forms/Field';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import coachAPI from '../services/coachAPI';
import playerAPI from '../services/playerAPI';
import teamAPI from '../services/teamAPI';
import "../../scss/pages/MailPage.scss";
import adminAPI from '../services/adminAPI';
import mailAPI from '../services/mailAPI';
import Loader from 'react-loader-spinner';

const MailPage = (props) => {
    authAPI.setup();
    //si c'est un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }

    //récupération du role de l'user connecté
    const role = usersAPI.checkRole();

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
    const [admins, setAdmins] = useState([]);

    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)
    const [loading4, setLoading4] = useState(false)
    const [loading5, setLoading5] = useState(false)

    useEffect(() => {
        setLoading(true)
        setLoading2(true)
        setLoading3(true)

        coachAPI.findAllCoach()
            .then(data => {
                setCoachs(data)
                setLoading(false)
            })
            .catch(error => console.log(error.response));

        playerAPI.findAllPlayers()
            .then(data => {
                setPlayers(data)
                setLoading2(false)
            })
            .catch(error => console.log(error.response));

        teamAPI.findAllTeams()
            .then(data => {
                setTeams(data)
                setLoading3(false)
            })
            .catch(error => console.log(error.response));

        if (role !== 'ROLE_ADMIN') {
            setLoading4(true)
            adminAPI.findAdmin()
                .then(data => {
                    setAdmins(data)
                    setLoading4(false)
                })
                .catch(error => console.log(error.response))
        }
    }, [role])

    const handleChange = (event) => {
        const value = event.currentTarget.value;
        const name = event.currentTarget.name;
        setEmail({ ...email, [name]: value });
    }

    const handleSelect = (event) => {
        event.preventDefault()
        //je récupére la value du button (->correspond au tableau à l'id du même nom )
        const value = event.currentTarget.innerText;

        //j'ajoute la classe .desactive à tous les autres buttons et je l'enléve du button actuel
        let btnList = document.querySelectorAll(".btnSelectList")
        btnList.forEach(btn => {
            if (btn.innerText !== value) {
                btn.classList.add("desactive")
            } else if (btn.innerText === value) {
                if (btn.classList.contains("desactive")) {
                    btn.classList.remove("desactive")
                }
            }
        })
        //je show la table correspondante et hide les  autres
        let tableList = document.querySelectorAll(".btnSelectItem")
        tableList.forEach(tableItem => {
            if (tableItem.id !== value) {
                tableItem.hidden = true
            } else if (tableItem.id === value) {
                tableItem.hidden = false
            }
        })
    }

    const handleAdd = (emailTo) => {
        let user = document.getElementById(emailTo)
        if (!user.classList.contains('choose')) {
            setEmail({
                ...email,
                'receivers': email.receivers + emailTo + ";"
            })
            user.classList.add("choose")
        } else {
            setEmail({
                ...email,
                'receivers': email.receivers.replace(emailTo + ";", '')
            })
            user.classList.remove("choose")
        }

    }

    const handleAddTeam = (team) => {
        let users = document.getElementById(team.label + team.category)
        let emailTo = ""

        if (!users.classList.contains('choose')) {
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
            users.classList.add("choose")
        } else {
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
            users.classList.remove("choose")
        }
    }


    const handleSubmit = (event) => {
        event.preventDefault()
        setLoading5(true)
        const apiErrors = {};
        if (email.receivers.length === 0) {
            apiErrors.receivers =
                "Veuillez sélectionner au moins un destinataire";
            setErrors(apiErrors);
            setLoading5(false)
            return;
        }
        if (email.subject.length === 0) {
            apiErrors.subject =
                "Veuillez préciser le sujet de votre email";
            setErrors(apiErrors);
            setLoading5(false)
            return;
        }
        if (email.message.length === 0) {
            apiErrors.message =
                "Veuillez saisir un message...";
            setErrors(apiErrors);
            setLoading5(false)
            return;
        }

        setErrors('')

        //envoie des données saisies vers le BACK pour traitement et envoie du mail
        mailAPI.sendMail(email)
            .then(response => {
                //TODO : FLASH SUCCES  && on vide les champs sujet et message du formulaire
                setEmail({
                    ...email,
                    subject: "",
                    message: ""
                })
                setLoading5(false)
            })
            .catch(error => {
                console.log(error.response)
                if (error.response.status === 500) {
                    console.log("une ou plusieur adresses destinataires fausses ou inactive, impossible d'envoyer le message...")
                    //TODO : FLASH ERROR 
                }
                if (error.response.data.violations) {
                    if (error.response.data.violations.receivers) {
                        apiErrors.receivers = "Veuillez sélectionner au moins un destinataire";
                        setErrors(apiErrors);
                    } else if (error.response.data.violations.msg) {
                        apiErrors.message = "Veuillez écrire un message";
                        setErrors(apiErrors);
                    } else if (error.response.data.violations.subject) {
                        apiErrors.subject = "Veuillez préciser le sujet de votre email";
                        setErrors(apiErrors);
                    }
                }
                setLoading5(false)
            })

        //TODO : flash success
        //on vide le formulaire


    }

    return (
        <div className="MailPage wrapper_container">
            {(loading || loading2 || loading3 || loading4) && (
                <div>
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}
            {(!loading && !loading2 && !loading3 && !loading4) && (
                <div>
                    <h1>Messagerie</h1>
                    <div className="SelectList">
                        {(role === 'ROLE_COACH' || role === 'ROLE_PLAYER') &&
                            <button onClick={handleSelect} className="btn btn-primary btnSelectList">
                                Admins
                        </button>
                        }
                        <button onClick={handleSelect} className="btn btn-primary btnSelectList">
                            Coachs
                    </button>
                        <button onClick={handleSelect} className="btn btn-primary btnSelectList">
                            Joueurs
                    </button>
                        <button onClick={handleSelect} className="btn btn-primary btnSelectList">
                            Equipes
                    </button>
                    </div>
                    <div>
                        {(role === 'ROLE_COACH' || role === 'ROLE_PLAYER') &&
                            <div className="btnSelectItem" id="Admins" hidden>
                                {admins.map((admin) => (
                                    <div key={admin.id}>
                                        <button onClick={() => handleAdd(admin.user.email)} id={admin.user.email}>
                                            {admin.user.lastName} {admin.user.firstName}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        }
                        <div className="btnSelectItem" id="Coachs" hidden>
                            {coachs.map((coach) => (
                                <div key={coach.id}>
                                    <button onClick={() => handleAdd(coach.user.email)} id={coach.user.email}>
                                        {coach.user.lastName} {coach.user.firstName}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="btnSelectItem" id="Joueurs" hidden>
                            {players.map((player) => (
                                <div key={player.id}>
                                    <button onClick={() => handleAdd(player.user.email)} id={player.user.email}>
                                        {player.user.lastName} {player.user.firstName}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="btnSelectItem" id="Equipes" hidden>
                            {teams.map((team) => (
                                <div key={team.id}>
                                    <button onClick={() => handleAddTeam(team)} id={team.label + team.category}>
                                        {team.label} {team.category}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div>
                <form onSubmit={handleSubmit}>
                    <Textarea
                        name="receivers"
                        placeholder="Destinataires"
                        value={email.receivers}
                        error={errors.receivers}
                        onChange={handleChange}
                        rows="3"
                        cols="90"
                        disabled={true}
                    ></Textarea>
                    <Field
                        name="subject"
                        placeholder="Sujet de l'email..."
                        value={email.subject}
                        error={errors.subject}
                        onChange={handleChange}
                    ></Field>
                    <div>
                        <Textarea
                            name="message"
                            placeholder="Ecrivez votre message..."
                            value={email.message}
                            error={errors.message}
                            onChange={handleChange}
                            rows="10"
                            cols="100"
                        ></Textarea>
                    </div>
                    {!loading5 && (
                        <button id="sendMail">
                        </button>
                    )}
                    {loading5 && (
                        <div className="LoaderModal">
                            <Loader type="ThreeDots" width="60" height="40" color="LightGray" />
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default MailPage;