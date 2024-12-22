/**
 * @file Navbar.jsx
 * @description Source code for the Navbar component of the WikiChain application.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */
import React from "react";
import { useState, useEffect } from "react";
// Importing icons from the react-icons library
import { MdUpdate } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { IoMdCreate } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { FaStar } from "react-icons/fa6";
// Importing blockchain-related dependencies
import wikichain from "../wikichain";
import web3 from "../web3.js";

/**
 * Navbar Component
 * @description Displays the navigation bar for the WikiChain application. Includes links to various
 *              application features and displays user-specific information such as account details,
 *              username, and performance score.
 * @returns {JSX.Element} The rendered Navbar component.
 */
function Navbar() {
  // State variables to store user-related data
  const [account, setAccount] = useState("Not Connected");
  const [score, setScore] = useState("");
  const [error, setError] = useState(null);
  const [shortendAccount, setShortendAccount] = useState("");
  const [name, setName] = useState("");

  // useEffect hook to fetch user account and data when the component is mounted
  useEffect(() => {
    const checkUserRegistration = async () => {
      try {
        // Fetch connected Ethereum accounts
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0] || "Not Connected";

        // Update state with the fetched account
        setAccount(currentAccount);
        const user = await wikichain.methods.users(currentAccount).call();
        setScore(user.performanceScore); // Fetch and set user performance score
        setName(user.username); // Fetch and set username

        // If the account is connected, shorten it for display
        if (currentAccount !== "Not Connected") {
          const short = currentAccount.slice(0, 12);
          setShortendAccount(short);
        } else {
          setShortendAccount("");
        }
      } catch (error) {
        setError(error); // Handle any errors during the API call
        console.error("Error fetching account:", error.message);
      }
    };

    checkUserRegistration();
  }, []);

  return (
    <div className="fixed p-3 top-0 left-0 right-0 z-100 backdrop-blur-md bg-opacity-30 navbar">
      {/* Navigation bar with links */}
      <ul className="flex">
        <li className="mr-20 text-3xl">
          <a href="/">
            WikiChain.<span className="text-sm">org</span>
          </a>
        </li>
        <li className="mr-10 text-xl flex">
          <a href="/registration" className="flex">
            <MdLogin size={28} className="mr-2" />
            User Registration
          </a>
        </li>
        <li className="mr-10 text-xl flex">
          <a href="/publish" className="flex">
            <IoMdCreate size={24} className="mr-2" />
            Publish Article
          </a>
        </li>
        <li className="mr-6 text-xl flex">
          <a href="/search" className="flex">
            <FaSearch size={24} className="mr-2" />
            Search Article
          </a>
        </li>
        <li className="mr-6 text-xl flex">
          <a href="/update" className="flex">
            <MdUpdate size={28} className="mr-2" />
            Update Articles
          </a>
        </li>
        <li className="mr-6 text-xl flex">
          <a href="/" className="flex">
            <FaUser size={24} className="mr-2" />
            <span className="truncate">{shortendAccount}...</span>
          </a>
        </li>
        <li className="mr-6 text-xl flex">
          <a href="/" className="flex">
            <FaStar size={24} className="mr-2" />
            Your Score {score}
          </a>
        </li>
      </ul>
      {/* Display username */}
      <p className="text-2xl text-center font-bold mt-2 text-primary">
        Welcome, {name}...
      </p>
    </div>
  );
}

export default Navbar;
