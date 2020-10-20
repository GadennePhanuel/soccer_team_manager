import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import Field from '../components/forms/Field';
import usersAPI from '../services/usersAPI';
import dateFormat from 'dateformat';
import authAPI from '../services/authAPI';
import '../../scss/pages/ProfilForm.scss';
import { useRef } from 'react';
import { createRef } from 'react';

const ProfilForm = (props) => {
    authAPI.setup();
    //si c'est un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }

    const userId = usersAPI.findUserId();

    const role = usersAPI.checkRole();

    const [user, setUser] = useState({
        email: "",
        lastName: "",
        firstName: "",
        birthday: "",
        phone: "",
        password: "",
        passwordConfirm: ""
    })

    const [errors, setErrors] = useState({
        email: "",
        lastName: "",
        firstName: "",
        birthday: "",
        phone: "",
        password: "",
        passwordConfirm: "",
    });

    const [player, setPlayer] = useState({
        picture: "",
        height: "",
        weight: "",
        injured: Boolean
    })

    const [errorsPlayer, setErrorsPlayer] = useState({
        picture: "",
        height: "",
        weight: "",
        injured: Boolean
    })

    const fetchUser = async id => {
        try {
            const response = await Axios.get("http://localhost:8000/api/users/" + id)
            const email = response.data.email;
            const lastName = response.data.lastName;
            const firstName = response.data.firstName;
            const birthday = dateFormat(response.data.birthday, "yyyy-mm-dd");
            const phone = response.data.phone;
            const password = "";
            const passwordConfirm = "";

            setUser({ email, lastName, firstName, birthday, phone, password, passwordConfirm })
        } catch (error) {
            console.log(error.response)
        }
    }

    // au chargement de la page, récupérer les infos de l'user connecté via requete HTTP
    useEffect(() => {
        fetchUser(userId);
        if (role === 'ROLE_PLAYER') {
            fetchPlayer(userId);

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, role])

    const fetchPlayer = async id => {
        await Axios.get("http://localhost:8000/api/players")
            .then(response => {
                const players = response.data["hydra:member"]
                players.forEach((playerItem) => {
                    if (playerItem.user.id === id) {

                        setPlayer({
                            ...player,
                            "height": playerItem.height,
                            "weight": playerItem.weight,
                            "picture": playerItem.picture,
                            "injured": playerItem.injured
                        })

                    }
                })
            })
    }


    //gestion des changements des inputs dans le formulaire
    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setUser({ ...user, [name]: value });
    };

    const handleChangePlayer = (event) => {
        const { name, value } = event.currentTarget;
        setPlayer({ ...player, [name]: value });
    }

    const handleChangePlayerInjured = (event) => {
        let value = event.currentTarget.value 
        if (value && typeof value === "string") {
            if (value === "true"){
                value = true
            } 
            if (value === "false"){
                value = false
            }
        }
        setPlayer({...player, "injured": value})
    }


    const handleSubmit = async (event) => {
        event.preventDefault();

        const apiErrors = {};
        if (user.password !== user.passwordConfirm) {
            apiErrors.passwordConfirm =
                "Votre confimation de mot de passe n'est pas conforme";
            setErrorsPlayer(apiErrors);
            return;
        }

        try {
            await usersAPI.putUserProfil(userId, user)

            //TODO : faire un Flash Success

            setErrors('')
            //redirection vers dashboard
            props.history.replace('/dashboardAdmin')

        } catch (error) {
            const { violations } = error.response.data;
            const apiErrors = [''];
            if (violations) {
                violations.forEach((violation) => {
                    apiErrors[violation.propertyPath] = violation.message;
                });
                setErrors(apiErrors);
            }
        }
    }

    const [binaryPicture, setBinaryPicture] = useState({})

    const onChange = (event) => {
        console.log(event.target.files)
        setBinaryPicture(event.target.files[0])
    }


    var bodyFormData = new FormData();
    bodyFormData.append('image', binaryPicture)

    const handleSubmitPicture = (event) => {
        event.preventDefault();
        setErrorsPlayer("");

        Axios({
                method: 'post',
                url: 'http://localhost:8000/api/upload/test',
                data: bodyFormData,
                headers: {'Content-Type': 'multipart/form-data' }
                })
                .then(function (response) {
                    //handle success
                    console.log(response);
                })
                .catch(function (response) {
                    //handle error
                    console.log(response);
            });
        

       //}else{
       //    const apiErrors = {};   
       //    apiErrors.picture = "Vous n'avez pas selectionné d'image";
       //        setErrorsPlayer(apiErrors);            
       //}
    }

    const handleSubmitPlayer = (event) => {
        event.preventDefault();

        console.log(player)
    }

    return (
        <div className="ProfilForm wrapper_container">
            <h1>Votre profil</h1>
            <div className="form-section">
                <form onSubmit={handleSubmit}>
                    <div className="input-form">
                        <Field
                            name="email"
                            label="Adresse email"
                            placeholder="Votre email..."
                            onChange={handleChange}
                            type="email"
                            value={user.email}
                            error={errors.email}
                        ></Field>
                        <Field
                            name="firstName"
                            label="Prénom"
                            placeholder="Votre prénom..."
                            onChange={handleChange}
                            value={user.firstName}
                            error={errors.firstName}
                        ></Field>
                        <Field
                            name="lastName"
                            label="Nom"
                            placeholder="Votre nom..."
                            onChange={handleChange}
                            value={user.lastName}
                            error={errors.lastName}
                        ></Field>
                        <Field
                            name="phone"
                            label="Téléphone"
                            placeholder="Votre numéro de téléphone..."
                            onChange={handleChange}
                            value={user.phone}
                            error={errors.phone}
                        ></Field>
                        <Field
                            name="birthday"
                            label="Date de naissance"
                            type="date"
                            onChange={handleChange}
                            value={user.birthday}
                            error={errors.birthday}
                        ></Field>
                        <Field
                            name="password"
                            label="Mot de passe"
                            type="password"
                            placeholder="Votre mot de passe..."
                            onChange={handleChange}
                            value={user.password}
                            error={errors.password}
                        ></Field>
                        <Field
                            name="passwordConfirm"
                            label="Confirmation de mot de passe"
                            type="password"
                            placeholder="Confirmez votre mot de passe..."
                            onChange={handleChange}
                            value={user.passwordConfirm}
                            error={errors.passwordConfirm}
                        ></Field>
                    </div>
                    <div className="form-group submit-btn">
                        <button type="submit" className="btn btn-success ">
                            Confirmation
                    </button>
                    </div>
                </form>
                {(role !== 'ROLE_PLAYER') && (
                    <div className="logo"></div>
                )}
                {(role === 'ROLE_PLAYER') && (

                    <div className="formPlayer">
                        <form className="formPicture" onSubmit={handleSubmitPicture}>
                            {player.picture && (
                                <img src={player.picture} alt=""></img>
                            )}
                            {!player.picture && (
                                <div className="user-picture"></div>
                            )}
                            <div className="input-picture">

                                <label htmlFor="picture">Changer la photo de profil</label>
                                <input type="file" onChange={onChange}
                                    id="picture" name="picture"
                                    accept="image/png, image/jpeg"
                                    style={{visibility:"hidden"}}/>

                            </div>
                            <div className="form-group submit-btn">
                                <button className="btn btn-success">
                                    Enregistrer
                                </button>
                            </div>
                            {errorsPlayer.picture && <p className="invalid-feedback-custom">{errorsPlayer.picture}</p>}
                        </form>


                        <form onSubmit={handleSubmitPlayer}>
                            <Field
                                name="height"
                                label="Taille:"
                                placeholder="...cm"
                                value={player.height}
                                onChange={handleChangePlayer}
                                error={errorsPlayer.height}
                            ></Field>
                            <Field
                                name="weight"
                                label="Poids:"
                                placeholder="...Kg"
                                value={player.weight}
                                onChange={handleChangePlayer}
                                error={errorsPlayer.weight}
                            ></Field>
                            {player.injured === false && (
                                <p className="injured-info">Vous n'êtes pas blessé actuellement</p>
                            )}
                            {player.injured === true && (
                                <p className="injured-info">Vous êtes actuellement blessé</p>
                            )}
                            <div className="select-div">
                                <p>Changer votre statut :</p>
                                <div>
                                    <div>
                                        <input type="radio" name="injured" id="Oui" onChange={handleChangePlayerInjured} value={true} checked={player.injured === true}/>
                                        <label htmlFor="Oui">Oui</label>
                                    </div>
                                    <div>
                                        <input type="radio" name="injured" id="Non" onChange={handleChangePlayerInjured} value={false} checked={player.injured === false}/>
                                        <label htmlFor="Non">Non</label>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group submit-btn">
                                <button className="btn btn-success">
                                    Enregistrer
                                </button>
                            </div>
                        </form>


                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilForm;