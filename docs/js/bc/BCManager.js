/*
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

/*  ULCDOCUMENTS MASTER JAVASCRIPT MANAGER (COMMON READ+WRITE)
*  @author Adrien BARBANSON <Contact Form On Blockchain-Élite website>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

/*************
*  CONST PART*
**************/
const kernelVersionCompatibility = [4];
const moderatorVersionCompatibility = [2];
const hashMethodsCompatibility = ["SHA3-256"];

//TODO: Handle "HASH_ALGORITHM" info & compatibility

/*************
*  GLOBAL VAR*
**************/

var WALLET_ACTIVATED;

var CONF_ADDRESS_MOD;

var CONF_TYPE_CONNECTION;

var CONF_ADDRESS_KERNEL;

var ULCDocMod;
var ULCDocKernel;

var INFO_SIGNATURES_NEEDED;
var INFO_ACCOUNT_LOADED;
var INFO_HASH_NEEDED;
var KERNEL_FAMILY_AVAIABLE;

var web3js;

/*****************
*  MAIN FUNCTIONS*
******************/

/**
* @dev Function that is loaded at the beginning. Update connection info
* @param error {Number} if an error occured when identificating Network
* @param sNetwork {TypeConnection} the network code identified */

function startApp(error, sNetwork) {
    logMe(ULCDocModMasterPrefix,"StartApp starting ...");

    if(error){
        sendNotification(TypeInfo.Critical,"Error","Impossible to get network code");
        logMe(ULCDocModMasterPrefix,"Error. Network code : " + sNetwork,TypeInfo.Critical);
        // @TODO : handle this case.
    }

    //we instanciate smart contract with adequate addresses
    logMe(ULCDocModMasterPrefix,"Identificating network");

    if (sNetwork == TypeConnection.Mainnet && !WALLET_ACTIVATED){
        CONF_ADDRESS_MOD = officialBlockchainEliteModerator;
        UI.updateNetworkConnectedUI(TypeConnection.Mainnet, TypeInfo.Good);
        CONF_TYPE_CONNECTION = TypeConnection.Mainnet;
        sendNotification(TypeInfo.Good, "Connected !", "Ethereum Mainnet with Infura provider ");
    }
    else if(sNetwork == TypeConnection.Mainnet){
        CONF_TYPE_CONNECTION = TypeConnection.Mainnet;
        CONF_ADDRESS_MOD = officialBlockchainEliteModerator;
        UI.updateNetworkConnectedUI(TypeConnection.Mainnet, TypeInfo.Good);
        sendNotification(TypeInfo.Good, "Connected !", "Ethereum Mainnet");
    }
    else if(sNetwork == TypeConnection.Ropsten){
        CONF_ADDRESS_MOD = ropstenBlockchainEliteModerator;
        CONF_TYPE_CONNECTION = TypeConnection.Ropsten;
        UI.updateNetworkConnectedUI(TypeConnection.Ropsten, TypeInfo.Warning);
        sendNotification(TypeInfo.Good, "Connected !", "Ethereum Ropsten Testnet. Please note that signatures can't be trusted.");
    }
    else {
        CONF_TYPE_CONNECTION = TypeConnection.Unkown;
        UI.updateNetworkConnectedUI(TypeConnection.Unkown, TypeInfo.Critical);
        CONF_ADDRESS_MOD = devBlockchainEliteModerator; //## temporaire
        sendNotification(TypeInfo.Critical, "Connection to Unkown host!", "Host you're connected can't be identified : " + sNetwork);
    }

    logMe(ULCDocModMasterPrefix,"Loading SM Moderator link...");

    ULCDocMod = new web3js.eth.Contract(ULCDocModABI, CONF_ADDRESS_MOD);

    if(updateModeratorInfo(ULCDocMod)){
        logMe(ULCDocModMasterPrefix,"SM Moderator link OK");
    }
    else {
        logMe(ULCDocModMasterPrefix,"Fatal error loading Blockchain Élite moderator !", TypeInfo.Critical);
    }



    //we set up UI componants regarding if wallet is avaiable
    UI.updateWalletStateUI(WALLET_ACTIVATED);
    logMe(ULCDocModMasterPrefix,"Wallet state:" + WALLET_ACTIVATED);
}

