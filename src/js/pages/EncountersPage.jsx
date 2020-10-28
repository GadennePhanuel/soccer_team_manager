import React, { useEffect, useState, useContext } from "react";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import coachAPI from "../services/coachAPI";
import encounterAPI from "../services/encounterAPI";
import TeamContext from "../contexts/TeamContext";
import Field from "../components/forms/Field";
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


    
        useEffect(() => {
            if(role === 'ROLE_ADMIN'){
            encounterAPI.findAllEncounters()
                .then(data => setEncounters(data))
                .catch(error => console.log(error.response));
            }else if (role === 'ROLE_COACH'){
                teamAPI.findTeam(currentTeamId)
                .then(data => setEncounters(data.encounters))
                .catch(error => console.log(error.response));
            }
        },[currentTeamId])
        
    

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
        <div className="wrapper_container PlayersAdminPage">
               
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
                    {encounters.map(encounter => (
                        <tr scope="row" key={encounter.id}>
                            <td>{encounter.team.label}</td>
                            <td>{encounter.labelOpposingTeam}</td>
                            <td>{encounter.team.category}</td>
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
                    ))}
                </tbody>
            </table>

        </div>
    );

}

export default EncountersPage;
