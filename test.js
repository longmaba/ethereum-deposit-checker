const EthDepChecker = require('./index');

const url = 'http://localhost:8545';
const mainWalletAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';

const data = {
  '0xf17f52151EbEF6C7334FAD080c5704D77216b732': 'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
  '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef': '0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1',
  '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544': 'c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c',
  '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2': '388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418',
  '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e': '659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63',
  '0x73dee476efc2acb74cd91ae681a015d25bb4846e': '3cb7a93dcf6a8be4d9dbbac83be5e85fae318b473f2ecd6ac0ebf687f21a185b'
};

const interestedAddresses = Object.keys(data).map(addr => addr.toLowerCase());

const privateKeys = {};

for (let addr of Object.keys(data)) {
  privateKeys[addr.toLowerCase()] = data[addr];
}

const addressHandler = async addresses => {
  return addresses.filter(
    a => interestedAddresses.indexOf(a.toLowerCase()) !== -1
  );
};

let blockNumber = null;

const checker = EthDepChecker(
  url,
  mainWalletAddress,
  addressHandler,
  () => blockNumber,
  bn => (blockNumber = bn),
  addr => privateKeys[addr.toLowerCase()]
);

checker.onReceiveTransaction(console.log);

setInterval(() => checker.checkBlock(), 1000);
