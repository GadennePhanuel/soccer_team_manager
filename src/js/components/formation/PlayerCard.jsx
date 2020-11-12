import React from 'react'
import { useDrag } from "react-dnd";

/**todo
//besoin tacticSelected
 //setRefreshKey
 //players
 */
/*const PlayerCard = ({player, className, slotSelect}) => {
    const [{isDragging}, drag] = useDrag({
        item: { type:'playerCard'},
        /!*end:(item,monitor)=>{
            const dropResult = monitor.getDropResult();
            if(dropResult && dropResult.name != null){
                slotSelect
            }
        },*!/
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
}*/

const PlayerCard = ({ player, className, posOrigin,setTacticSelected, tacticSelected, setRefreshKey, players }) => {
    //     console.log(player)
    const [{ isDragging }, drag] = useDrag({
        item: { type: 'playerCard', player },
        begin: () => { //todo rendre invisible non fonctionnel
            setTimeout(() => {
                className = 'invisible'
            }, 0);
        },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (dropResult && dropResult.name != null) {
                let posTarget = dropResult.name;
                //                 console.log(posTarget)
                //    console.log(tacticSelected[posId].id)
                if (posOrigin === "free") {

                    tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0];
                    //    console.log(tacticSelected[posId]);
                }
                else {
                    if (posTarget !== "free") {
                        //                        console.log(posTarget)
                        //                       console.log(tacticSelected)
                        let switchedPlayer = null
                        if (tacticSelected[posTarget] !== undefined && tacticSelected[posTarget] !== null) {
                            switchedPlayer = players.filter(p => p.id === tacticSelected[posTarget].id)[0]
                        }
                        //  console.log(switchedPlayer)
                        if (player !== null) {
                            tacticSelected[posTarget] = players.filter(p => p.id === player.id)[0]
                        }
                        else { tacticSelected[posTarget] = null }
                        tacticSelected[posOrigin] = switchedPlayer
                    }
                    else { tacticSelected[posOrigin] = null; }
                }
                setTacticSelected(tacticSelected);
                //   console.log(tacticSelected)
                setRefreshKey(oldKey => oldKey + 1)
            }
        },
        collect: (monitor) => ({
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

export default PlayerCard