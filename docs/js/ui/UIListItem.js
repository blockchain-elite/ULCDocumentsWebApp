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

/*  ULCDOCUMENTS UI LIST CLASSES
*  @author Arnaud VERGNET <arnaud.vergnet@netc.fr>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

// Define a main class list item, then make FileListItem, TextListItem and HashListItem inherit it
// Create a new file UIListItems

let itemDOMElement =
    '    <div class="card item-card mb-3 shadow-sm item-state-unknown">\n' +
    '        <div class="card-body p-0">' +
    '            <div class="row" style="margin: 0">' +
    '                <div class="col-1 pr-0 multi-selection item-select-checkbox-container" style="display: none;">' +
    '                   <div class="btn item-select-checkbox">' +
    '                       <i class="item-select-checkbox-icon fas fa-check" style="display: none"></i>' +
    '                   </div>' +
    '                </div>' +
    '                <div class="col-1 mx-2 d-flex" style="padding: 0; min-width: 40px">' +
    '                    <i class="item-type-icon"></i>' +
    '                </div>' +
    '                <div class="col" style="max-width: 50%; padding: 0">' +
    '                    <div class="pt-1 item-name"></div>' +
    '                    <div class="pt-1 text-muted item-subtitle"></div>' +
    '                    <div class="pt-1 text-muted list-item-state"></div>' +
    '                </div>' +
    '                <div class="col text-center item-state-icon d-flex justify-content-center align-items-center">' +
    '                    <i class="fas fa-question list-item-icon"></i>' +
    '                </div>' +
    '            </div>' +
    '        </div>' +
    '       <i class="text-muted remove-list-item-button fas fa-times"></i>' +
    '   </div>';


class ListItem {

    /**
     * ListItem constructor
     * @param index {Number} This item unique index
     * @param idPrefix {String} The prefix to be used by the DOM element list item
     * @param appMode {APP_MODE} The app type this item was created in
     */
    constructor(index, idPrefix, appMode) {
        this.FILE_SELECTED_CLASS = 'file-selected';
        this.index = index;
        this.id = idPrefix + index;
        this.hash = '';
        this.documentData = undefined;
        this.customExtraData = [];
        this.$item = undefined;
        this.$removeButton = undefined;
        this.$selectedCheckbox = undefined;
        this.$selectedCheckboxIcon = undefined;
        this.OUT_ANIM = 'zoomOut faster';
        this.IN_ANIM = 'zoomIn faster';
        this.type = TypeElement.Unknown;
        this.appMode = appMode;
        this.numSign = 0;
        this.neededSign = 0;
        this.txUrl = '';
        this.cardColor = COLOR_CLASSES.none;
    }

    reset() {
        this.setType(TypeElement.Unknown);
        this.setDocumentData(undefined);
        this.customExtraData = [];
        this.txUrl = '';
    }

    getIndex() {
        return this.index;
    }

    /**
     * Return this items DOM id
     * @return {string} the DOM id
     */
    getId() {
        return this.id;
    }

    getCardColor() {
        return this.cardColor;
    }

    getTxUrl() {
        return this.txUrl;
    }

    setTxUrl(url) {
        this.txUrl = url;
        if (this.isSelected())
            UI.getItemDetailsManager().setupItemPopup(this);
    }

    /**
     * Set the current number of signatures for the item
     *
     * @param num {Number} The number of signatures
     */
    setNumSign(num) {
        this.numSign = num;
    }

    /**
     * Get the current number of signatures for the item
     *
     * @return {number} The number of signatures
     */
    getNumSign() {
        return this.numSign;
    }

    clearCustomExtraData() {
        this.customExtraData = [];
    }

    /**
     * Remove empty or invalid elements from the customExtraData array
     */
    sanitizeCustomExtraData() {
        for (let i = 0; i < this.customExtraData.length; i++) {
            if (this.customExtraData[i] === undefined || this.customExtraData[i][0] === '' || this.customExtraData[i][0] === '')
                this.customExtraData.splice(i, 1);
        }
    }

    /**
     * Get the custom extra data array
     * @return {Array}
     */
    getCustomExtraData() {
        return this.customExtraData;
    };

    /**
     * Set the custom extra data array at the specified index
     * @param index {Number} The index of the element
     * @param value {*[]} The array value to store at index
     */
    setCustomExtraData(index, value) {
        this.customExtraData[index] = value;
    };

    /**
     *
     * @return {DocumentData}
     */
    getDocumentData() {
        return this.documentData;
    }

    setDocumentData(docData) {
        this.documentData = docData;
    }

    /**
     * Set this item's hash.
     *
     * @param hash {String} The hash to store
     */
    setHash(hash) {
        this.hash = hash;
        if (this.isSelected()) {
            UI.getItemDetailsManager().setupItemPopup(this);
        }
    }

    /**
     * Get this item's hash.
     *
     * @return {String} The hash for this file
     */
    getHash() {
        return this.hash;
    }

    /**
     * Set the selected state of this item
     *
     * @param state {Boolean} Whether to select the file
     */
    setSelected(state) {
        if (state && !this.isSelected()) {
            this.$item.addClass(this.FILE_SELECTED_CLASS);
            this.$selectedCheckbox.addClass('btn-primary');
            this.$selectedCheckboxIcon.fadeIn(200);
            UI.addItemToSelected(this);
        } else if (!state) {
            this.$item.removeClass(this.FILE_SELECTED_CLASS);
            this.$selectedCheckbox.removeClass('btn-primary');
            this.$selectedCheckboxIcon.fadeOut(200);
            UI.removeItemFromSelected(this);
        }
    }

    /**
     * Get the selected state of this item
     *
     * @return {*|jQuery|boolean}
     */
    isSelected() {
        return this.$item.hasClass(this.FILE_SELECTED_CLASS);
    }

    /**
     * Set this item's appearance, based on the given type and loading.
     *
     * @param type {TypeElement} Element type to display.
     */
    setType(type) {
        let cardColor = COLOR_CLASSES.none;
        let iconClasses = 'list-item-icon ';
        let $icon = this.$item.find('.' + iconClasses);
        switch (type) {
            case TypeElement.Loading: // Waiting response...
                cardColor = COLOR_CLASSES.info;
                iconClasses += 'fas fa-circle-notch fa-spin fa-fw';
                break;
            case TypeElement.awaitingMetamask: // Waiting metamask confirmation...
                cardColor = COLOR_CLASSES.info;
                iconClasses += 'fas fa-spinner fa-spin fa-fw';
                break;
            case TypeElement.TxProcessing: // Waiting signature...
                cardColor = COLOR_CLASSES.info;
                iconClasses += 'fas fa-circle-notch fa-spin fa-fw';
                break;
            case TypeElement.TransactionSuccess: // Signed successfully
                // Change icon if signed or not
                if (this.numSign >= this.neededSign || this.neededSign === 0) {
                    cardColor = COLOR_CLASSES.success;
                    iconClasses += 'fas fa-check-circle';
                } else {
                    cardColor = COLOR_CLASSES.none;
                    iconClasses += 'fas fa-check';
                }
                break;
            case TypeElement.TransactionFailure: // Could not sign
                cardColor = COLOR_CLASSES.danger;
                iconClasses += 'fas fa-times';
                break;
            case TypeElement.Signed: // Already signed
                if (this.appMode === APP_MODE.check) {
                    cardColor = COLOR_CLASSES.success;
                    iconClasses += 'fas fa-check';
                } else {
                    cardColor = COLOR_CLASSES.danger;
                    iconClasses += 'fas fa-check';
                }
                break;
            case TypeElement.Fake: // Not signed
                if (this.appMode === APP_MODE.check) {
                    cardColor = COLOR_CLASSES.danger;
                    iconClasses += 'fas fa-times';
                } else {
                    cardColor = COLOR_CLASSES.success;
                    iconClasses += 'fas fa-edit';
                }
                break;
            case TypeElement.Pending: // Already signed by this account
                if (this.appMode === APP_MODE.sign) { // This can only occur while in sign mode
                    cardColor = COLOR_CLASSES.danger;
                    iconClasses += 'fas fa-user-edit';
                }
                break;
            case TypeElement.Revoked: // Was signed but has been revoked
                cardColor = COLOR_CLASSES.danger;
                iconClasses += 'fas fa-times';
                break;
            case TypeElement.Invalid: // An error occurred
                cardColor = COLOR_CLASSES.secondary;
                iconClasses += 'fas fa-exclamation-circle';
                break;
            default: // Unknown
                cardColor = COLOR_CLASSES.none;
                iconClasses += 'fas fa-question';
                break;
        }
        $icon.attr('class', iconClasses);
        this.$fileState.html(ITEM_STATE_TEXT[type]);
        setDOMColor(this.$item, cardColor);
        this.cardColor = cardColor;
        this.type = type;
        if (this.isSelected())
            UI.getItemDetailsManager().setupItemPopup(this);
    }

    getType() {
        return this.type;
    }

    /**
     * Create the UI entry from the template in the file list.
     */
    createEntry(isAnimated, tabHolder) {
        let $selector = $(itemDOMElement);
        $selector.attr('id', this.id);
        tabHolder.append($selector);
        this.$item = $selector;
        this.$removeButton = this.$item.find(".remove-list-item-button");
        this.$removeButton.attr('id', 'buttonRemoveItem_' + this.index);
        this.$selectedCheckbox = this.$item.find('.item-select-checkbox');
        this.$selectedCheckboxIcon = this.$item.find('.item-select-checkbox-icon');
        this.$fileState = this.$item.find(".list-item-state");
        this.setType(this.getType());
        if (isAnimated)
            animateCss(this.$item, this.IN_ANIM);
    }

    /**
     * Remove this entry from the UI playing an animation
     */
    removeEntryAnimation() {
        this.$removeButton.prop('disabled', true);
        let object = this;
        animateCss($("#" + this.id), this.OUT_ANIM, function () {
            UI.removeItemFromList(object.index);
        });
    };

    setItemLocked(isLocked) {
        this.$removeButton.attr('disabled', isLocked);
    }
}

