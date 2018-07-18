App = {
  web3Provider : null,
  contracts : {},
  account : '0x0',
  loding : false,
  tokenPrice : 1000000000000000,
  tokenSold : 0,
  tokensAvailable : 750000,


  init:function(){
    console.log('App initialized');
    return App.initWeb3();

  },
  initWeb3:function () {
    if(typeof web3 !== 'undefined'){
      // if a web3 instance is already provided by Meta Mask
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    }else {
      // specify default instance if no web3 instance is not provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },
  initContracts:function () {
    $.getJSON("DappTokenSale.json",function (dappTokenSale) {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then(function (dappTokenSale) {
        console.log('Dapp Token Sale Address :'+dappTokenSale.address);
      });

    }).done(function(){
        $.getJSON("DappToken.json",function (dappToken) {
          App.contracts.DappToken = TruffleContract(dappToken);
          App.contracts.DappToken.setProvider(App.web3Provider);
          App.contracts.DappToken.deployed().then(function (dappToken) {
            console.log('Dapp Token address '+ dappToken.address);
          });
          App.listentForEvents();
          return App.render();
        });

      });

  },
  listentForEvents : function functionName() {
    App.contracts.DappTokenSale.deployed().then(function (instance) {
      instance.Sell({},{
        fromBlock : 0,
        toBlock : 'latest',
      }).watch(function (error, event) {
        console.log('Event triggered ', event);
        App.render();
      });

    });
  },

  render:function () {
    if(App.loading ){
      return;
    }
    App.loading = true;

    var loader =$('#loader');
    var content =  $('#content');
    loader.show();
    content.hide();
    // load acccount data
    web3.eth.getCoinbase(function (error,account) {
      if(error === null){
        App.account = account;
        $('#acccountAddress').html("Your Account: "+account);
      }

    })
    //App.contract
    App.contracts.DappTokenSale.deployed().then(function (instance) {
      dappTokenSaleInstance = instance;
      return dappTokenSaleInstance.tokenPrice();
    }).then(function (tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice,"ether").toNumber());
      return dappTokenSaleInstance.tokenSold();
    }).then(function (tokenSold) {
      App.tokenSold = tokenSold.toNumber();
      $('.tokens-sold').html(App.tokenSold);
      $('.tokens-available').html(App.tokensAvailable);
      var progressPercent = (App.tokenSold/App.tokensAvailable) * 100;
      $('.progress-bar').css('width',progressPercent + '%')
      // load tokne contracts
      App.contracts.DappToken.deployed().then(function (instance) {
        dappTokenInstance = instance;
        return dappTokenInstance.balanceOf(App.account);

      }).then(function (balance) {
        console.log('balance '+balance);
        $('.dapp-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      });
    });
  },
  buyTokens : function () {
    $('#content').hide();
    $('loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.DappTokenSale.deployed().then(function (instance) {

      return instance.buyTokens(numberOfTokens,{
        from :App.account,
        value : numberOfTokens * App.tokenPrice,
        gas : 500000
      });

    }).then(function (result) {
      console.log('Tokens bought ....');
      $('form').trigger('reset');// reset number of tokens in the util.format(tpl, val);
      //wait for sell event
      $('#loader').show();
      $('#content').hide();
    });
  }
}
$ (function(){
  $(window).load(function () {
    App.init();

  })
});
