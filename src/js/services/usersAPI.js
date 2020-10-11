import Axios from "axios";
import JwtDecode from "jwt-decode";

function registerUser(users) {
  return Axios.post("http://localhost:8000/api/users", users);
}

function registerAdmin(response) {
  return Axios.post("http://localhost:8000/api/admins", {
    user: "/api/users/" + response.data.id,
  });
}

function checkRole() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  const roles = jwtData.roles[0]
  return roles;
}

function checkClub() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  let club = jwtData.club
  if (club === null) {
    club = 'new'
  }
  return club;
}

function findUserId() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  const userId = jwtData.id
  return userId;
}

export default {
  registerUser,
  registerAdmin,
  checkRole,
  checkClub,
  findUserId
};
