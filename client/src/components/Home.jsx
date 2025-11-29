/**
 *  * Copyright © 2024-Present Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file Home.jsx
 * @description Source code for the Home component of the WikiChain application.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024-Present
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */
import React from "react";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa"; // Importing search icon from react-icons
import Loading from "./Loading.jsx"; // Component to display a loading spinner
import web3 from "../web3.js"; // Web3 instance for Ethereum blockchain interaction
import wikichain from "../wikichain.js"; // Smart contract instance for WikiChain

/**
 * Home Component
 * @description Renders the home page of the WikiChain application with features like
 *              MetaMask connectivity, service options, and an overview of WikiChain.
 */
function Home() {
  // State to store the connected MetaMask account
  const [connectedAccount, setConnectedAccount] = useState("");

  // State to store the user's Ethereum account
  const [account, setAccount] = useState("");

  // State to handle loading spinner
  const [isLoading, setIsLoading] = useState(true);

  // State to store the owner address from the smart contract
  const [owner, setOwner] = useState("");

  // useEffect for fetching the smart contract owner and managing loading state
  useEffect(() => {
    const callOwner = async () => {
      // Fetch owner address from the smart contract
      const owner = await wikichain.methods.owner().call();
      // Fetch current Ethereum accounts
      const account = await web3.eth.getAccounts();
      setAccount(account[0]);
      setOwner(owner);
    };

    // Simulate a delay for loading spinner
    const delay = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Cleanup timeout and fetch owner on component unmount
    return () => {
      clearTimeout(delay);
      callOwner();
    };
  }, []);

  /**
   * Connects to MetaMask
   * @description Allows the user to connect their MetaMask wallet and fetch their Ethereum account.
   */
  const connectToMetaMask = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          // Set the first account in the MetaMask wallet
          setConnectedAccount(accounts[0].slice(0, 12));
        })
        .catch((error) => {
          console.error("MetaMask connection error:", error);
        });
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading /> // Show loading spinner during the initial delay
      ) : (
        <div className="p-20">
          {/* Header Section */}
          <div className="max-w-6xl mx-auto mt-10 p-6 shadow-4xl rounded text-justify flex flex-col items-center">
            <h2 className="text-7xl mb-4 text-black text-center font-poppins">
              W<span className="text-5xl">ikiChai</span>N
            </h2>
            <img src="wikilogo.png" alt="Wikichain Logo" className="my-4" />
            <div className="flex p-10">
              <input
                className="text-2xl font-poppins text-black border border-gray-700 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                size={22}
                value={" The Free Encyclopaedia... "}
                disabled
              ></input>
              <button className="ml-3 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded-md text-lg">
                <span className="flex">
                  <FaSearch size={24} className="mr-2" />
                  Search
                </span>
              </button>
            </div>
            <p className="mb-4 text-xl">
              {/* Description of WikiChain */}
              WikiChain represents a revolutionary shift in knowledge-sharing
              platforms, embracing decentralization on the Ethereum blockchain
              and IPFS. This departure from centralization ensures censorship
              resistance, transparency, and inclusivity in collaborative
              knowledge creation.
            </p>
          </div>

          {/* Service Section */}
          <div className="max-w-6xl mx-auto mt-10 p-6 shadow-4xl rounded text-justify">
            <h2 className="text-3xl font-bold mb-4 text-primary">
              Services provided by WikiChain
            </h2>
            <br />
            <p className="mb-4">
              <div className="grid grid-cols-5 gap-4 text-center">
                {/* Links to various WikiChain services */}
                <div className="p-4 rounded shadow-4xl hover:shadow-md">
                  <a href="/publish">Publish Articles</a>
                </div>
                <div className="p-4 rounded shadow-4xl hover:shadow-md">
                  <a href="/search">Search Articles</a>
                </div>
                <div className="p-4 rounded shadow-4xl hover:shadow-md">
                  <a href="/search">Vote Articles</a>
                </div>
                <div className="p-4 rounded shadow-4xl hover:shadow-md">
                  <a href="/search">Verify Articles</a>
                </div>
                <div className="p-4 rounded shadow-4xl hover:shadow-md">
                  <a href="/update">Update Articles</a>
                </div>
              </div>
            </p>
          </div>

          {/* MetaMask Connectivity Section */}
          <div className="fixed left-0 bottom-0 text-center p-4">
            {connectedAccount ? (
              <p className="bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded">
                Connected account: {connectedAccount}...
              </p>
            ) : (
              <button
                onClick={connectToMetaMask}
                className="flex bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded"
              >
                Connect to MetaMask
              </button>
            )}
          </div>

          {/* Consortium Management Section */}
          {owner === account ? (
            <a href="/consortium">
              <div className="fixed right-0 bottom-0 text-center p-4">
                <button className="flex bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded">
                  Manage Consortium
                </button>
              </div>
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Home;
