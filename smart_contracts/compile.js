/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file compile.js
 * @description This script compiles the WikiChain Solidity contract using the Solidity compiler (solc).
 *              It reads the contract file, processes the Solidity source, and returns the compiled contract.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

const path = require("path"); // Node.js module to handle and transform file paths
const fs = require("fs"); // Node.js module to interact with the file system
const solc = require("solc"); // Solidity compiler library to compile Solidity code

// Resolving the path to the WikiChain contract file located in the "contracts" directory
const wikiPath = path.resolve(__dirname, "contracts", "WikiChain.sol");

// Reading the content of the WikiChain.sol contract file as a string (UTF-8 encoding)
const source = fs.readFileSync(wikiPath, "utf8");

// Defining the input configuration for the Solidity compiler (solc)
// This configuration specifies the contract's source file and the output format for the compiled code
const input = {
  language: "Solidity", // Specifies that the code is written in Solidity
  sources: {
    "WikiChain.sol": {
      // The key "WikiChain.sol" represents the contract file
      content: source, // The content of the contract is the source code read from the file
    },
  },
  settings: {
    outputSelection: {
      // This specifies that the compiler should output all available information for all files and all contracts
      "*": {
        "*": ["*"], // Selecting all outputs (e.g., ABI, bytecode, etc.)
      },
    },
  },
};

// Compiling the contract using the solc compiler and parsing the result into a usable JavaScript object
// The compiled contract is then exported from this module for use in other parts of the application
module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  "WikiChain.sol"
].WikiChain;
