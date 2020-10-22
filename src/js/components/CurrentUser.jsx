import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import usersAPI from '../services/usersAPI';
import Select from '../components/forms/Select';
import teamAPI from '../services/teamAPI';
import "../../scss/components/CurrentUser.scss";

const CurrentUser = (props) => {
    const { isAuthenticated } = useContext(AuthContext);


    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        role: ''
    })

    const [teams, setTeams] = useState([])


    const token = window.localStorage.getItem("authToken");
    useEffect(() => {
        if (token) {
            setUser({
                'firstName': usersAPI.checkFirstName(),
                'lastName': usersAPI.checkLastName(),
                'role': usersAPI.checkRole()
            });

            teamAPI.findAllTeams()
                .then(data => setTeams(data))
                .catch(error => console.log(error.response))
        }
    }, [token])



    const handleChange = (event) => {
        event.preventDefault()
        let select = document.getElementById('team')
        console.log(select.options[select.selectedIndex].value)

    }





    return (
        <div className="CurrentUser">
            {(isAuthenticated === true && user.role === 'ROLE_COACH') && (
                <div className="currentUser">
                    <Link to="/profil">{user.firstName} {user.lastName}</Link>
                    <Select
                        label="Equipe"
                        name="team"
                        onChange={handleChange}
                    >
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.label} {team.category}</option>
                        ))}
                    </Select>
                </div>
            )}
        </div>
    );
}

export default CurrentUser;