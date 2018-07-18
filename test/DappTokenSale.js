var DappTokenSale = artifacts.require("./DappTokenSale.sol");
var DappToken = artifacts.require("./DappToken.sol");

contract('DappTokenSale', function(accounts){

  var tokenSaleInstance;
  var tokenInstance;
  var tokenPrice = 1000000000000;// wei
  var tokensAvailable = 750000;
  var numberOfTokens;
  var admin = accounts[0];
  var buyer = accounts[1];
  it('it initializes the contract with the correct values',function(){
    return  DappTokenSale.deployed().then(function(instance){
      tokenSaleInstance = instance;
      return tokenSaleInstance.address;
    }).then(function(address){
      console.log('token sale contract address is '+ address);
      assert.notEqual(address,0X0,'has contract address');
      return tokenSaleInstance.tokenContract();
    }).then(function(address){
      console.log('token contract address is '+ address);
      assert.notEqual(address,0X0,'has contracttoken address');
      return tokenSaleInstance.tokenPrice();
    }).then(function(price){
      assert.equal(price,tokenPrice,'has token price');
    });
  });

  it('facilitates token buying',function(){
    return DappToken.deployed().then(function(instance){
      // first grab token  instance
      tokenInstance = instance;
      return DappToken.deployed();
    }).then(function(instance){
      // then grab token sale instance
      tokenInstance = instance;
      // 75% of token supply
      return tokenInstance.transfer(tokenSaleInstance.address,tokensAvailable,{from : admin});
    }).then(function(receipt){
      numberOfTokens = 10;


      return tokenSaleInstance.buyTokens(numberOfTokens,{from : buyer, value: numberOfTokens * tokenPrice})
    }).then(function(receipt){
      assert.equal(receipt.logs.length,1,'triggers the event');
      assert.equal(receipt.logs[0].event,'Sell','should be the sell event');
      assert.equal(receipt.logs[0].args._buyer,buyer,'logs the account that purchansed the event');
      assert.equal(receipt.logs[0].args._amount,numberOfTokens,'logs the number of tokens purchansed');

      return tokenSaleInstance.tokenSold()

    }).then(function(amount){
      assert.equal(amount.toNumber(),numberOfTokens,'increaments number of tokens sold');
      return tokenInstance.balanceOf(buyer);
    }).then(function(balance){
      assert.equal(balance.toNumber(),numberOfTokens);
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance){
      assert.equal(balance.toNumber(),tokensAvailable - numberOfTokens);
      // try to buy tokesn different ffrom ether values
      return tokenSaleInstance.buyTokens(numberOfTokens,{from : buyer, value : 1});
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0,'msg.value must equal number of tokens in wei');
      return tokenSaleInstance.buyTokens(800000,{from : buyer, value :  numberOfTokens * tokenPrice});
    }).then(assert.fail).catch(function(error1){

      assert(error1.message.indexOf('revert') >= 0,'cannot buy more tokens');
    });

  });

it('ends token sale',function(){
    return DappToken.deployed().then(function (instance) {
      tokenInstance = instance;
      //try to end sales other than admin
      return DappTokenSale.deployed();
    }).then(function(instance){
      tokenSaleInstance = instance;
      return tokenSaleInstance.endSale({from :buyer});
    }).then(assert.fail).catch(function (error) {
      assert(error.message.indexOf('revert')>=0,'admin can only end the sale');
      console.log('admin address is '+admin);
      tokenSaleInstance.endSale({from :admin});
    }).then(function(receipt){
      return tokenInstance.balanceOf(admin);
    }).then(function(balance){
      console.log('is tokenSaleInstance available'+tokenSaleInstance.value);
      assert.equal(balance.toNumber(),999990,'returns all unsoled token to admin');
    /*  return tokenSaleInstance.tokenPrice();

    }).then(function(price){
      assert.equal(price.toNumber(),0,'token price was reset');*/
    });
  });
});
