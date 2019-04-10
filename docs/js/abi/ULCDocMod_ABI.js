/* Copyright 2019 Blockchain-Élite dev team
 This file is part of the  ULCDocApp Connector (ie: all files inside ABI folder).
 The   ULCDocApp Connector (ie: all files inside ABI folder) is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

  The   ULCDocApp Connector (ie: all files inside ABI folder)  is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with the   ULCDocApp Connector (ie: all files inside ABI folder)  . If not, see <http://www.gnu.org/licenses/>. */

ULCDocModABI = [
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_name",
        "type": "string"
      },
      {
        "name": "_isOrga",
        "type": "bool"
      }
    ],
    "name": "push_KernelIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_urlSearch",
        "type": "string"
      }
    ],
    "name": "set_SearchKernel",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      }
    ],
    "name": "confirm_KernelIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "MODERATOR_URL",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_urlModerator",
        "type": "string"
      }
    ],
    "name": "set_ModeratorURL",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      }
    ],
    "name": "confirm_RevokeKernelIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_index",
        "type": "uint256"
      },
      {
        "name": "_kernelAddress",
        "type": "address"
      }
    ],
    "name": "transferedKernelIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_url",
        "type": "string"
      }
    ],
    "name": "set_KernelURL",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "kill",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_extra_data",
        "type": "string"
      }
    ],
    "name": "set_KernelExtra",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getKernelBookSize",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_reason",
        "type": "string"
      }
    ],
    "name": "push_RevokeKernelIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_physicalAddress",
        "type": "string"
      }
    ],
    "name": "set_PhysicalAddress",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "REGISTER_URL",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "clearKill",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "KERNEL_INFO_BOOK",
    "outputs": [
      {
        "name": "url",
        "type": "string"
      },
      {
        "name": "mail",
        "type": "string"
      },
      {
        "name": "physicalAddress",
        "type": "string"
      },
      {
        "name": "imageURL",
        "type": "string"
      },
      {
        "name": "phone",
        "type": "string"
      },
      {
        "name": "extra_data",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_phone",
        "type": "string"
      }
    ],
    "name": "set_KernelPhone",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_index",
        "type": "uint256"
      },
      {
        "name": "_kernelAddress",
        "type": "address"
      }
    ],
    "name": "request_removeKernelIdentiy",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_urlRegister",
        "type": "string"
      }
    ],
    "name": "set_ModeratorRegistrer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_mail",
        "type": "string"
      }
    ],
    "name": "set_KernelMail",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_isOrga",
        "type": "bool"
      }
    ],
    "name": "set_Organisation",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_physicalAddress",
        "type": "string"
      },
      {
        "name": "_url",
        "type": "string"
      },
      {
        "name": "_mail",
        "type": "string"
      },
      {
        "name": "_imageURL",
        "type": "string"
      },
      {
        "name": "_phone",
        "type": "string"
      }
    ],
    "name": "update_KernelInformation",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "KERNEL_IDENTITY_BOOK",
    "outputs": [
      {
        "name": "initialized",
        "type": "bool"
      },
      {
        "name": "confirmed",
        "type": "bool"
      },
      {
        "name": "isRevoked",
        "type": "bool"
      },
      {
        "name": "isOrganisation",
        "type": "bool"
      },
      {
        "name": "version",
        "type": "uint256"
      },
      {
        "name": "revoked_date",
        "type": "uint256"
      },
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "revoked_reason",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      }
    ],
    "name": "clear_RevokeProcess",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "set_KernelName",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ULCDocKernelAddress",
        "type": "address"
      },
      {
        "name": "_imageURL",
        "type": "string"
      }
    ],
    "name": "set_KernelImage",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
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
    "type": "function"
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
    "type": "function"
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
    "type": "function"
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
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "KERNEL_BOOK_KEYS",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_kernelAddress",
        "type": "address"
      }
    ],
    "name": "clear_KernelIdentityRemoval",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "SEARCH_KERNEL_URL",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "kernelAddress",
        "type": "address"
      }
    ],
    "name": "newKernelRegistred",
    "type": "event"
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
    "type": "event"
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
    "type": "event"
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
    "type": "event"
  }
];
