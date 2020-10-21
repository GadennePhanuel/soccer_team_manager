import Axios from "axios";
import JwtDecode from "jwt-decode";
import { API_URL, USERS_API, COACHS_API, PLAYERS_API, ADMINS_API } from "../../config";

function registerUser(users) {
  return Axios.post(USERS_API, users);
}

function registerAdmin(response) {
  return Axios.post(ADMINS_API, {
    user: "/api/users/" + response.data.id,
  });
}

function registerCoach(response, token) {
  return Axios.post(COACHS_API, {
    user: "/api/users/" + response.data.id,
  }, {
    headers: {
      'Authorization': "Bearer " + token
    }
  });
}

function registerPlayer(response, token) {
  console.log(response.data.id)
  return Axios.post(PLAYERS_API, {
    user: "/api/users/" + response.data.id,
    injured: false
  }, {
    headers: {
      'Authorization': "Bearer " + token
    }
  });
}

function putUserClub(userId, clubId) {
  return Axios.put(API_URL + 'user/' + userId + "/club/" + clubId)
}

function putUserProfil(userId, user) {
  return Axios.put(USERS_API + "/" + userId, user)
}

function getUserbyId(id){
  return Axios.get(USERS_API + "/" + id)
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

function checkLastName() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  const lastName = jwtData.lastName
  return lastName;
}

function checkFirstName() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  const firstName = jwtData.firstName
  return firstName;
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
  checkLastName,
  checkFirstName,
  findUserId,
  putUserClub,
  putUserProfil,
  registerPlayer,
  getUserbyId
};
