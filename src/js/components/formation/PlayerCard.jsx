import React from 'react'
import { useDrag } from "react-dnd";

/**
 tactic ={tacticSelected}
 setTactic = {setTacticSelected}
 tacticsModified = {tacticModifiedList}
 setTacticsModified = {setTacticModifiedList}

 refreshSelection = {refreshPlayerSelected}
 setRefreshSelection = {setRefreshPlayerSelected}

 playersList = players

 picture
 */

const PlayerCard = ({ player, className, posOrigin, tactic, setTactic, tacticsModified, setTacticsModified, refreshSelection, setRefreshSelection, playersList, picture }) => {
    const [, drag] = useDrag({
        item: { type: 'playerCard', player },

        //todo recherche gestion preview #debug double Preview
        /*dragPreview: {

        },
        previewOptions:{
            preview:<MyPreview/>
        },*/
        end: (item, monitor) => {
            if(tactic) { //si une tactic est selectionné
                const dropResult = monitor.getDropResult();
                if (dropResult && dropResult.name != null) {
                    //si un drop existe, gestion de modification de la  tactic selectionnée
                    let posTarget = dropResult.name;
                    if(posOrigin !== posTarget ) { //evite les drag sur lui même
                        if(!(player === null && posTarget === "free")){ //evite drag de playerFree vers playersFree
                            if(!(player === null && (tactic[posTarget] === null || tactic[posTarget] === undefined))){ //eviter drag posTarget vide vers posTarget vide
                                if (posOrigin === "free") { // si le drag vient d'un player libre
                                    //    tactic[posTarget] = playersList.filter(p => p.id === player.id)[0];
                                    tactic[posTarget] = player;
                                } else { // sinon si le drag vient d'un player dans une tactic
                                    if (posTarget !== "free") { // si il est drag vers un autre poste tactique
                                        let switchedPlayer = null // var de transition entre les deux postes de tactique

                                        if (tactic[posTarget] !== undefined && tactic[posTarget] !== null) {
                                            //si la case tactique drop n'est pas vide, on stocke le player dans var transition
                                            switchedPlayer = playersList.filter(p => p.id === tactic[posTarget].id)[0]
                                        }

                                        if (player !== null) { //si la case drag contient bien un player
                                            tactic[posTarget] = playersList.filter(p => p.id === player.id)[0]
                                        } else { // sinon on place null dans la case drop
                                            tactic[posTarget] = null
                                        }
                                        // on place la case switché dans la case d'origine
                                        tactic[posOrigin] = switchedPlayer
                                    } else { // si il est drag vers liste FreePlayer, on libere juste la case d'origine
                                        tactic[posOrigin] = null;
                                    }
                                }
                                //recup du tableau des tactic modifiée sans la tactic modif actuelle
                                let tabModifiedList = tacticsModified.filter(tacticModif => tactic.id !== tacticModif.id)

                                //ajout de la tactic modif actuelle au tableau des tactic modifiés
                                tabModifiedList.push(tactic);

                                setTacticsModified(tabModifiedList)
                                setTactic(tactic);
                                setRefreshSelection(refreshSelection + 1)
                            }

                        }

                    }
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
                    <div className="flexCard">
                        <div className="infos-player">
                            {picture !== null && picture !== undefined ?
                                    <div className='picture-profil'>
                                        <img src={"data:image/jpeg;base64,"+picture[player.id]} alt="no" />
                                    </div>
                                : <div className="user-picture"></div>
                            }
                            {/*{player.picture ?
                                //   <span className="card-img-top" >
                                pictures64.map((picture, index) => (
                                    picture[player.id] && (
                                        <div key={index} className='picture-profil'>
                                            {picture[player.id] && (
                                                <img src={`data:image/jpeg;base64,${picture[player.id]}`} alt="" />
                                            )}
                                        </div>
                                    )
                                ))
                                //    </span>
                                : <div className="user-picture"></div>
                            }*/}
                            <p className="nameCard">{player.user.firstName} {player.user.lastName} </p>
                        </div>
                        <div className="stats-container">
                                <span className="player-stats">
                                    <span className="redCard">{player.totalRedCard}</span>
                                    <span className="yellowCard">{player.totalYellowCard}</span>
                                </span>
                            <span className="player-stats">
                                    <p><span>{player.totalPassAssist}</span> <span className="passAssist"> </span></p>
                                    <p><span>{player.totalGoal} </span><span className="goal"> </span></p>
                                </span>
                        </div>
                    </div>
                </div>
                : <div className="playerCardSloted emptyCard"> Non Assigné </div>
            }
        </div>
    )
}

export default PlayerCard