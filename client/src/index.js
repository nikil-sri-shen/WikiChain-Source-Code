/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file index.js
 * @description The entry point for the React application. This file imports global styles, the main App component,
 *              and renders the application to the root DOM element.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import React from "react";
import ReactDOM from "react-dom/client"; // Import React DOM for rendering the app
import "./index.css"; // Import global styles
import App from "./App"; // Import the main App component

// Create the root element and render the App component inside it
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App /> {/* Main application component */}
  </React.StrictMode>
);
