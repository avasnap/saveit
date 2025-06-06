# Deploying KeyValueStore via Remix IDE

This guide walks you through deploying the upgradeable KeyValueStore contract using Remix IDE.

## Prerequisites

- MetaMask or another Web3 wallet installed
- Some ETH/AVAX for gas fees on your target network
- Access to [Remix IDE](https://remix.ethereum.org)

## Step 1: Set Up Remix Environment

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new workspace or use the default workspace
3. In the File Explorer, create a new folder called `contracts`

## Step 2: Install OpenZeppelin Contracts

1. Go to the **Plugin Manager** tab (plug icon in left sidebar)
2. Search for and activate **"OpenZeppelin Contracts"**
3. Once activated, you'll see the OpenZeppelin tab in the sidebar
4. Click on it and install the contracts library

## Step 3: Choose Contract Version

We provide three contract versions:

### Option A: KeyValueStoreBasic.sol (Recommended for Remix)
- **Non-upgradeable** - Simpler deployment, no proxy needed
- **Easiest to deploy** - Just click "Deploy" and it works
- **All core features** - String storage, namespaces, pagination, length limits
- **Best for most use cases**

### Option B: KeyValueStoreSimple.sol (Upgradeable, Compatible)
- **Upgradeable** - Can be updated after deployment
- **Better Remix compatibility** - Uses `_unchained` initializers
- **Requires proxy setup** - More complex deployment

### Option C: KeyValueStore.sol (Full Featured)
- **Production-ready** - All security features
- **May have compatibility issues** with some Remix/OpenZeppelin versions

## Step 4: Import Contract Files

### Method 1: Copy-Paste (Recommended)
1. Create a new file: `contracts/KeyValueStoreBasic.sol` (or your chosen version)
2. Copy the entire contents from GitHub:
   - Basic: `https://raw.githubusercontent.com/avasnap/saveit/main/contracts/KeyValueStoreBasic.sol`
   - Simple: `https://raw.githubusercontent.com/avasnap/saveit/main/contracts/KeyValueStoreSimple.sol` 
   - Full: `https://raw.githubusercontent.com/avasnap/saveit/main/contracts/KeyValueStore.sol`
3. Paste into the Remix editor

### Method 2: Import from GitHub
1. In the File Explorer, right-click on `contracts` folder
2. Select **"Import from GitHub"**
3. Enter the URL for your chosen contract version

## Step 5: Compile the Contract

1. Go to the **Solidity Compiler** tab (second icon in sidebar)
2. Set compiler version to `0.8.9` or higher
3. Enable **Optimization** (200 runs recommended)
4. Click **"Compile"** your chosen contract
5. Ensure compilation succeeds without errors

## Step 6: Deploy the Contract

### For KeyValueStoreBasic (Recommended)

**Simple deployment - no proxy needed!**

1. Go to the **Deploy & Run Transactions** tab
2. Set Environment to **"Injected Provider - MetaMask"**
3. Select the correct network in MetaMask
4. From the contract dropdown, select **"KeyValueStoreBasic"**
5. Click **"Deploy"**
6. ✅ **Done!** Your contract is ready to use immediately

### For KeyValueStoreSimple/KeyValueStore (Upgradeable)

⚠️ **Advanced**: These require proxy deployment

#### Option A: Use OpenZeppelin Defender (Recommended)
1. Go to [OpenZeppelin Defender](https://defender.openzeppelin.com)
2. Create an account and set up a deployment
3. Use their UUPS proxy deployment tool
4. Upload your compiled contract and deploy with initialization

#### Option B: Manual Deployment (Expert)
1. Deploy the implementation contract first
2. Deploy a UUPS proxy pointing to the implementation
3. Call `initialize()` immediately after proxy deployment

## Step 7: Verify Deployment

After successful deployment:

### For KeyValueStoreBasic:
1. **Test Basic Function**: Try calling `set("test", "value")` and then `get("test")`
2. **Verify Events**: Check that `ValueStored` event was emitted
3. **Check Owner**: Call `owner()` function - should return your address

### For Upgradeable Versions:
1. **Check Initialization**: Call `owner()` function - should return your address
2. **Test Basic Function**: Try calling `set("test", "value")` and then `get("test")`
3. **Verify Events**: Check that `ValueStored` event was emitted

## Step 8: Contract Interaction

### Writing Data
```solidity
// Store a value
set("myKey", "myValue")

// Update existing value  
set("myKey", "newValue")

// Delete a value
remove("myKey")
```

### Reading Data
```solidity
// Get your value
get("myKey")

// Check if key exists
exists("myKey")

// Get all your keys (be careful with large sets)
getAllKeys()

// Get keys with pagination (recommended)
getKeysPaginated(0, 10) // offset=0, limit=10

// Get key count
getKeyCount()
```

### Reading Other Users' Data
```solidity
// Get value from another user
getFrom(0x1234..., "theirKey")

// Check if key exists for another user
existsFor(0x1234..., "theirKey")

// Get all keys for another user
getAllKeysFor(0x1234...)

// Get paginated keys for another user
getKeysPaginatedFor(0x1234..., 0, 10)
```

## Step 8: Network Configuration

### Popular Networks (Pre-configured in MetaMask)

#### Ethereum Mainnet
- High gas costs (~$250+ for large values)
- Use for high-value, permanent storage

#### Avalanche C-Chain
- Much lower costs (~$1.20 for same storage)
- Faster finality
- Same contract works without changes

#### Polygon
- Very low costs (~$0.10)
- Good for testing and development

#### Testnets (Recommended for Testing)
- **Goerli** (Ethereum testnet)
- **Fuji** (Avalanche testnet)  
- **Mumbai** (Polygon testnet)
- Get free testnet tokens from faucets

### Custom/Arbitrary EVM Blockchains

**Remix works with ANY EVM-compatible blockchain!** To deploy on a custom network:

#### Step 1: Add Custom Network to MetaMask
1. Open MetaMask → Networks → "Add Network"
2. Fill in the network details:
   - **Network Name**: Your blockchain name
   - **RPC URL**: Your blockchain's RPC endpoint
   - **Chain ID**: Your blockchain's chain ID
   - **Currency Symbol**: Native token symbol
   - **Block Explorer URL**: (optional) Your block explorer

#### Step 2: Get Native Tokens
- Obtain the native cryptocurrency for gas fees
- Bridge tokens if needed
- Check with your blockchain provider for faucets (testnets)

#### Step 3: Deploy via Remix
1. Set Environment to **"Injected Provider - MetaMask"**
2. MetaMask will show your custom network
3. Deploy normally - the contract works on any EVM chain

### Examples of Compatible Blockchains
- **Binance Smart Chain (BSC)**
- **Fantom Opera**
- **Arbitrum** / **Optimism** (L2s)
- **Harmony**
- **Cronos**
- **Moonbeam** / **Moonriver**
- **Aurora** (NEAR EVM)
- **Evmos**
- **Canto**
- **Private/Enterprise chains** (Hyperledger Besu, Geth, etc.)
- **Local development networks** (Ganache, Hardhat Network)

### Network-Specific Considerations

#### Gas Costs Vary Dramatically
- **Ethereum**: $1-500+ per transaction
- **L2 solutions**: $0.01-5 per transaction  
- **Alt-L1s**: $0.001-1 per transaction
- **Private chains**: Often free or very low cost

#### Block Times & Finality
- **Ethereum**: ~12 seconds, 1-2 minutes for finality
- **Avalanche**: Sub-second finality
- **BSC**: ~3 seconds
- **Polygon**: ~2 seconds

#### Contract Size Limits
- Most EVM chains: 24KB contract size limit
- Some may have different limits - check documentation

## Troubleshooting

### Common Issues

**"Gas estimation failed"**
- Increase gas limit manually
- Check if key/value exceeds length limits (256 bytes for keys, 8KB for values)

**"Transaction reverted"**
- Ensure you're calling functions on your own namespace for write operations
- Check that key exists before trying to remove it

**"Out of gas"**
- Avoid calling `getAllKeys()` with large key sets
- Use `getKeysPaginated()` instead

**Contract not initialized**
- Ensure you called `initialize()` immediately after proxy deployment
- Check that you're the owner by calling `owner()`

### Gas Optimization Tips

1. **Batch operations**: Instead of multiple `set()` calls, consider setting multiple keys in one transaction
2. **Key naming**: Shorter keys use less gas
3. **Value size**: Larger values cost significantly more to store
4. **Network choice**: Consider L2 solutions for cost savings

## Security Reminders

- ⚠️ **All data is publicly readable** - don't store sensitive information
- 🔒 **You can only modify your own namespace** - others can read but not write to your data
- 🔄 **Contract is upgradeable** - only the owner can upgrade the implementation
- 📏 **Size limits enforced** - keys max 256 bytes, values max 8KB

## Next Steps

After deployment, consider:
1. Verifying the contract on Etherscan/block explorer
2. Setting up monitoring for your contract events
3. Building a frontend application to interact with your deployed contract
4. Implementing additional access controls if needed for your use case