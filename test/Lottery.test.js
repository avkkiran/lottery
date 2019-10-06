const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());
const { bytecode, interface } = require("../compile");

let lottery;
let accounts;

beforeEach( async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
              .deploy({ data: bytecode })
              .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery test", () => {
  it("Deploys contract", () => {
    assert.ok(lottery.options.address);
  });

  it("Allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02","ether")
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("Allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02","ether")
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02","ether")
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02","ether")
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it("Min amount of ether", async () => {
    try{
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0.001","ether")
      });
      assert(false);
    } catch(err) {
      assert(err);
    }
  });

  it("Only manager can pick winner", async () => {
    try{
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch(err) {
      assert(err);
    }
  });

  it("End to end test", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2","ether")
    });
    let players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert.equal(1, players.length);
    const initialBal = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    const finalBal = await web3.eth.getBalance(accounts[0]);
    const difference = finalBal - initialBal;
    // console.log(difference);
    assert(difference > web3.utils.toWei("1.8","ether"));
    players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert.equal(0, players.length);
    const poolBal = await lottery.methods.getPoolBal().call();
    assert.equal(0, poolBal);
  });
});
