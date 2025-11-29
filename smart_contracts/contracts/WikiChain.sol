// SPDX-License-Identifier: MIT
/**
 * Copyright © 2024-Present Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file WikiChain.sol
 * @description This contract allows users to register, publish, update, vote on, verify, and query articles. It also includes functionalities for managing consortium members, performance scores, and the deletion of articles.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024-Present
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */

pragma solidity ^0.8.0;

contract WikiChain {
    // Contract owner
    address public owner;

    // User structure to store user information
    struct User {
        string username;
        bool isRegistered;
        uint256 performanceScore;
        bool isConsortiumMember;
    }

    // Article version structure to store information about each version of an article
    struct ArticleVersion {
        string cid;
        uint256 timestamp;
    }

    // Article structure to store information about an article
    struct Article {
        string title;
        ArticleVersion[] versions;
        address author;
        uint256 votes;
        bool isVerified;
        uint256 elGamalSignature; // ElGamal signature variable
        // Mapping to track users who have voted for an article
        mapping(address => bool) voters;
        // Mapping to track users who have elGamalSignature for an article
        mapping(address => bool) signers;
    }

    // Mapping to store user information based on their address
    mapping(address => User) public users;

    // Mapping to store article information based on their title
    mapping(string => Article) public articlesByTitle;

    // Mapping to store article information based on their CID
    mapping(string => Article) public articlesByCid;

    // Counter to keep track of the total number of articles
    uint256 public articleCount;

    // Set the threshold for no of consortium members
    uint256 public threshold = 3;

    // Array to store addresses of registered users
    address[] public registeredUsers;

    // Array to store addresses of consortium members
    address[] public consortiumMembers;

    // Array to store all CIDs of articles
    string[] public allArticleCIDs;

    // Modifier to restrict access to only the owner of the contract
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Modifier to check if the caller is a registered user
    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User is not registered");
        _;
    }

    // Modifier to check if the caller is a consortium member
    modifier onlyConsortiumMembers() {
        require(
            users[msg.sender].isConsortiumMember,
            "Only consortium members can perform this action"
        );
        _;
    }

    // Contract constructor
    constructor() {
        owner = msg.sender;
    }

    // Function to register a new user
    function registerUser(string memory username) public {
        require(!users[msg.sender].isRegistered, "User is already registered");
        users[msg.sender] = User(username, true, 0, false);
        registeredUsers.push(msg.sender);
    }

    // Function to publish a new article
    function publishArticle(
        string memory title,
        string memory cid
    ) public onlyRegisteredUser {
        Article storage article = articlesByTitle[title];
        require(
            article.author == address(0),
            "Article with this title already exists"
        );

        ArticleVersion memory newVersion = ArticleVersion(cid, block.timestamp);
        article.title = title;
        article.versions.push(newVersion);
        article.author = msg.sender;
        articleCount++;

        // Add the article to the articlesByCid mapping
        Article storage articleCid = articlesByCid[cid];
        articleCid.title = title;
        articleCid.versions.push(newVersion);
        articleCid.author = msg.sender;

        // Increment performance score when publishing an article
        users[msg.sender].performanceScore =
            users[msg.sender].performanceScore +
            10;

        // Push the CID to the array of all CIDs
        allArticleCIDs.push(cid);
    }

    // Function to update an existing article
    function updateArticle(
        string memory title,
        string memory newCid
    ) public onlyRegisteredUser {
        require(bytes(title).length > 0, "Title cannot be empty");
        Article storage article = articlesByTitle[title];

        ArticleVersion memory newVersion = ArticleVersion(
            newCid,
            block.timestamp
        );
        article.versions.push(newVersion);

        // Increment performance score when updating an article
        users[msg.sender].performanceScore =
            users[msg.sender].performanceScore +
            7;
    }

    // Function to vote for an article
    function voteArticle(string memory title) public onlyRegisteredUser {
        require(bytes(title).length > 0, "Title cannot be empty");
        Article storage article = articlesByTitle[title];
        require(article.author != address(0), "Article does not exist");

        // Check if the user has already voted
        require(
            !article.voters[msg.sender],
            "You have already voted for this article"
        );

        // Mark the user as voted
        article.voters[msg.sender] = true;

        // Increment the vote count
        article.votes++;

        // Increment performance score when voting for an article
        users[msg.sender].performanceScore =
            users[msg.sender].performanceScore +
            5;
    }

    // Function to verify an article
    function verifyArticle(string memory title) public onlyConsortiumMembers {
        require(bytes(title).length > 0, "Title cannot be empty");
        Article storage article = articlesByTitle[title];
        require(article.author != address(0), "Article does not exist");
        require(!article.isVerified, "Article is already verified");

        // Add ElGamal signature for the current user
        require(
            !article.signers[msg.sender],
            "You have already signed this article"
        );
        article.signers[msg.sender] = true;
        article.elGamalSignature++;

        // Check if all consortium members have signed the article
        if (article.elGamalSignature >= threshold) {
            article.isVerified = true;
            // Increment performance score when verifying an article
            users[msg.sender].performanceScore += 7;
        }
    }

    // Function to query information about an article
    function queryArticle(
        string memory title,
        uint256 versionIndex
    )
        public
        view
        returns (
            address author,
            string memory retrievedTitle,
            string memory cid,
            uint256 timestamp,
            uint256 votes,
            bool isVerified,
            uint256 versionNumber
        )
    {
        require(bytes(title).length > 0, "Title cannot be empty");
        Article storage article = articlesByTitle[title];
        require(article.author != address(0), "Article does not exist");

        ArticleVersion storage version;

        if (
            versionIndex >= article.versions.length ||
            versionIndex == type(uint256).max
        ) {
            // If versionIndex exceeds the available versions or is set to max, return the latest version
            version = article.versions[article.versions.length - 1];
            versionNumber = article.versions.length;
        } else {
            // Return the specified version
            version = article.versions[versionIndex];
            versionNumber = versionIndex + 1; // Add 1 to convert from zero-based index to version number
        }

        return (
            article.author,
            article.title,
            version.cid,
            version.timestamp,
            article.votes,
            article.isVerified,
            versionNumber
        );
    }

    // Function to add a user to the consortium based on performance score
    function addToConsortium() public onlyOwner {
        // Set the threshold for performance score (adjust as needed)
        require(
            threshold <= registeredUsers.length,
            "Threshold exceeds the number of registered users"
        );

        // Create a temporary array to store user addresses and their performance scores
        address[] memory sortedUsers = new address[](registeredUsers.length);

        // Populate the array with user addresses
        for (uint256 i = 0; i < registeredUsers.length; i++) {
            sortedUsers[i] = registeredUsers[i];
        }

        // Sort the users based on performance score in descending order (bubble sort)
        for (uint256 i = 0; i < sortedUsers.length; i++) {
            for (uint256 j = i + 1; j < sortedUsers.length; j++) {
                if (
                    users[sortedUsers[j]].performanceScore >
                    users[sortedUsers[i]].performanceScore
                ) {
                    // Swap addresses if the j-th user has a higher performance score
                    (sortedUsers[i], sortedUsers[j]) = (
                        sortedUsers[j],
                        sortedUsers[i]
                    );
                }
            }
        }

        // Clear the current consortiumMembers array
        delete consortiumMembers;

        // Choose the top threshold level members to the system
        for (uint256 i = 0; i < threshold; i++) {
            // Add user to consortium
            address userAddress = sortedUsers[i];
            consortiumMembers.push(userAddress);
            // Set isConsortiumMember to true for the added member
            users[userAddress].isConsortiumMember = true;
        }

        // Set isConsortiumMember to false for users not added to the consortium
        for (uint256 i = threshold; i < sortedUsers.length; i++) {
            address userAddress = sortedUsers[i];
            users[userAddress].isConsortiumMember = false;
        }
    }

    // Function to get all CIDs of articles
    function getAllArticleCIDs() public view returns (string[] memory) {
        return allArticleCIDs;
    }

    // Function to delete articles based on CIDs
    function deleteArticlesByCIDs(
        string[] memory cids
    ) public onlyConsortiumMembers {
        require(cids.length > 0, "No CIDs provided for deletion");

        for (uint256 i = 0; i < cids.length; i++) {
            string memory currentCID = cids[i];
            Article storage article = articlesByCid[currentCID];

            require(
                article.author != address(0),
                "Article with the given CID does not exist"
            );

            // Delete the article from the articlesByTitle mapping
            delete articlesByTitle[article.title];

            // Delete the article from the articlesByCid mapping
            delete articlesByCid[currentCID];
        }
    }
}