/**
*    @dev function that says if kernel is compatible with this webApp
*    @param {String} addressKernel the adress of the kernel to check
*    @return {Bool} is the Kernel is compatible with Blockchain this app or not
*/
async function isKernelCompatible(addressKernel){

    let versionCompatible = false;
    let hashCompatible = false;
    let kernelVersion;

    let ULCDocKernelTest = new web3js.eth.Contract(ULCDocKernelABI, addressKernel);

    try {
        kernelVersion = await ULCDocKernelTest.methods.Contract_Version().call();
        kernelHashFormat = await ULCDocKernelTest.methods.HASH_ALGORITHM().call();
    }catch(error){
        sendNotification(TypeInfo.Critical, "Error Kernel Loading", "Impossible to reach Kernel Compatibility Info.");
        logMe(ULCDocModMasterPrefix, "Error while reaching kernel version : " + error, TypeInfo.Critical);
        return false;
    }

    //convert it as number type, because it's string type
    kernelVersion = Number(kernelVersion);

    //we check if the Kernel version  is compatible with our list
    for (ver of kernelVersionCompatibility){
        if (kernelVersion === ver) {
            versionCompatible = true;
            break;
        }
    }

    if(!versionCompatible){
        sendNotification(TypeInfo.Critical,"Incompatible Kernel Version","The Kernel's Version is not compatible with this webApp !");
        logMe(ULCDocModMasterPrefix,"Kernel Version not compatible : " + kernelVersion);
        return false;
    }

    for (hash of hashMethodsCompatibility){
        if (kernelHashFormat === hash) {
            hashCompatible = true;
            break;
        }
    }

    if(!hashCompatible){
        sendNotification(TypeInfo.Critical,"Incompatible Kernel Hash Methods","The hash method of the kernel is not compatible with this webApp !");
        logMe(ULCDocModMasterPrefix,"Kernel Hash not compatible : " + kernelHashFormat);
        return false;
    }

    //if compatible both, then fully compatible :)
    return  true;
}

/**
*   @dev function that return information about a Kernel
*   @param {String} addressKernel the address of the kernel to check
*   @return {Map} A map with all Moderator info about the kernel
*   Specific key : "status", resultQueryStatus
*/
async function queryModerator(addressKernel){

    let moderatorInfoKernel = new Map();

    try {
        let queryResultIdentity = await ULCDocMod.methods.Kernel_Identity_Book(addressKernel).call();

        if(queryResultIdentity["isRevoked"]){
            moderatorInfoKernel.set(kernelReservedKeys.status, resultQueryStatus.revoked);
            moderatorInfoKernel.set(kernelReservedKeys.revokedReason, queryResultIdentity["revoked_reason"]);
        }
        else if (queryResultIdentity["confirmed"]) {
            moderatorInfoKernel.set(kernelReservedKeys.status, resultQueryStatus.confirmed);
            moderatorInfoKernel.set(kernelReservedKeys.name,queryResultIdentity["name"]);
            moderatorInfoKernel.set(kernelReservedKeys.version, queryResultIdentity["version"].toString());

            //we update detailed info
            try {
                queryResultDetailedInfo = await ULCDocMod.methods.Kernel_Info_Book(addressKernel).call();

                moderatorInfoKernel.set(kernelReservedKeys.isOrganisation, queryResultIdentity["isOrganisation"]);
                moderatorInfoKernel.set(kernelReservedKeys.url, queryResultDetailedInfo["url"]);
                moderatorInfoKernel.set(kernelReservedKeys.mail, queryResultDetailedInfo["mail"]);
                moderatorInfoKernel.set(kernelReservedKeys.img, queryResultDetailedInfo["imageURL"]);
                moderatorInfoKernel.set(kernelReservedKeys.phone,queryResultDetailedInfo["phone"]);
                moderatorInfoKernel.set(kernelReservedKeys.physicalAddress, queryResultDetailedInfo["physicalAddress"]);

                //extracting extra_data if necessary
                if(queryResultDetailedInfo["extra_data"] !== "" && queryResultDetailedInfo["extra_data"] !== " "){
                    logMe(ULCDocModMasterPrefix,"Extra Data detected, extracting...");
                    moderatorInfoKernel.set(kernelReservedKeys.extraData, formatExtraData(queryResultDetailedInfo["extra_data"]));
                }
                else {
                    moderatorInfoKernel.set(kernelReservedKeys.extraData, undefined);
                }

            }catch(error){
                sendNotification(TypeInfo.Critical, "Fatal Error!", "Error while reaching kernel moderator detailed info");
                logMe(ULCDocModMasterPrefix,"CRITICAL: Unkown error when reaching queryModerator detailed info",TypeInfo.Critical);
                logMe(ULCDocModMasterPrefix,error);
                moderatorInfoKernel.set(kernelReservedKeys.status, resultQueryStatus.inError);
            }
        }
        else if (queryResultIdentity["initialized"]){
            //here we don't have confirmed but intilizated only.
            moderatorInfoKernel.set(kernelReservedKeys.status, resultQueryStatus.initialized);
        }
        else {
            moderatorInfoKernel.set(kernelReservedKeys.status, resultQueryStatus.unknown);
        }

    } catch(error){
        sendNotification(TypeInfo.Critical, "Fatal Error!", "Error while reaching kernel moderator identity");
        logMe(ULCDocModMasterPrefix,"CRITICAL: Unkown error when reaching queryModerator identity",TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix,error);
        moderatorInfoKernel.set(kernelReservedKeys.status, resultQueryStatus.inError);
    }

    return moderatorInfoKernel;

}


