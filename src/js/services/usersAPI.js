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

function registerCoach(response, token) {
  return Axios.post("http://localhost:8000/api/coaches", {
    user: "/api/users/" + response.data.id,
  }, {
    headers: {
      'Authorization': "Bearer " + token
    }
  });
}

function registerPlayer(response, token) {
  console.log(response.data.id)
  return Axios.post("http://localhost:8000/api/players", {
    user: "/api/users/" + response.data.id,
    injured: false
  }, {
    headers: {
      'Authorization': "Bearer " + token
    }
  });
}

function putUserClub(userId, clubId) {
  return Axios.put("http://localhost:8000/api/user/" + userId + "/club/" + clubId)
}

function putUserProfil(userId, user) {
  return Axios.put("http://localhost:8000/api/users/" + userId, user)
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
  registerCoach,
  checkRole,
  checkClub,
  findUserId,
  putUserClub,
  putUserProfil,
  registerPlayer
};
