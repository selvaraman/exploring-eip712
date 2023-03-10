const hre = require("hardhat");

async function main() {

  const NewToken = await hre.ethers.getContractFactory("NewToken");
  const newToken = await NewToken.deploy();

  await newToken.deployed();

  console.log(`Contract Address: ${newToken.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
