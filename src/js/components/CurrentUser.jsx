import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import usersAPI from '../services/usersAPI';
import Select from '../components/forms/Select';
import teamAPI from '../services/teamAPI';
import "../../scss/components/CurrentUser.scss";
import TeamContext from '../contexts/TeamContext';

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

            if (usersAPI.checkRole() === "ROLE_COACH") {
                teamAPI.findAllTeams()
                    .then(data => {
                        setTeams(data)
                        let select = document.getElementById('team')

                        if (select !== null) {
                            if (select.options[select.selectedIndex] !== undefined) {
                                let teamId = select.options[select.selectedIndex].value;
                                setCurrentTeamId(teamId)
                            }
                        }
                    })
                    .catch(error => console.log(error.response))

            }

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])


    const { setCurrentTeamId } = useContext(TeamContext)


    const handleChange = (event) => {
        event.preventDefault()
        let select = document.getElementById('team')

        let teamId = select.options[select.selectedIndex].value;
        setCurrentTeamId(teamId)


    }





    return (
        <>
            {(isAuthenticated === true && user.role === 'ROLE_COACH') && (
                <div className="CurrentUser">
                    <div className="currentUser">
                        <Link to="/profil">{user.firstName} {user.lastName}</Link>
                        <Select
                            name="team"
                            onChange={handleChange}
                        >
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>{team.label} {team.category}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            )}
        </>
    );
}

export default CurrentUser;