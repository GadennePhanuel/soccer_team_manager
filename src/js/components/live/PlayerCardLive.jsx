import React from 'react';
import useOnclickOutside from 'react-cool-onclickoutside';
import { useDrag } from 'react-dnd';

const PlayerCard = ({
    player, className, posOrigin, pictures64, stats,
    parentCallBackDownYellowCard, parentCallBackUpYellowCard,
    parentCallBackDownRedCard, parentCallBackUpRedCard,
    parentCallBackDownGoal, parentCallBackUpGoal,
    parentCallBackDownPassAssist, parentCallBackUpPassAssist,
}) => {

    //lors d'un drag d'un player on sait d'où il vient. si posOrigin === free il vient du banc des remplacants
    //                                                  sinon posOrigin === pos{X}   où X représente le numéro de sa position dans la tactic

    const showStats = (id) => {
        if (document.getElementById("div-stats-" + id).hidden === true) {
            document.getElementById("div-stats-" + id).hidden = false
        } else {
            document.getElementById("div-stats-" + id).hidden = true
        }
    }
    const refStatsDiv = useOnclickOutside(() => {
        if (document.getElementById('div-stats-' + player.id).hidden === false) {
            document.getElementById('div-stats-' + player.id).hidden = true
        }
    })

    const downYellowCard = (id) => {
        parentCallBackDownYellowCard(id)
    }
    const upYellowCard = (id) => {
        parentCallBackUpYellowCard(id)
    }
    const downRedCard = (id) => {
        parentCallBackDownRedCard(id)
    }
    const upRedCard = (id) => {
        parentCallBackUpRedCard(id)
    }
    const downPassAssist = (id) => {
        parentCallBackDownPassAssist(id)
    }
    const upPassAssist = (id) => {
        parentCallBackUpPassAssist(id)
    }
    const downGoal = (id) => {
        parentCallBackDownGoal(id)
    }
    const upGoal = (id) => {
        parentCallBackUpGoal(id)
    }





    const [, drag] = useDrag({
        item: { type: 'PlayerCardLive', player, posOrigin },

        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        })
    })

    return (
        <div ref={drag} className={className}>
            {className === "playerCardSubstitute" && (
                <div>
                    {player.picture && (
                        pictures64.map((picture, index) => (
                            picture[player.id] && (
                                <div key={index} className='picture-profil'>
                                    {picture[player.id] && (
                                        <img src={`data:image/jpeg;base64,${picture[player.id]}`} alt="" />
                                    )}
                                </div>
                            )
                        ))
                    )}
                    {!player.picture && (
                        <div className="user-picture">
                        </div>
                    )}
                    <p>{player.user.firstName.substring(0, 7)}.{player.user.lastName.charAt(0)}</p>
                </div>
            )}
            {className === "playerCardSelected" && (
                <div onClick={() => showStats(player.id)} ref={refStatsDiv}>
                    {player.picture && (
                        pictures64.map((picture, index) => (
                            picture[player.id] && (
                                <div key={index} className='picture-profil'>
                                    {picture[player.id] && (
                                        <img src={`data:image/jpeg;base64,${picture[player.id]}`} alt="" />
                                    )}
                                </div>
                            )
                        ))
                    )}
                    {!player.picture && (
                        <div className="user-picture">
                        </div>
                    )}
                    <p>{player.user.firstName.substring(0, 6)}.{player.user.lastName.charAt(0)}</p>

                    {stats && (
                        <div hidden id={"div-stats-" + player.id} className="div-stats">
                            <div className="yellow-div">
                                {stats.yellowCard > 0 && (
                                    <div className="down" onClick={() => downYellowCard(player.id)}></div>
                                )}
                                {stats.yellowCard}
                                {stats.yellowCard < 2 && (
                                    <div className="up" onClick={() => upYellowCard(player.id)}></div>
                                )}
                            </div>

                            <div className="red-div">
                                {stats.redCard > 0 && (
                                    <div className="down" onClick={() => downRedCard(player.id)}></div>
                                )}
                                {stats.redCard}
                                {stats.redCard < 1 && (
                                    <div className="up" onClick={() => upRedCard(player.id)}></div>
                                )}
                            </div>

                            <div className="goal-div">
                                {stats.goal > 0 && (
                                    <div className="down" onClick={() => downGoal(player.id)}></div>
                                )}
                                {stats.goal}
                                <div className="up" onClick={() => upGoal(player.id)}></div>
                            </div>

                            <div className="pass-div">
                                {stats.passAssist > 0 && (
                                    <div className="down" onClick={() => downPassAssist(player.id)}></div>
                                )}
                                {stats.passAssist}
                                <div className="up" onClick={() => upPassAssist(player.id)}></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PlayerCard;