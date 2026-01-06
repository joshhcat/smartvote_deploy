import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AdminSidebar from "./components/Sidebar/AdminSidebar.jsx";
import TestLocation from "./TestLocation.jsx";
import Hero from "./components/Hero.jsx";
import LoginForm from "./pages/LoginForm.jsx";
import StudentDashboard from "./pages/SmartvoteElection.jsx";

import Test from "./Test.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* <StudentDashboard /> */}
      {/* <Hero /> */}
      <App />
      {/* <TestLocation /> */}
      {/* <Test /> */}
    </BrowserRouter>
  </StrictMode>
);
