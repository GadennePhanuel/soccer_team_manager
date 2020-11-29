import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import AuthAPI from "../services/authAPI";
import usersAPI from "../services/usersAPI";
import "../../scss/layout/SideNav.scss";
import MatchLiveContext from "../contexts/MatchLiveContext";

const SideNav = (props) => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { matchLiveId } = useContext(MatchLiveContext)

  //supression du token du localStorage
  const handleLogout = () => {
    AuthAPI.logout();
    setIsAuthenticated(false);
    props.history.push("/login");
  };

  const [playerId, setPlayerId] = useState({})
  const [roles, setRoles] = useState('')
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    if (isAuthenticated) {
      setRoles(usersAPI.checkRole());
      setUserId(usersAPI.findUserId())
    }
    if (roles === 'ROLE_PLAYER') {
      //requete pour récupéré el player en question
      setPlayerId(usersAPI.findPlayerId())
    }
    setLoading(false)
  }, [isAuthenticated, roles, userId])

  return (
    <>
      {(isAuthenticated && !loading && props.location.pathname !== "/live/" + matchLiveId) && (
        <nav className="SideNav">

          <div className="SideNav-items">
            {roles !== "ROLE_NOT_ALLOWED" && (
              <>
              {roles === "ROLE_ADMIN" && (
                  <>
                    <NavLink to="/dashboardAdmin" className="home">
                    </NavLink>

                    <NavLink to="/coachs" className="coachs">
                    </NavLink>

                    <NavLink to="/players" className="players">
                    </NavLink>

                    <NavLink to="/teams" className="teams">
                    </NavLink>

                    <NavLink to="/encountersAdmin" className="encounter-management" >
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

                    <NavLink to="/trainings" className="trainings">
                    </NavLink>

                    <NavLink to="/encountersCoach" className="encounter-management">
                    </NavLink>

                    <NavLink to="/formation" className="formation">
                    </NavLink>

                    <NavLink to="/preLive" className="preLive">
                    </NavLink>
                  </>
              )}
              {roles === "ROLE_PLAYER" && (
                  <>
                    <NavLink to="/dashboardPlayer" className="home">
                    </NavLink>

                    <NavLink to={"/player/" + playerId + "/stats"} className="stats">
                    </NavLink>

                    <NavLink to={"/player/" + playerId + "/planning"} className="planningPlayer" >
                    </NavLink>
                  </>
              )}
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
