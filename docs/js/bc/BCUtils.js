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

/*  ULCDOCUMENTS MASTER JAVASCRIPT UTILS
*  @author Adrien BARBANSON <Contact Form On Blockchain-Élite website>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

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
        let oneExtraData = oneExtraDataCouple.split(":");
        logMe(ULCDocModMasterPrefix,"New Couple detected !  [" + oneExtraData[0] + ":" + oneExtraData[1] + "]");
        result.set(oneExtraData[0],oneExtraData[1]);
    });
    return result;
}


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

/** @dev function that create good link to etherscan depending on network connected.
*  @param {String} txHash the hash of the transaction
* @return {String} link to etherscan */
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
