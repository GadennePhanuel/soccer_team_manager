import React, { useState } from "react";
import { HashRouter, Route, Switch, withRouter } from "react-router-dom";
import AuthAPI from "./js/services/authAPI";
import AuthContext from "./js/contexts/AuthContext";
import LoginPage from "./js/pages/LoginPage";
import RegisterAdminPage from "./js/pages/RegisterAdminPage";
import SideNav from "./js/components/SideNav";
import "./css/index.css";

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
        <main className="container">
          <Switch>
            <Route path="/RegisterAdmin" component={RegisterAdminPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/" component={LoginPage} />
          </Switch>
        </main>
      </HashRouter>
    </AuthContext.Provider>
  );
}

export default App;
