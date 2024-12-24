/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Update.jsx
 * @description This component allows users to update articles by verifying their registration and checking article details.
 *              Users can search for articles by title, update article content, and verify their status.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import React, { useState, useEffect } from "react"; // Import necessary hooks from React
import { FaSearch } from "react-icons/fa"; // Icon for search button
import { IoMdCreate } from "react-icons/io"; // Icon for create/update button
import web3 from "../../web3"; // Web3 instance to interact with blockchain
import wikichain from "../../wikichain"; // WikiChain smart contract instance
import Loading from "../Loading.jsx"; // Loading component to display loading state
import ArticleTitle from "../articleTitle/ArticleTitle.jsx"; // Component to display article title

function Update() {
  // States to manage various values in the component
  const [title, setTitle] = useState(""); // Article title input state
  const [account, setAccount] = useState(""); // Ethereum account of the user
  const [query, setQuery] = useState(""); // State to store the query result from the blockchain
  const [isQueried, setIsQueried] = useState(false); // State to track if the article has been queried
  const [isUserRegistered, setIsUserRegistered] = useState(false); // State to track if the user is registered
  const [isVerified, setIsVerified] = useState(false); // State to track if the article is verified
  const [author, setAuthor] = useState(""); // State to store article author
  const [cid, setCID] = useState(""); // State to store the content identifier (CID)
  const [content, setContent] = useState(""); // State to store the content of the article
  const [version, setVersion] = useState(100); // State to store article version
  const [time, setTime] = useState(""); // State to store the article's timestamp
  const [transactionStatus, setTransactionStatus] = useState(""); // State to store transaction status
  const [errorMsg, setErrorMessage] = useState(""); // State to store error messages
  const [isLoading, setIsLoading] = useState(true); // State to track loading state
  const [onUpdate, setOnUpdate] = useState(false); // State to track if the article is being updated
  const [user, setUser] = useState(""); // State to store user data

  // useEffect hook to check if the user is registered when the component mounts
  useEffect(() => {
    const checkUserRegistration = async () => {
      const account = await web3.eth.getAccounts(); // Get user's Ethereum account
      setAccount(account); // Set account state

      try {
        const user = await wikichain.methods.users(account[0]).call(); // Get user details from the contract
        const userIsRegistered = user && user.isRegistered; // Check if the user is registered
        setUser(user); // Store user data
        setIsUserRegistered(userIsRegistered); // Set registration status
        setIsLoading(false); // Set loading state to false once data is fetched
      } catch (error) {
        console.error("Error checking user registration:", error); // Log any error
        setIsLoading(false); // Set loading state to false if error occurs
      }
    };

    checkUserRegistration(); // Call the function to check user registration
  }, [account]); // Dependency on account to trigger this effect

  // Handle article search based on the title entered by the user
  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const account = await web3.eth.getAccounts(); // Get the user's Ethereum account
    setAccount(account); // Update account state

    try {
      const user = await wikichain.methods.users(account[0]).call(); // Get user data from the contract
      if (user.isRegistered) {
        // If the user is registered, proceed with querying the article
        const transaction = await wikichain.methods
          .queryArticle(title, 100) // Query article from the contract
          .call();
        // Extract article details from the transaction
        setAuthor(transaction[0]);
        setTitle(transaction[1]);
        setCID(transaction[2]);
        setTime(transaction[3]);
        setIsVerified(transaction[5]);
        setVersion(parseInt(transaction[6]));
        setQuery(transaction); // Store the full transaction data
        setIsQueried(true); // Mark that the article has been queried
        setErrorMessage(""); // Reset error message

        // Fetch article content from backend using the CID
        const response = await fetch(
          `http://localhost:5000/retrieve/${transaction[2]}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const textData = await response.text(); // Get the article content as text
        setContent(textData); // Store the content
      } else {
        setIsUserRegistered(!user.isRegistered); // Set registration status
      }
    } catch (error) {
      // Handle errors during search
      if (error.message.includes("reverted")) {
        setIsQueried(false);
        setQuery(""); // Reset query state
        setErrorMessage("⚠️ Sorry, Article not found...!"); // Show error message
      } else {
        console.error(error);
        setErrorMessage("An error occurred. Please try again."); // Show general error message
      }
    }
  };

  // Handle updating article content
  const handleUpdate = async () => {
    try {
      setOnUpdate(true); // Set update state to true

      // Send updated content to the backend for storage
      const response = await fetch("http://localhost:5000/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const id = await response.json(); // Get new CID from the backend response
      setCID(id.cid); // Set new CID

      // Update the article on the blockchain with the new content CID
      const updateTransaction = await wikichain.methods
        .updateArticle(title, id.cid)
        .send({ from: account[0], gas: 3000000 });

      // Query the updated article from the blockchain
      const transaction = await wikichain.methods
        .queryArticle(title, 100)
        .call();
      setAuthor(transaction[0]);
      setTitle(transaction[1]);
      setCID(transaction[2]);
      setTime(transaction[3]);
      setVersion(parseInt(transaction[6]));
      setQuery(transaction);
      setIsQueried(true); // Mark article as updated
      setErrorMessage(""); // Reset error message

      // Fetch the updated article content from backend
      const response2 = await fetch(
        `http://localhost:5000/retrieve/${transaction[2]}`
      );

      if (!response2.ok) {
        throw new Error("Network response was not ok");
      }

      const textData = await response2.text(); // Get updated content
      setContent(textData); // Store the updated content

      setOnUpdate(false); // Set update state to false
      setTransactionStatus("Updation successful!!!"); // Set success message
    } catch (error) {
      // Handle errors during update
      if (error.message.includes("reverted")) {
        setIsQueried(false);
        setQuery(""); // Reset query state
        setErrorMessage("⚠️ Sorry, An error occurred in updation...!"); // Show error message
      } else {
        console.error(error);
        setErrorMessage("An error occurred. Please try again."); // Show general error message
      }
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading /> // Display loading component while data is being fetched
      ) : (
        <div>
          <ArticleTitle /> {/* Display article title */}
          <form onSubmit={handleSearch}>
            <div className="text-center p-20">
              {isUserRegistered ? (
                <div className="shadow-4xl mx-48 py-20">
                  <p className="text-5xl">{errorMsg}</p>
                  <p>{transactionStatus}</p>
                  <br />
                  <label className="text-3xl text-primary font-bold">
                    Title
                  </label>
                  <br />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} // Handle title input change
                    className="text-black text-3xl border border-gray-700 rounded-md"
                    placeholder="enter the title"
                  />
                  <button
                    type="submit"
                    className="m-5 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded-md"
                  >
                    <FaSearch size={24} className="mr-2" />
                    Search
                  </button>
                  {isQueried ? (
                    <div>
                      {isVerified || user.isConsortiumMember ? (
                        <div className="bg-white text-black border-t-2 border-b-2 border-x-2 border-gray-600 m-10 rounded-md">
                          <span className="text-5xl text-primary font-bold">
                            {query[1]}
                          </span>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm">Timestamp: {time}</span>
                            <span className="text-sm">Version: {version}</span>
                          </div>
                          <div className="text-3xl m-6 overflow-hidden">
                            <textarea
                              value={content}
                              onChange={(e) => setContent(e.target.value)} // Handle content input change
                              className="text-black text-3xl w-full"
                              rows={15}
                              placeholder="Enter the content"
                            />
                            <button
                              onClick={handleUpdate} // Trigger handleUpdate function on click
                              className="bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded-md flex items-center"
                            >
                              <IoMdCreate size={24} className="mr-2" />
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-primary text-5xl">
                          ⚠️ Article is under Verification!!!
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="py-48 text-center">
                  <p className="text-primary text-5xl">
                    ⚠️ You are not a registered User!!!
                  </p>
                  <p className="text-3xl text-quaternary">
                    Please Register here 👇🏼:
                  </p>
                  <a href="/registration" className="text-3xl text-quaternary">
                    Click Here
                  </a>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Update;
