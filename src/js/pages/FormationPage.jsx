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
                //todo gerer slotSelected vers player List
                const dropResult = monitor.getDropResult();
                if(dropResult && dropResult.name != null){
                    let posTarget = dropResult.name;
                 //   console.log(posId)
                //    console.log(tacticSelected[posId].id)
                    if(posOrigin === null) {

                        tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0];
                        //    console.log(tacticSelected[posId]);
                    }
                    else {
                        //todo gérer les cas ou slotSelect correspond à n slotSelection,
                        // dans ce cas faire en sorte d'intervertir les deux cardPlayer
                        let switchedPlayer = players.filter(p => p.id === tacticSelected[posTarget].id)[0]
                     //   console.log(switchedPlayer)
                        tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0]
                        tacticSelected[posOrigin] = switchedPlayer
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

    const FreePlayersList = ({id, className, children}) => {
        const [, drop] = useDrop({
            accept: "playerCard",
            drop:() => ({name: null})
        });

        return (
            <div ref={drop} id={id} className={className}>
                {children}
            </div>
        )
    };

    const saveTactic = (tactic) => {
        if(tactic !== undefined){
            tactic.team = team;
            if(tactic.pos1 !== null) {tactic.pos1 = players.filter(player => player.id === tactic.pos1.id)[0]}
            if(tactic.pos2 !== null ) {tactic.pos2 = players.filter(player => player.id === tactic.pos2.id)[0] }
            if(tactic.pos3 !== null ) {tactic.pos3 = players.filter(player => player.id === tactic.pos3.id)[0] }
            if(tactic.pos4 !== null ) {tactic.pos4 = players.filter(player => player.id === tactic.pos4.id)[0] }
            if(tactic.pos5 !== null ) {tactic.pos5 = players.filter(player => player.id === tactic.pos5.id)[0] }
            if(tactic.pos6 !== null ) {tactic.pos6 = players.filter(player => player.id === tactic.pos6.id)[0] }
            if(tactic.pos7 !== null ) {tactic.pos7 = players.filter(player => player.id === tactic.pos7.id)[0] }
            if(tactic.pos8 !== null ) {tactic.pos8 = players.filter(player => player.id === tactic.pos8.id)[0] }
            if(tactic.pos9 !== null ) {tactic.pos9 = players.filter(player => player.id === tactic.pos9.id)[0] }
            if(tactic.pos10 !== null ) {tactic.pos10 = players.filter(player => player.id === tactic.pos10.id)[0] }
            if(tactic.pos11 !== null ) {tactic.pos11 = players.filter(player => player.id === tactic.pos11.id)[0] }
          //  console.log(tacticSelected)

            /*//todo stoped here
            if(tactic.id !== undefined) {
                tacticAPI.putTactic(tactic)
                    .catch(error => console.log(error.response))
            }
            else {
                tacticAPI.postTactic(tactic)
                    .then(setTacticsList(...tactic))
                    .catch(error => console.log(error.response))
            }*/
        }
       /* if (editTeam.coach !== "") {
            editTeam.coach = "/api/coaches/" + editTeam.coach
        }
        else {
            editTeam.coach = null
        }
        editTeam.club = "/api/clubs/" + clubId
        teamAPI.postTeam(editTeam)
            //.then(data => [...teams, data])
            .then(setRefreshKey(oldKey => oldKey + 1))
            .catch(error => console.log(error.response))*/
    }

    /*function selectPlayer(player, posId){
        //retrait du joueur selectionné des joueurs libres
        setPlayersFree(playersFree.filter(p => p.id !== player.id))
        //changer le player id de la tacticSelect au bon emplacement
    }*/

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
            case "load":setTacticSelected(tacticsList[value[1]]);break;
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
        let tab = [];
        if(tacticSelected !== undefined && tacticSelected !== null) {
            tacticSelected.pos1 !== null ? tab.push(players.filter(player => tacticSelected.pos1.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos2 !== null ? tab.push(players.filter(player => tacticSelected.pos2.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos3 !== null ? tab.push(players.filter(player => tacticSelected.pos3.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos4 !== null ? tab.push(players.filter(player => tacticSelected.pos4.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos5 !== null ? tab.push(players.filter(player => tacticSelected.pos5.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos6 !== null ? tab.push(players.filter(player => tacticSelected.pos6.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos7 !== null ? tab.push(players.filter(player => tacticSelected.pos7.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos8 !== null ? tab.push(players.filter(player => tacticSelected.pos8.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos9 !== null ? tab.push(players.filter(player => tacticSelected.pos9.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos10 !== null ? tab.push(players.filter(player => tacticSelected.pos10.id === player.id)[0]) : tab.push(null)
             tacticSelected.pos11 !== null ? tab.push(players.filter(player => tacticSelected.pos11.id === player.id)[0]) : tab.push(null)


        }
   //     else { tab = [null,null,null,null,null,null,null,null,null,null,null]}
        setPlayersSelected(tab);
    }, [refreshKey, tacticSelected])

    /**
     * chargement du tableau des joueur libres soumis à la modification du tableau de joueurs selectionnés
     */
    useEffect (() => {
        let tab = players;
        //console.log("playerSelected: ");
        //console.log(playersSelected);
        {playersSelected.map(playerS =>(
            playerS !== null ?
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
                                <optgroup label="Existantes :">
                                    {tacticsList.map((tactic, index) => (
                                        <option key={tactic.id} value={"load/"+index}>{tactic.type}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Création :">
                                    {tacticTypeList.map((tacticType, index) => (
                                            <option key={index} value={"new/"+tacticType}>{tacticType}</option>
                                        )
                                    )}
                                </optgroup>
                            </select>

                            <button id="save" onClick={saveTactic(tacticSelected)}>Save</button>

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