import React from 'react'
import { useDrag } from "react-dnd";

const PlayerCard = ({player, className, slotSelect}) => {
    const [{isDragging}, drag] = useDrag({
        item: { type:'playerCard'},
        /*end:(item,monitor)=>{
            const dropResult = monitor.getDropResult();
            if(dropResult && dropResult.name != null){
                slotSelect
            }
        },*/
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