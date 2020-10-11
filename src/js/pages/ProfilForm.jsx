import React, { useState } from 'react';
import Field from '../components/forms/Field';
import usersAPI from '../services/usersAPI';

const ProfilForm = (props) => {
    //si c'est un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }

    const userId = usersAPI.findUserId();
    console.log(userId)

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

    //setUser au chargement de la page via requete HTTP


    //gestion des changements des inputs dans le formulaire
    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setUser({ ...user, [name]: value });
    };


    const handleSubmit = (event) => {
        event.preventdefault();
    }

    return (
        <>
            <h1>Modifier vos informations</h1>
            <form onSubmit={handleSubmit}>
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

                <div className="form-group">
                    <button type="submit" className="btn btn-success">
                        Confirmation
                    </button>
                </div>
            </form>
        </>
    );
}

export default ProfilForm;