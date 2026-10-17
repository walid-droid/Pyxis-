import "./App.css";
import { Routes, Route, NavLink, Outlet } from "react-router";
import logo from "./assets/Logo SafeDZ.png";
// Landing is currently implemented in JavaScript/JSX without type declarations.
// @ts-expect-error No declaration file is available for this JSX module.
import Landing from "./landing/Landing";
import ContactsPage from "./pages/ContactsPage";
import AssistantPage from "./pages/AssistantPage";
import DashboardPage from "./pages/DashboardPage";
import AlertsPage from "./pages/AlertsPage";
import ResourcesPage from "./pages/ResourcesPage";
import SubmitAlertPage from "./pages/SubmitAlertPage";
import EventsPage from "./pages/EventsPage";
import ConsignesPage from "./pages/ConsignesPage";
import AuthPage from "./pages/AuthPage";

function DashboardLayout() {
  return (
    <>
      <header className="app-header">
        <NavLink to="/dashboard" className="app-brand">
          <img src={logo} alt="" />
          <span>SafeDZ</span>
        </NavLink>

        <nav className="app-nav">
          <NavLink to="/dashboard">Tableau de bord</NavLink>
          <NavLink to="/alerts">Alertes en cours</NavLink>
          <NavLink to="/consignes">Consignes</NavLink>
          <NavLink to="/assistant">Assistant IA</NavLink>
          <NavLink to="/events">Événements</NavLink>
          <NavLink to="/contacts">Contacts</NavLink>
        </nav>

        {/* <div className="header-actions">
          <button className="login-button">Se connecter</button>
          <button className="report-button">Signaler un incident</button>
        </div> */}
      </header>

      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/consignes" element={<ConsignesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/submit-alert" element={<SubmitAlertPage />} />
        <Route path="*" element={<h1>Page introuvable</h1>} />
      </Route>
    </Routes>
  );
}

export default App;