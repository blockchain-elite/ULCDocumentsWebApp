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


let CONF_TYPE_CONNECTION;

let myModerator;
let myInteractor;
let myKernel;

let currentAddress;

/**
 * Function that is loaded at the beginning.
 *
 * @param sNetwork {TypeConnection} the network to connect for the current session
 * @throws {networkConflictError} is injected web3 network is different from sNetwork
 * @throws {Error} is TypeConnection is not supported.
 * @throws {blockchainError} is error occurred during blockchain-side process.
 * @return {Promise<Object>} if the app uses an injected wallet or not,
 * and the default moderator config object
 */
async function startApp(sNetwork) {
    // UI call startApp with code provided from GET url.

    logMe(ULCDocModMasterPrefix, "Blockchain app starting ...");

    let networkProvider;
    let moderatorAddress;

    if (sNetwork === TypeConnection.Mainnet) {
        networkProvider = ULCDocAPI.getInfuraMainnetWeb3();
        moderatorAddress = ULCDocAPI.DEFAULT_ADDRESS.BCE_MOD_MAINNET;
    } else if (sNetwork === TypeConnection.Ropsten) {
        networkProvider = ULCDocAPI.getInfuraRopstenWeb3();
        moderatorAddress = ULCDocAPI.DEFAULT_ADDRESS.BCE_MOD_ROPSTEN;
    } else {
        throw new Error("TypeConnection not supported");
    }

    myInteractor = new ULCDocAPI(networkProvider);

    //We check if there is a network conflict or not.

    let connectedNetwork = await myInteractor.getNetwork();
    let convertedNetwork;

    switch (connectedNetwork) {
        case "mainnet":
            convertedNetwork = TypeConnection.Mainnet;
            break;
        case "ropsten":
            convertedNetwork = TypeConnection.Ropsten;
            break;
        case "morden":
            convertedNetwork = TypeConnection.Morden;
            break;
        case "private":
            convertedNetwork = TypeConnection.Unkown;
    }

    if (sNetwork !== convertedNetwork) {
        throw new networkConflictError("Network conflict", convertedNetwork);
    }

    if (ULCDocAPI.usingInjector()) {
        let allAddress = await myInteractor.getWalletAddresses();
        currentAddress = allAddress[0];
    }

    myModerator = myInteractor.getModerator(moderatorAddress);

    CONF_TYPE_CONNECTION = sNetwork;

    try {
        return {isUsingInjector: ULCDocAPI.usingInjector(), moderatorObject: await myModerator.connect()};
    } catch (e) {
        throw new blockchainError(e.message);
    }
}

/**
 * Query the identity of the kernel referenced on the configured moderator.
 * Then you need to update the address or ask user if connect to unknown kernel.
 *
 * @param kernelAddress {String} the kernel to check
 * @throws {Error} if app not started
 * @throws {blockchainError} if error occured during query.
 * @returns {Promise<KernelIdentity>}
 */
async function queryKernelAddress(kernelAddress) {

    logMe(ULCDocModMasterPrefix, "New kernel query");

    if (typeof myModerator === 'undefined') {
        throw new Error("moderator not connected");
    }

    try {
        return await myModerator.query(kernelAddress);
    } catch (e) {
        throw new blockchainError(e.message);
    }

}


/**
 * Update the kernel object with the address provided
 *
 * @param kernelAddress {String} new kernel you want to connect to.
 * @throws {Error} if invalid address
 * @throws {Error} if app not started
 * @returns {Promise<KernelConfig>}
 */
async function updateKernel(kernelAddress) {

    logMe(ULCDocModMasterPrefix, "updating kernel");

    if (typeof myInteractor === 'undefined') {
        throw new Error("App not started");
    }


    try {
        myKernel = myInteractor.getKernel(kernelAddress);
        return myKernel.connect();
    } catch (e) {
        throw new Error(e.message);
    }

}

/**
 * Function that change the moderator address
 *
 * @param {String} moderatorAddress new moderator address
 * @throws {Error} if app not started
 * @throws {Error} if bad address
 * @return Promise<ModeratorConfig>
 **/
async function updateModerator(moderatorAddress) {

    logMe(ULCDocModMasterPrefix, "updating moderator");

    if (typeof myInteractor === 'undefined') {
        throw new Error("App not started");
    }


    try {
        myModerator = myInteractor.getModerator(moderatorAddress);
        return myModerator.connect();
    } catch (e) {
        throw new Error(e.message);
    }

}


/**
 * @event hashAvailable Returns the document's hash
 * @type {string}
 */


/**
 * Function that check if the file is signed by the kernel
 *
 * @param  {File} myFile a file object to check
 * @fires hashAvailable the hash when it's calculated
 * @return Promise<DocumentData>
 */
