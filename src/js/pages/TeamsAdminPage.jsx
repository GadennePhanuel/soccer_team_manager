import React, {useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import Field from "../components/forms/Field";
import CategorySlider from "../components/CategorySlider";

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
    const clubId = usersAPI.checkClub();
    if (clubId === "new") {
        props.history.replace("/createClub/new")
    }

    const [teams, setTeams] = useState([])
    //console.log(teams)
    //const [categories, setCategories] = useState([])

    const [coachs, setCoachs] = useState([])

    const [errors, setErrors] = useState({
        label: ""
    });
    const [team, setTeam] = useState ({
        label: "",
        category : "",
        coach: null,
        club: "/api/clubs/" + clubId
    });

    const [teamToForm, setTeamToForm] = useState({
        label: "",
        category: "",
        coach: null
    })

    const [refreshKey, setRefreshKey] = useState(0);

    const categories =  ["Cadet", "Junior", "Senior"]

    useEffect(() => {
      //  setCategories(["Cadet", "Junior", "Senior"]);
        teamAPI.findAllTeams()
            .then(data => setTeams(data))
            .catch(error => console.log(error.response))
        coachAPI.findAllCoach()
            .then(data => setCoachs(data))
            .catch(error => console.log(error.response))
    },[refreshKey]);

    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setTeam({ ...team, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(team.coach !== null){
            team.coach = "/api/coaches/"+team.coach
        }
       // console.log(team);
        teamAPI.postTeam(team)
            .then(setRefreshKey(oldKey => oldKey +1))
            .then(response => console.log("create success"))
            .catch(error => console.log(error.response))
       // const response = await teamAPI.postTeam(team)
    }

    const handleDelete = id => {
        //copie du tableau original
        const originalTeams = [...teams];

        //supression de l'affichage du coach selectionné
        setTeams(teams.filter((team) => team.id !== id));

        teamAPI.deleteTeam(id)
            .then(response => console.log("delete team success"))
            .catch(error => {
                setTeams(originalTeams);
            });
    };

    const handleEdit = () => {
        document.getElementById('btn-invit').hidden = true
        document.getElementById('form-invit').hidden = false
    }

    const toForm = (team) => {
       // setTeamToForm(team)
    }

    {
        /*
         //puis select les lignes de categorySliders pour remplir formulaire de modife ( que le nom et le coach)
         pas de raison de changer une team nde categorie
         puis suppr et enfin delete
        */
    }

    return (
        <div className="TeamsAdminPage wrapper_container">
            <h1>Equipes du club</h1>
            <div id="createTeam">
                <form onSubmit={handleSubmit} className='formTeam'>
                    <Field
                        name="label"
                        label="Nom d'équipe"
                        placeholder="Nom d'équipe'..."
                        onChange={handleChange}
                        value={team.label}
                        error={errors.label}
                        required
                    />
                    <label htmlFor="categorySelect"> Categorie: </label>
                    <select id="categoryselect" name="category" onChange={handleChange} placeholder="choix categorie" required>
                        <option> choix de la categorie </option>
                        {categories.map((category, index)=> (
                            <option key={index} value={category}>
                                {category}
                            </option>
                            )
                        )}
                    </select>
                    <label htmlFor="coachSelect"> Option: </label>
                    <select id="coachSelect" name="coach" onChange={handleChange}>
                        <option> choix du coach </option>
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
                {categories.map((cat, index) => (
                    <div key={index} className="catBox">
                        <h2>{props.cat}</h2>
                        <table>
                            <thead>
                            <tr>
                                <th>Equipe</th>
                                <th>Coach</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {teams.filter(team => team.category === cat).length !== 0 ?
                                teams.filter(team => team.category === cat).map(tm =>
                                    <tr key={tm.id} onClick={toForm(tm)}>
                                        <td>{tm.label}</td>
                                        {tm.coach ?
                                            <td>{tm.coach.user.firstName} {tm.coach.user.lastName}</td> : <td>N/A</td>
                                        }
                                        <td>
                                            <button
                                                onClick={() => handleDelete(teamToForm.id)}
                                                id="deletBtn"
                                                className="btn btn-sm btn-danger">
                                                X
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm">
                                                edit
                                            </button>
                                        </td>
                                    </tr>
                                )
                                :
                                <tr>
                                    <td>
                                        Il n'y a aucune équipe dans cette catégorie
                                    </td>
                                </tr>
                            }
                            </tbody>
                        </table>
                    </div>
                    )
                )}
            </div>
            <div>
                <table>
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Coach</th>
                        <th>Category</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{teamToForm.label}</td>
                        <td>{teamToForm.coach}</td>
                        <td>{teamToForm.category}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td>
                            <button
                                onClick={() => handleDelete(teamToForm.id)}
                                className="btn btn-sm btn-danger">
                                X
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TeamsAdminPage;

{/*
                        <CategorySlider
                            key={index}
                            teams={teams.filter(team => team.category === cat)}
                            cat={cat}
                        />
                 */}