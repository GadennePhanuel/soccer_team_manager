import React, { useContext, useEffect, useState } from 'react';
import TeamContext from '../contexts/TeamContext';
import teamAPI from '../services/teamAPI';
import '../../scss/pages/MyPlayersCoachPage.scss';
import Axios from 'axios';
import { Link } from 'react-router-dom';

const MyPlayersCoachPage = (props) => {

    const { currentTeamId } = useContext(TeamContext)

    const [team, setTeam] = useState({})
    const [players, setPlayers] = useState([])
    const [pictures64, setPictures64] = useState([])
    const [ages, setAges] = useState([])

    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    useEffect(() => {
        setPictures64([])
        setAges([])
        //on récupére la team courante
        if (currentTeamId !== '') {
            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data)
                    setPlayers(response.data.players)

                    response.data.players.forEach(player => {

                        if (player.picture) {
                            Axios.get('http://localhost:8000/api/image/' + player.picture)
                                .then(response => {
                                    setPictures64(pictures64 => [...pictures64, { [player.id]: response.data.data }])
                                })
                        }

                        //conversion de la date de naissance en age et stockage dans un tableau key=>value
                        setAges(ages => [...ages, { [player.id]: getAge(player.user.birthday) }])

                    })
                })
                .catch(error => {
                    console.log(error.response)
                })

            //je récupére toutes les stats

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTeamId])


    const handleExclude = (player) => {
        console.log(player)
        //copie tableau original des players
        const originalPlayers = [...players]

        //supression de l'affichage du player exclu
        setPlayers(players.filter((playerItem) => playerItem.id !== player.id))

        //PUT player/id -> on set team à null
        Axios.put('http://localhost:8000/api/players/' + player.id, {
            team: null
        })
            .then(response => {
                console.log(response.data)
                //TODO : FLASH SUCCESS
            })
            .catch(error => {
                console.log(error.response)
                setPlayers(originalPlayers)
            })

    }


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
                                    picture[player.id] && (
                                        <div key={index} className='picture-profil'>
                                            {picture[player.id] && (
                                                <img src={`data:image/jpeg;base64,${picture[player.id]}`} alt="" />
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        {!player.picture && (
                            <div className="user-picture card-img-top"></div>
                        )}
                        <div className="card-body">
                            <h5 className="card-title">{player.user.lastName + ' ' + player.user.firstName}</h5>
                            <div className="player-infos">
                                {ages.map((age, index) => (
                                    age[player.id] && (
                                        <div key={index}>
                                            {age[player.id] && (
                                                <p>{age[player.id]}ans</p>
                                            )}
                                        </div>
                                    )
                                ))}
                                <div>
                                    <p>{player.height}cm</p>
                                </div>
                                <div>
                                    <p>{player.weight}kg</p>
                                </div>
                            </div>
                            <div className="player-stats">
                                <div>
                                    <p>{player.totalRedCard} <span className="redCard"></span></p>
                                </div>
                                <div>
                                    <p>{player.totalYellowCard} <span className="yellowCard"></span></p>
                                </div>
                                <div>
                                    <p>{player.totalPassAssist} <span className="passAssist"></span></p>
                                </div>
                                <div>
                                    <p>{player.totalGoal} <span className="goal"></span></p>
                                </div>
                            </div>

                            <div className="btns-card">
                                <Link to={"/player/" + player.id + "/stats"} className="btn btn-primary btn-infos">Détails</Link>
                                <button className="btn btn-secondary btn-exclude" onClick={() => handleExclude(player)}>Exclure</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div >
    );
}

export default MyPlayersCoachPage;