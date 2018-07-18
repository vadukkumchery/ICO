pragma solidity ^0.4.2;

contract DappToken {

  // Name
  string public name = "Dapp Token";
  // symbol
  string public symbol = "DAPP";
  //standard
  string public standard = "DApp Token v1.0";
   uint256 public totalSupply;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value
    );
  // approved
  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
    );
   mapping (address => uint256) public balanceOf;
   mapping (address => mapping (address => uint256))public allowance;
  //set the constructor
  constructor(uint256 _initialSupply) public{
      balanceOf[msg.sender] = _initialSupply;
      totalSupply = _initialSupply  ;
      // allocate _initial Supply
  }
  // set the total number of tokens
  // read the total number of tokens

  // transfer
  function transfer(address _to, uint256 _value)public  returns (bool success) {
    // exeption if account does not hav e enough
    // transfer event


    require(balanceOf[msg.sender] >= _value);
    // transfter the balance
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    //transfer event
    emit Transfer(msg.sender, _to, _value);

    return true;

  }

  // Delegated tranfer
  function approve(address _spender, uint256 _value) public returns(bool success) {
    //allowance
    allowance[msg.sender][_spender] = _value;
    // apprve event
    emit Approval(msg.sender, _spender, _value);
    return true;


  }


  // transfer _from
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    // require _from has enough tokens
     require(_value <= balanceOf[_from]);
    // require allownace is big enough
    require(_value <= allowance[_from][msg.sender]);
    // change the balanceOf
    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;
    // Update the allownac_fromege balanceOf
    allowance[_from][msg.sender] -= _value;
    // transfer event
    emit Transfer(_from, _to, _value);

    return true;
  }
  //allowance


}
