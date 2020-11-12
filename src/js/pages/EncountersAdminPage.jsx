import React, { useEffect, useState } from "react";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import encounterAPI from "../services/encounterAPI";
import dateFormat from 'dateformat';
import "../../scss/pages/EncountersAdminPage.scss";


const EncountersAdminPage = (props) => {
    authAPI.setup();

    // si role != ROLE_ADMIN -> redirection vers le dashboard qui lui correspond
    const role = usersAPI.checkRole();
    const club = usersAPI.checkClub();

    if (role === 'ROLE_COACH') {
        props.history.replace("/dashboardCoach")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }

    if (club === "new") {
        props.history.replace("/createClub/new")
    }


    const [currentId, setCurrentId] = useState("");
    const [encounters, setEncounters] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0)
    const [search, setSearch] = useState("")


    const [error, setError] = useState({
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

    const handleSearch = event => {
        const value = event.currentTarget.value;
        setSearch(value);
    }



    const filteredEncounters = encounters.filter(e =>
        e.team.label.toLowerCase().includes(search.toLowerCase()) ||
        e.team.category.toLowerCase().includes(search.toLowerCase())

    )


    const changeHidden = (btnName, id) => {
        return document.getElementById(btnName + id).hidden === true ?
            document.getElementById(btnName + id).hidden = false
            :
            document.getElementById(btnName + id).hidden = true
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
        encounterAPI.findAllEncounters()
            .then(response => {
                setEncounters(response)
            })
            .catch(error => console.log(error.response));

    }
        , [refreshKey])



    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setPutEncounter({ ...putEncounter, [name]: value });
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
        setError("")
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
        if (role === "ROLE_ADMIN") {
            setPutEncounter({
                ...putEncounter,
                team: "/api/teams/" + document.getElementById("input-teamId" + encounterId).value,
                date: document.getElementById('input-date-' + encounterId).value,
                labelOpposingTeam: document.getElementById('input-labelOpposingTeam-' + encounterId).value,
                categoryOpposingTeam: document.getElementById('input-categoryOpposingTeam-' + encounterId).value
            })
        }
    }

    const handlePutEncounter = id => {
        setCurrentId(id)
        //Modifie les données du match
        encounterAPI.putEncounter(id, putEncounter.team, putEncounter.date, putEncounter.labelOpposingTeam, putEncounter.categoryOpposingTeam)
            //met à jour le tableau
            .then(response => {
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
            })
    }


    const handleDelete = id => {

        //copie le tableau encounters
        const originalEncounters = [...encounters];

        //Delete l'affichage du match avant de le delete en bdd
        setEncounters(encounters.filter(encounter => encounter.id !== id))

        //si la suppression coté serveur n'a pas fonctionné, je raffiche mon tableau initial 
        encounterAPI.deleteEncounter(id)
            .then(response => console.log("ok"))
            .catch(error => {
                setEncounters(originalEncounters);
            });
    };

    return (
        <div className="wrapper_container EncountersAdminPage">
            <h1>Matchs</h1>
            <div id="div-search" className="form-group">
                <input id="search" type="text" onChange={handleSearch} value={search} className="form-control" placeholder="Rechercher" />
            </div>

            <table className="table table-hover">
                <thead>
                    <tr className="thead-color">
                        <th scope="col">Notre Equipe</th>
                        <th scope="col">Categorie</th>
                        <th scope="col">Adversaire</th>
                        <th scope="col">Categorie Adverse</th>
                        <th scope="col">Date</th>
                        <th scope="col">Tactique</th>
                        {(role === 'ROLE_ADMIN' || role === "ROLE_COACH") &&
                            <th />
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        (encounters !== null && role === 'ROLE_ADMIN') ? (
                            filteredEncounters.map(encounter => (
                                <tr key={encounter.id}>
                                    <td>
                                        <p>
                                            {encounter.team.label}
                                        </p>
                                        {<input
                                            hidden
                                            id={"input-teamId" + encounter.id}
                                            name="teamId"
                                            defaultValue={encounter.team.id}
                                        />}
                                    </td>
                                    <td>{encounter.team.category}</td>
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

                                    {(encounters !== null && role === 'ROLE_ADMIN') &&
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
                                            <button
                                                hidden
                                                onClick={() => handlePutEncounter(encounter.id)}
                                                id={"btn-put-" + encounter.id}
                                                className="btn btn-sm btn-success confirm">
                                                valider
                                    </button>
                                            <button
                                                hidden
                                                onClick={() => handleCanceled(encounter.id)}
                                                id={"btn-canceled-" + encounter.id}
                                                className="btn btn-sm btn-danger">
                                                annuler
                                    </button>
                                        </td>
                                    }
                                </tr>
                            )
                            )) : <tr>
                                <td>Aucun match trouvé pour cette équipe</td>
                            </tr>
                    }

                </tbody>
            </table>

        </div>


    );
}

export default EncountersAdminPage;