import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import Field from "../components/forms/Field";
import "../../scss/pages/TeamsAdminPage.scss";

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

    const [coachs, setCoachs] = useState([])

    const [errors] = useState({
        label: ""
    });
    const [editTeam, setEditTeam] = useState({
        label: "",
        coach: ""
    });

    const categories = ["Cadet", "Junior", "Senior"]

    const [refreshKey, setRefreshKey] = useState([0])
    useEffect(() => {
        //  setCategories(["Cadet", "Junior", "Senior"]);
        teamAPI.findAllTeams()
            .then(data => setTeams(data))
            .catch(error => console.log(error.response))
        coachAPI.findAllCoach()
            .then(data => setCoachs(data))
            .catch(error => console.log(error.response))
    }, [refreshKey]);

    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setEditTeam({ ...editTeam, [name]: value })
    //    console.log(editTeam)
    };

    const handleSubmit = async (event) => {
    //    console.log("creation")
        event.preventDefault();
        if (editTeam.coach !== "") {
            editTeam.coach = "/api/coaches/" + editTeam.coach
        }
        else {
            editTeam.coach = null
        }
        editTeam.club = "/api/clubs/" + clubId
        teamAPI.postTeam(editTeam)
            //.then(data => [...teams, data])
            .then(setRefreshKey(oldKey => oldKey + 1))
            .catch(error => console.log(error.response))
    }

    const handleDelete = id => {
        //copie du tableau original
        console.log(editTeam)
        const originalTeams = [...teams];

        //supression de l'affichage du coach selectionné
        setTeams(teams.filter((team) => team.id !== id));

        teamAPI.deleteTeam(id)
            .then(response => console.log("delete team success " + id))
            .catch(error => {
                setTeams(originalTeams);
            });
    };

    const handlePutTeam = id => {
        handleCanceled(id)
        console.log(editTeam)
        // team.label = document.getElementById('input-labelTeam-'+team.id).value
        //team.coach = document.getElementById('coachSelect-'+team.id).value
        //team.coach = "/api/coaches/"+team.coach
        if (editTeam.coach !== "") {
            console.log("IRImaker!")
            editTeam.coach = "/api/coaches/" + editTeam.coach
            //setEditTeam({ ...editTeam, coach: "/api/coaches/"+editTeam.coach })
        }
        else {
            editTeam.coach = null
        }

        teamAPI.putTeam(id, editTeam.label, editTeam.coach)
            .then(setRefreshKey(oldKey => oldKey + 1))
            // .then(data => [...teams, data])
            .catch(error => console.log(error.response))
    }

    /**
     * switch hidden sur clic btn-edit
     */
    const handleEdit = (teamId) => {

        changeHidden('btn-delete-', teamId)
        changeHidden('btn-put-', teamId)
        changeHidden('coachSelect-', teamId)
        changeHidden('labelCoach-', teamId)
        changeHidden('labelTeam-', teamId)
        changeHidden('input-labelTeam-', teamId)
        changeHidden('btn-edit-', teamId)
        changeHidden('btn-canceled-', teamId)
        setEditTeam({
            ...editTeam,
            label: document.getElementById('input-labelTeam-' + teamId).value,
            coach: document.getElementById('coachSelect-' + teamId).value
        })
    }

    const handleCanceled = (teamId) => {
        changeHidden('btn-delete-', teamId)
        changeHidden('btn-put-', teamId)
        changeHidden('coachSelect-', teamId)
        changeHidden('labelCoach-', teamId)
        changeHidden('labelTeam-', teamId)
        changeHidden('input-labelTeam-', teamId)
        changeHidden('btn-edit-', teamId)
        changeHidden('btn-canceled-', teamId)
    }

    const changeHidden = (btnName, id) => {
        return document.getElementById(btnName + id).hidden === true ?
            document.getElementById(btnName + id).hidden = false
            :
            document.getElementById(btnName + id).hidden = true
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
                        value={editTeam.label}
                        error={errors.label}
                        required
                    />
                    <div id="select-container">
                        <div className="select-box" id="select-box-1">
                            <label htmlFor="categorySelect"> Categorie: </label>
                            <select
                                id="categoryselect"
                                className="form-control"
                                name="category"
                                onChange={handleChange}
                                placeholder="choix categorie"
                                required
                            >
                                <option> choix de la categorie </option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                )
                                )}
                            </select>
                        </div>
                        <div className="select-box">
                            <label htmlFor="coachSelect"> Coach: </label>
                            <select id="coachSelect" className="form-control" name="coach" onChange={handleChange}>
                                <option value=""> choix du coach </option>
                                {coachs.map(coach => (
                                    <option key={coach.id} value={coach.id}>
                                        {coach.user.firstName} {coach.user.lastName}
                                    </option>
                                )
                                )}
                            </select>
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-create" type="submit" >
                            Créer
                        </button>
                    </div>
                </form>
            </div>
            <div id="teamsBox">
                {categories.map((cat, index) => (
                    <div key={index} className="catBox">
                        <h3>{cat}</h3>
                        <table className="table table-hover">
                            <thead>
                                <tr className="thead-color">
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
                                                <p id={"labelTeam-" + tm.id}>
                                                    {tm.label}
                                                </p>
                                                <input
                                                    hidden
                                                    id={"input-labelTeam-" + tm.id}
                                                    type="text"
                                                    name="label"
                                                    label="Nom d'équipe"
                                                    onChange={handleChange}
                                                    defaultValue={tm.label}
                                                    //value={tm.label}
                                                    error={errors.label}
                                                />

                                            </td>
                                            <td>
                                                <select
                                                    hidden
                                                    id={"coachSelect-" + tm.id}
                                                    name="coach"
                                                    onChange={handleChange}
                                                    defaultValue={tm.coach ? tm.coach.id : null}
                                                // value={tm.coach ? tm.coach.id :""}
                                                >
                                                    <option value=""> choix du coach </option>
                                                    {coachs.map(coach => (
                                                        <option key={coach.id} value={coach.id}>
                                                            {coach.id} {coach.user.firstName} {coach.user.lastName}
                                                        </option>
                                                    )
                                                    )}
                                                </select>
                                                {
                                                    // <td>{tm.coach.user.firstName} {tm.coach.user.lastName}</td> : <td>N/A</td>
                                                }
                                                <p id={"labelCoach-" + tm.id}>
                                                    {tm.coach ?
                                                        tm.coach.id + " " + tm.coach.user.firstName + " " + tm.coach.user.lastName
                                                        :
                                                        "N/A"
                                                    }
                                                </p>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(tm.id)}
                                                    id={"btn-edit-" + tm.id}
                                                    className="btn btn-sm btn-success">
                                                    edit
                                            </button>
                                                <button
                                                    hidden
                                                    onClick={() => handleCanceled(tm.id)}
                                                    id={"btn-canceled-" + tm.id}
                                                    className="btn btn-sm btn-success">
                                                    annuler
                                            </button>
                                                <button
                                                    hidden
                                                    onClick={() => handlePutTeam(tm.id)}
                                                    id={"btn-put-" + tm.id}
                                                    className="btn btn-sm btn-success">
                                                    valider
                                            </button>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(tm.id)}
                                                    id={"btn-delete-" + tm.id}
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

