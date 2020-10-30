import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import AuthAPI from "../services/authAPI";
import usersAPI from "../services/usersAPI";
import "../../scss/layout/SideNav.scss";
import playerAPI from '../services/playerAPI';

const SideNav = (props) => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  //supression du token du localStorage
  const handleLogout = () => {
    AuthAPI.logout();
    setIsAuthenticated(false);
    props.history.push("/login");
  };

  const [player, setPlayer] = useState({})
  const [roles, setRoles] = useState('')
  const [club, setClub] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      setRoles(usersAPI.checkRole());
      setClub(usersAPI.checkClub());
      setUserId(usersAPI.findUserId())
    }

    if (roles === 'ROLE_PLAYER') {
      //requete pour récupéré el player en question
      playerAPI.findAllPlayers()
        .then(response => {
          response.forEach(player => {
            if (player.user.id === userId) {
              setPlayer(player)
            }
          })
        })
    }
  }, [isAuthenticated, roles, userId])


  return (
    <>
      {isAuthenticated && (
        <nav className="SideNav">

          <div className="SideNav-items">
            {roles === "ROLE_ADMIN" && (
              <>
                <NavLink to="/dashboardAdmin" className="home">
                </NavLink>

                <NavLink to={'/createClub/' + club} className="club">
                </NavLink>

                <NavLink to="/coachs" className="coachs">
                </NavLink>

                <NavLink to="/players" className="players">
                </NavLink>

                <NavLink to="/teams" className="teams">
                </NavLink>
              </>
            )}
            {roles === "ROLE_COACH" && (
              <>
                <NavLink to="/dashboardCoach" className="home">
                </NavLink>

                <NavLink to="/players" className="players">
                </NavLink>

                <NavLink to="/myPlayers" className="myPlayers">
                </NavLink>

                <NavLink to="/formation" className="formation">
                </NavLink>

                <NavLink to="#" >
                  Entrainement
                  </NavLink>

                <NavLink to="/encounterManagement" className="encounter-management">
                  Match
                  </NavLink>
              </>
            )}
            {roles === "ROLE_PLAYER" && (
              <>
                <NavLink to="/dashboardPlayer" className="home">
                </NavLink>

                <NavLink to={"/player/" + player.id + "/stats"} className="stats">
                </NavLink>

                <NavLink to="/dashboardPlayer" >
                  Entrainement
                  </NavLink>

                <NavLink to="/dashboardPlayer" >
                  Match
                  </NavLink>
              </>
            )}
            <NavLink to="/mail" className="mail">
            </NavLink>

            <NavLink to="/profil" className="profil">
            </NavLink>
          </div>
          <div>
            <button onClick={handleLogout} className="logout">

            </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default SideNav;
