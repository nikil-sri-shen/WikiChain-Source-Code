/**
 *  * Copyright © 2024-Present Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Loading.jsx
 * @description Source code for the Loading component of the WikiChain application.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024-Present
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */
/**
 * Loading Component
 * @description Displays a loading spinner along with a "Loading..." message.
 *              This component can be used across the application to indicate
 *              that a process is in progress.
 * @returns {JSX.Element} The rendered Loading component.
 */

import React from "react";
import { FaSpinner } from "react-icons/fa";

function Loading() {
  return (
    <div className="flex justify-center items-center p-64">
      <FaSpinner className="animate-spin text-7xl" />
      <p className="ml-2">Loading...</p>
    </div>
  );
}

export default Loading;
