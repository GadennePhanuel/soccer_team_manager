import React, {useContext, useEffect, useState} from 'react';
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

    const [elementDrag, setElementDrag] = useState()

    const initDraggable = () => {
        setElementDrag(document.querySelector('.base'));
    }

    useEffect(() => {
        initDraggable();
        teamAPI.findTeam(currentTeamId)
            .then(response => {
                setTeam(response.data)
                setPlayers(response.data.players)
            })
        // const box = document.querySelectorAll('.case');
    }, [])

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
        event.currentTarget.className = 'base';
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
        event.currentTarget.className = "case"
        console.log("leave");
    }

    const dragDrop = (event) => {
        let target = event.currentTarget;
        target.className = "case";
        target.append(elementDrag);
        console.log("drop");
    }

    return (
        <div className="FormationPage wrapper_container">
            <h1>Formation Tactique</h1>
            <div id="playersList">
                {players.map(player => (
                       <div key={player.id} draggable={true}>

                       </div>
                    )
                )}
            </div>
            <div className="box case"
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
            </div>
        </div>
    )
}

export default FormationPage;