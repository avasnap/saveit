// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KeyValueStore is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // Constants for limits
    uint256 public constant MAX_KEY_LENGTH = 256;
    uint256 public constant MAX_VALUE_LENGTH = 8192;
    
    // Mapping from address => key => value
    mapping(address => mapping(string => string)) private store;
    
    // Mapping from address => array of keys (for enumeration)
    mapping(address => string[]) private userKeys;
    
    // Mapping to track if a key exists for a user
    mapping(address => mapping(string => bool)) private keyExists;
    
    // Mapping to track key index in userKeys array
    mapping(address => mapping(string => uint256)) private keyIndex;

    // Events
    event ValueStored(address indexed user, string key, string value);
    event ValueUpdated(address indexed user, string key, string oldValue, string newValue);
    event ValueDeleted(address indexed user, string key, string value);
    event ContractUpgraded(address indexed newImplementation);
    
    // Storage gap for future upgrades (50 slots reserved)
    uint256[50] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @dev Store or update a value for the caller's namespace
     * @param key The key to store the value under
     * @param value The value to store
     */
    function set(string memory key, string memory value) external {
        require(bytes(key).length > 0, "Key cannot be empty");
        require(bytes(key).length <= MAX_KEY_LENGTH, "Key too long");
        require(bytes(value).length <= MAX_VALUE_LENGTH, "Value too long");
        
        address user = msg.sender;
        
        if (keyExists[user][key]) {
            // Update existing value
            string memory oldValue = store[user][key];
            store[user][key] = value;
            emit ValueUpdated(user, key, oldValue, value);
        } else {
            // Store new value
            store[user][key] = value;
            keyExists[user][key] = true;
            keyIndex[user][key] = userKeys[user].length;
            userKeys[user].push(key);
            emit ValueStored(user, key, value);
        }
    }

    /**
     * @dev Get a value from the caller's namespace
     * @param key The key to retrieve
     * @return The stored value (empty string if not found)
     */
    function get(string memory key) external view returns (string memory) {
        return store[msg.sender][key];
    }

    /**
     * @dev Get a value from a specific user's namespace
     * @param user The address of the namespace owner
     * @param key The key to retrieve
     * @return The stored value (empty string if not found)
     */
    function getFrom(address user, string memory key) external view returns (string memory) {
        return store[user][key];
    }

    /**
     * @dev Delete a value from the caller's namespace
     * @param key The key to delete
     */
    function remove(string memory key) external {
        address user = msg.sender;
        require(keyExists[user][key], "Key does not exist");
        
        string memory value = store[user][key];
        
        // Delete from store
        delete store[user][key];
        delete keyExists[user][key];
        
        // Remove from keys array
        uint256 index = keyIndex[user][key];
        uint256 lastIndex = userKeys[user].length - 1;
        
        if (index != lastIndex) {
            string memory lastKey = userKeys[user][lastIndex];
            userKeys[user][index] = lastKey;
            keyIndex[user][lastKey] = index;
        }
        
        userKeys[user].pop();
        delete keyIndex[user][key];
        
        emit ValueDeleted(user, key, value);
    }

    /**
     * @dev Check if a key exists in the caller's namespace
     * @param key The key to check
     * @return true if the key exists, false otherwise
     */
    function exists(string memory key) external view returns (bool) {
        return keyExists[msg.sender][key];
    }

    /**
     * @dev Check if a key exists in a specific user's namespace
     * @param user The address of the namespace owner
     * @param key The key to check
     * @return true if the key exists, false otherwise
     */
    function existsFor(address user, string memory key) external view returns (bool) {
        return keyExists[user][key];
    }

    /**
     * @dev Get all keys in the caller's namespace
     * WARNING: This can run out of gas for large key sets. Use getKeysPaginated for production.
     * @return An array of all keys
     */
    function getAllKeys() external view returns (string[] memory) {
        return userKeys[msg.sender];
    }

    /**
     * @dev Get all keys for a specific user's namespace
     * WARNING: This can run out of gas for large key sets. Use getKeysPaginatedFor for production.
     * @param user The address of the namespace owner
     * @return An array of all keys
     */
    function getAllKeysFor(address user) external view returns (string[] memory) {
        return userKeys[user];
    }
    
    /**
     * @dev Get keys in the caller's namespace with pagination
     * @param offset Starting index
     * @param limit Maximum number of keys to return
     * @return keys Array of keys
     * @return hasMore True if there are more keys beyond this page
     */
    function getKeysPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (string[] memory keys, bool hasMore) 
    {
        return _getKeysPaginated(msg.sender, offset, limit);
    }
    
    /**
     * @dev Get keys for a specific user's namespace with pagination
     * @param user The address of the namespace owner
     * @param offset Starting index
     * @param limit Maximum number of keys to return
     * @return keys Array of keys
     * @return hasMore True if there are more keys beyond this page
     */
    function getKeysPaginatedFor(address user, uint256 offset, uint256 limit) 
        external 
        view 
        returns (string[] memory keys, bool hasMore) 
    {
        return _getKeysPaginated(user, offset, limit);
    }
    
    /**
     * @dev Internal function for paginated key retrieval
     */
    function _getKeysPaginated(address user, uint256 offset, uint256 limit)
        private
        view
        returns (string[] memory keys, bool hasMore)
    {
        uint256 totalKeys = userKeys[user].length;
        
        if (offset >= totalKeys) {
            return (new string[](0), false);
        }
        
        uint256 endIndex = offset + limit;
        if (endIndex > totalKeys) {
            endIndex = totalKeys;
        }
        
        uint256 length = endIndex - offset;
        keys = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            keys[i] = userKeys[user][offset + i];
        }
        
        hasMore = endIndex < totalKeys;
    }

    /**
     * @dev Get the number of keys in the caller's namespace
     * @return The number of keys
     */
    function getKeyCount() external view returns (uint256) {
        return userKeys[msg.sender].length;
    }

    /**
     * @dev Get the number of keys for a specific user's namespace
     * @param user The address of the namespace owner
     * @return The number of keys
     */
    function getKeyCountFor(address user) external view returns (uint256) {
        return userKeys[user].length;
    }

    /**
     * @dev Required by UUPSUpgradeable to authorize upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        emit ContractUpgraded(newImplementation);
    }
}