import React, { useEffect, useState } from 'react';
import '../../scss/pages/PlayerStatsPage.scss';
import playerAPI from '../services/playerAPI';
import trainingsAPI from '../services/trainingsAPI';
import encounterAPI from '../services/encounterAPI';
import Loader from 'react-loader-spinner';

const PlayerStatsPage = (props) => {

    //récupération de l'id du player concerné
    const id = props.match.params.id

    const [player, setPlayer] = useState({
        id: '',
        height: '',
        weight: '',
        injured: false,
        picture: '',
        totalGoal: '',
        totalPassAssist: '',
        totalRedCard: '',
        totalYellowCard: '',
        team: {},
        user: {},

    })

    const [picture64, setPicture64] = useState('')
    const [age, setAge] = useState('')
    const [trainings, setTrainings] = useState([])
    const [trainingMisseds, setTrainingMisseds] = useState([])
    const [encounters, setEncounters] = useState([])
    const [selections, setSelections] = useState([])

    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)
    const [loading4, setLoading4] = useState(false)

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
        setLoading2(true)
        setLoading3(true)
        setLoading4(true)
        //récupération du player en BDD
        playerAPI.findPlayer(id)
            .then(response => {
                setPlayer(response.data)

                if (response.data.picture) {
                    playerAPI.fetchProfilePicture(response.data.picture)
                        .then(response => {
                            setPicture64(response.data.data)
                            setLoading2(false)
                        })
                } else {
                    setLoading2(false)
                }

                //conversion de la date de naissance en age et stockage dans un tableau key=>value
                setAge(getAge(response.data.user.birthday))

                //récupération des trainings de son équipe
                if (response.data.team) {
                    trainingsAPI.findTrainingsById(response.data.team.id)
                        .then(response => {
                            //obtention de d'un tableau contenant tous les entrainements de son équipe
                            setTrainings(response.data['hydra:member'])

                            //chaque entrainement du tableau à son propre tableau des absents
                            response.data['hydra:member'].forEach(training => {
                                training.trainingMisseds.forEach(trainingMissedItem => {
                                    if (trainingMissedItem.player.id === parseInt(id, 10)) {
                                        setTrainingMisseds(trainingMisseds => [...trainingMisseds, training])
                                    }
                                })
                            })
                            setLoading3(false)
                        })
                        .catch(error => {
                            console.log(error.response)
                        })

                    //récupération des rencontres de son équipes
                    encounterAPI.findEncountersById(response.data.team.id)
                        .then(response => {
                            setEncounters(response.data['hydra:member'])
                            console.log(response.data['hydra:member'])
                            //on parcours les rencontres et on crée un 2éme tableau contenant celles où le player à participer
                            response.data['hydra:member'].forEach(encounter => {
                                encounter.stats.forEach(stat => {
                                    if (stat.player.id === parseInt(id, 10)) {
                                        setSelections(selections => [...selections, encounter])
                                        console.log(encounter)
                                    }
                                })
                            })
                            setLoading4(false)
                        })
                        .catch(error => {
                            console.log(error.response)
                        })
                } else {
                    setLoading3(false)
                    setLoading4(false)
                }

                setLoading(false)

            })
            .catch(error => {
                console.log(error.response)
            })
    }, [id])



    return (
        <div className="wrapper_container PlayerStatsPage">
            {(loading || loading2 || loading3 || loading4) && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}

            {(!loading && !loading2 && !loading3 && !loading4) && (
                <div className="picture-profil">
                    <div className="picture">
                        {!player.picture && (
                            <div className="user-picture"></div>
                        )}
                        {player.picture && (
                            <div className="img">
                                <img src={`data:image/jpeg;base64,${picture64}`} alt="" />
                            </div>
                        )}
                    </div>
                    <div className="profil">
                        <h1>{player.user.lastName + ' ' + player.user.firstName}</h1>
                        <p>Téléphone: {player.user.phone}</p>
                        <div className="sections-infos">
                            <section>
                                <p>Age: {age}ans</p>
                                <p>Taille: {player.height}cm</p>
                                <p>Poids: {player.weight}kg</p>
                                <p>Blessé: {player.injured ? "Oui" : "Non"}</p>
                            </section>
                            <section>
                                <h5>Général :</h5>
                                <div>
                                    <p>Carton rouge: {player.totalRedCard} <span className="redCard"></span></p>
                                    <p>Carton jaune: {player.totalYellowCard} <span className="yellowCard"></span></p>
                                </div>
                                <div>
                                    <p>Passes décisive: {player.totalPassAssist} <span className="passAssist"></span></p>
                                    <p>Buts: {player.totalGoal} <span className="goal"></span></p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
            {(!loading && !loading2 && !loading3 && !loading4) && (
                <div className="main">
                    <div className="trainings">
                        <h3>Entrainements</h3>
                        <p>Absences: {trainingMisseds.length + ' sur ' + trainings.length + ' (' + Math.round((trainingMisseds.length / trainings.length) * 100) + '%)'}</p>
                        {trainingMisseds.length === 0 && (
                            <div className="medal"></div>
                        )}
                        {trainingMisseds.length > 0 && (
                            <div>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Label</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trainingMisseds.map((training, index) => (
                                            <tr key={index}>
                                                <td>{formattedDate(new Date(training.date))}</td>
                                                <td>{training.label}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                    <div className="matchs">
                        <h3>Matchs</h3>
                        <p>Sélections: {selections.length + " sur " + encounters.length + " (" + Math.round((selections.length / encounters.length) * 100) + "%)"}</p>
                        {selections.length === 0 && (
                            <div className="medal2"></div>
                        )}
                        {selections.length > 0 && (
                            <div>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>VS</th>
                                            <th><span className="redCard"></span></th>
                                            <th><span className="yellowCard"></span></th>
                                            <th><span className="passAssist"></span></th>
                                            <th><span className="goal"></span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selections.map((selection, index) => (
                                            <tr key={index}>
                                                <td>{formattedDate(new Date(selection.date))}</td>
                                                <td>{selection.labelOpposingTeam + ' ' + selection.categoryOpposingTeam}</td>
                                                {selection.stats.map((stat, index) => (
                                                    stat.player.id === parseInt(id, 10) && (
                                                        <td key={index}>{stat.redCard}</td>
                                                    )
                                                ))}
                                                {selection.stats.map((stat, index) => (
                                                    stat.player.id === parseInt(id, 10) && (
                                                        <td key={index}>{stat.yellowCard}</td>
                                                    )
                                                ))}
                                                {selection.stats.map((stat, index) => (
                                                    stat.player.id === parseInt(id, 10) && (
                                                        <td key={index}>{stat.passAssist}</td>
                                                    )
                                                ))}
                                                {selection.stats.map((stat, index) => (
                                                    stat.player.id === parseInt(id, 10) && (
                                                        <td key={index}>{stat.goal}</td>
                                                    )
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}


                    </div>
                </div>
            )}
        </div>
    );
}

export default PlayerStatsPage;