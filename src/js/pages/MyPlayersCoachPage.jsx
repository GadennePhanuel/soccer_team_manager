import React, { useContext, useEffect, useState } from 'react';
import TeamContext from '../contexts/TeamContext';
import teamAPI from '../services/teamAPI';
import '../../scss/pages/MyPlayersCoachPage.scss';
import { Link } from 'react-router-dom';
import playerAPI from '../services/playerAPI';
import Modal from '../components/Modal';
import notification from "../services/notification";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import CurrentUser from '../components/CurrentUser';

const MyPlayersCoachPage = (props) => {

    const { currentTeamId } = useContext(TeamContext)

    const [team, setTeam] = useState({})
    const [players, setPlayers] = useState([])
    const [pictures64, setPictures64] = useState([])
    const [ages, setAges] = useState([])

    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)

    const [show, setShow] = useState(false)
    const [player, setPlayer] = useState({})
    const[modalType, setModalType] = useState('')

    
    const showModal = (modalType,player) => {
        setModalType(modalType)
        setPlayer(player)
        setShow(true)
    }

    const hideModal = () => {
        setShow(false)
    }

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
        setLoading(true)
        setLoading2(true)
        setPictures64([])
        setAges([])
        //on récupére la team courante
        if (currentTeamId !== '') {
            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data)
                    setPlayers(response.data.players)

                    setLoading2(true)
                    response.data.players.forEach(player => {
                        if (player.picture) {
                            setLoading2(true)
                            playerAPI.fetchProfilePicture(player.picture)
                                .then(response => {
                                    setPictures64(pictures64 => [...pictures64, { [player.id]: response.data.data }])
                                    setLoading2(false)
                                })
                        }
                        //conversion de la date de naissance en age et stockage dans un tableau key=>value
                        setAges(ages => [...ages, { [player.id]: getAge(player.user.birthday) }])
                    })
                    setLoading(false)
                })
                .catch(error => {
                    console.log(error.response)
                })
        } else {
            setLoading(false)
            setLoading2(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTeamId])


    const handleExclude = (player) => {
        //copie tableau original des players
        const originalPlayers = [...players]

        //supression de l'affichage du player exclu
        setPlayers(players.filter((playerItem) => playerItem.id !== player.id))
        hideModal()
        //PUT player/id -> on set team à null
        playerAPI.excludePlayerOfTeam(player.id)
            .then(response => {
                notification.successNotif("Le joueur a été expulsé de l'équipe")
            })
            .catch(error => {
                notification.errorNotif("Une erreur s'est produite lors de l'expulsion du joueur")
                setPlayers(originalPlayers)
            })

    }


    return (
        <div className="wrapper_container MyPlayersCoachPage">
            <CurrentUser />
            {loading && (
                <h1>
                    <Loader type="ThreeDots" height="20" width="508" color="LightGray" />
                </h1>
            )}
            {!loading && (
                <h1>
                    {currentTeamId === "" ? "Pas d'équipe à charge" : "Joueurs " + team.label + ' ' + team.category}
                </h1>
            )}

            {loading && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}
            {!loading && (
                <div className="cardsDiv">
                    {players.map(player => (
                        <div className="card" key={player.id}>
                            {(player.picture && loading2) && (
                                <div className="cardLoader">
                                    <Loader type="Puff" height="140" width="140" color="LightGray" />
                                </div>
                            )}
                            {(player.picture && !loading2) && (
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
                                    <button className="btn btn-secondary btn-exclude" onClick={() => showModal("Exclure le joueur", player)}>Exclure</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal
                show={show}
                handleClose={hideModal}
                title= {modalType}
            >
                {modalType === "Exclure le joueur" &&
                    <div>
                        <h6>Êtes-vous sur de vouloir exclure ce joueur ? </h6>
                        <button onClick={() => handleExclude(player)} className="btn btn-primary">Confirmer</button>
                    </div>
                }
            </Modal>
        </div >
    );
}

export default MyPlayersCoachPage;