/**@dev function that update the ULCDocKernel.
* @param {String} addressKernel the kernel address you want to update */
async function updateKernelAddress(addressKernel){

    if(web3js.utils.isAddress(addressKernel)){

        //first we need to know if kernel has version compatible with this module.
        let compatible = await isKernelCompatible(addressKernel);

        if(compatible){
            //if the kernel is compatible, we need to ask moderator for kernel info (if any)
            let moderatorInfoKernel = await queryModerator(addressKernel);

            let statusResult = moderatorInfoKernel.get(kernelReservedKeys.status);
            moderatorInfoKernel.delete(kernelReservedKeys.status); // not necessary for UI after.

            if(statusResult === resultQueryStatus.confirmed){ //OK!
                updateKernelObject(addressKernel, moderatorInfoKernel);
            }
            else {
                //we ask UI for unsecure connection
                UI.promptKernelConnectionWarnAnswer(statusResult, statusResult === resultQueryStatus.revoked ? moderatorInfoKernel.get(kernelReservedKeys.revokedReason) : undefined);
            }
        }
        else {
            // Here kernel not compatible, so we return error statement.
            UI.updateKernelConnection(TypeInfo.Critical, undefined);
        }
    }

    else {
        sendNotification(TypeInfo.Critical, "Invalid Address", "The kernel address does not respect format.");
        logMe(ULCDocModMasterPrefix,"Wrong kernel address format");
        UI.updateKernelConnection(TypeInfo.Critical, undefined);
    }
}

/**
    Function that update in masterJS the objet kernel
    @param {String} addressKernel the addresse of the kernel to load
**/
async function updateKernelObject(addressKernel, moderatorInfoKernel){
    CONF_ADDRESS_KERNEL = addressKernel;
    ULCDocKernel  = new web3js.eth.Contract(ULCDocKernelABI, CONF_ADDRESS_KERNEL);

    try {
        let nbSign = await ULCDocKernel.methods.operatorsForChange().call();
        INFO_SIGNATURES_NEEDED = Number(nbSign);
    }catch(error){
        logMe(ULCDocModMasterPrefix, "Impossible to read operatorsForChange", TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix, error);
        sendNotification(TypeInfo.Critical,"Error reading kernel", "Impossible to find security property : number signatures needed");
    }

    try {
        INFO_HASH_NEEDED = await ULCDocKernel.methods.HASH_ALGORITHM().call();
    }catch(error){
        logMe(ULCDocModMasterPrefix, "Impossible to read HASH_ALGORITHM", TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix, error);
        sendNotification(TypeInfo.Critical,"Error reading kernel", "Impossible to find security property : hash-algorithm needed");
    }





    try {
      //use stringified version will reduce significativly number of .call() so reduce time to load a Kernel.
        let stringifiedDocFamily = await ULCDocKernel.methods.DOC_FAMILY_STRINGIFIED().call();
        KERNEL_FAMILY_AVAIABLE = stringifiedDocFamily.split(",");
    }catch(error){
        logMe(ULCDocModMasterPrefix, "Impossible to read docFamily", TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix, error);
        sendNotification(TypeInfo.Critical,"Error reading kernel", "Impossible to find property : docFamily");

    }


    UI.updateKernelConnection(typeof moderatorInfoKernel !== 'undefined' ? TypeInfo.Good : TypeInfo.Warning, moderatorInfoKernel);
    logMe(ULCDocModMasterPrefix,"new kernel link Loaded.");
}


/**
    Function that update some properties of moderator Smart Contract
    like links to contact owner.
    @param {ULCDocMod} testULCDocMod moderator smart contract to get info from
    @return {Bool} if we could get all info or not (errors)
**/
async function updateModeratorInfo(testULCDocMod){
    let mod_info = new Map();

    mod_info.set(moderatorReservedKeys.status, TypeInfo.Good);

    try {
        let result = await testULCDocMod.methods.Moderator_URL().call();
        mod_info.set(moderatorReservedKeys.contact, result);
    }catch(error){
        logMe(ULCDocModMasterPrefix,"error while reaching Moderator_URL",TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix,error);
        sendNotification(TypeInfo.Critical, "Critical error", "Error reaching moderator contact info.");
        mod_info.set(moderatorReservedKeys.status, TypeInfo.Critical);
    }

    try {
        let result = await testULCDocMod.methods.Register_URL().call();
        mod_info.set(moderatorReservedKeys.register, result);
    }catch(error){
        logMe(ULCDocModMasterPrefix,"error while reaching Register_URL",TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix,error);
        sendNotification(TypeInfo.Critical, "Critical error", "Error reaching moderator contact info.");
        mod_info.set(moderatorReservedKeys.status, TypeInfo.Critical);
    }

    try {
        let result = await testULCDocMod.methods.SearchKernel_URL().call();
        mod_info.set(moderatorReservedKeys.search, result);
    }catch(error){
        logMe(ULCDocModMasterPrefix,"error while reaching SearchKernel_URL",TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix,error);
        sendNotification(TypeInfo.Critical, "Critical error", "Error reaching moderator search info.");
        mod_info.set(moderatorReservedKeys.status, TypeInfo.Critical);
    }

    UI.updateModeratorConnection(mod_info);

    if(mod_info.get(moderatorReservedKeys.status) == TypeInfo.Critical){
        return false;
    }
    else {
        return true;
    }

}

