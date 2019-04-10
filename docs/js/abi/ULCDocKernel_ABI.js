/* Copyright 2019 Blockchain-Élite dev team
 This file is part of the  ULCDocuments Connector (ie: all files inside ABI folder).
 The   ULCDocuments Connector (ie: all files inside ABI folder) is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

  The   ULCDocuments Connector (ie: all files inside ABI folder)  is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with the   ULCDocuments Connector (ie: all files inside ABI folder)  . If not, see <http://www.gnu.org/licenses/>. */

ULCDocKernelABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "owners",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x022914a7"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_theKey",
        "type": "bytes32"
      }
    ],
    "name": "getOperatorRequestLength",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x0b0adf27"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_SignatureHash",
        "type": "bytes32"
      }
    ],
    "name": "confirmDocument",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x0bee6c88"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "ownerCount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x0db02622"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_nb",
        "type": "uint256"
      }
    ],
    "name": "setOperatorsForChange",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x1052a537"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "PRETENTED_REF_MODERATOR",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x1114ee2c"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "operators",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x13e7c9d8"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_SignatureHash",
        "type": "bytes32"
      }
    ],
    "name": "clearRevokeProcess",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x15989006"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_removableOperator",
        "type": "address"
      }
    ],
    "name": "requestRemoveOperator",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x2604b799"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "DOC_FAMILY_LIST",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x2902643c"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_newOwner",
        "type": "address"
      }
    ],
    "name": "requestAddOwner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x2e020f20"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_theKey",
        "type": "bytes32"
      }
    ],
    "name": "getOwnerRequestLength",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x36f3de14"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_doRequestContest",
        "type": "bytes32"
      }
    ],
    "name": "requestOperatorContest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x3ad3116e"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_oldOwner",
        "type": "address"
      },
      {
        "name": "_newOwner",
        "type": "address"
      }
    ],
    "name": "requestChangeOwner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x3bbd9264"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x3f4ba83a"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "kill",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x41c0e1b5"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_theKey",
        "type": "bytes32"
      }
    ],
    "name": "getOperatorRequest",
    "outputs": [
      {
        "name": "",
        "type": "address[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x4f55ef94"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "DOC_FAMILY_STRINGIFIED",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x52583290"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_newOperator",
        "type": "address"
      }
    ],
    "name": "requestAddOperator",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x570f5c96"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x5c975abb"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_SignatureHash",
        "type": "bytes32"
      }
    ],
    "name": "confirmRevokeDocument",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x61719cf6"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getDocFamilySize",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x6398932f"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_SignatureHash",
        "type": "bytes32"
      }
    ],
    "name": "clearDocument",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x70543d43"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_doRequestContest",
        "type": "bytes32"
      }
    ],
    "name": "requestOwnerContest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x74435c11"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_allKeys",
        "type": "bytes32[]"
      },
      {
        "name": "_allDocumentFamily",
        "type": "uint16[]"
      }
    ],
    "name": "lightPushDocumentList",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x75705914"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "operatorCount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x7c6f3158"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "clearKill",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x7c7e61f6"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_index",
        "type": "uint256"
      },
      {
        "name": "_moderatorAdress",
        "type": "address"
      }
    ],
    "name": "removePretendedModerator",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x7ef1a125"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_allKeys",
        "type": "bytes32[]"
      }
    ],
    "name": "confirmDocumentList",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x80ca1e26"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "bytes32"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "doOperatorRequest",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x829ab9fa"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x8456cb59"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_moderatorAddress",
        "type": "address"
      }
    ],
    "name": "addPretendedModerator",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x89b69340"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_removableOwner",
        "type": "address"
      }
    ],
    "name": "requestRemoveOwner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x914b1f9d"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "Contract_Version",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x929e928a"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "DOCUMENTS_COUNTER",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x9bc19126"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "operatorsForChange",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xa5bc9cd3"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_oldOperator",
        "type": "address"
      },
      {
        "name": "_newOperator",
        "type": "address"
      }
    ],
    "name": "requestChangeOperator",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xaf8d92da"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "HASH_ALGORITHM",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xc23fff0b"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "ownersForChange",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xcb8a67ed"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_SignatureHash",
        "type": "bytes32"
      },
      {
        "name": "_reason",
        "type": "string"
      }
    ],
    "name": "pushRevokeDocument",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xd24094db"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_theKey",
        "type": "bytes32"
      }
    ],
    "name": "getOwnerRequest",
    "outputs": [
      {
        "name": "",
        "type": "address[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xdbc385de"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_newContractAddress",
        "type": "address"
      }
    ],
    "name": "requestUpgradeSmartContract",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xe3502cfe"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "SIGNATURES_BOOK",
    "outputs": [
      {
        "name": "initialized",
        "type": "bool"
      },
      {
        "name": "signed",
        "type": "bool"
      },
      {
        "name": "revoked",
        "type": "bool"
      },
      {
        "name": "signed_date",
        "type": "uint256"
      },
      {
        "name": "revoked_date",
        "type": "uint256"
      },
      {
        "name": "document_family",
        "type": "uint16"
      },
      {
        "name": "signature_version",
        "type": "uint8"
      },
      {
        "name": "revoked_reason",
        "type": "string"
      },
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "extra_data",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xe39921e0"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_nb",
        "type": "uint256"
      }
    ],
    "name": "setOwnersForChange",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xe7fe80e1"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "bytes32"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "doOwnerRequest",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xee7aed7d"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_SignatureHash",
        "type": "bytes32"
      },
      {
        "name": "_source",
        "type": "string"
      },
      {
        "name": "_indexDocumentFamily",
        "type": "uint16"
      },
      {
        "name": "_extra_data",
        "type": "string"
      }
    ],
    "name": "pushDocument",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xff9ff59a"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor",
    "signature": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "Paused",
    "type": "event",
    "signature": "0x9e87fac88ff661f02d44f95383c817fece4bce600a3dab7a54406878b965e752"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "Unpaused",
    "type": "event",
    "signature": "0xa45f47fdea8a1efdd9029a5691c7f759c32b7c698632b563573e155625d16933"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipNewInteractor",
    "type": "event",
    "signature": "0x7a1dfee0fed66bbe753e7cacf687555c3b90262b467ca4051bc9db78ecb7b718"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "oldOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipLossInteractor",
    "type": "event",
    "signature": "0xcfb43782fb4b42dbddd63f2679e351f90b2861659c5970fd96e516431372e439"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event",
    "signature": "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "newOperator",
        "type": "address"
      }
    ],
    "name": "OperatorNewInteractor",
    "type": "event",
    "signature": "0x3729c74abdcd437a168ed923de0c7e42158e276aefad2dab3b083cb5c5ac5f9a"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "oldOperator",
        "type": "address"
      }
    ],
    "name": "OperatorLossInteractor",
    "type": "event",
    "signature": "0x9415f62f3f8684284be8469a0d615e731ea44d32b4dfb40be4ef52c873040e05"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "previousOperator",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "newOperator",
        "type": "address"
      }
    ],
    "name": "OperatorshipTransferred",
    "type": "event",
    "signature": "0xb37ff92c23eca455dbbd028d9cb869f69e16485d5ef15286fc394c721a5d5dc1"
  }
];