class FileListItem extends ListItem {

    /**
     * FileListItem constructor
     * @param index {Number} This item unique index
     * @param file {File} The file linked to this item
     * @param appMode {APP_MODE} The app type this item was created in
     */
    constructor(index, file, appMode) {
        super(index, 'fileListItem_', appMode);
        this.file = file;
    }

    createEntry(isAnimated, tabHolder) {
        super.createEntry(isAnimated, tabHolder);
        this.$item.find(".item-name").text(this.file.name);
        this.$item.find(".item-type-icon").addClass(getMimeTypeIcon(this.file));
        this.$item.find(".item-subtitle").text(humanFileSize(this.file.size, false));

    }

    /**
     * Return the file associated with this object.
     *
     * @return {File}
     */
    getFile() {
        return this.file;
    };
}

class TextListItem extends ListItem {

    /**
     * TextListItem constructor
     * @param index {Number} This item unique index
     * @param appMode {APP_MODE} The app type this item was created in
     */
    constructor(index, appMode) {
        super(index, 'textListItem_', appMode);
        this.savedText = "";
    }

    createEntry(isAnimated, tabHolder) {
        super.createEntry(isAnimated, tabHolder);
        this.textTitle = this.$item.find(".item-name");
        this.textTitle.text("Text n°" + this.index);
        this.itemText = this.$item.find('.item-subtitle');
        this.setText(this.savedText);
        this.$item.find(".item-type-icon").addClass('fas fa-align-left');
    }

