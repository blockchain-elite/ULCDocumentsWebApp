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

/*  ULCDOCUMENTS MASTER JAVASCRIPT HANDLER (COMMON READ+WRITE)
*  @author Adrien BARBANSON <Contact Form On Blockchain-Élite website>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

/*************
*  CONST PART*
**************/
const kernelVersionCompatibility = [2];
const moderatorVersionCompatibility = [2];
const hashMethodsCompatibility = ["SHA3-256"];

//TODO: Handle "Hash_Algorithm" info & compatibility

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


/**@dev function that update the ULCDocKernel.
* @param addressKernel {String} the kernel address you want to update */

async function updateKernelAddress(addressKernel){

    let connectionInfo = new Map();

    if(web3js.utils.isAddress(addressKernel)){
        //if the hexa code is valid, we need to ask moderator for kernel info (if any)


        //first we need to know if kernel has version compatible with this module.


        // i know it's dirty, but that just for the moment, don't worry :S

        let compatible = false;
        let kernelVersion;
        let ULCDocKernelTest = new web3js.eth.Contract(ULCDocKernelABI, addressKernel)
        try {
            kernelVersion = await ULCDocKernelTest.methods.Kernel_Version().call();
            kernelHashFormat = await ULCDocKernelTest.methods.Hash_Algorithm().call();
        }catch(error){
            sendNotification(TypeInfo.Critical, "Error Kernel Loading", "Impossible to reach Kernel Basic Info.");
            logMe(ULCDocModMasterPrefix, "Error while reaching kernel version : " + error, TypeInfo.Critical);
            connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
            UI.updateKernelConnection(connectionInfo);
            return;
        }

        kernelVersion = Number(kernelVersion);

        for (ver of kernelVersionCompatibility){
            if (kernelVersion === ver) {
                compatible = true;
            }
        }

        if(!compatible){
            sendNotification(TypeInfo.Critical,"Bad Kernel Version","The version of the kernel is not compatible with this module !");
            logMe(ULCDocModMasterPrefix,"Kernel Version not compatible : " + kernelVersion);
            connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
            UI.updateKernelConnection(connectionInfo);
            return;
        }

        compatible = false;

        for (hash of hashMethodsCompatibility){
            if (kernelHashFormat === hash) {
                compatible = true;
            }
        }

        if(!compatible){
            sendNotification(TypeInfo.Critical,"Bad Kernel Hash Methods","The hash methods of the kernel is not compatible with this module !");
            logMe(ULCDocModMasterPrefix,"Kernel Hash not compatible : " + kernelHashFormat);
            connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
            UI.updateKernelConnection(connectionInfo);
            return;
        }


        try {
            let result = await ULCDocMod.methods.Kernel_Identity_Book(addressKernel).call();
            if(result["isRevoked"]){ // we used to know, but revoked
                $.confirm({
                    title: 'Security consideration',
                    content: 'Kernel is revoked by the moderator. That mean Moderator do not recorgnize this kernel anymore. <br/> Revoked reason : ' + result["revoked_reason"] + ' <br/> Do you cant to connect anyway ? (Not recommended)',
                    type: 'red',
                    columnClass: 'medium',
                    theme: 'material',
                    typeAnimated: true,
                    buttons: {
                        confirm: async function () {
                            await updateKernelObject(addressKernel);
                            connectionInfo.set(kernelReservedKeys.status, TypeInfo.Warning);
                            UI.updateKernelConnection(connectionInfo);
                            sendNotification(TypeInfo.Critical,"Important Information", "Address specified has been revoked by authority. You can still use it at your own risk.");
                        },
                        cancel: function () {
                            sendNotification(TypeInfo.Critical, "Connection rejected", "You choose not to connect to the kernel.");
                            logMe(ULCDocModMasterPrefix,"Connection refused by user");
                            connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
                            UI.updateKernelConnection(connectionInfo);
                        }
                    }
                });
            }
            else if(result["confirmed"]){ //OK!
                await updateKernelObject(addressKernel);
                //Assigning correct structure
                let kernel_extra = new Map();
                connectionInfo.set(kernelReservedKeys.name,result["name"]);
                connectionInfo.set(kernelReservedKeys.version, result["version"].toString());

                try {
                    resultInfo = await ULCDocMod.methods.Kernel_Info_Book(addressKernel).call();                    //we update objects.
                    await updateKernelObject(addressKernel);

                    //extracting extra_data if necessary
                    if(resultInfo["extra_data"] !== "" && resultInfo["extra_data"] !== " "){
                        logMe(ULCDocModMasterPrefix,"Extra Data detected, extracting...");
                        kernel_extra = formatExtraData(resultInfo["extra_data"]);
                    }

                    connectionInfo.set(kernelReservedKeys.isOrganisation, resultInfo["isOrganisation"]);
                    connectionInfo.set(kernelReservedKeys.url, resultInfo["url"]);
                    connectionInfo.set(kernelReservedKeys.mail, resultInfo["mail"]);
                    connectionInfo.set(kernelReservedKeys.img, resultInfo["imageURL"]);
                    connectionInfo.set(kernelReservedKeys.phone,resultInfo["phone"]);
                    connectionInfo.set(kernelReservedKeys.physicalAddress, resultInfo["physicalAddress"]);
                    connectionInfo.set(kernelReservedKeys.extraData, kernel_extra);
                    //sending to UI
                    connectionInfo.set(kernelReservedKeys.status, TypeInfo.Good);
                    UI.updateKernelConnection(connectionInfo);
                    sendNotification(TypeInfo.Good, "Kernel Updated", "Kernel address successfully updated.");
                }catch(error){
                    sendNotification(TypeInfo.Critical, "Fatal Error!", "Error while updating kernel address");
                    logMe(ULCDocModMasterPrefix,"CRITICAL: Unkown error when reaching Kernel_Info_Book",TypeInfo.Critical);
                    logMe(ULCDocModMasterPrefix,error);
                    connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
                    UI.updateKernelConnection(connectionInfo);
                }

            }
            else if(result["initialized"]) { //if init but not confirm, then pending
                logMe(ULCDocModMasterPrefix,"Moderator know kernel but not confirmed...");
                $.confirm({
                    title: 'Security consideration',
                    content: "The moderator know the address, but don't have passed security confirmation yet. <br/> Do you cant to connect anyway ? (Not recommended !)",
                    type: 'orange',
                    columnClass: 'medium',
                    theme: 'material',
                    typeAnimated: true,
                    buttons: {
                        confirm: async function () {
                            await updateKernelObject(addressKernel);
                            connectionInfo.set(kernelReservedKeys.status, TypeInfo.Warning);
                            UI.updateKernelConnection(connectionInfo);
                            sendNotification(TypeInfo.Warning,"Important Information", "Address specified is not recognised by loaded authority. You can still use it at your own risk.");
                        },
                        cancel: function () {
                            sendNotification(TypeInfo.Critical, "Connection rejected", "You choose not to connect to the kernel.");
                            logMe(ULCDocModMasterPrefix,"Connection refused by user");
                            connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
                            UI.updateKernelConnection(connectionInfo);
                        }
                    }
                });
            }
            else { //if not init, then we don't know at all the kernel
            logMe(ULCDocModMasterPrefix,"Moderator don't know the Kernel");
            $.confirm({
                title: 'Security consideration',
                content: "The moderator don't know the address you gave <br/> Do you cant to connect anyway ? (Not recommended)",
                type: 'orange',
                columnClass: 'medium',
                theme: 'material',
                typeAnimated: true,
                buttons: {
                    confirm: async function () {
                        await updateKernelObject(addressKernel);
                        connectionInfo.set(kernelReservedKeys.status, TypeInfo.Warning);
                        UI.updateKernelConnection(connectionInfo);
                        sendNotification(TypeInfo.Warning,"Important Information", "Address specified is not recognised by loaded authority. You can still use it at your own risk.");
                    },
                    cancel: function () {
                        sendNotification(TypeInfo.Critical, "Connection rejected", "You choose not to connect to the kernel.");
                        logMe(ULCDocModMasterPrefix,"Connection refused by user");
                        connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
                        UI.updateKernelConnection(connectionInfo);
                    }
                }
            });

        }



    }catch(error){
        sendNotification(TypeInfo.Critical, "Fatal Error!", "Error while updating kernel address");
        logMe(ULCDocModMasterPrefix,"CRITICAL: Unkown error when reaching Kernel_Identity_Book(adressKernel)",TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix, error);
        connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
        UI.updateKernelConnection(connectionInfo);
    }
}

else {
    sendNotification(TypeInfo.Critical, "Invalid Address", "The kernel address does not respect format.");
    logMe(ULCDocModMasterPrefix,"Wrong kernel address format");
    connectionInfo.set(kernelReservedKeys.status, TypeInfo.Critical);
    UI.updateKernelConnection(connectionInfo);
}
}

