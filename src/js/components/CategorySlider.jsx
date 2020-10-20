import React from 'react'

const CategorySlider = ({teams, category}) => {

    return (
        <>
            <div className="catBox">
                <h2>{category}</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Coach</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {teams.map(team =>
                        <tr key={team.id}>
                            <td>{team.label}</td>
                            {team.coach ?
                                <td>{team.coach.user.firstName} {team.coach.user.lastName}</td> : <td>N/A</td>
                            }
                            <td>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    )

}

export default CategorySlider;