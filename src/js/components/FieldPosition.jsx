import React, { useContext, useEffect, useState } from 'react';
import "../../scss/components/FormationPage.scss";
import CurrentUser from "./CurrentUser";

const FieldPosition = (Xpos, Ypos, idPos, player) => {

    return (
        <div
            className={"fieldPos pos"+idPos}
        >

        </div>
    )
}

export default FieldPosition;