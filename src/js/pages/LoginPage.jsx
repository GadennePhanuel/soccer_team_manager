import axios from "axios";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/forms/Field";
import AuthContext from "../contexts/AuthContext";

const LoginPage = ({ history }) => {
  const { setIsAuthenticated } = useContext(AuthContext);

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
      const token = await axios
        .post("http://localhost:8000/api/login_check", credentials)
        .then((response) => response.data.token);

      setError("");

      setIsAuthenticated(true);
      //je stocke mon token dans le localStorage
      window.localStorage.setItem("authToken", token);

      //affichage d'un notif

      //je fait la redirection
      history.replace("/");
    } catch (error) {
      console.log(error.response);
      setError(
        "Aucun compte pour cette utilisateur ou alors les informations ne correspondent pas"
      );
    }
  };

  return (
    <>
      <h1>Connection à l'application</h1>
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

        <div className="form-group">
          <button type="submit" className="btn btn-success">
            Je me connecter
          </button>
          <Link to="/registerAdmin" className="btn btn-link">
            Inscription
          </Link>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
