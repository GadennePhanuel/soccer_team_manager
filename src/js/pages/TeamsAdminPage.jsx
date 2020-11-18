import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import Field from "../components/forms/Field";
import "../../scss/pages/TeamsAdminPage.scss";
import Select from "../components/forms/Select";

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
    const categories = ["Cadet", "Junior", "Senior"]
    const [errors, setErrors] = useState({});
    console.log(errors.label)

    const [newTeam, setNewTeam] = useState({
        label:"",
        category:""
    })
    const [errorsNewTeam, setErrorsNewTeam] = useState({
        label:"",
        category:""
    })

    const [editTeam, setEditTeam] = useState({
        label:"",
        category:"",
        coach:""
    });

    const [refreshKey, setRefreshKey] = useState([0])

    useEffect(() => {
        teamAPI.findAllTeams()
            .then(data => {
                data.forEach(team => {
                    if(!(team.coach)) {
                        team.coach = "non assigné"
                    }
                })
                setTeams(data)
            })
            .catch(error => console.log(error.response))
        coachAPI.findAllCoach()
            .then(data => setCoachs(data))
            .catch(error => console.log(error.response))
    }, [refreshKey]);

    const handleNewTeamChange = (event) => {
        const { name, value } = event.currentTarget;
        setNewTeam({ ...newTeam, [name]: value })
    }

    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setEditTeam({ ...editTeam, [name]: value })
    }

    const handleSubmit = async (event) => {
        console.log("creation")
        console.log(newTeam)
        event.preventDefault();
        if (newTeam.coach && newTeam.coach !== "") {
            newTeam.coach = coachs.filter(coach => Number(newTeam.coach) === coach.id)[0]["@id"]
        }
        else {
            newTeam.coach = null
        }
        newTeam.club = "/api/clubs/" + clubId
        teamAPI.postTeam(newTeam)
            .then(response => {
                setErrorsNewTeam({label: "", category: ""})
                setNewTeam({label:"", category:""})
                setRefreshKey(oldKey => oldKey + 1)
                document.getElementById('showFormDiv').hidden = false
                document.getElementById('form-create').hidden = true
            })
            .catch(error => {
                const { violations } = error.response.data;
                const apiErrors = {};
                if (violations) {
                    violations.forEach((violation) => {
                        apiErrors[violation.propertyPath] = violation.message;
                    });
                }
                setErrorsNewTeam(apiErrors)
            })
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
        let IRIcoach = null;
        if (editTeam.coach && editTeam.coach !== "non assigné") {
            IRIcoach = coachs.filter(coach => Number(editTeam.coach) === coach.id)[0]["@id"]
        }

        teamAPI.putTeam(id, editTeam.label, IRIcoach)
            .then(response => {
                setEditTeam({label:"", category:"", coach:""})
                setErrors({label:""})
                setRefreshKey(oldKey => oldKey + 1)
            })
            .catch(error => {
                const { violations } = error.response.data;
                const apiErrors = {};
                if (violations) {
                    violations.forEach((violation) => {
                        apiErrors[violation.propertyPath] = {teamId:id,message:violation.message};
                    });
                }
                //todo faire un tableau des erreurs? ou garger l'id team de la team conscerné
                setErrors(apiErrors)
            })
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

    const [search, setSearch] = useState("");

    const handleSearch = event => {
        const value = event.currentTarget.value;
        setSearch(value);
    }

    const filteredTeams = teams.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.coach === "non assigné" && t.coach.toLowerCase().includes(search.toLowerCase()) ||
        t.coach !== "non assigné" && t.coach.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        t.coach !== "non assigné" && t.coach.user.lastName.toLowerCase().includes(search.toLowerCase())
    )

    const handleCreate = () => {
        document.getElementById('showFormDiv').hidden = true
        document.getElementById('form-create').hidden = false
    }

    const handleCancelCreate = () => {
        document.getElementById('showFormDiv').hidden = false
        document.getElementById('form-create').hidden = true
    }

    return (
        <div className="wrapper_container TeamsAdminPage ">
            <h1>Equipes du club</h1>
            <div id="createTeam">
                <div id="showFormDiv" className="wrapper">
                    <button onClick={() => handleCreate()} className="btn btn-primary">
                        Créer une équipe
                    </button>
                </div>
                <form id="form-create" className='formTeam' onSubmit={handleSubmit} hidden>
                    <fieldset>
                        <legend>Création d'équipe</legend>
                        <Field
                            name="label"
                            label="Nom d'équipe"
                            placeholder="Nom d'équipe'..."
                            onChange={handleNewTeamChange}
                            value={newTeam && newTeam.label}
                            error={errorsNewTeam.label}
                            required
                        />
                        <div id="select-container">
                            <div className="select-box" id="select-box-1">
                                {/*<label htmlFor="categorySelect"> Categorie: </label>*/}
                                {/*Select = ({ name, label, value, error, onChange, children })*/}
                                <Select
                                    name="category"
                                    label="Categorie"
                                    value={newTeam && newTeam.category}
                                    error={errorsNewTeam.category}
                                    onChange={handleNewTeamChange}
                                    children={[
                                        <option value=""> choix de la categorie </option>,
                                        categories.map((category, index) => (
                                            <option key={index} value={category}>
                                            {category}
                                            </option>
                                        ))
                                    ]}
                                    required
                                    />
                                {/*<select
                                    id="categoryselect"
                                    className="form-control"
                                    name="category"
                                    onChange={handleChange}
                                    placeholder="choix categorie"
                                    required
                                >
                                    <option value=""> choix de la categorie </option>
                                    {categories.map((category, index) => (
                                            <option key={index} value={category}
                                            >
                                                {category}
                                            </option>
                                        )
                                    )}
                                </select>*/}
                            </div>
                            <div className="select-box">
                                <Select
                                    name="coach"
                                    label="Coach"
                                    value={newTeam && newTeam.coach}
                                    onChange={handleNewTeamChange}
                                    children={[
                                        <option value=""> choix du coach </option>,
                                        coachs.map(coach => (
                                            <option key={coach.id} value={coach.id}>
                                                {coach.user.firstName} {coach.user.lastName}
                                            </option>
                                        ))
                                    ]}
                                />
                                {/*<label htmlFor="coachSelect"> Coach: </label>
                                <select id="coachSelect" className="form-control" name="coach" onChange={handleChange}>
                                    <option value=""> choix du coach </option>
                                    {coachs.map(coach => (
                                            <option key={coach.id} value={coach.id}>
                                                {coach.user.firstName} {coach.user.lastName}
                                            </option>
                                        )
                                    )}
                                </select>*/}
                            </div>
                        </div>
                        <div id="sendDiv" className="wrapper">
                            <button id="btn-submitCreate" className="btn btn-primary" type="submit" >
                                Envoyer
                            </button>
                            <button id="btn-cancelCreate" className="btn btn-danger" type="button" onClick={() => handleCancelCreate()} >
                                Annuler
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
            <div className="tables_container">
                <div id="div-search" className="form-group">
                    <input className="search form-control" type="text" onChange={handleSearch} value={search} placeholder="Rechercher" />
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr className="thead-color">
                            <th scope="col">Equipe</th>
                            <th scope="col">Categorie</th>
                            <th scope="col">Coach</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeams.length > 0 ?
                            filteredTeams.map(team => (
                                <tr key={team.id} >
                                    <td>
                                        <p id={"labelTeam-" + team.id} >{team.label}</p>
                                        <input
                                            hidden
                                            id={"input-labelTeam-" + team.id}
                                            type="text"
                                            name="label"
                                            onChange={handleChange}
                                            defaultValue={team.label}
                                            //value={tm.label}
                                            //error={errors.label}
                                        />
                                        {errors.label && errors.label.teamId === team.id &&
                                            <p className="error">{errors.label.message}</p>
                                        }
                                    </td>
                                    <td>{team.category}</td>
                                    <td>
                                        {team.coach !== "non assigné" ?
                                                <p id={"labelCoach-" + team.id}>{team.coach.user.firstName + " " + team.coach.user.lastName}</p>
                                            :   <p id={"labelCoach-" + team.id}> {"non assigné"}</p>
                                        }
                                        <select
                                            hidden
                                            id={"coachSelect-" + team.id}
                                            name="coach"
                                            onChange={handleChange}
                                            defaultValue={team.coach !== "non assigné" ? team.coach.id : "non assigné"}
                                            // value={tm.coach ? tm.coach.id :""}
                                        >
                                            <option value=""> choix du coach </option>
                                            {coachs.map(coach => (
                                                    <option key={coach.id} value={coach.id}>
                                                        {coach.user.firstName} {coach.user.lastName}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(team.id)}
                                            id={"btn-edit-" + team.id}
                                            className="btn btn-sm btn-success">
                                            edit
                                        </button>
                                        <button
                                            hidden
                                            onClick={() => handleCanceled(team.id)}
                                            id={"btn-canceled-" + team.id}
                                            className="btn btn-sm btn-success">
                                            annuler
                                        </button>
                                        <button
                                            hidden
                                            onClick={() => handlePutTeam(team.id)}
                                            id={"btn-put-" + team.id}
                                            className="btn btn-sm btn-success">
                                            valider
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(team.id)}
                                            id={"btn-delete-" + team.id}
                                            className="btn btn-sm btn-danger">
                                            supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        : "Aucun résultat"
                        }
                    </tbody>

                </table>
            </div>
        </div>
            /*
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
        </div>*/
    )
}

export default TeamsAdminPage;

