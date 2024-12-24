/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file ArticleTitle.jsx
 * @description This React component retrieves and displays a list of article titles from a smart contract
 *              using Web3.js. It fetches article CIDs (Content Identifiers) from the blockchain and then
 *              retrieves the corresponding titles for each CID. The component renders a styled list of titles.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

import React, { useState, useEffect } from "react";
import wikichain from "../../wikichain"; // Import the Web3 contract instance to interact with the blockchain

const ArticleTitle = () => {
  const [articleCIDs, setArticleCIDs] = useState([]); // State to hold the list of article CIDs (Content Identifiers)
  const [articleTitles, setArticleTitles] = useState([]); // State to hold the list of article titles

  // Fetch the list of article CIDs when the component mounts
  useEffect(() => {
    const fetchArticleCIDs = async () => {
      try {
        // Call the smart contract method to get all article CIDs
        const cids = await wikichain.methods.getAllArticleCIDs().call();
        setArticleCIDs(cids); // Set the article CIDs in the state
      } catch (error) {
        console.error("Error fetching article CIDs:", error);
      }
    };

    fetchArticleCIDs();
  });

  // Fetch the article titles when article CIDs are available
  useEffect(() => {
    const fetchArticleTitles = async () => {
      try {
        // Retrieve the titles for each article CID
        const titles = await Promise.all(
          articleCIDs.map(async (cid) => {
            // Assuming `articlesByCid` is a method in your contract
            const article = await wikichain.methods.articlesByCid(cid).call();
            return article.title; // Return the article title
          })
        );

        setArticleTitles(titles); // Set the article titles in the state
      } catch (error) {
        console.error("Error fetching article titles:", error);
      }
    };

    // Only fetch titles if article CIDs are available
    if (articleCIDs.length > 0) {
      fetchArticleTitles();
    }
  }, [articleCIDs]);

  return (
    <div>
      <br />
      <br />
      <div className="flex items-center justify-center">
        <div className="max-w-md w-full p-6 shadow-4xl rounded-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Article Available
          </h2>
          <ul
            className={
              articleTitles.length > 5 ? "overflow-y-auto max-h-40" : ""
            }
          >
            {articleTitles.map((title, index) => (
              <li key={index} className="mb-2 text-lg">
                {title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArticleTitle;
