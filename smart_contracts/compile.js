const path = require("path");
const fs = require("fs");
const solc = require("solc");

const wikiPath = path.resolve(__dirname, "contracts", "WikiChain.sol");
const source = fs.readFileSync(wikiPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "WikiChain.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  "WikiChain.sol"
].WikiChain;

// const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
// console.log(compiledContract);
// const contractAbi =
//   compiledContract.contracts["WikiChain.sol"]["WikiChain"].abi;
// const contractBytecode =
//   compiledContract.contracts["WikiChain.sol"]["WikiChain"].evm.bytecode.object;

// module.exports = { contractAbi, contractBytecode };

// console.log(contractAbi);
// console.log("");
// console.log(contractBytecode);
