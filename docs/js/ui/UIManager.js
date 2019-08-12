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

/*  ULCDOCUMENTS MAIN UI JAVASCRIPT HANDLER
*  @author Arnaud VERGNET <arnaud.vergnet@netc.fr>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/


/* *********************************************************
 *                      CONSTANTS
 **********************************************************/

const APP_VERSION = 'beta 0.0.10';

const APP_MODE = {
    check: 0,
    sign: 1
};

const HASH_APP_MODE = [
    'check',
    'sign'
];

const HASH_PARAM_NAMES = { // Hash parameters to use when reading URL
    appMode: 'mode',
    kernelAddress: 'kernel',
    network: 'network'
};

const MIME_TYPE_ICONS = { // FontAwesome icon based on file mime type
    'image': 'far fa-file-image',
    'audio': 'far fa-file-audio',
    'video': 'far fa-file-video',
    'word': 'far fa-file-word',
    'document': 'far fa-file-word',
    'excel': 'far fa-file-excel',
    'sheet': 'far fa-file-excel',
    'powerpoint': 'far fa-file-powerpoint',
    'presentation': 'far fa-file-powerpoint',
    'pdf': 'far fa-file-pdf',
    'text': 'far fa-file-alt',
    'zip': 'far fa-file-archive',
    'fallback': 'far fa-file'
};

const TAB_TYPE = {
    file: 0,
    text: 1,
    hash: 2
};

const UI_STATE = {
    none: 'none',
    checking: 'checking',
    fetching: 'fetching',
    fetched: 'fetched',
    signing: 'signing'
};

const COLOR_CLASSES = {
    none: '',
    info: 'alert-info',
    secondary: 'alert-secondary',
    success: 'alert-success',
    warning: 'alert-warning',
    danger: 'alert-danger',
};

const ITEM_STATE_TEXT = {}; // Text based on item state to display in the UI
ITEM_STATE_TEXT[TypeElement.Unknown] = 'Awaiting user';
ITEM_STATE_TEXT[TypeElement.Computing] = 'Computing Hash...';
ITEM_STATE_TEXT[TypeElement.Loading] = 'Asking Blockchain...';
ITEM_STATE_TEXT[TypeElement.Signed] = 'Signed';
ITEM_STATE_TEXT[TypeElement.Fake] = 'Not signed';
ITEM_STATE_TEXT[TypeElement.Invalid] = 'Error';
ITEM_STATE_TEXT[TypeElement.Pending] = 'Already signed by user';
ITEM_STATE_TEXT[TypeElement.Revoked] = 'Signature revoked';
ITEM_STATE_TEXT[TypeElement.TxProcessing] = 'Processing...';
ITEM_STATE_TEXT[TypeElement.TransactionFailure] = 'Signature failed';
ITEM_STATE_TEXT[TypeElement.TransactionSuccess] = 'Signature sent';

const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB

const JQUERY_CONFIRM_THEME = 'modern';

const OSM_QUERY_LINK = 'https://www.openstreetmap.org/search?query=';

/* *********************************************************
 *                      UI OBJECT
 **********************************************************/

/**
 * Class defining UI management and backend communication functions.
 *
 * @constructor
 */
