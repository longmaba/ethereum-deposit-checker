const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const Tx = require('ethereumjs-tx');
const EventEmitter = require('events');

module.exports = (
  url,
  mainWalletAddress,
  addressHandler,
  readBlockNumberHandler,
  writeBlockNumberHandler,
  privateKeyProvider
) => {
  const web3 = new Web3(url);
  const EthDepositChecker = {};
  let processing = false;
  const eventEmitter = new EventEmitter();

  EthDepositChecker.onReceiveTransaction = (cb) => eventEmitter.on('vanityTransaction', cb);

  EthDepositChecker.checkBlock = async () => {
    if (processing) {
      return;
    }
    processing = true;
    try {
      let blockNumber = await readBlockNumberHandler();
      const currentBlockNumber = await web3.eth.getBlockNumber();
      if (blockNumber == null) {
        console.log(
          `First time running at block ${currentBlockNumber.toString()}`
        );
        await checkSingleBlock(currentBlockNumber);
        return;
      }

      while (blockNumber < currentBlockNumber) {
        blockNumber++;
        await checkSingleBlock(blockNumber);
      }
    } finally {
      processing = false;
    }
  };

  const checkSingleBlock = async blockNumber => {
    console.log(`Checking block ${blockNumber.toString()}`);
    const block = await web3.eth.getBlock(blockNumber, true);
    if (block == null) {
      return;
    }
    console.log(
      `Found block ${blockNumber.toString()} with ${block.transactions.length} transactions`
    );
    const addresses = block.transactions.map(t => t.to);
    const filteredAddresses = await addressHandler(addresses);
    console.log(
      `Number of interested vanity address: ${filteredAddresses.length}`
    );
    const txs = block.transactions.filter(
      t => filteredAddresses.indexOf(t.to) != -1
    );

    for (let tx of txs) {
      await sendToMainWallet(tx.to, tx.value);
      eventEmitter.emit('vanityTransaction', tx.hash, tx.to, tx.value);
    }
    await writeBlockNumberHandler(blockNumber);
  };

  const sendToMainWallet = async (vanityAddress, value) => {
    try {
      let privateKey = await privateKeyProvider(vanityAddress);
      var gasPrice = await web3.eth.getGasPrice();
      var maxGas = await web3.eth.estimateGas({
        to: mainWalletAddress
      });
      var txCount = await web3.eth.getTransactionCount(vanityAddress);
      var sendable = new BigNumber(value).minus(
        new BigNumber(gasPrice).times(maxGas)
      );

      privateKey = new Buffer(privateKey, 'hex');

      var rawTx = {
        nonce: `0x${txCount.toString(16)}`,
        gasPrice: `0x${new BigNumber(gasPrice).toString(16)}`,
        gasLimit: `0x${new BigNumber(maxGas).toString(16)}`,
        to: mainWalletAddress,
        value: `0x${sendable.toString(16)}`
      };
      const tx = new Tx(rawTx);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      return await sendRawTransaction(serializedTx);
    } catch (e) {
      console.error(e);
    }
  };

  const sendRawTransaction = tx =>
    new Promise((resolve, reject) => {
      web3.eth.sendSignedTransaction('0x' + tx.toString('hex'), (err, hash) => {
        if (err) {
          return reject(err);
        }
        resolve(hash);
      });
    });

  return EthDepositChecker;
};
