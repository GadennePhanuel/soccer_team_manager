import React from 'react'
import Pagination from "./Pagination";

const CategoryBox = (props) => {
    return (
        <>
            <div className="catBox">
                <h2>{props.category}</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Coach</th>
                    </tr>
                    </thead>
                    <tbody>
                        {props.teams.map(team =>
                            <tr key={team.id}>
                                <td>{team.label}</td>
                                <td>{team.coach.user.firstName} {team.coach.user.lastName}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default CategoryBox;