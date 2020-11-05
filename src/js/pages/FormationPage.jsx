import React, { useContext, useEffect, useState } from 'react';
import {DndProvider} from "react-dnd";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import {HTML5Backend} from "react-dnd-html5-backend";
import {TouchBackend} from "react-dnd-touch-backend";
import MultiBackend, { TouchTransition } from "react-dnd-multi-backend";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
import PlayerCard from "../components/formation/PlayerCard";
import SlotSelection from '../components/formation/SlotSelection';
import "../../scss/pages/FormationPage.scss";

import TeamContext from "../contexts/TeamContext";

/*
const HTML5toTouch = {
    backends: [
        {
            backend: HTML5Backend
        },
        {
            backend: TouchBackend({enableMouseEvents: true}), // Note that you can call your backends with options
            preview: true,
            transition: TouchTransition
        }
    ]
};
*/

const FormationPage = (props) => {
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
    }, [players, tacticSelected])

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

    return (
            <div className="FormationPage wrapper_container">
                <div className="flexBox">
                    <h1>Formation Tactique</h1>
                    <h2>
                        {currentTeamId === "" ? "Pas d'équipe à charge" : team.label + ' ' + team.category}
                    </h2>
                </div>
                <DndProvider backend={MultiBackend} options={HTML5toTouch}>
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
                                        <SlotSelection key={index} id={"pos"+index+"Id"} className="fieldPos" child={<PlayerCard player={player}/>} />
                                    ))
                                }
                            </div>
                        </div>
                        <div id="playersList">
                            {(playersFree.length === 0) &&
                                <p> Il n'y a plus de joueur disponible </p>
                            }
                            {(players.length < 11) &&
                                <p>Une équipe doit possèder 11 joueurs minimum.</p>
                            }
                            {playersFree.map(playerFree => (
                                <PlayerCard key={playerFree.id} player={playerFree} className="playerCard" />
                                ))
                            }
                        </div>
                    </div>
                </DndProvider>
            </div>
    )
}

export default FormationPage;