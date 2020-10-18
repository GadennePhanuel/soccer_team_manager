import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import AuthAPI from "../services/authAPI";
import usersAPI from "../services/usersAPI";
import "../../scss/layout/SideNav.scss";

const SideNav = (props) => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  //supression du token du localStorage
  const handleLogout = () => {
    AuthAPI.logout();
    setIsAuthenticated(false);
    props.history.push("/login");
  };

  const token = window.localStorage.getItem("authToken");
  if (token) {
    var roles = usersAPI.checkRole();
    var club = usersAPI.checkClub()
  }


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

                <NavLink to="#" className="my-players">
                  Mes joueurs
                </NavLink>

                <NavLink to="#" >
                  Formation
                  </NavLink>

                <NavLink to="#" >
                  Entrainement
                  </NavLink>

                <NavLink to="#" >
                  Match
                  </NavLink>
              </>
            )}
            {roles === "ROLE_PLAYER" && (
              <>
                <NavLink to="/dashboardPlayer" className="home">
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
