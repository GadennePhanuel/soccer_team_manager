import JwtDecode from 'jwt-decode';
import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import Field from '../components/forms/Field';
import AuthContext from '../contexts/AuthContext';
import AuthAPI from '../services/authAPI';
import clubAPI from '../services/clubAPI';
import usersAPI from '../services/usersAPI';

const ClubFormPage = (props) => {
    authAPI.setup();

    const { setIsAuthenticated } = useContext(AuthContext);
    const { id } = props.match.params;

    const [club, setClub] = useState({
        label: ""
    });
    const [errors, setErrors] = useState({
        label: ""
    });

    const [editing, setEditing] = useState(false);

    const handleChange = (event) => {
        const value = event.currentTarget.value;
        const name = event.currentTarget.name;

        setClub({ ...club, [name]: value });
    };

    //récupération de l'id de l'user connecté
    const token = window.localStorage.getItem("authToken");
    const jwtData = JwtDecode(token);
    const userId = jwtData.id

    /**
     * récupération du club en fonction de l'id
     * @param {} id
     */
    const fetchClub = async id => {
        //si on est sur la modif de son club, requete HTTP pour récupérer le club en question
        try {
            const data = await clubAPI.findClub(id)
            const { label } = data;
            setClub({ label })
        } catch (error) {
            console.log(error.response)
        }
    }

    useEffect(() => {
        if (id !== "new") {
            setEditing(true)
            fetchClub(id)
        }
    }, [id])

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (editing) {
                await clubAPI.putClub(id, club)

                //TODO : falsh success
                //redirection sur le dashboardAdmin
                props.history.replace('/dashboardAdmin');
            } else {
                const response = await clubAPI.postClub(club)
                const clubId = response.data.id

                await usersAPI.putUserClub(userId, clubId)

                //TODO: falsh Success
                //déconnection auto pour forcer un relog
                AuthAPI.logout();
                setIsAuthenticated(false);
                props.history.push("/login");
            }
            setErrors('')
        } catch (error) {
            console.log(error.response)
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
            {(!editing && <h1>Création de votre club</h1>) || <h1>Modification du club</h1>}
            <form onSubmit={handleSubmit} className='formClub'>
                <Field
                    name="label"
                    label="Nom de votre club"
                    value={club.label}
                    placeholder="Nom du club..."
                    error={errors.label}
                    onChange={handleChange}
                >
                </Field>
                <div >
                    <button type="submit" >
                        Enregistrer
                    </button>
                </div>
            </form>
        </>
    );
}

export default ClubFormPage;