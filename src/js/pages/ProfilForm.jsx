import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import Field from '../components/forms/Field';
import usersAPI from '../services/usersAPI';
import dateFormat from 'dateformat';
import authAPI from '../services/authAPI';

const ProfilForm = (props) => {
    authAPI.setup();
    //si c'est un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }

    const userId = usersAPI.findUserId();

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

    const fetchUser = async id => {
        try {
            const response = await Axios.get("http://localhost:8000/api/users/" + id)
            const email = response.data.email;
            const lastName = response.data.lastName;
            const firstName = response.data.firstName;
            const birthday = dateFormat(response.data.birthday, "yyyy-mm-dd");
            const phone = response.data.phone;

            setUser({ email, lastName, firstName, birthday, phone })
        } catch (error) {
            console.log(error.response)
        }
    }

    // au chargement de la page, récupérer les infos de l'user connecté via requete HTTP
    useEffect(() => {
        fetchUser(userId);
    }, [userId])

    //gestion des changements des inputs dans le formulaire
    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setUser({ ...user, [name]: value });
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        const apiErrors = {};
        if (user.password !== user.passwordConfirm) {
            apiErrors.passwordConfirm =
                "Votre confimation de mot de passe n'est pas conforme";
            setErrors(apiErrors);
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