/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file web3.js
 * @description This file initializes and exports a Web3 instance connected to the user's Ethereum provider
 *              via MetaMask. It also requests access to the user's Ethereum accounts.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import Web3 from "web3"; // Import the Web3 library for interacting with the Ethereum blockchain

// Request access to the user's Ethereum accounts through MetaMask
window.ethereum.request({ method: "eth_requestAccounts" });

// Create a new Web3 instance connected to the user's Ethereum provider (MetaMask)
const web3 = new Web3(window.ethereum);

// Export the Web3 instance for use in other parts of the application
export default web3;
