/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file index.js
 * @description This file contains the server-side logic for the WikiChain project.
 *              It exposes endpoints for storing, retrieving, and checking the availability of content using Helia and IPFS.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import express from "express";
import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import { FsBlockstore } from "blockstore-fs";
import cors from "cors"; // Import the CORS middleware to enable cross-origin requests

const app = express();
const port = 5000;

// Initialize blockstore with a specific directory path
const blockstore = new FsBlockstore(
  "Replace with your desired directory path for block storage"
); // Replace with your desired directory path for block storage

// Initialize Helia instance with the blockstore
const heliaPromise = createHelia({ blockstore });

app.use(express.json()); // Middleware to parse incoming JSON requests
// app.use(cors()); // Uncomment to allow all domains (for development only)
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from frontend running on port 3000
  })
); // CORS middleware to allow requests from specific origins

/**
 * POST /store - Store content in IPFS and return its CID.
 *
 * This endpoint accepts content in the body, adds it to IPFS using Helia,
 * and returns the CID of the stored content.
 */
app.post("/store", async (req, res) => {
  const { content } = req.body; // Extract content from the request body

  const helia = await heliaPromise; // Get the Helia instance
  const fs = unixfs(helia); // Get the UnixFS instance from Helia

  const bytes = Buffer.from(content, "utf-8"); // Convert content to bytes (Buffer)
  const cid = await fs.addBytes(bytes); // Add the bytes to IPFS and get the CID
  console.log(cid); // Log the CID to the console for debugging

  res.json({ cid: cid.toString() }); // Respond with the CID as a JSON object
});

/**
 * GET /retrieve/:cid - Retrieve content from IPFS using a CID.
 *
 * This endpoint accepts a CID as a URL parameter, retrieves the corresponding content from IPFS,
 * and returns the content as a plain text response.
 */
app.get("/retrieve/:cid", async (req, res) => {
  const { cid } = req.params; // Extract the CID from the request parameters

  const helia = await heliaPromise; // Get the Helia instance
  const fs = unixfs(helia); // Get the UnixFS instance from Helia

  const decoder = new TextDecoder(); // Create a TextDecoder to decode the content
  let text = ""; // Initialize a variable to store the retrieved content

  try {
    // Retrieve content for the given CID from IPFS in chunks
    for await (const chunk of fs.cat(cid)) {
      text += decoder.decode(chunk, { stream: true }); // Decode each chunk and append it to text
    }
    res.send(text); // Respond with the retrieved content
  } catch (error) {
    console.log(`Error retrieving data for CID "${cid}":`, error); // Log any errors to the console
    res.status(500).send("Error retrieving data"); // Respond with an error status
  }
});

/**
 * POST /checkAvailability - Check the availability of multiple CIDs.
 *
 * This endpoint accepts an array of CIDs, checks whether each CID exists in IPFS,
 * and returns a list of missing CIDs.
 */
app.post("/checkAvailability", async (req, res) => {
  const { cids } = req.body; // Extract the list of CIDs from the request body

  // Validate that the 'cids' input is an array
  if (!cids || !Array.isArray(cids)) {
    return res
      .status(400)
      .json({ error: "Invalid input: 'cids' must be an array." });
  }

  const helia = await heliaPromise; // Get the Helia instance
  const fs = unixfs(helia); // Get the UnixFS instance from Helia

  try {
    // Check the availability of each CID in the provided list
    const missingCids = await Promise.all(
      cids.map(async (cid) => {
        try {
          let text = "";
          const decoder = new TextDecoder();

          // Attempt to retrieve content for each CID
          for await (const chunk of fs.cat(cid)) {
            text += decoder.decode(chunk, { stream: true }); // Decode content chunks
          }

          // If no content is retrieved, consider the CID as missing
          if (!text) {
            return cid;
          }

          return null; // CID is available, return null
        } catch (error) {
          // If an error occurs, consider the CID as missing
          return cid;
        }
      })
    );

    // Filter out null values (available CIDs) and send only missing CIDs
    res.json({ missingCids: missingCids.filter((cid) => cid !== null) });
  } catch (error) {
    console.log("Error checking availability:", error); // Log errors to the console
    res.status(500).send("Error checking availability"); // Respond with an error status
  }
});

// Start the Express server on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Log the server start message
});
