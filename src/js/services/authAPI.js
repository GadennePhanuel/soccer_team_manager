import jwtDecode from "jwt-decode";

function handleLogout() {
  window.localStorage.removeItem("authToken");
}

/**
 * mise en place lors du chargement de l'appli
 */
function setup() {
  const token = window.localStorage.getItem("authToken");

  if (token) {
    const jwtData = jwtDecode(token);
    if (jwtData.exp * 1000 > new Date().getTime()) {
    } else {
      handleLogout();
    }
  } else {
    handleLogout();
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
  setup,
  isAuthenticated,
};