/** @dev Function that change the moderator address
* @param addressModerator {String} the new moderator address */
async function updateModeratorAddress(addressModerator){

    if(web3js.utils.isAddress(addressModerator)){

        logMe(ULCDocModMasterPrefix,"Try to change moderator address...");

        //we instanciate new moderator
        let testULCDocMod = new web3js.eth.Contract(ULCDocModABI, addressModerator);

        let compatible = false;
        let moderatorVersion;

        try {
            moderatorVersion = await testULCDocMod.methods.Moderator_Version().call();
        }catch(error){
            sendNotification(TypeInfo.Critical, "Error Moderator Loading", "Impossible to reach Moderator Version Info.");
            logMe(ULCDocModMasterPrefix, "Error while reaching moderator version : " + error, TypeInfo.Critical);
            let mod_info = new Map();
            mod_info.set(moderatorReservedKeys.status, TypeInfo.Critical);
            UI.updateModeratorConnection(mod_info);
            return;
        }

        moderatorVersion = Number(moderatorVersion);

        for (ver of moderatorVersionCompatibility){
            if (moderatorVersion === ver) {
                compatible = true;
            }
        }

        if(!compatible){
            sendNotification(TypeInfo.Critical,"Bad Kernel Version","The version of the kernel is not compatible with this module !");
            logMe(ULCDocModMasterPrefix,"Moderator Version not compatible : " + moderatorVersion);
            let mod_info = new Map();
            mod_info.set(moderatorReservedKeys.status, TypeInfo.Critical);
            UI.updateModeratorConnection(mod_info);
            return;
        }

        let firstInfosSucceed = await updateModeratorInfo(testULCDocMod);

        if (firstInfosSucceed){
            //if updating mod info sucess, then update really.
            CONF_ADDRESS_MOD = addressModerator;
            ULCDocMod = testULCDocMod;
            sendNotification(TypeInfo.Warning,"Moderator changed","A new moderator has been set.");
            logMe(ULCDocModMasterPrefix,"New moderator linked");

            //need to be sure UI is re-initialized for kernel connection.
            CONF_ADDRESS_KERNEL = "";
            ULCDocKernel = null;
        }

    }
    else {
        logMe(ULCDocModMasterPrefix,"Wrong moderator address format");
        let mod_info = new Map();
        mod_info.set(moderatorReservedKeys.status, TypeInfo.Critical);
        UI.updateModeratorConnection(mod_info);
        sendNotification(TypeInfo.Critical, "Invalid Address", "The moderator address does not respect hexadecimal format.");
    }
}

/** @dev Function that check if the file is signed by the kernel
* @param  {File} myFile a file objet to check
* @param  {Number} index the UI index of the file (for UI purpose) */

function checkFile(myFile, index){
    logMe(ULCDocModMasterPrefix,"New file asked !");
    var reader = new FileReader();
    reader.onload = function (event) {
        var data = event.target.result;
        let hash = "-1";
        if(INFO_HASH_NEEDED === "SHA3-256"){
            hash = CryptoJS.SHA3(data,{ outputLength:256 }).toString();
        }
        else {
            logMe(ULCDocModMasterPrefix, "Error : Impossible to select correct hash method.", TypeInfo.Critical);
            sendNotification(TypeInfo.Critical,"Fatal Error when hashing element.");
            return;
        }
        logMe(ULCDocModMasterPrefix,"Success Hashed !");
        UI.updateElementHash(index, hash);
        checkHash(hash,index);
    };
    reader.readAsBinaryString(myFile);
}

/**@dev Function that check if the text is signed by the kernel
* @param  {String} myText the text to hash
* @param  {Number} index the UI index of the file (for UI purpose)*/

function checkText(myText, index){
    logMe(ULCDocModMasterPrefix,"New text asked !");
    let hash = "-1";
    if(INFO_HASH_NEEDED === "SHA3-256"){
        hash = CryptoJS.SHA3(myText,{ outputLength:256 }).toString();
    }
    else {
        logMe(ULCDocModMasterPrefix, "Error : Impossible to select correct hash method.", TypeInfo.Critical);
        sendNotification(TypeInfo.Critical,"Fatal Error when hashing element.");
        return;
    }
    UI.updateElementHash(index, hash);
    checkHash(hash,index);
}

