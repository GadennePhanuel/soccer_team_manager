import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';

const NotAllowedPage = (props) => {
    authAPI.setup();

    return (
        <div className="wrapper_container">
            <p>Votre compte a été bloqué</p>
        </div>
    )
}

export default NotAllowedPage;

