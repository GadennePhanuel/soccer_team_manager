import React, {useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import Field from "../components/forms/Field";
import CategorySlider from "../components/CategorySlider";
import TeamForm from "../components/TeamForm";
import Select from "../components/forms/Select";
import clubAPI from "../services/clubAPI";
import UserAPI from "../services/usersAPI";

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
    console.log(teams)
    const [categories, setCategories] = useState([])

    const [coachs, setCoachs] = useState([])
    const [errors, setErrors] = useState({
        label: ""
    });
    const [team, setTeam] = useState ({
        label: "",
        category : "",
        coach: null,
        club: "/api/clubs/" + usersAPI.checkClub()
    });

    const [teamToForm, setTeamToForm] = useState({
        label: "",
        category: "",
        coach: null
    })

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
        const { name, value } = event.currentTarget;
        setTeam({ ...team, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(team.coach !== null){
            team.coach = "/api/coaches/"+team.coach
        }
        console.log(team);
        teamAPI.postTeam(team)
            .then(response => console.log("create success"))
            .then(setTeams(team))
            .catch(error => console.log(error.response))
       // const response = await teamAPI.postTeam(team)
    }

    {
        /* todo recup id newTeam et getNew Team pour refresh usStae Teams
         .then(response => setArticleId(response.data.id))
         //puis select les lignes de categorySliders pour remplir formulaire de modife ( que le nom et le coach)
         pas de raison de changer une team nde categorie
         puis suppr et enfin delete
        */
    }

    const teamsByCat = cat => {
        return teams.filter(team => team.category === cat)
    }

    return (
        <>
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
                    <div key={index}>
                       <CategorySlider teams={teamsByCat(cat)} category={cat}/>
                    </div>
                    )
                )}
            </div>

            <div>
                {/* <TeamForm team={teamToForm}/> */}
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
                        <td>{team.label}</td>
                        <td>{team.coach}</td>
                        <td>{team.category}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td>
                            <button
                            onClick={() => handleDelete(team.id)}
                            className="btn btn-sm btn-danger">
                            X
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default TeamsAdminPage;


