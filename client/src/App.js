/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file App.jsx
 * @description This is the main entry point for the React application. It defines the routing
 * and layout of the application, including components such as Navbar, Home, and others.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */
import React from "react";
import Navbar from "./components/Navbar"; // Navigation bar for the application
import Home from "./components/Home"; // Home page component
import Publish from "./components/publishArticle/Publish"; // Publish article page component
import Search from "./components/searchArticle/Search"; // Search article page component
import Update from "./components/updateArticle/Update"; // Update article page component
import Registration from "./components/userRegistration/Registration"; // User registration page component
import Error from "./components/Error"; // Error page component for handling unknown routes
import { BrowserRouter as Main, Route, Routes } from "react-router-dom"; // Routing library
import Consortium from "./components/consortium/Consortium"; // Consortium page component

/**
 * The main application component that sets up the structure and routing of the app.
 */
function App() {
  return (
    <div className="text-quaternary">
      {/* Renders the navigation bar */}
      <Navbar />
      <br />
      <br />
      <br />
      {/* BrowserRouter setup for handling client-side routing */}
      <Main>
        <Routes>
          {/* Define routes for different pages of the application */}
          <Route exact path="/" element={<Home />}></Route>
          <Route exact path="/publish" element={<Publish />}></Route>
          <Route exact path="/search" element={<Search />}></Route>
          <Route exact path="/update" element={<Update />}></Route>
          <Route exact path="/registration" element={<Registration />}></Route>
          <Route exact path="/consortium" element={<Consortium />}></Route>
          <Route path="/*" element={<Error />}></Route>{" "}
          {/* Fallback route for undefined paths */}
        </Routes>
      </Main>
    </div>
  );
}

export default App; // Export the App component as the default export
