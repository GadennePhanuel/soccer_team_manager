import React, { useEffect, useState } from 'react';
import authAPI from '../services/authAPI';
import usersAPI from "../services/usersAPI";
import playerAPI from "../services/playerAPI";
import "../../scss/pages/NotAllowedPage.scss";

const NotAllowedPage = (props) => {
    authAPI.setup();

    const role = usersAPI.checkRole();
    if (role === 'ROLE_ADMIN') {
        props.history.replace("/dashboardAdmin")
    } else if (role === 'ROLE_COACH') {
        props.history.replace("/dashboardCoach")
    } else if(role === 'ROLE_PLAYER') {
        props.history.replace("/dashboardPlayer")
    }

    const[player,setPlayer] = useState ({});

    useEffect(() => {
        let playerId = usersAPI.findPlayerId();
        console.log(playerId)

        playerAPI.findPlayer(playerId)
            .then(response => {
                console.log(response.data)
                setPlayer(response.data)
            })
            .catch(error => console.log(error.response));
    },[])

        return (
            <div className="NotAllowedPage wrapper_container">
                <div className="NotAllowedBox">
                    <h1>Compte Bloqué</h1>
                    <div>
                        {player && player.user && (
                            <p>Bonjour {player.user.firstName} {player.user.lastName}. <br/>
                                Ton compte a été bloqué par un administrateur. <br/>
                                Il est possible de contacter l'administrateur pour arranger la situation.
                                <br/><br/>
                                En attendant :
                                {player.user.roles[1] === "ROLE_PLAYER" &&
                                <> Tu as été exclu de ton équipe <br/>
                                    Mais tu peux toujours acceder à ton profil.
                                </>
                                }
                                {player.user.roles[1] === "ROLE_COACH" &&
                                <> Tes équipes ne sont plus a ta charges<br/>
                                    Mais tu peux toujours acceder à ton profil.
                                </>
                                }
                            </p>
                        )}
                    </div>

                </div>

            </div>
        )
}

export default NotAllowedPage;

