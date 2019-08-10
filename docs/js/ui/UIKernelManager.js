let KERNEL_CONNECTION_TYPE = {
    connected: 1,
    loading: 2,
    error: 3,
    notConnected: 4,
};

let KERNEL_REFERENCEMENT_STATUS = {
    referenced: 0,
    notReferenced: 1,
    initialized: 2,
    revoked: 3,
    error: 4,
};

function UIKernelManager() {
    let _isKernelConnected = false; // Is the user connected to a valid kernel ?
    let _currentKernelIdentity = {};
    let _currentKernelAddress = ""; // The current kernel address the user is connected to
    let _currentKernelConfig = {};

    let kernelInfoDOM = '<div class="row" id="kernelInfoZone">\n' +
        '<div class="col-lg" id="kernelInfoCol">\n' +
        '<div class="col-lg" id="kernelImgContainer">' +
        '<img class="my-auto" src="images/img_placeholder.jpg" alt="Kernel Image"\n' +
        'id="kernelImg">\n' +
        '</div>\n' +
        '<div class="col-lg border-left border-dark" id="kernelInfoText">\n' +
        '<h4 id="kernelName">Kernel Info</h4>\n' +
        '<p id="kernelOrganization">#ORGA</p>\n' +
        '<p id="kernelPhoneContainer">\n' +
        '<i class="fas fa-phone" style="width: 20px"></i>\n' +
        '<span id="kernelPhone">#PHONE</span>\n' +
        '</p>\n' +
        '<p id="kernelPhysicalAddressContainer">\n' +
        '<i class="fas fa-map-marker-alt" style="width: 20px"></i>\n' +
        '<a id="kernelPhysicalAddress" href="" target="_blank">#Address</a>\n' +
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
        '<div class="col-lg" id="kernelAdditionalInfoZone">\n' +
        '<h4 class="text-center">Additional Information</h4>\n' +
        '<table class="table">\n' +
        '<tbody id="kernelExtraDataTable">\n' +
        '</tbody>\n' +
        '</table>\n' +
        '</div>\n' +
        '</div>';

    let kernelInfoWarningDOM = '<div class="container-fluid text-muted d-flex" style="height: 100%;">\n' +
        '<div class="container-fluid justify-content-center align-self-center text-center" style="margin: auto">\n' +
        '<div class="text-muted">\n' +
        '<h3>Connection could not be verified by moderator</h3>\n' +
        '</div>' +
        '<div id="kernelButtons" class="mt-4" style="display: none">\n' +
        '<h4 class="mb-4">Moderator Links:</h4>\n' +
        '<a class="moderator-registration-link" target="_blank" href="">\n' +
        '<button class="btn btn-primary btn-lg">\n' +
        '<i class="fas fa-sign-in-alt" style="width: 25px"></i>\n' +
        'Register\n' +
        '</button>\n' +
        '</a>\n' +
        '<a class="moderator-contact-link" target="_blank" href="">\n' +
        '<button class="btn btn-primary btn-lg">\n' +
        '<i class="fas fa-at" style="width: 25px"></i>\n' +
        'Contact\n' +
        '</button>\n' +
        '</a>' +
        '</div>' +
        '</div>' +
        '</div>';

    /**
     * If we are connected to the current kernel. If this is false, every other information can be ignored
     * @return {boolean}
     */
    this.isConnected = function () {
        return _isKernelConnected;
    };

    /**
     * Set the connected state of the current kernel
     * @param val {boolean}
     */
    this.setConnected = function (val) {
        _isKernelConnected = val;
    };

    /**
     * Get the current Kernel address
     * @return {string}
     */
    this.getCurrentAddress = function () {
        return _currentKernelAddress;
    };

    /**
     * The set current kernel address
     * @param val {string}
     */
    this.setCurrentAddress = function (val) {
        _currentKernelAddress = val;
    };

    /**
     * Set the current kernel identity.
     * Must receive a KernelIdentity Object from ULCDoc API
     * @param kernelIdentity {KernelIdentity}
     */
    this.setCurrentKernelIdentity = function (kernelIdentity) {
        _currentKernelIdentity = kernelIdentity;
    };

    /**
     * Get the current kernel Identity.
     * Returns a KernelIdentity Object form ULCDoc API
     * @return {KernelIdentity}
     */
    this.getCurrentKernelIdentity = function () {
        return _currentKernelIdentity;
    };

    /**
     * Set the current kernel configuration.
     * Must receive a KernelConfig Object form ULCDoc API
     * @param kernelConfig {KernelConfig}
     */
    this.setCurrentKernelConfig = function (kernelConfig) {
        _currentKernelConfig = kernelConfig;
    };

    /**
     * Get the current kernel configuration.
     * Returns a KernelConfig Object from ULCDoc API
     * @returns  {KernelConfig}
     */
    this.getCurrentKernelConfig = function () {
        return _currentKernelConfig;
    };

    /**
     * Get the current kernel status depending on information in it's kernel identity object.
     * @return {KERNEL_REFERENCEMENT_STATUS}
     */
    this.getKernelStatus = function() {
        let status = KERNEL_REFERENCEMENT_STATUS.error;

        if (_currentKernelIdentity !== undefined) {
            if (_currentKernelIdentity.initialized && _currentKernelIdentity.confirmed && !_currentKernelIdentity.revoked)
                status = KERNEL_REFERENCEMENT_STATUS.referenced;
            else if (_currentKernelIdentity.initialized && _currentKernelIdentity.confirmed && _currentKernelIdentity.revoked)
                status = KERNEL_REFERENCEMENT_STATUS.revoked;
            else if (_currentKernelIdentity.initialized && !_currentKernelIdentity.confirmed)
                status = KERNEL_REFERENCEMENT_STATUS.initialized;
            else if (!_currentKernelIdentity.initialized)
                status = KERNEL_REFERENCEMENT_STATUS.notReferenced;
        }
        return status;
    };

    /**
     * Set current kernel info box to display information or a warning
     */
    this.fillKernelIdentity = function () {
        if (this.getKernelStatus() === KERNEL_REFERENCEMENT_STATUS.referenced) {
            $.selector_cache('#kernelInfoContainer').html(kernelInfoDOM);
            setKernelReservedFields(_currentKernelIdentity);
            setKernelExtraData(_currentKernelIdentity);
        } else
            $.selector_cache('#kernelInfoContainer').html(kernelInfoWarningDOM);
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
                '<div class="form-group" id="currentAddressForm">' +
                '<label>Current kernel address: </label>' +
                '<br>' +
                '<label style="word-break: break-all">' + _currentKernelAddress + '</label>' +
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
            columnClass: 'xlarge',
            icon: 'fas fa-edit',
            escapeKey: 'cancel',
            typeAnimated: true,
            onOpenBefore: function () {
                if (_currentKernelAddress === '')
                    $('#currentAddressForm').hide();
            },
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
                        UI.tryKernelConnection(_currentKernelAddress);
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
            $.selector_cache('#kernelConnectionInfoIcon').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
            $.selector_cache('#kernelConnectionLoadingIcon').attr('class', 'fas fa-circle-notch fa-spin fa-fw');
            this.setKernelInfoBox(KERNEL_CONNECTION_TYPE.loading);
        } else {
            $.selector_cache('#kernelConnectionLoadingIcon').attr('class', 'fas fa-arrow-right');
        }
    };

    /**
     * Fill the kernel info table with information from result.
     *
     * @param kernelConnectionStatus {KERNEL_CONNECTION_TYPE} he connection type to set the UI in
     */
    this.setKernelInfoBox = function (kernelConnectionStatus) {
        $.selector_cache('#kernelInputForm').hide();
        $.selector_cache('#kernelLoadingIcon').hide();
        if (kernelConnectionStatus === KERNEL_CONNECTION_TYPE.connected) {
            logMe(UIManagerPrefix, 'Setting kernel info', TypeInfo.Info);
            $.selector_cache('#kernelInfoZone').show();
            $.selector_cache('#kernelInfoEmptyZone').hide();
            $.selector_cache('#kernelConnectionEditButton').show();
            $.selector_cache('#kernelConnectionShowMoreButton').show();
            $.selector_cache('#kernelConnectionShareButton').show();

            setCurrentKernelConnectedAddress();
        } else { // kernel is not connected
            $.selector_cache('#kernelInfoZone').hide();
            $.selector_cache('#kernelInfoEmptyZone').show();
            $.selector_cache('#kernelConnectionEditButton').hide();
            $.selector_cache('#kernelConnectionShowMoreButton').hide();
            $.selector_cache('#kernelConnectionShareButton').hide();
            let errorText = "";
            switch (kernelConnectionStatus) {
                case KERNEL_CONNECTION_TYPE.error:
                    errorText = 'Connection could not be established, please enter a valid address below:';
                    $.selector_cache('#kernelConnectionEditButton').show();
                    $.selector_cache('#kernelInputForm').show();
                    break;
                case KERNEL_CONNECTION_TYPE.loading:
                    errorText = 'Loading...';
                    $.selector_cache('#kernelLoadingIcon').show();
                    break;
                case KERNEL_CONNECTION_TYPE.notConnected:
                    errorText = 'Not connected, please enter a kernel address below';
                    $.selector_cache('#kernelConnectionEditButton').show();
                    $.selector_cache('#kernelInputForm').show();
                    break;
            }
            $.selector_cache("#kernelInfoEmptyText").html(errorText);
            this.updateKernelButtonsState();
        }
        this.fillKernelIdentity();
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
     * @param kernelInfo {Object} The information received from backend
     */
    let setKernelReservedFields = function (kernelInfo) {
        if (kernelInfo.imageURL !== undefined && kernelInfo.imageURL !== '') {
            $("#kernelImg").attr('src', kernelInfo.imageURL).hide();
            onImgLoad("#kernelImg", function () {
                $("#kernelImg").fadeIn('fast');
            });
        }

        if (kernelInfo.name !== undefined && kernelInfo.name !== "")
            $("#kernelName").text(kernelInfo.name);
        else
            $("#kernelName").text('Kernel Information');

        if (kernelInfo.organization !== undefined && kernelInfo.organization === true)
            $("#kernelOrganization").text('This entity is an organization');
        else
            $("#kernelOrganization").text('This entity is not an organization');

        if (kernelInfo.phone && kernelInfo.phone !== '')
            $("#kernelPhone").text(kernelInfo.phone);
        else
            $("#kernelPhoneContainer").hide();

        if (kernelInfo.physicalAddress && kernelInfo.physicalAddress !== '') {
            $("#kernelPhysicalAddress").text(kernelInfo.physicalAddress).attr('href', OSM_QUERY_LINK + kernelInfo.physicalAddress);
        } else
            $("#kernelPhysicalAddressContainer").hide();

        if (kernelInfo.url && kernelInfo.url !== "") {
            $("#kernelUrl").attr('href', kernelInfo.url).text(kernelInfo.url);
        } else
            $("#kernelUrlContainer").hide();

        if (kernelInfo.mail && kernelInfo.mail !== "") {
            $("#kernelMail").attr('href', 'mailto:' + kernelInfo.mail).text(kernelInfo.mail);
        } else
            $("#kernelMailContainer").hide();

        if (kernelInfo.version !== undefined)
            $("#kernelVersion").text('Version ' + kernelInfo.version);
        else
            $("#kernelVersion").hide();
    };

    /**
     * Set the extra data for the kernel
     *
     * @param kernelInfo {Object} The information received from backend
     */
    let setKernelExtraData = function (kernelInfo) {
        if (kernelInfo.extraData !== undefined && kernelInfo.extraData.size) {
            let $kernelExtraDataTable = $("#kernelExtraDataTable");
            for (let [key, value] of kernelInfo.extraData) {
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
     */
    let setCurrentKernelConnectedAddress = function () {
        if (_currentKernelIdentity.name !== undefined) {
            $.selector_cache('#kernelConnectedAddress').html("<strong><span id='kernelAddress'></span></strong>");
            $('#kernelAddress').text(_currentKernelIdentity.name);

        } else {
            $.selector_cache('#kernelConnectedAddress').html("<span id='kernelAddress'></span>");
            $('#kernelAddress').text(_currentKernelAddress);
        }
    };
}
