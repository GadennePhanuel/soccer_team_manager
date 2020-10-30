import React from 'react'
import {useDrag, DragSource } from "react-dnd";

const type = {PLAYERCARD: 'playerCard'}

export default function PlayerCard(props) {

    const dragStart = (event) => {
        // console.log("start");
        let target = event.currentTarget;
        target.className += ' taken';
        setTimeout(() => {
            target.className = 'invisible'
        }, 0);
    }

    const touchStartCapture = (event) => {
    }

    const dragEnd = (event) => {
        // console.log("end");
        //let target = event.currentTarget;
        event.currentTarget.className = 'playerCard';
    }

    return <div draggable={true}
                onDragStart={dragStart}
                onDragEnd={dragEnd}
                onTouchStartCapture={touchStartCapture}
    >
        <p>{props.player.user.firstName} {props.player.user.lastName}</p>
    </div>
}