function UIManager() {

    /* *********************************************************
     *                      VARIABLES
     **********************************************************/

    let _itemList = new Map(); // A map representing the list of items to be checked (one map per type)
    // Two lists: one for the check mode, an other for sign
    _itemList.set(APP_MODE.check, new Map());
    _itemList.set(APP_MODE.sign, new Map());
    // These items inherit the ListItems class as defined in UIListItems.js
    for (let key of _itemList.keys()) {
        _itemList.get(key).set(TAB_TYPE.file, new Map());
        _itemList.get(key).set(TAB_TYPE.text, new Map());
        _itemList.get(key).set(TAB_TYPE.hash, new Map());
    }

    const WALLET_STATE = {
        unknown: 0,
        injected: 1,
        infura: 2
    };

    let _kernelManager = new UIKernelManager();
    let _moderatorManager = new UIModeratorManager();
    let _itemDetailsManager = new UIItemDetailsManager();

    let _uniqueIdCounter = 0; // unique id referencing a list item (file, text or hash)
    let _itemsProcessedCounter = 0; // The number of items in the current list (file text or hash) that have been checked
    let _isVerbose = false; // Should we display additional information in the console
    let _isOptimizerEnabled = true; // Should we optimize signing ?
    let _canUseDropZone = true; // Can the user use the dropZone ?
    let _currentTab = TAB_TYPE.file; // The current tab selected (text, file or hash)
    let _currentAppMode = APP_MODE.check; // The current app mode (check or sign)
    let _currentWalletState = WALLET_STATE.unknown; // Are we using an injected wallet (metamask) ?
    let _isAccountOperator = false; // Is the current account operator of the current kernel ?
    let _isLoadingAccounts = false; // Are we currently requesting account information ?
    let _isAccountsListAvailable = false; // Do we have an account list ready ?
    let _filesOverLimitArray = [];
    let _currentUiState = UI_STATE.none;
    let _currentNetworkType = TypeConnection.Unkown;
    let _elementsToSign = 0;
    let _elementSigned = 0;
    let _selectedItems = [];

    /* *********************************************************
     *                      JQUERY SELECTORS
     **********************************************************/

    // Tab specific selectors
    let $tabHolders = [
        $("#dropZone"),
        $("#textBox"),
        $("#hashBox")
    ];
    let $tabButtons = [
        $("#fileTabSelector"),
        $("#textTabSelector"),
        $("#hashTabSelector")
    ];
    let $tabListEmptyTemplate = [
        $("#fileListEmptyTemplate"),
        $("#textListEmptyTemplate"),
        $("#hashListEmptyTemplate")
    ];
    // Change app mode buttons
    let $modeButtons = [
        $(".check-mode-button"),
        $(".sign-mode-button")
    ];

    /* *********************************************************
     *                    PRIVATE FUNCTIONS
     * *********************************************************/

    /**
     * Get the app mode based on the url hash. Use check as fallback
     *
     * @return {APP_MODE} sign or check type
     */
    let detectAppMode = function () {
        let type = APP_MODE.check;
        let hashType = getUrlHashParameter(HASH_PARAM_NAMES.appMode);
        for (let key of Object.keys(APP_MODE)) {
            if (hashType === HASH_APP_MODE[APP_MODE[key]]) {
                type = APP_MODE[key];
            }
        }
        _currentAppMode = type;
        log('Detected following app mode: ' + HASH_APP_MODE[type]);
    };


    /**
     * Get the current network from the url
     */
    let detectCurrentNetwork = function () {
        let hashNetwork = capitalizeFirstLetter(getUrlHashParameter(HASH_PARAM_NAMES.network));
        // if there is a specified network in the url and if it is valid, save it
        if (hashNetwork !== undefined && TypeConnection[hashNetwork] !== undefined) {
            connectToNetwork(TypeConnection[hashNetwork]);
        } else { // else, ask the user
            showNetworkSelectionPopup('Select the network',
                'The link you followed did not specify a network. Which one do you want to use ?')
        }
    };


    let showNetworkSelectionPopup = function (title, message) {
        $.confirm({
            title: title,
            content: message +
                '<ul>' +
                '<li><strong>Mainnet:</strong> Signatures can be trusted, use this if unsure.</li>' +
                '<li><strong>Ropsten:</strong> Signatures cannot be trusted, use only for test purposes.</li>' +
                '</ul>',
            type: 'blue',
            theme: JQUERY_CONFIRM_THEME,
            columnClass: 'xlarge',
            icon: 'fas fa-question',
            typeAnimated: true,
            buttons: {
                mainnet: {
                    text: 'Mainnet',
                    btnClass: 'btn-green',
                    action: function () {
                        connectToNetwork(TypeConnection.Mainnet);
                    }
                },
                ropsten: {
                    text: 'Ropsten',
                    btnClass: 'btn-orange',
                    action: function () {
                        connectToNetwork(TypeConnection.Ropsten);
                    }
                },
            },
        });
    };

    let getNetworkName = function (network) {
        let networkName;
        for (let type in TypeConnection) {
            if (TypeConnection[type] === network) {
                networkName = type;
                break;
            }
        }
        return networkName;
    };

    let connectToNetwork = function (network) {
        setUrlHashParameter(HASH_PARAM_NAMES.network, getNetworkName(network));
        startApp(network)
            .then((networkObject) => {
                _currentNetworkType = network;
                updateNetworkConnectedUI(network);
                updateWalletStateUI(networkObject.isUsingInjector);
                updateModeratorConnection(networkObject.moderatorObject);
                tryReadyUI();
            })
            .catch((err) => {
                console.log(err);
                if (err instanceof NetworkConflictError) {
                    console.log('coucou');
                    showNetworkConflictPopup(err.selectedNetwork, err.web3Network)
                } else {
                    showUnsupportedNetworkPopup();
                }
            });
    };

    let showUnsupportedNetworkPopup = function() {
        $.confirm({
            title: 'Network Not supported',
            content: 'The selected network is currently not supported.<br/>' +
                'Please reconnect using Ropsten Network.',
            type: 'red',
            theme: JQUERY_CONFIRM_THEME,
            columnClass: 'xlarge',
            icon: 'fas fa-warning',
            typeAnimated: true,
            buttons: {
                reconnect: {
                    text: 'Reconnect using Ropsten',
                    btnClass: 'btn-blue',
                    action: function () {
                        connectToNetwork(TypeConnection.Ropsten);
                    }
                },
            },
        });
    };


    let showNetworkConflictPopup = function (sNetwork, web3Network) {
        $.confirm({
            title: 'Network conflict detected',
            content: 'The link you followed is using <strong>' + getNetworkName(sNetwork) + '</strong> but Metamask is ' +
                'configured to connect to <strong>' + getNetworkName(web3Network) + '</strong>. <br/>' +
                'Please set Metamask to use <strong>' + getNetworkName(sNetwork) + '</strong> (recommended), ' +
                'or click the button below to reconnect to the kernel using <strong>' + getNetworkName(web3Network) + '</strong>.<br/><br/>' +
                'Please note, selecting a different network from the link you followed may result in untrustable data.' +
                '<ul>' +
                '<li><strong>Mainnet:</strong> Signatures can be trusted, use this if unsure.</li>' +
                '<li><strong>Ropsten:</strong> Signatures cannot be trusted, use only for test purposes.</li>' +
                '</ul>',
            type: 'orange',
            theme: JQUERY_CONFIRM_THEME,
            columnClass: 'xlarge',
            icon: 'fas fa-warning',
            typeAnimated: true,
            buttons: {
                reconnect: {
                    text: 'Reconnect using ' + getNetworkName(web3Network),
                    btnClass: 'btn-orange',
                    action: function () {
                        connectToNetwork(web3Network);
                    }
                },
            },
        });
    };


    /**
     * Set the UI to fade In/Out to switch type
     *
     * @param type {APP_MODE} Sign or check type
     * @param firstRun {Boolean} Should we fadeIN/Out ?
     */
    this.setUIMode = function (type, firstRun) {
        log('switching to ' + HASH_APP_MODE[type]);
        if (!firstRun) {
            $.selector_cache('#mainCardBody').fadeOut('fast', function () {
                setUIElements(type);
                $.selector_cache('#mainCardBody').fadeIn('fast');
            });
        } else {
            setUIElements(type);
        }
    };

    /**
     * Set UI elements values based on given type
     *
     * @param type {APP_MODE} The type used for element values
     */
    let setUIElements = function (type) {
        setUrlHashParameter(HASH_PARAM_NAMES.appMode, HASH_APP_MODE[type]); // update the url
        setUrlHashParameter(HASH_PARAM_NAMES.appMode, HASH_APP_MODE[type]); // update the url
        _currentAppMode = type;
        for (let key of Object.keys(APP_MODE)) {
            if (APP_MODE[key] === type)
                $modeButtons[type].addClass('active');
            else
                $modeButtons[APP_MODE[key]].removeClass('active');
        }
        if (type === APP_MODE.check) {
            $.selector_cache('#appModeCss').attr('href', 'css/check.css'); // Change the stylesheet to change the theme
            $(".btn-info").addClass('btn-primary').removeClass('btn-info'); // replace info by primary (green to blue)
            $.selector_cache('#checkButtonLogo').attr('class', 'far fa-check-square');
            $.selector_cache('#checkButtonText').html('Check');
            $.selector_cache('#signActionButtonContainer').hide();
            $.selector_cache('#accountsCard').hide();
        } else {
            $.selector_cache("#signTab").show();
            $.selector_cache('#appModeCss').attr('href', 'css/sign.css');
            $(".btn-primary").addClass('btn-info').removeClass('btn-primary');
            $.selector_cache('#checkButtonLogo').attr('class', 'fas fa-sync-alt');
            $.selector_cache('#checkButtonText').html('Fetch');
            $.selector_cache('#signActionButtonContainer').show();
            $.selector_cache('#accountsCard').show();
            if (_kernelManager.isConnected())
                askForAccounts();
        }
        recreateAppModeItemList();
        UI.updateMainUIState();
        UI.resetProgress();
        UI.updateCheckButtonState();
    };

    let askForAccounts = function () {
        if (!_isAccountsListAvailable) {
            _isLoadingAccounts = true;
            requestAccountInfo()
                .then((accountsMaps) => {
                    updateAccounts(accountsMaps);
                })
                .catch((err) => {
                    console.log(err);
                    updateAccounts(undefined);
                });
        }
    };

    /**
     * Set default field values based on url hash parameters
     */
    let setDefaultFieldValues = function () {
        let kernelAddress = getUrlHashParameter(HASH_PARAM_NAMES.kernelAddress);
        if (kernelAddress !== undefined) {
            _kernelManager.setCurrentAddress(kernelAddress);
            $.selector_cache('#kernelAddressInput').val(_kernelManager.getCurrentAddress());
        }
    };

    /**
     * Check if all the conditions are met to start using the app and show a warning if using testnet
     */
    let tryReadyUI = function () {
        if (_moderatorManager.isConnected() && _currentWalletState !== WALLET_STATE.unknown
            && $.selector_cache('#loadingScreen').css('display') !== 'none') {
            readyUI();

            if (_currentNetworkType !== TypeConnection.Mainnet)
                showTestnetWarning();
        }
    };

    /**
     * Display the UI and connect to the kernel specified in the url
     */
    let readyUI = function () {
        // Display the UI
        $.selector_cache('#loadingScreen').fadeOut('fast', function () {
            $.selector_cache('#baseContainer').fadeIn('fast');
        });
        // Connect to kernel
        if (_kernelManager.getCurrentAddress() !== '')
            UI.tryKernelConnection(_kernelManager.getCurrentAddress());
    };

    /**
     * Show a warning when using a testnet
     */
    let showTestnetWarning = function () {
        if (Cookies.get('hide-ropsten-warning') === undefined) {
            $.selector_cache('#ropstenWarning').show();
            animateCss($.selector_cache('#ropstenWarning'), 'fadeInRight faster');
        }

    };

    let hideTestnetWarning = function () {
        animateCss($.selector_cache('#ropstenWarning'), 'fadeOutRight faster', function () {
            $.selector_cache('#ropstenWarning').hide();
        });
    };

    /**
     * Create the lists in every tab for the current app mode
     */
    let recreateAppModeItemList = function () {
        for (let i of Object.keys(TAB_TYPE)) {
            let tab = TAB_TYPE[i];
            let list = getList(_currentAppMode, tab);
            if (list.size)
                $tabHolders[tab].html(""); // Items available, clear the tab
            else
                resetTabZone(tab); // Reset the zones
            for (let item of list.values()) {
                item.createEntry(false);
            }
            updateDisplayIds(tab); // Update the ids for the list
        }
    };

    this.tryKernelConnection = function (address) {
        _kernelManager.setKernelConnectionLoading(true);
        setUrlHashParameter(HASH_PARAM_NAMES.kernelAddress, address);
        queryKernelAddress(address)
            .then((kernelIdentity) => {
                _kernelManager.setCurrentKernelIdentity(kernelIdentity);
                if (kernelIdentity.confirmed) {
                    connectToKernel();
                } else {
                    UI.promptKernelConnectionWarnAnswer();
                }
            })
            .catch((err) => {
                console.log(err);
                log('Error fetching kernel information', TypeInfo.Warning);
                updateKernelConnectionBox(KERNEL_CONNECTION_TYPE.error);
            });
    };

    let connectToKernel = function () {
        updateKernel(_kernelManager.getCurrentAddress())
            .then((kernelConfig) => {
                _kernelManager.setCurrentKernelConfig(kernelConfig);
                updateKernelConnectionBox(KERNEL_CONNECTION_TYPE.connected);
            })
            .catch((err) => {
                console.log(err);
                updateKernelConnectionBox(KERNEL_CONNECTION_TYPE.error);
            });
    };

    this.connectToModerator = function (address) {
        _moderatorManager.setConnected(false);
        _moderatorManager.setModeratorConnectionLoading(true);
        updateModerator(address)
            .then((moderatorInfo) => {
                updateModeratorConnection(moderatorInfo);
            })
            .catch((err) => {
                log('Could not connect to moderator');
                console.log(err);
                updateModeratorConnection(undefined);
            });
    };

    /**
     * Register global page events and associate listeners
     */
    let registerEvents = function () {
        for (let key of Object.keys(APP_MODE)) {
            $modeButtons[APP_MODE[key]].on('click', function () {
                if (!$modeButtons[APP_MODE[key]].hasClass('active')) // Do not change if we are already in this mode
                    UI.setUIMode(APP_MODE[key], false);
            });
        }
        $.selector_cache('#clearItemListButton').on('click', function () { // Remove all items from the list in the current tab
            let itemsList = getCurrentList().values();
            for (let item of itemsList) {
                item.removeEntryAnimation();
            }
        });
        $.selector_cache('#checkButton').on('click', function () {
            checkStart();
        });
        $.selector_cache('#signButton').on('click', function () {
            startSign();
        });
        $.selector_cache('#cancelButton').on('click', function () {
            UI.setUIElementsState(UI_STATE.none);
            resetElementsFromList(getCurrentList());
            UI.resetProgress();
        });
        $.selector_cache('#selectAllButton').on('click', function () {
            let shouldSelect = _selectedItems.length !== getCurrentList().size;
            for (let item of getCurrentList().values()) {
                item.setSelected(shouldSelect);
            }
        });
        $.selector_cache('#kernelAddressInputConnect').on('click', function () {
            _kernelManager.setCurrentAddress($.selector_cache('#kernelAddressInput').val());
            UI.tryKernelConnection(_kernelManager.getCurrentAddress());
        });

        $tabHolders[TAB_TYPE.file] // DropZone management
            .on("dragover", function (event) {
                event.stopPropagation();
                event.preventDefault();
                if (_canUseDropZone)
                    $tabHolders[TAB_TYPE.file].addClass('drop-hover shadow');
                return true;
            })
            .on("drop", function (event) {
                event.stopPropagation();
                event.preventDefault();
                $tabHolders[TAB_TYPE.file].removeClass('drop-hover shadow');
                if (_canUseDropZone) {
                    if (event.originalEvent.dataTransfer && event.originalEvent.dataTransfer.files.length !== 0) {
                        let files = event.originalEvent.dataTransfer.files;
                        importFiles(files);

                    } else {
                        log('Browser does not support drag and drop', TypeInfo.Warning);
                        alert('Browser does not support drag and drop');
                    }
                } else
                    log('DropZone disabled', TypeInfo.Warning);
            })
            .on("dragexit", function () {
                $tabHolders[TAB_TYPE.file].removeClass('drop-hover shadow');
            });
        $.selector_cache('#importButtonHolder').on('click', function () {
            $.selector_cache('#importButton').trigger('click');
        });
        $.selector_cache('#importButton').on('change', function (event) {
            importFiles(event.target.files);
        });
        $.selector_cache('#addItemButton').on('click', function () {
            createItemEntry();
        });
        $.selector_cache('#editItemButton').on('click', function () {
            _itemDetailsManager.displayItemListProps(_selectedItems);
        });
        $.selector_cache('#ropstenWarningCloseIcon').on('click', function () {
            hideTestnetWarning();
        });
        $.selector_cache('#ropstenWarningClosePermanent').on('click', function () {
            Cookies.set('hide-ropsten-warning', '1', {expires: 365});
            hideTestnetWarning();
        });
        $.selector_cache("body")
            .on('click', function (e) {
                // Remove button clicked
                if (e.target.className.search('remove-list-item-button') !== -1) {
                    removeItemClick(e.target)
                } else {
                    let $card = getCardFromTarget($(e.target));
                    if ($card !== undefined) {
                        let index = getFileIndexFromId($card.attr('id'));
                        let item = getCurrentListItem(index);
                        if (e.target.className.search('item-select-checkbox') !== -1)
                            item.setSelected(!item.isSelected());
                        else
                            listItemClick(item);
                    }
                }
            })
            .on('mouseenter', '.item-card', function (e) {
                let $card = getCardFromTarget($(e.target));
                if ($card !== undefined)
                    $card.addClass('file-hover')
            })
            .on('mouseleave', '.item-card', function (e) {
                let $card = getCardFromTarget($(e.target));
                if ($card !== undefined)
                    $card.removeClass('file-hover')
            });
        // Manage collapse icon
        $.selector_cache(".customCollapse").on('show.bs.collapse', function (e) {
            let parent = $($(e.target).attr('data-parent'));
            if (parent !== undefined) {
                let icon = parent.find('.collapseIcon');
                icon.fadeOut('fast', function () {
                    icon.fadeIn('fast');
                    icon.attr('class', 'collapseIcon fas fa-angle-up');
                });
            }
        }).on('hide.bs.collapse', function (e) {
            let parent = $($(e.target).attr('data-parent'));
            if (parent !== undefined) {
                let icon = parent.find('.collapseIcon');
                icon.fadeOut('fast', function () {
                    icon.fadeIn('fast');
                    icon.attr('class', 'collapseIcon fas fa-angle-down');
                });
            }
        });
        // Manage tab click
        for (let i of Object.keys(TAB_TYPE)) {
            $tabButtons[TAB_TYPE[i]].on('click', function () {
                tabClick(TAB_TYPE[i]);
            });
        }
        $.selector_cache('#kernelConnectionEditButton').on('click', function () {
            _kernelManager.showKernelInput();
        });
        $.selector_cache('#kernelConnectionShareButton').on('click', function () {
            let baseUrl = 'https://ulcdocuments.blockchain-elite.fr/ulcdoc_interactor.html#mode:check&kernel:';
            copyToClipboard(baseUrl + _kernelManager.getCurrentAddress());
            sendNotification(TypeInfo.Good, 'Link Copied', 'The link to this page has been copied in your clipboard.')
        });

        $.selector_cache('#actionButtonsMobileToggle').on('click', function () {
            if ($.selector_cache('#buttonsCardContainer').hasClass('shown')) {
                hideMobileActionButtonsContainer();
            } else {
                showMobileActionButtonsContainer();
            }
        });

        $.selector_cache('#advancedOptionsButton').on('click', function () {
            $.confirm({
                title: 'Are you sure?',
                content: 'These options are for advanced users only.<br>Continue at your own risk.',
                theme: JQUERY_CONFIRM_THEME,
                type: 'orange',
                icon: 'fas fa-exclamation-triangle',
                escapeKey: 'cancel',
                columnClass: 'medium',
                typeAnimated: true,
                buttons: {
                    confirm: {
                        keys: ['enter'],
                        btnClass: 'btn-orange',
                        action: function () {
                            _moderatorManager.showModeratorInput();
                        }
                    },
                    cancel: function () {
                        // Close
                    },
                }
            });
        });
    };

    let showMobileActionButtonsContainer = function () {
        $.selector_cache('#buttonsCardContainer').addClass('shown');
    };

    let hideMobileActionButtonsContainer = function () {
        $.selector_cache('#buttonsCardContainer').removeClass('shown');
    };


    /**
     * Show the content of the tab based on its type
     *
     * @param type {TAB_TYPE} The type of the tab clicked
     */
    let tabClick = function (type) {
        clearSelectedItems();
        for (let i of Object.keys(TAB_TYPE)) {
            if (TAB_TYPE[i] !== type) {
                $tabButtons[TAB_TYPE[i]].removeClass('active');
                $tabHolders[TAB_TYPE[i]].hide();
            } else {
                $tabButtons[TAB_TYPE[i]].addClass('active');
                $tabHolders[TAB_TYPE[i]].show();
                _currentTab = TAB_TYPE[i];
            }
        }

        if (type !== TAB_TYPE.file) {
            $.selector_cache('#importButtonHolder').hide();
            $.selector_cache('#addItemButton').show();
        } else {
            $.selector_cache('#addItemButton').hide();
            $.selector_cache('#importButtonHolder').show();
        }
        UI.resetProgress();
        UI.updateCheckButtonState();
    };

    /**
     * Callback when clicking delete on a file list item.
     * Remove the file corresponding to the delete button clicked.
     *
     * @param elem The DOM element which was clicked on
     */
    let removeItemClick = function (elem) {
        getCurrentListItem(getFileIndexFromId(elem.id)).removeEntryAnimation();
    };

    /**
     * Start the action (check or fetch) based on the selected tab
     *
     */
    let checkStart = function () {
        UI.resetProgress(); // reset progress
        showMobileActionButtonsContainer();
        resetElementsFromList(getCurrentList());
        if (_currentTab !== TAB_TYPE.file)
            cleanList(); // remove invalid test/hash entries before checking
        if (!isCurrentItemListEmpty()) {
            for (let item of getCurrentList().values()) {
                if (_currentTab !== TAB_TYPE.hash) // We do not compute the hash if the user entered it
                    item.setType(TypeElement.Computing);
                else
                    item.setType(TypeElement.Loading);
            }
            if (_currentAppMode === APP_MODE.check) {
                UI.setUIElementsState(UI_STATE.checking);
                log('Checking started...');
            } else {
                UI.setUIElementsState(UI_STATE.fetching);
                log('Fetching started...');
            }

            _itemsProcessedCounter = 0;
            checkNextItem();
        } else {
            log('No files to check', TypeInfo.Warning);
            sendNotification(TypeInfo.Critical, 'Aborted', 'Nothing to do...');
        }
    };

    /**
     * Removes empty text/hash items from the list
     */
    let cleanList = function () {
        for (let item of getCurrentList().values()) {
            switch (_currentTab) {
                case TAB_TYPE.text:
                    if (item.getText().length === 0)
                        UI.removeItemFromList(item.getIndex());
                    break;
                case TAB_TYPE.hash:
                    if (item.getHash().length === 0)
                        UI.removeItemFromList(item.getIndex());
            }
        }
    };

    /**
     * Lock/Unlock connection related buttons
     *
     * @param state {Boolean} To enable or disable the buttons
     */
    this.setConnectionButtonLockedState = function (state) {
        $.selector_cache('#advancedOptionsButton').attr('disabled', state);
        $.selector_cache('#kernelConnectionEditButton').attr('disabled', state);
    };

    /**
     * Lock/Unlock UI components interaction while checking/signing
     *
     * @param state {UI_STATE} How should we lock the UI ?
     */
    this.setUIElementsState = function (state) {
        log('Setting ui working mode to: ' + UI_STATE[state]);
        // Common locked elements
        let isWorking = state !== UI_STATE.none;
        setUITabsState(isWorking);
        // Lock connection change
        UI.setConnectionButtonLockedState(isWorking);
        setActionButtonIcon(state);

        // Lock item management
        let canManageItems = state === UI_STATE.none || state === UI_STATE.fetched;
        _canUseDropZone = canManageItems;
        $.selector_cache('#importButton').attr('disabled', !canManageItems);
        $.selector_cache('#importButtonHolder').attr('disabled', !canManageItems);
        $.selector_cache('#clearItemListButton').attr('disabled', !canManageItems);
        $.selector_cache('#addItemButton').attr('disabled', !canManageItems);
        $.selector_cache('#addItemButton').attr('disabled', !canManageItems);
        $.selector_cache('#itemTextInput').attr('disabled', !canManageItems);
        $.selector_cache('#itemHashInput').attr('disabled', !canManageItems);
        for (let item of getCurrentList().values()) {
            item.setItemLocked(!canManageItems);
        }
        if (state !== UI_STATE.none)
            $.selector_cache('#checkButton').attr('disabled', true);
        else
            UI.updateCheckButtonState();
        if (state !== UI_STATE.fetched) {
            $.selector_cache('.sign-next-step-logo').css('color', '#E9ECEF');
            $('.multi-selection').hide();
        } else {
            $.selector_cache('.sign-next-step-logo').css('color', '#17A2B8');
            $('.multi-selection').show();
        }


        $.selector_cache('#signButton').attr('disabled', state !== UI_STATE.fetched);
        $.selector_cache('#cancelButton').attr('disabled', state !== UI_STATE.fetched);

        // Show/hide loading screen
        if (state === UI_STATE.checking || state === UI_STATE.fetching) {
            $.selector_cache('#actionLoadingScreen').show();
            $.selector_cache('#addItemButton').attr('disabled', true);
        } else if ($.selector_cache('#actionLoadingScreen').css('display') !== 'none')
            $.selector_cache('#actionLoadingScreen').fadeOut(200);

        _currentUiState = state;
        updateDisplayedItemInfo();
    };

    /**
     * Set the action Button icon based on the given UI state
     * @param state {UI_STATE} The UI state used to decide the icon
     */
    let setActionButtonIcon = function (state) {
        switch (state) {
            case UI_STATE.checking:
                $.selector_cache('#checkButtonLogo').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
                break;
            case UI_STATE.fetching:
                $.selector_cache('#checkButtonLogo').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
                break;
            case UI_STATE.fetched:
                $.selector_cache('#checkButtonLogo').attr('class', 'fas fa-check');
                break;
            case UI_STATE.signing:
                $.selector_cache('#signButtonLogo').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
                break;
            case UI_STATE.none:
                if (_currentAppMode === APP_MODE.sign) {
                    $.selector_cache('#checkButtonLogo').attr('class', 'fas fa-sync-alt');
                    $.selector_cache('#signButtonLogo').attr('class', 'far fa-edit');
                } else {
                    $.selector_cache('#checkButtonLogo').attr('class', 'far fa-check-square');
                }
                break;
        }
    };

    let setUITabsState = function (disabled) {
        for (let key of Object.keys(APP_MODE)) {
            $modeButtons[APP_MODE[key]].attr('disabled', disabled);
        }
        for (let i in TAB_TYPE) {
            $tabButtons[TAB_TYPE[i]].attr('disabled', disabled)
        }
    };

    /**
     * Set the file list item selected.
     *
     * @param currentItem {ListItem|FileListItem|TextListItem|HashListItem} The item clicked
     */
    let listItemClick = function (currentItem) {
        if (_selectedItems.length === 0) { // Are we multiselecting ?
            clearSelectedItems();
            _itemDetailsManager.displayFileProps(currentItem);
        }
        currentItem.setSelected(!currentItem.isSelected());
    };

    let clearSelectedItems = function () {
        for (let item of getCurrentList().values()) {
            item.setSelected(false);
        }
    };

    /**
     * Create a file list entry for all files in the given list.
     *
     * @param fileList {FileList} The list of files to add
     */
    let importFiles = function (fileList) {
        _filesOverLimitArray = [];
        for (let i = 0; i < fileList.length; i++) {
            createFileListEntry(fileList[i]);
        }
        if (_filesOverLimitArray.length > 0)
            displayFilesOverLimitError();
    };

    /**
     * Display an error message showing which files were too large to be imported.
     */
    let displayFilesOverLimitError = function () {
        let message = 'The following files were larger than <strong>150MB</strong> and could not be imported:' +
            '<ul></ul>';
        for (let i = 0; i < _filesOverLimitArray.length; i++) {
            message += '<li id="invalidSizeItem' + i + '"></li>';
        }
        message += '<br>Please make sure your files are smaller than <strong>150MB</strong> before importing them.';
        $.alert({
            title: 'Some files could not be imported',
            content: message,
            type: 'red',
            theme: JQUERY_CONFIRM_THEME,
            escapeKey: 'ok',
            icon: 'fas fa-exclamation-circle',
            columnClass: 'medium',
            typeAnimated: true,
            buttons: {
                ok: {
                    keys: ['enter']
                }
            },
            onContentReady: function () {
                // when content is fetched & rendered in DOM
                // fill in the name of the files (prevent XSS attacks on file name)
                for (let i = 0; i < _filesOverLimitArray.length; i++) {
                    this.$content.find('#invalidSizeItem' + i).text(_filesOverLimitArray[i]);
                }

            },
        });
    };

    /**
     * Check if the given file is valid.
     * For a file to be valid, its size must be smaller than 150MB, and be a valid File Object reference.
     *
     * @param file {File} The file object to check
     * @return {Boolean} Whether the file is valid or not.
     */
    let isFileValid = function (file) {
        let valid = true;
        if (file !== undefined) {
            if (file.size > MAX_FILE_SIZE) {
                _filesOverLimitArray.push(file.name);
                log("file is larger than 150MB: " + file.name, TypeInfo.Critical);
                valid = false;
            }
        } else {
            $.alert({
                title: 'File could not be imported',
                content: 'An unknown error prevented a file from being imported.<br>' +
                    'Please make sure your files are not corrupted.',
                type: 'red',
                theme: 'modern',
                escapeKey: 'ok',
                icon: 'fas fa-exclamation-circle',
                columnClass: 'medium',
                typeAnimated: true,
                buttons: {
                    ok: {
                        keys: ['enter']
                    }
                }
            });
            log("file could not be imported. Unknown error.", TypeInfo.Critical);
            valid = false;
        }
        return valid;
    };

    /**
     * If the given file is valid, create a file item list entry.
     *
     * @param file {File} The DOM element which was clicked on
     */
    let createFileListEntry = function (file) {
        if (isFileValid(file)) {
            // Check if file or directory
            let reader = new FileReader();
            reader.onload = function () { // read the file to check if valid
                if (getList(_currentAppMode, TAB_TYPE.file).size === 0) {
                    $tabHolders[TAB_TYPE.file].html(""); // init drop zone
                }
                let item = new FileListItem(_uniqueIdCounter, file, _currentAppMode);
                item.createEntry(true);
                getList(_currentAppMode, TAB_TYPE.file).set(_uniqueIdCounter, item);
                UI.updateCheckButtonState();
                UI.setUIElementsState(UI_STATE.none);
                UI.resetProgress();
                _uniqueIdCounter += 1;
            };
            reader.onerror = function () { // file is invalid
                sendNotification(TypeInfo.Critical, "Error", "Could not read file '" + file.name + "'");
                log("Could not read file '" + file.name + "'", TypeInfo.Critical);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Create a text or hash list entry based on the current tab
     */
    let createItemEntry = function () {
        let item;
        if (isCurrentItemListEmpty()) {
            $tabHolders[_currentTab].html(""); // init zone
        }
        if (_currentTab === TAB_TYPE.text)
            item = new TextListItem(_uniqueIdCounter, _currentAppMode);
        else
            item = new HashListItem(_uniqueIdCounter, _currentAppMode);
        item.createEntry(true);
        getCurrentList().set(_uniqueIdCounter, item);
        _uniqueIdCounter += 1;
        UI.updateCheckButtonState();
        UI.setUIElementsState(UI_STATE.none);
        UI.resetProgress();
        updateDisplayIds(_currentTab);

        listItemClick(item);
    };

    /**
     * Update the numbers on text and hash items based on their order in the list
     *
     * @param type {TAB_TYPE} The tab (text or hash) to update
     */
    let updateDisplayIds = function (type) {
        if (type !== TAB_TYPE.file) { // Do not fix the ids for the file tab
            let i = 1;
            for (let item of getList(_currentAppMode, type).values()) {
                item.setTitle(i);
                i++;
            }
        }
    };

    /**
     * Reset the zone inside the given tab.
     *
     * @param type {TAB_TYPE} The tab to reset
     */
    let resetTabZone = function (type) {
        $tabHolders[type].html("");
        $tabListEmptyTemplate[type].contents().clone()
            .appendTo($tabHolders[type])
            .on('click', function () {
                if (_currentTab === TAB_TYPE.file)
                    $.selector_cache('#importButton').trigger('click');
                else
                    createItemEntry();
            });
    };

    /**
     * Send the next file in the list to the backend to be checked and update the progress bar.
     */
    let checkNextItem = function () {
        if (_itemsProcessedCounter < getCurrentList().size) {
            log('Checking next item', TypeInfo.Info);
            updateProgress(_itemsProcessedCounter, false);
            let currentItem = getCurrentListItemByIndex(_itemsProcessedCounter);
            customCheckItem(currentItem, (hash) => {
                updateElementHash(currentItem, hash);
                if (_currentAppMode === APP_MODE.check)
                    customFetchItem(currentItem);
            });
            if (_currentAppMode === APP_MODE.check)
                $.selector_cache('#actionInProgress').html('Checking...');
            else
                $.selector_cache('#actionInProgress').html('Fetching information...');

        } else if (_currentAppMode === APP_MODE.check) // If we finished checking
            endCheck();
        else  // if we finished fetching
            trySign();
    };

    /**
     *
     * @param currentItem {ListItem|TextListItem|FileListItem|HashListItem}
     * @param onHashAvailable {Function}
     */
    let customCheckItem = function (currentItem, onHashAvailable) {
        // Do not calculate the hash if we already have it
        if (currentItem instanceof HashListItem || currentItem.getHash() !== '') {
            currentItem.setType(TypeElement.Loading);
            checkHash(currentItem.getHash())
                .then((docData) => {
                    updateElementInfo(currentItem, docData)
                })
                .catch((err) => {
                    console.log(err);
                    updateElementInfo(currentItem, undefined);
                });
        } else if (currentItem instanceof FileListItem) {
            checkFile(currentItem.getFile(), onHashAvailable)
                .then((docData) => {
                    updateElementInfo(currentItem, docData)
                })
                .catch((err) => {
                    console.log(err);
                    updateElementInfo(currentItem, undefined);
                });
        } else {
            checkText(currentItem.getText(), onHashAvailable)
                .then((docData) => {
                    updateElementInfo(currentItem, docData)
                })
                .catch((err) => {
                    console.log(err);
                    updateElementInfo(currentItem, undefined);
                });
        }
    };

    let customFetchItem = function (currentItem) {
        fetchHash(currentItem.getHash())
            .then((signStatus) => {
                console.log(signStatus);
            })
            .catch((err) => {
                console.log(err);
                updateElementInfo(currentItem, undefined);
            });
    };

    /**
     * Re-enable the UI and display notifications
     */
    let endCheck = function () {
        log('Finished checking all the items', TypeInfo.Info);
        updateProgress(0, true);
        UI.setUIElementsState(UI_STATE.none);
    };

    /**
     * Check if we can start the signing procedure
     */
    let trySign = function () {
        updateProgress(0, true);
        deleteDuplicateFromList(getCurrentList());
        let invalidElements = getInvalidElements();
        if (invalidElements.length)
            displayInvalidElementsError(invalidElements);
        else
            UI.setUIElementsState(UI_STATE.fetched);
    };

    let updateDisplayedItemInfo = function () {
        for (let i of getCurrentList().values()) {
            if (i.isSelected())
                _itemDetailsManager.setupItemPopup(i);
        }
    };

    /**
     * Display an error message showing the invalid elements that cannot be signed.
     *
     * @param invalidElements {Array} An array containing the invalid elements
     */
    let displayInvalidElementsError = function (invalidElements) {
        let message = 'Finished fetching information with some errors.<br>The following items cannot be signed:<ul></ul>';
        for (let i = 0; i < invalidElements.length; i++) {
            message += '<li id="invalidItem' + i + '"></li>';
        }
        message += '<br>Click on <strong>CONTINUE</strong> to remove the items above, you will then be able to select ' +
            'items in the list to fill in  signing information.' +
            '<br>Click on <strong>CANCEL</strong> to abort signing and see why these are invalid.';
        $.confirm({
            title: 'Fetch Finished',
            content: message,
            type: 'blue',
            theme: JQUERY_CONFIRM_THEME,
            escapeKey: 'cancel',
            icon: 'fas fa-exclamation',
            columnClass: 'medium',
            typeAnimated: true,
            buttons: {
                continue: {
                    keys: ['enter'],
                    btnClass: 'btn-blue',
                    action: function () {
                        removeInvalidElements(invalidElements);
                        if (getCurrentList().size) {
                            sendNotification(TypeInfo.Good, 'Ready to sign', 'Removed invalid elements. ' +
                                'You can now start signing.');
                            UI.setUIElementsState(UI_STATE.fetched);
                        } else {
                            sendNotification(TypeInfo.Critical, 'Error', 'No valid document to sign');
                            UI.setUIElementsState(UI_STATE.none);
                        }
                    }
                },
                cancel: function () {
                    UI.setUIElementsState(UI_STATE.none);
                },
            },
            onContentReady: function () {
                // when content is fetched & rendered in DOM
                // fill in the name of the files (prevent XSS attacks on file name)
                for (let i = 0; i < invalidElements.length; i++) {
                    if (_currentTab === TAB_TYPE.file) // Display the file name if we are in the file tab, or the item title
                        this.$content.find('#invalidItem' + i).text(getCurrentListItem(invalidElements[i]).getFile().name);
                    else
                        this.$content.find('#invalidItem' + i).text(getCurrentListItem(invalidElements[i]).getTitle());
                }

            },
        });
    };

    /**
     * Get elements that cannot be signed in the list
     *
     * @return {Array} The array of indexes of invalid items
     */
    let getInvalidElements = function () {
        let elements = [];
        for (let item of getCurrentList().values()) {
            if (item.getType() !== TypeElement.Fake) {
                elements.push(item.getIndex());
            }
        }
        return elements;
    };

    /**
     * Reset element state and information from the given list
     *
     * @param list {Map} the map containing the items to reset
     */
    let resetElementsFromList = function (list) {
        for (let item of list.values()) {
            item.reset();
        }
    };

    /**
     * Reset elements from every list
     */
    let resetAllElements = function () {
        for (let mode of Object.keys(APP_MODE)) {
            for (let tab of Object.keys(TAB_TYPE)) {
                resetElementsFromList(getList(APP_MODE[mode], TAB_TYPE[tab]));
            }
        }
        UI.resetProgress();
    };

    /**
     * Remove invalid elements from the list before signing
     *
     * @param elements {Array} The array of indexes of invalid items
     */
    let removeInvalidElements = function (elements) {
        for (let i of elements) {
            UI.removeItemFromList(i);
        }
    };

    /**
     * Ask the user to start the signing procedure
     */
    let startSign = function () {
        $.confirm({
            title: 'Are you sure?',
            content: 'Signing is permanent, make sure you are signing the right documents.<br>Do you want to continue?',
            theme: JQUERY_CONFIRM_THEME,
            type: 'blue',
            icon: 'fas fa-exclamation',
            escapeKey: 'cancel',
            columnClass: 'medium',
            typeAnimated: true,
            buttons: {
                confirm: {
                    keys: ['enter'],
                    btnClass: 'btn-blue',
                    action: function () {
                        UI.setUIElementsState(UI_STATE.signing);
                        _elementsToSign = getCurrentList().size;
                        _elementSigned = 0;
                        $.selector_cache('#actionInProgress').html('Signing...');
                        log('Signing...', TypeInfo.Info);
                        let items = [];
                        let indexes = [];
                        for (_itemsProcessedCounter = 0; _itemsProcessedCounter < getCurrentList().size; _itemsProcessedCounter++) {
                            updateProgress(_itemsProcessedCounter, false);
                            let currentItem = getCurrentListItemByIndex(_itemsProcessedCounter);
                            currentItem.getDocumentData().extra_data = customExtraToMap(currentItem.getCustomExtraData());
                            items.push(currentItem.getDocumentData());
                            indexes.push(currentItem.getIndex());
                        }
                        updateProgress(_itemsProcessedCounter, true);
                        signDocuments(items, indexes, _isOptimizerEnabled,
                            (id, url) => updateTransactionTx(id, url),
                            (id) => updateTransactionState(id, true),
                            (id) => updateTransactionState(id, false));
                        endSign();
                    }
                },
                cancel: function () {
                    UI.setUIElementsState(UI_STATE.fetched);
                },
            }
        });
    };

    /**
     * Re-enable the UI and display notifications
     */
    let endSign = function () {
        log('Finished sending signing transactions documents', TypeInfo.Info);
        sendNotification(TypeInfo.Good, 'Signing Finished', 'Finished sending signing transactions.' +
            ' Awaiting blockchain response...');
        updateProgress(0, true);
    };

    /**
     * Update the progress bar based on the number of files already checked.
     *
     * @param progress {Number} the number number of files that have already been checked.
     * @param isFinished {Boolean} Whether the checking process is finished
     */
    let updateProgress = function (progress, isFinished = false) {
        if (isFinished) { // Finished
            $.selector_cache('#fileInProgress').html('');
            $.selector_cache('#actionInProgress').html('Finished');
            $.selector_cache('#actionProgressBar').css("width", "100%");
            $.selector_cache('#actionProgressBar').attr("aria-valuenow", "100");
            $.selector_cache('#actionProgressBar').html('100%');
            $.selector_cache('#actionProgressBar').removeClass('progress-bar-animated');
        } else if (progress === -1) { // Not started
            $.selector_cache('#fileInProgress').html('');
            $.selector_cache('#actionInProgress').html('Not started');
            $.selector_cache('#actionProgressBar').css("width", "0");
            $.selector_cache('#actionProgressBar').attr("aria-valuenow", "0");
            $.selector_cache('#actionProgressBar').html('');
        } else { // In progress
            let currentItem = getCurrentListItemByIndex(progress);
            switch (_currentTab) {
                case TAB_TYPE.file:
                    $.selector_cache('#fileInProgress').text(currentItem.getFile().name);
                    break;
                case TAB_TYPE.text:
                    $.selector_cache('#fileInProgress').text(currentItem.getTitle());
                    break;
                case TAB_TYPE.hash:
                    $.selector_cache('#fileInProgress').text(currentItem.getTitle());
                    break;
            }
            let percent = 100 * progress / getCurrentList().size;
            $.selector_cache('#actionProgressBar').css("width", percent + "%");
            $.selector_cache('#actionProgressBar').attr("aria-valuenow", percent);
            $.selector_cache('#actionProgressBar').html(Math.round(percent) + '%');
            $.selector_cache('#actionProgressBar').addClass('progress-bar-animated');
        }
    };

    this.resetProgress = function () {
        updateProgress(-1, false);
    };

    /**
     * Update the main UI components visibility under check and sign tabs,
     * based on current tab, wallet state and kernel ownership
     */
    this.updateMainUIState = function () {
        if (!_kernelManager.isConnected()) {
            $.selector_cache('#mainUIContainer').hide();
            $.selector_cache('#accountsCard').hide();
            $.selector_cache('#loadingAccountsMessage').hide();
            setMainUIError(false, "", "", undefined, false);
        } else if (_currentAppMode === APP_MODE.check) { // In check mode
            $.selector_cache('#mainUIContainer').show();
            $.selector_cache('#accountsCard').hide();
            $.selector_cache('#loadingAccountsMessage').hide();
            setMainUIError(false, "", "", undefined, false);
        } else if (_currentWalletState !== WALLET_STATE.injected) { // In sign mode without injected wallet
            $.selector_cache('#mainUIContainer').hide();
            $.selector_cache('#accountsCard').hide();
            $.selector_cache('#loadingAccountsMessage').hide();
            setMainUIError(true, "Wallet not injected",
                "Please make sure you have metamask installed.", COLOR_CLASSES.warning, true);
        } else if (_isLoadingAccounts) {
            $.selector_cache('#mainUIContainer').hide();
            $.selector_cache('#accountsCard').show();
            $.selector_cache('#loadingAccountsMessage').show();
            setMainUIError(false, '', '', undefined, false);
        } else if (!_isAccountOperator) { // In sign mode with an injected wallet but not kernel operator
            $.selector_cache('#mainUIContainer').hide();
            $.selector_cache('#accountsCard').show();
            $.selector_cache('#loadingAccountsMessage').hide();
            setMainUIError(true, 'Not operator',
                'You are not an operator on this kernel. You must be an operator to sign documents.', COLOR_CLASSES.danger, false);
        } else { // In sign mode with injected wallet and kernel operator
            $.selector_cache('#mainUIContainer').show();
            $.selector_cache('#accountsCard').show();
            $.selector_cache('#loadingAccountsMessage').hide();
            setMainUIError(false, '', '', undefined, false);
        }
    };

    /**
     * Display an error jumbotron to warn the user about an error.
     *
     * @param state {Boolean} Should we display the error ?
     * @param title {String} The error title
     * @param message {String} The error text
     * @param color {COLOR_CLASSES} The color of the error
     * @param showMetamask {Boolean} Should we display the metamask download link ?
     */
    let setMainUIError = function (state, title, message, color, showMetamask) {
        if (state) {
            $.selector_cache('#signErrorText').html(message);
            $.selector_cache('#signErrorTitle').html(title);
            $.selector_cache('#signErrorJumbotron').show();
            setDOMColor($.selector_cache('#signErrorJumbotron'), color);
        } else {
            $.selector_cache('#signErrorJumbotron').hide();
        }
        if (showMetamask)
            $.selector_cache('#signErrorMetamask').show();
        else
            $.selector_cache('#signErrorMetamask').hide();
    };

    /* *********************************************************
     *                      UI UTILITY
     * *********************************************************/

    /**
     * Create a log message using the logMe utility function
     *
     * @param message The message to display
     * @param type The message type (error, warning or normal)
     */
    let log = function (message, type) {
        logMe(UIManagerPrefix, message, type);
    };

    /**
     * Enables or disabled the check button.
     *
     */
    this.updateCheckButtonState = function () {
        let disabled = false;
        if (_currentAppMode === APP_MODE.check)
            disabled = !UI.canCheck();
        else
            disabled = !UI.canSign();
        $.selector_cache('#checkButton').attr('disabled', disabled);
    };

    /**
     * Get the current list based on the current tab
     *
     * @return {Map} The map representing the list
     */
    let getCurrentList = function () {
        return _itemList.get(_currentAppMode).get(_currentTab);
    };

    /**
     * Get the list for the specified app mode and tab
     *
     * @param appType {APP_MODE} The app type to select
     * @param tabType {TAB_TYPE} The tab type to use
     * @return {Map} The map representing the list
     */
    let getList = function (appType, tabType) {
        return _itemList.get(appType).get(tabType)
    };

    /**
     * Get an item in the current list, by giving its id
     *
     * @param id {Number} This item's index
     * @return {ListItem} The list item object
     */
    let getCurrentListItem = function (id) {
        return getCurrentList().get(id);
    };

    /**
     * Check if the list of the current tab is empty
     *
     * @return {boolean} Is the list empty ?
     */
    let isCurrentItemListEmpty = function () {
        return getCurrentList().size === 0;
    };

    /**
     * Get the item at the specified index in the current list, based on the current tab
     *
     * @param index {number} the index the item should be at
     * @return {ListItem/undefined} The lis item object or undefined if there is no item at the given index
     */
    let getCurrentListItemByIndex = function (index) {
        let iterator = getCurrentList().values();
        let item = iterator.next().value;
        let i = 0;
        while (item !== undefined && i !== index) {
            item = iterator.next().value;
            i++;
        }
        return i === index ? item : undefined;
    };

    /**
     * Keep only one item of the same hash in the list
     *
     * @param list {Map} The list to search items in
     */
    let deleteDuplicateFromList = function (list) {
        for (let item1 of list.values()) {
            for (let item2 of list.values()) {
                if (item1 !== item2 && item1.getHash() === item2.getHash())
                    UI.removeItemFromList(item2.getIndex());
            }
        }
    };

    let setupDOMDimensions = function () {
        if ($(window).width() < 991) {
            let height = $(window).height() - 200; // Header + action buttons
            $.selector_cache("#mainCard").css('min-height', height);
        } else {
            let height = $(window).height() - 200; // Header + action buttons
            $.selector_cache("#mainCard").css('height', height);
        }
    };

    /* *********************************************************
     *                       PUBLIC FUNCTIONS
     * *********************************************************/

    this.addItemToSelected = function (item) {
        _selectedItems.push(item);
        $.selector_cache('#editItemButton').attr('disabled', false);
        $.selector_cache('#selectAllButton').prop('checked', _selectedItems.length === getCurrentList().size);
    };

    this.removeItemFromSelected = function (item) {
        if (_selectedItems.indexOf(item) !== -1)
            _selectedItems.splice(_selectedItems.indexOf(item), 1);
        $.selector_cache('#editItemButton').attr('disabled', _selectedItems.length === 0);
        $.selector_cache('#selectAllButton').prop('checked', false);
    };

    this.getKernelManager = function () {
        return _kernelManager;
    };

    this.getItemDetailsManager = function () {
        return _itemDetailsManager;
    };

    /**
     * Set the app verbose mode.
     * Display a message indicating its state not matter the verbose mode.
     *
     * @param enabled {Boolean} Whether to enable the verbose mode or not.
     */
    this.setVerbose = function (enabled) {
        _isVerbose = true; // enable verbose to display the state
        log('Verbose set to: ' + enabled, TypeInfo.Info);
        _isVerbose = enabled; // set the value to the one desired
    };

    /**
     * Get the current verbose mode.
     *
     * @return {boolean}
     */
    this.getVerbose = function () {
        return _isVerbose;
    };

    /**
     * Get the mode this app is currently in
     *
     * @return {APP_MODE} the current app mode
     */
    this.getCurrentAppMode = function () {
        return _currentAppMode;
    };

    this.getCurrentTab = function () {
        return _currentTab;
    };

    this.getCurrentUIState = function () {
        return _currentUiState;
    };

    /**
     * Get if the current account is able to sign documents
     *
     * @return {boolean}
     */
    this.isAccountOperator = function () {
        return _isAccountOperator;
    };

    this.isOptimizerEnabled = function () {
        return _isOptimizerEnabled;
    };

    this.setOptimizerEnabled = function (val) {
        _isOptimizerEnabled = val;
    };

    /**
     * Check if all conditions are met to start file checking.
     * To be able to check, the item list must not be empty, and the user must be connected to a kernel.
     *
     * @return {boolean} Can we start the checking procedure ?
     */
    this.canCheck = function () {
        return _kernelManager.isConnected() && getCurrentList().size;
    };

    /**
     * check if all conditions are met to start signing
     *
     * @return {boolean} Can we start the signing procedure ?
     */
    this.canSign = function () {
        return _kernelManager.isConnected() && _currentWalletState === WALLET_STATE.injected && getCurrentList().size;
    };

    this.getCurrentTabHolder = function () {
        return $tabHolders[_currentTab];
    };

    /**
     * Removes the file associated to the index from the list.
     * If we are removing the last file, display the empty file list template.
     *
     * @param index {Number} The file unique index.
     */
    this.removeItemFromList = function (index) {
        $("#" + getCurrentListItem(index).getId()).remove();
        getCurrentList().delete(index);
        if (isCurrentItemListEmpty()) {
            UI.resetProgress();
            resetTabZone(_currentTab);
            UI.updateCheckButtonState();
            UI.setUIElementsState(UI_STATE.none);
        }
        updateDisplayIds(_currentTab);
    };

    /**
     * Initialize the UI with default value.
     */
    this.initUI = function () {
        this.setVerbose(true);
        log('Successfully Loaded');
        _kernelManager = new UIKernelManager();
        _moderatorManager = new UIModeratorManager();
        _itemDetailsManager = new UIItemDetailsManager();
        setAppVersion();
        setDefaultFieldValues();
        detectAppMode();
        UI.setUIMode(_currentAppMode, true);
        setupDOMDimensions();
        UI.updateCheckButtonState();
        UI.setUIElementsState(UI_STATE.none);
        updateKernelConnectionBox(KERNEL_CONNECTION_TYPE.notConnected);
        updateModeratorConnection(undefined);
        for (let i of Object.keys(TAB_TYPE)) {
            resetTabZone(TAB_TYPE[i]);
        }
        $('[data-toggle="tooltip"]').tooltip(); // enable Popper.js tooltips
        registerEvents();
        UI.resetProgress();
        updateAccounts(undefined);
        _canUseDropZone = true;
        detectCurrentNetwork();
    };

    let setAppVersion = function () {
        $.selector_cache('#webAppVersion').html(APP_VERSION);
    };

    /* *********************************************************
     *                    MASTER INTERACTIONS
     * *********************************************************/

    /**
     * Set the network type field text based on the connection type.
     * Display additional information using tooltips.
     *
     * @param connectionType {TypeConnection} The type of connection to display.
     */
    let updateNetworkConnectedUI = function (connectionType) {
        // reset badge
        $.selector_cache('#networkTypeField').attr('class', 'badge');
        log('Setting network connected UI', TypeInfo.Info);
        switch (connectionType) {
            case TypeConnection.Mainnet:
                $.selector_cache('#networkTypeField').attr('data-original-title', 'You are connected to a public server');
                $.selector_cache('#networkTypeField').addClass('badge-success');
                _moderatorManager.setDefaultAddress(getDefaultModerator(false));
                break;
            case TypeConnection.Ropsten:
                $.selector_cache('#networkTypeField').attr('data-original-title', 'You are connected to a test server');
                $.selector_cache('#networkTypeField').addClass('badge-warning');
                _moderatorManager.setDefaultAddress(getDefaultModerator(true));
                break;
            default:
                $.selector_cache('#networkTypeField').attr('data-original-title', 'Could not connect');
                $.selector_cache('#networkTypeField').addClass('badge-danger');
                _moderatorManager.setDefaultAddress('');
                break;
        }
        $.selector_cache('#networkTypeField').html(getNetworkName(connectionType));
    };

    /**
     * Set the connection type field text based on the given state.
     * Possible values are injected and infura
     *
     * @param isInjected {Boolean} Whether the wallet is injected or infura.
     */
    let updateWalletStateUI = function (isInjected) {
        // reset badge
        $.selector_cache('#connectionTypeField').attr('class', 'badge');
        log('Setting wallet injected state to: ' + isInjected, TypeInfo.Info);
        if (isInjected) {
            $.selector_cache('#connectionTypeField').html('Wallet Injected');
            $.selector_cache('#connectionTypeField').addClass('badge-success');
            $.selector_cache('#connectionTypeField').attr('data-original-title', 'You are using an injected wallet');
            _currentWalletState = WALLET_STATE.injected;
        } else {
            $.selector_cache('#connectionTypeField').html('Infura');
            $.selector_cache('#connectionTypeField').addClass('badge-success');
            $.selector_cache('#connectionTypeField').attr('data-original-title', 'You are using an infura wallet');
            _currentWalletState = WALLET_STATE.infura;
        }
        UI.updateMainUIState();
        UI.updateCheckButtonState();
    };

    /**
     * Show a dialog to the user asking for connection confirmation
     */
    this.promptKernelConnectionWarnAnswer = function () {
        let status = _kernelManager.getKernelStatus();
        let message = '';
        switch (status) {
            case KERNEL_REFERENCEMENT_STATUS.revoked:
                message = 'The Kernel you are connecting to has been revoked by the moderator.\n' +
                    'This mean the moderator does not recognize the kernel anymore and cannot prove its identity.';
                break;
            case KERNEL_REFERENCEMENT_STATUS.initialized:
                message = 'The Moderator knows the Kernel you are connecting to, but has not yet passed security confirmation.' +
                    'As such, it cannot provide information on its identity.';
                break;
            case KERNEL_REFERENCEMENT_STATUS.notReferenced:
                message = 'The Kernel you are connecting is unknown to the Moderator. It is impossible to prove its identity.';
                break;
        }
        if (message !== '') {
            message += '<br>Are you sure you want to connect?';
            $.confirm({
                title: 'Security information',
                content: message,
                theme: JQUERY_CONFIRM_THEME,
                type: 'orange',
                icon: 'fas fa-exclamation-triangle',
                escapeKey: 'cancel',
                columnClass: 'medium',
                typeAnimated: true,
                buttons: {
                    confirm: {
                        keys: ['enter'],
                        btnClass: 'btn-orange',
                        action: function () {
                            log('Connection insecure');
                            connectToKernel();
                        }
                    },
                    cancel: function () {
                        updateKernelConnectionBox(KERNEL_CONNECTION_TYPE.notConnected);
                    },
                }
            });
        }
    };

    /**
     * Set the kernel connection information.
     *
     * @param connectionType {KERNEL_CONNECTION_TYPE} The connection status
     */
    let updateKernelConnectionBox = function (connectionType) {
        _isAccountsListAvailable = false; // Kernel operators may change
        resetAllElements(); // Element signatures are different from each kernel
        _kernelManager.setKernelConnectionLoading(false);
        switch (connectionType) {
            case KERNEL_CONNECTION_TYPE.connected:
                if (_kernelManager.getKernelStatus() === KERNEL_REFERENCEMENT_STATUS.referenced)
                    $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-check-circle text-success');
                else
                    $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-exclamation-triangle text-warning');
                _kernelManager.setKernelInfoBox(KERNEL_CONNECTION_TYPE.connected);
                if (_currentAppMode === APP_MODE.sign)
                    askForAccounts();
                _kernelManager.setConnected(true);
                break;
            case KERNEL_CONNECTION_TYPE.error:
                $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-times text-danger');
                $.selector_cache('#kernelConnectedAddress').html("Could not connect to '" + _kernelManager.getCurrentAddress() + "'");
                _kernelManager.setKernelInfoBox(KERNEL_CONNECTION_TYPE.error);
                _kernelManager.setConnected(false);
                break;
            case KERNEL_CONNECTION_TYPE.notConnected:
                $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-question');
                $.selector_cache('#kernelConnectedAddress').html("Not Connected");
                _kernelManager.setKernelInfoBox(KERNEL_CONNECTION_TYPE.notConnected);
                _kernelManager.setConnected(false);
                break;
        }
        UI.updateCheckButtonState();
        UI.updateMainUIState();
    };

    /**
     * Set the moderator connection info.
     *
     * @param moderatorInfo {Object} Object containing moderator info.
     */
    let updateModeratorConnection = function (moderatorInfo) {
        log('Updating moderator input UI', TypeInfo.Info);
        _moderatorManager.setConnected(true);
        _moderatorManager.setModeratorConnectionLoading(false);
        updateKernelConnectionBox(KERNEL_CONNECTION_TYPE.notConnected); // Reset the kernel connection
        if (moderatorInfo !== undefined) {
            _moderatorManager.setCurrentAddress(moderatorInfo.address);
            $.selector_cache('#moderatorConnectionInfoIcon').attr('class', 'fas fa-check-circle text-success');
            if (_moderatorManager.isConnectedToDefault()) {
                let modName = _currentNetworkType === TypeConnection.Mainnet ? 'Blockchain Élite ULCDocuments Official' : 'Blockchain Élite ULCDocuments Testnet';
                $.selector_cache('#moderatorConnectedAddress').html("Currently connected to default: " +
                    "<strong id='moderatorName'>" + modName + "</strong>");
            } else
                $.selector_cache('#moderatorConnectedAddress').html("Currently connected to: " +
                    "'<strong id='moderatorAddress'>" + _moderatorManager.getCurrentAddress() + "</strong>'");
            setDOMColor($.selector_cache('#moderatorInfoHeader'), COLOR_CLASSES.success);
            _moderatorManager.setModeratorInfo(moderatorInfo, "");
        } else {
            _kernelManager.setConnected(false);
            $.selector_cache('#moderatorConnectionInfoIcon').attr('class', 'fas fa-times text-danger');
            $.selector_cache('#moderatorConnectedAddress').html("Could not connect to '" + _moderatorManager.getCurrentAddress() + "'");
            setDOMColor($.selector_cache('#moderatorInfoHeader'), COLOR_CLASSES.danger);
            _moderatorManager.setModeratorInfo(undefined, 'Connection could not be established, falling back to default');
        }
        UI.updateCheckButtonState();
    };

    /**
     * Update the element associated to index.
     *
     * @param currentItem {ListItem|FileListItem|TextListItem|HashListItem} The item to update
     * @param docData {DocumentData}
     */
    let updateElementInfo = function (currentItem, docData) {
        let elementType = TypeElement.Unknown;
        if (docData !== undefined && docData !== {}) {
            elementType = docData.signed ? TypeElement.Signed : TypeElement.Fake;
            currentItem.setDocumentData(docData);
        } else {
            log('Error occured.');
            currentItem.setDocumentData({});
            elementType = TypeElement.Invalid;
        }
        _itemsProcessedCounter += 1;
        currentItem.setType(elementType);
        checkNextItem();
    };

    /**
     * Update the hash of the element associated to index.
     *
     * @param currentItem {ListItem|FileListItem|TextListItem|HashListItem} The item to update
     * @param hash {string}
     */
    let updateElementHash = function (currentItem, hash) {
        currentItem.setType(TypeElement.Loading); // We have the hash, we can start asking blockchain
        currentItem.setHash(hash);
    };

    /**
     * Updates the account list with the specified Map.
     * This map must be of format {string : boolean}, with string being the accounts address
     * and boolean whether the account owns the current kernel
     * The first element in the map is considered the current account.
     *
     * @param accountsMap {Map} The accounts list
     */
    let updateAccounts = function (accountsMap) {
        $.selector_cache('#accountsListBody').fadeOut('fast', function () {
            if (accountsMap !== undefined && accountsMap.size !== 0) {
                let isFirstElem = true;
                $.selector_cache('#accountsListEmptyZone').hide();
                $.selector_cache('#accountsListZone').show();
                for (let [key, value] of accountsMap) {
                    let rowClass = "alert-danger";
                    let rowOwnership = "Not Operator";
                    if (value) {
                        rowClass = "alert-success";
                        rowOwnership = "Operator";
                    }
                    if (isFirstElem) { // This is the current account
                        $.selector_cache('#accountState').text(rowOwnership);
                        $.selector_cache('#accountListHeader').attr('class', 'card-header ' + rowClass);
                        if (value) { // This account is an operator
                            $.selector_cache('#collapseAccounts').collapse('hide');
                            _isAccountOperator = true;
                        } else {
                            $.selector_cache('#collapseAccounts').collapse('show');
                            _isAccountOperator = false;
                        }
                        $.selector_cache('#accountsTable').html( // Reset the zone
                            '<tr>' +
                            '<th scope="row">Account Address</th>' +
                            '<th>Status</th>' +
                            '</tr>');
                        $.selector_cache("#accountsTable").append(
                            "<tr class='" + rowClass + "'>\n" +
                            "<td>" + key + " (Current Account)" + "</td>\n" +
                            "<td>" + rowOwnership + "</td>\n" +
                            "</tr>");
                        isFirstElem = false;
                    } else { // Other accounts
                        $.selector_cache("#accountsTable").append(
                            "<tr class='" + rowClass + "'>\n" +
                            "<td>" + key + "</td>\n" +
                            "<td>" + rowOwnership + "</td>\n" +
                            "</tr>");
                    }
                }
                _isAccountsListAvailable = true;
            } else {
                log("Accounts list invalid", TypeInfo.Warning);
                $.selector_cache('#accountsListEmptyZone').show();
                $.selector_cache('#accountsListBody').hide();
                $.selector_cache('#accountState').html("None");
                setDOMColor($.selector_cache('#accountListHeader'), COLOR_CLASSES.secondary);
                _isAccountOperator = false;
            }
            _isLoadingAccounts = false;
            _kernelManager.updateKernelButtonsState();
            UI.updateMainUIState();
            $.selector_cache('#accountsListBody').fadeIn('fast');
        });
    };

    /**
     * Update the element to tell the user the transaction is currently being processed
     *
     * @param id {number} The item unique index
     * @param url {String} The Tx url
     */
    let updateTransactionTx = function (id, url) {
        let item = getCurrentListItem(id);
        if (url !== undefined) {
            item.setTxUrl(url);
            item.setType(TypeElement.TxProcessing);
        }
    };

    /**
     * Update the element to tell the user the transaction has been completed, successfully or not
     *
     * @param id {number} The item unique index
     * @param state {Boolean} Whether the transaction was successful or not
     */
    let updateTransactionState = function (id, state) {
        // We unlocked the UI after sending the transactions,
        // so we must find the element in the right tab and check if it isn't removed
        let item = getCurrentListItem(id);
        if (item !== undefined) {
            if (state) {
                item.setNumSign(item.getNumSign() + 1);
                item.setType(TypeElement.TransactionSuccess);
            } else {
                item.setType(TypeElement.TransactionFailure);
            }
        } else
            log('Item with index ' + index + ' has been removed and cannot be updated', TypeInfo.Warning);
        _elementSigned += 1;
        if (_elementSigned === _elementsToSign)
            UI.setUIElementsState(UI_STATE.none);

        console.log('signed: ' + _elementSigned + '/' + _elementsToSign);
    };

}


/* *********************************************************
 *                      INIT
 **********************************************************/

let UI = new UIManager();
UI.initUI();
