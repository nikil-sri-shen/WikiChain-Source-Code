/**
 * Copyright © 2024-Present Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Consortium.jsx
 * @description This React component manages the logic for a consortium-based system within a blockchain.
 *              It checks user registration status, allows consortium validation, and handles the Proof-of-Existence
 *              (POE) and Dynamic Consortium Membership Designation (DCMD) algorithms.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024-Present
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import React, { useState, useEffect } from "react";
import web3 from "../../web3.js"; // Import Web3 instance for blockchain interaction
import wikichain from "../../wikichain.js"; // Import the contract instance for interacting with smart contracts
import Loading from "../Loading.jsx"; // Import Loading component to show loading status

function Consortium() {
  const [account, setAccount] = useState(""); // State to store the current user's Ethereum account address
  const [transactionStatus, setTransactionStatus] = useState(""); // State to store transaction status
  const [isUserRegistered, setIsUserRegistered] = useState(false); // State to track if the user is registered
  const [isLoading, setIsLoading] = useState(true); // State to handle loading state
  const [isConsortium, setIsConsortium] = useState(true); // State to track if the user is part of the consortium
  const [owner, setOwner] = useState(""); // State to store the consortium owner address
  const [error, setError] = useState(""); // State to store errors encountered during operations
  const [allArticleCIDs, setAllArticleCIDs] = useState([]); // State to store all article CIDs
  const [missingCIDs, setMissingCIDs] = useState([]); // State to store missing article CIDs

  // Effect hook to check user registration status when the component mounts
  useEffect(() => {
    const checkUserRegistration = async () => {
      const account = await web3.eth.getAccounts();
      setAccount(account[0]); // Set the user's account address
      try {
        const user = await wikichain.methods.users(account[0]).call(); // Call the smart contract for user info
        const owner = await wikichain.methods.owner().call(); // Get the consortium owner address
        const userIsRegistered = user && user.isRegistered; // Check if the user is registered

        // Update state based on contract response
        setOwner(owner);
        setIsConsortium(user.isConsortium);
        setIsUserRegistered(userIsRegistered);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking user registration:", error); // Log error in case of failure
        setIsLoading(false);
      }
    };

    // Call function to check user registration
    checkUserRegistration();
  }, [account]);

  // Handle consortium formation and validation
  const handleConsortium = async (e) => {
    e.preventDefault();
    const account = await web3.eth.getAccounts();
    setAccount(account); // Set the user's account

    try {
      const user = await wikichain.methods.users(account[0]).call(); // Retrieve user information
      if (account[0] === owner || user.isConsortium) {
        // If user is the owner or already part of the consortium, allow consortium modification
        const transaction = await wikichain.methods
          .addToConsortium()
          .send({ from: account[0], gas: 3000000 }); // Call smart contract method to add to consortium
        console.log(transaction);

        setTransactionStatus("Consortium formed successfully! "); // Display transaction success
      } else {
        setIsUserRegistered(user.isRegistered); // If user is not a consortium member, update registration status
      }
    } catch (error) {
      console.error("Error registering user:", error.message); // Log errors if any
      setTransactionStatus("Sorry !!! Transaction failed!"); // Show transaction failure message
    }
  };

  // Handle the check for missing article CIDs (Proof-of-Existence algorithm)
  const handleCids = async () => {
    setIsLoading(true); // Set loading state
    setError(null); // Reset any previous errors

    try {
      const cids = await wikichain.methods.getAllArticleCIDs().call(); // Fetch all article CIDs from smart contract
      setAllArticleCIDs(cids); // Set CIDs in the state
      console.log(cids);

      const response = await fetch("http://localhost:5000/checkAvailability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cids }), // Send CIDs to backend to check availability
      });

      if (!response.ok) {
        throw new Error("Error fetching missing CIDs"); // Throw error if the response is not ok
      }

      const data = await response.json();
      setMissingCIDs(data.missingCids); // Set missing CIDs in state
      console.log(data.missingCids);
    } catch (error) {
      console.error("Error fetching or checking CIDs:", error); // Log error if fetch or CID check fails
      setError(error.message); // Set error state with the error message
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading></Loading> // Show loading component while fetching data
      ) : (
        <div>
          {isUserRegistered ? (
            <div>
              {isConsortium || owner === account ? (
                <div>
                  <div className="text-center p-32 shadow-4xl m-40 text-primary">
                    <div>
                      {transactionStatus}
                      <p className="text-3xl">
                        You are a Validator, You can change the consortium
                        Members using the below algorithm "Dynamic Consortium
                        Membership Designation (DCMD)".
                      </p>
                      <button
                        className="m-5 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded"
                        onClick={handleConsortium}
                      >
                        DCMD
                      </button>
                    </div>
                    <div>
                      <p className="text-3xl">
                        You are a Validator, You can check whether the articles
                        present using the below algorithm
                        "Proof-of-Existence(POE)".
                      </p>
                      <button
                        className="m-5 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded"
                        onClick={handleCids}
                      >
                        POE
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center text-5xl p-32 shadow-4xl m-40 text-primary">
                    <p>⚠️ You are not a Validator, Entry is restricted!</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-48 text-center justify-center">
              <p className="text-primary text-5xl">
                ⚠️ You are not a registered User!!!
              </p>
              <br></br>
              <p className="text-3xl text-quaternary">
                Please Register here 👇🏼:
              </p>
              <br></br>
              <a href="/registration" className="text-3xl text-quaternary">
                Click Here
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Consortium;
