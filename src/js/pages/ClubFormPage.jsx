import JwtDecode from 'jwt-decode';
import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import Field from '../components/forms/Field';
import AuthContext from '../contexts/AuthContext';
import authAPI from '../services/authAPI';
import AuthAPI from '../services/authAPI';
import clubAPI from '../services/clubAPI';
import usersAPI from '../services/usersAPI';
import '../../scss/pages/ClubFormPage.scss';
import Loader from 'react-loader-spinner';
import notification from '../services/notification';

const ClubFormPage = (props) => {
    authAPI.setup();

    const { setIsAuthenticated } = useContext(AuthContext);

    const [club, setClub] = useState({
        label: ""
    });
    const [errors, setErrors] = useState({
        label: ""
    });


    const [loading2, setLoading2] = useState(false)

    const handleChange = (event) => {
        const value = event.currentTarget.value;
        const name = event.currentTarget.name;

        setClub({ ...club, [name]: value });
    };

    //récupération de l'id de l'user connecté
    const token = window.localStorage.getItem("authToken");
    const jwtData = JwtDecode(token);
    const userId = jwtData.id



    useEffect(() => {
        //commencer par verifier que la personne connecté soit biien un Admin, si c'est pas le cas --> redirection vers son dashboard correspondant
        let role = usersAPI.checkRole()
        if (role === "ROLE_COACH") {
            props.history.replace("/dashboardCoach")
        } else if (role === "ROLE_PLAYER") {
            props.history.replace("/dashboardPlayer")
        }
        //ensuite vérifier qu'il n'a pas déja un club d'assigner, si il a déja un club ---> redirection 
        let club = usersAPI.checkClub()
        if (club !== "new") {
            props.history.replace("/dashboardAdmin")
        }
    }, [props.history])

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading2(true)
        try {

            const response = await clubAPI.postClub(club)
            const clubId = response.data.id

            await usersAPI.putUserClub(userId, clubId)

            //TODO: falsh Success
            notification.successNotif("Votre club a bien été créé ! Vous pouvez vous reconnecter")
            //déconnection auto pour forcer un relog
            AuthAPI.logout();
            setIsAuthenticated(false);
            props.history.push("/login");

            setErrors('')
        } catch (error) {
            notification.errorNotif("Une erreur est survenue")
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
        <div className="ClubFormPage wrapper_container">
            <h1>Création de votre club</h1>

            <form onSubmit={handleSubmit} className='formClub'>
                <Field
                    name="label"
                    label="Nom du club"
                    value={club.label}
                    placeholder="Nom du club..."
                    error={errors.label}
                    onChange={handleChange}
                >
                </Field>
                <div >
                    {!loading2 && (
                        <button type="submit" className="btn btn-primary">
                            Enregistrer
                        </button>
                    )}
                    {loading2 && (
                        <div className="LoaderModal">
                            <Loader type="ThreeDots" height="20" width="508" color="LightGray" />
                        </div>
                    )}
                </div>
            </form>

        </div>
    );
}

export default ClubFormPage;