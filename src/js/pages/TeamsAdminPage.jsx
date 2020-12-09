import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import "../../scss/pages/TeamsAdminPage.scss";
import Select from "../components/forms/Select";
import Field from "../components/forms/Field";
import Loader from "react-loader-spinner";
import Modal from "../components/Modal";
import notification from "../services/notification";

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

    const [categories, setCategories] = useState(["Cadet","Junior","Senior"])

    const labelControl = (team) => {
        let t
        team.oldLabel ? t = (team.oldLabel !== team.label || String(team.coach) !== String(team.oldCoachId)) : t = true

       return  (
            teams.find(tm => 
                    (tm.id !== team.id)
                && (tm.label === team.label)
                && (tm.category === team.category)
            ) === undefined
           && team.label.length > 1
           && team.label.length < 75
           && !!team.category
           && t
       )
    }

    const getCoachOptions = () => {
        return (
            coachs.map(coach => (
                    coach.user.roles[0] !== "ROLE_NOT_ALLOWED" &&
                    <option key={coach.id} value={coach.id}>
                        {coach.user.firstName} {coach.user.lastName}
                    </option>
                )
            )
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
                setErrorsNewTeam({ label: "", category: "" })
                setNewTeam({ label: "", category: "" })

                document.getElementById("newTeamCatSelect").value = ""
                changeHidden('showFormDiv',"")
                changeHidden('form-create',"")
                notification.successNotif("L'équipe a bien été crée")
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
                notification.errorNotif("Une erreur s'est produite")
            })
            .finally(()=>setLoadingNew(false))
    }

    const handleDelete = id => {
        hideModal()
        const originalTeams = [...teams];
        setTeams(teams.filter((team) => team.id !== id));


        teamAPI.deleteTeam(id)
            .then(response => {
                console.log("delete team success " + id)
                notification.successNotif("L'équipe a bien été supprimé")
            })
            .catch(error => {
                console.log(error)
                setTeams(originalTeams);
               /* handleLabel("add", teams.filter((team) => team.id === id)[0] )*/
                notification.errorNotif("Une erreur s'est produite")
            });
    };

    const handlePutTeam = id => {
        //retrait modal
        hideModal()
        //retrait bouton edit
        setEditTeam(null)
        setLoading3(id)

        let coachURI = null;
        if (editTeam.coach !== "non assigné" && editTeam.coach !== undefined) {
            let tCoach
            if(typeof editTeam.coach === "string") {
                tCoach = Number(editTeam.coach)
            }else {
                tCoach = editTeam.coach
            }
            coachURI = coachs.filter(coach => tCoach === coach.id)[0]["@id"]
        }

        teamAPI.putTeam(editTeam.id, editTeam.label, coachURI)
            .then(response => {
                let team = response.data

                if(team.coach === undefined){
                    team.coach = "non assigné"
                }
                let teamIndex = teams.findIndex(team => id === team.id)
                teams.splice(teamIndex, 1, team)
                setEditTeam(null)
                notification.successNotif("L'équipe a bien été modifiée")
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
                console.log(editTeam)
                console.log(apiErrors)
                notification.errorNotif("Une erreur s'est produite")
            })
            .finally(()=>setLoading3(false))
    }

    /**
     * switch hidden sur clic btn-edit
     */
    const handleEdit = (teamId) => {

        let team = teams.find(team => team.id === teamId)
        setEditTeam({
            oldCoachId:team.coach.id,
            oldLabel:team.label,
            id:teamId,
            label: team.label,
            coach: team.coach.id,
            category: team.category
        })
    }

    const changeHidden = (btnName, id) => {
        let element = document.getElementById(btnName + id)
        element.hidden === true ? element.hidden = false : element.hidden = true
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

    const handleCreateHidden = () => {
        changeHidden('showFormDiv',"")
        changeHidden('form-create',"")
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
                        <button onClick={() => handleCreateHidden()} className="btn btn-primary">
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
                                        id="newTeamCatSelect"
                                        label="Categorie"
                                        error={errorsNewTeam.category}
                                        onChange={handleNewTeamChange}
                                        children={[
                                            <option key="" value=""> choix de la categorie </option>,
                                            categories.map((cat, index) => (
                                                <option key={index} value={cat}>{cat}</option>
                                            ))
                                        ]}
                                        required
                                    />
                                </div>
                                <Field
                                    name="label"
                                    id="labelSelect"
                                    label="Nom :"
                                    onChange={handleNewTeamChange}
                                    placeholder="Nom de l'équipe : "
                                    type="text"
                                    error={errorsNewTeam.label}
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
                                            getCoachOptions()
                                        ]}
                                    />
                                </div>
                            </div>
                            {!loadingNew && (
                                <div id="sendDiv" className="wrapper">
                                    <button id="btn-submitCreate" className="btn btn-primary" type="submit"
                                            disabled = {!labelControl(newTeam)}
                                    >
                                        Envoyer
                                    </button>
                                    <button id="btn-cancelCreate" className="btn btn-danger" type="button"
                                        onClick={() => handleCreateHidden()}>
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
                                            {(!editTeam || editTeam.id !== team.id) && (!loading3 || loading3 !== team.id) && (
                                                <p id={"labelTeam-" + team.id}>{team.label}</p>
                                            )}
                                            {editTeam && editTeam.id === team.id &&
                                                <>
                                                <Field
                                                    id={"input-labelTeam-" + team.id}
                                                    name="label"
                                                    value={editTeam.label}
                                                    onChange={handleChange}
                                                    placeholder="Nom de l'équipe : "
                                                    type="text"
                                                >
                                                </Field>
                                                </>
                                            }
                                            {errors.label && errors.label.teamId === team.id &&
                                            <p className="error">{errors.label.message}</p>
                                            }
                                        </td>
                                        <td>{team.category}</td>
                                        <td>
                                            {loading3 && loading3 === team.id && (
                                                <Loader type="ThreeDots" width="60" height="40" color="LightGray" />
                                            )}
                                            {(!editTeam || editTeam.id !== team.id) && (!loading3 || loading3 !== team.id) && (
                                                team.coach && team.coach !== "non assigné" ?
                                                    <p id={"labelCoach-" + team.id}>{team.coach.user.firstName + " " + team.coach.user.lastName}</p>
                                                    : <p id={"labelCoach-" + team.id}> {"non assigné"}</p>

                                            )}
                                            {editTeam && editTeam.id === team.id &&
                                            <Select
                                                id={"coachSelect-" + team.id}
                                                name="coach"
                                                onChange={handleChange}
                                                value={(editTeam.coach !== "non assigné") ? editTeam.coach : "non assigné"}
                                                children={[
                                                    <option key="" value="non assigné"> non Assigné</option>,
                                                    getCoachOptions()
                                                ]}
                                            />
                                            }
                                        </td>
                                        <td>
                                            {(!editTeam || editTeam.id !== team.id) &&
                                                <>
                                                <button
                                                    onClick={() => handleEdit(team.id)}
                                                    id={"btn-edit-" + team.id}
                                                    className="btn btn-sm btn-warning">
                                                    editer
                                                </button>
                                                <button
                                                    onClick={() => showModal("delete", team.id)}
                                                    id={"btn-delete-" + team.id}
                                                    className="btn btn-sm btn-danger">
                                                    supprimer
                                                </button>
                                                </>
                                            }
                                            {editTeam && editTeam.id === team.id &&
                                                <>
                                                <button
                                                    onClick={() => showModal("update", team.id)}
                                                    id={"btn-put-" + team.id}
                                                    className="btn btn-sm btn-success"
                                                    disabled = {!labelControl(editTeam)}
                                                >
                                                    valider
                                                </button>
                                                <button
                                                    onClick={() => setEditTeam(null)}
                                                    id={"btn-canceled-" + team.id}
                                                    className="btn btn-sm btn-danger">
                                                    annuler
                                                </button>
                                               </> }

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
                        <div className="messageBox">
                            <p>Voulez vous vraiment supprimer cette équipe?</p>
                        </div>
                        <div className="btnBox">
                            <button type="button" className="btn btn-secondary" onClick={() => handleDelete(modalType.target)}>
                                Supprimer
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => hideModal()}>
                                Annuler
                            </button>
                        </div>

                    </div>
                )
                }

                {modalType && modalType.type === "update" && (
                    <div>
                        <div className="messageBox">
                            <p>Confirmer la modification?</p>
                        </div>
                        <div className="btnBox">
                            <button type="button" className="btn btn-secondary" onClick={() => handlePutTeam(modalType.target)}>
                                Confirmer
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => hideModal()}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    )
}

export default TeamsAdminPage;

