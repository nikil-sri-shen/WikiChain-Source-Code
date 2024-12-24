/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file deploy.js
 * @description This script is used to deploy the compiled contract to a blockchain network using Web3.js and HDWalletProvider.
 *              It connects to the network, gets accounts, and deploys the contract using the ABI and bytecode obtained from
 *              the compile process.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

const HDWalletProvider = require("@truffle/hdwallet-provider"); // Importing HDWalletProvider for managing Ethereum accounts
const Web3 = require("web3"); // Importing Web3.js library for interacting with Ethereum
const { abi, evm } = require("./compile"); // Importing the ABI and bytecode (EVM) of the compiled contract from 'compile.js'

// Creating an instance of HDWalletProvider to manage wallet with a mnemonic phrase and an Ethereum endpoint URL
const provider = new HDWalletProvider(
  "remember to change this to your own phrase!", // Replace with your own mnemonic phrase
  "remember to change this to your own endpoint!" // Replace with your own Ethereum network endpoint (e.g., Infura)
);

// Creating an instance of Web3 with the provider
const web3 = new Web3(provider);

/**
 * deploy function deploys the compiled contract to the blockchain.
 * It gets the list of accounts, attempts deployment from the first account, and logs relevant information.
 */
const deploy = async () => {
  try {
    // Fetching Ethereum accounts available from the wallet provider
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account", accounts[0]); // Logging the account being used for deployment
    console.log(await web3.eth.getBalance(accounts[0])); // Logging the balance of the deploying account

    // Deploying the contract to the Ethereum network
    const result = await new web3.eth.Contract(abi) // Creating a contract instance with the ABI
      .deploy({
        data: evm.bytecode.object, // Passing the bytecode of the contract for deployment
      })
      .send({ gas: "10000000", from: accounts[0] }); // Sending the deployment transaction with a specified gas limit

    // Logging the ABI and the deployed contract's address
    console.log(JSON.stringify(abi));
    console.log(" ");
    console.log("Contract deployed at", result.options.address);

    // Stopping the provider engine after deployment
    provider.engine.stop();
  } catch (err) {
    // Catching and logging any errors during deployment
    console.log(err);
  }
};

// Calling the deploy function to execute the contract deployment
deploy();
