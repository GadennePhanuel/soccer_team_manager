import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';

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

    useEffect(() => {
        Axios.get('http://localhost:8000/api/coaches')
            .then(response => response.data['hydra:member'])
            .then(data => setCoachs(data))
    })

    
    const handleDelete = (id) => {
        console.log(id)

        //copie du tableau original
        const originalCoachs = [...coachs];

        //supression de l'affichage du coach selectionné
        setCoachs(coachs.filter((coach) => coach.id !== id));

        Axios.delete("http://localhost:8000/api/coaches/" + id)
            .then(response => console.log("ok"))
            .catch(error =>{
                setCoachs(originalCoachs);
                console.log(error.response);
            })
    }



    return (
        <>
            <h1>Page des coachs pour l'admin</h1>

            <div>
                <h2>Liste des coachs du club</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>phone</th>
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