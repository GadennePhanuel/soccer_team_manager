import React, { useContext, useEffect, useState } from 'react';
import TeamContext from '../contexts/TeamContext';
import teamAPI from '../services/teamAPI';
import '../../scss/pages/MyPlayersCoachPage.scss';

const MyPlayersCoachPage = (props) => {

    const { currentTeamId } = useContext(TeamContext)

    const [team, setTeam] = useState({})
    const [players, setPlayers] = useState([])

    useEffect(() => {
        //on récupére la team courante
        if (currentTeamId !== '') {

            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data)
                    setPlayers(response.data.players)
                })
                .catch(error => {
                    console.log(error.response)
                })
        }
    }, [currentTeamId])

    const [search, setSearch] = useState("");

    const handleSearch = event => {
        const value = event.currentTarget.value;
        setSearch(value);
    }

    const filteredPlayers = players.filter(p =>
        p.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.user.lastName.toLowerCase().includes(search.toLowerCase())
    )

    const handleExclude = (player) => {
        console.log(player)
    }

    return (
        <div className="wrapper_container MyPlayersCoachPage">

            <h1>
                {currentTeamId === "" ? "Pas d'équipe à charge" : "Joueurs " + team.label + ' ' + team.category}
            </h1>

            <div>
                <div id="div-search" className="form-group">
                    <input id="search" type="text" onChange={handleSearch} value={search} className="form-control" placeholder="Rechercher" />
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr className="thead-color">
                            <th scope="col">Joueur</th>
                            <th scope="col">Stats</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlayers.map(player => (
                            <tr key={player.id}>
                                <td>{player.user.lastName + ' ' + player.user.firstName}</td>
                                <td></td>
                                <td>
                                    <button className="btn btn-danger" onClick={() => handleExclude(player)}>
                                        Exclure
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
}

export default MyPlayersCoachPage;