/** @dev Function that check if adresses of the client can publish signatures.
* no param , but need to be connected to a kernel.
* no return , but call a callback function in UI */
async function requestAccountInfo(){

    //Should be called ONLY if you are using dapp browser or MetaMask
    logMe(ULCDocModMasterPrefix, "Process updating account owning...");
    // Acccounts now exposed

    try {
        // Request account access if needed
        await ethereum.enable();

        let allAccountInfo = new Map();
        let localAccount = await web3js.eth.getAccounts();

        INFO_ACCOUNT_LOADED = localAccount[0];

        if(typeof accountInterval !== 'undefined') clearInterval(accountInterval);

        var accountInterval = setInterval(async function() {
            allAccount = await web3js.eth.getAccounts();
            if (allAccount[0] !== INFO_ACCOUNT_LOADED) {
                 location.reload(); //for the moment we completly reload the page.
                 /** @TODO:  Handle this case **/
            }
        }, 2000);

        for(account of localAccount){

            try {
                let result = await ULCDocKernel.methods.owners(account).call();

                if(!result){ //if the address is not owner, then it can still be operator
                    result = await ULCDocKernel.methods.operators(account).call();
                }

                allAccountInfo.set(account,result);
                UI.updateAccounts(allAccountInfo);

            }catch(error){
                logMe(ULCDocModMasterPrefix,"Error reaching owners for account " + account,TypeInfo.Critical);
                logMe(ULCDocModMasterPrefix,error);
                UI.updateAccounts(undefined);
                sendNotification(TypeInfo.Critical,"Error reading kernel","Impossible to read owners of the kernel");
            }

        }
        logMe(ULCDocModMasterPrefix, "Finished updating account owning.");


    } catch (error) {
        // User denied account access...
        sendNotification(TypeInfo.Critical, "Denied Authorisation", "You denied authorisation to view your account. So, impossible to use sign mode.")
        logMe(ULCDocModMasterPrefix, "Error requesting auth ",TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix,error);
        UI.updateAccounts(undefined);
    }


}

/**
    Fetchers : goals is to get State of Element (signed or not) + advancement if they are pending signing
*/

/**
    @param {File} myFile the file to fetch
    @param {Number} index the index for callback
*/
function fetchFile(myFile, index){
    logMe(ULCDocModMasterPrefix,"New file fetched !");
    let reader = new FileReader();
    reader.onload = function (event) {
        let data = event.target.result;
        let hash = "-1";
        if(INFO_HASH_NEEDED === "SHA3-256"){
            hash = CryptoJS.SHA3(data,{ outputLength:256 }).toString();
        }
        else {
            logMe(ULCDocModMasterPrefix, "Error : Impossible to select correct hash method.", TypeInfo.Critical);
            sendNotification(TypeInfo.Critical,"Fatal Error when hashing element.");
            return;
        }
        logMe(ULCDocModMasterPrefix,"Success Hashed !");
        UI.updateElementHash(index, hash);
        fetchHash(hash,index);
    };
    reader.readAsBinaryString(myFile);
}

/**
    @param {String} myText the text to fetch
    @param {Number} index the index for callback
*/
function fetchText(myText, index){
    logMe(ULCDocModMasterPrefix,"New text fetched !");
    let hash = "-1";
    if(INFO_HASH_NEEDED === "SHA3-256"){
        hash = CryptoJS.SHA3(myText,{ outputLength:256 }).toString();
    }
    else {
        logMe(ULCDocModMasterPrefix, "Error : Impossible to select correct hash method.", TypeInfo.Critical);
        sendNotification(TypeInfo.Critical,"Fatal Error when hashing element.");
        return;
    }
    UI.updateElementHash(index, hash);
    fetchHash(hash,index);
}

