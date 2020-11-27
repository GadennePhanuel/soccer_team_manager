import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import "../../scss/pages/TeamsAdminPage.scss";
import Select from "../components/forms/Select";
import Loader from "react-loader-spinner";
import Modal from "../components/Modal";

const TeamsAdminPage = (props) => {
    authAPI.setup();

    const role = usersAPI.checkRole();
    if (role === 'ROLE_COACH') {
        props.history.replace("/dashboardCoach")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }

    const clubId = usersAPI.checkClub();
    if (clubId === "new") {
        props.history.replace("/createClub/new")
    }

    const [teams, setTeams] = useState([])
    const [coachs, setCoachs] = useState([])

    const [categories, setCategories] = useState([
        {name:"Cadet",options:[]},
        {name:"Junior",options:[]},
        {name:"Senior",options:[]}
    ])

    const handleLabel = (handle, team) => {
        let labelLetter = team.label.substr(7);
        let cat = categories.filter(cat => cat.name === team.category)[0]

        switch(handle){
            case "add":
                if(!cat.options.includes(labelLetter)){
                    cat.options.push(labelLetter)
                }
                break;
            case "remove":
                if(cat.options.includes(labelLetter)){
                    cat.options.splice(labelLetter)
                }
                break;
            default:
        }
    }

    const getLabelOptions = team => {
        return (
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter, index) => (
                !categories.filter(cat => cat.name === team.category)[0].options.includes(letter) &&
                    <option key={index} value={"Equipe " + letter}>
                    {"Equipe " + letter}
                    </option>
            ))
        )
    }

    const [errors, setErrors] = useState({});

    const [newTeam, setNewTeam] = useState({
        label: "",
        category: ""
    })
    const [errorsNewTeam, setErrorsNewTeam] = useState({
        label: "",
        category: ""
    })

    const [editTeam, setEditTeam] = useState(null);

    const [loadingNew, setLoadingNew] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)

    const [modalType, setModalType] = useState({})
    const [show, setShow] = useState(false)
    const showModal = (modalType, idTarget) => {
        setModalType({ type: modalType, target: idTarget })
        setShow(true)
    }
    const hideModal = () => {
        setShow(false)
        setModalType('')
    }

    useEffect(() => {
        setLoading(true)
        setLoading2(true)
        teamAPI.findAllTeams()
            .then(data => {
                data.forEach(team => {
                    if (!(team.coach)) {
                        team.coach = "non assigné"
                    }
                    handleLabel("add", team)
                })
                setTeams(data)
            })
            .catch(error => console.log(error.response))
            .finally(()=>{
                setLoading(false)
                setLoading2(false)
            })
        coachAPI.findAllCoach()
            .then(data => setCoachs(data))
            .catch(error => console.log(error.response))
    }, []);

    const handleNewTeamChange = (event) => {
        const { name, value } = event.currentTarget;
        setNewTeam({ ...newTeam, [name]: value })
    }

    //todo
    const handleChange = (event) => {
        const {name, value } = event.currentTarget;
        setEditTeam({...editTeam, [name]: value })
    }

    const handleSubmit = async (event) => {
        setLoadingNew(true)
        event.preventDefault();
        if (newTeam.coach && newTeam.coach !== "") {
            newTeam.coach = coachs.filter(coach => Number(newTeam.coach) === coach.id)[0]
        }
        else {
            newTeam.coach = null
        }
        newTeam.club = "/api/clubs/" + clubId
        teamAPI.postTeam(newTeam)
            .then(response => {
                if (!(response.data.coach)) {
                    response.data.coach = "non assigné"
                }
                teams.unshift(response.data)
                handleLabel("add", response.data)
                setErrorsNewTeam({ label: "", category: "" })
                setNewTeam({ label: "", category: "" })

                document.getElementById('showFormDiv').hidden = false
                document.getElementById('form-create').hidden = true
            })
            .catch(error => {
                const violations = error.response.data.violations
                const apiErrors = {};
                if (violations) {
                    violations.forEach((violation) => {
                        apiErrors[violation.propertyPath] = violation.message;
                    });
                }
                setErrorsNewTeam(apiErrors)
            })
            .finally(()=>setLoadingNew(false))
    }

    const handleDelete = id => {
        hideModal()
        const originalTeams = [...teams];

        handleLabel("remove", teams.filter((team) => team.id === id)[0] )
        setTeams(teams.filter((team) => team.id !== id));


        teamAPI.deleteTeam(id)
            .then(response => {
                console.log("delete team success " + id)
            })
            .catch(error => {
                console.log(error)
                setTeams(originalTeams);
                handleLabel("add", teams.filter((team) => team.id === id)[0] )
            });
    };

    const handlePutTeam = id => {
        //retrait modal
        hideModal()
        //retrait bouton edit
        handleCanceled(id)
        setLoading3(id)

        let coachURI = null;
        if (editTeam.coach !== "non assigné") {
            let tCoach
            if(typeof editTeam.coach === "string") {
                tCoach = Number(editTeam.coach)
            }else {
                tCoach = editTeam.coach.id
            }
            coachURI = coachs.filter(coach => tCoach === coach.id)[0]["@id"]
        }

        teamAPI.putTeam(editTeam.id, editTeam.label, coachURI)
            .then(response => {
                let team = response.data
                handleLabel("remove", teams.filter(tm => editTeam.id === tm.id)[0])
                handleLabel("add", team)

                if(team.coach === undefined){
                    team.coach = "non assigné"
                }
                let teamIndex = teams.findIndex(team => id === team.id)
                teams.splice(teamIndex, 1, team)
                setEditTeam(null)
            })
            .catch(error => {
                const violations = error.response.data.violations
                const apiErrors = {};
                if (violations) {
                    violations.forEach((violation) => {
                        apiErrors[violation.propertyPath] = { teamId: id, message: violation.message };
                    });
                }
                setErrors(apiErrors)
            })
            .finally(()=>setLoading3(false))
    }

    const btnList = ['btn-delete-','btn-put-', 'coachSelect-','labelCoach-','labelTeam-','input-labelTeam-','btn-edit-','btn-canceled-']
    /**
     * switch hidden sur clic btn-edit
     */
    const handleEdit = (teamId) => {

        if(editTeam !== null){
            btnList.map(btnName => (
                changeHidden(btnName,editTeam.id)
            ))
        }
        btnList.map(btnName => (
            changeHidden(btnName,teamId)
        ))
        let team = teams.find(team => team.id === teamId)
        setEditTeam({
            id:teamId,
            label: team.label,
            coach: team.coach
        })
    }

    const handleCanceled = (teamId) => {
        btnList.map(btnName => (
            changeHidden(btnName,teamId)
        ))
        setEditTeam(null)
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
        (t.coach === "non assigné" && t.coach.toLowerCase().includes(search.toLowerCase())) ||
        (t.coach !== "non assigné" && t.coach.user.firstName.toLowerCase().includes(search.toLowerCase())) ||
        (t.coach !== "non assigné" && t.coach.user.lastName.toLowerCase().includes(search.toLowerCase()))
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
            {loading2 && (
                <div className="invit-loader">
                    <Loader type="ThreeDots" height="20" width="508" color="LightGray" />
                </div>
            )}
            {!loading2 && (
                <div id="createTeam">
                    <div id="showFormDiv" className="wrapper">
                        <button onClick={() => handleCreate()} className="btn btn-primary">
                            Créer une équipe
                    </button>
                    </div>
                    <form id="form-create" className='formTeam' onSubmit={handleSubmit} hidden>
                        <fieldset>
                            <legend>Création d'équipe</legend>
                            {loadingNew && (
                                <div className="bigLoader">
                                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                                </div>
                            )}
                            <div id="select-container">
                                <div className="select-box" id="select-box-1">
                                    <Select
                                        name="category"
                                        label="Categorie"
                                        value={newTeam && newTeam.category}
                                        error={errorsNewTeam.category}
                                        onChange={handleNewTeamChange}
                                        children={[
                                            <option key="" value=""> choix de la categorie </option>,
                                            categories.map((cat, index) => (
                                                <option key={index} value={cat.name}>{cat.name}</option>
                                            ))
                                        ]}
                                        required
                                    />
                                </div>
                                <Select
                                    name="label"
                                    label="Equipe :"
                                    id="labelSelect"
                                    onChange={handleNewTeamChange}
                                    error={errorsNewTeam.label}
                                    children= {[<option key="" value=""> choix du label </option>,
                                            newTeam.category &&
                                            getLabelOptions(newTeam)
                                        ]}
                                    disabled = {(!newTeam.category) ? "disabled" : false}
                                    required
                                />
                                <div className="select-box">
                                    <Select
                                        name="coach"
                                        label="Coach"
                                        value={newTeam && newTeam.coach}
                                        onChange={handleNewTeamChange}
                                        children={[
                                            <option key="" value=""> choix du coach </option>,
                                            coachs.map(coach => (
                                                <option key={coach.id} value={coach.id}>
                                                    {coach.user.firstName} {coach.user.lastName}
                                                </option>
                                            ))
                                        ]}
                                    />
                                </div>
                            </div>
                            {!loadingNew && (
                                <div id="sendDiv" className="wrapper">
                                    <button id="btn-submitCreate" className="btn btn-primary" type="submit">
                                        Envoyer
                                </button>
                                    <button id="btn-cancelCreate" className="btn btn-danger" type="button"
                                        onClick={() => handleCancelCreate()}>
                                        Annuler
                                </button>
                                </div>
                            )}
                        </fieldset>
                    </form>
                </div>
            )}
            {loading && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}
            {!loading &&
                <div className="tables_container">
                    <div id="div-search" className="form-group">
                        <input className="search form-control" type="text" onChange={handleSearch} value={search}
                            placeholder="Rechercher" />
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
                                    <tr key={team.id}>
                                        <td>
                                            {loading3 && loading3 === team.id && (
                                                <Loader type="ThreeDots" width="60" height="40" color="LightGray" />
                                            )}
                                            {(!loading3 || loading3 !== team.id) && (
                                                <p id={"labelTeam-" + team.id}>{team.label}</p>
                                            )}
                                            <Select
                                                name="label"
                                                id={"input-labelTeam-" + team.id}
                                                onChange={handleChange}
                                                children= {[<option key="" value={team.label}>{team.label} </option>,
                                                        getLabelOptions(team)
                                                ]}
                                                hidden
                                            />
                                            {errors.label && errors.label.teamId === team.id &&
                                                <p className="error">{errors.label.message}</p>
                                            }
                                        </td>
                                        <td>{team.category}</td>
                                        <td>
                                            {loading3 && loading3 === team.id && (
                                                <Loader type="ThreeDots" width="60" height="40" color="LightGray" />
                                            )}
                                            {(!loading3 || loading3 !== team.id) && (
                                                team.coach && team.coach !== "non assigné" ?
                                                    <p id={"labelCoach-" + team.id}>{team.coach.user.firstName + " " + team.coach.user.lastName}</p>
                                                    : <p id={"labelCoach-" + team.id}> {"non assigné"}</p>

                                            )}
                                            <Select
                                                id={"coachSelect-" + team.id}
                                                name="coach"
                                                onChange={handleChange}
                                                value={(editTeam !== null && editTeam.coach !== "non assigné") ? editTeam.coach.id : "non assigné"}
                                                children= {[
                                                    <option key="" value="non assigné"> non Assigné</option>,
                                                    coachs.map(coach => (
                                                            <option key={coach.id} value={coach.id}>
                                                                {coach.user.firstName} {coach.user.lastName}
                                                            </option>
                                                        )
                                                    )
                                                ]}
                                                hidden
                                            />
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
                                                onClick={() => showModal("update", team.id)}
                                                id={"btn-put-" + team.id}
                                                className="btn btn-sm btn-success">
                                                valider
                                    </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => showModal("delete", team.id)}
                                                id={"btn-delete-" + team.id}
                                                className="btn btn-sm btn-danger">
                                                supprimer
                                    </button>
                                        </td>
                                    </tr>
                                ))
                                :  <tr>
                                        <td>Aucune équipe trouvée</td>
                                   </tr>
                            }
                        </tbody>

                    </table>
                </div>
            }

            <Modal show={show} handleClose={hideModal} title={modalType.type}>

                {modalType && modalType.type === "delete" && (
                    <div>
                        <p>Voulez vous vraiment supprimer cette équipe?</p>
                        <button type="button" className="btn btn-danger" onClick={() => handleDelete(modalType.target)}>
                            Supprimer
                        </button>
                        <button type="button" className="btn btn-danger" onClick={() => hideModal()}>
                            Annuler
                        </button>
                    </div>
                )
                }

                {modalType && modalType.type === "update" && (
                    <div>
                        <p>Comfirmer la modification?</p>
                        <button type="button" className="btn btn-danger" onClick={() => handlePutTeam(modalType.target)}>
                            Comfirmer
                        </button>
                        <button type="button" className="btn btn-danger" onClick={() => hideModal()}>
                            Annuler
                        </button>
                    </div>
                )}
            </Modal>

        </div>
    )
}

export default TeamsAdminPage;

