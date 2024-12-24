/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file wikichain.js
 * @description This file sets up and exports an Ethereum smart contract instance using Web3.js.
 *              It initializes the contract with the specified ABI and contract address to interact with.
 *              The contract provides functionalities for publishing, querying, and voting on articles,
 *              along with user registration and consortium management.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import web3 from "./web3"; // Import the Web3 instance to interact with the Ethereum blockchain

// Contract address deployed on the Ethereum network
const address = "Change to your contract address";

// ABI (Application Binary Interface) of the smart contract
const abi = [
  // Contract ABI definitions go here...
  // The contract contains methods like addToConsortium, publishArticle, updateArticle, etc.
  // These methods are used to interact with the smart contract deployed at the specified address
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
    signature: "constructor",
  },
  {
    inputs: [],
    name: "addToConsortium",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x84457e38",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "allArticleCIDs",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0xe917ec7f",
  },
  {
    inputs: [],
    name: "articleCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x414e28b0",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "articlesByCid",
    outputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "address", name: "author", type: "address" },
      { internalType: "uint256", name: "votes", type: "uint256" },
      { internalType: "bool", name: "isVerified", type: "bool" },
      { internalType: "uint256", name: "elGamalSignature", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x17e1e280",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "articlesByTitle",
    outputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "address", name: "author", type: "address" },
      { internalType: "uint256", name: "votes", type: "uint256" },
      { internalType: "bool", name: "isVerified", type: "bool" },
      { internalType: "uint256", name: "elGamalSignature", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x58812930",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "consortiumMembers",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x1f49f6ed",
  },
  {
    inputs: [{ internalType: "string[]", name: "cids", type: "string[]" }],
    name: "deleteArticlesByCIDs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xeefca44e",
  },
  {
    inputs: [],
    name: "getAllArticleCIDs",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x6f6eae2f",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x8da5cb5b",
  },
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "cid", type: "string" },
    ],
    name: "publishArticle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x95961f05",
  },
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "uint256", name: "versionIndex", type: "uint256" },
    ],
    name: "queryArticle",
    outputs: [
      { internalType: "address", name: "author", type: "address" },
      { internalType: "string", name: "retrievedTitle", type: "string" },
      { internalType: "string", name: "cid", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "uint256", name: "votes", type: "uint256" },
      { internalType: "bool", name: "isVerified", type: "bool" },
      { internalType: "uint256", name: "versionNumber", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0xea23c031",
  },
  {
    inputs: [{ internalType: "string", name: "username", type: "string" }],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x704f1b94",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "registeredUsers",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x7259e0f8",
  },
  {
    inputs: [],
    name: "threshold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x42cde4e8",
  },
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "newCid", type: "string" },
    ],
    name: "updateArticle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x8f79e4f4",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "string", name: "username", type: "string" },
      { internalType: "bool", name: "isRegistered", type: "bool" },
      { internalType: "uint256", name: "performanceScore", type: "uint256" },
      { internalType: "bool", name: "isConsortiumMember", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0xa87430ba",
  },
  {
    inputs: [{ internalType: "string", name: "title", type: "string" }],
    name: "verifyArticle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x2b40c794",
  },
  {
    inputs: [{ internalType: "string", name: "title", type: "string" }],
    name: "voteArticle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x834d61ec",
  },
];

// Export a new contract instance with the specified ABI and address
export default new web3.eth.Contract(abi, address);
