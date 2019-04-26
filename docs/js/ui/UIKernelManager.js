function UIKernelManager() {
    let _isKernelConnected = false; // Is the user connected to a valid kernel ?
    let _currentKernelInfo = new Map();
    let _currentKernelAddress = ""; // The current kernel address the user is connected to

    this.isConnected = function () {
        return _isKernelConnected;
    };

    this.setConnected = function (val) {
        _isKernelConnected = val;
    };

    this.getCurrentAddress = function () {
        return _currentKernelAddress;
    };

    this.setCurrentAddress = function (val) {
        _currentKernelAddress = val;
    };

    this.showKernelInfo = function () {
        $.alert({
            title: 'Kernel Information',
            content: '<div class="row" id="kernelInfoZone">\n' +
                '<div class="col" id="kernelInfoCol">\n' +
                '<div class="mr-4" id="kernelImgContainer">\n' +
                '<img class="my-auto" src="images/img_placeholder.jpg" alt="Kernel Image"\n' +
                'id="kernelImg">\n' +
                '</div>\n' +
                '<div class="pl-4 border-left border-dark" id="kernelInfoText">\n' +
                '<h4 id="kernelName">Kernel Info</h4>\n' +
                '<p id="kernelOrganization">#ORGA</p>\n' +
                '<p id="kernelPhoneContainer">\n' +
                '<i class="fas fa-phone" style="width: 20px"></i>\n' +
                '<span id="kernelPhone">#PHONE</span>\n' +
                '</p>\n' +
                '<p id="kernelAddressContainer">\n' +
                '<i class="fas fa-map-marker-alt" style="width: 20px"></i>\n' +
                '<a id="kernelAddress" href="" target="_blank">#Address</a>\n' +
                '</p>\n' +
                '<p id="kernelUrlContainer">\n' +
                '<i class="fas fa-globe" style="width: 20px"></i>\n' +
                '<a href="" target="_blank" id="kernelUrl"></a>\n' +
                '</p>\n' +
                '<p id="kernelMailContainer">\n' +
                '<i class="fas fa-envelope" style="width: 20px"></i>\n' +
                '<a href="" id="kernelMail"></a>\n' +
                '</p>\n' +
                '<p class="text-muted" id="kernelVersion"></p>\n' +
                '</div>\n' +
                '</div>\n' +
                '<div class="col" id="kernelAdditionalInfoZone">\n' +
                '<h4 class="text-center">Additional Information</h4>\n' +
                '<table class="table">\n' +
                '<tbody id="kernelExtraDataTable">\n' +
                '</tbody>\n' +
                '</table>\n' +
                '</div>\n' +
                '</div>',
            type: 'blue',
            theme: JQUERY_CONFIRM_THEME,
            columnClass: 'xlarge',
            icon: 'fas fa-info-circle',
            escapeKey: 'ok',
            typeAnimated: true,
            onOpenBefore: function () {
                setKernelReservedFields(_currentKernelInfo);
                setKernelExtraData(_currentKernelInfo);
            },
        });
    };

    /**
     * Show a dialog to enter a new kernel address
     */
    this.showKernelInput = function () {
        let checkedAttr = UI.getCurrentAppMode() === APP_MODE.sign ? 'checked' : '';
        $.confirm({
            title: 'Change kernel address',
            content: '' +
                '<form>' +
                '<div class="form-group">' +
                '<label>Current kernel address:</label>' +
                '<label>' + _currentKernelAddress + '</label>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>New kernel address:</label>' +
                '<input  type="text" class="form-control"' +
                ' id="kernelInput"' +
                ' placeholder="Enter Address Here"/>' +
                '</div>' +
                '</form>' +
                '<div class="custom-control form-control-lg custom-checkbox">' +
                '    <input type="checkbox" class="custom-control-input" id="enableSignButton"' + checkedAttr + '>' +
                '    <label class="custom-control-label" for="enableSignButton">Enable signing for this kernel</label>' +
                '</div>',
            type: 'blue',
            theme: JQUERY_CONFIRM_THEME,
            columnClass: 'medium',
            icon: 'fas fa-edit',
            escapeKey: 'cancel',
            typeAnimated: true,
            onContentReady: function () {
                // when content is fetched & rendered in DOM
                $("#kernelInput").focus(); // Focus the input for faster copy/paste
            },
            buttons: {
                formSubmit: {
                    text: 'Connect',
                    btnClass: 'btn-blue',
                    keys: ['enter'],
                    action: function () {
                        let address = this.$content.find('#kernelInput').val();
                        if (address === '') {
                            $.alert({
                                    title: 'error',
                                    content: 'Please enter a value',
                                    type: 'red',
                                    theme: JQUERY_CONFIRM_THEME,
                                    icon: 'fas fa-exclamation',
                                    escapeKey: 'ok',
                                    typeAnimated: true,
                                }
                            );
                            return false;
                        }
                        if (this.$content.find('#enableSignButton').is(':checked')) {
                            $.selector_cache("#signTab").show();
                            UI.setUIMode(APP_MODE.sign, false);
                        }
                        _currentKernelAddress = address;
                        UI.connectToKernel();
                    }
                },
                cancel: function () {
                    //close
                },
            },
        });
    };

    /**
     * Enable or disable the kernel connecting UI.
     *
     * @param state {Boolean} Whether to enable the UI
     */
    this.setKernelConnectionLoading = function (state) {
        logMe(UIManagerPrefix, 'Setting kernel connecting UI to: ' + state, TypeInfo.Info);
        UI.setConnectionButtonLockedState(state);
        UI.updateCheckButtonState();
        if (state) { // Instantly display connecting
            _isKernelConnected = false;
            UI.updateMainUIState();
            $.selector_cache('#kernelConnectedAddress').html('Connection in progress...');
            setDOMColor($.selector_cache('#kernelInfoHeader'), COLOR_CLASSES.secondary);
            $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
            $.selector_cache('#kernelConnectionLoadingIcon').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
            this.setKernelInfo(undefined, TypeInfo.Info);
        } else {
            $.selector_cache('#kernelConnectionLoadingIcon').attr('class', 'fas fa-arrow-right');
        }
    };

    /**
     * Fill the kernel info table with information from result.
     * Display an error if result is undefined.
     *
     * @param result {Map} Result dictionary or undefined to use the error text.
     * @param errorType {TypeInfo} Type of the error.
     */
    this.setKernelInfo = function (result, errorType) {
        $.selector_cache('#kernelInputForm').hide();
        $.selector_cache('#kernelLoadingIcon').hide();
        if (result !== undefined) {
            logMe(UIManagerPrefix, 'Setting kernel info', TypeInfo.Info);
            $.selector_cache('#kernelInfoZone').show();
            $.selector_cache('#kernelInfoEmptyZone').hide();
            $.selector_cache('#kernelConnectionEditButton').show();
            $.selector_cache('#kernelConnectionShowMoreButton').show();
            $.selector_cache('#kernelConnectionShareButton').show();
            _currentKernelInfo = result;
            setKernelConnectedAddress(result);
        } else {
            $.selector_cache('#kernelInfoZone').hide();
            $.selector_cache('#kernelInfoEmptyZone').show();
            $.selector_cache('#kernelConnectionEditButton').hide();
            $.selector_cache('#kernelConnectionShowMoreButton').hide();
            $.selector_cache('#kernelConnectionShareButton').hide();

            let errorText = "Not connected";
            switch (errorType) {
                case TypeInfo.Warning:
                    errorText = 'Connection could not be verified by moderator';
                    $.selector_cache('#kernelConnectionEditButton').show();
                    $.selector_cache('#kernelConnectionShareButton').show();
                    break;
                case TypeInfo.Critical:
                    errorText = 'Connection could not be established, please enter a valid address below:';
                    $.selector_cache('#kernelConnectionEditButton').show();
                    $.selector_cache('#kernelInputForm').show();
                    break;
                case TypeInfo.Info:
                    errorText = 'Loading...';
                    $.selector_cache('#kernelLoadingIcon').show();
                    break;
                default:
                    errorText = 'Not connected, please enter a kernel address below';
                    $.selector_cache('#kernelConnectionEditButton').show();
                    $.selector_cache('#kernelInputForm').show();
                    break;
            }
            this.updateKernelButtonsState();
            $.selector_cache("#kernelInfoEmptyText").html(errorText);
        }
    };

    /**
     * Display kernel buttons linking to moderator if the user is an operator of the current kernel
     */
    this.updateKernelButtonsState = function () {
        if (UI.isAccountOperator() && _isKernelConnected)
            $.selector_cache("#kernelButtons").show();
        else
            $.selector_cache("#kernelButtons").hide();
    };

    /**
     * Set the value for the reserved Kernel fields
     *
     * @param kernelInfo {Map} The information received from backend
     */
    let setKernelReservedFields = function (kernelInfo) {
        if (kernelInfo.has(kernelReservedKeys.img) && kernelInfo.get(kernelReservedKeys.img) !== "") {
            $("#kernelImg").attr('src', kernelInfo.get(kernelReservedKeys.img)).hide();
            onImgLoad("#kernelImg", function () {
                $("#kernelImg").fadeIn('fast');
            });
        }

        if (kernelInfo.has(kernelReservedKeys.name) && kernelInfo.get(kernelReservedKeys.name) !== "")
            $("#kernelName").text(kernelInfo.get(kernelReservedKeys.name));
        else
            $("#kernelName").text(kernelInfo.get('Kernel Information'));

        if (kernelInfo.has(kernelReservedKeys.isOrganisation) && kernelInfo.get(kernelReservedKeys.isOrganisation) === true)
            $("#kernelOrganization").text('This entity is an organization');
        else
            $("#kernelOrganization").text('This entity is not an organization');

        if (kernelInfo.has(kernelReservedKeys.phone) && kernelInfo.get(kernelReservedKeys.phone) !== '')
            $("#kernelPhone").text(kernelInfo.get(kernelReservedKeys.phone));
        else
            $("#kernelPhoneContainer").hide();

        if (kernelInfo.has(kernelReservedKeys.physicalAddress) && kernelInfo.get(kernelReservedKeys.physicalAddress) !== '') {
            $("#kernelAddress").text(kernelInfo.get(kernelReservedKeys.physicalAddress)).attr('href', OSM_QUERY_LINK + kernelInfo.get(kernelReservedKeys.physicalAddress));
        } else
            $("#kernelAddressContainer").hide();

        if (kernelInfo.has(kernelReservedKeys.url) && kernelInfo.get(kernelReservedKeys.url) !== "") {
            $("#kernelUrl").attr('href', kernelInfo.get(kernelReservedKeys.url)).text(kernelInfo.get(kernelReservedKeys.url));
        } else
            $("#kernelUrlContainer").hide();

        if (kernelInfo.has(kernelReservedKeys.mail) && kernelInfo.get(kernelReservedKeys.mail) !== "") {
            $("#kernelMail").attr('href', 'mailto:' + kernelInfo.get(kernelReservedKeys.mail)).text(kernelInfo.get(kernelReservedKeys.mail));
        } else
            $("#kernelMailContainer").hide();

        if (kernelInfo.has(kernelReservedKeys.version) && kernelInfo.get(kernelReservedKeys.version) !== "")
            $("#kernelVersion").text('Version ' + kernelInfo.get(kernelReservedKeys.version));
        else
            $("#kernelVersion").hide();
    };

    /**
     * Set the extra data for the kernel
     *
     * @param kernelInfo {Map} The information received from backend
     */
    let setKernelExtraData = function (kernelInfo) {
        if (kernelInfo.get(kernelReservedKeys.extraData) !== undefined && kernelInfo.get(kernelReservedKeys.extraData).size) {
            let $kernelExtraDataTable = $("#kernelExtraDataTable");
            for (let [key, value] of kernelInfo.get(kernelReservedKeys.extraData)) {
                $kernelExtraDataTable.append(
                    "<tr>\n" +
                    "<th scope='row'>" + capitalizeFirstLetter(key) + "</th>\n" +
                    "<td>" + value + "</td>\n" +
                    "</tr>");
            }
        } else
            $("#kernelAdditionalInfoZone").hide();
    };

    /**
     * Set the current connected kernel name, or address if not referenced by moderator
     *
     * @param kernelInfo {Map} The information received from backend
     */
    let setKernelConnectedAddress = function (kernelInfo) {
        if (kernelInfo.has(kernelReservedKeys.name)) {
            $.selector_cache('#kernelConnectedAddress').html("Currently connected to : <strong><span id='moderatorName'></span></strong>");
            $('#moderatorName').text(kernelInfo.get(kernelReservedKeys.name));

        } else
            $.selector_cache('#kernelConnectedAddress').text("Currently connected to : '" + _currentKernelAddress + "'");
    };
}