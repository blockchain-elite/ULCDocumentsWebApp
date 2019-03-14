# Welcome to ULCDocuments !

 ## What is ULCDocuments ?
 ULCDocuments is a free / open source software that gives to everyone a tool to sign all type of documents permanantly on Ethereum Blockchain.

ULC is acronym of **U**ltra **L**ow **C**ost. The goal is to provide a very cheap way to use the blockchain, by providing free source code of smart contracts, API and a Web Client.

* *ULCDocuments* is the name of the project
* *ULCDocuments Blockchain App* is the **blockchain part**
* *ULCDocument Web App* is one possible **Implementation** to use ULCDocuments, provided by us.

## What is inside this repo ?
In this repo you will find source code of *ULCDocument Web App* that can communicate with *ULCDocuments Blockchain App*. The blockchain part of this project is *closed source* for the moment . Source code will be released few weeks before we release the first Web App stable version.

However, beta version of ABI is avaiable on `ULCDocuments/docs/js/abi` folder.

# Setup & Configuration

## Check if a document is signed by someone

If you want to check if a document is signed by someone, you need to connect to it's **Kernel** where it's signatures are stored. The **Kernel** is the main part of the Blockchain Application. It handle multi-operators signing, multi-owners administration and so on [Smart Contract Documentation in progress].

Every moral/physical person has his own Kernel. The **Moderator** Smart contract is able to provide you the identity of the kernel connected if the latter chose to register on it. [More info on doc in progress]. Otherwise, you only will be able to see Kernel address.
> For security reason, it's safer to only use Kernels that are registered on a trustworthy Moderator, such as **Blockchain-Elite Moderator** ([0x4Ad22344fFD31ce4E21397bBaD8FE0816d977a0a](https://ropsten.etherscan.io/address/0x4ad22344ffd31ce4e21397bbad8fe0816d977a0a) on **Ropsten Testnet**). The latter is the moderator configured by default on this web app.
> Paid attention : because we're in beta, this adress might change over the time. But don't worry, WebApp will be updated :)

### Auto Connect to Kernel
* Auto connect is possible if your address have these arguments :
	* ulcdocuments.blockchain-elite.fr/ulcdoc_interactor.html / **#mode:check&kernel:0x...**

### Manual connection to Kernel
* Just go to https://ulcdocuments.blockchain-elite.fr/ that is the link to this GitHub pages repo.
* Click on the **check** button
* Enter Ethereum Address of the Kernel on *Kernel Connection* section
* Press connect

## Sign documents

**!!! WARNING : THIS APP IS STILL IN EARLY BETA SO DON'T USE IT IN MAINNET !!!**
*Clients without Metamask are automatically connected to Ropsten Testnet.*

If you want to sign a document, you must be an owner or an operator of a *ULCDocuments Kernel* Smart Contract deployed on Ethereum.
Smart Contracts are not open source yet so if you want to participate, a link to a form to get a free Kernel on Ropsten will be available soon.

# Usage

## Check Signatures
After being connected to a kernel, you can easily check if kernel signed the document you want to check.
You can check if **Files**, **Raw text** or directly **hashes**.
### Files
* Simply Drag & Drop the file you want to check on **File** tab
* Click on **Check** button
### Raw Text
* Go on **Text** tab and click on "+"
* Start writing your text
* Click on **Check** button
### Hashes
* Hash manually your document with correct hash algorithm (SHA3-256 by default)
* Go on **Hash** tab and click on "+"
* Paste your hash without "0x"f you have it
* Click on **Check** button

> Note : you can click on a element's card to display it's detailed info, provided by **Blockchain** or **local infos (size, type,etc...)**


## Sign Documents

**!!! WARNING : THIS APP IS STILL IN EARLY BETA SO DON'T USE IT IN MAINNET !!!**
*Clients without Metamask are automatically connected to Ropsten Testnet.*

In order to sign document, you must have [Metamask](https://metamask.io/) installed or use a Dapp browser like [Mist](https://github.com/ethereum/mist).
* Launch the WebApp on sign mode by clicking on **sign** button in the Homepage or simply reconnect to the kernel and check the *Enable Sign Mode* checkbox.
* Go to *sign* tab if you are not on this tab
* Drag & Drop documents, write text or paste hash like you usually do on *check mode*
* Write any other information on their card by clicking on elements
* Click on **fetch** button. That will check if documents can be signed or not (it verifies it they are not already signed, pending, etc.)
* Click on **sign** button. It will creates appropriated transactions and you will be prompted to accept them through your Ethereum connector (Metamask or others).


# Code your own application using ULCDocuments
*ULCDocuments Blockchain App* is a set of Ethereum Smart Contract that can interact with other smart contracts or with Humans through connectors (Metamask, Mis) and apps.
We already provide a WebApp but you can code your own application that use ULCDocuments smart contract, and Blockchain Elite Moderator API. Please read the documentation [IN PROGRESS] to know more.

# Who is behind the project ?

ULCDocuments is developped by [Blockchain Elite Labs](https://www.blockchain-elite.fr/labs) . The goal is to create some experimental tools based on Blockchain that are open-source, to promote practical blockchain public applications and Blockchain-Elite know-how.

# License
ULCDocuments has 2 licenses :
* [GNU General Public License V3](http://www.gnu.org/licenses/) by default on all files
* [GNU Lesser General Public License V3](http://www.gnu.org/licenses/) for files that are into `ULCDocuments/docs/js/abi`
