import React, {useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import Field from "../components/forms/Field";

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

    const [selectedTeam, setSelectedTeam] = useState("")

    const handleEdit = (teamId) => {

        selectedTeam !== "" &&
            closeSelected(selectedTeam)

        changeHidden('btn-delete-', teamId)
        changeHidden('btn-put-',teamId)
        changeHidden('coachSelect-',teamId)
        changeHidden('labelCoach-',teamId)
        changeHidden('labelTeam-',teamId)
        changeHidden('input-labelTeam-',teamId)
        changeHidden('btn-edit-',teamId)
        setSelectedTeam(teamId)
    }

    const closeSelected = (teamId) => {
        changeHidden('btn-delete-',teamId)
        changeHidden('btn-put-',teamId)
        changeHidden('coachSelect-',teamId)
        changeHidden('labelCoach-',teamId)
        changeHidden('labelTeam-',teamId)
        changeHidden('input-labelTeam-',teamId)
        changeHidden('btn-edit-',teamId)
    }

    const changeHidden = (element, Id) => {
        console.log(element + Id)
        return document.getElementById(element + Id).hidden === true ?
            document.getElementById(element + Id).hidden = false
        :
            document.getElementById(element + Id).hidden = true
    }

    const handlePutChange = () => {

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
                    <select
                        id="categoryselect"
                        name="category"
                        onChange={handleChange}
                        placeholder="choix categorie"
                        required
                    >
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
                {categories.map((cat, index) => (
                    <div key={index} className="catBox">
                        <h3>{cat}</h3>
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
                                    <tr key={tm.id}>
                                        <td>
                                            <p
                                                id={"labelTeam-" + tm.id}
                                            >
                                                {tm.label}
                                            </p>
                                            { // todo j'ai utilisé input plutot que le composant Field, parce que le Hidden ne fonctionnait pas avec.
                                            }
                                            <input
                                                hidden
                                                id={"input-labelTeam-"+tm.id}
                                                type="text"
                                                name="label"
                                                label="Nom d'équipe"
                                                onChange={handlePutChange}
                                                defaultValue={tm.label}
                                             //   value={tm.label}
                                                error={errors.label}
                                            />

                                        </td>
                                        <td>
                                            <select
                                                hidden
                                                id={"coachSelect-" + tm.id}
                                                name="coach"
                                                onChange={handleChange}
                                                defaultValue={tm.coach ? tm.coach.id :""}
                                            >
                                            <option value=""> choix du coach </option>
                                            {coachs.map(coach => (
                                                    <option key={coach.id} value={coach.id}>
                                                        {coach.user.firstName} {coach.user.lastName}
                                                    </option>
                                                )
                                            )}
                                            </select>
                                                {
                                                    // <td>{tm.coach.user.firstName} {tm.coach.user.lastName}</td> : <td>N/A</td>
                                                }
                                            <p
                                                id ={"labelCoach-"+tm.id}
                                            >
                                                {tm.coach ?
                                                    tm.coach.user.firstName + " " + tm.coach.user.lastName
                                                    :
                                                    "N/A"
                                                }
                                            </p>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleEdit(tm.id)}
                                                id={"btn-edit-"+tm.id}
                                                className="btn btn-sm btn-success">
                                                edit
                                            </button>
                                            <button
                                                hidden
                                                onClick={() => handleEdit(tm.id)}
                                                id={"btn-put-"+tm.id}
                                                className="btn btn-sm btn-success">
                                                valider
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                hidden
                                                onClick={() => handleDelete(tm.id)}
                                                id={"btn-delete-"+tm.id}
                                                className="btn btn-sm btn-danger">
                                                supprimer
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