import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/register";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import ProtectedRoute from "./components/protectedRoute.js";
import TransactionHistory from "./components/transactionHistory";
import Navbar from "./components/navbar";
import Home from "./views/home";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={Dashboard} />}
        />
        <Route
          path="/accounts/:accountId/transactions"
          element={<ProtectedRoute element={TransactionHistory} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