/**
    @param {String} myHash the text to fetch
    @param {Number} index the index for callback
*/
async function fetchHash(myHash, index){
    let all_datas = new Map(); // associative table

    logMe(ULCDocModMasterPrefix,"New fetch hash asked !");
    if(isHashValidFormat(myHash)){
        myHash = "0x" + myHash // just adjusting to be compatible with bytes32 format.
        logMe(ULCDocModMasterPrefix,"Valid hash, asking kernel...");

        try{
            let result = await ULCDocKernel.methods.SIGNATURES_BOOK(myHash).call();

            if(result["revoked"]){
                all_datas.set(elementReservedKeys.status, TypeElement.Revoked);
            }
            else if(result["signed"]){
                all_datas.set(elementReservedKeys.status, TypeElement.Signed);
            }
            else {
                let hashSignature = web3js.utils.soliditySha3("addSignature",myHash);
                let signaturesArray = await ULCDocKernel.methods.getOperatorRequest(hashSignature).call();
                all_datas.set(fetchElementReservedKeys.signNeed,INFO_SIGNATURES_NEEDED);
                all_datas.set(fetchElementReservedKeys.signPending, signaturesArray.length);

                if(result["initialized"]){
                    all_datas.set(elementReservedKeys.source, result["source"]);
                    all_datas.set(elementReservedKeys.documentFamily, result["document_family"]);

                    //extracting extra_data if necessary
                    if(result["extra_data"] !== "" && result["extra_data"] !== " "){
                        logMe(ULCDocModMasterPrefix,"Extra Data detected, extracting...");
                        my_extras = formatExtraData(result["extra_data"]);
                        all_datas.set(elementReservedKeys.extraData, my_extras);
                    }
                }

                //we check if the current address selected has already signed :
                let isSignedByOwner = false;
                let i = 0;
                while(i < signaturesArray.length && !isSignedByOwner){
                    isSignedByOwner = INFO_ACCOUNT_LOADED === signaturesArray[i];
                    i++;
                }

                if(isSignedByOwner){
                    all_datas.set(elementReservedKeys.status, TypeElement.Pending);
                }
                else {
                    all_datas.set(elementReservedKeys.status, TypeElement.Fake);
                }
            }

            UI.updateElement(index, all_datas);

        }catch(error){
            all_datas.set(elementReservedKeys.status, TypeElement.Invalid);
            UI.updateElement(index, all_datas);
            sendNotification(TypeInfo.Critical, "Critical error reading kernel", "Impossible to read kernel base");
            logMe(ULCDocModMasterPrefix,"CRITICAL : impossible to read fetching !", TypeInfo.Critical);
            logMe(ULCDocModMasterPrefix,error);
        }
    } else {
        all_datas.set(elementReservedKeys.status, TypeElement.Invalid);
        UI.updateElement(index, all_datas);
        sendNotification(TypeInfo.Critical, "Invalid Hash", "The input hash '" + myHash  + "' is not valid");
        logMe(ULCDocModMasterPrefix,"CRITICAL : not valid hash !");
    }
}

/**
    @return {Array}{String} all family type that can be choosen (Sign) / displayed (Check)
* */
function getCompatibleFamily() {
    return KERNEL_FAMILY_AVAIABLE;
}

/**
    @return {String}the hash algorithm that the kernel Handles
* */
function getHashAlgorithm(){
    return INFO_HASH_NEEDED;
}

function requestPushDoc(myHash, info, index){

    //HERE ALL ELEMENT NULL MUST BE ""
    let source = info.get(elementReservedKeys.source);
    let document_family = info.get(elementReservedKeys.documentFamily);
    let extraDataMap = info.get(elementReservedKeys.extraData);

    let extraDataSerial = "";

    if(typeof source === 'undefined') source = "";
    if(typeof document_family === 'undefined') document_family = 0;
    if(typeof extraDataMap !== 'undefined') extraDataSerial = extraDataFormat(extraDataMap);

    ULCDocKernel.methods.pushDocument(myHash, source, document_family, extraDataSerial).send({from: INFO_ACCOUNT_LOADED})
    .on('error',(error) => {
        UI.updateTransactionTx(index, undefined);
        UI.updateTransactionState(index, false);
        sendNotification(TypeInfo.Critical, "Error during transaction", "The transaction has critical error. See console for more info.");
        logMe(ULCDocModMasterPrefix, "Error while sending pushDocument : ");
        logMe(ULCDocModMasterPrefix, error, TypeInfo.critical);
    })
    .on('transactionHash', (hash) => {
        UI.updateTransactionTx(index, formatTxURL(hash));
    })
    .on('receipt', (receipt) => {
        UI.updateTransactionState(index, true);
        logMe(ULCDocModMasterPrefix, "New receipt :" + receipt.toString());
    });
}

function requestConfirmDoc(myHash, index){
    ULCDocKernel.methods.confirmDocument(myHash).send({from: INFO_ACCOUNT_LOADED})
    .on('error',(error) => {
        UI.updateTransactionTx(index, undefined);
        UI.updateTransactionState(index, false);
        sendNotification(TypeInfo.Critical, "Error during transaction", "The transaction has critical error. See console for more info.");
        logMe(ULCDocModMasterPrefix, "Error while sending confirmDocument : ");
        logMe(ULCDocModMasterPrefix, error, TypeInfo.critical);
    })
    .on('transactionHash', (hash) => {
        UI.updateTransactionTx(index, formatTxURL(hash));
    })
    .on('receipt', (receipt) => {
        UI.updateTransactionState(index, true);
        logMe(ULCDocModMasterPrefix, "New receipt :" + receipt.toString());
    });
}

