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

function getUserbyId(id) {
  return Axios.get(USERS_API + "/" + id)
}

function switchAllowed(userId, userType, allowed){
  return Axios.patch(ADMINS_API + "/user/" + userId + "/" + userType + "/" + allowed)
}

//todo a retirer column allowwed de bdd
function checkAllowed() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  console.log(jwtData)
  return jwtData.isAllowed
}

function checkRole() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  return jwtData.roles[0]
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

function findPlayerId() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  const playerId = jwtData.player
  return playerId;
}

function findPlayerIdTeamId() {
  const token = window.localStorage.getItem("authToken");
  const jwtData = JwtDecode(token)
  const teamId = jwtData.team
  return teamId;
}



export default {
  registerUser,
  registerAdmin,
  registerCoach,
  checkAllowed,
  checkRole,
  checkClub,
  checkLastName,
  checkFirstName,
  findUserId,
  findPlayerId,
  putUserClub,
  putUserProfil,
  registerPlayer,
  getUserbyId,
  findPlayerIdTeamId,
  switchAllowed
};
