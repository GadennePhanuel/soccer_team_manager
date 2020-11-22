import React, { useContext, useEffect, useState } from 'react';
import MultiBackend, { DndProvider, TouchTransition } from "react-dnd-multi-backend";
//import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import PlayerCard from "../components/formation/PlayerCard";
import SlotSelection from '../components/formation/SlotSelection';
import FreePlayersList from "../components/formation/FreePlayersList";
import "../../scss/pages/FormationPage.scss";

import TeamContext from "../contexts/TeamContext";
import tacticAPI from "../services/tacticAPI";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { usePreview } from 'react-dnd-preview/dist/cjs/usePreview';
import {Link} from "react-router-dom";
import playerAPI from "../services/playerAPI";
import Loader from "react-loader-spinner";
import Modal from "../components/Modal";

const FormationPage = (props) => {

    authAPI.setup();
    // si role != ROLE_ADMIN -> redirection vers le dashboard qui lui correspond
    const role = usersAPI.checkRole();
    if (role === 'ROLE_ADMIN') {
        props.history.replace("/dashboardAdmin")
    } else if (role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }

    const { currentTeamId } = useContext(TeamContext)
    const [team, setTeam] = useState({})
    const [players, setPlayers] = useState([])
    const [pictures64, setPictures64] = useState([])

    const [tacticsList, setTacticsList] = useState([])
    const [tacticModifiedList, setTacticModifiedList] = useState([])
    const [tacticSelected, setTacticSelected] = useState()

    const tacticTypeList = [
        [ "5-3-2", [50,90,"gardien"], [15,60,"Arrière gauche"], [28,73,"Defense gauche"], [50,76,"Defense centre"], [72,73, "Defense droit"], [85,60, "Arrière droit"], [25,42,"Milieu gauche"], [50,50,"Milieu central"], [75,42,"Milieu droit"], [27,20,"Avant gauche"], [73,20,"Avant droit"]],
        [ "5-4-1", [50,90,"gardien"], [15,60,"Arrière gauche"], [28,73,"Defense gauche"], [50,76,"Defense centre"], [72,73, "Defense droit"], [85,60, "Arrière droit"], [15,36,"Milieu gauche"], [36,45,"Milieu central"], [64,45,"Milieu central"], [85,36,"Aillier droit"], [50,15,"Avant centre"]],
        [ "3-5-2", [50,90,"gardien"], [22,70,"Defenseur central"], [50,77,"Defense central"], [78,70,"Defense central"], [15,35, "Milieu gauche"], [32,45, "Milieu central"], [50,55,"Milieu central"], [68,45,"Milieu central"], [85,35,"Milieu droit"], [28,20,"Avant centre"], [72,20,"Avant centre"]],
        [ "4-4-2-losange", [50,90,"gardien"], [15,65,"Arrière gauche"], [35,75,"Defense centre"], [65,75,"Defense centre"], [85,65, "Arrière droit"], [50,62, "Milieu defensif"], [25,47,"Milieu gauche"], [50,35,"Milieu offensif"], [75,47,"Milieu droit"], [27,20,"Avant gauche"], [73,20,"Avant droit"]],
        [ "4-4-2-carre", [50,90,"gardien"], [15,65,"Arrière gauche"], [35,75,"Defense centre"], [65,75,"Defense centre"], [85,65, "Arrière droit"], [15,40, "Milieu gauche"], [35,53,"Milieu central"], [65,53,"Milieu central"], [85,40,"Milieu droit"], [27,20,"Avant gauche"], [73,20,"Avant droit"]],
        [ "4-3-3", [50,90,"gardien"], [15,65,"Arrière gauche"], [35,75,"Defense centre"], [65,75,"Defense centre"], [85,65, "Arrière droit"], [25,47, "Milieu gauche"], [50,50,"Milieu central"], [75,47,"Milieu droit"], [15,25,"Aillier gauche"], [85,25,"Aillier droit"], [50,15,"Avant centre"]],
        [ "4-5-1", [50,90,"gardien"], [15,68,"Arrière gauche"], [35,75,"Defense centre"], [65,75,"Defense centre"], [85,68, "Arrière droit"], [25,55, "Milieu defensif"], [75,55,"Milieu defensif"], [15,35,"Milieu gauche"], [50,37,"Milieu Offensif"], [85,35,"Milieu droit"], [50,15,"Avant centre"]],
        [ "4-2-3-1", [50,90,"gardien"], [15,72,"Defense gauche"], [38,72,"Defense centre"], [61,72,"Defense centre"], [85,72,"Defense droit"], [38,55,"Milieu, defensif"], [61,55,"Milieu defensif"], [15,35,"Aillier gauche"], [50,35,"Aillier centre"], [85,35,"Aillier droit"], [50,15,"Avant centre"]]
    ]

    const [playersSelected, setPlayersSelected] = useState([])

    const [playersFree, setPlayersFree] = useState([])

    const [loadingPlayers, setLoadingPlayers] = useState(false)
    const [loadingTactics, setLoadingTactics] = useState(false)

    const [modalType, setModalType] = useState('')
    const [show, setShow] = useState(false)
    const showModal = (modalType) => {
        setModalType(modalType)
        setShow(true)
    }
    const hideModal = () => {
        setShow(false)
        setModalType('')
    }

    /**
     * suppression de tacticId
     * @param tacticId
     */
    const deleteTactic = (tacticId) => {
        hideModal()
        setLoadingTactics(true)
        const originalTacticsList = [...tacticsList];

        setTacticsList(tacticsList.filter((tactic) => tactic.id !== tacticId));

        tacticAPI.deleteTactic(tacticId)
            .then(response => {
                setTacticSelected()
                setRefreshPlayerSelected(refreshPlayerSelected + 1)
                setLoadingTactics(false)
            })
            .catch(error => {
                setTacticsList(originalTacticsList);
                setLoadingTactics(false)
            });
    }

    /**
     * Mise a jour et creation de tactic
     * @param tactic
     */
    const saveTactic = (tactic) => {
        show && hideModal()
        setLoadingTactics(true)
        if (tactic !== undefined && playersSelected.length > 0) {
            let tacticTab = {type:tactic.type, team:team["@id"]}
            for(let i=1; i<=11; i++){
                let post = "pos"+i;
                if(tactic[post] === null){
                    tacticTab[post] = null
                }
                else if(tacticSelected[post] !== undefined){
                    tacticTab[post] = tactic[post]["@id"]
                }
            }

            if (tactic.id !== "new") {
                tacticAPI.putTactic(tactic.id, tacticTab)
                    .then(response => {
                     //   document.getElementById("save").blur()
                        let newList = tacticsList.filter(oldTact => tactic.id !== oldTact.id)
                        newList.push(tactic)
                        setTacticsList(newList)
                        //etant sauvegarder, on retir la tactic de la liste des tactics modifiées
                        setTacticModifiedList(tacticModifiedList.filter(tacticModified => tactic.id !== tacticModified.id))
                        setLoadingTactics(false)
                    })
                    .catch(error => {
                        console.log(error.response)
                        setLoadingTactics(false)
                    })
            }
            else {
                tacticAPI.postTactic(tacticTab)
                    .then(response => {
                    //    document.getElementById("save").blur();
                        tacticsList.push(response.data)
                        setTacticsList(tacticsList)
                        setTacticSelected(response.data)
                        setLoadingTactics(false)
                    })
                    .catch(error => {
                        console.log(error.response)
                        setLoadingTactics(false)
                    })
            }
        }
    }

    const handleCancel = () => {
      //  purge tableau des tactics modifées
        setLoadingTactics(true)
        let newTab = tacticModifiedList.filter(tactic => tacticSelected.id !== tactic.id)
        if(newTab !== undefined){
            setTacticModifiedList(newTab)
        }
        else {
            setTacticModifiedList([])
        }
        //recupère l'etat initiale dans tacicsList pour le passer à tacticSelected
        setTacticSelected(clone(tacticsList.filter(tactic => tacticSelected.id === tactic.id)[0]));
        setRefreshPlayerSelected(refreshPlayerSelected +1);
        setLoadingTactics(false)
    }

    /**
     * Clonage des objets quand necessaire
     * @param a
     * @returns {any}
     */
    function clone(a) {
        return JSON.parse(JSON.stringify(a));
    }

    const handleChange = (event) => {
        let value = event.currentTarget.value;
        value = value.split('/');
        switch (value[0]) {
            case "load":
                let modifiedTactic = tacticModifiedList.filter(tactic => Number(value[1]) === tactic.id)[0]
                if(modifiedTactic !== undefined){
                    setTacticSelected(clone(modifiedTactic))
                }else {
                    setTacticSelected(clone(tacticsList.filter(tactic => Number(value[1]) === tactic.id)[0]));
                }
                break;
            case "new":
                //retrait de la derniere tactic new
                if(tacticModifiedList && tacticModifiedList.length >0){
                    let tabModifiedList = tacticModifiedList.filter(tactic => tactic.id !== "new")
                    setTacticModifiedList(tabModifiedList)
                }

                let newTactic = {}
                newTactic.id ="new"
                newTactic.type = value[1];
                for(let i=1; i<=11; i++){
                    let post = "pos"+i;
                    newTactic[post] = null;
                }
                setTacticSelected(newTactic);
                break;
            default:
        }
        setRefreshPlayerSelected(refreshPlayerSelected +1);
    }

    const [refreshPlayerSelected, setRefreshPlayerSelected] = useState([0])




    /**
    * ajax recup de l'equipe selectionnée, et des tactiques de cette equipe
    */
    useEffect(() => {
        setLoadingPlayers(true)
        setLoadingTactics(true)

        setPictures64([])
        if (currentTeamId !== '') {
            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data)
                    setPlayers(response.data.players)
                    response.data.players.forEach(player => {
                        if (player.picture) {
                            playerAPI.fetchProfilePicture(player.picture)
                                .then(response => {
                                    setPictures64(pictures64 => [...pictures64, { [player.id]: response.data.data }])
                                })
                        }
                    })
                    setLoadingPlayers(false)
                })
                .catch(error => console.log(error.response))

            teamAPI.findAllTacticsByTeam(currentTeamId)
                .then(response => {
                    setTacticsList(response)
                    setLoadingTactics(false)
                    setTacticSelected()
                    document.getElementById("selectInit").setAttribute("selected", "selected")

                })
                .catch(error => console.log(error.response))
        }
    }, [currentTeamId])

    /**
     * chargement du tableau des joueurs selectionnés soumis à la selection d'une tactique
     */
    useEffect(() => {
        let tabSelection = [];
        if (tacticSelected !== undefined && tacticSelected !== null) {

            for(let i=1; i<=11; i++){
                let post = "pos"+i;

                if(tacticSelected[post] !== null && tacticSelected[post] !== undefined){
                    let thePlayer = players.filter(player => tacticSelected[post].id === player.id)[0]
                    tabSelection.push(thePlayer)
                }
                else {tabSelection.push(null)}
            }
        }
        
        setPlayersSelected(tabSelection);
    }, [refreshPlayerSelected])

    /**
     * chargement du tableau des joueurs libres soumis à la modification du tableau de joueurs selectionnés
     */
    useEffect(() => {
        let tabFreePlayer = players;
        playersSelected.map(playerS => (
                playerS !== null && playerS !== undefined ?
                    tabFreePlayer = tabFreePlayer.filter(player => player.id !== playerS.id)
                    : tabFreePlayer
            ))

        setPlayersFree(tabFreePlayer)
    }, [players, playersSelected])

    /**
     * element a afficher lors d'un drag
     * @returns {JSX.Element|null}
     * @constructor
     */
    const MyPreview = () => {
        const { display, item, style } = usePreview();
        if (!display) {
            return null;
        }
        if (item.player) {
            return <div className="playerCardDragged" style={style}>
                    <p className="nameCard">{item.player.user.firstName +" "+ item.player.user.lastName}</p>

            </div>;
        } else {
            return <div className="playerCardDragged" style={style}>
                    <p className="noNameCard">Non Assigné</p>
            </div>;
        }
    };

    const HTML5toTouch = {
        backends: [
            {
                backend: HTML5Backend,
               // options : { enableTouchEvents: true}
            },
            {
                backend: TouchBackend,
                options: { enableMouseEvents: true},
                preview: true,
                transition: TouchTransition
            }
        ]
    };


    return (
        <div className="FormationPage wrapper_container">
            <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                <div className="flexBox">
                    <div id="tacticBox">
                        {loadingTactics  &&
                            <Loader type="ThreeDots" width="60" height="40" color="LightGray" />
                        }
                        {!loadingTactics &&
                            <div id="tacticMenu">
                                <select name="tactic" id="tacticSelect" onChange={handleChange}>
                                    <option id="selectInit" value=""> Selectionner une tactique </option>
                                    <optgroup label="Création :">
                                        {tacticTypeList.map((tacticType, index) => (
                                                <option key={index} value={"new/" + tacticType[0]}>{tacticType[0]}</option>
                                            )
                                        )}
                                    </optgroup>
                                    <optgroup label="Existantes :">
                                        {tacticsList.map((tactic, index) => (
                                            tacticModifiedList.filter(tacticModified => tactic.id === tacticModified.id)[0] !== undefined ?
                                                <option key={tactic.id} className="noSaved" value={"load/" + tactic.id}> {tactic.id + " / " + tactic.type + " no saved"}</option>
                                                :   <option key={tactic.id} id={"optionLoad" + tactic.id} value={"load/" + tactic.id} > {tactic.id + " / " + tactic.type}</option>
                                        ))}
                                    </optgroup>
                                </select>

                                {tacticSelected &&
                                    tacticModifiedList.filter(tactic => tacticSelected.id === tactic.id)[0] !== undefined &&
                                        <button
                                            className="tacticmenu"
                                            id="save"
                                            onClick={() => {
                                                    playersSelected.filter(p => p !== null).length < 11 ?
                                                        showModal("save")
                                                    : saveTactic(tacticSelected)}}
                                        >
                                            Save
                                        </button>
                                }

                                {tacticSelected && tacticSelected.id !== "new" &&
                                    tacticModifiedList.filter(tactic => tacticSelected.id === tactic.id)[0] !== undefined &&
                                        <button className="tacticmenu" id="cancel" onClick={() => handleCancel()}
                                        >
                                            Annuler
                                        </button>
                                }
                                {tacticSelected &&
                                    tacticsList.filter(tactic => tacticSelected.id === tactic.id)[0] !== undefined &&
                                        <button className="tacticmenu" id="delete"
                                                onClick={() => showModal("delete")}
                                        >
                                            delete
                                        </button>
                                }
                            </div>
                        }

                        <div id="soccerField">
                            {tacticSelected && playersSelected &&
                                playersSelected.map((player, index) => (
                                    <SlotSelection
                                        key={index}
                                        id={"pos" + (index + 1)}
                                        num = {index+1}
                                        tactic = {tacticTypeList.filter((tactic) => tactic[0] === tacticSelected.type)[0]}
                                        className="fieldPos"
                                        >
                                            <PlayerCard
                                                player={player !== undefined ? player : null}
                                                posOrigin={"pos" + (index + 1)}
                                                className="playerCardSloted"

                                                tactic ={tacticSelected}
                                                setTactic = {setTacticSelected}
                                                tacticsModified = {tacticModifiedList}
                                                setTacticsModified = {setTacticModifiedList}

                                                refreshSelection = {refreshPlayerSelected}
                                                setRefreshSelection = {setRefreshPlayerSelected}

                                                playersList = {players}

                                                picture = {player !== null && player.picture ?
                                                        pictures64.filter(pic => pic[player.id] ? pic[player.id] : null )[0]
                                                    : null
                                                }
                                            />
                                    </SlotSelection>
                                ))
                                }
                        </div>
                    </div>
                    <div id="playersBox">
                        {loadingPlayers && (
                            <FreePlayersList id="playersList" className="playerList" >
                                    <Loader type="Grid" height="100%" width="100%" color="LightGray" />
                            </FreePlayersList>
                        )}
                        {(!loadingPlayers &&
                            <FreePlayersList id="playersList" className="playerList" >
                            <p>
                                Il y a {players.length} joueur{players.length>1?"s":""}  dans l'équipe.
                            </p>
                            {(players.length < 11) &&
                                <p>
                                Il faut au moins 11 joueurs pour définir une tactique.
                                <Link to="/players" className="btn btn-link">
                                Ajouter des joueurs à votre équipe.
                                </Link>
                                </p>
                            }

                            {playersFree.map(playerFree => (
                                <PlayerCard
                                    key={playerFree.id}
                                    player={playerFree}
                                    className="playerCard"
                                    posOrigin="free"

                                    tactic ={tacticSelected}
                                    setTactic = {setTacticSelected}
                                    tacticsModified = {tacticModifiedList}
                                    setTacticsModified = {setTacticModifiedList}

                                    refreshSelection = {refreshPlayerSelected}
                                    setRefreshSelection = {setRefreshPlayerSelected}

                                    playersList = {players}

                                    picture = {playerFree.picture ?
                                        pictures64.filter(pic => pic[playerFree.id] ? pic[playerFree.id] : null )[0]
                                        : null
                                    }
                                />
                            ))
                            }
                            </FreePlayersList>
                        )}
                    </div>

                </div>
                <MyPreview />

                <Modal show={show} handleClose={hideModal} title={modalType} >

                    {modalType === "delete" && (
                            <div>
                                <p>Voulez vous vraiment supprimer cette tactique?</p>
                                <button type="button" className="btn btn-danger" onClick={() => deleteTactic(tacticSelected.id)}>
                                    Supprimer
                                </button>
                                <button type="button" className="btn btn-danger" onClick={() => hideModal()}>
                                    Annuler
                                </button>
                            </div>
                        )
                    }

                    {modalType === "save" && (
                        <div>
                            <p>La tactique selectionnée n'est pas complète.
                                Une tactique non complète ne pourra pas être utilisée pour un match.
                            </p>
                            <button type="button" className="btn btn-danger" onClick={() => saveTactic(tacticSelected)}>
                                Sauvegarder quand même
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => hideModal()}>
                                Annuler
                            </button>
                        </div>
                    )}
                </Modal>
            </DndProvider>
        </div>
    )
}

export default FormationPage;