async function checkFile(myFile) {

    logMe(ULCDocModMasterPrefix, "checking a new file...");

    let hash = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = function (event) {
            let data = event.target.result;
            resolve(CryptoJS.SHA3(data, {outputLength: 256}).toString());
        };
        reader.readAsBinaryString(myFile);
    });

    logMe(ULCDocModMasterPrefix, "Success Hashed !");
    this.emit('hashAvailable', hash);

    return await checkHash(hash);

}

/**
 * Function that check if the text is signed by the kernel
 *
 * @param myText {string} the text to hash
 * @fires hashAvailable the hash when it's calculated
 * @return Promise<DocumentData>
 */
async function checkText(myText) {
    logMe(ULCDocModMasterPrefix, "checking a new text...");
    let hash = CryptoJS.SHA3(myText, {outputLength: 256}).toString();
    logMe(ULCDocModMasterPrefix, "Success Hashed !");
    this.emit('hashAvailable', hash);
    return await checkHash(hash);
}


/**
 * Function that check if the hash is signed by the kernel
 *
 * @param myHash {string} the hash to check
 * @return Promise<DocumentData>
 */
async function checkHash(myHash) {

    if (typeof myKernel === 'undefined') {
        throw new Error("kernel not loaded");
    }

    if (!isHashValidFormat(myHash)) throw new Error("Invalid hash format.");

    myHash = "0x" + myHash; // just adjusting to be compatible with bytes32 format.

    let myDoc = myKernel.createDocument(myHash);

    return await myDoc.load();


}


/**
 * Function that check if the client's addresses can publish signatures.
 *
 * @return Promise<Map> Map using string keys and boolean values
 */
async function requestAccountInfo() {

    if (!ULCDocAPI.usingInjector()) {
        throw new Error("No wallet injected");
    }
    if (typeof myKernel === 'undefined') {
        throw new Error("no kernel loaded");
    }

    let allAccountInfo = new Map();
    let localAccount = await myInteractor.getWalletAddresses();

    for (let account of localAccount) {
        allAccountInfo.set(account, await myKernel.canSign(account));
    }

    return allAccountInfo;

}

/**
 * get how much signatures already added and know if current account already signed the document.
 *
 * @param myHash {String} the hash of the document
 * @return Promise<fetchSignStatus>
 */
async function fetchHash(myHash) {

    if (typeof myKernel === 'undefined') {
        throw new Error("kernel not loaded");
    }

    if (!isHashValidFormat(myHash)) throw new Error("Invalid hash format.");

    myHash = "0x" + myHash; // just adjusting to be compatible with bytes32 format.

    let myDoc = myKernel.createDocument(myHash);
    let myConfirmList = await myKernel.getConfirmList();
    return new fetchSignStatus(myConfirmList.length, myConfirmList.includes(currentAddress));
}

/**
 * @event txHashURL Object containing the id of the item and the url used to view the transaction
 * @type {Object}
 */

/**
 * @event txSucceed Object containing the id of the item and the transaction receipt. This is used to know when the transaction has been integrated into the blockchain
 * @type {Object}
 */

/**
 * @event txError Object containing the id of the item and the error that occurred while processing the transaction
 * @type {Object}
 */

/**
 * Function used to sign documents using ULCDocument
 *
 * @param myHashes {Array<string>} the hash to be signed
 * @param docs {Array<DocumentData>} the map with all specific info
 * @param indexes {Array<Object>} the index for event
 * @param optimized {boolean} optimized if we use optimised transactions or not
 * @fires txHashURL
 * @fires txSucceed
 * @fires txError
 */
function signDocuments(myHashes, docs, indexes, optimized) {
    //We assume here all conditions are filled (if we force here then blockchain security will handle it)

    if (!ULCDocAPI.usingInjector()) {
        throw new Error("No wallet injected");
    }
    if (typeof myKernel === 'undefined') {
        throw new Error("no kernel loaded");
    }

    for (let i in myHashes) {
        if (!isHashValidFormat(myHashes[i])) {
            throw new Error("Invalid hash format.");
        } else {
            myHashes[i] = "0x" + myHashes[i];
        }
    }


    let signQueue = myKernel.createSignQueue(currentAddress,
        (id, hash) => this.emit('txHashURL', {id: id, url: formatTxURL(hash)}),
        (id, receipt) => this.emit('txSucceed', {id: id, receipt: receipt}),
        (id, error) => this.emit('txError', {id: id, error: error}));

    for (let i = 0; i < myHashes.length; i++) {
        let newDoc = myKernel.createDocument(myHashes[i]);
        newDoc.setExtraData(docs[i].extra_data).setSource(docs[i].source).setDocumentFamily(docs[i].document_family_id);
        signQueue.addDoc(newDoc, indexes[i]);
    }

    signQueue.requestSign(optimized);
}
