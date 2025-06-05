# Gas Cost Calculation for KeyValueStore

## Storage Costs on Ethereum

### For a new key-value pair (50 byte key + 3500 byte value):

1. **String Storage Costs:**
   - Each storage slot (32 bytes) costs:
     - 20,000 gas for a new slot (zero → non-zero)
     - 5,000 gas for updating existing slot (non-zero → non-zero)
   
2. **Breaking down our data:**
   - Key (50 bytes): Requires 2 slots
     - 1 slot for length
     - 2 slots for data (50 bytes > 32 bytes)
     - Total: 3 slots × 20,000 = 60,000 gas
   
   - Value (3500 bytes): Requires 110 slots
     - 1 slot for length
     - 109 slots for data (3500 / 32 ≈ 109.4)
     - Total: 110 slots × 20,000 = 2,200,000 gas

3. **Additional Storage:**
   - Mapping updates for keyExists: ~20,000 gas
   - Array push for userKeys: ~20,000 gas for length update + 60,000 for key storage
   - Mapping update for keyIndex: ~20,000 gas

4. **Other Operations:**
   - Base transaction: 21,000 gas
   - Function execution overhead: ~10,000 gas
   - Memory operations: ~5,000 gas

**Total Estimated Gas: ~2,416,000 gas**

### Cost in ETH and USD:
- At 30 gwei gas price: 2,416,000 × 30 × 10^-9 = **0.07248 ETH**
- At $3,500 per ETH: 0.07248 × 3,500 = **$253.68**

### For updating an existing key (only value changes):
- Would save ~100,000 gas (keyExists, userKeys, keyIndex already set)
- Total: ~2,316,000 gas
- Cost: ~0.06948 ETH (~$243.18 at $3,500/ETH)

## Notes:
- Actual costs may vary ±10% due to EVM optimizations
- Gas prices fluctuate significantly (10-100+ gwei)
- ETH price is highly volatile
- Consider using L2 solutions (Arbitrum, Optimism) for 10-100x lower costs

---

## Avalanche C-Chain Gas Costs

### Same operation (50 byte key + 3500 byte value):

Avalanche C-Chain is EVM-compatible, so gas usage is identical: **~2,416,000 gas**

### Cost Calculation:
- **Base fee on Avalanche**: ~25 nAVAX (0.000000025 AVAX per gas)
- **Priority fee**: ~2 nAVAX (optional, for faster inclusion)
- **Total gas price**: ~27 nAVAX (0.000000027 AVAX per gas)

**Total Cost**: 2,416,000 × 0.000000027 = **0.065232 AVAX**

### Cost in USD:
- At $18.50 per AVAX: 0.065232 × 18.50 = **$1.21**

### Comparison:
- **Ethereum**: $253.68
- **Avalanche**: $1.21
- **Savings**: 99.5% cheaper than Ethereum

### Additional Avalanche Benefits:
- Sub-second finality
- Consistent low fees (doesn't spike like Ethereum)
- Same Solidity code works without modification
- Lower environmental impact