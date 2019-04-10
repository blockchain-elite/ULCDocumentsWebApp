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

const officialBlockchainEliteModerator = "0x0"; //not published yet
const ropstenBlockchainEliteModerator = "0xafAC243f4ECfa5E91EF0aB0f43A5235D74D67dBe"; // V3
const devBlockchainEliteModerator = "0x0"; //internal node related.

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
  Loading : 6, // loading object
  TxProcessing: 7, // The transaction is being processed
  TransactionSuccess: 8, // The transaction was a success
  TransactionFailure: 9,  // The transaction failed
  Unknown : 10 // Object not yet checked
};

// Special keys used in moderator info Map
const moderatorReservedKeys = {
    status: 'connection-status',
    contact: 'contact-link',
    register: 'registration-link',
    search: 'search-link'
};

//Used when we query Moderator
const resultQueryStatus = {
    unknown : 'unknown',
    revoked : 'revoked',
    initialized : 'initialized',
    confirmed : 'confirmed',
    inError : 'error'
};

// Special keys used in kernel info Map
const kernelReservedKeys = {
    name: 'name',
    revokedReason : 'revokedReason',
    isOrganisation: 'isOrganisation',
    version: 'version',
    url: 'url',
    mail: 'mail',
    phone: 'phone',
    status: 'resultQuery-status',
    img: 'img',
    physicalAddress: 'physicalAddress',
    extraData: 'extra-data'
};

// Special keys used in element info Map
const elementReservedKeys = {
    status: 'element-status',
    date: 'date',
    source: 'source',
    documentFamily: 'document_family',
    revokedReason : 'revoked_reason',
    extraData: 'extra-data'
};

//Special Keys used in fetch purpose
const fetchElementReservedKeys = {
    signNeed : 'signatures-needed',
    signPending: 'signatures-pending'
};
