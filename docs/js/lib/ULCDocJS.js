/*
This file is part of ULCDocuments JS API.
ULCDocuments JS API is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
UULCDocuments JS API is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with ULCDocuments Web App.  If not, see <http://www.gnu.org/licenses/>.
*/

/** @description  ULCDOCUMENTS JAVASCRIPT API INTERACTOR
*  @author Adrien BARBANSON <Contact Form On Blockchain-Élite website>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

/**@description Create a new instance of the API with web3
 * @param _DefaultWeb3provider web3 url provider that will be used if there is not injected web3 by browser.
 * @requires Web3
 */
function ULCDocAPI(_DefaultWeb3provider) {

    /**
     * @description get all addresses available on the browser
     * @throws Error if there is not wallet injected
     * @return {Promise<Array>}
     */
    this.getWalletAddresses = async function() {

        if(!ULCDocAPI.usingInjector()){
            throw new Error("Impossible to get Wallet : no injected ethereum object");
        }

        await ethereum.enable();
        return await Web3Obj.eth.getAccounts();
    };

    /** @description function that deserialize extra_dataV5 field input
    @param {String} raw_extra_data the raw extra data
    @return {Map} the map with extra_datas properties loaded
    */
    let formatExtraDataV5 = function (raw_extra_data){

        if(raw_extra_data === ""){
            return new Map();
        }

        let extra_data_table = raw_extra_data.split(',');
        let result = new Map();
        extra_data_table.forEach(function(oneExtraDataCouple){
            let oneExtraData = oneExtraDataCouple.split(":");
            result.set(oneExtraData[0],oneExtraData[1]);
        });
        return result;
    };

    /** @description function that serialise extra_data field input
    *  @param {Map} mapExtraData with unserialized data
    * @return {String} serialized data */
    let extraDataFormatV5 = function (mapExtraData){
        //WE ASSUME ':,' char are not used.
        if(mapExtraData.size === 0){
            return "";
        }

        let result = "";

        for(key of mapExtraData.keys()){
            result = result + key + ":" + mapExtraData.get(key) + ",";
        }

        result = result.substr(0, result.length-1);
        return result;
    };

    //the web3 instance we're going to use in this Interactor.
    let Web3Obj;
    //the network stored in cache.
    let whichNetwork = "";

    /**
     * @description return network connected on the interactor.
     * @return {Promise<string>}
     */
    this.getNetwork = async function() {
        if(whichNetwork === "") {
            whichNetwork = await Web3Obj.eth.net.getNetworkType();
        }
        return whichNetwork;
    };


    /**********************************/
    //constructor
    if(typeof Web3 === 'undefined'){
        throw new ULCDocAPI.DependancyError("ULCDocAPI needs web3js to work properly.");
    }

    if(ULCDocAPI.usingInjector()){
        Web3Obj = new Web3(Web3.givenProvider);
        Web3Obj.eth.net.getNetworkType().then((result) => whichNetwork = result);
    }

    else {
        if (typeof _DefaultWeb3provider === 'undefined'){
            throw new Error("web3 is not injected and not provided in the constructor.");
        }
        Web3Obj = new Web3(_DefaultWeb3provider);
        }
    /*********************************/

    /**
    @description This Object can interact through ULCDocKernel, without Web3 knowledge.
    @requires ULCDocVersionner_ABI,ULCDocKernelV5_ABI
    @constructor {string} _KernelAddress the address of the kernel.
    */
    this.ULCDocKernel  = function (_KernelAddress) {

        /* ---- CONTRUCTOR --- */

        if(!Web3Obj.utils.isAddress(_KernelAddress)){
            throw new Error("Invalid kernel address provided, or checksum capitalisation failed.");
        }

        /* ------------------- */


        /**
         * @description Function that check if we used connect() function.
         * we must connect to the kernel to get configuration of the latter.
         * @returns {boolean}
         */
        this.connected = function() {
            return typeof Kernel_Info !== 'undefined';
        };


        /**@typedef KernelConfig
         * @type {Object}
         * @property {number} version The contract version
         * @property {number} operatorsForChange number of sign needed
         * @property {String} hashMethod  how you need to hash document to check signature
         * @property {Array<String>} docFamily all document family available on the kernel. ID = array index
         * @property {String} address
         */
        let Kernel_Config = function(){
            this.version = 0;
            this.operatorsForChange = -1;
            this.hashMethod = "";
            this.docFamily = [];
            this.address = "";
        };

        let raw_address = _KernelAddress;

        //Web3 Contract object
        let Kernel_Contract;

        //KernelInfo of the Kernel Contract
        let Kernel_Info;

        this.getKernelInfo = function() {
            return Kernel_Info;
        };

        /** @description Function to get the address of the object without loading KernelConfig.
            @return {string} the address.
        */
        this.getRawAddress = function() {
            return raw_address;
        };

        /**
         * @description return a  ULCDocKernel object which is the previous kernel.
         * @throws Error if kernel not connected yet;
         * @throws Error if no previous kernel to load.
         * @returns ULCDocKernel
         */
        this.getPreviousKernel = async function() {

            //We must check before that we have a kernel connected.
            if(!this.connected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let previousAddress = await Kernel_Contract.methods.PREVIOUS_CONTRACT().call();

            if (previousAddress === ULCDocAPI.ZERO_ADDRESS){
                throw new Error("No previous kernel to load");
            }

            return this.getKernel(previousAddress);
        };

        /**
        @description Function that check if current kernel has declared previous one.
        @return {boolean}
        */
        this.hasPreviousKernel = async function() {

            if(!this.connected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let previousAddress = await Kernel_Contract.methods.PREVIOUS_CONTRACT().call();


            return previousAddress !== ULCDocAPI.ZERO_ADDRESS;
        };

        /** @description Function that return the next ULCDocKernel object.
         * @throws Error if kernel not connected yet;
         * @throws if no previous kernel to load.
         * @returns ULCDocKernel
        */
        this.getNextKernel = async function() {

            //We must check before that we have a kernel connected.
            if(!this.connected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let nextAddress = await Kernel_Contract.methods.nextContract().call();

            if (nextAddress === ULCDocAPI.ZERO_ADDRESS){
                throw new Error("No previous kernel to load");
            }

            return this.getKernel(nextAddress);
        };

        /**
        @description Function that check if current kernel has declared previous one.
        @return {boolean}
        */
        this.hasNextKernel = async function() {

            if(!this.connected()){
                throw new Error("No kernel connected.");
            }

            let nextAddress = await Kernel_Contract.methods.nextContract().call();


            return nextAddress !== ULCDocAPI.ZERO_ADDRESS;
        };

        /**
         * @description Function that fill Kernel info object for V5 and other compatible kernel Info object.
        */
        let getKernelConfigV5 = async function(){
            //lisibility purposes : creating an array
            let promList = [];
            let info = new Kernel_Config();

            //loading Kernel info elements
            promList.push(Kernel_Contract.methods.operatorsForChange().call());
            promList.push(Kernel_Contract.methods.HASH_ALGORITHM().call());
            promList.push(Kernel_Contract.methods.DOC_FAMILY_STRINGIFIED().call());

            //Executing Promise.All
            let values = await Promise.all(promList).catch(function(err){
                console.log(err);
                throw new Error("Impossible to fetch Kernel basic information V5.");
            });

            info.operatorsForChange = Number(values[0]);
            info.hashMethod = values[1];
            info.docFamily= values[2].split(",");

            return info;
        };

        /**
        @description connect : connect the API to a Kernel to check documents.
        Can throw different errors :
        @Throw KernelVersionError if the version of the kernel is not compatible with the API.
        @Throw Error if we can't reach minimal functionnalities.
        @return {KernelConfig}
        */
        this.connect = async function () {
            //First we only load the versionner to know kernel version.
            let Kernel_Versionner = new Web3Obj.eth.Contract(ULCDocVersionner_ABI, raw_address);

            let kernelVersion = 0;

            try {
                //Then we see if it is compatible.
                kernelVersion = await Kernel_Versionner.methods.CONTRACT_VERSION().call();
            } catch(err) {
                throw new Error("Impossible to reach Kernel_Version method.");
            }

            let versionCompatible = false;
            kernelVersion = Number(kernelVersion);

            //we check if the Kernel version  is compatible with our list
            for (ver of ULCDocAPI.COMPATIBLE_KERNEL_VERSION){
                if (kernelVersion === ver) {
                    versionCompatible = true;
                    break;
                }
            }

            if(!versionCompatible) {
                throw new Error("Version not compatible. Contract version is '" + kernelVersion + "''");
            }

            //At this moment, Kernel version is OK. Loading the righ ABI according to Kernel Version.
            if(kernelVersion === 5){
                Kernel_Contract = new Web3Obj.eth.Contract(ULCDocKernelV5_ABI, raw_address);
                Kernel_Info = await getKernelConfigV5();
            }
            else {
                throw new Error("Impossible to configure Kernel_Contract.");
            }

            Kernel_Info.version = kernelVersion;
            Kernel_Info.address = raw_address;

            return Kernel_Info;

        };


        /**
        @description Function that check if the current address can sign a document in the kernel
        @return {boolean}
        */
        this.canSign = async function(_Address) {

            if(!this.connected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let isOwner = false;
            let isOperator = false;

            isOwner = await Kernel_Contract.methods.owners(_Address).call();

            if(!isOwner){
                isOperator = await Kernel_Contract.methods.operators(_Address).call();
            }

            return isOwner || isOperator;
        };

        /**
        @description object that handle document behaviour.
        */
        this.KernelDocument = function(_SignatureHash) {

            if(typeof Kernel_Info === 'undefined'){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }
            if(_SignatureHash.substr(0,2) !== "0x"){
                throw new Error("Hash of the document don't start by prefix 0x.");
            }

            /**
             * @typedef DocumentData
             * @type {Object}
             * @property {String} hash The hash of the document
             * @property {number} signed_date when the document is confirmed
             * @property {number} revoked_date  when the document is revoked
             * @property {String} document_family the document family (read only)
             * @property {number} document_family_id id of kernel doc family (to confirm/push a document)
             * @property {boolean} initialized
             * @property {boolean} signed
             * @property {boolean} revoked
             * @property {String} source
             * @property {Map<String,String>} extra_data
             * @property {String} revoked_reason
             * @property {number} version the kernel version who host document signature.
             * */
            let Document_Data = function(_Hash){
                this.hash = _Hash;
                this.signed_date = 0;
                this.revoked_date = 0;
                this.document_family = "";
                this.document_family_id = 0;
                this.initialized = false;
                this.signed = false;
                this.revoked = false;
                this.source = "";
                this.extra_data = new Map();
                this.revoked_reason = "";
                this.version = 0;
            };


            let document_obj;

            // CONSTRUCTOR
            if(Kernel_Info.version === 5){
                document_obj = new Document_Data(_SignatureHash);
            }
            else {
                throw new Error("Impossible to set correct document version. Kernel incompatible ?");
            }

            this.getDocument = function() {
                return document_obj;
            };


            /**
            @description Function that return a DocumentV5 complete infos. Requests are optimized.
            */
            async function loadDocumentDataV5(){

                document_obj.initialized = await Kernel_Contract.methods.isInitialized(_SignatureHash).call();
                document_obj.hash = _SignatureHash;

                if(document_obj.initialized){
                    let firstPromList = [];
                    firstPromList.push(Kernel_Contract.methods.isSigned(_SignatureHash).call());
                    firstPromList.push(Kernel_Contract.methods.getDocFamily(_SignatureHash).call());
                    firstPromList.push(Kernel_Contract.methods.getSource(_SignatureHash).call());
                    firstPromList.push(Kernel_Contract.methods.getExtraData(_SignatureHash).call());

                    let firstSerie = await Promise.all(firstPromList);

                    document_obj.signed = firstSerie[0];
                    document_obj.document_family = firstSerie[1];
                    document_obj.source = firstSerie[2];
                    document_obj.extra_data = formatExtraDataV5(firstSerie[3]);

                    //if the document is signed, we can ask for more information.
                    if(document_obj.signed){
                        let secPromList = [];
                        secPromList.push(Kernel_Contract.methods.isRevoked(_SignatureHash).call());
                        secPromList.push(Kernel_Contract.methods.getSignedDate(_SignatureHash).call());
                        secPromList.push(Kernel_Contract.methods.getSignatureVersion(_SignatureHash).call());
                        secPromList.push(Kernel_Contract.methods.getRevokedReason(_SignatureHash).call());

                        let secSerie = await Promise.all(secPromList);

                        document_obj.revoked = secSerie[0];
                        document_obj.signed_date = Number(secSerie[1]);
                        document_obj.version = Number(secSerie[2]);
                        document_obj.revoked_reason = secSerie[3];

                        if(document_obj.revoked){
                            let revokedDate = await Kernel_Contract.methods.getRevokedDate(_SignatureHash).call();
                            document_obj.revoked_date = Number(revokedDate);
                        }

                    }
                }

            }

            /**
            @description Function that return information about who confirmed the current document.
            */
            this.getConfirmList = async function(){
                let hashSignature = Web3Obj.utils.soliditySha3("as", document_obj.hash);
                return await Kernel_Contract.methods.getOperatorRequest(hashSignature).call();
            };

            /**
            @description Function that load all document blockchain information.
            @return {DocumentData}
            */
            this.load = async function (){
                //Then we can reach information about the document.
                let docResult;

                if(Kernel_Info.version === 5){
                    try{
                        docResult = await loadDocumentDataV5();
                    }catch(err){
                        throw new Error("Error when query document to kernel.");
                    }
                }
                else {
                    throw new Error("Impossible to get the document from Kernel. Version error");
                }

                return document_obj;
            };

            /**
            @description Function that fill some document optional data.
            @param _extras {Map} {String}{String}  map of the extra data : param,value
            */
            this.setExtraData = function (_extras) {
                if(_extras instanceof Map){
                    document_obj.extra_data = _extras;
                }
                else{
                    throw new Error("Incorrect extra-data type. Expected Map object");
                }

                //Chaining option avaiable.
                return this;
            };

            this.setSource = function(_source){
                document_obj.source = _source;
                return this;
            };

            this.setDocumentFamily  = function(_docID){
                document_obj.document_family_id = _docID;
                return this;
            };

        };

        this.DocumentSignQueue = function(_fromAddress, _callBackTxHash, _callBackReceipt, _callBackError) {

            //if not injected, we can't use this.
            if(!ULCDocAPI.usingInjector){
                throw new ULCDocAPI.DependancyError("Impossible to instanciate a Sign Queue without injected ethereum.");
            }

            if(typeof Kernel_Info === 'undefined'){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }


            let whenError = _callBackError;
            let whenTxHash = _callBackTxHash;
            let whenReceipt = _callBackReceipt;

            let documentList = new Map();

            /**
             * @description add a document to the list of document to sign in a row
             * @param _DocToSign {DocumentData} the document
             * @param _identifier {Object} any type of identifier
             * @return {ULCDocAPI} to add possibility of chaining.
             */
            this.addDoc = function(_DocToSign, _identifier) {

                if(typeof _identifier === 'undefined'){
                    throw new Error("Identifier of the document not provided");
                }

                documentList.set(_identifier, _DocToSign.getDocument());

                return this;
            };

            /**
             * @description return the size of the list of document to sign
             * @return {number}
             */
            this.getSize = function() {
                return documentList.size;
            };

            /**
             * @description remove a document from the list
             * @param _identifier {Object} the identifier used when you added the document to the list.
             */
            this.removeDoc = function( _identifier) {

                if(typeof _identifier === 'undefined'){
                    throw new Error("Identifier of the document not provided");
                }

                documentList.delete(_identifier);
            };

            /**
             * @description reset all the document list
             */
            this.clearQueue = function() {
                documentList.clear();
            };

            /**
             * @description launch the request to the user.
             * @param _Optimized if you want to reduce number of transaction.
             * @dev some people want to have one transaction by signature. In this case, disable optimisation.
             */
            this.requestSign = function(_Optimized = true) {

                if(documentList.size === 0) {
                    throw new Error("No document provided.")
                }

                let confirmArray = [];
                let lightPushArray = [];
                let pushArray = [];

                //We assume here all conditions are filled (if we force here then blockchain security will handle it)


                //for each sign request
                for(i of documentList){

                    let oneDoc = i[1];
                    let oneID = i[0];

                    //need to set type of action.
                    if(oneDoc.source === "" && oneDoc.extra_data.size === 0 && oneDoc.document_family_id === 0){
                        //no Info, simple confirmation then.
                        confirmArray.push(oneID);
                    }
                    else {
                        if(oneDoc.source === "" && oneDoc.extra_data.size === 0){
                            //no source and extra data mean no string array so we can call light pushDoc.
                            lightPushArray.push(oneID);
                        }
                        else {
                            //else it gonna be simple pushing.
                            pushArray.push(oneID);
                        }
                    }
                }

                //now execute it.
                //for gaz opti, better to call one by one signing if only one item.

                if(_Optimized){
                    if(confirmArray.length > 0){
                        (confirmArray.length > 1) ? requestMultiConfirmDocs(confirmArray) : requestConfirmDoc(confirmArray[0]);
                    }

                    if(lightPushArray.length > 0){
                        (lightPushArray.length > 1) ? requestMultiLightPushDocs(lightPushArray) : requestPushDoc(lightPushArray[0]);
                    }

                    if(pushArray.length > 0){
                        for (i in pushArray){
                            requestPushDoc(pushArray[i]);
                        }
                    }
                }
                else {
                    for (i in confirmArray) requestConfirmDoc(theDoc[i]);
                    for (i in lightPushArray) requestPushDoc(theDoc[i]);
                    for (i in pushArray) requestPushDoc(pushArray[i]);
                }
            };

            /**
            @description Function that request to Metamask simple Push document blockchain method.
            @param  {Object} _identifier the identifier of the document
            */
            function requestPushDoc(_identifier){

                let doc = documentList.get(_identifier);
                Kernel_Contract.methods.pushDocument(doc.hash, doc.source, doc.document_family_id, extraDataFormatV5(doc.extra_data)).send({from: _fromAddress})
                .on('error',(error) => {
                    whenError(_identifier, error);
                })
                .on('transactionHash', (hash) => {
                    whenTxHash(_identifier, hash);
                })
                .on('receipt', (receipt) => {
                    whenReceipt(_identifier, receipt);
                });
            }

            /**
             * @description Function that request to Metamask a simple confirmation blockchain method.
             * @param {Object} _identifier
             */
            function requestConfirmDoc(_identifier){
                Kernel_Contract.methods.requestSignature(documentList.get(_identifier).hash).send({from: _fromAddress})
                .on('error',(error) => {
                    whenError(_identifier, error);
                })
                .on('transactionHash', (hash) => {
                    whenTxHash(_identifier, hash);
                })
                .on('receipt', (receipt) => {
                    whenReceipt(_identifier, receipt);
                });
            }

            function requestMultiConfirmDocs(_identifierArray){

                let hashArray = [];

                for (i of _identifierArray) hashArray.push(documentList.get(i).hash);

                Kernel_Contract.methods.requestSignatureList(hashArray).send({from: _fromAddress})
                .on('error',(error) => {
                    for(i of _identifierArray){
                        whenError(i, error);
                    }
                })
                .on('transactionHash', (hash) => {
                    for(i of _identifierArray){
                        whenTxHash(i, hash);
                    }
                })
                .on('receipt', (receipt) => {
                    for(i of _identifierArray){
                        whenReceipt(i, receipt);
                    }
                });
            }

            function requestMultiLightPushDocs(_identifierArray){

                let docFamilyArray = [];
                let docHashArray = [];

                for (i of _identifierArray) {
                    let oneDoc = documentList.get(i);
                    docFamilyArray.push(oneDoc.document_family_id);
                    docHashArray.push(oneDoc.hash);
                }

                Kernel_Contract.methods.lightPushDocumentList(docHashArray,docFamilyArray).send({from: _fromAddress})
                .on('error',(error) => {
                    for(i of _identifierArray){
                        whenError(i, error);
                    }
                })
                .on('transactionHash', (hash) => {
                    for(i of _identifierArray){
                        whenTxHash(i, hash);
                    }
                })
                .on('receipt', (receipt) => {
                    for(i of _identifierArray){
                        whenReceipt(i, receipt);
                    }
                });
            }


        };

        /**
         * @description create a new document object.
         * @param {String} _SignatureHash the hash of the document
         * @return {ULCDocAPI.KernelDocument}
         */
        this.createDocument = function(_SignatureHash){
            return new this.KernelDocument(_SignatureHash);
        };

        /**
         * @description create a document list handler to sign multiple document easily.
         * @param {String} _fromAddress the sender
         * @param {Function} _callBackTxHash
         * @param {Function} _callBackReceipt
         * @param {Function} _callBackError
         * @return {ULCDocAPI.DocumentSignQueue}
         */
        this.createSignQueue = function(_fromAddress, _callBackTxHash, _callBackReceipt, _callBackError){
            return new this.DocumentSignQueue(_fromAddress, _callBackTxHash, _callBackReceipt, _callBackError);
        }

    };

    /**
     @dev This Object can interact through ULCDocKernel, without Web3 knowledge.
     @dependancies Web3, ULCDocVersionner_ABI,ULCDocModV4_ABI
     @constructor {string} _ModeratorAddress the address of the kernel.
     */
    this.ULCDocModerator = function (_ModeratorAddress) {

        /* ---- CONTRUCTOR --- */
        if(!Web3Obj.utils.isAddress(_ModeratorAddress)) {
            throw new Error("Invalid kernel address provided, or checksum capitalisation failed.");
        }
        /* ------------------ */

        /**
         * @description Function that check if we used connect() function.
         * @dev we must connect to the moderator to get configuration of the latter.
         * @returns {loadDocumentDataV5ean}
         */
        this.connected = function() {
            return typeof Moderator_Info !== 'undefined';
        };

        /**
         * @typedef ModeratorConfig
         * @type {Object}
         * @property {number} version The version of the kernel
         * @property {String} moderatorURL the moderator landpage
         * @property {String} registerURL the register page to add a new kernel
         * @property {String} searchURL the search page of the moderator
         * @property {String} address the address of the moderator
         */
        let Moderator_Config = function(){
            this.version = 0;
            this.moderatorURL = "";
            this.registerURL = "";
            this.searchURL = "";
            this.address = "";
        };

        /**
         * @typedef KernelIdentity
         * @type {Object}
         * @property {boolean} initialized if the kernel is initialized by moderator
         * @property {boolean} confirmed if the kernel is valid
         * @property {boolean} revoked if the kernel is revoked
         * @property {boolean} organization if the kernel is an organisation
         * @property {String} lastContractAddress the last known kernel address by moderator
         * @property {number} revokedDate the UNIX date of revokation effective
         * @property {String} revokedReason why moderator revoke this kernel
         * @property {String} name the official name of the Kernel
         * @property {String} url the website of the kernel
         * @property {String} mail joingnable mail of the kernel
         * @property {String} physicalAddress address where you can meet owner of kernel
         * @property {String} imageURL image to use in src html
         * @property {String} phone official phone in international format
         * @property {Map<String, String>} extraData
         * @property {number} version version of the identity. It's updated at each modification. Used for cache purpose
         */
        let Kernel_Identity = function(){
            this.initialized = false;
            this.confirmed = false;
            this.revoked = false;
            this.organization = false;
            this.lastContractAddress = "";
            this.revokedDate = 0;
            this.revokedReason = "";
            this.name = "";
            this.url = "";
            this.mail = "";
            this.physicalAddress = "";
            this.imageURL = "";
            this.phone = "";
            this.extraData = new Map();
            this.version = 0;
        };

        let raw_address = _ModeratorAddress;

        //Web3 Contract object
        let Moderator_Contract;

        //KernelInfo of the Kernel Contract
        let Moderator_Info;

        /**
         * @return {ModeratorConfig}
         */
        this.getModeratorInfo = function() {
            return Moderator_Info;
        };

        /**
         * @return {String}
         */
        this.getRawAddress = function() {
            return raw_address;
        };


        /**
         * @description Function that fill Moderator info object for V4 and other compatible moderator Info object.
         */
        let getModeratorConfigV5 = async function(){
            //lisibility purposes : creating an array
            let promList = [];
            let info = new Moderator_Config();

            //loading Moderator info elements
            promList.push(Moderator_Contract.methods.MODERATOR_URL().call());
            promList.push(Moderator_Contract.methods.REGISTER_URL().call());
            promList.push(Moderator_Contract.methods.SEARCH_KERNEL_URL().call());

            //Executing Promise.All
            let values = await Promise.all(promList).catch(function(err){
                console.log(err);
                throw new Error("Impossible to fetch Kernel basic information V5.");
            });

            info.moderatorURL = values[0];
            info.registerURL = values[1];
            info.searchURL = values[2];
            return info;
        };


        let getModeratorQueryV4 = async function(_kernelAddress) {
            let identity = new Kernel_Identity();
            //lisibility purposes : creating an array
            let queryIdentity = await Moderator_Contract.methods.getKernelIdentity(_kernelAddress).call();

            /*
            [0] boolean initialized;
            [1] boolean confirmed;
            [2] boolean revoked;
            [3] boolean organisation;
            [4] address lastContractAddress;
            [5] uint256 version
            [6] uint256 revokedDate;
            [7] string revokedReason;
             */

            //if [0] = initialized
            if(queryIdentity[0]){
                identity.initialized = true;
                identity.confirmed = queryIdentity[1];
                identity.revoked = queryIdentity[2];
                identity.organization = queryIdentity[3];

                if(queryIdentity[4] === ULCDocAPI.ZERO_ADDRESS){
                    identity.lastContractAddress = _kernelAddress;
                }

                identity.version = Number(queryIdentity[5]);
                identity.revokedDate = Number(queryIdentity[6]);
                identity.revokedReason = queryIdentity[7];

                /*
                 [0] string name;
                 [1] string url;
                 [2] string mail;
                 [3] string physicalAddress;
                 [4] string imageURL;
                 [5] string phone;
                 [6] string extraData;
                 */

                let queryInfo = await Moderator_Contract.methods.getKernelInformation(_kernelAddress).call();

                identity.name = queryInfo[0];
                identity.url = queryInfo[1];
                identity.mail = queryInfo[2];
                identity.physicalAddress = queryInfo[3];
                identity.imageURL = queryInfo[4];
                identity.phone = queryInfo[5];
                identity.extraData = formatExtraDataV5(queryInfo[6]);


            }

            return identity;

        };
        /**
         @description connect : connect the API to a Kernel to check documents.
         @Throw Error if the version of the kernel is not compatible with the API.
         @Throw Error if we can't reach minimal functionnalities.
         @return {ModeratorConfig}
         */
        this.connect = async function () {
            //First we only load the versionner to know kernel version.
            let Moderator_Versionner = new Web3Obj.eth.Contract(ULCDocVersionner_ABI, raw_address);

            let moderatorVersion = 0;

            try {
                //Then we see if it is compatible.
                moderatorVersion = await Moderator_Versionner.methods.CONTRACT_VERSION().call();
            } catch(err) {
                throw new Error("Impossible to reach Kernel_Version method.");
            }

            let versionCompatible = false;
            moderatorVersion = Number(moderatorVersion);

            //we check if the Kernel version  is compatible with our list
            for (ver of ULCDocAPI.COMPATIBLE_MOD_VERSION){
                if (moderatorVersion === ver) {
                    versionCompatible = true;
                    break;
                }
            }

            if(!versionCompatible) {
                throw new Error("Version not compatible. Contract version is '" + moderatorVersion + "''");
            }

            //At this moment, Moderator version is OK. Loading the righ ABI according to Moderator Version.
            if(moderatorVersion === 4){
                Moderator_Contract = new Web3Obj.eth.Contract(ULCDocModV4_ABI, raw_address);
                Moderator_Info = await getModeratorConfigV5();
            }
            else {
                throw new Error("Impossible to configure Moderator_Contract.");
            }

            Moderator_Info.version = moderatorVersion;
            Moderator_Info.address = raw_address;

            return Moderator_Info;

        };

        /**
         * @description query : ask for mode information about a kernel.
         * @returns {KernelIdentity}
         */
        this.query = async function (_kernelAddress){

            if(!this.connected()){
                throw new Error("No moderator connected.");
            }

            if(Moderator_Info.version === 4){
                return await getModeratorQueryV4(_kernelAddress);
            }

        }

    };

    /**
     * @param  _Address {string} the address of the kernel to get.
     * @return {ULCDocAPI.ULCDocKernel} a kernel object.
     */
    this.getKernel = function(_Address){
        return new this.ULCDocKernel(_Address);
    };

    /**
     * @param _Address {string} the addres of the moderator to connect
     * @returns {ULCDocAPI.ULCDocModerator} a moderator object.
     */
    this.getModerator = function(_Address) {
        return new this.ULCDocModerator(_Address);
    }
}

/* STATIC ULCDOC API */

// Version :   [MAIN].[BETA].[BUILD]
ULCDocAPI.getVersion = function() {
    return "0.0.3";
};

//Array of all compatible contract version of this Interactor.
ULCDocAPI.COMPATIBLE_MOD_VERSION = [4];
ULCDocAPI.COMPATIBLE_KERNEL_VERSION  = [5];

/**
 * @description Error object when a dependancy is missing.
 * @param message the message to be displayed
 */

ULCDocAPI.DependancyError = function(message){
    this.constructor.prototype.__proto__ = Error.prototype;
    this.name = this.constructor.name;
    this.message = message;
};

/**
 * @description Default address of moderator smart contract.
 */
ULCDocAPI.DEFAULT_ADDRESS = new function () {
    this.BCE_MOD_MAINNET = "";
    this.BCE_MOD_ROPSTEN = "0x5ea18f6d4cd7c3189bf179a501937b110f0f731d";
};

/**
 * @description Function that check if an instance of web3/ethereum is injected by browser.
 * @returns {boolean}
 */
ULCDocAPI.usingInjector = function () {
    return typeof window.ethereum !== 'undefined';
};

/**
 * @description Function that return Infura Ropsten Web3 to init the API.
 * @returns {Web3}
 */
ULCDocAPI.getInfuraRopstenWeb3 = function() {
    return "wss://ropsten.infura.io/ws";
};

/**
 * @description Function that return Infura Mainnet Web3 to init the API.
 * @returns {Web3}
 */
ULCDocAPI.getInfuraMainnetWeb3 = function() {
    return "wss://mainnet.infura.io/ws";
};

ULCDocAPI.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
