import React from 'react'

export default function PlayerCard(props) {
    return <div>
        <p>{props.player.user.firstName}</p>
        <p>{props.player.user.lastName}</p>
    </div>
}