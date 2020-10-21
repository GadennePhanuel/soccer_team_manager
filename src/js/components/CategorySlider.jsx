import React, {useState} from "react";

const CategorySlider = (props) => {

    //console.log(props.teams)
    const toForm = (team) => {
        //setTeamToForm(team)
    }

    return (
        <div className="catBox">
            <h2>{props.cat}</h2>
            <table>
                <thead>
                <tr>
                    <th>Equipe</th>
                    <th>Coach</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                    {props.teams.length !== 0 ?
                            props.teams.map(tm =>
                                <tr key={tm.id} className="btn" onClick={toForm(tm)}>
                                    <td>{tm.label}</td>
                                    {tm.coach ?
                                        <td>{tm.coach.user.firstName} {tm.coach.user.lastName}</td> : <td>N/A</td>
                                    }
                                    <td>
                                    </td>
                                </tr>
                            )
                        :
                            <tr>
                                <td>
                                    Il n'y a aucune équipe dans cette catégorie
                                </td>
                            </tr>
                    }
                </tbody>
            </table>
        </div>
    )
}

export default CategorySlider;