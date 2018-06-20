# EthDepCheck (Ethereum Deposit Checker)
## Installation

Install Ethereum Deposit Checker
```
$ npm install ethereum-deposit-checker
```

## Usage
See `test.js` for more information
### Construction
```
var checker =  new EthDepositChecker(
  "http://127.0.0.1:8545",
  // geth/parity node address
  // can use Ganache to test 
  // or infura for production
  "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", 
  // main wallet address (ETH will be transfered to this address)
  addressHandler, 
  // a callback function
  // takes an array of addresses that have transaction in a block
  // return an array of addresses that the system generated and stored
  getCurrentBlock, 
  // a callback function
  // return the last processed blockNumber
  // or null 
  // on the first one
  setCurrentBlock, 
  // a callback function 
  // takes a processed blockNumber
  // can be used to write to db
  privateKeyProvider 
  // a callback function
  // takes a vanity address (string)
  // and return its private key
  // (saved to db)
);
```
### Listen to the event fired when ETH is deposited
```
checker.onReceiveTransaction(console.log);
```
Use the event `onReceiveTransaction`, to get transactionHash, vanity address, and deposit amount (in wei).
In the example above, the program only prints the 3 information above.
