import Axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MultiBackend, { DndProvider, TouchTransition } from "react-dnd-multi-backend";
import { TouchBackend } from 'react-dnd-touch-backend';
import ItemsCarousel from 'react-items-carousel';
import Loader from 'react-loader-spinner';
import '../../scss/pages/LivePage.scss';
import { ButtonLeft, ButtonRight } from '../components/live/ButtonsCarousel';
import MyPreviewLive from '../components/live/MyPreviewLive';
import PlayerCardLive from '../components/live/PlayerCardLive';
import Scoreboard from '../components/live/Scoreboard';
import SlotOnField from '../components/live/SlotOnField';
import Modal from "../components/Modal";
import MatchLiveContext from '../contexts/MatchLiveContext';
import playerAPI from '../services/playerAPI';

export const LivePlayersContext = createContext({
    playersSelected: [],
    playersSubstitute: [],
    playersOut: [],
    tactic: {}
})

const LivePage = (props) => {

    //Le seul endroit où on setMatchLiveId est la page de pré-Live. 
    //Donc au chargement de cette page, si jamais matchLiveId n'existe pas dans le context c'est qu'on est pas passé au préalable par la page pré-live, au quel cas on dégage l'utilisateur vers la page en question
    //de même si jamais matchLiveId existe bel et bien MAIS QUE l'id du match dans le l'URL de cette page ne correspond pas, alors ça veut dire que l'url a été modifié manuellement, et on dégage l'utilisateur vers la page pré-Live
    const { matchLiveId } = useContext(MatchLiveContext)


    const [encounter, setEncounter] = useState({})
    const [tactic, setTactic] = useState({})
    const [playersSelected, setPlayersSelected] = useState([])
    const [playersSubstitute, setPlayersSubstitute] = useState([])
    const [playersOut, setPlayersOut] = useState([])

    const [pictures64, setPictures64] = useState([])

    const [home, setHome] = useState(0)
    const [visitor, setVisitor] = useState(0)

    const [stats, setStats] = useState([])

    const [reverseSide, setReverseSide] = useState(false)

    const [modif, setModif] = useState(false)



    //LOADERS
    const [loading, setLoading] = useState(true)
    const [loading3, setLoading3] = useState(true)
    const [loading4, setLoading4] = useState(true)
    const [loading5, setLoading5] = useState(true)
    const [loading6, setLoading6] = useState(false)
    const [loading7, setLoading7] = useState(false)
    const [loading8, setLoading8] = useState(false)
    const [loading9, setLoading9] = useState(false)



    /**
     * MISE EN PLACE AU CHARGEMENT DE LA PAGE
     */
    useEffect(() => {
        setLoading(true)
        setLoading3(true)
        setLoading4(true)
        setLoading5(true)


        setPictures64([])

        let statsObjTmp = {
            goal: 0,
            passAssist: 0,
            redCard: 0,
            yellowCard: 0
        }
        let statsArrayTmp = []

        if (!matchLiveId) {
            props.history.replace('/preLive')
        } else {
            if (matchLiveId !== parseInt(props.match.params.matchId, 10)) {
                props.history.replace('/preLive')
            }
            //on charge la rencontre
            Axios.get('http://localhost:8000/api/encounters/' + matchLiveId)
                .then(response => {
                    setEncounter(response.data)
                    setTactic(response.data.tacticArch)

                    if (response.data.tacticArch.substitutes) {
                        setPlayersSubstitute(response.data.tacticArch.substitutes)
                        //je parcours la listes des remplacants et je charge leur photo si ils en ont une
                        response.data.tacticArch.substitutes.forEach(player => {
                            if (player.picture) {
                                setLoading3(true)
                                playerAPI.fetchProfilePicture(player.picture)
                                    .then(response => {
                                        setPictures64(pictures64 => [...pictures64, { [player.id]: response.data.data }])
                                        setLoading3(false)
                                    })
                            } else {
                                setLoading3(false)
                            }
                        })

                        //gestion de l'affichage du nombre de card dans le carousel des remplacant
                        if (response.data.tacticArch.substitutes.length === 0) {
                            setNoOfCard(0)
                        } else if (response.data.tacticArch.substitutes.length === 1) {
                            setNoOfCard(1)
                        } else if (response.data.tacticArch.substitutes.length === 2) {
                            setNoOfCard(2)
                        } else if (response.data.tacticArch.substitutes.length === 3) {
                            setNoOfCard(3)
                        } else if (response.data.tacticArch.substitutes.length === 4) {
                            setNoOfCard(4)
                        } else if (response.data.tacticArch.substitutes.length === 5) {
                            setNoOfCard(5)
                        } else {
                            setNoOfCard(6)
                        }

                    }

                    if (response.data.tacticArch.substitutesOut) {
                        setPlayersOut(response.data.tacticArch.substitutesOut)

                        //parcours des joueurs sortie et créa de stats à 0 pour chancun
                        response.data.tacticArch.substitutesOut.forEach(player => {
                            statsArrayTmp[player.id] = statsObjTmp
                        })
                    }

                    let tabSelection = []
                    for (var i = 1; i <= 11; i++) {
                        let post = "pos" + i
                        tabSelection.push(response.data.tacticArch[post])
                        let playerCurrentTmp = response.data.tacticArch[post]
                        //en meme temps si le joueur a une photo je la charge
                        if (playerCurrentTmp.picture) {
                            setLoading4(true)
                            playerAPI.fetchProfilePicture(playerCurrentTmp.picture)
                                .then(response => {
                                    setPictures64(pictures64 => [...pictures64, { [playerCurrentTmp.id]: response.data.data }])
                                    setLoading4(false)
                                })
                                .catch(error => {
                                    console.log(error.response)
                                })
                        } else {
                            setLoading4(false)
                        }

                        //j'en profite pour créer de stats à 0 pour chancun des joueurs sur le terrain
                        statsArrayTmp[playerCurrentTmp.id] = statsObjTmp

                    }

                    setPlayersSelected(tabSelection)



                    if (response.data.home) {
                        setHome(response.data.home)
                    }
                    if (response.data.visitor) {
                        setVisitor(response.data.visitor)
                    }

                    //on charge les stats
                    Axios.get('http://localhost:8000/api/encounters/' + matchLiveId + "/stats")
                        .then(response => {
                            let statsBDD = response.data['hydra:member']

                            if (statsBDD.length > 0) {
                                statsBDD.forEach(stat => {
                                    statsArrayTmp[stat.player.id] = {
                                        id: stat.id,
                                        goal: stat.goal,
                                        passAssist: stat.passAssist,
                                        redCard: stat.redCard,
                                        yellowCard: stat.yellowCard
                                    }
                                })
                            } else {
                                setModif(true)
                            }

                            setStats(statsArrayTmp)
                            setLoading5(false)
                        })
                        .catch(error => {
                            console.log(error.response)
                        })

                    setLoading(false)
                })
                .catch(error => {
                    console.log(error.response)
                })

        }
    }, [matchLiveId, props.history, props.match.params.matchId])


    /**
     * FONCTIONS DES MODIFICATIONS DU SCORES
     */
    const addHome = () => {
        if (home < 100) {
            setHome(home + 1)
            setModif(true)
        }
    }
    const addVisitor = () => {
        if (visitor < 100) {
            setVisitor(visitor + 1)
            setModif(true)
        }
    }
    const subHome = () => {
        if (home > 0) {
            setHome(home - 1)
            setModif(true)
        }
    }
    const subVisitor = () => {
        if (visitor > 0) {
            setVisitor(visitor - 1)
            setModif(true)
        }
    }


    /**
     * OPTIONS CAROUSEL
     */
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const [noOfCard, setNoOfCard] = useState(0)
    /**
     * DECLARATION DES DIFFERENTES FORMATION
     */
    const tacticTypeList = [
        ["5-3-2", [8, 50, "G"], [36, 11, "AiG"], [27, 29, "DCG"], [22, 50, "DC"], [27, 71, "DCD"], [36, 89, "AiD"], [56, 24, "MG"], [47, 50, "MC"], [56, 76, "MD"], [80, 29, "AvG"], [80, 71, "AvD"]],
        ["5-4-1", [8, 50, "G"], [36, 11, "AiG"], [27, 29, "DCG"], [22, 50, "DC"], [27, 71, "DCD"], [36, 89, "AiD"], [62, 17, "MG"], [49, 37, "MCG"], [49, 63, "MCD"], [62, 83, "MD"], [78, 50, "AC"]],
        ["3-5-2", [8, 50, "G"], [28, 25, "DCG"], [23, 50, "DC"], [28, 75, "DCD"], [61, 11, "MG"], [52, 30, "MCG"], [45, 50, "MC"], [52, 70, "MCD"], [61, 89, "MD"], [80, 30, "AvG"], [80, 70, "AvD"]],
        ["4-4-2-losange", [8, 50, "G"], [35, 16, "AiG"], [24, 35, "DCG"], [24, 65, "DCD"], [35, 84, "AiD"], [41, 50, "MD"], [52, 26, "MG"], [65, 50, "MO"], [52, 74, "MD"], [80, 30, "AvG"], [80, 70, "AvD"]],
        ["4-4-2-carre", [8, 50, "G"], [35, 16, "AiG"], [24, 35, "DCG"], [24, 65, "DCD"], [35, 84, "AiD"], [49, 35, "MG"], [60, 16, "MCG"], [60, 84, "MCD"], [49, 65, "MD"], [80, 30, "AvG"], [80, 70, "AvD"]],
        ["4-3-3", [8, 50, "G"], [32, 13, "AiG"], [23, 35, "DCG"], [23, 65, "DCD"], [32, 87, "AiD"], [56, 25, "MG"], [48, 50, "MC"], [56, 75, "MD"], [80, 20, "AvG"], [80, 80, "AvD"], [85, 50, "AC"]],
        ["4-5-1", [8, 50, "G"], [32, 13, "AiG"], [23, 35, "DCG"], [23, 65, "DCD"], [32, 87, "AiD"], [46, 32, "MDG"], [46, 68, "MDD"], [64, 14, "MG"], [62, 50, "MO"], [64, 86, "MD"], [84, 50, "AC"]],
        ["4-2-3-1", [8, 50, "G"], [28, 14, "AiG"], [22, 37, "DCG"], [22, 63, "DCD"], [28, 86, "AiD"], [44, 36, "MDG"], [44, 64, "MDD"], [66, 14, "MG"], [63, 50, "MO"], [66, 86, "MD"], [86, 50, "AC"]]
    ]
    const tacticTypeListReverse = [
        ["5-3-2", [92, 50, "G"], [64, 89, "AiG"], [73, 71, "DCG"], [78, 50, "DC"], [73, 29, "DCD"], [64, 11, "AiD"], [44, 76, "MG"], [53, 50, "MC"], [44, 24, "MD"], [20, 71, "AvG"], [20, 29, "AvD"]],
        ["5-4-1", [92, 50, "G"], [64, 89, "AiG"], [73, 71, "DCG"], [78, 50, "DC"], [73, 29, "DCD"], [64, 11, "AiD"], [38, 83, "MG"], [51, 63, "MCG"], [51, 37, "MCD"], [38, 17, "MD"], [22, 50, "AC"]],
        ["3-5-2", [92, 50, "G"], [72, 75, "DCG"], [77, 50, "DC"], [72, 25, "DCD"], [39, 89, "MG"], [48, 70, "MCG"], [55, 50, "MC"], [48, 30, "MCD"], [39, 11, "MD"], [20, 70, "AvG"], [20, 30, "AvD"]],
        ["4-4-2-losange", [92, 50, "G"], [65, 84, "AiG"], [76, 65, "DCG"], [76, 35, "DCD"], [65, 16, "AiD"], [59, 50, "MD"], [48, 74, "MG"], [35, 50, "MO"], [48, 26, "MD"], [20, 70, "AvG"], [20, 30, "AvD"]],
        ["4-4-2-carre", [92, 50, "G"], [65, 84, "AiG"], [76, 65, "DCG"], [76, 35, "DCD"], [65, 16, "AiD"], [51, 65, "MG"], [40, 84, "MCG"], [40, 16, "MCD"], [51, 35, "MD"], [20, 70, "AvG"], [20, 30, "AvD"]],
        ["4-3-3", [92, 50, "G"], [68, 87, "AiG"], [77, 65, "DCG"], [77, 35, "DCD"], [68, 13, "AiD"], [44, 75, "MG"], [52, 50, "MC"], [44, 25, "MD"], [20, 80, "AvG"], [20, 20, "AvD"], [15, 50, "AC"]],
        ["4-5-1", [92, 50, "G"], [68, 87, "AiG"], [77, 65, "DCG"], [77, 35, "DCD"], [68, 13, "AiD"], [54, 68, "MDG"], [54, 32, "MDD"], [36, 86, "MG"], [38, 50, "MO"], [36, 14, "MD"], [16, 50, "AC"]],
        ["4-2-3-1", [92, 50, "G"], [62, 86, "AiG"], [78, 63, "DCG"], [78, 37, "DCD"], [62, 14, "AiD"], [56, 64, "MDG"], [56, 36, "MDD"], [34, 86, "MG"], [37, 50, "MO"], [34, 14, "MD"], [14, 50, "AC"]]
    ]
    /**
     * FONCTION POUR CHANGER DE COTE DE TERRAIN 
     */
    const handleReverseSide = () => {
        if (reverseSide) {
            setReverseSide(false)
            document.getElementById('side').classList.remove("side-reverse")
        } else {
            setReverseSide(true)
            document.getElementById('side').classList.add("side-reverse")
        }
    }

    /**
     * REACT DND - DECLARATION PREVIEW CUSTOM POUR LE TACTILE
     */
    const HTML5toTouch = {
        backends: [
            {
                backend: HTML5Backend,
                // options : { enableTouchEvents: true}
            },
            {
                backend: TouchBackend,
                options: { enableMouseEvents: true },
                preview: true,
                transition: TouchTransition
            }
        ]
    };


    /**
     *  MODAL DE CONFIRMATION DE REMPLACEMENT
     */
    const [showConfirm, setShowConfirm] = useState(false)

    const showModalConfirm = () => {
        setShowConfirm(true)
    }
    const hideModalConfirm = () => {
        setShowConfirm(false)
    }


    /**
     * FONCTIONS DE REMPLACEMENT D'UN PLAYER
     */
    const [playerDrag, setPlayerDrag] = useState({})
    const [playerTarget, setPlayerTarget] = useState({})
    const [tacticCopy, setTacticCopy] = useState({})
    const [playersSelectedCopy, setPlayersSelectedCopy] = useState([])
    const [playersSubstituteCopy, setPlayersSubstituteCopy] = useState([])
    const [playersOutCopy, setPlayersOutCopy] = useState([])

    const handleSubstitutePlayer = (playersSelectedCopy, playersSubstituteCopy, playersOutCopy, tacticCopy, playerDrag, playerTarget) => {

        //ouverture modal de confirmation pour le remplacement
        setPlayerDrag(playerDrag)
        setPlayerTarget(playerTarget)
        setPlayersOutCopy(playersOutCopy)
        setPlayersSubstituteCopy(playersSubstituteCopy)
        setPlayersSelectedCopy(playersSelectedCopy)
        setTacticCopy(tacticCopy)

        showModalConfirm()
    }

    const substituteConfirm = () => {
        //création des stats du nouveau joueurs qui entre sur le terrain (initialisé a 0)
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        statsArrayTmp[playerDrag.id] = {
            goal: 0,
            passAssist: 0,
            redCard: 0,
            yellowCard: 0
        }
        //gestion de l'affichage du nombre de card dans le carousel des remplacant
        if (playersSubstituteCopy.length === 0) {
            setNoOfCard(0)
        } else if (playersSubstituteCopy.length === 1) {
            setNoOfCard(1)
        } else if (playersSubstituteCopy.length === 2) {
            setNoOfCard(2)
        } else if (playersSubstituteCopy.length === 3) {
            setNoOfCard(3)
        } else if (playersSubstituteCopy.length === 4) {
            setNoOfCard(4)
        } else if (playersSubstituteCopy.length === 5) {
            setNoOfCard(5)
        } else {
            setNoOfCard(6)
        }
        setStats(statsArrayTmp)
        setPlayersOut(playersOutCopy)
        setPlayersSubstitute(playersSubstituteCopy)
        setPlayersSelected(playersSelectedCopy)
        setTactic(tacticCopy)
        setModif(true)

        hideModalConfirm()
    }

    /**
     * FONCTION D ECHANGE DE PLACE ENTRE DEUX JOUEURS DEJA SUR LE TERRAIN
     */
    const handleExchangePlayers = (playersSelectedCopy, tacticCopy) => {
        setPlayersSelected(playersSelectedCopy)
        setTactic(tacticCopy)
        setModif(true)
    }


    /**
     * SERIE DE FONCTIONS PERMETTANT DE SETTER LES STATS D UN PLAYER SUR LE TERRAIN
     */
    const downYellowCard = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        if (statsOjbTmp.yellowCard === 2 && statsOjbTmp.redCard === 1) {
            statsOjbTmp.yellowCard -= 1
            statsOjbTmp.redCard -= 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
        else if (statsOjbTmp.yellowCard > 0) {
            statsOjbTmp.yellowCard -= 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
    }
    const upYellowCard = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        if (statsOjbTmp.yellowCard < 2) {
            statsOjbTmp.yellowCard += 1

            if (statsOjbTmp.yellowCard === 2 && statsOjbTmp.redCard === 0) {
                statsOjbTmp.redCard += 1
            }
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
    }
    const downRedCard = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        if (statsOjbTmp.redCard === 1 && statsOjbTmp.yellowCard === 2) {
            statsOjbTmp.redCard -= 1
            statsOjbTmp.yellowCard -= 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
        else if (statsOjbTmp.redCard > 0) {
            statsOjbTmp.redCard -= 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
    }
    const upRedCard = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        if (statsOjbTmp.redCard < 1) {
            statsOjbTmp.redCard += 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
    }
    const downPassAssist = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        if (statsOjbTmp.passAssist > 0) {
            statsOjbTmp.passAssist -= 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
    }
    const upPassAssist = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        statsOjbTmp.passAssist += 1

        statsArrayTmp[playerID] = statsOjbTmp
        setStats(statsArrayTmp)
        setModif(true)
    }
    const downGoal = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        if (statsOjbTmp.goal > 0 && home > 0) {
            setHome(home - 1)
            statsOjbTmp.goal -= 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
        else if (statsOjbTmp.goal > 0) {
            statsOjbTmp.goal -= 1
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
    }
    const upGoal = (playerID) => {
        //faire une copie du tableau stats, 
        let statsArrayTmp = [...stats]
        let statsOjbTmp = { ...statsArrayTmp[playerID] }

        if (home < 100) {
            statsOjbTmp.goal += 1
            setHome(home + 1)
            statsArrayTmp[playerID] = statsOjbTmp
            setStats(statsArrayTmp)
            setModif(true)
        }
    }

    /**
     * MODAL CHANGEMENT DE FORMATION
     */
    const [showOtherTactics, setShowOtherTactics] = useState(false)
    const [tacticSelected, setTacticSelected] = useState()
    const showModalTactic = () => {
        setShowOtherTactics(true)
    }
    const hideModalTactic = () => {
        setShowOtherTactics(false)
    }
    const handleChangeTactic1 = (event) => {
        let tacticSelectedTmp = tacticTypeList.filter(tacticType => tacticType[0] === event.currentTarget.value)[0]
        setTacticSelected(tacticSelectedTmp)
    }


    /**
     * FONCTION POUR CHANGER LA FORMATION (disposition des joueurs sur le terrain)
     */
    const handleSelectOtherTactic = () => {
        setTacticSelected()
        if (document.getElementById('tactic-select')) {
            document.getElementById('tactic-select').selectedIndex = null
        }
        showModalTactic()
    }
    const handleChangeTactic2 = () => {
        setTactic({ ...tactic, type: tacticSelected[0] })
        setModif(true)
        hideModalTactic()
    }

    /**
     * FONCTION DE SAUVEGARDE DE L ETAT DU MATCH
     */
    const handleSave = () => {
        setLoading6(true)
        setLoading7(true)
        setLoading8(true)

        //call Axios -> putEncounter.   On lui envoie home, visitor
        Axios.put('http://localhost:8000/api/encounters/' + encounter.id,
            {
                home: home,
                visitor: visitor
            })
            .then(response => {
                console.log(response.data)
                setLoading6(false)
            })
            .catch(error => {
                console.log(error.response)
                setLoading6(false)
            })

        let playersSubstituteIRI = []
        playersSubstitute.forEach(player => {
            playersSubstituteIRI.push("/api/players/" + player.id)
        })
        let playersSubstituteOutIRI = []
        playersOut.forEach(player => {
            playersSubstituteOutIRI.push("/api/players/" + player.id)
        })

        //call Axios -> putTacticArch, on lui envoie tactic
        Axios.put("http://localhost:8000/api/tactic_arches/" + tactic.id,
            {
                pos1: "/api/players/" + tactic.pos1.id,
                pos2: "/api/players/" + tactic.pos2.id,
                pos3: "/api/players/" + tactic.pos3.id,
                pos4: "/api/players/" + tactic.pos4.id,
                pos5: "/api/players/" + tactic.pos5.id,
                pos6: "/api/players/" + tactic.pos6.id,
                pos7: "/api/players/" + tactic.pos7.id,
                pos8: "/api/players/" + tactic.pos8.id,
                pos9: "/api/players/" + tactic.pos9.id,
                pos10: "/api/players/" + tactic.pos10.id,
                pos11: "/api/players/" + tactic.pos11.id,
                type: tactic.type,
                substitutes: playersSubstituteIRI,
                substitutesOut: playersSubstituteOutIRI
            })
            .then(response => {
                console.log(response.data)
                setLoading7(false)
            })
            .catch(error => {
                console.log(error.response)
                setLoading7(false)
            })

        //call Axios -> sauvegarde de toutes les stats en put ou post si oui ou non elles existait deja
        stats.forEach((statObj, index) => {
            setLoading8(true)
            if (statObj) {
                if (statObj.id) {
                    Axios.put("http://localhost:8000/api/stats/" + statObj.id, {
                        redCard: statObj.redCard,
                        yellowCard: statObj.yellowCard,
                        goal: statObj.goal,
                        passAssist: statObj.passAssist
                    })
                        .then(response => {
                            console.log(response.data)
                            setLoading8(false)
                        })
                        .catch(error => {
                            console.log(error.response)
                            setLoading8(false)
                        })
                } else {
                    Axios.post("http://localhost:8000/api/stats", {
                        encounter: "/api/encounters/" + encounter.id,
                        player: "/api/players/" + index,
                        redCard: statObj.redCard,
                        yellowCard: statObj.yellowCard,
                        goal: statObj.goal,
                        passAssist: statObj.passAssist
                    })
                        .then(response => {
                            console.log(response.data)
                            setLoading8(false)
                        })
                        .catch(error => {
                            console.log(error.response)
                            setLoading8(false)
                        })
                }
            }
        })
        setModif(false)
    }

    /**
     * FONCTION POUR QUITTER LE LIVE SANS SAUVEGARDER
     */
    const [showQuit, setShowQuit] = useState(false)

    const showModalQuit = () => {
        setShowQuit(true)
    }
    const hideModalQuit = () => {
        setShowQuit(false)
    }
    const handleConfirmQuit = () => {
        showModalQuit()
    }
    const cancelQuit = () => {
        hideModalQuit()
    }
    const handleQuit = () => {
        props.history.replace('/preLive')
    }

    /**
     * FONCTION POUR SUPPRIMER LE LIVE DU MATCH
     */
    const [showDelete, setShowDelete] = useState(false)
    const showModalDelete = () => {
        setShowDelete(true)
    }
    const hideModalDelete = () => {
        setShowDelete(false)
    }
    const handleConfirmDelete = () => {
        showModalDelete()
    }
    const cancelDelete = () => {
        hideModalDelete()
    }
    const handleDelete = () => {
        //delete tacticArch && toutes les stats && put home et visitor a null pour encounter
        try {
            setLoading9(true)
            stats.forEach((statsObj, index) => {
                if (statsObj) {
                    if (statsObj.id) {
                        Axios.delete("http://localhost:8000/api/stats/" + statsObj.id)
                            .then(response => {
                                console.log(response)
                            })
                            .catch(error => {
                                console.log(error.response)
                            })
                    }
                }
            })

            Axios.put('http://localhost:8000/api/encounters/' + encounter.id, {
                home: null,
                visitor: null
            })
                .then(response => {
                    console.log(response)
                })
                .catch(error => {
                    console.log(error.response)
                })

            Axios.delete("http://localhost:8000/api/tactic_arches/" + tactic.id)
                .then(response => {
                    console.log(response)
                })
                .catch(error => {
                    console.log(error)
                })

        }
        catch (error) {
            console.log(error)
            setLoading9(false)
        }
        finally {
            props.history.replace("/dashboardCoach")
        }
    }

    return (
        <div className="LivePage">
            <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                <LivePlayersContext.Provider
                    value={{
                        playersSelected,
                        playersSubstitute,
                        playersOut,
                        tactic
                    }}
                >
                    {(loading || loading3 || loading4 || loading5) && (
                        <div className="bigLoader">
                            <Loader type="Circles" height="200" width="200" color="LightGray" />
                        </div>
                    )}
                    {(!loading && !loading3 && !loading4 && !loading5) && (

                        <div className="infos-players-substitute">
                            <Scoreboard
                                home={home}
                                visitor={visitor}
                                addHome={addHome}
                                subHome={subHome}
                                addVisitor={addVisitor}
                                subVisitor={subVisitor}
                            ></Scoreboard>
                            <div className="playersSubstituteList">
                                {(playersSubstitute.length > 0) && (
                                    <ItemsCarousel
                                        infiniteLoop={false}
                                        gutter={4}
                                        activePosition={'center'}
                                        chevronWidth={28}
                                        disableSwipe={false}
                                        alwaysShowChevrons={false}
                                        numberOfCards={noOfCard}
                                        slidesToScroll={2}
                                        outsideChevron={true}
                                        showSlither={false}
                                        firstAndLastGutter={false}
                                        activeItemIndex={activeItemIndex}
                                        requestToChangeActive={setActiveItemIndex}
                                        rightChevron={
                                            <ButtonRight />
                                        }
                                        leftChevron={
                                            <ButtonLeft />
                                        }
                                    >
                                        {playersSubstitute.map((player, index) => (
                                            <PlayerCardLive
                                                key={index}
                                                player={player}
                                                className="playerCardSubstitute"
                                                posOrigin={"free"}
                                                pictures64={pictures64}
                                            />
                                        ))}
                                    </ItemsCarousel>
                                )}
                            </div>
                            <div className="btn_list">
                                {(loading6 || loading7 || loading8) && (
                                    <div className="LoaderModal">
                                        <Loader type="ThreeDots" width="60" height="25" color="LightGray" />
                                    </div>
                                )}
                                {(modif && !loading6 && !loading7 && !loading8) && (
                                    <button className="btn btn-secondary" onClick={handleSave}>Sauvegarder</button>
                                )}
                                <button className="btn btn-warning" onClick={handleConfirmQuit}>Quitter</button>
                                <button className="btn btn-danger" onClick={handleConfirmDelete}>Supprimer</button>
                            </div>
                        </div>
                    )}
                    {(!loading && !loading3 && !loading4 && !loading5) && (
                        <div className="field-playersOut">
                            <div id="soccerFieldHz">
                                <div className="formations">
                                    <div className="change-formation" onClick={handleSelectOtherTactic}></div>
                                    <p>Formation : {tactic.type}</p>
                                </div>
                                <div id="side" className="side" onClick={handleReverseSide}>
                                </div>
                                {playersSelected.map((player, index) => (
                                    <SlotOnField
                                        key={index}
                                        id={"pos" + (index + 1)}
                                        num={index + 1}
                                        tacticType={reverseSide ? tacticTypeListReverse.filter(tacticType => tacticType[0] === tactic.type)[0] : tacticTypeList.filter(tacticType => tacticType[0] === tactic.type)[0]}
                                        className="fieldPos"
                                        parentCallBackSubstitute={handleSubstitutePlayer}
                                        parentCallBackExchange={handleExchangePlayers}
                                    >
                                        <PlayerCardLive
                                            player={player}
                                            posOrigin={"pos" + (index + 1)}
                                            className="playerCardSelected"
                                            pictures64={pictures64}
                                            stats={stats[player.id]}
                                            parentCallBackDownYellowCard={downYellowCard}
                                            parentCallBackUpYellowCard={upYellowCard}
                                            parentCallBackDownRedCard={downRedCard}
                                            parentCallBackUpRedCard={upRedCard}
                                            parentCallBackDownPassAssist={downPassAssist}
                                            parentCallBackUpPassAssist={upPassAssist}
                                            parentCallBackDownGoal={downGoal}
                                            parentCallBackUpGoal={upGoal}
                                        />
                                    </SlotOnField>
                                ))}
                                {playersOut.length > 0 && (
                                    <div className="list-substitutes-out">
                                        <h5>Joueurs sortis</h5>
                                        <ul>
                                            {playersOut.map((player, index) => (
                                                <li key={index}>
                                                    {player.user.firstName}.{player.user.lastName.charAt(0)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Modal
                        show={showConfirm}
                        handleClose={hideModalConfirm}
                        title="Demande de confirmation"
                    >
                        {(playerDrag.user && playerTarget.user) && (

                            <div className="confirm-modal">
                                <h2>Remplacement</h2>
                                <div>
                                    <div className="players-subsitutes">
                                        {playerTarget.picture && (
                                            pictures64.map((picture, index) => (
                                                picture[playerTarget.id] && (
                                                    <div key={index} className='picture-profil'>
                                                        {picture[playerTarget.id] && (
                                                            <img src={`data:image/jpeg;base64,${picture[playerTarget.id]}`} alt="" />
                                                        )}
                                                    </div>
                                                )
                                            ))
                                        )}
                                        {!playerTarget.picture && (
                                            <div className="user-picture">
                                            </div>
                                        )}
                                        <p>{playerTarget.user.firstName}.{playerTarget.user.lastName}</p>
                                    </div>

                                    <div className="arrows">

                                    </div>

                                    <div className="players-subsitutes">
                                        {playerDrag.picture && (
                                            pictures64.map((picture, index) => (
                                                picture[playerDrag.id] && (
                                                    <div key={index} className='picture-profil'>
                                                        {picture[playerDrag.id] && (
                                                            <img src={`data:image/jpeg;base64,${picture[playerDrag.id]}`} alt="" />
                                                        )}
                                                    </div>
                                                )
                                            ))
                                        )}
                                        {!playerDrag.picture && (
                                            <div className="user-picture">
                                            </div>
                                        )}
                                        <p>{playerDrag.user.firstName}.{playerDrag.user.lastName}</p>
                                    </div>

                                </div>
                                <button className="btn btn-primary" onClick={substituteConfirm}>
                                    Valider
                                </button>
                            </div>
                        )}
                    </Modal>

                    <Modal
                        show={showOtherTactics}
                        handleClose={hideModalTactic}
                        title="Changement de formation"
                    >
                        <div className="tactic-modal">
                            <select name="tactic-select" id="tactic-select" className="form-control" onChange={handleChangeTactic1}>
                                <option defaultValue="">Selectionner une formation</option>
                                {tacticTypeList.map((tacticType, index) => (
                                    <option key={index} value={tacticType[0]} className={tacticType[0] === tactic.type ? "currentTactic" : ""}>
                                        {tacticType[0]} {tacticType[0] === tactic.type && ("(Actuel)")}
                                    </option>
                                ))}
                            </select>
                            {tacticSelected && (
                                <div id="soccerFieldHzModal">
                                    {tacticSelected.slice(1, 12).map((position, index) => (
                                        <div key={index} className="position-soccer-field-modal" style={{ top: (position[1] - 8) + "%", left: position[0] + "%" }}>
                                            <p>{position[2]}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tacticSelected && (
                                <button className="btn btn-primary" onClick={handleChangeTactic2}>
                                    Valider
                                </button>
                            )}
                        </div>
                    </Modal>

                    <Modal
                        show={showQuit}
                        handleClose={hideModalQuit}
                        title="Demande de confirmation"
                    >
                        <div className="quit-modal">
                            <h5>Voulez-vous vraiment quitter le live ?</h5>
                            {modif && (
                                <div className="warning-save">
                                    <p>Attention, vous avez des éléments non sauvegardés</p>
                                    <p>Si vous quitter cette page tous les changements seront perdus</p>
                                </div>
                            )}
                            <div>
                                <button className="btn btn-warning" onClick={handleQuit}>
                                    Quitter
                                </button>
                                <button className="btn btn-primary" onClick={cancelQuit}>
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </Modal>

                    <Modal
                        show={showDelete}
                        handleClose={hideModalDelete}
                        title="Demande de confirmation"
                    >
                        <div className="delete-modal">
                            <h5>Voulez-vous vraiment supprimer le live ?</h5>
                            <p>Vous vous apprétez à détruire définitivement le live en cours</p>
                            <p>Cela aura pour conséquence de réinitialiser complétement le match</p>
                            <p>le lien entre le match et la formation selectionnée lors du pré-live sera annuler</p>
                            <p>Toutes les stats des joueurs ayant été selectionnés seront supprimer</p>
                            <p>Vous serez redirigé vers la page de pré-live</p>
                            <div>
                                {loading9 && (
                                    <div className="LoaderModal">
                                        <Loader type="ThreeDots" width="100" height="80" color="LightGray" />
                                    </div>
                                )}
                                {!loading9 && (
                                    <button className="btn btn-warning" onClick={handleDelete}>
                                        Détruire
                                    </button>
                                )}
                                {!loading9 && (
                                    <button className="btn btn-primary" onClick={cancelDelete}>
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    </Modal>

                </LivePlayersContext.Provider>
                <MyPreviewLive pictures64={pictures64} />
            </DndProvider>
        </div>
    );
}

export default LivePage;