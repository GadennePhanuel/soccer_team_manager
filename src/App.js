import React, { useState } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import AuthAPI from "./js/services/authAPI";
import AuthContext from "./js/contexts/AuthContext";
import LoginPage from "./js/pages/LoginPage";


function App() {
  AuthAPI.setup();

  const [isAuthenticated, setIsAuthenticated] = useState(
    AuthAPI.isAuthenticated()
  );


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated,
        setIsAuthenticated: setIsAuthenticated,
      }}
    >
      <HashRouter>
        <main className="container pt-5">
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/" component={LoginPage} />
          </Switch>
        </main>
      </HashRouter>
    </AuthContext.Provider >
  );
}

export default App;
