# ChainSave - On-Chain Key-Value Store

A Solidity smart contract that provides a decentralized key-value storage system with address-based namespaces.

## Features

- **Address-based namespaces**: Each address has its own isolated storage space
- **String storage**: Store and retrieve string values with string keys
- **Full CRUD operations**: Create, read, update, and delete functionality
- **Access control**: Users can only modify their own namespace
- **Read access**: Anyone can read from any namespace
- **Event logging**: All state changes emit events
- **Upgradeable**: Built with UUPS proxy pattern for future upgrades

## Contract Functions

### Write Operations
- `set(string key, string value)` - Store or update a value in your namespace
- `remove(string key)` - Delete a key-value pair from your namespace

### Read Operations
- `get(string key)` - Get a value from your namespace
- `getFrom(address user, string key)` - Get a value from another user's namespace
- `exists(string key)` - Check if a key exists in your namespace
- `existsFor(address user, string key)` - Check if a key exists in another user's namespace
- `getAllKeys()` - Get all keys in your namespace
- `getAllKeysFor(address user)` - Get all keys in another user's namespace
- `getKeyCount()` - Get the number of keys in your namespace
- `getKeyCountFor(address user)` - Get the number of keys in another user's namespace

## Events

- `ValueStored(address indexed user, string key, string value)` - Emitted when a new value is stored
- `ValueUpdated(address indexed user, string key, string oldValue, string newValue)` - Emitted when a value is updated
- `ValueDeleted(address indexed user, string key, string value)` - Emitted when a value is deleted

## Installation

```bash
npm install
```

## Testing

```bash
npx hardhat test
```

## Deployment

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Gas Costs

See [gas-calculation.md](./gas-calculation.md) for detailed gas cost analysis on different chains.

### Example costs for storing 50-byte key + 3500-byte value:
- **Ethereum**: ~$254 (at 30 gwei, $3500/ETH)
- **Avalanche C-Chain**: ~$1.21 (at $18.50/AVAX)

## Security Considerations

- Users can only write to their own namespace
- All data is publicly readable on-chain
- Do not store sensitive or private information
- Contract is upgradeable by owner only

## License

MIT