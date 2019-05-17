function UIModeratorManager() {
    let _defaultModeratorAddress; // The default moderator address
    let _currentModeratorAddress; // The current moderator address the user is connected to
    let _isModeratorConnected = false; // Is the user connected to a valid moderator ?

    this.isConnected = function () {
        return _isModeratorConnected;
    };

    this.setConnected = function (val) {
        _isModeratorConnected = val;
    };

    this.getCurrentAddress = function () {
        return _currentModeratorAddress;
    };

    this.setCurrentAddress = function (val) {
        _currentModeratorAddress = val;
    };

    this.getDefaultAddress = function () {
        return _defaultModeratorAddress;
    };

    this.setDefaultAddress = function (val) {
        _defaultModeratorAddress = val;
    };

    this.isConnectedToDefault = function () {
        return _isModeratorConnected && _currentModeratorAddress === _defaultModeratorAddress;
    };

    this.showModeratorInput = function () {
        let verboseAttr = 'checked';
        if (!UI.getVerbose())
            verboseAttr = '';

        let optimizerAttr = 'checked';
        if (!UI.isOptimizerEnabled())
            optimizerAttr = '';


        let message =
            '<form>' +
            '   <div class="form-group">' +
            '       <label>Current moderator address:</label>' +
            '       <label style="word-break: break-all">' + _currentModeratorAddress + '</label>' +
            '   </div>' +
            '   <div class="form-group">' +
            '       <label>New moderator address:</label>' +
            '       <input  type="text" class="form-control"' +
            '       id="moderatorInput"' +
            '       placeholder="Enter Address Here"/>' +
            '   </div>' +
            '</form>' +
            '<div class="custom-control form-control-lg custom-checkbox">' +
            '    <input type="checkbox" class="custom-control-input" id="verboseButton" ' + verboseAttr + '>' +
            '    <label class="custom-control-label" for="verboseButton">Verbose</label>' +
            '</div>' +
            '<p>Verbose displays messages in the browser console. This can be useful if you want to take part in the development, report bugs, etc.</p>' +
            '<div id="optimizerCheckbox" class="custom-control form-control-lg custom-checkbox">' +
            '    <input type="checkbox" class="custom-control-input" id="optimizerButton" ' + optimizerAttr + '>' +
            '    <label class="custom-control-label" for="optimizerButton">Use optimized signing</label>' +
            '</div>' +
            '<p>Optimized signing allows the app to group elements without information, and create only one transaction. ' +
            'It makes the signing process easier and faster.<br>You can choose to disable it if you want to have one transaction for each item to sign.</p>';

        $.confirm({
            title: 'Advanced Options',
            content: message,
            type: 'orange',
            theme: JQUERY_CONFIRM_THEME,
            columnClass: 'xlarge',
            icon: 'fas fa-cog',
            escapeKey: 'cancel',
            typeAnimated: true,
            onContentReady: function () {
                // when content is fetched & rendered in DOM
                $("#moderatorInput").focus(); // Focus the input for faster copy/paste
            },
            buttons: {
                default: {
                    text: 'Use Default Settings',
                    btnClass: 'btn-green',
                    action: function () {
                        UI.setVerbose(false);
                        UI.setOptimizerEnabled(true);
                        _currentModeratorAddress = _defaultModeratorAddress;
                        UI.connectToModerator();
                    }
                },
                formSubmit: {
                    text: 'Save Settings',
                    btnClass: 'btn-blue',
                    keys: ['enter'],
                    action: function () {
                        let address = this.$content.find('#moderatorInput').val();
                        UI.setVerbose(this.$content.find('#verboseButton').is(':checked'));
                        UI.setOptimizerEnabled(this.$content.find('#optimizerButton').is(':checked'));
                        if (address !== '')
                            showConfirmModerator(address);
                    }
                },
                cancel: function () {
                    // Close
                },
            },
        });
    };

    let showConfirmModerator = function (address) {
        $.confirm({
            title: 'Security consideration',
            content: "Do you really want to change authority?<br/>" +
                "This may lead to security issues. Continue only if you trust the new authority.",
            type: 'orange',
            theme: JQUERY_CONFIRM_THEME,
            columnClass: 'medium',
            icon: 'fas fa-exclamation-triangle',
            escapeKey: 'cancel',
            typeAnimated: true,
            buttons: {
                confirm: {
                    keys: ['enter'],
                    btnClass: 'btn-orange',
                    action: function () {
                        _currentModeratorAddress = address;
                        UI.connectToModerator();
                    }
                },
                cancel: function () {
                    // Close
                }
            }
        });
    };

    /**
     * Enable or disable the moderator connecting UI.
     *
     * @param state {Boolean} Whether to enable the UI
     */
    this.setModeratorConnectionLoading = function (state) {
        logMe(UIManagerPrefix, 'Setting moderator connecting UI to: ' + state, TypeInfo.Info);
        // Disable the input while we connect
        UI.setConnectionButtonLockedState(state);
        UI.updateCheckButtonState();
        if (state) { // Instantly display connecting
            UI.getKernelManager().setConnected(false);
            _isModeratorConnected = false;
            UI.updateMainUIState();
            $.selector_cache('#moderatorConnectedAddress').html('Connection in progress...');
            setDOMColor($.selector_cache('#moderatorInfoHeader'), COLOR_CLASSES.secondary);
        }
        if (state) {
            $.selector_cache('#moderatorConnectionInfoIcon').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
            $.selector_cache('#moderatorConnectionLoadingIcon').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
        } else {
            $.selector_cache('#moderatorConnectionLoadingIcon').attr('class', 'fas fa-arrow-right');
        }
    };

    /**
     * Fill the moderator info table with information.
     * Display an error if info is undefined.
     *
     * @param info {Map} Result Map or undefined to use the error text.
     * @param errorText {String} Error text to display if result is undefined.
     */
    this.setModeratorInfo = function (info, errorText) {
        $.selector_cache("#moderatorInfoBody").fadeOut('fast', function () {
            if (info !== undefined && info.size > 0) {
                logMe(UIManagerPrefix, 'Setting moderator info', TypeInfo.Info);
                $.selector_cache('#moderatorInfoZone').show();
                $.selector_cache('#moderatorInfoEmptyZone').hide();
                // Reserved fields
                if (info.has(moderatorReservedKeys.register))
                    $.selector_cache(".moderator-registration-link").attr('href', info.get(moderatorReservedKeys.register));
                else {
                    $.selector_cache(".moderator-registration-link").hide();
                    logMe(UIManagerPrefix, 'No moderator registration link provided', TypeInfo.Warning);
                }
                if (info.has(moderatorReservedKeys.contact))
                    $.selector_cache(".moderator-contact-link").attr('href', info.get(moderatorReservedKeys.contact));
                else {
                    $.selector_cache(".moderator-contact-link").hide();
                    logMe(UIManagerPrefix, 'No moderator contact link provided', TypeInfo.Warning);
                }
                if (info.has(moderatorReservedKeys.search))
                    $.selector_cache(".moderator-search-link").attr('href', info.get(moderatorReservedKeys.search));
                else {
                    $.selector_cache(".moderator-search-link").hide();
                    logMe(UIManagerPrefix, 'No moderator search link provided', TypeInfo.Warning);
                }

                // Other fields
                let $moderatorInfoTable = $.selector_cache("#moderatorInfoTable");
                let isInfoEmpty = true;
                for (let [key, value] of info) {
                    if (!isValueInObject(key, moderatorReservedKeys)) {
                        isInfoEmpty = false;
                        $moderatorInfoTable.append(
                            "<tr>\n" +
                            "<th scope='row'>" + capitalizeFirstLetter(key) + "</th>\n" +
                            "<td>" + value + "</td>\n" +
                            "</tr>");
                    }
                }
                if (isInfoEmpty)
                    $.selector_cache("#moderatorAdditionalInfoZone").hide();
            } else {
                $.selector_cache('#moderatorInfoZone').hide();
                $.selector_cache('#moderatorInfoEmptyZone').show();
                $.selector_cache("#moderatorInfoEmptyText").html(errorText);
            }
            $.selector_cache("#moderatorInfoBody").fadeIn('fast');
        });
    };


}