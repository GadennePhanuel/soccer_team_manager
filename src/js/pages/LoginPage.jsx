import JwtDecode from "jwt-decode";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/forms/Field";
import AuthContext from "../contexts/AuthContext";
import AuthAPI from "../services/authAPI";
import "../../scss/pages/Login.scss";
import usersAPI from "../services/usersAPI";

const LoginPage = ({ history }) => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  if (isAuthenticated === true) {
    const role = usersAPI.checkRole()
    if (role === 'ROLE_ADMIN') {
      history.replace('/dashboardAdmin')
    } else if (role === 'ROLE_COACH') {
      history.replace('/dashboardCoach')
    } else if (role === 'ROLE_PLAYER'){
      history.replace('/dashboardPlayer')
    }else if (role === 'ROLE_NOT_ALLOWED'){
      history.replace("/notAllowedUser")
    }
  }

  const [credentials, setCredential] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const value = event.currentTarget.value;
    const name = event.currentTarget.name;

    setCredential({ ...credentials, [name]: value });
  };

  //requete HTTP d'authentification et stockage du token dans le localStorage
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await AuthAPI.authenticate(credentials);
      setError("");
      setIsAuthenticated(true);

      //TODO : affichage d'un notif 

      const token = window.localStorage.getItem("authToken");
      //je fait la redirection, en fonction du role de l'user
      const jwtData = JwtDecode(token);
      const roles = jwtData.roles[0]
      if (roles === "ROLE_ADMIN") {
        history.replace("/dashboardAdmin");
      } else if (roles === "ROLE_COACH") {
        history.replace("/dashboardCoach");
      } else if (roles === "ROLE_PLAYER"){
        history.replace("/dashboardPlayer");
      } else if (roles === "ROLE_NOT_ALLOWED"){
        history.replace("/notAllowedUser");
      }

    } catch (error) {
      console.log(error.response);
      setError(
        "Aucun compte pour cette utilisateur ou alors les informations ne correspondent pas"
      );
    }
  };

  return (
    <div className="LoginPage">
      <h1>SoccerTeamManager</h1>
      <form onSubmit={handleSubmit}>
        <Field
          label="Email"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          placeholder="identifiant de connection..."
          error={error}
        />

        <Field
          label="Mot de passe"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          type="password"
          placeholder="mot de passe..."
          error={error}
        />

        <div className="inline-btn">
          <button type="submit" className="btn btn-success">
            Je me connecter
          </button>
          <Link to="/registerAdmin" className="btn btn-link">
            Inscription
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
