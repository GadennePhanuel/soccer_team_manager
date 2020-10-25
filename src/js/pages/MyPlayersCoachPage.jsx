import React, { useContext, useEffect, useState } from 'react';
import TeamContext from '../contexts/TeamContext';
import teamAPI from '../services/teamAPI';
import '../../scss/pages/MyPlayersCoachPage.scss';
import Axios from 'axios';

const MyPlayersCoachPage = (props) => {

    const { currentTeamId } = useContext(TeamContext)

    const [team, setTeam] = useState({})
    const [players, setPlayers] = useState([])
    const [pictures64, setPictures64] = useState([])

    useEffect(() => {
        setPictures64([])
        //on récupére la team courante
        if (currentTeamId !== '') {
            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data)
                    setPlayers(response.data.players)

                    response.data.players.forEach(player => {

                        if (player.picture) {
                            let id = player.id
                            Axios.get('http://localhost:8000/api/image/' + player.picture)
                                .then(response => {
                                    setPictures64(pictures64 => [...pictures64, { [id]: response.data.data }])
                                })
                        }
                    })
                })
                .catch(error => {
                    console.log(error.response)
                })

            //je récupére toutes les stats

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTeamId])





    return (
        <div className="wrapper_container MyPlayersCoachPage">

            <h1>
                {currentTeamId === "" ? "Pas d'équipe à charge" : "Joueurs " + team.label + ' ' + team.category}
            </h1>

            <div className="cardsDiv">
                {players.map(player => (
                    <div className="card" key={player.id}>

                        {player.picture && (
                            <div className="card-img-top" >
                                {pictures64.map((picture, index) => (
                                    <div key={index} className='picture-profil'>
                                        {picture[player.id] && (
                                            <img src={`data:image/jpeg;base64,${picture[player.id]}`} alt="" />
                                        )}

                                    </div>
                                ))}
                            </div>
                        )}

                        {!player.picture && (
                            <div className="user-picture card-img-top"></div>
                        )}
                        <div className="card-body">
                            <h5 className="card-title">{player.user.lastName + ' ' + player.user.firstName}</h5>
                            <p className="card-text">Stats</p>
                            <div className="btns-card">
                                <button className="btn btn-primary btn-infos">Détails</button>
                                <button className="btn btn-secondary btn-exclude">Exclure</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}

export default MyPlayersCoachPage;