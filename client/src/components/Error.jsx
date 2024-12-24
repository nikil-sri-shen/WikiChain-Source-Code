/**
 *  * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Error.jsx
 * @description Source code for the Error component of the WikiChain application.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */
import React from "react";
import { useState, useEffect } from "react";
// Importing the Loading component for a loading animation
import Loading from "./Loading.jsx";

/**
 * Error Component
 * @description Displays a loading animation followed by a 404 error message when the requested page is not found.
 * @returns {JSX.Element} The rendered Error component.
 */
function Error() {
  // State to manage the loading state
  const [isLoading, setIsLoading] = useState(true);

  // useEffect hook to simulate an asynchronous operation (e.g., an API call)
  useEffect(() => {
    // Simulate a delay (e.g., fetching data or processing)
    const delay = setTimeout(() => {
      setIsLoading(false); // Set loading state to false after the delay
    }, 2000); // 2-second delay

    // Cleanup function to clear the timeout when the component unmounts
    return () => clearTimeout(delay);
  }, []);

  return (
    <div>
      {/* Conditional rendering based on the loading state */}
      {isLoading ? (
        // Display the Loading component while loading
        <Loading></Loading>
      ) : (
        // Display the error message once loading is complete
        <div className="text-center text-7xl p-60">
          Sorry :( 404! Page not Found...!
        </div>
      )}
    </div>
  );
}

export default Error;