    getText() {
        return this.savedText;
    }

    setText(text) {
        this.savedText = text;
        let textToDsplay = this.savedText;
        if (textToDsplay.length > 30) {
            textToDsplay = textToDsplay.substr(0, 28);
            textToDsplay += '...'
        }
        if (textToDsplay !== this.itemText.text())
            this.itemText.text(textToDsplay);
    }

    getTitle() {
        return this.textTitle.text();
    }

    setTitle(id) {
        this.textTitle.text('Text n°' + id);
    }
}


class HashListItem extends ListItem {

    /**
     * HashListItem constructor
     * @param index {Number} This item unique index
     * @param appMode {APP_MODE} The app type this item was created in
     */
    constructor(index, appMode) {
        super(index, 'hashListItem_', appMode);
    }

    createEntry(isAnimated, tabHolder) {
        super.createEntry(isAnimated, tabHolder);
        this.hashTitle = this.$item.find(".item-name");
        this.setTitle(this.index);
        this.itemHash = this.$item.find('.item-subtitle');
        this.setHash(this.hash);
        this.$item.find(".item-type-icon").addClass('fas fa-hashtag');
    }

    setItemLocked(isLocked) {
        super.setItemLocked(isLocked);
        this.itemHash.attr('disabled', isLocked);
    }

    setHash(hash) {
        this.itemHash.text(hash);
        super.setHash(hash);
    }

    getTitle() {
        return this.hashTitle.text();
    }

    setTitle(id) {
        this.hashTitle.text(UI.getKernelManager().getCurrentKernelConfig().hashMethod + ' n°' + id);
    }
}
