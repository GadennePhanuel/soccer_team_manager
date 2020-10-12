import React from 'react';
import authAPI from '../services/authAPI';

const DashboardPlayerPage = (props) => {
    authAPI.setup();
    return (
        <>
            <h1>Dashboard Joueur</h1>
        </>
    );
}

export default DashboardPlayerPage;