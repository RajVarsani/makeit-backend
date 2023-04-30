// Import web3.js library
const Web3 = require("web3");
const abiData = require("./helpers/abi");
// Set up web3 provider and contract instance
const providerUrl = "https://rpc.sepolia.org/";
const web3 = new Web3(providerUrl);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = abiData;
const contract = new web3.eth.Contract(abiData, contractAddress);

// Add private key to web3 provider's wallet
const privateKey = process.env.ACCOUNT_PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

// Set the default account for the web3 instance
web3.eth.defaultAccount = account.address;
console.log("Default account:", web3.eth.defaultAccount);

class BlockchainService {
  nonce = 0;

  constructor() {
    web3.eth.getTransactionCount(web3.eth.defaultAccount).then((count) => {
      this.nonce = count++;
      console.log("Nonce:", this.nonce);
    });
  }
  async pushOrder(orderId, productId, userId, status, sellerId, itemIndex = 0) {
    try {
      this.nonce = this.nonce + 2;
      const recipt = await contract.methods
        .pushOrder(orderId, productId, userId, status, sellerId)
        .send({
          from: web3.eth.defaultAccount,
          gas: 200000 + itemIndex * 40000,
          nonce: this.nonce,
        });

      console.log("Transaction receipt:", recipt);
      return recipt;
    } catch (error) {
      console.error("error in pushOrder", error);
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const recipt = await contract.methods
        .updateOrderStatus(orderId, newStatus)
        .send({
          from: web3.eth.defaultAccount,
          gas: 200000,
          nonce: ++this.nonce,
        });

      console.log("Transaction receipt:", recipt);
      return recipt;
    } catch (error) {
      console.error("error in updateOrderStatus", error);
    }
  }

  async getOrder(orderId) {
    try {
      const order = await contract.methods.getOrder(orderId).call();
      console.log("Order:", order);
      return order;
    } catch (error) {
      console.error("error in getOrder", error);
    }
  }
}

export default new BlockchainService();
