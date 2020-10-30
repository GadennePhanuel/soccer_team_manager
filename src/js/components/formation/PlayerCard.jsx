import React from 'react'
import {useDrag, DragSource } from "react-dnd";

const type = {PLAYERCARD: 'playerCard'}

export default function PlayerCard(props) {

    const[collectedProps, drag] = useDrag({
        item: props.player.id, type
    })

    function beginDrag(props){
        const item = {id : props.player.id}
        return item
    }

    function endDrag(props, monitor, component){
        if(!monitor.didDrop()){
            return
        }
        const item = monitor.getItem()
        const dropResult = monitor.getDropResult()
        //todo? CardActions?

    }

    function collect(connect, monitor) {
        return {
            //appel cette fonction dans le render pour permettre a react de gérer les event Drag
            connectDragSource: connect.dragSource(), isDragging:monitor.isDragging()
        }
    }
    return <div ref={drag}>
        <p>{props.player.user.firstName} {props.player.user.lastName}</p>
    </div>
}