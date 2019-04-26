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
            '<p class="text-center text-muted file-specific-info">\n' +
            '<span>Last Modified: </span>\n' +
            '<span id="fileDateProp">##DATE</span>\n' +
            '</p>\n' +
            '<textarea id="itemTextInput" class="form-control" rows="5" placeholder="Enter your text here..."></textarea>\n' +
            '<input id="itemHashInput" class="form-control" placeholder="Enter your hash here...">\n' +
            '<p class="text-muted" id="itemHashContainer"><span id="itemHashType"></span><span\n' +
            'id="itemHashProp">HASH</span>\n' +
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
        itemPropPopup.onOpenBefore = function() {
            $('textarea').autoResize();
            $('#itemHashType').text(getHashAlgorithm() + ': ');
            UI.getItemDetailsManager().setupItemPopup(item);
        };
        let type = getJConfirmTypeFromColorCLass(item.getCardColor());
        let btnType = '';
        if (type !== '')
            btnType = 'btn-' + type;
        let icon = '';
        let title = '';
        if (UI.getCurrentTab() === TAB_TYPE.file) {
            icon = getMimeTypeIcon(item.getFile());
            title = item.getFile().name + ' <span class="text-muted">(' + humanFileSize(item.getFile().size) + ')</span>';
        } else if (UI.getCurrentTab() === TAB_TYPE.text) {
            icon = 'fas fa-align-left';
            title = item.getTitle();
        } else {
            icon = 'fas fa-hashtag';
            title = item.getTitle();
        }
        itemPropPopup.buttons = {
            ok: {
                keys: ['enter'],
                btnClass: btnType,
                action: function () {
                    item.setSelected(false);
                }
            },
        };
        itemPropPopup.icon = icon;
        itemPropPopup.title = title;
        itemPropPopup.type = type;
        itemPropPopup.open();
    };

    this.setupItemPopup = function (item) {
        setBlockchainInfoErrorText('', COLOR_CLASSES.none); // reset color
        if (item !== undefined) {
            let file = undefined;
            if (UI.getCurrentTab() === TAB_TYPE.file)
                file = item.getFile();
            fillFileProp(file);
            setupItemInputFields(item);
            fillReservedFields(item);
            // Display blockchain edit fields if the item has no signatures
            if (UI.getCurrentAppMode() === APP_MODE.sign && UI.getCurrentUIState() === UI_STATE.fetched
                && item.getType() === TypeElement.Fake && item.getNumSign() === 0) {
                logMe(UIManagerPrefix, 'Displaying Blockchain edit fields', TypeInfo.Info);
                $("#fileBlockchainInfoCard").show();
                $('#fileBlockchainInfoZone').hide();
                $('#fileBlockchainEditInfoZone').show();
                // Reset table
                $("#fileBlockchainEditExtraDataTable").html('');
                setupSourceInputField(item);
                createDocFamilyDropDown(item);
                createSavedInputFields(item);
                setupExtraDataControlButtons(item);
            } else if (item.getInformation() !== undefined && item.getInformation().size) {
                $("#fileBlockchainInfoCard").show();
                $('#fileBlockchainInfoZone').show();
                $('#fileBlockchainEditInfoZone').hide();
                fillBlockchainInfoFields(item);
                if (item.getExtraData() !== undefined && item.getExtraData().size)
                    fillBlockchainExtraDataFields(item);
                else
                    $("#fileBlockchainExtraDataZone").hide();
            } else {
                // No blockchain information to display
                $("#fileBlockchainInfoCard").hide();
                $('#fileBlockchainInfoZone').hide();
                $('#fileBlockchainEditInfoZone').hide();
                setBlockchainInfoMessage(item);
            }
        }
        $('[data-toggle="tooltip"]').tooltip(); // Enable created tooltips
    };

    /**
     * Fill in the file property fields if we have a valid file
     *
     * @param file {File} The file to display information from
     */
    let fillFileProp = function (file) {
        if (file !== undefined) { // display file properties only if we have a file
            logMe(UIManagerPrefix, 'Displaying file properties', TypeInfo.Info);
            let date = new Date(file.lastModified);
            $("#fileDateProp").text(date);
            $(".file-specific-info").show();
        } else
            $(".file-specific-info").hide();
    };

    let fillReservedFields = function (item) {
        // display generic info
        if (UI.getCurrentTab() !== TAB_TYPE.hash) {
            if (item.getHash() !== '')
                $("#itemHashProp").text(item.getHash());
            else
                $("#itemHashProp").text('not yet calculated');
        } else {
            $('#itemHashContainer').hide();
        }

        if (item.getType() !== TypeElement.Unknown)
            $("#itemStatusProp").text(ITEM_STATE_TEXT[item.getType()]).show();
        else
            $("#itemStatusProp").hide();

        // Set the number of signatures needed
        if (item.getNeededSign() > 0 && item.getType() !== TypeElement.Unknown)
            $("#itemNumSignProp").text(item.getNumSign() + "/" + item.getNeededSign()).show();
        else
            $("#itemNumSignContainer").hide();
        // Set the Tx url if available
        if (item.getTxUrl() !== '')
            $("#itemTxUrlProp").attr('href', item.getTxUrl()).show();
        else
            $("#itemTxUrlProp").hide();
    };

    let setupItemInputFields = function (item) {
        if (!(item instanceof FileListItem)) {
            if (item instanceof TextListItem) {
                $("#itemHashInput").hide();
                $("#itemTextInput").off('change keyup paste').val(item.getText()).on('change keyup paste', function () { // Remove previous event handlers
                    item.setText($("#itemTextInput").val());
                    if (item.getType() !== TypeElement.Unknown) {
                        item.reset();
                        item.setHash('');
                        UI.displayFileProps(item.getIndex());
                        UI.resetProgress();
                        UI.setUIButtonState(UI_STATE.none);
                    }
                }).show();
            } else { // We have a hash
                $("#itemTextInput").hide();
                $("#itemHashInput").off('change keyup paste').val(item.getHash()).on('change keyup paste', function () { // Remove previous event handlers
                    item.setHash($("#itemHashInput").val());
                    if (item.getType() !== TypeElement.Unknown) {
                        item.reset();
                        UI.displayFileProps(item.getIndex());
                        UI.resetProgress();
                        UI.setUIButtonState(UI_STATE.none);
                    }
                }).show();
            }
        } else {
            $("#itemTextInput").hide();
            $("#itemHashInput").hide();
        }
    };

    let fillBlockchainInfoFields = function (item) {
        logMe(UIManagerPrefix, 'Displaying Blockchain information', TypeInfo.Info);
        $('#fileBlockchainDate').text('Signed on ' + item.getInformation().get(elementReservedKeys.date));
        if (item.getInformation()[elementReservedKeys.source] !== '')
            $('#fileBlockchainSource').text('No source provided.');
        else
            $('#fileBlockchainSource').text('Source: ' + item.getInformation().get(elementReservedKeys.date));

        let family = getCompatibleFamily()[item.getInformation().get(elementReservedKeys.documentFamily)]; // Get the document family string
        $('#fileBlockchainFamily').text('Signed as:' + family);
    };

    let fillBlockchainExtraDataFields = function (item) {
        $("#fileBlockchainExtraDataZone").show();
        // Reset table
        let extraDataTable = $("#fileBlockchainExtraDataTable");
        extraDataTable.html('');
        let counter = 0;
        for (let [key, value] of item.getExtraData()) {
            counter++;
            extraDataTable.append(
                "<tr>\n" +
                "<th scope='row' id='blockchainExtraFieldKey" + counter + "'></th>\n" +
                "<td id='blockchainExtraFieldValue" + counter + "'></td>\n" +
                "</tr>");
            $("#blockchainExtraFieldKey" + counter).text(key);
            $("#blockchainExtraFieldValue" + counter).text(value); // Prevent XSS
        }
    };

    let setBlockchainInfoMessage = function (item) {
        let message = _blockchainErrorMsg.get(UI.getCurrentAppMode()).get(item.getType());
        if (message !== undefined)
            setBlockchainInfoErrorText(message[0], message[1]);
        else
            setBlockchainInfoErrorText('', COLOR_CLASSES.none);
    };

    let setBlockchainInfoErrorText = function (text, color) {
        $('#fileBlockchainInfoEmptyText').html(text);
        setDOMColor($('#fileBlockchainInfoCard'), color);
    };

    /**
     *
     * @param item {ListItem}
     */
    let setupSourceInputField = function (item) {
        let sourceInput = $("#infoSourceInput");
        if (item.getInformation().has(elementReservedKeys.source))
            sourceInput.val(item.getInformation().get(elementReservedKeys.source));
        else
            sourceInput.val('');

        sourceInput.off('change keyup paste').on('change keyup paste', function () { // reset callback
            let val = $("#infoSourceInput").val();
            if (val !== '')
                item.getInformation().set(elementReservedKeys.source, val);
            else
                item.getInformation().delete(elementReservedKeys.source);
        });
    };

    /**
     * Generate the dropdown menu based on kernel document family.
     *
     * @param item {ListItem} The item we are editing
     */
    let createDocFamilyDropDown = function (item) {
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
                if (i !== 0)
                    item.getInformation().set(elementReservedKeys.documentFamily, i);
                else
                    item.getInformation().delete(elementReservedKeys.documentFamily);
            });
        }
        // Set default value
        if (item.getInformation().has(elementReservedKeys.documentFamily))
            dropdownButton.text(docFamilyArray[item.getInformation().get(elementReservedKeys.documentFamily)]);
        else
            dropdownButton.text(docFamilyArray[0]);
    };

    /**
     * Create input fields with values from the item.
     * @param item {ListItem} The list item to take values from
     */
    let createSavedInputFields = function (item) {
        item.clearCustomExtraData();
        $('#fileBlockchainEditExtraDataTable').html(''); // Clear the list to recreate it
        if (item.getCustomExtraData().length === 0)
            createNewInputFields(item, 0, '', '');
        else {
            for (let i = 0; i < item.getCustomExtraData().length; i++) {
                if (item.getCustomExtraData()[i] !== undefined) {
                    createNewInputFields(item, i, item.getCustomExtraData()[i][0], item.getCustomExtraData()[i][1])
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
    let createNewInputFields = function (item, index, key, value) {
        $("#fileBlockchainEditExtraDataTable").append(
            "<tr id='inputRowExtra" + index + "'>\n" +
            "<th><input class='form-control' id='inputKeyExtra" + index + "' type='text' placeholder='Enter a key'></th>\n" +
            "<td><textarea class='form-control' id='inputValueExtra" + index + "' placeholder='Enter a value'></textarea></td>\n" +
            "<td><button class='btn btn-danger delete-extra-button' id='inputDeleteExtra" + index + "'" +
            " data-toggle='tooltip' data-placement='bottom' title='Delete this row'>" +
            "<i class='fas fa-trash'></i></button></td>\n" +
            "</tr>");
        let inputKey = $("#inputKeyExtra" + index);
        let inputValue = $("#inputValueExtra" + index);
        $("#inputDeleteExtra" + index).on('click', function () {
            item.setCustomExtraData(index, undefined);
            $("#inputRowExtra" + index).remove();
        });
        inputKey.val(key);
        inputValue.val(value);
        item.setCustomExtraData(index, [key, value]);
        inputKey.on('change keyup paste', function () {
            item.setCustomExtraData(index, [inputKey.val(), inputValue.val()]);
        });
        inputValue.on('change keyup paste', function () {
            item.setCustomExtraData(index, [inputKey.val(), inputValue.val()]);
        });
    };

    /**
     * Setup event handlers for blockchain edit buttons
     * @param item {ListItem} The list item we are editing
     */
    let setupExtraDataControlButtons = function (item) {
        // Set event handlers
        $("#editExtraDataAddButton").off('click').on('click', function () { // Reset event handler
            createNewInputFields(item, item.getCustomExtraData().length, '', '');
        });
        $("#editExtraDataClearButton").off('click').on('click', function () { // Reset event handlers
            for (let i = 0; i < item.getCustomExtraData().length; i++) {
                if (item.getCustomExtraData()[i] !== undefined)
                    $("#inputRowExtra" + i).remove();
            }
            item.clearCustomExtraData();
            createNewInputFields(item, 0, '', '');
        });
    };
}