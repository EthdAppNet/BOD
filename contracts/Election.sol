// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.4.22 <0.9.0;
contract Election{

string plan_1;
string plan_2;
uint256 feePlan_1;
uint256 feePlan_2; 
string public seePlans; 
uint256 public subscriberCount;    
uint256 BODcount;  


  //plans and charges
    constructor()public {
        plan_1 = "Monthly";
        plan_2 = " Yearly";
        feePlan_1 = 4000000000000000000; 
        feePlan_2 = 6000000000000000000; 
        seePlans = "Monthly, 1ETH, Yearly, 2ETH";
        }
    
    //subscriber base
        mapping (uint256 => subscription)public subList;
    struct subscription {
        string plan;
        address subscriber_addr; 
        uint256 subscriber_ID;
    }
      //BOD base
        mapping (uint256 => BOD)public BODList;
    struct BOD {
        uint256 duration;
        uint256 BW;
        address BOD_addr; 
        uint256 BOD_ID;
    }

  
    //add subscriber and charge fee 
    function baseSub(uint256 _usrID, string memory _plan) payable public  {
        require ((keccak256(bytes(_plan))==keccak256(bytes(plan_1))&& (msg.value==feePlan_1))||(keccak256(bytes(_plan))==keccak256(bytes(plan_2))&& (msg.value==feePlan_2)));
        subscriberCount++;
        subList[subscriberCount-1]=subscription(_plan, msg.sender,  _usrID);
        }
    
    //BOD request and fee (free till Zokerates proof)
    function bOdSub( uint256 _BW, uint256 _Dur, uint256 _usrID) payable public {
        for (uint256 i=0; i<=subscriberCount; i++){
        if (subList[i].subscriber_ID==_usrID){
            BODcount++;
            BODList[BODcount-1]=BOD(_Dur, _BW, msg.sender, _usrID);
                }     
            }
        }
}