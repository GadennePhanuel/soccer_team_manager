import React from 'react'

const TeamForm = ({team}) => {

    return (
        <>
            <table>
                <thead>
                <tr>
                    <th>Nom</th>
                    <th>Coach</th>
                    <th>Category</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{team.label}</td>
                    <td>{team.category}</td>
                    <td>{team.category}</td>
                </tr>
                </tbody>
            </table>
        </>
    )
}

export default TeamForm;