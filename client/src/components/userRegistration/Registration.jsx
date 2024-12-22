import React from "react";
import { useState, useEffect } from "react";
import { MdLogin } from "react-icons/md";
import web3 from "../../web3.js";
import wikichain from "../../wikichain.js";
import Loading from "../Loading.jsx";

function Registration() {
  const [userName, setUserName] = useState("");
  const [account, setAccount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkUserRegistration = async () => {
      const account = await web3.eth.getAccounts();
      setAccount(account);
      try {
        // Assuming `wiki` is your contract instance
        // console.log(account);
        const user = await wikichain.methods.users(account[0]).call();

        // Check if the user is registered based on your contract logic
        const userIsRegistered = user && user.isRegistered;
        // Update state accordingly
        setIsUserRegistered(userIsRegistered);
        setIsLoading(false);
      } catch (error) {
        // Handle errors, e.g., log them or show an error message
        console.error("Error checking user registration:", error);
        setIsLoading(false);
      }
    };

    // Call the function to check user registration
    checkUserRegistration();
  }, [account]);

  const handleRegistration = async (e) => {
    e.preventDefault();
    const account = await web3.eth.getAccounts();
    setAccount(account);
    console.log(account);

    try {
      const user = await wikichain.methods.users(account[0]).call();
      if (!user.isRegistered) {
        // Call the registerUser method with the entered username
        const transaction = await wikichain.methods
          .registerUser(userName)
          .send({ from: account[0], gas: 3000000 });
        console.log(transaction);

        setTransactionStatus("Transaction successful! ");

        // Optionally, you can add code here to handle success, e.g., show a success message
        console.log(`User ${userName} registered successfully!`);
      } else {
        setIsUserRegistered(user.isRegistered);
      }
    } catch (error) {
      // Handle errors, e.g., show an error message
      console.error("Error registering user:", error);
      setTransactionStatus("Sorry !!! Transaction failed!");
    }
  };
  return (
    <div>
      {isLoading ? (
        <Loading></Loading>
      ) : (
        <div>
          <form
            onSubmit={handleRegistration}
            className="text-center p-32 shadow-4xl m-40 text-primary"
          >
            {transactionStatus && <p>{transactionStatus}</p>}
            {isUserRegistered ? (
              <div>
                <p className="text-primary text-5xl">
                  ✅ You are a registered user!!!
                </p>
              </div>
            ) : (
              <div>
                <label className="text-3xl">
                  <span className="text-4xl font-bold">Registration Desk</span>
                  <br></br>
                  <br></br>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-black border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="enter your name"
                  />
                </label>
                <br></br>
                <button
                  type="submit"
                  className="m-5 bg-black hover:bg-primary text-white font-bold py-2 px-4 rounded"
                >
                  <span className="flex">
                    <MdLogin size={28} className="mr-2" />
                    Register
                  </span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default Registration;
