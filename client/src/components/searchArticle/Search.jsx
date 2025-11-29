/**
 * Copyright © 2024-Present Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Search.jsx
 * @description A React component that facilitates searching and interacting with articles on a blockchain platform. It includes features such as searching articles by title, voting on articles, and verifying articles.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024-Present
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import React from "react";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import web3 from "../../web3"; // Web3 instance to interact with the blockchain
import wikichain from "../../wikichain"; // Instance of the Wikichain contract to interact with the blockchain
import Loading from "../Loading.jsx"; // Loading component to display while waiting for data
import ArticleTitle from "../articleTitle/ArticleTitle.jsx"; // Component to display article title

function Search() {
  // State variables to store various data needed for article search and interaction
  const [title, setTitle] = useState(""); // Title of the article being searched
  const [account, setAccount] = useState(""); // User's blockchain account address
  const [query, setQuery] = useState(""); // Stores the queried article data
  const [isQueried, setIsQueried] = useState(false); // Flag to check if the query was successful
  const [isUserRegistered, setIsUserRegistered] = useState(false); // Flag to check if the user is registered
  const [author, setAuthor] = useState(""); // Author of the article
  const [cid, setCID] = useState(""); // CID of the article for IPFS
  const [content, setContent] = useState(""); // Content of the article
  const [vote, setVote] = useState(""); // Number of votes on the article
  const [isVerified, setIsVerified] = useState(false); // Flag to check if the article is verified
  const [version, setVersion] = useState(100); // Version number of the article
  const [max, setMax] = useState(1); // Maximum version of the article
  const [time, setTime] = useState(""); // Timestamp of the article
  const [errorMsg, setErrorMessage] = useState(""); // Error message for unsuccessful operations
  const [isLoading, setIsLoading] = useState(true); // Flag to check if data is still loading
  const [user, setUser] = useState(""); // User data
  const [owner, setOwner] = useState(""); // Contract owner's address

  // useEffect hook to check user registration status when the component is mounted
  useEffect(() => {
    const checkUserRegistration = async () => {
      const account = await web3.eth.getAccounts(); // Get user's blockchain account
      const owner = await wikichain.methods.owner().call(); // Get contract owner address
      setAccount(account);
      setOwner(owner);
      try {
        const user = await wikichain.methods.users(account[0]).call(); // Get user data from the contract
        const userIsRegistered = user && user.isRegistered; // Check if the user is registered
        setUser(user); // Update state with user data
        setIsUserRegistered(userIsRegistered); // Update registration status
        setIsLoading(false); // Set loading flag to false
      } catch (error) {
        console.error("Error checking user registration:", error); // Log any error
        setIsLoading(false); // Set loading flag to false in case of error
      }
    };

    checkUserRegistration(); // Call the function to check registration
  }, [account]);

  // Function to handle article search based on the entered title
  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    const account = await web3.eth.getAccounts(); // Get user's blockchain account
    setAccount(account);

    try {
      const user = await wikichain.methods.users(account[0]).call(); // Get user data from the contract
      if (user.isRegistered) {
        // If the user is registered, search for the article
        const transaction = await wikichain.methods
          .queryArticle(title, version - 1) // Query the article by title and version
          .call();
        setAuthor(transaction[0]); // Set the article author
        setTitle(transaction[1]); // Set the article title
        setCID(transaction[2]); // Set the article CID for IPFS
        setTime(transaction[3]); // Set the timestamp of the article
        setVote(transaction[4]); // Set the number of votes for the article
        setIsVerified(transaction[5]); // Set verification status
        setVersion(parseInt(transaction[6])); // Set the article version
        setMax(transaction[6]); // Set the maximum version
        setQuery(transaction); // Store the queried article data
        setIsQueried(true); // Set queried flag to true
        setErrorMessage(""); // Clear any previous error messages

        // Fetch article content from the IPFS
        const response = await fetch(
          `http://localhost:5000/retrieve/${transaction[2]}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok"); // Handle network errors
        }
        const textData = await response.text(); // Get the article content
        setContent(textData); // Set the article content in state
      } else {
        setIsUserRegistered(false); // If the user is not registered, update the state
      }
    } catch (error) {
      // Handle errors during search operation
      if (error.message.includes("reverted")) {
        setIsQueried(false);
        setQuery("");
        setErrorMessage("⚠️ Sorry, Article not found...!"); // Article not found error
      } else {
        console.error(error); // Log any other error
        setErrorMessage("An error occurred. Please try again."); // Generic error message
      }
    }
  };

  // Function to handle voting on an article
  const handleVote = async () => {
    try {
      // Send vote transaction
      await wikichain.methods
        .voteArticle(title)
        .send({ from: account[0], gas: 3000000 });

      const transaction = await wikichain.methods
        .queryArticle(title, 100) // Query the article after voting
        .call();
      setAuthor(transaction[0]);
      setTitle(transaction[1]);
      setCID(transaction[2]);
      setTime(transaction[3]);
      setVote(transaction[4]);
      setIsVerified(transaction[5]);
      setVersion(parseInt(transaction[6]));
      setQuery(transaction); // Update state with the new transaction data
      setIsQueried(true);
      setErrorMessage(""); // Clear error messages after a successful vote

      // Fetch article content after voting
      const response = await fetch(
        `http://localhost:5000/retrieve/${transaction[2]}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const textData = await response.text(); // Get the updated article content
      setContent(textData); // Update content in state
    } catch (error) {
      // Handle errors during the vote operation
      if (error.message.includes("reverted")) {
        setIsQueried(false);
        setQuery("");
        setErrorMessage("⚠️ Sorry, You can vote only once...!"); // Error if user tries to vote again
      } else {
        console.error(error);
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  // Function to handle article verification
  const handleVerification = async () => {
    try {
      // Send verification transaction
      await wikichain.methods
        .verifyArticle(title)
        .send({ from: account[0], gas: 3000000 });

      // Fetch updated article data after verification
      const transaction = await wikichain.methods
        .queryArticle(title, 100)
        .call();
      setAuthor(transaction[0]);
      setTitle(transaction[1]);
      setCID(transaction[2]);
      setTime(transaction[3]);
      setVote(transaction[4]);
      setIsVerified(transaction[5]);
      setVersion(parseInt(transaction[6]));
      setQuery(transaction); // Update state with the new transaction data
      setIsQueried(true);
      setErrorMessage(""); // Clear error messages after successful verification

      // Fetch the content of the verified article
      const response = await fetch(
        `http://localhost:5000/retrieve/${transaction[2]}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const textData = await response.text(); // Get the article content
      setContent(textData); // Update content in state
    } catch (error) {
      // Handle errors during verification
      if (error.message.includes("reverted")) {
        setIsQueried(false);
        setQuery("");
        setErrorMessage("⚠️ Sorry, An error occurred while verifying...!");
      } else {
        console.error(error);
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading></Loading> // Show loading component while data is being fetched
      ) : (
        <div>
          <ArticleTitle></ArticleTitle> {/* Display the article title */}
          <form onSubmit={handleSearch}>
            {" "}
            {/* Handle form submission */}
            <div className="text-center p-20">
              {isUserRegistered ? ( // Check if the user is registered
                <div className="shadow-4xl mx-48 py-20">
                  <p className="text-5xl">{errorMsg}</p>{" "}
                  {/* Display error message if any */}
                  <br />
                  <label className="text-3xl text-primary font-bold">
                    Title
                  </label>
                  <br />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} // Handle title input
                    className="text-black text-3xl border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="enter the title"
                  />
                  <br />
                  <br />
                  <button
                    type="submit"
                    className="m-5 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded-md"
                  >
                    <span className="flex">
                      <FaSearch size={24} className="mr-2" />
                      Search
                    </span>
                  </button>
                  {isQueried ? ( // If article is found, display its details
                    <div>
                      {isVerified || user.isConsortiumMember ? (
                        <div>
                          {/* Article details and voting options */}
                          <div>
                            <div className="bg-white text-black border-t-2 border-b-2 border-x-2 border-gray-600 m-10 rounded-md">
                              <span className="text-5xl text-primary font-bold">
                                {query[1]}
                              </span>
                              <br />
                              <div className="flex flex-col justify-between m-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-bold">
                                    <a href="/">WikiChain.org</a>
                                  </span>
                                  <span className="text-sm">
                                    Published by: {author.slice(0, 12)}...
                                  </span>
                                </div>
                                <div className="flex justify-between mt-2">
                                  <span className="text-sm">
                                    Timestamp: {time}
                                  </span>
                                  <div>
                                    <span className="text-sm">Version:</span>
                                    <input
                                      type="number"
                                      max={max}
                                      min={1}
                                      value={isNaN(version) ? "" : version}
                                      onChange={(e) =>
                                        setVersion(parseInt(e.target.value))
                                      }
                                      className="text-black rounded-md"
                                      placeholder="enter the version"
                                    />
                                  </div>
                                </div>
                              </div>
                              <hr className="bg-black border-t-2 border-gray-600" />
                              <div className="text-3xl m-6 overflow-hidden whitespace-pre-wrap">
                                {content}
                              </div>
                            </div>
                            <div className="flex items-center justify-between m-10">
                              <button
                                className="flex bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded"
                                onClick={handleVote}
                              >
                                <FaThumbsUp size={30} />
                                <span className="ml-4 text-xl">{vote}</span>
                              </button>
                              {isVerified ? (
                                <p className="flex m-6 ml-4 bg-black text-white font-bold py-2 px-4 rounded">
                                  <FaCheckCircle
                                    size={24}
                                    style={{ color: "green" }}
                                    className="mr-2"
                                  />
                                  Verified
                                </p>
                              ) : (
                                <p className="m-6 ml-4">
                                  <span className="flex text-lg bg-black text-white font-bold py-2 px-4 rounded">
                                    <FaTimesCircle
                                      size={24}
                                      style={{ color: "red" }}
                                      className="mr-2"
                                    />
                                    Not verified
                                  </span>
                                </p>
                              )}
                            </div>
                            <div className="p-20 m-20 bg-black text-white rounded-md">
                              <div className="m-6 text-2xl text-primary">
                                {owner.toLowerCase() ===
                                account[0].toLowerCase()
                                  ? "You are the article owner. You can verify now!"
                                  : "Become the verified owner"}
                              </div>
                              {owner.toLowerCase() ===
                                account[0].toLowerCase() && (
                                <button
                                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                                  onClick={handleVerification}
                                >
                                  Verify
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="m-10">
                          {/* Show verification prompt if user is not part of the consortium */}
                          <span className="text-lg">
                            You are not yet verified. You can verify the article
                            if you are the owner.
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="m-10">
                  {/* Show registration message if user is not registered */}
                  <span className="text-lg">
                    You are not registered yet. Please register to participate.
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Search;
