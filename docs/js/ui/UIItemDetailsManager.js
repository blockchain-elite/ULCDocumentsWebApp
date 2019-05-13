function UIItemDetailsManager() {

    let _blockchainErrorMsg = new Map();
    _blockchainErrorMsg.set(APP_MODE.check, new Map());
    _blockchainErrorMsg.set(APP_MODE.sign, new Map());

    _blockchainErrorMsg.get(APP_MODE.check).set(TypeElement.Fake, ['This item is not signed', COLOR_CLASSES.danger]);
    _blockchainErrorMsg.get(APP_MODE.check).set(TypeElement.Unknown, ['Click on check to display blockchain information', COLOR_CLASSES.info]);
    _blockchainErrorMsg.get(APP_MODE.check).set(TypeElement.Invalid, ['An error occurred', COLOR_CLASSES.secondary]);
    _blockchainErrorMsg.get(APP_MODE.check).set(TypeElement.Loading, ['Asking blockchain...', COLOR_CLASSES.info]);

    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.Signed, ['This item is already signed', COLOR_CLASSES.danger]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.Pending, ['You already signed this item', COLOR_CLASSES.danger]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.Revoked, ['This item has been revoked and cannot be signed again', COLOR_CLASSES.danger]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.Unknown, ['Click on fetch to start editing blockchain information', COLOR_CLASSES.info]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.Invalid, ['An error occurred', COLOR_CLASSES.secondary]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.Loading, ['Asking blockchain...', COLOR_CLASSES.info]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.TxProcessing, ['Waiting for blockchain...', COLOR_CLASSES.info]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.TransactionSuccess, ['Signature successfully sent!', COLOR_CLASSES.success]);
    _blockchainErrorMsg.get(APP_MODE.sign).set(TypeElement.TransactionFailure, ['Signature failed!', COLOR_CLASSES.danger]);


    let itemPropPopup = $.alert({
        content:
            '<div id="detailsZone">\n' +
            '<h5 class="text-center">\n' +
            '<span id="itemStatusProp">#STATUS</span>\n' +
            '<span id="itemNumSignContainer" class="text-muted">\n' +
            ':\n' +
            '<span id="itemNumSignProp">#SIGNATURES</span>\n' +
            '</span>\n' +
            '</h5>\n' +
            '<textarea id="itemTextInput" class="form-control" rows="5" placeholder="Enter your text here..."></textarea>\n' +
            '<input id="itemHashInput" class="form-control" placeholder="Enter your hash here...">\n' +
            '<p class="text-muted" id="itemHashContainer">File\'s hash (<span id="itemHashType"></span>): <span\n' +
            'id="itemHashProp">HASH</span>\n' +
            '<button class="ml-2 btn btn-secondary" id="copyHashButton" data-toggle="tooltip"' +
            'data-placement="bottom" title="Copy hash to clipboard" style="display: none">' +
            '<i class="fas fa-copy"></i></button>' +
            '</p>\n' +
            '<a id="itemTxUrlProp" href="" target="_blank">\n' +
            '<button class="btn btn-primary">\n' +
            '<i class="fas fa-external-link-alt"></i>\n' +
            'See Transaction on Etherscan\n' +
            '</button>\n' +
            '</a>\n' +
            '<div class="mt-5" id="fileBlockchainInfoCard">\n' +

            '<div id="fileBlockchainInfoZone">\n' +
            '<div class="row" style="margin: 0">' +
            '<div class="col">\n' +
            '<h4 class="text-center">Blockchain Information</h4>\n' +
            '<p id="fileBlockchainDate"></p>' +
            '<p id="fileBlockchainSource"></p>' +
            '<p id="fileBlockchainFamily"></p>' +
            '</div>\n' +
            '<div class="col">\n' +
            '<div id="fileBlockchainExtraDataZone">\n' +
            '<h4 class="text-center">Extra Data</h4>\n' +
            '<table class="table">\n' +
            '<tbody id="fileBlockchainExtraDataTable">\n' +
            '</tbody>\n' +
            '</table>\n' +
            '</div>\n' +
            '</div>\n' +
            '</div>\n' +
            '</div>\n' +

            '<div id="fileBlockchainEditInfoZone">\n' +
            '<h4 class="text-center">Edit Blockchain Info</h4>\n' +
            '<table class="table">\n' +
            '<tbody id="fileBlockchainEditInfoTable">\n' +
            '<tr>\n' +
            '<th>Source</th>\n' +
            '<td><input class="form-control" type="text"\n' +
            'id="infoSourceInput" placeholder="Enter a value">\n' +
            '</td>\n' +
            '</tr>\n' +
            '<tr>\n' +
            '<th>Document Type</th>\n' +
            '<td>\n' +
            '<div class="dropdown">\n' +
            '<button class="btn btn-info dropdown-toggle"\n' +
            'type="button" id="docFamilyDropdownButton"\n' +
            'data-toggle="dropdown" aria-haspopup="true"\n' +
            'aria-expanded="false">\n' +
            'Dropdown button\n' +
            '</button>\n' +
            '<div class="dropdown-menu"\n' +
            'aria-labelledby="docFamilyDropdown"\n' +
            'id="docFamilyDropdownMenu">\n' +
            '</div>\n' +
            '</div>\n' +
            '</td>\n' +
            '</tr>\n' +
            '</tbody>\n' +
            '</table>\n' +
            '<h4 class="text-center">Extra Data</h4>\n' +
            '<table class="table editExtraDataTable">\n' +
            '<tbody id="fileBlockchainEditExtraDataTable">\n' +
            '</tbody>\n' +
            '</table>\n' +
            '<button class="btn btn-info" id="editExtraDataAddButton"\n' +
            'data-toggle="tooltip" data-placement="bottom"\n' +
            'title="Add more extra data fields">\n' +
            'Add Fields\n' +
            '<i class="fas fa-plus" style="margin-left: 10px"></i>\n' +
            '</button>\n' +
            '<button class="btn btn-danger" id="editExtraDataClearButton"\n' +
            'data-toggle="tooltip" data-placement="bottom"\n' +
            'title="Remove all extra data fields" style="float: right;">\n' +
            'Clear\n' +
            '<i class="fas fa-trash" style="margin-left: 10px"></i>\n' +
            '</button>\n' +
            '</div>\n' +
            '</div>\n' +
            '</div>',
        theme: JQUERY_CONFIRM_THEME,
        columnClass: 'xlarge',
        escapeKey: 'ok',
        typeAnimated: true,
        lazyOpen: true,
    });

    /**
     * Display file properties in the details popup.
     *
     * @param item {ListItem|FileListItem|TextListItem|HashListItem} The item to show.
     */
    this.displayFileProps = function (item) {
        this.displayItemListProps([item]);
    };


    /**
     *
     * @param items {ListItem[]|FileListItem[]|TextListItem[]|HashListItem[]}
     */
    this.displayItemListProps = function (items) {
        itemPropPopup.onOpenBefore = function () {
            $('#itemTextInput').autoResize();
            $('#itemHashType').text(getHashAlgorithm());
            UI.getItemDetailsManager().setupItemPopup(items);
            $("#copyHashButton").on('click', function () {
                copyToClipboard(items[0].getHash());
                sendNotification(TypeInfo.Good, 'Hash copied', 'The hash has been copied to the clipboard.');
            });
            $('[data-toggle="tooltip"]').tooltip(); // Enable created tooltips
        };
        itemPropPopup.onOpen = function () { // Make sure the input fields are focused
            if (UI.getCurrentTab() === TAB_TYPE.text)
                $('#itemTextInput').focus();
            else if (UI.getCurrentTab() === TAB_TYPE.hash)
                $('#itemHashInput').focus();
        };

        let type;
        if (items.length > 1)
            type = getJConfirmTypeFromColorClass(COLOR_CLASSES.success); // We have multiples items fetched
        else
            type = getJConfirmTypeFromColorClass(items[0].getCardColor());
        let btnType = '';
        if (type !== '')
            btnType = 'btn-' + type;
        let icon = '';
        let title = '';
        if (items.length > 1) {
            icon = getMimeTypeIcon(undefined);
            title = 'Multiple items';
        } else {
            if (UI.getCurrentTab() === TAB_TYPE.file) {
                icon = getMimeTypeIcon(items[0].getFile());
                title = items[0].getFile().name + ' <span class="text-muted" style="font-weight: normal">(' + humanFileSize(items[0].getFile().size) + ')</span>';
            } else if (UI.getCurrentTab() === TAB_TYPE.text) {
                icon = 'fas fa-align-left';
                title = items[0].getTitle();
            } else {
                icon = 'fas fa-hashtag';
                title = items[0].getTitle();
            }
        }
        itemPropPopup.buttons = {
            ok: {
                keys: ['enter'],
                btnClass: btnType,
                action: function () {
                    let selected = items.slice();
                    for (let i = 0; i < selected.length; i++) {
                        selected[i].setSelected(false);
                        selected[i].sanitizeCustomExtraData();
                    }
                }
            },
        };
        itemPropPopup.icon = icon;
        itemPropPopup.title = title;
        itemPropPopup.type = type;
        itemPropPopup.open();
    };

    this.setupItemPopup = function (items) {
        setBlockchainInfoErrorText('', COLOR_CLASSES.none); // reset color
        if (items.length) {
            fillReservedFields(items);
            setupItemInputFields(items);
            // Display blockchain edit fields if the item has no signatures
            if (canDisplayBlockchainEditFields(items)) {
                logMe(UIManagerPrefix, 'Displaying Blockchain edit fields', TypeInfo.Info);
                $("#fileBlockchainInfoCard").show();
                $('#fileBlockchainInfoZone').hide();
                $('#fileBlockchainEditInfoZone').show();
                // Reset table
                $("#fileBlockchainEditExtraDataTable").html('');
                setupSourceInputField(items);
                createDocFamilyDropDown(items);
                createSavedExtraDataInputFields(items);
                setupExtraDataControlButtons(items);
            } else if (canDisplayBlockchainInformation(items)) {
                $("#fileBlockchainInfoCard").show();
                $('#fileBlockchainInfoZone').show();
                $('#fileBlockchainEditInfoZone').hide();
                fillBlockchainInfoFields(items);
                if (canDisplayBlockchainExtraData(items))
                    fillBlockchainExtraDataFields(items);
                else
                    $("#fileBlockchainExtraDataZone").hide();
            } else {
                // No blockchain information to display
                $("#fileBlockchainInfoCard").hide();
                $('#fileBlockchainInfoZone').hide();
                $('#fileBlockchainEditInfoZone').hide();
                setBlockchainInfoMessage(items);
            }
        }
    };

    let canDisplayBlockchainEditFields = function (items) {
        let isListReady = true;
        for (let i = 0; i < items.length; i++) {
            if (items[i].getType() !== TypeElement.Fake || items[i].getNumSign() !== 0) {
                isListReady = false;
                break;
            }
        }
        return UI.getCurrentAppMode() === APP_MODE.sign && UI.getCurrentUIState() === UI_STATE.fetched && isListReady;
    };

    let canDisplayBlockchainInformation = function (items) {
        let canDisplay = true;
        for (let i = 0; i < items.length; i++) {
            if (items[i].getInformation() === undefined || items[i].getInformation().size === 0) {
                canDisplay = false;
                break;
            }
        }
        return canDisplay;
    };

    let canDisplayBlockchainExtraData = function (items) {
        let canDisplay = true;
        for (let i = 0; i < items.length; i++) {
            if (items[i].getExtraData() === undefined || items[i].getExtraData().size === 0) {
                canDisplay = false;
                break;
            }
        }
        return canDisplay;
    };

    let fillReservedFields = function (items) {
        let item = undefined;
        if (items.length === 1)
            item = items[0];

        if (UI.getCurrentTab() !== TAB_TYPE.hash) {
            if (item !== undefined && item.getHash() !== '') {
                $("#itemHashProp").text(item.getHash());
                $('#copyHashButton').show();
            } else if (item !== undefined)
                $("#itemHashProp").text('not yet calculated');
            else
                $("#itemHashProp").text('< Different >');
        } else {
            $('#itemHashContainer').hide();
        }

        if (item !== undefined) {
            if (item.getType() !== TypeElement.Unknown)
                $("#itemStatusProp").text(ITEM_STATE_TEXT[item.getType()]).show();
            else
                $("#itemStatusProp").hide();
        } else // Multiple elements so they must be fake (ready to sign)
            $("#itemStatusProp").text(ITEM_STATE_TEXT[TypeElement.Fake]).show();


        // Set the number of signatures needed
        if (item !== undefined && item.getNeededSign() > 0 && item.getType() !== TypeElement.Unknown)
            $("#itemNumSignProp").text(item.getNumSign() + "/" + item.getNeededSign()).show();
        else
            $("#itemNumSignContainer").hide();
        // Set the Tx url if available
        if (item !== undefined && item.getTxUrl() !== '')
            $("#itemTxUrlProp").attr('href', item.getTxUrl()).show();
        else
            $("#itemTxUrlProp").hide();
    };

    let setupItemInputFields = function (items) {
        let item = undefined;
        if (items.length === 1)
            item = items[0];

        if (!(UI.getCurrentTab() === TAB_TYPE.file)) {
            let input;
            let val = '< Different >';
            if (UI.getCurrentTab() === TAB_TYPE.text) {
                $("#itemHashInput").hide();
                input = $('#itemTextInput');
                if (item !== undefined)
                    val = item.getText();
            } else {
                $("#itemTextInput").hide();
                input = $('#itemHashInput');
                if (item !== undefined)
                    val = item.getHash();
            }
            input.off('change keyup paste').val(val).on('change keyup paste', function () { // Remove previous event handlers
                let mustReset = false;
                for (let i = 0; i < items.length; i++) {
                    if (UI.getCurrentTab() === TAB_TYPE.hash)
                        items[i].setHash(input.val());
                    else
                        items[i].setText(input.val());
                    if (items[i].getType() !== TypeElement.Unknown) {
                        items[i].reset();
                        mustReset = true;
                        if (UI.getCurrentTab() !== TAB_TYPE.hash)
                            items[i].setHash('');
                    }
                }
                if (mustReset) {
                    UI.getItemDetailsManager().setupItemPopup(items);
                    UI.resetProgress();
                    UI.setUIElementsState(UI_STATE.none);
                }
            }).show();
            if (UI.getCurrentUIState() === UI_STATE.fetched) {
                input.attr('disabled', true);
            }
        } else {
            $("#itemTextInput").hide();
            $("#itemHashInput").hide();
        }
    };

    let fillBlockchainInfoFields = function (items) {
        logMe(UIManagerPrefix, 'Displaying Blockchain information', TypeInfo.Info);
        let item = undefined;
        if (items.length === 1)
            item = items[0];

        if (item !== undefined && item.getInformation().get(elementReservedKeys.date) !== undefined)
            $('#fileBlockchainDate').text('Signed on ' + item.getInformation().get(elementReservedKeys.date));
        else if (item !== undefined)
            $('#fileBlockchainDate').text('');
        else
            $('#fileBlockchainDate').text('< Different >');

        if (item !== undefined && (item.getInformation().get(elementReservedKeys.source) === '' || item.getInformation().get(elementReservedKeys.source) === undefined))
            $('#fileBlockchainSource').text('No source provided.');
        else if (item !== undefined)
            $('#fileBlockchainSource').text('Source: ' + item.getInformation().get(elementReservedKeys.source));
        else
            $('#fileBlockchainSource').text('Source is different.');

        if (item !== undefined && item.getInformation().get(elementReservedKeys.documentFamily) !== '0') {
            let family = getCompatibleFamily()[item.getInformation().get(elementReservedKeys.documentFamily)]; // Get the document family string
            $('#fileBlockchainFamily').text('Signed as: ' + family);
        } else if (item !== undefined)
            $('#fileBlockchainFamily').text('');
        else
            $('#fileBlockchainFamily').text('Different Types');
    };

    let fillBlockchainExtraDataFields = function (items) {
        $("#fileBlockchainExtraDataZone").show();
        // Reset table
        let extraDataTable = $("#fileBlockchainExtraDataTable");
        extraDataTable.html('');
        let counter = 0;
        if (items.length === 1) {
            for (let [key, value] of items[0].getExtraData()) {
                counter++;
                extraDataTable.append(
                    "<tr>\n" +
                    "<th scope='row' id='blockchainExtraFieldKey" + counter + "'></th>\n" +
                    "<td id='blockchainExtraFieldValue" + counter + "'></td>\n" +
                    "</tr>");
                $("#blockchainExtraFieldKey" + counter).text(key);
                $("#blockchainExtraFieldValue" + counter).text(value); // Prevent XSS
            }
        }
    };

    /**
     *
     * @param item {ListItem}
     */
    let setupSourceInputField = function (items) {
        let sourceInput = $("#infoSourceInput");
        if (items.length === 1 && items[0].getInformation().has(elementReservedKeys.source))
            sourceInput.val(items[0].getInformation().get(elementReservedKeys.source));
        else if (items.length === 1)
            sourceInput.val('');
        else {
            let different = false;
            let src = items[0].getInformation().get(elementReservedKeys.source);
            for (let i = 0; i < items.length; i++) {
                if (items[i].getInformation().get(elementReservedKeys.source) !== src) {
                    different = true;
                    break;
                }
            }
            if (different)
                sourceInput.attr('placeholder', '< Different >');
            else
                sourceInput.val(src);
        }


        sourceInput.off('change keyup paste').on('change keyup paste', function () { // reset callback
            let val = sourceInput.val();
            for (let i = 0; i < items.length; i++) {
                if (val !== '')
                    items[i].getInformation().set(elementReservedKeys.source, val);
                else
                    items[i].getInformation().delete(elementReservedKeys.source);
            }

        });
    };

    /**
     * Generate the dropdown menu based on kernel document family.
     *
     * @param item {ListItem} The item we are editing
     */
    let createDocFamilyDropDown = function (items) {
        let dropdownButton = $("#docFamilyDropdownButton");
        let dropdownMenu = $("#docFamilyDropdownMenu");
        let docFamilyArray = getCompatibleFamily();
        // clear menu
        dropdownMenu.html('');
        // Generate dropdown menu entries
        for (let i = 0; i < getCompatibleFamily().length; i++) {
            dropdownMenu.append("<button class='dropdown-item btn' id='dropdownButton" + i + "'>" + docFamilyArray[i] + "</button>");
            $("#dropdownButton" + i).on('click', function () {
                dropdownButton.text(docFamilyArray[i]);
                for (let j = 0; j < items.length; j++) {
                    if (i !== 0)
                        items[j].getInformation().set(elementReservedKeys.documentFamily, i);
                    else
                        items[j].getInformation().delete(elementReservedKeys.documentFamily);
                }

            });
        }
        // Set default value
        if (items.length === 1 && items[0].getInformation().has(elementReservedKeys.documentFamily))
            dropdownButton.text(docFamilyArray[items[0].getInformation().get(elementReservedKeys.documentFamily)]);
        else if (items.length === 1)
            dropdownButton.text(docFamilyArray[0]);
        else {
            let different = false;
            let type = 0;
            if (items[0].getInformation().has(elementReservedKeys.documentFamily))
                type = items[0].getInformation().get(elementReservedKeys.documentFamily);
            for (let i = 0; i < items.length; i++) {
                let iType = 0;
                if (items[i].getInformation().has(elementReservedKeys.documentFamily))
                    iType = items[i].getInformation().get(elementReservedKeys.documentFamily);
                if (iType !== type) {
                    different = true;
                    break;
                }
            }
            if (different)
                dropdownButton.text('< Different >');
            else
                dropdownButton.text(docFamilyArray[type]);
        }
    };

    let isCustomExtraDataDifferent = function(items) {
        let different = false;
        let data = items[0].getCustomExtraData();
        for (let i = 0; i < items.length; i++) {
            if (items[i].getCustomExtraData().length !== data.length)
                different = true;
            else {
                for (let j = 0; j < items[i].getCustomExtraData().length; j++) {
                    if (items[i].getCustomExtraData()[j][0] !== data[j][0] ||
                        items[i].getCustomExtraData()[j][1] !== data[j][1]) {
                        different = true;
                        break;
                    }
                }
            }
            if (different)
                break;
        }
        return different;
    };

    /**
     * Create input fields with values from the item.
     * @param item {ListItem} The list item to take values from
     */
    let createSavedExtraDataInputFields = function (items) {
        $('#fileBlockchainEditExtraDataTable').html(''); // Clear the list to recreate it

        let different = false;
        if (items.length > 1) {
            different = isCustomExtraDataDifferent(items);
            if (different)
                createNewExtraDataInputField(items, 0, '', '', true);
        }
        if (items.length === 1 || (items.length > 1 && !different)) {
            let item = items[0];
            if (item !== undefined) {
                if (item.getCustomExtraData().length === 0)
                    createNewExtraDataInputField(items, 0, '', '', false);
                else {
                    for (let i = 0; i < item.getCustomExtraData().length; i++) {
                        if (item.getCustomExtraData()[i] !== undefined) {
                            createNewExtraDataInputField(items, i, item.getCustomExtraData()[i][0], item.getCustomExtraData()[i][1], false)
                        }
                    }
                }
            }
        }
    };

    /**
     * Create a new input fields in the edit blockchain zone.
     *
     * @param item {ListItem} The list item we are editing
     * @param index {Number} The index of the last input field created
     * @param key {String} The default value for the key input field
     * @param value {String} The default value for the value input field
     */
    let createNewExtraDataInputField = function (items, index, key, value, isDiff) {
        let placeholder = 'Enter your data here';
        if (isDiff)
            placeholder = '< Different >';
        $("#fileBlockchainEditExtraDataTable").append(
            "<tr id='inputRowExtra" + index + "'>\n" +
            "<th><input class='form-control' id='inputKeyExtra" + index + "' type='text' placeholder='" + placeholder + "'></th>\n" +
            "<td><textarea class='form-control' id='inputValueExtra" + index + "' placeholder='" + placeholder + "'></textarea></td>\n" +
            "<td><button class='btn btn-danger delete-extra-button' id='inputDeleteExtra" + index + "'" +
            " data-toggle='tooltip' data-placement='bottom' title='Delete this row'>" +
            "<i class='fas fa-trash'></i></button></td>\n" +
            "</tr>");
        let inputKey = $("#inputKeyExtra" + index);
        let inputValue = $("#inputValueExtra" + index);
        $("#inputDeleteExtra" + index).on('click', function () {
            for (let i = 0; i < items.length; i++) {
                items[i].setCustomExtraData(index, undefined);
            }
            $("#inputRowExtra" + index).remove();
        });
        inputKey.val(key);
        inputValue.val(value);
        if (!isDiff) {
            for (let i = 0; i < items.length; i++) {
                items[i].setCustomExtraData(index, [key, value]);
            }
        }
        inputKey.on('change keyup paste', function () {
            for (let i = 0; i < items.length; i++) {
                if (isDiff)
                    items[i].clearCustomExtraData();
                items[i].setCustomExtraData(index, [inputKey.val(), inputValue.val()]);
                console.log(items.length);
            }
        });
        inputValue.on('change keyup paste', function () {
            for (let i = 0; i < items.length; i++) {
                if (isDiff)
                    items[i].clearCustomExtraData();
                items[i].setCustomExtraData(index, [inputKey.val(), inputValue.val()]);
            }
        });
    };

    /**
     * Setup event handlers for blockchain edit buttons
     * @param item {ListItem} The list item we are editing
     */
    let setupExtraDataControlButtons = function (items) {
        // Set event handlers
        $("#editExtraDataAddButton").off('click').on('click', function () { // Reset event handler
            if (items.length === 1 || !isCustomExtraDataDifferent(items)) {
                createNewExtraDataInputField(items, items[0].getCustomExtraData().length, '', '', false);
            } else  {
                createNewExtraDataInputField(items, 1, '', '', false);
            }
        });
        $("#editExtraDataClearButton").off('click').on('click', function () { // Reset event handlers
            $("#fileBlockchainEditExtraDataTable").html('');
            for (let i = 0; i < items.length; i++) {
                items[i].clearCustomExtraData();
            }
            createNewExtraDataInputField(items, 0, '', '', false);
        });
    };

    let setBlockchainInfoMessage = function (items) {
        let message = undefined;
        if (items.length === 1)
            message = _blockchainErrorMsg.get(UI.getCurrentAppMode()).get(items[0].getType())
        if (message !== undefined)
            setBlockchainInfoErrorText(message[0], message[1]);
        else
            setBlockchainInfoErrorText('', COLOR_CLASSES.none);
    };

    let setBlockchainInfoErrorText = function (text, color) {
        $('#fileBlockchainInfoEmptyText').html(text);
        setDOMColor($('#fileBlockchainInfoCard'), color);
    };

}