const { expect } = require("chai");
const ethSigUtil = require("eth-sig-util");
const Wallet = require("ethereumjs-wallet").default;
const NewToken = artifacts.require("NewToken");
const { BN, constants } = require("@openzeppelin/test-helpers");
const { fromRpcSig } = require("ethereumjs-util");
const fs = require("fs");

contract("NewToken", function (accounts) {
  const [initialHolder, spender] = accounts;
  beforeEach(async function () {
    this.token = await NewToken.new();
  });
  it("accepts owner signature", async function () {
    const nonce = await this.token.nonces(initialHolder);
    const value = new BN(42);
    const wallet = Wallet.generate();
    const owner = wallet.getAddressString();
    const chainId = parseInt((await this.token.chainId()).toString());
    let data = {
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
        name: "My Token",
        version: "1",
        chainId,
        verifyingContract: this.token.address,
      },
      message: {
        owner,
        spender,
        value,
        nonce,
        deadline: constants.MAX_UINT256,
      },
    };
    const signedVal = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), {
      data,
    });
    const { v, r, s } = fromRpcSig(signedVal);
    await this.token.permit(owner, spender, value, constants.MAX_UINT256, v, r, s);
    expect(await this.token.nonces(owner)).to.be.bignumber.equal('1');
  });
});
