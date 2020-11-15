import React, { useEffect, useState, useContext } from "react";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import encounterAPI from "../services/encounterAPI";
import TeamContext from "../contexts/TeamContext";
import Field from "../components/forms/Field";
import Select from "../components/forms/Select";
import dateFormat from 'dateformat';
import "../../scss/pages/EncountersPage.scss";
import Loader from "react-loader-spinner";

const EncountersPage = (props) => {
    authAPI.setup();

    const role = usersAPI.checkRole();
    const club = usersAPI.checkClub();
    if (role === 'ROLE_ADMIN') {
        props.history.replace("/dashboardAdmin")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }


    if (club === "new") {
        props.history.replace("/createClub/new")
    }

    const { currentTeamId } = useContext(TeamContext);
    const [currentId, setCurrentId] = useState("")

    const [encounters, setEncounters] = useState([]);
    const [oldEncounters, setOldEncounters] = useState([]);
    const [team, setTeam] = useState({});
    const [refreshKey, setRefreshKey] = useState(0)

    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)


    const [error, setError] = useState({
        team: "",
        date: "",
        labelOpposingTeam: "",
        categoryOpposingTeam: ""
    });

    const [errorForm, setErrorForm] = useState({
        team: "",
        date: "",
        labelOpposingTeam: "",
        categoryOpposingTeam: ""
    });


    const [postEncounters, setPostEncounters] = useState({
        team: "",
        date: "",
        labelOpposingTeam: "",
        categoryOpposingTeam: ""
    });

    const [putEncounter, setPutEncounter] = useState({
        team: "",
        date: "",
        labelOpposingTeam: "",
        categoryOpposingTeam: ""
    });

    const changeHidden = (btnName, id) => {
        return document.getElementById(btnName + id).hidden === true ?
            document.getElementById(btnName + id).hidden = false
            :
            document.getElementById(btnName + id).hidden = true
    }

    const changeHiddenForm = (btnName) => {
        return document.getElementById(btnName).hidden === true ?
            document.getElementById(btnName).hidden = false
            :
            document.getElementById(btnName).hidden = true
    }

    function formattedDate(d) {
        let month = String(d.getMonth() + 1);
        let day = String(d.getDate());
        const year = String(d.getFullYear());
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return `${day}/${month}/${year}`;
    }



    useEffect(() => {
        setLoading(true)
        if (currentTeamId !== "") {
            setPostEncounters({ ...postEncounters, team: "/api/teams/" + currentTeamId })
            setPutEncounter({ ...putEncounter, team: "/api/teams/" + currentTeamId })

            teamAPI.findTeam(currentTeamId)
                .then(response => { setTeam(response.data) })
                .catch(error => console.log(error.response));



            encounterAPI.findEncountersById(currentTeamId)
                .then(response => {

                    var encountersArray = [];
                    var oldEncountersArray = [];
                    response.data['hydra:member'].forEach(function (encounter) {
                        let day = new Date()
                        let today = day.setHours(0, 0, 0, 0)

                        let encounterD = new Date(encounter.date)
                        let encounterDay = encounterD.setHours(0, 0, 0, 0)



                        if (today <= encounterDay) {

                            encountersArray.push(encounter)

                        } else {

                            oldEncountersArray.push(encounter)
                        }

                    })
                    setEncounters(encountersArray)
                    setOldEncounters(oldEncountersArray)
                    setLoading(false)
                })

                .catch(error => console.log(error.response));


        }
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        , [currentTeamId, refreshKey])

    const handleSubmit = (event) => {
        event.preventDefault()
        setLoading3(true)
        let today = new Date()
        today.setHours(0, 0, 0, 0)

        let encounterD = new Date(postEncounters.date)
        let encounterDay = encounterD.setHours(0, 0, 0, 0)

        if (today <= encounterDay) {
            encounterAPI.postEncounter(postEncounters)
                .then(response => {
                    setPostEncounters({
                        team: currentTeamId,
                        date: "",
                        labelOpposingTeam: "",
                        categoryOpposingTeam: ""
                    })
                    setRefreshKey(refreshKey + 1)
                    setErrorForm('')
                })
                .catch(errorForm => {
                    console.log(errorForm.response)
                    const { violations } = errorForm.response.data;

                    const apiErrorsForm = [''];

                    if (violations) {
                        violations.forEach((violation) => {
                            apiErrorsForm[violation.propertyPath] = violation.message;
                        });
                        setErrorForm(apiErrorsForm);
                    }
                    setLoading3(false)
                })
        } else {
            const apiErrorsForm = [''];
            apiErrorsForm["date"] = "Vous ne pouvez créer un match à une date inférieur à celle du jour";
            setErrorForm(apiErrorsForm);
            setLoading3(false)
        }
    }
    const handleChangeForm = (event) => {
        const { name, value } = event.currentTarget;
        setPostEncounters({ ...postEncounters, [name]: value });
    }

    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setPutEncounter({ ...putEncounter, [name]: value });

    }

    const handleHiddenForm = () => {
        changeHiddenForm("form-encounter")
        changeHiddenForm("showForm")

        setErrorForm("")
    }

    const handleCanceled = (encounterId) => {
        changeHidden('btn-delete-', encounterId)
        changeHidden('btn-edit-', encounterId)
        changeHidden('labelOpposingTeam-', encounterId)
        changeHidden('categoryOpposingTeam-', encounterId)
        changeHidden('date-', encounterId)
        changeHidden('input-labelOpposingTeam-', encounterId)
        changeHidden('input-categoryOpposingTeam-', encounterId)
        changeHidden('input-date-', encounterId)
        changeHidden('btn-canceled-', encounterId)
        changeHidden('btn-put-', encounterId)
        setError('');
        var btnEdits = document.getElementsByClassName('edit')
        for (var i = 0; i < btnEdits.length; i++) {
            btnEdits[i].disabled = false
        }
    }

    const handleEdit = (encounterId) => {
        //change le status de certains elements en hidden et inversement
        changeHidden('btn-delete-', encounterId)
        changeHidden('btn-edit-', encounterId)
        changeHidden('labelOpposingTeam-', encounterId)
        changeHidden('categoryOpposingTeam-', encounterId)
        changeHidden('date-', encounterId)
        changeHidden('input-labelOpposingTeam-', encounterId)
        changeHidden('input-categoryOpposingTeam-', encounterId)
        changeHidden('input-date-', encounterId)
        changeHidden('btn-canceled-', encounterId)
        changeHidden('btn-put-', encounterId)
        // recupération des données du match pour les inputs
        setPutEncounter({
            ...putEncounter,
            team: "/api/teams/" + currentTeamId,
            date: document.getElementById('input-date-' + encounterId).value,
            labelOpposingTeam: document.getElementById('input-labelOpposingTeam-' + encounterId).value,
            categoryOpposingTeam: document.getElementById('input-categoryOpposingTeam-' + encounterId).value
        })
        setError("")
        var btnEdits = document.getElementsByClassName('edit')
        for (var i = 0; i < btnEdits.length; i++) {
            btnEdits[i].disabled = true
        }
    }

    const handlePutEncounter = id => {
        setLoading2(true)
        document.getElementById("div-loader-" + id).hidden = false
        setCurrentId(id)
        let today = new Date()
        today.setHours(0, 0, 0, 0)

        let encounterD = new Date(putEncounter.date);
        let encounterDay = encounterD.setHours(0, 0, 0, 0)


        if (today <= encounterDay) {
            //Modifie les données du match
            encounterAPI.putEncounter(id, putEncounter.team, putEncounter.date, putEncounter.labelOpposingTeam, putEncounter.categoryOpposingTeam)
                //met à jour le tableau
                .then(response => {
                    setLoading2(false)
                    document.getElementById("div-loader-" + id).hidden = true
                    setRefreshKey(refreshKey + 1)
                    handleCanceled(id)
                })
                .catch(error => {
                    console.log(error.response)
                    const { violations } = error.response.data;

                    const apiErrors = [''];

                    if (violations) {
                        violations.forEach((violation) => {
                            apiErrors[violation.propertyPath] = violation.message;
                        });
                        setError(apiErrors);
                    }
                    setLoading2(false)
                    document.getElementById("btn-put-" + id).hidden = false
                    document.getElementById("btn-canceled-" + id).hidden = false
                    document.getElementById("div-loader-" + id).hidden = true
                })
        } else {
            console.log("Vous ne pouvez modifier la date à une date inférieur à celle du jour")
        }
    }

    const handleArray = () => {

        let e = document.getElementById("statusMatch")
        let match = e.options[e.selectedIndex].value;

        if (parseInt(match) === 0) {
            changeHiddenForm("incoming-match")
            changeHiddenForm("past-match")

        } else if (parseInt(match) === 1) {
            changeHiddenForm("incoming-match")
            changeHiddenForm("past-match")

        }
    }

    const handleDelete = id => {
        //copie le tableau encounters
        const originalEncounters = [...encounters];

        //Delete l'affichage du match avant de le delete en bdd
        setEncounters(encounters.filter(encounter => encounter.id !== id))

        //si la suppression coté serveur n'a pas fonctionné, je raffiche mon tableau initial 
        encounterAPI.deleteEncounter(id)
            .then(response => {
                //TODO : FLASH SUCCESS
            })
            .catch(error => {
                setEncounters(originalEncounters);
            });
    };


    return (
        <div className="wrapper_container EncountersPage">
            <h1>Matchs</h1>
            {loading && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}
            {!loading &&
                <div id="createEncounter">
                    <form hidden onSubmit={handleSubmit} id="form-encounter" className='formEncounter'>
                        <fieldset>
                            <legend>Création de match</legend>
                            <Field
                                type="date"
                                name="date"
                                label="date"
                                placeholder="date du match"
                                onChange={handleChangeForm}
                                value={postEncounters.date}
                                error={errorForm.date}
                                required
                            />
                            <Field
                                name="labelOpposingTeam"
                                label="Nom de l'équipe adverse"
                                placeholder="Nom d'équipe'..."
                                onChange={handleChangeForm}
                                value={postEncounters.labelOpposingTeam}
                                error={errorForm.labelOpposingTeam}
                                required
                            />
                            <Field
                                name="categoryOpposingTeam"
                                label="Catégorie"
                                placeholder="Catégorie..."
                                onChange={handleChangeForm}
                                value={postEncounters.categoryOpposingTeam}
                                error={errorForm.categoryOpposingTeam}
                                required
                            />
                            <div className="wrapper" id="sendDiv">
                                {loading3 && (
                                    <Loader type="ThreeDots" width="60" height="40" color="LightGray" />
                                )}
                                {!loading3 && (
                                    <button id="addEncounter" className="btn btn-primary" type="submit" >
                                        Envoyer
                                    </button>
                                )}
                                {!loading3 && (
                                    <button id="cancelEncounter" className="btn btn-danger" type="button" onClick={handleHiddenForm} >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </fieldset>
                    </form>
                    <div className="wrapper" id="showFormDiv">
                        <button id="showForm" className="btn btn-primary" type="button" onClick={handleHiddenForm}>
                            Créer un match
                    </button>
                    </div>
                </div>
            }
            {!loading && (
                <Select
                    onChange={handleArray}
                    name="statusMatch"
                    className={"form-control " + (error && " is-invalid")}
                >
                    <option value="0">Match à venir</option>
                    <option value="1">Match passés</option>
                </Select>
            )}
            {!loading && (
                <table id="incoming-match" className="table table-hover">
                    <thead>
                        <tr className="thead-color">
                            <th scope="col">Notre Equipe</th>
                            <th scope="col">Categorie</th>
                            <th scope="col">Adversaire</th>
                            <th scope="col">Categorie Adverse</th>
                            <th scope="col">Date</th>
                            <th scope="col">Tactique</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {(currentTeamId !== "" && encounters.length > 0) ? (
                            encounters.map(encounter => (
                                <tr key={encounter.id}>
                                    <td>{team.label}</td>
                                    <td>{team.category}</td>
                                    <td>
                                        <p id={"labelOpposingTeam-" + encounter.id}>
                                            {encounter.labelOpposingTeam}
                                        </p>
                                        <input
                                            hidden
                                            type="text"
                                            id={"input-labelOpposingTeam-" + encounter.id}
                                            name="labelOpposingTeam"
                                            label="Nom de l'équipe adverse"
                                            placeholder="Nom d'équipe..."
                                            onChange={handleChange}
                                            defaultValue={encounter.labelOpposingTeam}
                                            error={error.labelOpposingTeam}
                                        />
                                        {(error && encounter.id === currentId) && <p className="error">{error.labelOpposingTeam}</p>}
                                    </td>
                                    <td>
                                        <p id={"categoryOpposingTeam-" + encounter.id}>
                                            {encounter.categoryOpposingTeam}
                                        </p>
                                        <input
                                            hidden
                                            type="text"
                                            id={"input-categoryOpposingTeam-" + encounter.id}
                                            name="categoryOpposingTeam"
                                            label="Catégorie"
                                            placeholder="Catégorie..."
                                            onChange={handleChange}
                                            defaultValue={encounter.categoryOpposingTeam}
                                            error={error.categoryOpposingTeam}

                                        />
                                        {(error && encounter.id === currentId) && <p className="error">{error.categoryOpposingTeam}</p>}
                                    </td>
                                    <td>
                                        <p id={"date-" + encounter.id}>
                                            {formattedDate(new Date(encounter.date))}
                                        </p>
                                        <input
                                            hidden
                                            type="date"
                                            id={"input-date-" + encounter.id}
                                            name="date"
                                            label="date"
                                            placeholder="date du match"
                                            onChange={handleChange}
                                            defaultValue={dateFormat(encounter.date, "yyyy-mm-dd")}
                                            error={error.date}

                                        />
                                        {(error && encounter.id === currentId) && <p className="error">{error.date}</p>}
                                    </td>
                                    <td>
                                        {
                                            encounter.tactic ? encounter.tactic.type : 'Pas de plan tactique sélectionné'
                                        }
                                    </td>

                                    {(encounters !== null) &&
                                        <td>
                                            <button
                                                onClick={() => handleEdit(encounter.id)}
                                                id={"btn-edit-" + encounter.id}
                                                className="btn btn-sm btn-warning edit">
                                                editer
                                            </button>
                                            <button
                                                onClick={() => handleDelete(encounter.id)}
                                                id={"btn-delete-" + encounter.id}
                                                className="btn btn-sm btn-danger">
                                                Supprimer
                                            </button>
                                            <div hidden className="miniLoader" id={"div-loader-" + encounter.id}>
                                                {loading2 && (
                                                    <Loader type="ThreeDots" width="60" height="40" color="LightGray" />
                                                )}
                                            </div>
                                            {!loading2 && (
                                                <button
                                                    hidden
                                                    onClick={() => handlePutEncounter(encounter.id)}
                                                    id={"btn-put-" + encounter.id}
                                                    className="btn btn-sm btn-success confirm">
                                                    valider
                                                </button>
                                            )}
                                            {!loading2 && (
                                                <button
                                                    hidden
                                                    onClick={() => handleCanceled(encounter.id)}
                                                    id={"btn-canceled-" + encounter.id}
                                                    className="btn btn-sm btn-danger">
                                                    annuler
                                                </button>
                                            )}
                                        </td>
                                    }
                                </tr>
                            )
                            )) :
                            <tr>
                                <td>Aucun match trouvé pour cette équipe</td>
                            </tr>
                        }
                    </tbody>
                </table>
            )}
            {!loading && (
                <table id="past-match" className="table table-hover" hidden>
                    <thead>
                        <tr className="thead-color">
                            <th scope="col">Notre Equipe</th>
                            <th scope="col">Categorie</th>
                            <th scope="col">Adversaire</th>
                            <th scope="col">Categorie Adverse</th>
                            <th scope="col">Date</th>
                            <th scope="col">Tactique</th>
                            <th scope="col">Score</th>

                        </tr>
                    </thead>
                    <tbody>
                        {
                            (currentTeamId !== "" && oldEncounters.length > 0) ? (
                                oldEncounters.map(encounter => (
                                    <tr key={encounter.id}>
                                        <td>{team.label}</td>
                                        <td>{team.category}</td>
                                        <td>
                                            <p id={"labelOpposingTeam-" + encounter.id}>
                                                {encounter.labelOpposingTeam}
                                            </p>
                                            <input
                                                hidden
                                                type="text"
                                                id={"input-labelOpposingTeam-" + encounter.id}
                                                name="labelOpposingTeam"
                                                label="Nom de l'équipe adverse"
                                                placeholder="Nom d'équipe..."
                                                onChange={handleChange}
                                                defaultValue={encounter.labelOpposingTeam}
                                                error={error.labelOpposingTeam}
                                            />
                                            {(error && encounter.id === currentId) && <p className="error">{error.labelOpposingTeam}</p>}
                                        </td>
                                        <td>
                                            <p id={"categoryOpposingTeam-" + encounter.id}>
                                                {encounter.categoryOpposingTeam}
                                            </p>
                                            <input
                                                hidden
                                                type="text"
                                                id={"input-categoryOpposingTeam-" + encounter.id}
                                                name="categoryOpposingTeam"
                                                label="Catégorie"
                                                placeholder="Catégorie..."
                                                onChange={handleChange}
                                                defaultValue={encounter.categoryOpposingTeam}
                                                error={error.categoryOpposingTeam}

                                            />
                                            {(error && encounter.id === currentId) && <p className="error">{error.categoryOpposingTeam}</p>}
                                        </td>
                                        <td>
                                            <p id={"date-" + encounter.id}>
                                                {formattedDate(new Date(encounter.date))}
                                            </p>
                                            <input
                                                hidden
                                                type="date"
                                                id={"input-date-" + encounter.id}
                                                name="date"
                                                label="date"
                                                placeholder="date du match"
                                                onChange={handleChange}
                                                defaultValue={dateFormat(encounter.date, "yyyy-mm-dd")}
                                                error={error.date}

                                            />
                                            {(error && encounter.id === currentId) && <p className="error">{error.date}</p>}
                                        </td>
                                        <td>
                                            {
                                                encounter.tactic ? encounter.tactic.type : 'Pas de plan tactique sélectionné'
                                            }
                                        </td>
                                        <td>{(encounter.home && encounter.visitor) ? encounter.home + "-" + encounter.visitor : "Pas de score attribué"}</td>

                                    </tr>
                                )
                                )) :
                                <tr>
                                    <td>Aucun match trouvé pour cette équipe</td>
                                </tr>
                        }
                    </tbody>
                </table>
            )}
        </div>
    );

}

export default EncountersPage;
