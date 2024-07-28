import React from "react";
import { Link } from "react-router-dom";
import "./home.css"; // Import the CSS file for styling

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1>Welcome to the Bank App</h1>
        <p>Manage your accounts and transactions with ease.</p>
      </header>
      <nav className="home-nav">
        <Link to="/dashboard" className="home-link">
          Go to Dashboard
        </Link>
      </nav>
    </div>
  );
}

export default Home;
