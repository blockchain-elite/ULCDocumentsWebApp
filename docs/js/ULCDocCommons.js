/*  Copyright 2019 Blockchain-Élite dev team
	This file is part of ULCDocuments Web App.
	ULCDocuments Web App is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	ULCDocuments Web App is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	You should have received a copy of the GNU General Public License
	along with ULCDocuments Web App.  If not, see <http://www.gnu.org/licenses/>.
*/

/*  ULCDOCUMENTS MASTER JAVASCRIPT HANDLER (COMMON READ+WRITE)
*  @author Adrien BARBANSON <contact link in blockchain-elite.fr>
*  @author Arnaud VERGNET <>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

//Prefix used in logMe() function
const UIManagerPrefix = "UI";
const ULCDocModMasterPrefix = "MASTER";

const TypeInfo = {
  Info: 1, //this is a simple information
  Good: 2, //this information is good news
  Warning: 3, //this information need special attention
  Critical: 4 //this information is critical
};

const TypeConnection = {
    Mainnet : 1,  //Mainnet Ethereum
    Morden : 2,  //Morden testnet
    Ropsten : 3, //Ropsten testnet
    Rinkeby : 4, //Rinkeby testnet
    Kovan : 42, //Kovan testnet
    Unkown : 0 //Unknown testnet
};

const TypeElement = {
    /* BLOCKCHAIN ANSWER RELATED */
  Signed: 1, //the element is signed by the kernel
  Revoked : 2,
  Fake: 3,  //the element is not signed by the kernel
  Invalid: 4, //an error occured when asking the kernel
  Pending : 5, // Process to sign the document is started but not OK
    /* UI RELATED */
  Computing : 6, // computing hash
  Loading : 7, // loading object
  TxProcessing: 8, // The transaction is being processed
  TransactionSuccess: 9, // The transaction was a success
  TransactionFailure: 10,  // The transaction failed
  Unknown : 11 // Object not yet checked
};

fetchSignStatus = function(signPending, _isSignedByAddress){
    this.signPending = _signPending;
    this.isSignedByAddress = _isSignedByAddress;
}

/**
 * @title Specific error if there is a conflict between web3 network and URL network.
 * @param _message {String} message displayed
 * @param _network {TypeConnection} the network which injected wallet is.
 */
networkConflictError = function(_message, _network){
        this.constructor.prototype.__proto__ = Error.prototype;
        this.name = this.constructor.name;
        this.message = _message;
        this.network = _network;
}

blockchainError = function(_message){
    this.constructor.prototype.__proto__ = Error.prototype;
    this.name = this.constructor.name;
    this.message = _message;
}
