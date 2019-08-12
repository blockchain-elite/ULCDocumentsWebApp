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
 * Get default moderator address
 *
 * @param isRopsten {boolean} Are we using Ropsten Network ?
 * @return {string} The default moderator address
 */
function getDefaultModerator(isRopsten) {
    return isRopsten ? ULCDocAPI.DEFAULT_ADDRESS.BCE_MOD_ROPSTEN : ULCDocAPI.DEFAULT_ADDRESS.BCE_MOD_MAINNET;
}

/**
 * Function used to start blockchain-related services.
 * This must be called at the very beginning.
 *
 * @param selectedNetwork {TypeConnection} the network to connect for the current session
 * @throws {NetworkConflictError} is injected web3 network is different from sNetwork
 * @throws {Error} is TypeConnection is not supported.
 * @throws {ULCDocAPI.BlockchainQueryError} is error occurred during blockchain-side process.
 * @return {Promise<Object>} if the app uses an injected wallet or not,
 * and the default moderator config object
 */
async function startApp(selectedNetwork) {
    logMe(ULCDocModMasterPrefix, "Backend starting ...");

    let networkProvider;
    let moderatorAddress;
    if (selectedNetwork === TypeConnection.Mainnet) {
        networkProvider = ULCDocAPI.getInfuraMainnetWeb3();
        moderatorAddress = ULCDocAPI.DEFAULT_ADDRESS.BCE_MOD_MAINNET;
    } else if (selectedNetwork === TypeConnection.Ropsten) {
        networkProvider = ULCDocAPI.getInfuraRopstenWeb3();
        moderatorAddress = ULCDocAPI.DEFAULT_ADDRESS.BCE_MOD_ROPSTEN;
    } else
        throw new Error("TypeConnection not supported");

    myInteractor = new ULCDocAPI(networkProvider);

    // Check if there is a network conflict or not
    let connectedNetwork = await myInteractor.getNetwork();
    let convertedNetwork;

    switch (connectedNetwork) {
        case "main":
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
            break;
        default:
            throw new Error("Impossible to detect type of network : " + connectedNetwork);
    }
    if (selectedNetwork !== convertedNetwork)
        throw new NetworkConflictError(selectedNetwork, convertedNetwork);

    myModerator = myInteractor.getModerator(moderatorAddress);
    CONF_TYPE_CONNECTION = selectedNetwork;

    return {isUsingInjector: ULCDocAPI.usingInjector(), moderatorObject: await myModerator.connect()};
}

/**
 * Query the identity of the kernel referenced on the configured moderator.
 * This does not connect to the specified kernel, you need to call updateKernel for this.
 * This allows to detect for kernels not referenced on the current moderator before connecting,
 * allowing the user to abort connection.
 *
 * @param kernelAddress {string} the address for the kernel to check
 * @throws {Error} if backend is not started
 * @throws {ULCDocAPI.BlockchainQueryError} if an error occurred during query
 * @returns {Promise<KernelIdentity>}
 */
async function queryKernelAddress(kernelAddress) {
    logMe(ULCDocModMasterPrefix, "Fetching new kernel identity...");

    if (typeof myModerator === 'undefined')
        throw new Error("moderator not connected");
    return await myModerator.query(kernelAddress);
}


/**
 * Connect to the kernel with the specified address.
 * Make sure you call queryKernelAddress before to get it's identity
 *
 * @param kernelAddress {string} the address of the new kernel you want to connect to
 * @throws {Error} if the address is invalid
 * @throws {Error} if backend is not started
 * @throws {ULCDocAPI.BlockchainQueryError} if an error occurred during query
 * @returns {Promise<KernelConfig>}
 */
async function updateKernel(kernelAddress) {
    logMe(ULCDocModMasterPrefix, "Connecting to a new kernel...");

    if (typeof myInteractor === 'undefined')
        throw new Error("App not started");
    myKernel = myInteractor.getKernel(kernelAddress);
    return myKernel.connect();
}

/**
 * Connect to the new moderator with the specified address.
 *
 * @param moderatorAddress {string} the address of the new moderator you want to connect to
 * @throws {Error} if the address is invalid
 * @throws {Error} if backend is not started
 * @throws {ULCDocAPI.BlockchainQueryError} if an error occurred during query
 * @return Promise<ModeratorConfig>
 **/
async function updateModerator(moderatorAddress) {
    logMe(ULCDocModMasterPrefix, "Connecting to a new moderator...");

    if (typeof myInteractor === 'undefined')
        throw new Error("App not started");
    myModerator = myInteractor.getModerator(moderatorAddress);
    return myModerator.connect();
}

/**
 * Check if the given file is signed by the kernel
 *
 * @param file {File} the file object to check
 * @param onHashAvailable {Function} function to call when the hash is available
 * @throws {ULCDocAPI.BlockchainQueryError} if an error occurred during query
 * @return Promise<DocumentData>
 */
