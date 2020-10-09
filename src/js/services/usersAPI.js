import Axios from "axios";

function registerUser(users) {
  return Axios.post("http://localhost:8000/api/users", users);
}

function registerAdmin(response) {
  return Axios.post("http://localhost:8000/api/admins", {
    user: "/api/users/" + response.data.id,
  });
}

export default {
  registerUser,
  registerAdmin,
};