function requestMultiConfirmDocs(myHashArray, indexArray){
    ULCDocKernel.methods.confirmDocumentList(myHashArray).send({from: INFO_ACCOUNT_LOADED})
    .on('error',(error) => {
        for(index of indexArray){
            UI.updateTransactionTx(index, undefined);
            UI.updateTransactionState(index, false);
        }
        sendNotification(TypeInfo.Critical, "Error during transaction", "The transaction has critical error. See console for more info.");
        logMe(ULCDocModMasterPrefix, "Error while sending confirmDocumentList : ");
        logMe(ULCDocModMasterPrefix, error, TypeInfo.critical);
    })
    .on('transactionHash', (hash) => {
        let url = formatTxURL(hash);
        for(index of indexArray){
            UI.updateTransactionTx(index,url);
        }
    })
    .on('receipt', (receipt) => {
        for(index of indexArray){
            UI.updateTransactionState(index, true);
        }
        logMe(ULCDocModMasterPrefix, "New receipt :" + receipt.toString());
    });
}

function requestMultiLightPushDocs(myHashArray, infoArray, indexArray){

    let docFamilyArray = [];

    for(element of infoArray){
        docFamilyArray.push(element.get(elementReservedKeys.documentFamily));
    }

    ULCDocKernel.methods.lightPushDocumentList(myHashArray,docFamilyArray).send({from: INFO_ACCOUNT_LOADED})
    .on('error',(error) => {
        for(index of indexArray){
            UI.updateTransactionTx(index, undefined);
            UI.updateTransactionState(index, false);
        }
        sendNotification(TypeInfo.Critical, "Error during transaction", "The transaction has critical error. See console for more info.");
        logMe(ULCDocModMasterPrefix, "Error while sending lightPushDocumentList : ");
        logMe(ULCDocModMasterPrefix, error, TypeInfo.critical);
    })
    .on('transactionHash', (hash) => {
        let url = formatTxURL(hash);
        for(index of indexArray){
            UI.updateTransactionTx(index,url);
        }
    })
    .on('receipt', (receipt) => {
        for(index of indexArray){
            UI.updateTransactionState(index, true);
        }
        logMe(ULCDocModMasterPrefix, "New receipt :" + receipt.toString());
    });
}

/**
Function that prepare a request to sign one document and choose the right way to sign
@param {String} myHash the hash to be signed
@param {Map} info the map with all specific info
@param {Number} index the index for callback result
*/
async function signDocument(myHash, info, index){
    //We assume here all conditions are filled (if we force here then blockchain security will handle it)
    if(isHashValidFormat(myHash)){
        myHash = "0x" + myHash // just adjusting to be compatible with bytes32 format.

        //if we don't have info, then we just confirm document
        if(typeof info === 'undefined'){
            requestConfirmDoc(myHash, index);
        }
        else {
            requestPushDoc(myHash,info,index);
        }
    }
    else {
        logMe(ULCDocModMasterPrefix,"Error: invalid hash !");
        sendNotification(TypeInfo.Critical, "Fatal Error", "Impossible to sign element " + myHash + ": invalid hash");
        UI.updateTransactionTx(index, undefined);
        UI.updateTransactionState(index, false);
    }


}

/**
Function that prepare all requests and optimize number of transactions.
@param {Array}{String} myHash the hash to be signed
@param {Array}{Map} info the map with all specific info
@param {Array}{Number} index the index for callback result
*/
async function signOptimisedDocuments(myHashArray, infoArray, indexArray){
    //if just one doc, no need to use this function,  redirecting to simple signDocument.
    if (myHashArray.length === 1) {
        signDocument(myHashArray[0], infoArray[0], indexArray[0]);
        return;
    }

    //empty 2D array (hash, index)
    let confirmArray = [[],[]];

    //empty 2D arrays (hash, info, index)
    let lightPushArray = [[],[],[]];
    let pushArray = [[],[],[]];

    //We assume here all conditions are filled (if we force here then blockchain security will handle it)


    //for each sign request
    for(i in myHashArray){
        if(isHashValidFormat(myHashArray[i])){
            myHashArray[i] = "0x" + myHashArray[i] // just adjusting to be compatible with bytes32 format.
            //need to set type of action.
            if(typeof infoArray[i] === 'undefined'){
                //no Info, simple confirmation then.
                confirmArray[0].push(myHashArray[i]);
                confirmArray[1].push(indexArray[i]);
            }
            else {
                if(typeof infoArray[i].get(elementReservedKeys.source) === 'undefined' && typeof infoArray[i].get(elementReservedKeys.extraData) === 'undefined'){
                    //no source and extra data mean no string array so we can call light pushDoc.
                    lightPushArray[0].push(myHashArray[i]);
                    lightPushArray[1].push(infoArray[i]);
                    lightPushArray[2].push(indexArray[i]);
                }
                else {
                    //else it gonna be simple pushing.
                    pushArray[0].push(myHashArray[i]);
                    pushArray[1].push(infoArray[i]);
                    pushArray[2].push(indexArray[i]);
                }
            }
        }
        else {
            logMe(ULCDocModMasterPrefix,"Error: invalid hash !");
            sendNotification(TypeInfo.Critical, "Fatal Error", "Impossible to sign element " + myHashArray[i] +" : invalid hash");
            UI.updateTransactionTx(indexArray[i], undefined);
            UI.updateTransactionState(indexArray[i], false);
        }
    }
    //now execute it.
    //for gaz opti, better to call one by one signing if only one item.
    if(confirmArray[0].length > 0){
        confirmArray[0].length > 1 ? requestMultiConfirmDocs(confirmArray[0],confirmArray[1]) : requestConfirmDoc(confirmArray[0][0],confirmArray[1][0]);
    }

    if(lightPushArray[0].length > 0){
        lightPushArray[0].length > 1 ? requestMultiLightPushDocs(lightPushArray[0],lightPushArray[1],lightPushArray[2]) : requestPushDoc(lightPushArray[0][0], lightPushArray[1][0], lightPushArray[2][0]);
    }

    if(pushArray[0].length > 0){
        for (i in pushArray){
            requestPushDoc(pushArray[0][i], pushArray[1][i], pushArray[2][i]);
        }
    }

    logMe(ULCDocModMasterPrefix, "All requests sorted.")

}