/**
    Function that update in masterJS the objet kernel
    @param {String} addressKernel the addresse of the kernel to load
**/
async function updateKernelObject(addressKernel){
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
        let familyLength = await ULCDocKernel.methods.getDocFamilySize().call();
        familyLength = Number(familyLength);
        let i = 0;
        KERNEL_FAMILY_AVAIABLE = new Array();

        while(i < familyLength){
            KERNEL_FAMILY_AVAIABLE[i] = await ULCDocKernel.methods.document_family_registred(i).call();
            i++;
        }
    }catch(error){
        logMe(ULCDocModMasterPrefix, "Impossible to read docFamily", TypeInfo.Critical);
        logMe(ULCDocModMasterPrefix, error);
        sendNotification(TypeInfo.Critical,"Error reading kernel", "Impossible to find property : docFamily");

    }


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
        var hash = CryptoJS.SHA3(data,{ outputLength:256 }).toString();
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
    hash = CryptoJS.SHA3(myText,{ outputLength:256 }).toString();
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
        let hash = CryptoJS.SHA3(data,{ outputLength:256 }).toString();
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
    let hash = CryptoJS.SHA3(myText,{ outputLength:256 }).toString();
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
            let result = await ULCDocKernel.methods.Signatures_Book(myHash).call();

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
Function that prepare a request to sign a document
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
            ULCDocKernel.methods.confirmDocument(myHash).send({from: INFO_ACCOUNT_LOADED})
            .on('error',(error) => {
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
        else {

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
    }
    else {
        logMe(ULCDocModMasterPrefix,"Error: invalid hash !");
        sendNotification(TypeInfo.Critical, "Fatal Error", "Impossible to sign element : invalid hash");
        UI.updateTransactionTx(index, undefined);
        UI.updateTransactionState(index, false);
    }


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
            let result = await ULCDocKernel.methods.Signatures_Book(myHash).call();
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
                    all_datas.set(elementReservedKeys.date, result["signed_date"]);
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
            logMe(ULCDocModMasterPrefix,"CRITICAL: Unkown error when reaching Signatures_Book(hash)",TypeInfo.Critical);
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

/** @dev Function that check if the hash is correct SHA3-256 type
* @param {String} check the hash to check
* @return {Boolean} that is the result of the check. */

function isHashValidFormat(check){
    let re = /[0-9a-f]{64}/g;
    let result = re.test(check);
    logMe(ULCDocModMasterPrefix, "Hash to check=" + check + " | result=" + result.toString());
    return result;
}

/** @dev function that deserialise extra_data field input
*  @param {String} raw_extra_data the raw extra data
* @return {Map} the map with extra_datas properties loaded */

function formatExtraData(raw_extra_data){
    logMe(ULCDocModMasterPrefix, "Raw data =" + raw_extra_data);
    console.log(typeof raw_extra_data);
    let extra_data_table = raw_extra_data.split(',');
    let result = new Map();
    extra_data_table.forEach(function(oneExtraDataCouple){
        let oneExtraData = oneExtraDataCouple.split(":")
        logMe(ULCDocModMasterPrefix,"New Couple detected !  [" + oneExtraData[0] + ":" + oneExtraData[1] + "]");
        result.set(oneExtraData[0],oneExtraData[1]);
    });
    return result;
}

/** @TODO : Convert hexa info. **/


/** @dev function that serialise extra_data field input
*  @param {Map} mapExtraData with unserialised data
* @return {String} serialized data */

function extraDataFormat(mapExtraData){
    //WE ASSUME ':,' char are not used.
    let result = "";

    for(key of mapExtraData.keys()){
        result = result + key + ":" + mapExtraData.get(key) + ",";
    }

    result = result.substr(0, result.length-1);

    logMe(ULCDocModMasterPrefix,"Extra data serialisation result : " + result);

    return result;

}

function formatTxURL(txHash){
    let finalUrl;

    switch(CONF_TYPE_CONNECTION){
        case TypeConnection.Mainnet:
            finalUrl = "https://etherscan.io/tx/" + txHash;
            break;
        case TypeConnection.Ropsten:
            finalUrl = "https://ropsten.etherscan.io/tx/" + txHash;
            break;
        case TypeConnection.Rinkeby:
            finalUrl = "https://rinkeby.etherscan.io/tx/" + txHash;
            break;
        case TypeConnection.Kovan:
            finalUrl = "https://kovan.etherscan.io/tx/" + txHash;
            break;
        default:
            finalUrl = txHash;
    }

    return finalUrl;
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
