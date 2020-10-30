import React, { useEffect, useState, useContext } from "react";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import encounterAPI from "../services/encounterAPI";
import TeamContext from "../contexts/TeamContext";
import Field from "../components/forms/Field";
import dateFormat from 'dateformat';
import "../../scss/pages/TeamsAdminPage.scss";


const EncountersPage = (props) => {
    authAPI.setup();

    // si role != ROLE_ADMIN -> redirection vers le dashboard qui lui correspond
    const role = usersAPI.checkRole();
    const club = usersAPI.checkClub();

    if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer");
    }
 
    if (club === "new") {
        props.history.replace("/createClub/new")
    }
    
    const { currentTeamId } = useContext(TeamContext);

    const [encounters, setEncounters] = useState([]);
    const [team, setTeam] = useState({});

    const [error, setError] = useState('');


    const [putEncounter, setPutEncounter] = useState({
        team: "",
        date: "",
        labelOpposingTeam: "",
        categoryOpposingTeam: ""
    });

        useEffect(() => {    
            if(currentTeamId != ""){
                teamAPI.findTeam(currentTeamId)
                .then(response => {setTeam(response.data)})
                .catch(error => console.log(error.response));

                if(role === 'ROLE_ADMIN'){
                encounterAPI.findAllEncounters()
                    .then(data => setEncounters(data))
                    .catch(error => console.log(error.response));
                }else if (role === 'ROLE_COACH'){
                    encounterAPI.findEncountersById(currentTeamId)
                    .then(response => setEncounters(response.data['hydra:member']))
                    .catch(error => console.log(error.response));
                    
                }   
            } 
        },[currentTeamId])
    
        const handleSubmit = (event) => {
            event.preventDefault()
            //call ajax vers controller particulier
            //1.envoie de l'adresse email (et de l'url du front correspondant à la page d'inscription du coach) vers le back qui se chargera d'envoyer un mail au coach qui se fait inviter
            encounterAPI.postEncounter(putEncounter)
                .then(response => {
                    console.log(response.data)
                    setError('');

                    document.getElementById('addEncounter').hidden = false
                    document.getElementById('form-encounter').hidden = true
                })
                .catch(error => {
                    const { violations } = error.response.data;
                    if (violations) {
                        setError(violations);
                    }
                })
    
        }
        
    const handleChange = (event) => {
        const { name, value } = event.currentTarget;
        setPutEncounter({[name]: value});
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
        <div className="wrapper_container">
               <h1>Matchs</h1>
            <div id="createEncounter">
                <form onSubmit={handleSubmit} id="form-encounter" className='formEncounter'>
                    <Field
                        name="date"
                        label="date"
                        placeholder="date du match"
                        onChange={handleChange}
                        value={putEncounter.date}
                        error={error.date}
                        required
                    />
                    <Field
                        name="labelOpposingTeam"
                        label="Nom de l'équipe adverse"
                        placeholder="Nom d'équipe'..."
                        onChange={handleChange}
                        value={putEncounter.labelOpposingTeam}
                        error={error.labelOpposingTeam}
                        required
                    />
                    <Field
                        name="categoryOpposingTeam"
                        label="Catégorie"
                        placeholder="Catégorie..."
                        onChange={handleChange}
                        value={putEncounter.categoryOpposingTeam}
                        error={error.categoryOpposingTeam}
                        required
                    />
                    <div>
                        <button id="addEncounter" className="btn btn-create" type="submit" >
                            Ajouter un match
                        </button>
                    </div>
                </form>
            </div>
            <table className="table table-hover">
                <thead>
                    <tr className="thead-color">
                        <th scope="col">Notre Equipe</th>
                        <th scope="col">Equipe Adverse</th>
                        <th scope="col">Categorie</th>
                        <th scope="col">date</th>
                        {(role === 'ROLE_ADMIN' || role === "ROLE_COACH") &&
                            <th />
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        // repetition pour chaque encounter
                    }
                    {(currentTeamId != "" && encounters != null) ?
                        encounters.map(encounter => (   
                           
                        <tr scope="row" key={encounter.id}>
                            <td>{team.label}</td>
                            <td>{encounter.labelOpposingTeam}</td>
                            <td>{team.category}</td>
                            <td>{
                                encounter.date
                                }
                            </td>
                            {(role === 'ROLE_ADMIN' || role === "ROLE_COACH") &&
                                <td>
                                    <button
                                        onClick={() => handleDelete(encounter.id)}
                                        className="btn btn-sm btn-danger">
                                        Supprimer
                                    </button>
                                </td>
                            }
                        </tr>
                    )) : <tr>
                            <td>Aucun match trouvé pour cette équipe</td>
                        </tr>
                }
                    
                </tbody>
            </table>

        </div>
    );

}

export default EncountersPage;
