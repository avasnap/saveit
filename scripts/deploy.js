const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const KeyValueStore = await ethers.getContractFactory("KeyValueStore");
  
  // Deploy proxy with atomic initialization
  // This ensures initialize() is called in the same transaction as deployment
  const keyValueStore = await upgrades.deployProxy(
    KeyValueStore,
    [], // initialize() takes no parameters
    {
      initializer: "initialize",
      kind: "uups"
    }
  );

  await keyValueStore.deployed();

  console.log("KeyValueStore deployed to:", keyValueStore.address);
  console.log("Owner:", await keyValueStore.owner());
  
  // Verify initialization was successful
  const owner = await keyValueStore.owner();
  if (owner !== deployer.address) {
    throw new Error("Initialization failed: deployer is not the owner");
  }
  
  console.log("Contract successfully deployed and initialized!");
  
  // Get implementation address for verification
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    keyValueStore.address
  );
  console.log("Implementation deployed to:", implementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });