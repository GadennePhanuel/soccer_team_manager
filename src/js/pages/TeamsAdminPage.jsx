import React, {useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import Field from "../components/forms/Field";
import clubAPI from "../services/clubAPI";

const TeamsAdminPage = (props) => {
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

    const [teams, setTeams] = useState([])
    const [categories, setCategories] = useState([])
    const [coachs, setCoachs] = useState([])
    const [errors, setErrors] = useState({
        label: ""
    });

    useEffect(() => {
        setCategories(["Cadet", "Junior", "Senior"]);
        teamAPI.findAllTeams()
            .then(data => setTeams(data))
            .catch(error => console.log(error.response));
        coachAPI.findAllCoach()
            .then(data => setCoachs(data))
            .catch(error => console.log(error.response))
    },[]);

    console.log(teams)


    const handleDelete = id => {
        //copie du tableau original
        const originalTeams = [...teams];

        //supression de l'affichage du coach selectionné
        setTeams(teams.filter((team) => team.id !== id));

        teamAPI.deleteTeam(id)
            .then(response => console.log("supression team ok"))
            .catch(error => {
                setTeams(originalTeams);
            });
    };

    const handleChange = (event) => {
        console.log( event.target.value);
        let [newCoach, team] = event.target.value.split('/');
        team.coach.id = newCoach.id;

      //  setTeams({ ...teams, [coach]: event.target.value });

        teamAPI.putTeam(team)
            .then(response => console.log("change success"))
            .catch(error => console.log(error.response))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await teamAPI.postTeam(team)
    }

    return (
        <>
            <h1>Equipes du club</h1>
            <div id="createTeam">
                <form onSubmit={handleSubmit} className='formTeam'>
                    <Field
                        name="label"
                        label="Nom d'équipe"
                        value={this.state.value}
                        placeholder="Nom d'équipe'..."
                        error={errors.label}
                    >
                    </Field>
                    <select name="category">
                        {categories.map(category => (
                            <option key={categories.index} value={this.state.value}>
                                {category}
                            </option>
                            )
                        )}
                    </select>
                    <select name="coach">
                        {coachs.map(coach => (
                                <option key={coach.id} value={coach.id}>
                                    {coach.user.firstName} {coach.user.lastName}
                                </option>
                            )
                        )}
                    </select>
                <div >
                    <button type="submit" >
                        Créer
                    </button>
                </div>
            </form>
            </div>

            <div id="teamsBox">
                <h2>Liste des teams du club</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Coach</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                    {teams.map(team => (
                        <tr key={team.id}>
                            <td>{team.label}</td>
                            <td>{team.category}</td>
                            <td>
                                <select onChange={handleChange}>
                                    {coachs.map(coach => (
                                        <option key={coach.id}
                                            value={coach +'/'+ team}
                                            selected={team.coach.id === coach.id ? "selected" : ""}
                                        >
                                            {coach.user.firstName} {coach.user.lastName}
                                        </option>
                                        )
                                    )}
                                </select>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleDelete(team.id)}
                                    className="btn btn-sm btn-danger">
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div id="playersBox">
            </div>
        </>
    );
}

export default TeamsAdminPage;