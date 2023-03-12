const ethSigUtil = require("eth-sig-util");
const { fromRpcSig } = require("ethereumjs-util");
const { ethers } = require("ethers");

const abi = require("./artifacts/contracts/NewToken.sol/NewToken.json").abi;
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const provider = new ethers.providers.JsonRpcProvider();
const PRIVATE_KEY = Buffer.from("", "hex");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

const initialHolder = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

(async () => {
  const chainId = parseInt((await contract.chainId()).toString());
  const nonce = (await contract.nonces(initialHolder)).toString();
  const owner = initialHolder;
  const spender = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const value = "42";
  const deadline =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  const data = {
    primaryType: "Permit",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    domain: {
      name: "NewToken",
      version: "1",
      chainId,
      verifyingContract: contractAddress,
    },
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };
  const sign = ethSigUtil.signTypedMessage(PRIVATE_KEY, { data });
  const { v, r, s } = fromRpcSig(sign);
  await contract.permit(owner, spender, value, deadline, v, r, s);
})();
