import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

const SideNav = ({ history }) => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  return (
    <>
      {isAuthenticated && (
        <nav className="sideNav">
          <NavLink className="Home" to="/">
            STM !
          </NavLink>
        </nav>
      )}
    </>
  );
};

export default SideNav;
