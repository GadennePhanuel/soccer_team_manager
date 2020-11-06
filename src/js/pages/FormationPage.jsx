import React, { useContext, useEffect, useState } from 'react';
import {DndProvider} from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
//import PlayerCard from "../components/formation/PlayerCard";
//import SlotSelection from '../components/formation/SlotSelection';
//import FreePlayersList from "../components/formation/FreePlayersList";
import "../../scss/pages/FormationPage.scss";

import TeamContext from "../contexts/TeamContext";
import {useDrag, useDrop} from "react-dnd";
import tacticAPI from "../services/tacticAPI";

const FormationPage = (props) => {
    //todo corriger maj de tactic qui se purge...
    //

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
    //console.log(tacticsList)

    const tacticTypeList = ["5-3-2", "5-4-1", "3-5-2", "4-4-2-losange", "4-4-2-carré", "4-3-3", "4-5-1"]
  //  console.log("tactList :")
  //  console.log(tacticsList)

    const [tacticSelected, setTacticSelected] = useState()

    const [playersSelected, setPlayersSelected] = useState([])
    // console.log("playerSelected: ")
    // console.log(playersSelected)

    const [playersFree, setPlayersFree] = useState([])
    // console.log("playerFree: ")
    // console.log(playersFree);

    /**
     * Composant PlayerCard pour display et Drag un joueur
     * @param player
     * @param className
     * @param posOrigin
     * @returns {JSX.Element}
     * @constructor
     */
    const PlayerCard = ({player, className, posOrigin}) => {
   //     console.log(player)
        const [{isDragging}, drag] = useDrag({
            item: { type:'playerCard'},
            begin:() => {
                setTimeout(() => {
                    className = 'invisible'
                }, 0);
            },
            end:(item,monitor)=>{
                const dropResult = monitor.getDropResult();
                if(dropResult && dropResult.name != null){
                    let posTarget = dropResult.name;
                    console.log(posTarget)
                //    console.log(tacticSelected[posId].id)
                    if(posOrigin === "free") {

                        tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0];
                        //    console.log(tacticSelected[posId]);
                    }
                    else {
                        if(posTarget !== "free") {
                            console.log(posTarget)
                            console.log(tacticSelected)
                            let switchedPlayer = null
                            if (tacticSelected[posTarget] !== undefined && tacticSelected[posTarget] !== null) {
                                switchedPlayer = players.filter(p => p.id === tacticSelected[posTarget].id)[0]
                            }
                        //  console.log(switchedPlayer)
                            if(player !== null){
                                tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0]
                            }
                            else {tacticSelected[posTarget] = null}
                            tacticSelected[posOrigin] = switchedPlayer
                        }
                        else {tacticSelected[posOrigin] = null;}
                    }
                    setTacticSelected(tacticSelected);
                 //   console.log(tacticSelected)
                    setRefreshKey(oldKey => oldKey + 1)
                }
            },
            collect:(monitor)=>({
                isDragging: monitor.isDragging(),
            }),
        });

       /* const firstName=player.user.firstName;
        const lastName=player.user.lastName;*/

        return (
            <div ref={drag} className={className}>
                {player !== null ? <p>{player.user.firstName} {player.user.lastName}</p>
                    : <p> n/a </p>
                }
            </div>
        )
    }

    /**
     * Composant SlotSelection les zone de drop des joueurs selectionnés
     * @param id
     * @param className
     * @param child
     * @returns {JSX.Element}
     * @constructor
     */
    const SlotSelection = ({id, className, child}) => {
        const [, drop] = useDrop({
            accept: "playerCard",
            drop: () => ({name: id}),
        });

        return (
            <div ref={drop} id={id} className={className}>
                {child}
            </div>
        )
    };

    /**
     * composant FreePlayerList (zone de drop des joueurs non selectionnés)
     * @param id
     * @param className
     * @param children
     * @returns {JSX.Element}
     * @constructor
     */
    const FreePlayersList = ({id, className, children}) => {
        const [, drop] = useDrop({
            accept: "playerCard",
            drop:() => ({name: "free"})
        });

        return (
            <div ref={drop} id={id} className={className}>
                {children}
            </div>
        )
    };

    /**
     * suppression de tacticId
     * @param tacticId
     */
    const deleteTactic = (tacticId) => {
        const originalTacticsList = [...tacticsList];

        //supression de l'affichage du coach selectionné
        setTacticsList(tacticsList.filter((tactic) => tactic.id !== tacticId));

        tacticAPI.deleteTactic(tacticId)
            .then(
                response => console.log("delete tactic success " + tacticId),
                setTacticSelected()
            )
            .catch(error => {
                setTacticsList(originalTacticsList);
            });
    }

    /**
     * Mise a jour et creation de tactic
     * @param tactic
     */
    const saveTactic = (tactic) => {
        if(tactic !== undefined){
            tactic.team = "/api/teams/" + team.id;
            tactic.pos1 !== null && tacticSelected.pos1 !== undefined ? tactic.pos1 = "/api/players/" + tactic.pos1.id : tactic.pos1 = null;
            tactic.pos2 !== null && tacticSelected.pos2 !== undefined ? tactic.pos2 = "/api/players/" + tactic.pos2.id : tactic.pos2 = null;
            tactic.pos3 !== null && tacticSelected.pos3 !== undefined ? tactic.pos3 = "/api/players/" + tactic.pos3.id : tactic.pos3 = null;
            tactic.pos4 !== null && tacticSelected.pos4 !== undefined ? tactic.pos4 = "/api/players/" + tactic.pos4.id : tactic.pos4 = null;
            tactic.pos5 !== null && tacticSelected.pos5 !== undefined ? tactic.pos5 = "/api/players/" + tactic.pos5.id : tactic.pos5 = null;
            tactic.pos6 !== null && tacticSelected.pos6 !== undefined ? tactic.pos6 = "/api/players/" + tactic.pos6.id : tactic.pos6 = null;
            tactic.pos7 !== null && tacticSelected.pos7 !== undefined ? tactic.pos7 = "/api/players/" + tactic.pos7.id : tactic.pos7 = null;
            tactic.pos8 !== null && tacticSelected.pos8 !== undefined ? tactic.pos8 = "/api/players/" + tactic.pos8.id : tactic.pos8 = null;
            tactic.pos9 !== null && tacticSelected.pos9 !== undefined ? tactic.pos9 = "/api/players/" + tactic.pos9.id : tactic.pos9 = null;
            tactic.pos10 !== null && tacticSelected.pos10 !== undefined ? tactic.pos10 = "/api/players/" + tactic.pos10.id : tactic.pos10 = null;
            tactic.pos11 !== null && tacticSelected.pos11 !== undefined ? tactic.pos11 = "/api/players/" + tactic.pos11.id : tactic.pos11 = null;
            console.log("save :" )
            console.log(tactic)

            if(tactic.id !== undefined) {
                tacticAPI.putTactic(tactic.id, tactic.team,tactic.type,tactic.pos1,tactic.pos2,tactic.pos3,tactic.pos4, tactic.pos5, tactic.pos6, tactic.pos7,tactic.pos8,tactic.pos9,tactic.pos10,tactic.pos11,)
                    .then(response => {
                        console.log("MaJ tactic success " + tactic.id)
                        setRefreshKey2(refreshKey2+1)
                    })
                    .catch(error => console.log(error.response))
            }
            else {
                tacticAPI.postTactic(
                    tactic.team,tactic.type,tactic.pos1,tactic.pos2,tactic.pos3,tactic.pos4, tactic.pos5, tactic.pos6, tactic.pos7,tactic.pos8,tactic.pos9,tactic.pos10,tactic.pos11,
                )
                    .then(response => {
                            tacticsList.push(response.data)
                            setTacticsList(tacticsList)
                            setTacticSelected(response.data)
                            setRefreshKey(refreshKey + 1)
                        }
                    )
                    .catch(error => console.log(error.response))
            }
        }
    }

    /* //todo rendre dynamique le placement des fieldpos fonction de la tactic selectionnée
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
        let value = event.currentTarget.value;
        value = value.split('/');
        switch (value[0]){
            case "load":setTacticSelected(tacticsList[value[1]]);
            break;
            case "new":
                let newTactic = {}
                newTactic.type = value[1];
                newTactic.pos1 = null;
                newTactic.pos2 = null;
                newTactic.pos3 = null;
                newTactic.pos4 = null;
                newTactic.pos5 = null;
                newTactic.pos6 = null;
                newTactic.pos7 = null;
                newTactic.pos8 = null;
                newTactic.pos9 = null;
                newTactic.pos10 = null;
                newTactic.pos11 = null;
                setTacticSelected(newTactic);
            break;
        }

    }

    const [refreshKey, setRefreshKey] = useState([0])
    const [refreshKey2, setRefreshKey2] = useState([0])
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
    }, [refreshKey2, currentTeamId])

    /**
     * chargement du tableau des joueur selectionnés soumis à la sellection d'une tactique
     */
    useEffect(() => {
        let tab = [];
        console.log("useEffect PlayerSelected :")
        console.log(tacticSelected)
        if(tacticSelected !== undefined && tacticSelected !== null) {
            tacticSelected.pos1 !== null && tacticSelected.pos1 !== undefined ? tab.push(players.filter(player => tacticSelected.pos1.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos2 !== null && tacticSelected.pos2 !== undefined ? tab.push(players.filter(player => tacticSelected.pos2.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos3 !== null && tacticSelected.pos3 !== undefined ? tab.push(players.filter(player => tacticSelected.pos3.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos4 !== null && tacticSelected.pos4 !== undefined ? tab.push(players.filter(player => tacticSelected.pos4.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos5 !== null && tacticSelected.pos5 !== undefined ? tab.push(players.filter(player => tacticSelected.pos5.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos6 !== null && tacticSelected.pos6 !== undefined ? tab.push(players.filter(player => tacticSelected.pos6.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos7 !== null && tacticSelected.pos7 !== undefined ? tab.push(players.filter(player => tacticSelected.pos7.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos8 !== null && tacticSelected.pos8 !== undefined ? tab.push(players.filter(player => tacticSelected.pos8.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos9 !== null && tacticSelected.pos9 !== undefined ? tab.push(players.filter(player => tacticSelected.pos9.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos10 !== null && tacticSelected.pos10 !== undefined ? tab.push(players.filter(player => tacticSelected.pos10.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos11 !== null && tacticSelected.pos11 !== undefined ? tab.push(players.filter(player => tacticSelected.pos11.id === player.id)[0]) : tab.push(null)


        }
   //     else { tab = [null,null,null,null,null,null,null,null,null,null,null]}
        setPlayersSelected(tab);
    }, [refreshKey, tacticSelected])

    /**
     * chargement du tableau des joueur libres soumis à la modification du tableau de joueurs selectionnés
     */
    useEffect (() => {
        let tab = players;
        console.log("playerSelected: ");
        console.log(playersSelected);
        {playersSelected.map(playerS =>(
            playerS !== null && playerS !== undefined ?
                tab = tab.filter(player => player.id !== playerS.id)
                : tab
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
                <DndProvider options={HTML5toTouch}>
                    <div className="flexBox">
                        <div id="tacticBox">
                            {/*<h3>{tacticSelected.type}</h3>*/}
                            {/*<select name="newTacticChoice" id="">
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
                            </select>*/}
                            <label htmlFor="tacticSelect">Selectionner une tactique :</label>
                            <select name="tactic" id="tacticSelect" onChange={handleChange}>
                                <option value=""> make a choice </option>
                                <optgroup label="Création :">
                                    {tacticTypeList.map((tacticType, index) => (
                                            <option key={index} value={"new/"+tacticType}>{tacticType}</option>
                                        )
                                    )}
                                </optgroup>
                                <optgroup label="Existantes :">
                                    {tacticsList.map((tactic, index) => (
                                        <option key={tactic.id} value={"load/"+index}>{tactic.id + " / " +tactic.type}</option>
                                    ))}
                                </optgroup>
                            </select>

                            <button id="save" onClick={() =>saveTactic(tacticSelected)}>Save</button>
                            <button id="delete" onClick={() =>deleteTactic(tacticSelected.id)}>delete</button>

                            <div id="soccerField">
                                {playersSelected &&
                                    playersSelected.map((player, index) => (
                                        <SlotSelection
                                            key={index}
                                            id={"pos"+(index+1)}
                                            className="fieldPos"
                                            child={
                                                <PlayerCard
                                                player={player !== undefined ? player : null}
                                                posOrigin={"pos"+(index+1)}
                                                />}
                                        />
                                        /*<SlotSelection key={index} id={"pos"+index+"Id"} className="fieldPos">
                                            {playersSelected[index] && <PlayerCard player={player}/>}
                                        </SlotSelection> */
                                    ))
                                }
                            </div>
                        </div>
                        <FreePlayersList id="playersList" className="playerList" >
                            {tacticSelected === null ?
                                <p> Veuillez selectionner une tactique</p>
                                : (playersFree.length === 0) &&
                                    <p> Il n'y a pas de joueur disponible </p>
                            }
                            {(players.length < 11) &&
                                <p>Une équipe doit possèder 11 joueurs minimum.</p>
                            }
                            {playersFree.map(playerFree => (
                                <PlayerCard key={playerFree.id} player={playerFree} className="playerCard" posOrigin={null}/>
                                ))
                            }
                        </FreePlayersList>
                    </div>
                </DndProvider>
            </div>
    )
}

export default FormationPage;