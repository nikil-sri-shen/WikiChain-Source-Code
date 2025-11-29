/**
 * Copyright © 2024-Present Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Publish.jsx
 * @description React component for publishing articles, with integration to blockchain for storing article CID and publishing via smart contract.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024-Present
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import React from "react";
import { useState, useEffect } from "react";
import web3 from "../../web3.js"; // Import the web3 instance to interact with Ethereum
import wikichain from "../../wikichain.js"; // Import the smart contract instance for interacting with the blockchain
import { IoMdCreate } from "react-icons/io"; // Import an icon for the publish button
import Loading from "../Loading.jsx"; // Import a Loading component to display while waiting for asynchronous operations

function Publish() {
  // State variables to manage the input fields, user status, and blockchain interaction
  const [content, setContent] = useState(""); // Holds the content of the article being published
  const [title, setTitle] = useState(""); // Holds the title of the article
  const [isUserRegistered, setIsUserRegistered] = useState(false); // Tracks whether the user is registered in the smart contract
  const [account, setAccount] = useState(""); // Stores the user's Ethereum account address
  const [transactionStatus, setTransactionStatus] = useState(""); // Stores the status of the blockchain transaction
  const [isLoading, setIsLoading] = useState(true); // Flag to indicate whether the page is still loading or not
  const [errMsg, setErrorMessage] = useState(""); // Stores any error messages that might occur during the process
  const [owner, setOwner] = useState(""); // Stores the address of the contract owner
  const [cid, setCID] = useState(""); // Stores the content identifier (CID) of the article
  const [user, setUser] = useState(""); // Stores the user's data fetched from the smart contract

  // useEffect hook to check the user's registration and Ethereum account details when the component mounts
  useEffect(() => {
    const checkUserRegistration = async () => {
      try {
        // Fetch the user's Ethereum account address
        const account = await web3.eth.getAccounts();
        // Fetch the contract owner's address
        const owner = await wikichain.methods.owner().call();
        setAccount(account[0]);
        setOwner(owner);

        // Attempt to fetch the user data from the smart contract
        const user = await wikichain.methods.users(account[0]).call();
        // Check if the user is registered based on the smart contract logic
        const userIsRegistered = user && user.isRegistered;
        setUser(user); // Store the user data
        setIsUserRegistered(userIsRegistered); // Update the user registration status
        setIsLoading(false); // Set the loading flag to false after the check is complete
      } catch (error) {
        // Handle errors that may occur during the process, e.g., contract interaction or network issues
        console.error("Error checking user registration:", error);
        setIsLoading(false); // Set the loading flag to false even if an error occurs
      }
    };

    // Call the checkUserRegistration function when the component mounts
    checkUserRegistration();
  }, [account]); // Dependency on 'account' ensures the hook runs when the account changes

  // Function to handle the publishing of the article
  const handlePublish = async () => {
    try {
      // Send the article content to the backend server (presumably to be stored on IPFS or another decentralized storage)
      const response = await fetch("http://localhost:5000/store", {
        method: "POST", // Use POST method to send data
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify({ content }), // Send the content as a JSON object
      });

      // Check if the response from the backend server is successful
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Parse the response to retrieve the CID (Content Identifier) for the article
      const id = await response.json();
      setCID(id.cid); // Store the CID in the state
      console.log(id.cid); // Log the CID for debugging purposes

      // Get the user's Ethereum account address
      const account = await web3.eth.getAccounts();

      // Call the smart contract to publish the article by passing the title and CID
      const transaction = await wikichain.methods
        .publishArticle(title, id.cid) // Pass the article title and CID to the smart contract method
        .send({
          from: account[0], // Specify the sender's Ethereum account
          gas: 3000000, // Set the gas limit for the transaction
        });

      console.log(transaction); // Log the transaction details for debugging purposes
      setTransactionStatus("Transaction successful!!!"); // Update the UI with a success message
    } catch (error) {
      // Handle any errors that might occur during the article publishing process
      if (error.message.includes("reverted")) {
        setErrorMessage("⚠️ Sorry, Article already exists...!"); // Show an error if the article already exists in the contract
      } else {
        // Handle other errors and display a generic error message
        console.error(error);
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  // Render the component
  return (
    <div className="text-center p-6 text-quaternary">
      {isLoading ? (
        // If the component is still loading, display the Loading component
        <Loading />
      ) : (
        <div className="shadow-4xl m-28">
          {/* Display any error message */}
          {errMsg && <p className="text-5xl p-10">{errMsg}</p>}
          {/* Display transaction status */}
          {transactionStatus && <p>{transactionStatus}</p>}

          {/* Check if the user is registered and display the appropriate UI */}
          {isUserRegistered ? (
            <div>
              <h2 className="text-4xl font-bold text-primary pt-4">
                Publish Article
              </h2>
              <br />
              <label className="text-2xl font-bold text-primary">Title</label>
              <br />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)} // Update title state when input changes
                className="text-black border border-gray-700 rounded-md focus:outline-none focus:border-blue-500 text-2xl mt-4"
                placeholder="Enter the title"
              />
              <br />
              <br />
              <label className="text-2xl font-bold text-primary">Content</label>
              <br />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update content state when textarea changes
                className="text-black border border-gray-700 rounded-md focus:outline-none focus:border-blue-500 text-2xl mt-4"
                cols={50}
                rows={15}
                placeholder="Enter the content"
              />
              <br />
              {/* Button to trigger article publishing */}
              <button
                onClick={handlePublish}
                className="m-5 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded"
              >
                <span className="flex">
                  <IoMdCreate size={24} className="mr-2" />
                  Publish
                </span>
              </button>

              {/* Conditionally render the "Manage Consortium" button if the user is the owner or a consortium member */}
              {owner === account || user.isConsortiumMember ? (
                <a href="/consortium">
                  <div className="fixed right-0 bottom-0 text-center p-4">
                    <button className="flex bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded">
                      Manage Consortium
                    </button>
                  </div>
                </a>
              ) : (
                <div></div>
              )}
            </div>
          ) : (
            // If the user is not registered, display a message with a registration link
            <div className="py-48 text-center justify-center">
              <p className="text-primary text-5xl">
                ⚠️ You are not a registered User!!!
              </p>
              <br />
              <p className="text-3xl text-quaternary">
                Please Register here 👇🏼:
              </p>
              <br />
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

export default Publish;