async function checkFile(file, onHashAvailable) {
    logMe(ULCDocModMasterPrefix, "Checking a new file...");

    let hash = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = function (event) {
            let data = event.target['result'];
            resolve(CryptoJS.SHA3(data, {outputLength: 256}).toString());
        };
        reader.readAsBinaryString(file);
    });
    logMe(ULCDocModMasterPrefix, "File successfully hashed!");
    onHashAvailable(hash);
    return await checkHash(hash);
}

/**
 * Check if the given text is signed by the kernel
 *
 * @param text {string} the text to check
 * @param onHashAvailable {Function} function to call when the hash is available
 * @throws {ULCDocAPI.BlockchainQueryError} if an error occurred during query
 * @return Promise<DocumentData>
 */
async function checkText(text, onHashAvailable) {
    logMe(ULCDocModMasterPrefix, "Checking a new text...");
    let hash = CryptoJS.SHA3(text, {outputLength: 256}).toString();
    logMe(ULCDocModMasterPrefix, "Text successfully hashed !");
    onHashAvailable(hash);
    return await checkHash(hash);
}


/**
 * Check if the given hash is signed by the kernel
 *
 * @param hash {string} the hash to check
 * @return Promise<DocumentData>
 */
async function checkHash(hash) {
    logMe(ULCDocModMasterPrefix, "look for hash info in kernel...");
    if (typeof myKernel === 'undefined')
        throw new Error("kernel not loaded");

    if (!isHashValidFormat(hash))
        throw new Error("Invalid hash format.");
    hash = "0x" + hash; // just adjusting to be compatible with bytes32 format.
    let myDoc = myKernel.createDocument(hash);
    return await myDoc.load();
}


/**
 * Get client accounts and check if thay can publish on the connected kernel.
 * You must call that function when you open sign module to setup default address to sign.
 * @throws {ULCDocAPI.BlockchainQueryError} if an error occurred during query
 * @return Promise<Map> Map using string keys and boolean values
 */
async function requestAccountInfo() {

    //@TODO : detect changes on default address and call UI to update info.

    logMe(ULCDocModMasterPrefix, "Requesting account info...");
    if (!ULCDocAPI.usingInjector())
        throw new Error("No wallet injected");

    if (typeof myKernel === 'undefined')
        throw new Error("no kernel loaded");

    let allAccountInfo = new Map();
    let localAccount = await myInteractor.getWalletAddresses();

    for (let account of localAccount)
        allAccountInfo.set(account, await myKernel.canSign(account));

    currentAddress = localAccount[0];

    return allAccountInfo;
}


/**
 * Fetch information on the given hash to see the number of signatures
 * and if the current user has already signed it.
 * When signing, be sure to first use the right Check function to get more information and
 * to compute the hash.
 *
 * @param hash {string} the hash of the document
 * @throws {ULCDocAPI.BlockchainQueryError} if an error occurred during query
 * @return Promise<fetchSignStatus>
 */
async function fetchHash(hash) {
    logMe(ULCDocModMasterPrefix, "Fetching hash...");

    if (typeof myKernel === 'undefined')
        throw new Error("kernel not loaded");

    if (!isHashValidFormat(hash))
        throw new Error("Invalid hash format.");

    hash = "0x" + hash; // just adjusting to be compatible with bytes32 format.
    let myConfirmList = await myKernel.createDocument(hash).getConfirmList();
    return new fetchSignStatus(myConfirmList.length, myConfirmList.includes(currentAddress));
}

/**
 * Function used to sign documents using ULCDocument
 *
 * @param items {Array<DocumentData>} the array with all specific info
 * @param indexes {Array<Object>} the array containing indexes to identify documents
 * @param optimized {boolean} if we use optimised transactions or not
 * @param onTxHashUrl {Function} callback to use when the transaction hash url is available
 * @param onTxSucceed {Function} callback to use when the transaction has succeeded
 * @param onTxError {Function} callback to use when the transaction has failed
 */
function signDocuments(items, indexes, optimized, onTxHashUrl, onTxSucceed, onTxError) {
    //We assume here all conditions are filled (if we force here then blockchain security will handle it)

    if (!ULCDocAPI.usingInjector())
        throw new Error("No wallet injected");

    if (typeof myKernel === 'undefined')
        throw new Error("no kernel loaded");

    // Add 0x to hashes to make them compatible with 32byte format
    // Currently throws an error if we add 0x
    // for (let i =0; i < items.length; i++) {
    //     if (!isHashValidFormat(items[i].hash)) {
    //         throw new Error("Invalid hash format.");
    //     } else {
    //         items[i].hash = "0x" + items[i].hash;
    //     }
    // }

    let signQueue = myKernel.createSignQueue(currentAddress,
        (id, url) => onTxHashUrl(id, formatTxURL(url)),
        (id, receipt) => onTxSucceed(id, receipt),
        (id, error) => onTxError(id, error));

    for (let i = 0; i < items.length; i++) {
        let newDoc = myKernel.createDocument(items[i].hash);
        newDoc.setExtraData(items[i].extra_data).setSource(items[i].source).setDocumentFamily(items[i].document_family_id);
        signQueue.addDoc(newDoc, indexes[i]);
    }
    signQueue.requestSign(optimized);
}
