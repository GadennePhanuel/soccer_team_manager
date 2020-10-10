import Axios from "axios";
import jwtDecode from "jwt-decode";

function logout() {
  window.localStorage.removeItem("authToken");
  delete Axios.defaults.headers["Authorization"];
}

function authenticate(credentials) {
  return Axios
    .post("http://localhost:8000/api/login_check", credentials)
    .then((response) => response.data.token)
    .then(token => {
      //je stocke mon token dans le localStorage
      window.localStorage.setItem("authToken", token);
      //on prévient Axios qu'on a maintenantn un header par défaut sur toutes les futures requetes HTTP
      setAxiosToken(token)
      return true;
    });
}

function setAxiosToken(token) {
  Axios.defaults.headers["Authorization"] = "Bearer " + token;
}

/**
 * mise en place lors du chargement de l'appli
 * @returns boolean
 */
function setup() {
  const token = window.localStorage.getItem("authToken");

  if (token) {
    const jwtData = jwtDecode(token);
    if (jwtData.exp * 1000 > new Date().getTime()) {
      setAxiosToken(token);
      return true;
    }
    else {
      logout();
      return false;
    }
  } else {
    logout();
    return false;
  }
}

/**
 * permet de savoir si on est authentifié ou pas
 * @returns boolean
 */
function isAuthenticated() {
  const token = window.localStorage.getItem("authToken");

  if (token) {
    const jwtData = jwtDecode(token);
    if (jwtData.exp * 1000 > new Date().getTime()) {
      return true;
    }
    return false;
  }
  return false;
}

export default {
  logout,
  authenticate,
  setup,
  isAuthenticated,
};
