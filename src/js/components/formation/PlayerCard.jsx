import React from 'react'
import { useDrag } from "react-dnd";

const PlayerCard = ({player, className}) => {
    const [{isDragging}, drag] = useDrag({
        item: { type:'playerCard'},
        collect:(monitor)=>({
            isDragging: monitor.isDragging(),
        }),
    });

    const firstName=player.user.firstName;
    const lastName=player.user.lastName;

    return (
        <div ref={drag} className={className}>
            <p>{firstName} {lastName}</p>
        </div>
    )
}

export default PlayerCard