import React, { useContext, useEffect, useState } from 'react';
import Loader from 'react-loader-spinner';
import "../../scss/pages/PreLivePage.scss";
import CurrentUser from '../components/CurrentUser';
import SlotPoste from "../components/formation/SlotPoste";
import Modal from "../components/Modal";
import MatchLiveContext from '../contexts/MatchLiveContext';
import TeamContext from '../contexts/TeamContext';
import encounterAPI from '../services/encounterAPI';
import playerAPI from "../services/playerAPI";
import tacticArchAPI from "../services/tacticArchAPI";
import teamAPI from '../services/teamAPI';

const PreLivePage = (props) => {

    //recupération currentTeamId dans le context
    const { currentTeamId } = useContext(TeamContext)
    const { matchLiveId, setMatchLiveId } = useContext(MatchLiveContext)
    const [players, setPlayers] = useState([])
    const [pictures64, setPictures64] = useState([])

    const [encounters, setEncounters] = useState([]);
    const [oldEncounters, setOldEncounters] = useState([]);

    const [currentEncounter, setCurrentEncounter] = useState({})

    const [tacticsList, setTacticsList] = useState([])
    const [tacticSelected, setTacticSelected] = useState()
    const [validTactic, setValidTactic] = useState(true)

    //LOADERS
    const [loading, setLoading] = useState(true)
    const [loading2, setLoading2] = useState(true)
    const [loading3, setLoading3] = useState(true)
    const [loading4, setLoading4] = useState(true)
    const [loading5, setLoading5] = useState(false)

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
        setLoading5(false)
        setPictures64([])
        if (currentTeamId !== "") {
            //recupération de tous les matchs de currentTeam
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
                    setOldEncounters(oldEncountersArray.reverse())
                    setCurrentEncounter(encountersArray[0])
                    setMatchLiveId(encountersArray[0].id)
                    setLoading(false)
                })
                .catch(error => {
                    console.log(error.response)
                    setLoading(false)
                })

            //récupération de toute les tactiques de currentTeam
            teamAPI.findAllTacticsByTeam(currentTeamId)
                .then(data => {
                    setTacticsList(data)
                    setLoading2(false)
                })
                .catch(error => {
                    console.log(error.respoonse)
                })

            //récupération de tous les player de currentTeam
            playerAPI.findPlayersOfTeamId(currentTeamId)
                .then(response => {
                    setPlayers(response.data['hydra:member'])

                    response.data['hydra:member'].forEach(player => {
                        if (player.picture) {
                            setLoading4(true)
                            playerAPI.fetchProfilePicture(player.picture)
                                .then(response => {
                                    setPictures64(pictures64 => [...pictures64, { [player.id]: response.data.data }])
                                    setLoading4(false)
                                })
                        } else {
                            setLoading4(false)
                        }
                    })
                    setLoading3(false)
                })
                .catch(error => {
                    console.log(error.response)
                })



        } else {
            setLoading(false)
            setLoading2(false)
            setLoading3(false)
            setLoading4(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTeamId])

    /**
     * gestion Modal pour changer la selection du match
     */
    const [show, setShow] = useState(false)

    const titleModal = "Tous les matchs"
    const [showFutur, setShowFutur] = useState(true)
    const showModal = () => {
        setShow(true)
    }
    const hideModal = () => {
        setShow(false)
    }
    const handleShowEncounters = () => {
        showModal()
    }
    const handleManagement = () => {
        if (document.getElementById('table-old-encounter').hidden === true) {
            document.getElementById('table-old-encounter').hidden = false
            document.getElementById('table-encounter').hidden = true
            setShowFutur(false)
        } else {
            document.getElementById('table-old-encounter').hidden = true
            document.getElementById('table-encounter').hidden = false
            setShowFutur(true)
        }
    }
    const handleChangeCurrentEncounter = (encounterSelect) => {
        setCurrentEncounter(encounterSelect)
        setMatchLiveId(encounterSelect.id)
        if (document.getElementById('tacticSelect')) {
            document.getElementById('tacticSelect').selectedIndex = null
        }
        setTacticSelected()
        hideModal()
    }

    const [searchOld, setSearchOld] = useState("");
    const handleSearchOld = event => {
        const value = event.currentTarget.value;
        setSearchOld(value);
    }
    const filteredOldEncounters = oldEncounters.filter(e =>
        e.labelOpposingTeam.toLowerCase().includes(searchOld.toLowerCase()) ||
        e.categoryOpposingTeam.toLowerCase().includes(searchOld.toLowerCase()) ||
        formattedDate(new Date(e.date)).toLowerCase().includes(searchOld.toLowerCase())
    )

    const [search, setSearch] = useState("");
    const handleSearch = event => {
        const value = event.currentTarget.value;
        setSearch(value);
    }
    const filteredEncounters = encounters.filter(e =>
        e.labelOpposingTeam.toLowerCase().includes(search.toLowerCase()) ||
        e.categoryOpposingTeam.toLowerCase().includes(search.toLowerCase()) ||
        formattedDate(new Date(e.date)).toLowerCase().includes(search.toLowerCase())
    )


    /**
     * 
     */



    /**
     * 
     * GESTION DE L AFFICHAGE DE LA FORMATION CHOISI POUR LE MATCH
     */
    const [playersSelected, setPlayersSelected] = useState([])
    const [playersSubstitute, setPlayersSubstitute] = useState([])

    const handleChangeTactic = (event) => {
        let tacticSelectedTmp = tacticsList.filter(tactic => tactic.id === parseInt(event.currentTarget.value, 10))[0]
        setTacticSelected(tacticSelectedTmp)
        setValidTactic(true)
        let tabSelection = [];

        if (tacticSelectedTmp) {
            for (let i = 1; i <= 11; i++) {
                let post = "pos" + i;
                if (tacticSelectedTmp[post] !== undefined) {

                    let thePlayer = players.filter(player => player.id === tacticSelectedTmp[post].id)[0]

                    if (thePlayer === undefined) {
                        tabSelection.push(null)
                        setValidTactic(false)
                    } else {
                        tabSelection.push(thePlayer)
                    }
                } else {
                    tabSelection.push(null)
                    setValidTactic(false)
                }
            }
        }

        let tabNotSelection = players.filter(function (o1) {
            // eslint-disable-next-line array-callback-return
            return !tabSelection.some(function (o2) {
                if (o2 !== null) {
                    return o1.id === o2.id
                }
            })
        })

        setPlayersSelected(tabSelection)
        setPlayersSubstitute(tabNotSelection)
    }
    const tacticTypeList = [
        ["5-3-2", [50, 93, "G"], [10, 64, "AiG"], [29, 72, "DCG"], [50, 78, "DC"], [71, 72, "DCD"], [90, 64, "AiD"], [26, 43, "MG"], [50, 50, "MC"], [74, 43, "MD"], [34, 18, "AvG"], [66, 18, "AvD"]],
        ["5-4-1", [50, 93, "G"], [10, 64, "AiG"], [29, 72, "DCG"], [50, 78, "DC"], [71, 72, "DCD"], [90, 64, "AiD"], [10, 34, "MG"], [36, 45, "MCG"], [64, 45, "MCD"], [90, 34, "MD"], [50, 20, "AC"]],
        ["3-5-2", [50, 93, "G"], [22, 70, "DCG"], [50, 77, "DC"], [78, 70, "DCD"], [15, 35, "MG"], [32, 45, "MCG"], [50, 55, "MC"], [68, 45, "MCD"], [85, 35, "MD"], [28, 20, "AvG"], [72, 20, "AvD"]],
        ["4-4-2-losange", [50, 93, "G"], [10, 64, "AiG"], [34, 77, "DCG"], [66, 77, "DCD"], [90, 64, "AiD"], [50, 57, "MD"], [27, 48, "MG"], [50, 36, "MO"], [73, 48, "MD"], [27, 20, "AvG"], [73, 20, "AvD"]],
        ["4-4-2-carre", [50, 93, "G"], [10, 64, "AiG"], [34, 77, "DCG"], [66, 77, "DCD"], [90, 64, "AiD"], [15, 40, "MG"], [35, 53, "MCG"], [65, 53, "MCD"], [85, 40, "MD"], [27, 20, "AvG"], [73, 20, "AvD"]],
        ["4-3-3", [50, 93, "G"], [10, 64, "AiG"], [35, 75, "DCG"], [65, 75, "DCD"], [90, 64, "AiD"], [25, 47, "MG"], [50, 50, "MC"], [75, 47, "MD"], [15, 25, "AvG"], [85, 25, "AvD"], [50, 15, "AC"]],
        ["4-5-1", [50, 93, "G"], [12, 67, "AiG"], [35, 78, "DCG"], [65, 78, "DCD"], [88, 67, "AiD"], [31, 55, "MDG"], [69, 55, "MDD"], [16, 35, "MG"], [50, 37, "MO"], [84, 35, "MD"], [50, 15, "AC"]],
        ["4-2-3-1", [50, 93, "G"], [15, 72, "AiG"], [38, 75, "DCG"], [61, 75, "DCD"], [85, 72, "AiD"], [38, 55, "MDG"], [61, 55, "MDD"], [15, 35, "MG"], [50, 35, "MO"], [85, 35, "MD"], [50, 15, "AC"]]
    ]
    /**
     * 
     */


    /**
     *  MODAL DE CONFIRMATION 
     */
    const [showConfirm, setShowConfirm] = useState(false)

    const showModalConfirm = () => {
        setShowConfirm(true)
    }
    const hideModalConfirm = () => {
        setShowConfirm(false)
    }
    const confirmStartingLive = () => {
        showModalConfirm()
    }

    /**
     * Sauvegarde de la tactic selectionnée (compléte!) en archive et setter dans le match sélectionné + redirection vers la page LIVE
     */
    const startingLive = () => {
        setLoading5(true)

        // 2.Crée tacticArch en BDD et le setter le match pour lequel on lance le live pour cela on a toutes les infos nécessaires dans tacticSelected, currentTeamId, playersSubstitute et currentEncounter 
        // 2.1 -> on crée notre objet tacticArch au préalable, comme ça on aura juste a le passer au complet à axios pour la création en BDD
        let playersSubstituteIRI = []
        playersSubstitute.forEach(player => {
            playersSubstituteIRI.push("/api/players/" + player.id)
        })

        let tacticArch = {
            "type": tacticSelected.type,
            "team": "/api/teams/" + currentTeamId,
            "pos1": "/api/players/" + tacticSelected.pos1.id,
            "pos2": "/api/players/" + tacticSelected.pos2.id,
            "pos3": "/api/players/" + tacticSelected.pos3.id,
            "pos4": "/api/players/" + tacticSelected.pos4.id,
            "pos5": "/api/players/" + tacticSelected.pos5.id,
            "pos6": "/api/players/" + tacticSelected.pos6.id,
            "pos7": "/api/players/" + tacticSelected.pos7.id,
            "pos8": "/api/players/" + tacticSelected.pos8.id,
            "pos9": "/api/players/" + tacticSelected.pos9.id,
            "pos10": "/api/players/" + tacticSelected.pos10.id,
            "pos11": "/api/players/" + tacticSelected.pos11.id,
            "substitutes": playersSubstituteIRI
        }

        tacticArchAPI.postTacticArch(tacticArch)
            .then(response => {

                //2.2 on set dans currentEncounter notre tacticArch qui est revenu de la BDD (response.data) 
                let responseTacticArchIRI = { tacticArch: "/api/tactic_arches/" + response.data.id }
                // donc -> putEncounter
                tacticArchAPI.putEncounterTacticArch(currentEncounter.id, responseTacticArchIRI)
                    .then(response => {
                        setLoading5(false)
                        // 3.Redirection vers la page de live
                        props.history.replace("/live/" + matchLiveId)

                    })
                    .catch(error => {
                        setLoading5(false)
                        console.log(error.response)
                    })
            })
            .catch(error => {
                setLoading5(false)
                console.log(error.response)
            })



    }

    const resumeLive = () => {
        props.history.replace("/live/" + matchLiveId)
    }


    return (
        <div className="wrapper_container PreLivePage">
            <CurrentUser />
            <h1>Pré-Live</h1>

            {(loading || loading2 || loading3 || loading4) && (
                <div className="bigLoader">
                    <Loader type="Circles" height="200" width="200" color="LightGray" />
                </div>
            )}

            {(!loading && !loading2 && !loading3 && !loading4) && (
                <div className="div-current-encounter">
                    <h4>Match</h4>
                    <section>
                        {currentEncounter && (
                            <div className="current-encounter">
                                <p>{formattedDate(new Date(currentEncounter.date))}</p>
                                <p> <span>VS</span> {currentEncounter.labelOpposingTeam + " - " + currentEncounter.categoryOpposingTeam}</p>
                            </div>
                        )}
                        {!currentEncounter && (
                            <div className="current-encounter">
                                Aucun match n'est prévu...
                            </div>
                        )}
                        <div className="change-current-encounter" onClick={handleShowEncounters}>
                        </div>
                    </section>
                </div>
            )}

            {(currentEncounter && !loading && !loading2 && !loading3 && !loading4) && (
                <div className="tactic">
                    {!currentEncounter.tacticArch && (
                        <h4>Formation</h4>
                    )}
                    {!currentEncounter.tacticArch && (
                        <select name="tactic" id="tacticSelect" onChange={handleChangeTactic} className="form-control">
                            <option defaultValue="">Selectionner votre Formation</option>
                            {tacticsList.map((tactic, index) => (
                                <option key={index} value={tactic.id} >
                                    {tactic.id + " / " + tactic.type}
                                </option>
                            ))}
                        </select>
                    )}
                    {currentEncounter.tacticArch && (
                        <div>
                            <p>Vous avez déjà un live en cours pour ce match</p>
                            <button className="starting-live" type="button" onClick={resumeLive}>
                                Reprendre le Live
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tacticSelected && (
                <div className="tacticSelected">
                    <div id="soccerField">
                        {playersSelected && (
                            playersSelected.map((player, index) => (
                                <SlotPoste
                                    key={index}
                                    id={"pos" + (index + 1)}
                                    num={index + 1}
                                    tactic={tacticTypeList.filter(tactic => tactic[0] === tacticSelected.type)[0]}
                                    className="fieldPos"
                                >
                                    {player && (
                                        <div className="player-div">
                                            {player.picture && (
                                                <div>
                                                    {pictures64.map((picture, index) => (
                                                        picture[player.id] && (
                                                            <div key={index} className='player-picture-div'>
                                                                {picture[player.id] && (
                                                                    <img src={`data:image/jpeg;base64,${picture[player.id]}`} alt="" />
                                                                )}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                            {!player.picture && (
                                                <div className="player-no-picture"></div>
                                            )}
                                            <p>{player.user.firstName}.{player.user.lastName.charAt(0)}</p>
                                        </div>
                                    )}
                                    {!player && (
                                        <div className="player-div">
                                            <div className="player-null"></div>
                                        </div>
                                    )}
                                </SlotPoste>
                            ))
                        )}
                    </div>
                    <div className="substitute">
                        <h3>Remplacants</h3>
                        {playersSubstitute && (
                            playersSubstitute.map((player, index) => (
                                <div className="player-div" key={index}>
                                    {player.picture && (
                                        <div>
                                            {pictures64.map((picture, index) => (
                                                picture[player.id] && (
                                                    <div key={index} className='player-picture-div'>
                                                        {picture[player.id] && (
                                                            <img src={`data:image/jpeg;base64,${picture[player.id]}`} alt="" />
                                                        )}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                    {!player.picture && (
                                        <div className="player-no-picture"></div>
                                    )}
                                    <p>{player.user.firstName}.{player.user.lastName.charAt(0)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {(tacticSelected && !validTactic) && (
                <div className="warning-msg">
                    <p>La formation sélectionnée n'est pas compléte, démarrage du Live impossible</p>
                    <p>Pour toutes modifications nécessaires, veuillez vous rendre sur la page Formation</p>
                </div>
            )}
            {(tacticSelected && validTactic) && (
                <div>
                    <button type="button" className="starting-live" onClick={confirmStartingLive}>
                        LANCER LE LIVE
                    </button>
                </div>
            )}

            <Modal
                show={show}
                handleClose={hideModal}
                title={titleModal}
            >
                <button className="btn btn-primary btn-management" onClick={handleManagement}>
                    {showFutur ? "Voir les matchs passés" : "Voir les matchs à venir"}
                </button>

                <div id="table-old-encounter" hidden>
                    <div id="div-search" className="form-group">
                        <input className="search form-control" type="text" onChange={handleSearchOld} value={searchOld} placeholder="Rechercher" />
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Adversaire</th>
                                <th></th>
                            </tr>
                        </thead>
                        {oldEncounters.length > 0 && (
                            <tbody>
                                {filteredOldEncounters.map((oldEncounter, index) => (
                                    <tr key={index}>
                                        <td className={oldEncounter.tacticArch ? "encounter-lived" : ""}>{formattedDate(new Date(oldEncounter.date))}</td>
                                        <td>{oldEncounter.labelOpposingTeam + " - " + oldEncounter.categoryOpposingTeam}</td>
                                        <td>
                                            <button className="btn btn-secondary" onClick={() => handleChangeCurrentEncounter(oldEncounter)}>V</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                        {oldEncounters.length === 0 && (
                            <tbody>
                                <tr>
                                    <td>Pas de matchs passés</td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
                <div id="table-encounter">
                    <div id="div-search" className="form-group">
                        <input className="search form-control" type="text" onChange={handleSearch} value={search} placeholder="Rechercher" />
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Adversaire</th>
                                <th></th>
                            </tr>
                        </thead>
                        {encounters.length > 0 && (
                            <tbody>
                                {filteredEncounters.map((encounter, index) => (
                                    <tr key={index} >
                                        <td className={encounter.tacticArch ? "encounter-lived" : ""}>{formattedDate(new Date(encounter.date))}</td>
                                        <td>{encounter.labelOpposingTeam + " - " + encounter.categoryOpposingTeam}</td>
                                        <td>
                                            <button className="btn btn-secondary" onClick={() => handleChangeCurrentEncounter(encounter)}>V</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                        {encounters.length === 0 && (
                            <tbody>
                                <tr>
                                    <td>Pas de matchs à venir</td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </Modal>

            <Modal
                show={showConfirm}
                handleClose={hideModalConfirm}
                title="Demande de confirmation"
            >
                <div className="confirm-modal">
                    <h5>Avertissement</h5>
                    <p>Soyez sûr du match et de la formation que vous avez sélectionnées. Si vous confirmez la lancement du live, ce match sera <span>définitivement</span> lié à cette formation.</p>

                    {!loading5 && (
                        <button className="btn btn-primary" onClick={startingLive}>
                            Go Live
                        </button>
                    )}
                    {loading5 && (
                        <div className="LoaderModal">
                            <Loader type="ThreeDots" width="100" height="80" color="LightGray" />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default PreLivePage;


