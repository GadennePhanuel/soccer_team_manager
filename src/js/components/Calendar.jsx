import React, { useState } from "react";
import "../../scss/components/Calendar.scss";
import { addMonths, subMonths, format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay } from 'date-fns'
import { fr } from "date-fns/esm/locale";


const Calendar = ({ parentCallBack, events = [] }) => {

    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    }
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    }

    const header = () => {
        const dateFormat = "MMMM yyyy";
        return (
            <div className="header row flex-middle">
                <div className="column col-start">
                    <div className="icon" onClick={prevMonth}>
                        chevron_left
                    </div>
                </div>
                <div className="column col-center">
                    <span>{format(currentDate, dateFormat, { locale: fr })}</span>
                </div>
                <div className="column col-end">
                    <div className="icon" onClick={nextMonth}>
                        chevron_right
                    </div>
                </div>
            </div>
        );
    };

    const daysOfWeek = () => {
        const dateFormat = "eeee";
        const days = [];
        let startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="column col-center" key={i}>
                    {format(addDays(startDate, i), dateFormat, { locale: fr })}
                </div>
            );
        }
        return <div className="days row">{days}</div>;
    };

    const onDateClick = day => {
        setSelectedDate(day)
        parentCallBack(day)
    }

    const cells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd);
        const dateFormat = "d";
        const rows = [];

        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                days.push(
                    <div
                        className={`column cell ${!isSameMonth(day, monthStart)
                            ? "disabled" : isSameDay(day, selectedDate)
                                ? "selected" : ""}`}
                        key={day}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <span className="number">{formattedDate}</span>
                        <span className="bg">{formattedDate}</span>

                        {events.length > 0 && (
                            //parcourir le tableau des events, quand event.date == day, afficher le label de l'event dans la cellule 
                            <span></span>
                        )}


                    </div>
                );
                day = addDays(day, 1);
            }

            rows.push(
                <div className="row" key={day}> {days} </div>
            );
            days = [];
        }
        return <div className="body">{rows}</div>;
    }





    return (
        <div className="calendar_container">
            <div>{header()}</div>
            <div>{daysOfWeek()}</div>
            <div>{cells()}</div>
        </div>
    );
}

export default Calendar;