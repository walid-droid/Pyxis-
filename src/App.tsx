
import "./App.css";
import { Routes, Route, Navigate, NavLink } from "react-router";
import DashboardPage from "./pages/DashboardPage";
import AlertsPage from "./pages/AlertsPage";
import ResourcesPage from "./pages/ResourcesPage";

function App() {
  return (
    <>
      <header className="app-header">
        <NavLink to="/dashboard" className="app-brand">
          <span className="brand-mark">✳</span>
          <span>SafeDZ</span>
        </NavLink>

        <nav className="app-nav">
          <NavLink to="/dashboard">Tableau de bord</NavLink>
          <NavLink to="/alerts">Alertes en cours</NavLink>
          <NavLink to="/resources">Consignes</NavLink>
          <NavLink to="/assistant">Assistant IA</NavLink>
          <NavLink to="/events">Événements</NavLink>
          <NavLink to="/contacts">Contacts</NavLink>
        </nav>

        {/* <div className="header-actions">
          <button className="login-button">Se connecter</button>
          <button className="report-button">Signaler un incident</button>
        </div> */}
      </header>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </>
  );
}

export default App;
