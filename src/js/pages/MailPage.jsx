import React from 'react';
import usersAPI from '../services/usersAPI';

const MailPage = (props) => {
    authAPI.setup();
    //si c'est un admin, verifier si il a bien un club d'assigner. Si c'est non -> redirection sur "/createClub/new"
    const club = usersAPI.checkClub();
    if (club === "new") {
        props.history.replace("/createClub/new")
    }
    return (
        <>
            <h1>Page de messagerie</h1>
        </>
    );
}

export default MailPage;