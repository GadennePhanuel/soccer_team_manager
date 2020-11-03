import React, { useEffect } from "react";
import Calendar from "../components/Calendar";


const TrainingsPage = () => {

    //au chargement de la page on récupére l'id de la currentTeam selectionné
    // on charge tous les entrainements la concernant
    // !!!! -> la tableau trainings doit ressembler à ça:  trainings = [ {training.date, training.id ...}, {training.date, training.id ...}, ....]


    const onDateClick = (day) => {
        console.log(day.toLocaleDateString('fr-FR'))
    }


    return (
        <div className="wrapper_container TrainingsPage">
            <Calendar
                parentCallBack={onDateClick}
            >
            </Calendar>
        </div>
    );
}

export default TrainingsPage;