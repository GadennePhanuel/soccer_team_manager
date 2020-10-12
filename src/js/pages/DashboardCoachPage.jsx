import React from 'react';
import authAPI from '../services/authAPI';

const DashboardCoachPage = (props) => {
    authAPI.setup();
    return (
        <>
            <h1>Dashboard Coach</h1>
        </>
    );
}

export default DashboardCoachPage;