import React, { useState } from "react";
import { HashRouter, Route, Switch, withRouter } from "react-router-dom";
import AuthAPI from "./js/services/authAPI";
import AuthContext from "./js/contexts/AuthContext";
import LoginPage from "./js/pages/LoginPage";
import RegisterAdminPage from "./js/pages/RegisterAdminPage";
import SideNav from "./js/components/SideNav";
import PrivateRoute from "./js/components/PrivateRoute";
import DashboardAdminPage from "./js/pages/DashboardAdminPage";
import DashboardCoachPage from "./js/pages/DashboardCoachPage";
import DashboardPlayerPage from "./js/pages/DashboardPlayerPage";
import CoachAdminPage from "./js/pages/CoachsAdminPage";
import PlayersAdminPage from "./js/pages/PlayersAdminPage";
import TeamsAdminPage from "./js/pages/TeamsAdminPage";
import MailPage from "./js/pages/MailPage";
import ClubFormPage from "./js/pages/ClubFormPage";
import ProfilForm from "./js/pages/ProfilForm";
import RegisterUserPage from "./js/pages/RegisterUserPage";
import EncountersPage from "./js/pages/EncountersPage";
import CurrentUser from "./js/components/CurrentUser";


function App() {
  AuthAPI.setup();

  const [isAuthenticated, setIsAuthenticated] = useState(
    AuthAPI.isAuthenticated()
  );

  const SideNavWithRouter = withRouter(SideNav);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        setIsAuthenticated: setIsAuthenticated,
      }}
    >
      <HashRouter>
        <SideNavWithRouter />
        <CurrentUser />
        <main className="container-fluid">
          <Switch>
            <PrivateRoute path="/createClub/:id" component={ClubFormPage} />
            <Route path="/RegisterAdmin" component={RegisterAdminPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/registerUser/:token" component={RegisterUserPage} />
            <PrivateRoute path="/dashboardAdmin" component={DashboardAdminPage} />
            <PrivateRoute path="/dashboardCoach" component={DashboardCoachPage} />
            <PrivateRoute path="/dashboardPlayer" component={DashboardPlayerPage} />
            <PrivateRoute path="/coachs" component={CoachAdminPage} />
            <PrivateRoute path="/encounterManagement" component={EncountersPage} />
            <PrivateRoute path="/players" component={PlayersAdminPage} />
            <PrivateRoute path="/teams" component={TeamsAdminPage} />
            <PrivateRoute path="/mail" component={MailPage} />
            <PrivateRoute path="/profil" component={ProfilForm} />
            <Route path="/" component={LoginPage} />
          </Switch>
        </main>
      </HashRouter>
    </AuthContext.Provider>
  );
}

export default App;
