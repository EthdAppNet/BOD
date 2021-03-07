
App = {
  web3Provider: null,
  contracts: {},
  
  

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.render();

      
    });
  },

  // base subscription : a payable function 

  baseSub: function() {
    var usrID = $("#usrID").val();
    var planSelect = $("#planSelect").val();
    console.log("munim" + ":"+usrID +":"+ planSelect );
   var  paybaseSub = '0000000000000000000'; 
        if (planSelect=='Monthly'){
      paybaseSub = '4000000000000000000';
    }
      else {
      paybaseSub = '6000000000000000000'; 
    }
App.contracts.Election.deployed().then(function(instance) {
    instance.baseSub(usrID, planSelect, {value:paybaseSub, gas: '6721975', gasPrice: '20000000000'});
    }).then(function(result) {
    }).catch(function(err) {
    }).then($("#activeSub").html("<b>Active Plan:</b>" + planSelect));
  },

 //Bandwidth on demand
  
  BOD: function(){
   var usrID_BOD = $("#usrID_BOD").val();
   var BW = $("#BW").val();
   var Dur = $("#Dur").val();
   var perMin = 456621004566;
   //calculating BOD amount : per min cost x BW x Dur ; 
   var payBOD = perMin* BW * Dur ;
    console.log(usrID_BOD);
    console.log(BW);
    console.log(Dur);
    App.contracts.Election.deployed().then(function(instance) {
    instance.bOdSub(BW, Dur, usrID_BOD, {value: payBOD.toString(), gas: '6721975', gasPrice: '20000000000'});
    }).then(function(result) {
   // App.render();
    }).catch(function(err) {});
},

render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.hide();
    content.hide();

    // Load account data
    if(web3.currentProvider.enable){
      //for metamask
      web3.currentProvider.enable().then(function(acc){
        App.account=acc[0];
        $("#accountAddress").html("<b>your account:</b>" + App.account);
      });
    } else {
      App.account= web3.eth.accounts[0];
      $("#accountAddress").html("your account from else:" + App.account);
    }

    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.seePlans();
    }).then(function(seePlans){
      var temp= seePlans;
      temp = seePlans.split(',');
      var w= $("#seePlans").html("Available Plans: " + temp[0]);
      var planTemplate_1 = "<tr><th>" + 1 + "</th><td>" + temp[0] + "</td><td>" + temp[1] + "</td></tr>"
      var planTemplate_2 = "<tr><th>" + 2 + "</th><td>" + temp[2] + "</td><td>" + temp[3] + "</td></tr>"
          planResults=$("#planResults");
          planResults.append(planTemplate_1);
          planResults.append(planTemplate_2);
      var planOption_1 = "<option value='" + temp[0] + "' >" + temp[0] + "</ option>"
      var planOption_2 = "<option value='" + temp[2] + "' >" + temp[2] + "</ option>"
      planSelect=$("#planSelect");
      planSelect.append(planOption_1);
      planSelect.append(planOption_2);
      
      });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};
      $("#content").hide();
      $("#loader").show();
$(function() {
  $(window).load(function() {
    App.init();
  });
});
