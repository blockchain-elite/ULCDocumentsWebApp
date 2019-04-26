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

const APP_VERSION = 'beta 0.0.9';

const APP_BASE_URL = 'https://ulcdocuments.blockchain-elite.fr/';

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
    let $tabListItemTemplates = [
        $("#fileListItemTemplate"),
        $("#textListItemTemplate"),
        $("#hashListItemTemplate")
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
        fileListResetSelection();
        UI.updateCheckButtonState();
    };

    let askForAccounts = function () {
        if (!_isAccountsListAvailable) {
            _isLoadingAccounts = true;
            requestAccountInfo();
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
            if (_currentNetworkType === TypeConnection.Mainnet)
                readyUI();
            else
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
            UI.connectToKernel();
    };

    /**
     * Show a warning alowing the user to abort connection when using testnet
     */
    let showTestnetWarning = function () {
        $.confirm({
            title: 'Untrusted network',
            content: 'You are connected to a test network. Please note that signatures cannot be trusted and are only used for testing purposes.',
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
                        readyUI();
                    }
                },
                cancel: {
                    text: 'Abort',
                    action: function () {
                        window.location = APP_BASE_URL;
                    }
                }
            },
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

    this.connectToKernel = function () {
        _kernelManager.setKernelConnectionLoading(true);
        setUrlHashParameter(HASH_PARAM_NAMES.kernelAddress, _kernelManager.getCurrentAddress());
        updateKernelAddress(_kernelManager.getCurrentAddress()); // Call to ULCDocMaster
    };

    this.connectToModerator = function () {
        _moderatorManager.setConnected(false);
        _moderatorManager.setModeratorConnectionLoading(true);
        updateModeratorAddress(_moderatorManager.getCurrentAddress()); // Call to ULCDocMaster
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
            UI.setUIButtonState(UI_STATE.none);
            resetElementsFromList(getCurrentList());
            UI.resetProgress();
        });

        $.selector_cache('#kernelAddressInputConnect').on('click', function () {
            _kernelManager.setCurrentAddress($.selector_cache('#kernelAddressInput').val());
            UI.connectToKernel();
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
        $.selector_cache("body")
            .on('click', function (e) {
                // Remove button clicked
                if (e.target.className.search('remove-list-item-button') !== -1) {
                    removeItemClick(e.target)
                } else {
                    let $card = getCardFromTarget($(e.target));
                    if ($card !== undefined) {
                        let index = getFileIndexFromId($card.attr('id'));
                        fileListResetSelection();
                        listItemClick(index);
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
        $.selector_cache('#kernelConnectionShowMoreButton').on('click', function () {
            _kernelManager.showKernelInfo();
        });
        $.selector_cache('#kernelConnectionShareButton').on('click', function () {
            let linkContainer = document.createElement('input');
            let link = window.location.href;
            document.body.appendChild(linkContainer);
            linkContainer.value = link;
            linkContainer.select();
            document.execCommand('copy');
            document.body.removeChild(linkContainer);
            sendNotification(TypeInfo.Good, 'Link Copied', 'The link to this page has been copied in your clipboard.')
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

    /**
     * Show the content of the tab based on its type
     *
     * @param type {TAB_TYPE} The type of the tab clicked
     */
    let tabClick = function (type) {
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
        fileListResetSelection();
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
                UI.setUIButtonState(UI_STATE.checking);
                log('Checking started...');
            } else {
                UI.setUIButtonState(UI_STATE.fetching);
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
                        UI.removeItemFromList(item.getIndex(), item.isSelected());
                    break;
                case TAB_TYPE.hash:
                    if (item.getHash().length === 0)
                        UI.removeItemFromList(item.getIndex(), item.isSelected());
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
    this.setUIButtonState = function (state) {
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
        if (state !== UI_STATE.fetched)
            $.selector_cache('.sign-next-step-logo').css('color', '#E9ECEF');
        else
            $.selector_cache('.sign-next-step-logo').css('color', '#17A2B8');

        $.selector_cache('#signButton').attr('disabled', state !== UI_STATE.fetched);
        $.selector_cache('#cancelButton').attr('disabled', state !== UI_STATE.fetched);

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
     * Set the file list item selected, associated to the index.
     *
     * @param index {Number} The file unique index
     */
    let listItemClick = function (index) {
        for (let item of getCurrentList().values()) { // unselect previous items
            if (item.getIndex() !== index) {
                item.setSelected(false);
            }
        }
        getCurrentListItem(index).setSelected(true);
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
                UI.setUIButtonState(UI_STATE.none);
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
        UI.setUIButtonState(UI_STATE.none);
        UI.resetProgress();
        updateDisplayIds(_currentTab);

        listItemClick(item.getIndex());
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
            if (_currentAppMode === APP_MODE.check) {
                $.selector_cache('#actionInProgress').html('Checking...');
                if (currentItem.getHash() !== '') {
                    currentItem.setType(TypeElement.Loading);
                    checkHash(currentItem.getHash(), currentItem.getIndex());
                }
                else {
                    switch (_currentTab) {
                        case TAB_TYPE.file:
                            checkFile(currentItem.getFile(), currentItem.getIndex());
                            break;
                        case TAB_TYPE.text:
                            checkText(currentItem.getText(), currentItem.getIndex());
                            break;
                        case TAB_TYPE.hash:
                            checkHash(currentItem.getHash(), currentItem.getIndex());
                            break;
                    }
                }
            } else {
                $.selector_cache('#actionInProgress').html('Fetching information...');
                // Do not calculate the hash if we already have it
                if (currentItem.getHash() !== '')
                    fetchHash(currentItem.getHash(), currentItem.getIndex());
                else {
                    switch (_currentTab) {
                        case TAB_TYPE.file:
                            fetchFile(currentItem.getFile(), currentItem.getIndex());
                            break;
                        case TAB_TYPE.text:
                            fetchText(currentItem.getText(), currentItem.getIndex());
                            break;
                        case TAB_TYPE.hash:
                            fetchHash(currentItem.getHash(), currentItem.getIndex());
                            break;
                    }
                }

            }
        } else if (_currentAppMode === APP_MODE.check) // If we finished checking
            endCheck();
        else  // if we finished fetching
            trySign();
    };

    /**
     * Re-enable the UI and display notifications
     */
    let endCheck = function () {
        log('Finished checking all the items', TypeInfo.Info);
        updateProgress(0, true);
        UI.setUIButtonState(UI_STATE.none);
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
            UI.setUIButtonState(UI_STATE.fetched);
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
                            UI.setUIButtonState(UI_STATE.fetched);
                        } else {
                            sendNotification(TypeInfo.Critical, 'Error', 'No valid document to sign');
                            UI.setUIButtonState(UI_STATE.none);
                        }
                    }
                },
                cancel: function () {
                    UI.setUIButtonState(UI_STATE.none);
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
            UI.removeItemFromList(i, true);
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
                        UI.setUIButtonState(UI_STATE.signing);
                        _elementsToSign = getCurrentList().size;
                        _elementSigned = 0;
                        $.selector_cache('#actionInProgress').html('Signing...');

                        if (!_isOptimizerEnabled) {
                            log('Signing without optimizer', TypeInfo.Info);
                            _itemsProcessedCounter = 0;
                            for (_itemsProcessedCounter = 0; _itemsProcessedCounter < getCurrentList().size; _itemsProcessedCounter++) {
                                updateProgress(_itemsProcessedCounter, false);
                                let currentItem = getCurrentListItemByIndex(_itemsProcessedCounter);
                                signDocument(currentItem.getHash(), getItemInfoToSign(currentItem), currentItem.getIndex());
                            }
                            endSign();
                        } else {
                            log('Signing with optimizer', TypeInfo.Info);
                            let requests = [[], [], []];
                            for (_itemsProcessedCounter = 0; _itemsProcessedCounter < getCurrentList().size; _itemsProcessedCounter++) {
                                updateProgress(_itemsProcessedCounter, false);
                                let currentItem = getCurrentListItemByIndex(_itemsProcessedCounter);
                                requests[0].push(currentItem.getHash());
                                requests[1].push(getItemInfoToSign(currentItem));
                                requests[2].push(currentItem.getIndex());
                            }
                            updateProgress(_itemsProcessedCounter, true);
                            signOptimisedDocuments(requests[0], requests[1], requests[2]);
                        }

                    }
                },
                cancel: function () {
                    UI.setUIButtonState(UI_STATE.fetched);
                },
            }
        });
    };

    /**
     * Get a map containing information to sign, or undefined if no info has been entered
     *
     * @param item {ListItem} The list item to sign
     * @return {Map<any, any>} The map of information to sign or undefined
     */
    let getItemInfoToSign = function (item) {
        let infoMap = new Map(item.getInformation());
        if (item.getNumSign() === 0) {// We are the first to sign, we can enter values
            item.clearCustomExtraData();
            if (item.getCustomExtraData().length) {// We have valid extra data
                item.setExtraData(customExtraToMap(item.getCustomExtraData()));
                infoMap.set(elementReservedKeys.extraData, item.getExtraData());
            }
            if (infoMap.size === 0) //If no data, set map to undefined
                infoMap = undefined;
        } else // We are not the first one to sign, we cannot enter new values
            infoMap = undefined;
        return infoMap;
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
            $.selector_cache('#fileInProgress').html('...');
            $.selector_cache('#actionInProgress').html('Finished');
            $.selector_cache('#actionProgressBar').css("width", "100%");
            $.selector_cache('#actionProgressBar').attr("aria-valuenow", "100");
            $.selector_cache('#actionProgressBar').html('100%');
            $.selector_cache('#actionProgressBar').removeClass('progress-bar-animated');
        } else if (progress === -1) { // Not started
            $.selector_cache('#fileInProgress').html('...');
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
     * Reset the file selection (unselect all items and reset details box).
     */
    let fileListResetSelection = function () {
        $(".file-selected").removeClass('file-selected'); // unselect all items
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
                    UI.removeItemFromList(item2.getIndex(), item2.isSelected());
            }
        }
    };

    /**
     * Get the item identified by its index in every item list, starting by the current for performance reasons
     *
     * @param index {Number} The unique item identifier
     * @return {ListItem} The item found, or undefined
     */
    let getItemInAll = function (index) {
        let finalItem = getCurrentListItem(index);
        if (finalItem === undefined) {
            for (let tabList of _itemList.values()) {
                for (let itemList of tabList.values()) {
                    for (let item of itemList.values()) {
                        if (item.getIndex() === index)
                            finalItem = item;
                    }
                }
            }
        }
        return finalItem;
    };

    let setupDOMDimensions = function () {
        let height = $(window).height() - 200; // Header + kernel connection
        $.selector_cache("#mainCard").css('height', height);
    };

    /* *********************************************************
     *                       PUBLIC FUNCTIONS
     * *********************************************************/

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

    /**
     * Clone the file list item template into the right tab.
     *
     * @param id {String} The id of the DOM element to create.
     * It must en with _{index} with the unique file index to be able to retrieve the file.
     * @param type {TAB_TYPE} The type to create
     */
    this.createListItemFromTemplate = function (id, type) {
        $tabListItemTemplates[type].contents().clone().attr('id', id).appendTo($tabHolders[type]);
    };

    /**
     * Removes the file associated to the index from the list.
     * If we are removing the last file, display the empty file list template.
     *
     * @param index {Number} The file unique index.
     * @param isSelected {Boolean} Whether the file is currently selected.
     */
    this.removeItemFromList = function (index, isSelected) {
        $("#" + getCurrentListItem(index).getId()).remove();
        getCurrentList().delete(index);
        if (isCurrentItemListEmpty()) {
            UI.resetProgress();
            resetTabZone(_currentTab);
            UI.updateCheckButtonState();
            UI.setUIButtonState(UI_STATE.none);
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
        UI.setUIButtonState(UI_STATE.none);
        _kernelManager.setKernelInfo(undefined, undefined);
        _moderatorManager.setModeratorInfo(undefined, 'Connection in progress...');
        for (let i of Object.keys(TAB_TYPE)) {
            resetTabZone(TAB_TYPE[i]);
        }
        $('[data-toggle="tooltip"]').tooltip(); // enable Popper.js tooltips
        registerEvents();
        UI.resetProgress();
        this.updateAccounts(undefined);
        _canUseDropZone = true;
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
     * @param infoType {TypeInfo} The type of information, to choose which tooltip to display.
     */
    this.updateNetworkConnectedUI = function (connectionType, infoType) {
        // reset badge
        $.selector_cache('#networkTypeField').attr('class', 'badge');
        log('Setting network connected UI', TypeInfo.Info);
        switch (infoType) {
            case TypeInfo.Good:
                $.selector_cache('#networkTypeField').attr('data-original-title', 'You are connected to a public server');
                $.selector_cache('#networkTypeField').addClass('badge-success');
                _moderatorManager.setDefaultAddress(officialBlockchainEliteModerator);
                break;
            case TypeInfo.Warning:
                $.selector_cache('#networkTypeField').attr('data-original-title', 'You are connected to a test server');
                $.selector_cache('#networkTypeField').addClass('badge-warning');
                _moderatorManager.setDefaultAddress(ropstenBlockchainEliteModerator);
                break;
            case TypeInfo.Critical:
                $.selector_cache('#networkTypeField').attr('data-original-title', 'Could not connect');
                $.selector_cache('#networkTypeField').addClass('badge-danger');
                _moderatorManager.setDefaultAddress('');
                break;
        }
        for (let type in TypeConnection) {
            if (TypeConnection[type] === connectionType) {
                $.selector_cache('#networkTypeField').html(type);
                break;
            }
        }
        _currentNetworkType = connectionType;
        _moderatorManager.setCurrentAddress(_moderatorManager.getDefaultAddress());
    };

    /**
     * Set the connection type field text based on the given state.
     * Possible values are injected and infura
     *
     * @param isInjected {Boolean} Whether the wallet is injected or infura.
     */
    this.updateWalletStateUI = function (isInjected) {
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

        tryReadyUI();
    };

    /**
     * Show a dialog to the user asking for connection confirmation
     *
     * @param status {resultQueryStatus} The status of the connection
     * @param revokedReason {String} The reason
     */
    this.promptKernelConnectionWarnAnswer = function (status, revokedReason) {
        let message = '';
        switch (status) {
            case resultQueryStatus.revoked:
                message = 'The Kernel you are connecting to has been revoked by the moderator.\n' +
                    'This mean the moderator does not recognize the kernel anymore and cannot prove its identity.\n' +
                    'revoked reason: ' + revokedReason;
                break;
            case resultQueryStatus.initialized:
                message = 'The Moderator knows the Kernel you are connecting to, but has not yet passed security confirmation.' +
                    'As such, it cannot provide information on its identity.';
                break;
            case resultQueryStatus.unknown:
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
                            updateKernelObject(_kernelManager.getCurrentAddress(), undefined);
                        }
                    },
                    cancel: function () {
                        UI.updateKernelConnection(undefined, undefined);
                    },
                }
            });
        }
    };

    /**
     * Set the kernel connection information.
     *
     * @param connectionStatus {TypeInfo} The connection status
     * @param moderatorInfo {Map} The connection information
     * Reserved keys :
     * 'connection-status' for a TypeInfo describing the connection.
     * 'img' for the image url. Not setting this key will not show an image.
     * 'extra-data' for a map containing additional data.
     *
     */
    this.updateKernelConnection = function (connectionStatus, moderatorInfo) {
        _isAccountsListAvailable = false; // Kernel operators may change
        resetAllElements(); // Element signatures are different from each kernel
        _kernelManager.setKernelConnectionLoading(false);
        switch (connectionStatus) {
            case TypeInfo.Good:
                $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-check-circle text-success');
                setDOMColor($.selector_cache('#kernelInfoHeader'), COLOR_CLASSES.success);
                _kernelManager.setKernelInfo(moderatorInfo, TypeInfo.Good);
                if (_currentAppMode === APP_MODE.sign)
                    askForAccounts();
                _kernelManager.setConnected(true);
                break;
            case TypeInfo.Warning:
                $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-exclamation-triangle text-warning');
                $.selector_cache('#kernelConnectedAddress').html("Currently connected to : '" + _kernelManager.getCurrentAddress() + "'");
                setDOMColor($.selector_cache('#kernelInfoHeader'), COLOR_CLASSES.warning);
                _kernelManager.setKernelInfo(undefined, TypeInfo.Warning);
                if (_currentAppMode === APP_MODE.sign)
                    askForAccounts();
                _kernelManager.setConnected(true);
                break;
            case TypeInfo.Critical:
                $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-times text-danger');
                $.selector_cache('#kernelConnectedAddress').html("Could not connect to '" + _kernelManager.getCurrentAddress() + "'");
                setDOMColor($.selector_cache('#kernelInfoHeader'), COLOR_CLASSES.danger);
                _kernelManager.setKernelInfo(undefined, TypeInfo.Critical);
                _kernelManager.setConnected(false);
                break;
            default:
                $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-question');
                $.selector_cache('#kernelConnectedAddress').html("Not Connected");
                setDOMColor($.selector_cache('#kernelInfoHeader'), COLOR_CLASSES.secondary);
                _kernelManager.setKernelInfo(undefined, undefined);
                _kernelManager.setConnected(false);
                break;
        }
        UI.updateCheckButtonState();
        UI.updateMainUIState();
    };

    /**
     * Set the moderator info.
     *
     * @param connectionInfo {Map} Map containing moderator info.
     *  Reserved keys :
     * 'connection-status' for a TypeInfo describing the connection.
     * 'registration_link' for a link to the registration page.
     * 'contact_link' for a link to the contact page.
     */
    this.updateModeratorConnection = function (connectionInfo) {
        let connectionType = TypeInfo.Info;
        if (connectionInfo !== undefined && connectionInfo.has(moderatorReservedKeys.status))
            connectionType = connectionInfo.get(moderatorReservedKeys.status);

        _moderatorManager.setConnected(true);
        _moderatorManager.setModeratorConnectionLoading(false);
        log('Updating moderator input UI', TypeInfo.Info);
        UI.updateKernelConnection(undefined, undefined); // Reset the kernel connection
        switch (connectionType) {
            case TypeInfo.Good:
                $.selector_cache('#moderatorConnectionInfoIcon').attr('class', 'fas fa-check-circle text-success');
                if (_moderatorManager.isConnectedToDefault()) {
                    let modName = _currentNetworkType === TypeConnection.Mainnet ? 'Blockchain Élite ULCDocuments Official' : 'Blockchain Élite ULCDocuments Testnet';
                    $.selector_cache('#moderatorConnectedAddress').html("Currently connected to default: " +
                        "<strong>" + modName + "</strong>");
                } else
                    $.selector_cache('#moderatorConnectedAddress').html("Currently connected to: " +
                        "'<strong>" + _moderatorManager.getCurrentAddress() + "</strong>'");
                setDOMColor($.selector_cache('#moderatorInfoHeader'), COLOR_CLASSES.success);
                _moderatorManager.setModeratorInfo(connectionInfo, "");
                break;
            case TypeInfo.Critical:
                _kernelManager.setConnected(false);
                $.selector_cache('#moderatorConnectionInfoIcon').attr('class', 'fas fa-times text-danger');
                $.selector_cache('#moderatorConnectedAddress').html("Could not connect to '" + _moderatorManager.getCurrentAddress() + "'");
                setDOMColor($.selector_cache('#moderatorInfoHeader'), COLOR_CLASSES.danger);
                _moderatorManager.setModeratorInfo(undefined, 'Connection could not be established, falling back to default');
                break;
        }
        tryReadyUI();
        UI.updateCheckButtonState();
    };

    /**
     * Update the element associated to index.
     *
     * @param index {Number} The file unique index.
     * @param elementInfo {Map} Map containing file information
     */
    this.updateElement = function (index, elementInfo) {
        let elementType = TypeElement.Unknown;
        if (elementInfo !== undefined && elementInfo.has(elementReservedKeys.status)) {
            elementType = elementInfo.get(elementReservedKeys.status);
            // Separate basic info and extra data, and remove reserved keys from basic info
            let extraData = undefined;
            if (elementInfo.has(elementReservedKeys.extraData)) {
                extraData = elementInfo.get(elementReservedKeys.extraData);
                elementInfo.delete(elementReservedKeys.extraData);
            }
            let signNeed = 0;
            let signNum = 0;
            if (elementInfo.has(fetchElementReservedKeys.signNeed) && elementInfo.get(fetchElementReservedKeys.signNeed) > 0) {
                signNeed = elementInfo.get(fetchElementReservedKeys.signNeed);
                elementInfo.delete(fetchElementReservedKeys.signNeed);
                if (elementInfo.has(fetchElementReservedKeys.signPending)) {
                    signNum = elementInfo.get(fetchElementReservedKeys.signPending);
                    elementInfo.delete(fetchElementReservedKeys.signPending);
                }
            }
            elementInfo.delete(elementReservedKeys.status);
            getCurrentListItem(index).setNumSign(signNum);
            getCurrentListItem(index).setNeededSign(signNeed);
            // Do not reset element info and extra data if transaction failed
            getCurrentListItem(index).setInformation(elementInfo);
            getCurrentListItem(index).setExtraData(extraData);
        } else {
            log('Element status unavailable, resetting to default.');
            getCurrentListItem(index).setInformation(undefined);
            getCurrentListItem(index).setExtraData(undefined);
        }
        _itemsProcessedCounter += 1;
        getCurrentListItem(index).setType(elementType);
        checkNextItem();
    };

    /**
     * Update the hash of the element associated to index.
     *
     * @param index {Number} The item unique index.
     * @param hash {String} The hash to display.
     */
    this.updateElementHash = function (index, hash) {
        let item = getCurrentListItem(index);
        item.setType(TypeElement.Loading); // We have the hash, we can start asking blockchain
        item.setHash(hash);
    };

    /**
     * Updates the account list with the specified Map.
     * This map must be of format {string : boolean}, with string being the accounts address
     * and boolean whether the account owns the current kernel
     * The first element in the map is considered the current account.
     *
     * @param accountsMap {Map} The accounts list
     */
    this.updateAccounts = function (accountsMap) {
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
     * @param index {Number} The item unique index
     * @param url {String} The Tx url
     */
    this.updateTransactionTx = function (index, url) {
        let item = getCurrentListItem(index);
        if (url !== undefined) {
            item.setTxUrl(url);
            item.setType(TypeElement.TxProcessing);
        }
    };

    /**
     * Update the element to tell the user the transaction has been completed, successfully or not
     *
     * @param index {Number} The item unique index
     * @param state {Boolean} Whether the transaction was successful or not
     */
    this.updateTransactionState = function (index, state) {
        // We unlocked the UI after sending the transactions,
        // so we must find the element in the right tab and check if it isn't removed
        let item = getItemInAll(index);
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
            UI.setUIButtonState(UI_STATE.none);

        console.log('signed: ' + _elementSigned + '/' + _elementsToSign);
    };

}


/* *********************************************************
 *                      INIT
 **********************************************************/

let UI = new UIManager();
UI.initUI();


// separate UI into 3 parts : import, check, result