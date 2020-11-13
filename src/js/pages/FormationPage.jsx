import React, { useContext, useEffect, useState } from 'react';
import MultiBackend, { DndProvider, TouchTransition } from "react-dnd-multi-backend";
//import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import teamAPI from "../services/teamAPI";
//import PlayerCard from "../components/formation/PlayerCard";
//import SlotSelection from '../components/formation/SlotSelection';
//import FreePlayersList from "../components/formation/FreePlayersList";
import "../../scss/pages/FormationPage.scss";

import TeamContext from "../contexts/TeamContext";
import { useDrag, useDrop } from "react-dnd";
import tacticAPI from "../services/tacticAPI";
import { Preview } from 'react-dnd-preview/dist/cjs/Preview';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { usePreview } from 'react-dnd-preview/dist/cjs/usePreview';
import {Link} from "react-router-dom";
import playerAPI from "../services/playerAPI";

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
    //console.log(team)
    const [players, setPlayers] = useState([])
    const [pictures64, setPictures64] = useState([])
    const [change, setChange] = useState()

    //console.log(players)
    const [tacticsList, setTacticsList] = useState([])
  //  console.log(tacticsList)

    /**
     *
     * @type {(string|(number|string)[])[][]}
     * [
     *  [typeTactic,[x,y,identifiantPost],...]
     *  ...
     *  ]
     *  x et y sont exprimés en pourcentage
     */
    const tacticTypeList = [
        [ "5-3-2", [50,90,"gardien"], [15,60,"Arrière lateral gauche"], [28,73,"Defenseur central gauche"], [50,76,"Defenseur central"], [72,73, "Defenseur central droit"], [85,60, "Arrière lateral droit"], [25,42,"Milieu gauche"], [50,50,"Milieu central"], [75,42,"Milieu droit"], [27,20,"Avant centre gauche"], [73,20,"Avant centre droit"]],
        [ "5-4-1", [50,90,"gardien"], [15,60,"Arrière lateral gauche"], [28,73,"Defenseur central gauche"], [50,76,"Defenseur central"], [72,73, "Defenseur central droit"], [85,60, "Arrière lateral droit"], [15,36,"Milieu gauche"], [36,45,"Milieu central"], [64,45,"Milieu central"], [85,36,"Milier droit"], [50,15,"Avant centre"]],
        [ "3-5-2", [50,90,"gardien"], [22,70,"Defenseur central"], [50,77,"Defenseur central"], [78,70,"Defenseur central"], [15,35, "Milieu gauche"], [32,45, "Milieu central"], [50,55,"Milieu central"], [68,45,"Milieu central"], [85,35,"Milieu droit"], [28,20,"Avant centre"], [72,20,"Avant centre"]],
        [ "4-4-2-losange", [50,90,"gardien"], [15,65,"Arrière lateral gauche"], [35,75,"Defenseur central"], [65,75,"Defenseur central"], [85,65, "Defenseur central droit"], [50,62, "Milieu defensif"], [25,47,"Milieu gauche"], [50,35,"Milieu central"], [75,47,"Milieu droit"], [27,20,"Avant centre gauche"], [73,20,"Avant centre droit"]],
        [ "4-4-2-carre", [50,90,"gardien"], [15,65,"Arrière lateral gauche"], [35,75,"Defenseur central"], [65,75,"Defenseur central"], [85,65, "Defenseur central droit"], [15,40, "Milieu gauche"], [35,53,"Milieu central"], [65,53,"Milieu central"], [85,40,"Milieu droit"], [27,20,"Avant centre gauche"], [73,20,"Avant centre droit"]],
        [ "4-3-3", [50,90,"gardien"], [15,65,"Arrière lateral gauche"], [35,75,"Defenseur central"], [65,75,"Defenseur central"], [85,65, "Defenseur central droit"], [25,47, "Milieu gauche"], [50,50,"Milieu central"], [75,47,"Milieu droit"], [15,25,"Aillier gauche"], [85,25,"Aillier droit"], [50,15,"Avant centre"]],
        [ "4-5-1", [50,90,"gardien"], [15,68,"Arrière lateral gauche"], [35,75,"Defenseur central"], [65,75,"Defenseur central"], [85,68, "Defenseur central droit"], [25,55, "Milieu defensif"], [75,55,"Milieu defensif"], [15,35,"Milieu gauche"], [50,37,"Milieu Offensif"], [85,35,"Milieu droit"], [50,15,"Avant centre"]]
    ]
   //   console.log("tactList :")
   //   console.log(tacticsList)

    const [tacticSelected, setTacticSelected] = useState()
    console.log(tacticSelected)

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
    const PlayerCard = ({ player, className, posOrigin }) => {
        //     console.log(player)
        const [, drag] = useDrag({
            item: { type: 'playerCard', player },
            /*dragPreview: {

            },
            previewOptions:{
                preview:<MyPreview/>
            },*/
            end: (item, monitor) => {
                const dropResult = monitor.getDropResult();
                if (dropResult && dropResult.name != null) {
                    let posTarget = dropResult.name;
   //                 console.log(posTarget)
                    //    console.log(tacticSelected[posId].id)
                    if(tacticSelected) { //si une tactic est selectionné
                        if (posOrigin === "free") { // si le drag vient d'un player libre

                            tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0];
                            //    console.log(tacticSelected[posId]);
                        } else { // sinon si le drag vient d'un player dans une tactic
                            if (posTarget !== "free") { // si il est drag vers un autre poste tactique
                                //                        console.log(posTarget)
                                //                       console.log(tacticSelected)
                                let switchedPlayer = null // var de transition entre les deux postes de tactique
                                if (tacticSelected[posTarget] !== undefined && tacticSelected[posTarget] !== null) {
                                    //si la case tactique drop n'est pas vide, on stocke le player dans var transition
                                    switchedPlayer = players.filter(p => p.id === tacticSelected[posTarget].id)[0]
                                }
                                //  console.log(switchedPlayer)
                                if (player !== null) { //si la case drag contient bien un player
                                    tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0]
                                } else { // sinon on place null dans la case drop
                                    tacticSelected[posTarget] = null
                                }
                                // on place la case switché dans la case d'origine
                                tacticSelected[posOrigin] = switchedPlayer
                            } else { // si il est drag vers liste FreePlayer, on libere la case d'origine
                                tacticSelected[posOrigin] = null;
                            }
                        }
                        //retenue de la modification de la tactique selectionnée
                        setTacticSelected(tacticSelected);
                        //   console.log(tacticSelected)
                        //refresh de la liste PlayerSelected qui utilise lle contenu de la tacticSelectionnée
                        setRefreshPlayerSelected(refreshPlayerSelected + 1)
                    }
                }
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        return (
            //dragPreview ici ?
            <div ref={drag} className={className}>
                {player !== null ?
                    <div>
                        <p className="nameCard">{player.user.firstName} {player.user.lastName}</p>
                        {player.picture ?
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
                            : <div className="user-picture"></div>
                        }
                    </div>
                    : <div className="playerCardSloted emptyCard"> Non Assigné </div>
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
    const SlotSelection = ({ id, num, tactic, className, children }) => {
        const [, drop] = useDrop({
            accept: "playerCard",
            drop: () => ({ name: id }),
        });

        const fieldWitdh = 512;
        const fieldHeight = 685;

        const slotWidth = 75;
        const slotHeight = 75;

        //todo
        //travailler en %
        //gérer decalage sur Y eventuel due position relative
        //gerer dimenssion dynamique des slots.
        //large slot 75px, large terrain 512
        // x = pourcentage de position - la moitié de la largeur de slot convertit en pourcent
        const x = tactic[num][0] - (slotWidth*100/fieldWitdh/2)
        // y = pourcentage de position - la moitié de la largeur de slot convertit en pourcent avec gestion decalage relatif
        const y = tactic[num][1] - (num-1)*(slotHeight*100/fieldHeight) - (slotHeight*100/fieldHeight/2)

        return (
            <div ref={drop} id={id} className={className} style={{top:y+"%", left:x+"%", width:slotWidth, height:slotHeight}} >
                <abbr title={tactic[num][2]}>
                    {children}
                </abbr>
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
    const FreePlayersList = ({ id, className, children }) => {
        const [, drop] = useDrop({
            accept: "playerCard",
            drop: () => ({ name: "free" })
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
        console.log("save :")
        console.log(playersSelected)
        if (tactic !== undefined && playersSelected.length > 0) {
            tactic.team = "/api/teams/" + team.id;
            for(let i=1; i<=11; i++){
                let post = "pos"+i;
                tactic[post] !== null && tacticSelected[post] !== undefined ?
                    tactic[post] = "/api/players/" + tactic[post].id
                : tactic[post] = null;
            }

            if (tactic.id !== undefined) {
                tacticAPI.putTactic(tactic.id, tactic.team, tactic.type, tactic.pos1, tactic.pos2, tactic.pos3, tactic.pos4, tactic.pos5, tactic.pos6, tactic.pos7, tactic.pos8, tactic.pos9, tactic.pos10, tactic.pos11,)
                    .then(response => {
                        console.log("MaJ tactic success " + tactic.id)
                       // setRefreshTeam(refreshTeam + 1)
                    })
                    .catch(error => console.log(error.response))
            }
            else {
                tacticAPI.postTactic(
                    tactic.team, tactic.type, tactic.pos1, tactic.pos2, tactic.pos3, tactic.pos4, tactic.pos5, tactic.pos6, tactic.pos7, tactic.pos8, tactic.pos9, tactic.pos10, tactic.pos11,
                )
                    .then(response => {
                        tacticsList.push(response.data)
                        setTacticsList(tacticsList)
                        setTacticSelected(response.data)
                        setRefreshTeam(refreshTeam + 1)
                       // setRefreshPlayerSelected(refreshPlayerSelected + 1)
                    }
                    )
                    .catch(error => console.log(error.response))
            }
        }
        document.getElementById("save").blur();
    }

    const handleChange = (event) => {
        let value = event.currentTarget.value;
        value = value.split('/');
        switch (value[0]) {
            case "load":
                console.log("select handleChange load")
                setTacticSelected(tacticsList[value[1]]);
                break;
            case "new":
                console.log("select handleChange new")
                let newTactic = {}
                newTactic.type = value[1];
                for(let i=1; i<=11; i++){
                    let post = "pos"+i;
                    newTactic[post] = null;
                }
                setTacticSelected(newTactic);
                break;
        }
        setRefreshPlayerSelected(refreshPlayerSelected +1);
    }

    /*function purgeUnteamed(){ //todo
        tacticsList.map(tactic => (
            if(players.filter(player => player.id === tactic.pos1.id) === null) { tactic.pos1 = null }
        ))
    }*/

    const [refreshPlayerSelected, setRefreshPlayerSelected] = useState([0])
    const [refreshTeam, setRefreshTeam] = useState([0])
    /**
    * ajax recup de l'equipe selectionnée, et des tactiques de cette equipe
    */
    useEffect(() => {
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
                })
                .catch(error => console.log(error.response))
            teamAPI.findAllTacticsByTeam(currentTeamId)
                .then(response => {
                        setTacticsList(response)
                })
                .catch(error => console.log(error.response))
        }
    }, [refreshTeam, currentTeamId])

    /**
     * chargement du tableau des joueurs selectionnés soumis à la selection d'une tactique
     */
    useEffect(() => {
        console.log("test1");
        console.log("tacticSelected")
        console.log(tacticSelected)
        console.log("players")
        console.log(players)
        setChange(false);
        let tabSelection = [];
 //       console.log("useEffect PlayerSelected :")
 //       console.log(tacticSelected)
        if (tacticSelected !== undefined && tacticSelected !== null) {
//todo
            for(let i=1; i<=11; i++){
                let post = "pos"+i;
                if(tacticSelected[post] !== null && tacticSelected[post] !== undefined){
                    let thePlayer = players.filter(player => tacticSelected[post].id === player.id)[0]
                    console.log(thePlayer);
                    //todo problème undefined but why? ou tacticSelected? 
                    if(thePlayer === null || thePlayer === undefined){
                        tacticSelected[post] = null;
                        setChange(true);
                        tabSelection.push(null)
                        console.log("B"+i);
                    }
                    else {
                        console.log("A"+i);
                        tabSelection.push(thePlayer)
                    }
                }
                else {tabSelection.push(null)}
            }
        }
        setPlayersSelected(tabSelection);
    }, [refreshPlayerSelected])

    /**
     * useEffect appelé pour corrigé en bdd, une tactic dont un des joueurs postés, n'est plus dans l'équipe.
     */
    useEffect(() =>{
        console.log("test2");
        if(change === true ){
            saveTactic(tacticSelected)
            setChange(false)
        }
    },[change])

    /**
     * chargement du tableau des joueurs libres soumis à la modification du tableau de joueurs selectionnés
     */
    useEffect(() => {
        let tab = players;
       // console.log("playerSelected: ");
       // console.log(playersSelected);
        {playersSelected.map(playerS => (
                playerS !== null && playerS !== undefined ?
                    tab = tab.filter(player => player.id !== playerS.id)
                    : tab
            ))
        }

        //console.log("tab: ");
        //console.log(tab);
        setPlayersFree(tab)
    }, [players, playersSelected])

    const MyPreview = () => {
        const { display, itemType, item, style } = usePreview();
        if (!display) {
            return null;
        }
        if (item.player) {
            //return <div className="item-list__item" style={style}>
            return <div className="playerCardSloted" style={style}>
                <div>
                    <p className="nameCard">{item.player.user.firstName +" "+ item.player.user.lastName}</p>
                    <div className="card-img-top" >
                        {pictures64.map((picture, index) => (
                            picture[item.player.id] ?
                                <div key={index} className='picture-profil'>
                                    {picture[item.player.id] && (
                                        <img src={`data:image/jpeg;base64,${picture[item.player.id]}`} alt="" />
                                    )}
                                </div>
                            : <div className="user-picture"></div>
                        ))}
                    </div>
                </div>
            </div>;
        } else {
            return <div className="playerCardSloted" style={style}>
                <div>
                    <p className="noNameCard">Non Assigné</p>
                </div>
                <div className="emptyPics"></div>
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

                        <label htmlFor="tacticSelect">Selectionner une tactique :</label>
                        <select name="tactic" id="tacticSelect" onChange={handleChange}>
                            <option value=""> Selectionner une tactique </option>
                            <optgroup label="Création :">
                                {tacticTypeList.map((tacticType, index) => (
                                    <option key={index} value={"new/" + tacticType[0]}>{tacticType[0]}</option>
                                    )
                                )}
                            </optgroup>
                            <optgroup label="Existantes :">
                                {tacticsList.map((tactic, index) => (
                                    <option key={tactic.id} value={"load/" + index}>{tactic.id + " / " + tactic.type}</option>
                                ))}
                            </optgroup>
                        </select>

                        <button
                            id="save"
                            onClick={() => saveTactic(tacticSelected)}
                          //  disabled
                        >
                            Save
                        </button>
                        <button id="delete" onClick={() => deleteTactic(tacticSelected.id)}>delete</button>

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
                                            />
                                    </SlotSelection>
                                ))
                            }
                        </div>
                    </div>
                    <FreePlayersList id="playersList" className="playerList" >
                        {(players.length < 11) &&
                            <p>
                                Une équipe doit posseder au moins 11 joueurs pour définir une tactique.
                                <Link to="/players" className="btn btn-link">
                                    Aller selectionner des joueurs pour votre équipe.
                                </Link>
                            </p>
                        }
                        {playersFree.map(playerFree => (
                            <PlayerCard
                                key={playerFree.id}
                                player={playerFree}
                                className="playerCard"
                                posOrigin={null}
                            />
                            ))
                        }
                    </FreePlayersList>
                </div>
                <MyPreview />
            </DndProvider>
        </div>
    )
}

export default FormationPage;