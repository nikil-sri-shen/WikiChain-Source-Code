/**
 * Copyright © 2024 Dr.J.Chandra Priya and R. Nikil Sri Shen. All Rights Reserved.
 * @file WikiChain.test.js
 * @description Test file for WikiChain smart contract to verify functionality like user registration, article publishing, querying, voting, etc.
 * @authors
 *   - Dr. J. Chandra Priya
 *   - R. Nikil Sri Shen
 * @copyright 2024
 * @license All rights reserved. Unauthorized use, reproduction, or distribution of this code
 *          is strictly prohibited without explicit permission from the authors.
 */
const { assert } = require("chai");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const { abi, evm } = require("../compile");

const web3 = new Web3(ganache.provider());

let wiki;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  // console.log(accounts);

  wiki = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: "6000000", gasPrice: "1000000000" });
});

describe("WikiChain", () => {
  // ------------------------------------------------------------------------------------------
  it("should return correct contract owner", async () => {
    const owner = await wiki.methods.owner().call();
    assert.strictEqual(owner, accounts[0], "Incorrect contract owner");
    console.log(owner);
    console.log(accounts[0]);
  });
  // ------------------------------------------------------------------------------------------
  it("should register a user", async () => {
    // Initial registration
    const gasEstimate = await wiki.methods
      .registerUser("Alice")
      .estimateGas({ from: accounts[1] });
    console.log("GAS:", gasEstimate);
    // const block = await wiki.methods.registerUser("Alice").getBlock();
    // console.log(block);
    await wiki.methods
      .registerUser("Alice")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });
    // Check if the user is registered
    const user = await wiki.methods.users(accounts[1]).call();
    assert.isTrue(user.isRegistered, "User should be registered");
    console.log("Before try block");
    // Try to register the same user again
    try {
      console.log("Entering try block");
      await wiki.methods.registerUser("Alice").send({ from: accounts[1] });
      console.log("After try block");
      // If the above line does not throw an error, the test should fail
      assert.fail("Expected an error but got none");
    } catch (error) {
      // Check if the error message matches the expected message
      console.log("Error caught:", error.message);
      assert.include(error.message, "User is already registered");
    }
  });
  // ------------------------------------------------------------------------------------------
  it("should publish an article and update performance score", async function () {
    this.timeout(5000);
    // Initial registration
    const gasEstimate1 = await wiki.methods
      .registerUser("Author")
      .estimateGas({ from: accounts[1] });
    console.log("GAS:", gasEstimate1);
    // const block = await wiki.methods.registerUser("Alice").getBlock();
    // console.log(block);
    await wiki.methods
      .registerUser("Author")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });

    // Get the initial performance score of the author
    const initialScore = await wiki.methods.users(accounts[1]).call();
    const initialPerformanceScore = initialScore.performanceScore;

    // Publish an article
    const gasEstimate = await wiki.methods
      .publishArticle("Sample Article", "CID123")
      .estimateGas({ from: accounts[1] });

    const tx = await wiki.methods
      .publishArticle("Sample Article", "CID123")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });

    // Check if the article is published successfully
    assert.equal(tx.status, true, "Article publication failed");

    // Check if the author's performance score is updated
    const updatedScore = await wiki.methods.users(accounts[1]).call();
    const updatedPerformanceScore = updatedScore.performanceScore;

    // The performance score should increase by 10 for publishing an article
    assert.equal(
      parseInt(updatedPerformanceScore),
      parseInt(initialPerformanceScore) + 10,
      "Performance score not updated correctly"
    );

    // Try to publish the same article again
    try {
      await wiki.methods
        .publishArticle("Sample Article", "CID123")
        .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });
      // If the above line does not throw an error, the test should fail
      assert.fail("Expected an error but got none");
    } catch (error) {
      // Check if the error message matches the expected message
      assert.include(
        error.message,
        "Article with this title already exists",
        "Unexpected error message"
      );
    }
  });
  // ------------------------------------------------------------------------------------------
  it("should query an article", async function () {
    this.timeout(5000);
    // Initial registration
    const gasEstimate1 = await wiki.methods
      .registerUser("Author")
      .estimateGas({ from: accounts[1] });
    console.log("GAS:", gasEstimate1);
    const block = await wiki.methods.registerUser("Alice").getBlock();
    console.log(block);
    await wiki.methods
      .registerUser("Author")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });

    // Publish an article
    const gasEstimate = await wiki.methods
      .publishArticle("Sample Article", "CID123")
      .estimateGas({ from: accounts[1] });

    const tx = await wiki.methods
      .publishArticle("Sample Article", "CID123")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });

    assert.equal(tx.status, true, "Article publication failed");

    const queriedArticle = await wiki.methods
      .queryArticle("Sample Article", 100) // Provide the versionIndex as needed
      .call();
    console.log(queriedArticle);
    // Assert various conditions to verify the queried article
    assert.equal(
      queriedArticle.retrievedTitle,
      "Sample Article",
      "Queried article title does not match"
    );
    assert.equal(
      queriedArticle.cid,
      "CID123",
      "Queried article content does not match"
    );
    assert.equal(
      queriedArticle.author,
      accounts[1],
      "Queried article author does not match"
    );
    assert.equal(
      queriedArticle.votes,
      0,
      "Queried article votes should be initialized to 0"
    );
    assert.isFalse(
      queriedArticle.isVerified,
      "Queried article should not be verified initially"
    );
    assert.isAtLeast(
      parseInt(queriedArticle.versionNumber),
      1,
      "Queried article version number should be at least 1"
    );
  });

  it("should reject querying an article with an empty title", async () => {
    // Try to query an article with an empty title
    try {
      await wiki.methods.queryArticle("", 0).call({ from: accounts[1] });

      // If the above line does not throw an error, the test should fail
      assert.fail("Expected an error but got none");
    } catch (error) {
      // Check if the error message matches the expected message
      assert.include(
        error.message,
        "Title cannot be empty",
        "Unexpected error message"
      );
    }
  });
  // ------------------------------------------------------------------------------------------
  it("should query and update an article", async function () {
    this.timeout(5000);
    // Initial registration
    const gasEstimate1 = await wiki.methods
      .registerUser("Author")
      .estimateGas({ from: accounts[1] });
    console.log("GAS:", gasEstimate1);
    const block = await wiki.methods.registerUser("Alice").getBlock();
    console.log(block);
    await wiki.methods
      .registerUser("Author")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });

    // Publish an article
    const gasEstimate = await wiki.methods
      .publishArticle("Sample Article", "CID123")
      .estimateGas({ from: accounts[1] });

    await wiki.methods
      .publishArticle("Sample Article", "CID123")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });

    const initialArticle = await wiki.methods
      .queryArticle("Sample Article", 1) // Provide the versionIndex as needed
      .call();
    console.log(initialArticle);
    // Assert various conditions to verify the initial article
    assert.equal(
      initialArticle.retrievedTitle,
      "Sample Article",
      "Initial article title does not match"
    );
    assert.equal(
      initialArticle.cid,
      "CID123",
      "Initial article content does not match"
    );
    assert.equal(
      initialArticle.author,
      accounts[1],
      "Initial article author does not match"
    );
    assert.equal(
      initialArticle.votes,
      0,
      "Initial article votes should be initialized to 0"
    );
    assert.isFalse(
      initialArticle.isVerified,
      "Initial article should not be verified initially"
    );
    assert.isAtLeast(
      parseInt(initialArticle.versionNumber),
      1,
      "Initial article version number should be at least 1"
    );
    // Estimate gas for updating the article
    const updateGasEstimate = await wiki.methods
      .updateArticle("Sample Article", "Updated content")
      .estimateGas({ from: accounts[1] });
    console.log("Update Gas Estimate:", updateGasEstimate);
    // Update the article
    await wiki.methods.updateArticle("Sample Article", "Updated content").send({
      from: accounts[1],
      gas: updateGasEstimate,
      gasPrice: "1000000000",
    });

    const updatedScore = await wiki.methods.users(accounts[1]).call();
    const updatedPerformanceScore = updatedScore.performanceScore;
    // Query the updated article
    const updatedArticle = await wiki.methods
      .queryArticle("Sample Article", 2) // Assuming 1 as the version index after update
      .call();
    console.log(updatedArticle);
    // Assert various conditions to verify the updated article
    assert.equal(
      updatedArticle.retrievedTitle,
      "Sample Article",
      "Updated article title does not match"
    );
    assert.equal(
      updatedArticle.cid,
      "Updated content",
      "Updated article content does not match"
    );
    assert.equal(
      updatedArticle.author,
      accounts[1],
      "Updated article author does not match"
    );
    assert.equal(
      updatedArticle.votes,
      0,
      "Updated article votes should be initialized to 0"
    );
    assert.isFalse(
      updatedArticle.isVerified,
      "Updated article should not be verified initially"
    );
    assert.isAtLeast(
      parseInt(updatedArticle.versionNumber),
      2,
      "Updated article version number should be at least 2"
    );
    assert.equal(
      parseInt(updatedPerformanceScore),
      17,
      "Updated Performance score should be 17"
    );
  });
  // ------------------------------------------------------------------------------------------
  it("should vote for an article", async function () {
    this.timeout(10000);
    // Register a user
    const gasEstimate1 = await wiki.methods
      .registerUser("Author1")
      .estimateGas({ from: accounts[1] });
    // console.log("GAS:", gasEstimate1);

    await wiki.methods
      .registerUser("Author1")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author2")
      .send({ from: accounts[2], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author3")
      .send({ from: accounts[3], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author4")
      .send({ from: accounts[4], gas: gasEstimate1, gasPrice: "1000000000" });

    // Estimate gas for publishing an article
    const gasEstimate = await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .estimateGas({ from: accounts[4] });

    // Publish the article
    await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .send({ from: accounts[4], gas: gasEstimate, gasPrice: "1000000000" });

    const gasEstimate2 = await wiki.methods
      .voteArticle("New Article")
      .estimateGas({ from: accounts[1] });
    console.log(gasEstimate2);
    // Vote for the article
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[1], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[2], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[3], gas: gasEstimate2, gasPrice: "1000000000" });
    // Check if the vote is recorded
    const article = await wiki.methods.articlesByTitle("New Article").call();
    console.log(article);
    const updatedScore = await wiki.methods.users(accounts[1]).call();
    const updatedPerformanceScore = updatedScore.performanceScore;
    // Assert various conditions to verify the vote
    assert.equal(article.votes, 3, "Vote count should be incremented to 1");
    assert.isTrue(
      article.voters[accounts[3]],
      "User should be marked as voted"
    );
    assert.equal(
      parseInt(updatedPerformanceScore),
      5,
      "Updated Performance score should be 5"
    );

    // Try to vote again
    try {
      await wiki.methods.voteArticle("New Article").send({ from: accounts[3] });
      // If the above line does not throw an error, the test should fail
      assert.fail("Expected an error but got none");
    } catch (error) {
      // Check if the error message matches the expected message
      console.log("Error caught:", error.message);
      assert.include(error.message, "You have already voted for this article");
    }
  });
  // ------------------------------------------------------------------------------------------
  it("should form a consortium", async function () {
    this.timeout(20000);
    // Register a user
    const gasEstimate1 = await wiki.methods
      .registerUser("Author1")
      .estimateGas({ from: accounts[1] });
    // console.log("GAS:", gasEstimate1);

    await wiki.methods
      .registerUser("Author1")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author2")
      .send({ from: accounts[2], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author3")
      .send({ from: accounts[3], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author4")
      .send({ from: accounts[4], gas: gasEstimate1, gasPrice: "1000000000" });

    // Estimate gas for publishing an article
    const gasEstimate = await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .estimateGas({ from: accounts[1] });

    // Publish the article
    await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });

    const gasEstimate2 = await wiki.methods
      .voteArticle("New Article")
      .estimateGas({ from: accounts[1] });
    console.log(gasEstimate2);
    // Vote for the article
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[1], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[2], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[3], gas: gasEstimate2, gasPrice: "1000000000" });
    // Check if the vote is recorded
    const article = await wiki.methods.articlesByTitle("New Article").call();
    console.log(article);
    const updatedScore1 = await wiki.methods.users(accounts[1]).call();
    const updatedPerformanceScore1 = updatedScore1.performanceScore;
    const updatedScore2 = await wiki.methods.users(accounts[2]).call();
    const updatedPerformanceScore2 = updatedScore2.performanceScore;
    const updatedScore3 = await wiki.methods.users(accounts[3]).call();
    const updatedPerformanceScore3 = updatedScore3.performanceScore;
    const updatedScore4 = await wiki.methods.users(accounts[4]).call();
    const updatedPerformanceScore4 = updatedScore4.performanceScore;

    // Assert various conditions to verify the vote
    assert.equal(article.votes, 3, "Vote count should be incremented to 1");
    assert.isTrue(
      article.voters[accounts[3]],
      "User should be marked as voted"
    );
    assert.equal(
      parseInt(updatedPerformanceScore1),
      15,
      "Updated Performance score should be 15"
    );
    assert.equal(
      parseInt(updatedPerformanceScore2),
      5,
      "Updated Performance score should be 5"
    );
    assert.equal(
      parseInt(updatedPerformanceScore3),
      5,
      "Updated Performance score should be 5"
    );
    assert.equal(
      parseInt(updatedPerformanceScore4),
      0,
      "Updated Performance score should be 0"
    );
    const gasEstimate3 = await wiki.methods
      .addToConsortium()
      .estimateGas({ from: accounts[0] });
    console.log(gasEstimate3);
    await wiki.methods
      .addToConsortium()
      .send({ from: accounts[0], gas: gasEstimate3, gasPrice: "1000000000" });
    const consortiumMember1 = await wiki.methods.consortiumMembers(0).call();
    const consortiumMember2 = await wiki.methods.consortiumMembers(1).call();
    const consortiumMember3 = await wiki.methods.consortiumMembers(2).call();
    const Score1 = await wiki.methods.users(accounts[1]).call();
    const Consoritum1 = Score1.isConsortiumMember;
    const Score2 = await wiki.methods.users(accounts[2]).call();
    const Consoritum2 = Score2.isConsortiumMember;
    const Score3 = await wiki.methods.users(accounts[3]).call();
    const Consoritum3 = Score3.isConsortiumMember;
    const Score4 = await wiki.methods.users(accounts[4]).call();
    const Consoritum4 = Score4.isConsortiumMember;
    assert.equal(
      consortiumMember1,
      accounts[1],
      "Incorrect consortium members 1"
    );
    assert.equal(
      consortiumMember2,
      accounts[2],
      "Incorrect consortium members 2"
    );
    assert.equal(
      consortiumMember3,
      accounts[3],
      "Incorrect consortium members 3"
    );
    console.log(Consoritum1);
    console.log(Consoritum2);
    console.log(Consoritum3);
    console.log(Consoritum4);
    assert.isTrue(Consoritum1, "Incorrect consortium members 1");
    assert.isTrue(Consoritum2, "Incorrect consortium members 2");
    assert.isTrue(Consoritum3, "Incorrect consortium members 3");
    assert.isFalse(Consoritum4, "Incorrect consortium members 4");
  });
  // ------------------------------------------------------------------------------------------
  it("should return all the CIDs", async function () {
    this.timeout(5000);
    // Register a user
    const gasEstimate1 = await wiki.methods
      .registerUser("Author1")
      .estimateGas({ from: accounts[1] });
    // console.log("GAS:", gasEstimate1);

    await wiki.methods
      .registerUser("Author1")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });

    // Estimate gas for publishing an article
    const gasEstimate = await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .estimateGas({ from: accounts[1] });

    // Publish the article
    await wiki.methods
      .publishArticle("Article1", "Content of the new article")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });
    await wiki.methods
      .publishArticle("Article2", "New article")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });
    const CIDs = await wiki.methods
      .getAllArticleCIDs()
      .call({ from: accounts[1] });
    console.log(CIDs.length);
    console.log(CIDs);
    assert.equal(CIDs[0], "Content of the new article", "Incorrect CIDs");
    assert.equal(CIDs[1], "New article", "Incorrect CIDs");
  });
  // ------------------------------------------------------------------------------------------
  it("should verify an article by consortium member", async function () {
    this.timeout(25000);
    // Register a user
    const gasEstimate1 = await wiki.methods
      .registerUser("Author1")
      .estimateGas({ from: accounts[1] });
    // console.log("GAS:", gasEstimate1);

    await wiki.methods
      .registerUser("Author1")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author2")
      .send({ from: accounts[2], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author3")
      .send({ from: accounts[3], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author4")
      .send({ from: accounts[4], gas: gasEstimate1, gasPrice: "1000000000" });

    // Estimate gas for publishing an article
    const gasEstimate = await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .estimateGas({ from: accounts[1] });

    // Publish the article
    await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });

    const gasEstimate2 = await wiki.methods
      .voteArticle("New Article")
      .estimateGas({ from: accounts[1] });
    console.log(gasEstimate2);
    // Vote for the article
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[1], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[2], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[3], gas: gasEstimate2, gasPrice: "1000000000" });
    // Check if the vote is recorded
    const article = await wiki.methods.articlesByTitle("New Article").call();
    console.log(article);

    // Assert various conditions to verify the vote
    assert.equal(article.votes, 3, "Vote count should be incremented to 1");

    const gasEstimate3 = await wiki.methods
      .addToConsortium()
      .estimateGas({ from: accounts[0] });
    console.log(gasEstimate3);
    await wiki.methods
      .addToConsortium()
      .send({ from: accounts[0], gas: gasEstimate3, gasPrice: "1000000000" });
    const Score1 = await wiki.methods.users(accounts[1]).call();
    const Consoritum1 = Score1.isConsortiumMember;
    const Score2 = await wiki.methods.users(accounts[2]).call();
    const Consoritum2 = Score2.isConsortiumMember;
    const Score3 = await wiki.methods.users(accounts[3]).call();
    const Consoritum3 = Score3.isConsortiumMember;

    assert.isTrue(Consoritum1, "Incorrect consortium members 1");
    assert.isTrue(Consoritum2, "Incorrect consortium members 2");
    assert.isTrue(Consoritum3, "Incorrect consortium members 3");

    const gasEstimate4 = await wiki.methods
      .verifyArticle("New Article")
      .estimateGas({ from: accounts[3] });
    console.log(gasEstimate4);
    // Vote for the article
    await wiki.methods
      .verifyArticle("New Article")
      .send({ from: accounts[1], gas: gasEstimate4, gasPrice: "1000000000" });
    await wiki.methods
      .verifyArticle("New Article")
      .send({ from: accounts[2], gas: gasEstimate4, gasPrice: "1000000000" });
    const gasEstimate5 = await wiki.methods
      .verifyArticle("New Article")
      .estimateGas({ from: accounts[3] });
    await wiki.methods
      .verifyArticle("New Article")
      .send({ from: accounts[3], gas: gasEstimate5, gasPrice: "1000000000" });

    const article1 = await wiki.methods.articlesByTitle("New Article").call();
    console.log(article1.isVerified);
    assert.isTrue(article1.verified, "Article should be verified");
  });
  // ------------------------------------------------------------------------------------------
  it("should delete all the CIDs given", async function () {
    this.timeout(30000);
    // Register a user
    const gasEstimate1 = await wiki.methods
      .registerUser("Author1")
      .estimateGas({ from: accounts[1] });
    // console.log("GAS:", gasEstimate1);

    await wiki.methods
      .registerUser("Author1")
      .send({ from: accounts[1], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author2")
      .send({ from: accounts[2], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author3")
      .send({ from: accounts[3], gas: gasEstimate1, gasPrice: "1000000000" });
    await wiki.methods
      .registerUser("Author4")
      .send({ from: accounts[4], gas: gasEstimate1, gasPrice: "1000000000" });

    // Estimate gas for publishing an article
    const gasEstimate = await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .estimateGas({ from: accounts[1] });

    // Publish the article
    await wiki.methods
      .publishArticle("New Article", "Content of the new article")
      .send({ from: accounts[1], gas: gasEstimate, gasPrice: "1000000000" });

    const gasEstimate2 = await wiki.methods
      .voteArticle("New Article")
      .estimateGas({ from: accounts[1] });
    // console.log(gasEstimate2);
    // Vote for the article
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[1], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[2], gas: gasEstimate2, gasPrice: "1000000000" });
    await wiki.methods
      .voteArticle("New Article")
      .send({ from: accounts[3], gas: gasEstimate2, gasPrice: "1000000000" });
    // Check if the vote is recorded
    const article = await wiki.methods.articlesByTitle("New Article").call();
    // console.log(article);

    // Assert various conditions to verify the vote
    assert.equal(article.votes, 3, "Vote count should be incremented to 1");

    const gasEstimate3 = await wiki.methods
      .addToConsortium()
      .estimateGas({ from: accounts[0] });
    console.log(gasEstimate3);
    await wiki.methods
      .addToConsortium()
      .send({ from: accounts[0], gas: gasEstimate3, gasPrice: "1000000000" });

    const CIDs = await wiki.methods
      .getAllArticleCIDs()
      .call({ from: accounts[1] });
    console.log(CIDs.length);
    console.log(CIDs);
    assert.equal(CIDs[0], "Content of the new article", "Incorrect CIDs");
    const gasEstimate4 = await wiki.methods
      .deleteArticlesByCIDs(CIDs)
      .estimateGas({ from: accounts[1] });
    await wiki.methods.deleteArticlesByCIDs(CIDs).send({
      from: accounts[1],
      gas: gasEstimate4,
      gasPrice: "1000000000",
    });

    const output = await wiki.methods
      .queryArticle("New Article", 0)
      .call({ from: accounts[1] });
    console.log(output);
    // Check if the error message matches the expected message
    assert.include(
      error.message,
      "Article not found",
      "Unexpected error message"
    );
    // If the above line does not throw an error, the test should fail
    assert.fail("Expected an error but got none");
  });
});
