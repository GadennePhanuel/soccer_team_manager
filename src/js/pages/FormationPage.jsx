import React, { useContext, useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import PlayerCard from "../components/formation/PlayerCard";
import FieldPosition from "../components/formation/FieldPosition";
import "../../scss/pages/FormationPage.scss";

import { useDrag } from 'react-dnd';
import TeamContext from "../contexts/TeamContext";
import teamAPI from "../services/teamAPI";
import {DndProvider} from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";

const FormationPage = (props) => {
    {/*
        //todo recup players de l'equipe
        //todo recup selected Tactic
        //todo filtrer players identifié dans selectedTactics
            //creer une cardPlayer avec className="posted" et les placer dans les poste correspondant
        //todo filtrer player sans poste,
            //creer une cardPlayer et les passer dans playerList
        //composant necessaire:
            //todo composant poste className="poste" id="pos{Num]id (like bdd)
            //todo const unpostedListe
            //todo const selectedTactic
    */}
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
    //console.log(team)
    const [players, setPlayers] = useState([])

    //console.log(players)
    const [tacticsList, setTacticsList] = useState([])
 //   console.log(tacticsList)
/*

    const [slot0, setSlot0] = useState(null);
    const [slot1, setSlot1] = useState(null);
    const [slot2, setSlot2] = useState(null);
    const [slot3, setSlot3] = useState(null);
    const [slot4, setSlot4] = useState(null);
    const [slot5, setSlot5] = useState(null);
    const [slot6, setSlot6] = useState(null);
    const [slot7, setSlot7] = useState(null);
    const [slot8, setSlot8] = useState(null);
    const [slot9, setSlot9] = useState(null);
    const [slot10, setSlot10] = useState(null);*/

    /*const [tactic, setTactic] = useState();*/
    const [elementDrag, setElementDrag] = useState()

    const initDraggable = () => {
        setElementDrag(document.querySelector('.base'));
    }

    const tacticTypeList = ["5-3-2", "5-4-1", "3-5-2", "4-4-2-losange", "4-4-2-carré", "4-3-3", "4-5-1"]
    const [tacticSelected, setTacticSelected] = useState()

    const [playersSelected, setPlayersSelected] = useState([])
    // console.log("playerSelected: ")
    // console.log(playersSelected)

    const [playersFree, setPlayersFree] = useState([])
    // console.log("playerFree: ")
    // console.log(playersFree);

    /* //todo rendre dinamyque le placement des fieldpos fonction de la tactic selectionnée
    const positions = {
        pos0 : [230,422],
        pos1 : [60,250],
        pos2 : [130,310],
        pos3 : [230,325],
        pos4 : [330,310],
        pos5 : [400,250],
        pos6 : [110,150],
        pos7 : [230,187],
        pos8 : [352,150],
        pos9 : [150,50],
        pos10 : [310,50]
    }*/

    const handleChange = (event) => {
        const value = event.currentTarget.value;
        setTacticSelected(tacticsList[value]);
    }

    /**
    * ajax recup des l'equipe selectionnée, et des tactics de cette equipe
    */
    useEffect(() => {
        initDraggable();
        if (currentTeamId !== '') {
            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data)
                    setPlayers(response.data.players)
                })
                .catch(error => console.log(error.response))
            teamAPI.findAllTacticsByTeam(currentTeamId)
                .then(response => { setTacticsList(response)})
                .catch(error => console.log(error.response))
        }
        // const box = document.querySelectorAll('.case');
    }, [currentTeamId])

    /**
     * chargement du tableau des joueur selectionnés soumis à la sellection d'une tactique
     */
    useEffect(() => {
        if(tacticSelected !== undefined) {
            let tab = [];
            tab.push(players.filter(player => tacticSelected.pos1.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos2.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos3.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos4.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos5.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos6.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos7.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos8.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos9.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos10.id === player.id)[0])
            tab.push(players.filter(player => tacticSelected.pos11.id === player.id)[0])

            setPlayersSelected(tab);
        }
    }, [tacticSelected])

    /**
     * chargement du tableau des joueur libres soumis à la modification du tableau de joueurs selectionnés
     */
    useEffect (() => {
        let tab = players;
        //console.log("playerSelected: ");
        //console.log(playersSelected);
        {playersSelected.map(playerS =>(
            tab = tab.filter(player => player.id !== playerS.id)
            )
        )}
        //console.log("tab: ");
        //console.log(tab);
        setPlayersFree(tab)
    }, [playersSelected])

    const dragStart = (event) => {
        // console.log("start");
        let target = event.currentTarget;
        setElementDrag(target);
        target.className += ' taken';
        setTimeout(() => {
            target.className = 'invisible'
        }, 0);
    }

    const touchStart = (event) => {
        let target = event.currentTarget;
        target.className += ' taken';
    }

    const dragEnd = (event) => {
        // console.log("end");
        //let target = event.currentTarget;
        event.currentTarget.className = 'playerCard';
    }

    const dragOver = (event) => {
        event.preventDefault();
    //    console.log("over");
    }

    const dragEnter = (event) => {
        event.preventDefault();
        event.currentTarget.className = "hovered"
    //    console.log("enter");
    }

    const dragLeave = (event) => {
        event.currentTarget.className = "fieldPos"
    //    console.log("leave");
    }

    const dragDrop = (event) => {
        let target = event.currentTarget;
        target.className = "playerCardSloted";
        switch (target.id) {
            case "pos1Id": setTacticSelected({...tacticSelected, pos1Id: elementDrag.id}); break;
            case "pos2Id": setTacticSelected({...tacticSelected, pos2Id: elementDrag.id}); break;
            case "pos3Id": setTacticSelected({...tacticSelected, pos3Id: elementDrag.id}); break;
            case "pos4Id": setTacticSelected({...tacticSelected, pos4Id: elementDrag.id}); break;
            case "pos5Id": setTacticSelected({...tacticSelected, pos5Id: elementDrag.id}); break;
            case "pos6Id": setTacticSelected({...tacticSelected, pos6Id: elementDrag.id}); break;
            case "pos7Id": setTacticSelected({...tacticSelected, pos7Id: elementDrag.id}); break;
            case "pos8Id": setTacticSelected({...tacticSelected, pos8Id: elementDrag.id}); break;
            case "pos9Id": setTacticSelected({...tacticSelected, pos9Id: elementDrag.id}); break;
            case "pos10Id": setTacticSelected({...tacticSelected, pos10Id: elementDrag.id}); break;
            case  "pos11Id":  setTacticSelected({...tacticSelected, pos11Id: elementDrag.id}); break;
        }

        if(target.child !== undefined){
  //          console.log(target.child)
            document.getElementById('playersList').prepend(target.child);
        }
        target.append(elementDrag);
    }

 //   console.log(tacticSelected);

    return (
        <DndProvider options={HTML5toTouch}>
            <div className="FormationPage wrapper_container">
                <div className="flexBox">
                    <h1>Formation Tactique</h1>
                    <h2>
                        {currentTeamId === "" ? "Pas d'équipe à charge" : team.label + ' ' + team.category}
                    </h2>
                </div>
                <div className="flexBox">
                    <div id="tacticBox">
                        {/*<h3>{tacticSelected.type}</h3>*/}
                        <select name="newTacticChoice" id="">
                            <option value=""> créer une tactique </option>
                            {tacticTypeList.map((tacticType, index) => (
                                    <option key={index} value={tacticType}>{tacticType}</option>
                                )
                            )}
                        </select>
                        <select name="tactic" id="" onChange={handleChange}>
                            <option value=""> tactiques existante </option>
                            {tacticsList.map((tactic, index) => (
                                <option key={tactic.id} value={index}>{tactic.type}</option>
                            ))}
                        </select>
                        <div id="soccerField">
                            {playersSelected &&
                                playersSelected.map((player, index) => (
                                    <div key={player.id} id={"pos"+index+"Id"} className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop}>
                                        <PlayerCard player = {player}/>
                                    </div>
                                ))
                            }
                                {/*<div id="pos2Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos3Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos4Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos5Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos6Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos7Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos8Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos9Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos10Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>
                                <div id="pos11Id" className="fieldPos" onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={dragDrop} > </div>*/}
                        </div>
                        {/*<TacticField tactic={tacticSelected} />*/}
                        {/*<div id="soccerField">

                            //todo faire les composant fieldPosition avec un placement relatif dynamique

                        </div>*/}
                    </div>
                    <div id="playersList">
                        {(playersFree.length === 0) &&
                            <p> Il n'y a plus de joueur disponible </p>
                        }
                        {(players.length < 11) &&
                            <p>Une équipe doit possèder 11 joueurs minimum.</p>
                        }
                        {playersFree.map(playerFree => (
                            <PlayerCard key={playerFree.id} player={playerFree}/>
                            /*<div className="playerCard" key={player.id} id={player.id} draggable={true} onDragStart={dragStart} onDragEnd={dragEnd} onTouchMove={touchStart}>
                                <p>{player.user.firstName} <br/>{ player.user.lastName}</p>
                            </div>*/
                            ))
                        }
                        {/*{if(currentTeamId !== '') {
                        if(players !== null && players.length > 0) {
                            if(players.length < 11) {
                                <p>Une équipe doit possèder 11 joueurs minimum.</p>
                            }

                            {players.map(player => (
                                <div key={player.id} draggable={true}>
                                <p>{player.user.firstName + " " + player.user.lastName}</p>
                                </div>
                                ))
                            }
                        }
                        else {
                            <p>L'équipe selectionné ne dispose pas de joueurs.</p>
                        }
                    }
                    else  {
                        <p>Veuillez selectionner une équipe.</p>
                    }}*/}
                    </div>
                </div>
            </div>
        </DndProvider>
    )
}

export default FormationPage;