/** @dev Function that check if the hash is signed by the kernel
* @param  {String} myHash the hash to check
* @param   {Number} index the UI index of the file (for UI purpose) */
async function checkHash(myHash, index){
    let all_datas = new Map(); // associative table

    logMe(ULCDocModMasterPrefix,"New hash asked !");
    if(isHashValidFormat(myHash)){
        myHash = "0x" + myHash;// just adjusting to be compatible with bytes32 format.
        logMe(ULCDocModMasterPrefix,"Valid hash, asking kernel...");

        try{
            let result = await ULCDocKernel.methods.SIGNATURES_BOOK(myHash).call();
            logMe(ULCDocModMasterPrefix,"Kernel response OK, reading info...");

            if(result["signed"]){ //if the hash is valid
                logMe(ULCDocModMasterPrefix,"Signed hash !");
                let my_extras = new Map();

                if(!result["revoked"]){
                    //extracting extra_data if necessary
                    if(result["extra_data"] !== "" && result["extra_data"] !== " "){
                        logMe(ULCDocModMasterPrefix,"Extra Data detected, extracting...");
                        my_extras = formatExtraData(result["extra_data"]);
                        all_datas.set(elementReservedKeys.extraData, my_extras);
                    }
                    all_datas.set(elementReservedKeys.date, formatHumanReadableDate(Number(result["signed_date"])));
                    all_datas.set(elementReservedKeys.source,result["source"]);
                    all_datas.set(elementReservedKeys.documentFamily, result["document_family"]);
                    all_datas.set(elementReservedKeys.status, TypeElement.Signed);
                }
                else {
                    all_datas.set(elementReservedKeys.revokedReason, result["revoked_reason"]);
                    all_datas.set(elementReservedKeys.status, TypeElement.Revoked);
                }

                UI.updateElement(index, all_datas);
            }
            else {
                logMe(ULCDocModMasterPrefix,"Hash not signed !!");
                all_datas.set(elementReservedKeys.status, TypeElement.Fake);
                UI.updateElement(index, all_datas);
            }
        }catch(error){
            sendNotification(TypeInfo.Critical, "Error Reading Kernel", "Impossible to read kernel base !");
            logMe(ULCDocModMasterPrefix,"CRITICAL: Unkown error when reaching SIGNATURES_BOOK(hash)",TypeInfo.Critical);
            logMe(ULCDocModMasterPrefix,error);
            all_datas.set(elementReservedKeys.status, TypeElement.Invalid);
            UI.updateElement(index, all_datas);
        }
    }
    else {
        all_datas.set(elementReservedKeys.status, TypeElement.Invalid);
        UI.updateElement(index, all_datas);
        sendNotification(TypeInfo.Critical, "Invalid Hash", "The input hash '" + myHash  + "' is not valid");
        logMe(ULCDocModMasterPrefix,"CRITICAL : not valid hash !");
    }
}

/************
*  LISTENERS*
*************/

window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider const web3 = new Web3(Web3.givenProvider
        web3js = new Web3(Web3.givenProvider);
        WALLET_ACTIVATED = true;
        web3.version.getNetwork(function(error,result){startApp(error,result)});
    } else {
        // Handle the case where the user doesn't have Metamask installed
        // Probably show them a message prompting them to install Metamask
        web3js = new Web3("wss://ropsten.infura.io/ws");
        WALLET_ACTIVATED = false;
        startApp(false,TypeConnection.Ropsten);
    }
});
