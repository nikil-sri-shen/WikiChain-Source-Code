/**
 * Copyright © 2024-Present Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Registration.jsx
 * @description This component allows users to register themselves on the platform by verifying their registration status
 *              and handling the transaction on the blockchain. It manages the user registration process by interacting with
 *              the smart contract to register a user and display the current registration status.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024-Present
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import React from "react";
import { useState, useEffect } from "react";
import { MdLogin } from "react-icons/md"; // Import login icon from react-icons
import web3 from "../../web3.js"; // Import web3 instance for blockchain interactions
import wikichain from "../../wikichain.js"; // Import the smart contract instance
import Loading from "../Loading.jsx"; // Import Loading component for displaying loading spinner

/**
 * Registration component handles the user registration process.
 * It checks if the user is already registered, and if not, allows them to register by providing their username.
 */
function Registration() {
  const [userName, setUserName] = useState(""); // State to store the username input by the user
  const [account, setAccount] = useState(""); // State to store the user's blockchain account address
  const [transactionStatus, setTransactionStatus] = useState(""); // State to store transaction status message
  const [isUserRegistered, setIsUserRegistered] = useState(false); // State to check if the user is already registered
  const [isLoading, setIsLoading] = useState(true); // State to manage the loading state

  // useEffect hook to check if the user is already registered when the component loads
  useEffect(() => {
    const checkUserRegistration = async () => {
      const account = await web3.eth.getAccounts(); // Get the user's account from the blockchain
      setAccount(account);
      try {
        // Call the smart contract method to check the user's registration status
        const user = await wikichain.methods.users(account[0]).call();
        const userIsRegistered = user && user.isRegistered; // Check if the user is registered
        setIsUserRegistered(userIsRegistered); // Update the state based on registration status
        setIsLoading(false); // Set loading state to false
      } catch (error) {
        console.error("Error checking user registration:", error); // Log any errors
        setIsLoading(false); // Set loading state to false in case of error
      }
    };

    checkUserRegistration(); // Invoke the function to check registration status
  }, [account]); // Dependency array includes account to re-check registration on account change

  /**
   * Handles the registration of the user if they are not already registered.
   * Sends the transaction to the blockchain to register the user with the provided username.
   * @param {Object} e - The event object from the form submission.
   */
  const handleRegistration = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    const account = await web3.eth.getAccounts(); // Get the user's account
    setAccount(account); // Set the account state
    console.log(account);

    try {
      const user = await wikichain.methods.users(account[0]).call(); // Get the user details from the smart contract
      if (!user.isRegistered) {
        // If the user is not registered, call the registerUser method in the smart contract
        const transaction = await wikichain.methods
          .registerUser(userName) // Pass the username to the registerUser method
          .send({ from: account[0], gas: 3000000 }); // Send the transaction with the user's account
        console.log(transaction);

        setTransactionStatus("Transaction successful! "); // Set the success message
        console.log(`User ${userName} registered successfully!`); // Log the successful registration
      } else {
        setIsUserRegistered(user.isRegistered); // If the user is already registered, update the state
      }
    } catch (error) {
      console.error("Error registering user:", error); // Log any errors
      setTransactionStatus("Sorry !!! Transaction failed!"); // Set the failure message
    }
  };

  // Render the component
  return (
    <div>
      {isLoading ? (
        <Loading /> // Show loading spinner while checking registration
      ) : (
        <div>
          <form
            onSubmit={handleRegistration} // Handle the form submission for registration
            className="text-center p-32 shadow-4xl m-40 text-primary"
          >
            {transactionStatus && <p>{transactionStatus}</p>}{" "}
            {/* Display transaction status */}
            {isUserRegistered ? (
              <div>
                <p className="text-primary text-5xl">
                  ✅ You are a registered user!!!
                </p>
              </div>
            ) : (
              <div>
                <label className="text-3xl">
                  <span className="text-4xl font-bold">Registration Desk</span>
                  <br />
                  <br />
                  <input
                    type="text"
                    value={userName} // Bind the input value to the state
                    onChange={(e) => setUserName(e.target.value)} // Update the state on input change
                    className="text-black border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="enter your name" // Placeholder for the username input
                  />
                </label>
                <br />
                <button
                  type="submit" // Submit the form on button click
                  className="m-5 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded"
                >
                  <span className="flex">
                    <MdLogin size={28} className="mr-2" /> {/* Login icon */}
                    Register
                  </span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default Registration; // Export the Registration component for use in other parts of the application
