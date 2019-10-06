const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
  "earn wise tennis auto about clump raven wedding squirrel forum talk subject",
  // "resist sing critic ready panda subject survey patch pumpkin opinion tennis stomach",
  "https://rinkeby.infura.io/vXHSPOLCtZf5K5fHrjQP"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log("Attempting to deploy Lottery contract from: ", accounts[0]);
  const result = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({ data: bytecode })
            .send({ from: accounts[0], gas: 1000000 });
  console.log(interface);
  console.log("Contract deployed to: ", result.options.address);
};
deploy();
