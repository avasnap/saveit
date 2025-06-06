const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("KeyValueStore", function () {
  let keyValueStore;
  let owner;
  let user1;
  let user2;
  let KeyValueStore;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    KeyValueStore = await ethers.getContractFactory("KeyValueStore");
    keyValueStore = await upgrades.deployProxy(KeyValueStore, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await keyValueStore.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await keyValueStore.owner()).to.equal(owner.address);
    });
  });

  describe("Set and Get", function () {
    it("Should store and retrieve a value", async function () {
      await keyValueStore.connect(user1).set("myKey", "myValue");
      expect(await keyValueStore.connect(user1).get("myKey")).to.equal("myValue");
    });

    it("Should emit ValueStored event on new value", async function () {
      await expect(keyValueStore.connect(user1).set("newKey", "newValue"))
        .to.emit(keyValueStore, "ValueStored")
        .withArgs(user1.address, "newKey", "newValue");
    });

    it("Should emit ValueUpdated event on update", async function () {
      await keyValueStore.connect(user1).set("updateKey", "oldValue");
      
      await expect(keyValueStore.connect(user1).set("updateKey", "newValue"))
        .to.emit(keyValueStore, "ValueUpdated")
        .withArgs(user1.address, "updateKey", "oldValue", "newValue");
    });

    it("Should reject empty keys", async function () {
      await expect(
        keyValueStore.connect(user1).set("", "value")
      ).to.be.revertedWith("Key cannot be empty");
    });

    it("Should maintain separate namespaces for different users", async function () {
      await keyValueStore.connect(user1).set("sameKey", "user1Value");
      await keyValueStore.connect(user2).set("sameKey", "user2Value");
      
      expect(await keyValueStore.connect(user1).get("sameKey")).to.equal("user1Value");
      expect(await keyValueStore.connect(user2).get("sameKey")).to.equal("user2Value");
    });

    it("Should return empty string for non-existent keys", async function () {
      expect(await keyValueStore.connect(user1).get("nonExistentKey")).to.equal("");
    });
  });

  describe("GetFrom", function () {
    it("Should allow reading from another user's namespace", async function () {
      await keyValueStore.connect(user1).set("publicKey", "publicValue");
      expect(await keyValueStore.connect(user2).getFrom(user1.address, "publicKey"))
        .to.equal("publicValue");
    });
  });

  describe("Remove", function () {
    beforeEach(async function () {
      await keyValueStore.connect(user1).set("key1", "value1");
      await keyValueStore.connect(user1).set("key2", "value2");
      await keyValueStore.connect(user1).set("key3", "value3");
    });

    it("Should delete a value", async function () {
      await keyValueStore.connect(user1).remove("key2");
      expect(await keyValueStore.connect(user1).get("key2")).to.equal("");
      expect(await keyValueStore.connect(user1).exists("key2")).to.be.false;
    });

    it("Should emit ValueDeleted event", async function () {
      await expect(keyValueStore.connect(user1).remove("key2"))
        .to.emit(keyValueStore, "ValueDeleted")
        .withArgs(user1.address, "key2", "value2");
    });

    it("Should revert when deleting non-existent key", async function () {
      await expect(
        keyValueStore.connect(user1).remove("nonExistent")
      ).to.be.revertedWith("Key does not exist");
    });

    it("Should update keys array correctly", async function () {
      await keyValueStore.connect(user1).remove("key2");
      const keys = await keyValueStore.connect(user1).getAllKeys();
      expect(keys).to.have.lengthOf(2);
      expect(keys).to.include("key1");
      expect(keys).to.include("key3");
      expect(keys).to.not.include("key2");
    });
  });

  describe("Exists", function () {
    it("Should return true for existing keys", async function () {
      await keyValueStore.connect(user1).set("existingKey", "value");
      expect(await keyValueStore.connect(user1).exists("existingKey")).to.be.true;
    });

    it("Should return false for non-existent keys", async function () {
      expect(await keyValueStore.connect(user1).exists("nonExistent")).to.be.false;
    });

    it("Should check existence in specific user namespace", async function () {
      await keyValueStore.connect(user1).set("userKey", "value");
      expect(await keyValueStore.connect(user2).existsFor(user1.address, "userKey"))
        .to.be.true;
      expect(await keyValueStore.connect(user2).existsFor(user2.address, "userKey"))
        .to.be.false;
    });
  });

  describe("GetAllKeys", function () {
    it("Should return all keys for a user", async function () {
      await keyValueStore.connect(user1).set("key1", "value1");
      await keyValueStore.connect(user1).set("key2", "value2");
      await keyValueStore.connect(user1).set("key3", "value3");
      
      const keys = await keyValueStore.connect(user1).getAllKeys();
      expect(keys).to.have.lengthOf(3);
      expect(keys).to.include("key1");
      expect(keys).to.include("key2");
      expect(keys).to.include("key3");
    });

    it("Should return empty array for user with no keys", async function () {
      const keys = await keyValueStore.connect(user1).getAllKeys();
      expect(keys).to.have.lengthOf(0);
    });

    it("Should get keys from another user's namespace", async function () {
      await keyValueStore.connect(user1).set("user1Key", "value");
      const keys = await keyValueStore.connect(user2).getAllKeysFor(user1.address);
      expect(keys).to.have.lengthOf(1);
      expect(keys[0]).to.equal("user1Key");
    });
  });

  describe("GetKeyCount", function () {
    it("Should return correct key count", async function () {
      expect(await keyValueStore.connect(user1).getKeyCount()).to.equal(0);
      
      await keyValueStore.connect(user1).set("key1", "value1");
      expect(await keyValueStore.connect(user1).getKeyCount()).to.equal(1);
      
      await keyValueStore.connect(user1).set("key2", "value2");
      expect(await keyValueStore.connect(user1).getKeyCount()).to.equal(2);
      
      await keyValueStore.connect(user1).remove("key1");
      expect(await keyValueStore.connect(user1).getKeyCount()).to.equal(1);
    });

    it("Should get key count for another user", async function () {
      await keyValueStore.connect(user1).set("key1", "value1");
      await keyValueStore.connect(user1).set("key2", "value2");
      
      expect(await keyValueStore.connect(user2).getKeyCountFor(user1.address))
        .to.equal(2);
    });
  });

  describe("Upgradeability", function () {
    it("Should allow owner to upgrade", async function () {
      const KeyValueStoreV2 = await ethers.getContractFactory("KeyValueStore");
      const upgraded = await upgrades.upgradeProxy(keyValueStore.address, KeyValueStoreV2);
      expect(upgraded.address).to.equal(keyValueStore.address);
    });

    it("Should preserve state after upgrade", async function () {
      await keyValueStore.connect(user1).set("persistKey", "persistValue");
      
      const KeyValueStoreV2 = await ethers.getContractFactory("KeyValueStore");
      const upgraded = await upgrades.upgradeProxy(
        keyValueStore.address,
        KeyValueStoreV2
      );
      
      expect(await upgraded.connect(user1).get("persistKey")).to.equal("persistValue");
    });
  });

  describe("Length Limits", function () {
    it("Should enforce key length limit", async function () {
      const longKey = "a".repeat(257); // MAX_KEY_LENGTH + 1
      await expect(
        keyValueStore.connect(user1).set(longKey, "value")
      ).to.be.revertedWith("Key too long");
    });

    it("Should enforce value length limit", async function () {
      const longValue = "a".repeat(8193); // MAX_VALUE_LENGTH + 1
      await expect(
        keyValueStore.connect(user1).set("key", longValue)
      ).to.be.revertedWith("Value too long");
    });

    it("Should accept maximum allowed lengths", async function () {
      const maxKey = "a".repeat(256); // MAX_KEY_LENGTH
      const maxValue = "b".repeat(8192); // MAX_VALUE_LENGTH
      
      await keyValueStore.connect(user1).set(maxKey, maxValue);
      expect(await keyValueStore.connect(user1).get(maxKey)).to.equal(maxValue);
    });
  });

  describe("Pagination", function () {
    beforeEach(async function () {
      // Add 10 keys for testing
      for (let i = 0; i < 10; i++) {
        await keyValueStore.connect(user1).set(`key${i}`, `value${i}`);
      }
    });

    it("Should paginate keys correctly", async function () {
      const [keys1, hasMore1] = await keyValueStore.connect(user1).getKeysPaginated(0, 5);
      expect(keys1).to.have.lengthOf(5);
      expect(hasMore1).to.be.true;
      
      const [keys2, hasMore2] = await keyValueStore.connect(user1).getKeysPaginated(5, 5);
      expect(keys2).to.have.lengthOf(5);
      expect(hasMore2).to.be.false;
    });

    it("Should handle offset beyond total keys", async function () {
      const [keys, hasMore] = await keyValueStore.connect(user1).getKeysPaginated(20, 5);
      expect(keys).to.have.lengthOf(0);
      expect(hasMore).to.be.false;
    });

    it("Should handle limit exceeding remaining keys", async function () {
      const [keys, hasMore] = await keyValueStore.connect(user1).getKeysPaginated(7, 10);
      expect(keys).to.have.lengthOf(3);
      expect(hasMore).to.be.false;
    });

    it("Should paginate for other users", async function () {
      const [keys, hasMore] = await keyValueStore.connect(user2).getKeysPaginatedFor(user1.address, 0, 3);
      expect(keys).to.have.lengthOf(3);
      expect(hasMore).to.be.true;
    });
  });
});