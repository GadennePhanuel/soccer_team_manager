import React, { useContext, useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from '../services/usersAPI';
import "../../scss/pages/FormationPage.scss";

import { useDrag } from 'react-dnd'
import TeamContext from "../contexts/TeamContext";
import teamAPI from "../services/teamAPI";

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

    const [tactic, setTactic] = useState();
    const [elementDrag, setElementDrag] = useState()

    const initDraggable = () => {
        setElementDrag(document.querySelector('.base'));
    }

    const tacticList = ["5-3-2", "5-4-1", "3-5-2", "4-4-2-losange", "4-4-2-carré", "4-3-3", "4-5-1"]

    useEffect(() => {
        initDraggable();
        if (currentTeamId !== '') {
            teamAPI.findTeam(currentTeamId)
                .then(response => {
                    setTeam(response.data)
                    setPlayers(response.data.players)
                    console.log(team)
                    console.log(players)
                })
        }
        // const box = document.querySelectorAll('.case');
    }, [currentTeamId])

    const dragStart = (event) => {
        // console.log("start");
        let target = event.currentTarget;
        target.className += ' taken';
        setTimeout(() => {
            target.className = 'invisible'
        }, 0);
    }

    const dragEnd = (event) => {
        // console.log("end");
        //let target = event.currentTarget;
        event.currentTarget.className = 'playerCard';
    }

    const dragOver = (event) => {
        event.preventDefault();
        console.log("over");
    }

    const dragEnter = (event) => {
        event.preventDefault();
        event.currentTarget.className = "hovered"
        console.log("enter");
    }

    const dragLeave = (event) => {
        event.currentTarget.className = "playerCard"
        console.log("leave");
    }

    const dragDrop = (event) => {
        let target = event.currentTarget;
        target.className = "playerCard";
        target.append(elementDrag);
        console.log("drop");
    }

    //todo refaire le dragAndDrop avec react Dnd, pour que ca soit fonctionnel sur tablette
    return (
        <div className="FormationPage wrapper_container">
            <div className="flexBox">
                <h1>Formation Tactique</h1>
                <h2>
                    {currentTeamId === "" ? "Pas d'équipe à charge" : team.label + ' ' + team.category}
                </h2>
            </div>
            <div className="flexBox">
                <div id="tacticBox">
                    <div id="soccerField">
                        {/*
                        //todo faire les composant fieldPosition avec un placement relatif dynamique
                        */}
                    </div>
                </div>
                <div id="playersList">
                    {(players.length < 11) &&
                        <p>Une équipe doit possèder 11 joueurs minimum.</p>
                    }
                    {players && players.map(player => (
                        <div className="playerCard" key={player.id} draggable={true} onDragStart={dragStart} onDragEnd={dragEnd}>
                            <p>{player.user.firstName + " " + player.user.lastName}</p>
                        </div>
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
                <div id="tacticMenu">
                    <select name="tacticChoice" id="">
                        {tacticList.map((tactic, index) => (
                                <option key={index} value={tactic}>{tactic}</option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/*<div className="box case"
                 onDragOver={dragOver}
                 onDragEnter={dragEnter}
                 onDragLeave={dragLeave}
                 onDrop={dragDrop}
            >
                <div className="base" draggable={true} onDragStart={dragStart} onDragEnd={dragEnd}>Btn-Test</div>
            </div>
            <div className="box case"
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={dragDrop}
            >
            </div>
            <div className="box case"
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={dragDrop}
            >
            </div>
            <div className="box case"
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={dragDrop}
            >
            </div>*/}
        </div>
    )
}

export default FormationPage;