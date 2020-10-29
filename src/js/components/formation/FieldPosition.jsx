import React from 'react';

export default function FieldPosition (props) {

    console.log(props)
    return (
        <div
            style ={{
                position:"relative",
                top:props.posY,
                left:props.posX,
                backgroundColor:"rgba(0,0,0,0.5)",
                width:"50px",
                height:"50px"
            }}
        >
            <p>{props.playerId}</p>
        </div>
    )
}