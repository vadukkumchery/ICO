pragma solidity ^0.4.2;

import "./DappToken.sol";

contract DappTokenSale {

  address admin;
  DappToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokenSold;

  event Sell(address _buyer, uint256 _amount);

  constructor(DappToken _tokenContract,uint256 _tokenPrice) public {
    // Assign admin
    admin = msg.sender;
    //Token contract
    tokenContract = _tokenContract;
    // token price
    tokenPrice = _tokenPrice;

  }

  // mulitpl
  function multiply(uint x, uint y) internal pure returns (uint z) {
    require (y == 0 || (z = x*y)/y ==x);

  }

  // buy tokens
  function buyTokens(uint256 _numberOfTokens) public payable {
    // require tht value is equal to the tokenSaleInstance
    require(msg.value == multiply(_numberOfTokens, tokenPrice));
    // requre that contract has sufficient tokens
    require(tokenContract.balanceOf(this) >= _numberOfTokens);
    // requre transfer is success
    require(tokenContract.transfer(msg.sender,_numberOfTokens));
    // keep track of number of tokens sold
    tokenSold += _numberOfTokens;
    //trigger an event
    emit Sell(msg.sender,_numberOfTokens);
  }

  // ending token sale
  function endSale()public {
    //require admin
    require(msg.sender  == admin);
    //transfer remain daptokens to admin

    require(tokenContract.transfer(admin,tokenContract.balanceOf(this)));
    // destroy contract
    selfdestruct(admin);

  }

}
