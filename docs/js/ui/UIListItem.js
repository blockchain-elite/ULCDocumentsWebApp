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
        this.information = new Map();
        this.extraData = new Map();
        this.customExtraData = [];
        this.$item = undefined;
        this.$removeButton = undefined;
        this.OUT_ANIM = 'fadeOutLeft faster';
        this.IN_ANIM = 'fadeInLeft faster';
        this.type = TypeElement.Unknown;
        this.appMode = appMode;
        this.numSign = 0;
        this.neededSign = 0;
        this.txUrl = '';
        this.cardColor = COLOR_CLASSES.none;
    }

    reset() {
        this.setType(TypeElement.Unknown);
        this.setInformation(new Map());
        this.setExtraData(new Map());
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

    /**
     * Set the number of signatures needed for this item
     *
     * @param num {Number} The number of signatures needed
     */
    setNeededSign(num) {
        this.neededSign = num;
    }

    /**
     * Get the number of signatures needed for this item
     *
     * @return {Number} The number of signatures needed
     */
    getNeededSign() {
        return this.neededSign;
    }

    /**
     * Remove empty or invalid elements from the customExtraData array
     */
    clearCustomExtraData() {
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
     * Set the information to be displayed when clicked on this item.
     * If the item is currently selected, update the details zone.
     *
     * @param information {Map} Dictionary containing the information.
     */
    setInformation(information) {
        this.information = new Map (information);
        if (this.isSelected()) {
            UI.getItemDetailsManager().setupItemPopup(this);
        }
    }

    /**
     * Return the information associated to this item.
     *
     * @return {Object}
     */
    getInformation() {
        return this.information;
    }

    /**
     * Set the extraData to be displayed when clicked on this item.
     * If the item is currently selected, update the details zone.
     *
     * @param extraData {Map} The extra data to display
     */
    setExtraData(extraData) {
        this.extraData = new Map (extraData);
        if (this.isSelected()) {
            UI.getItemDetailsManager().setupItemPopup(this);
        }
    }

    /**
     * Return the extra data associated to this item.
     *
     * @return {Object}
     */
    getExtraData() {
        return this.extraData;
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
            UI.getItemDetailsManager().displayFileProps(this);

        } else if (!state)
            this.$item.removeClass(this.FILE_SELECTED_CLASS);
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
    createEntry($item, isAnimated) {
        this.$item = $item;
        this.$removeButton = this.$item.find(".remove-list-item-button");
        this.$removeButton.attr('id', 'buttonRemoveItem_' + this.index);
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
            UI.removeItemFromList(object.index, object.isSelected());
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

    createEntry(isAnimated) {
        UI.createListItemFromTemplate(this.id, TAB_TYPE.file);
        super.createEntry($('#' + this.id), isAnimated);
        this.$item.find(".uploaded-file-name").text(this.file.name);
        this.$item.find(".uploaded-file-icon").html(
            "<i style='font-size: 1.5rem;margin-right: 5px' class='" + getMimeTypeIcon(this.file) + "'></i>"
        );
        this.$item.find(".uploaded-file-size").text(humanFileSize(this.file.size, false));

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

    createEntry(isAnimated) {
        UI.createListItemFromTemplate(this.id, TAB_TYPE.text);
        super.createEntry($('#' + this.id), isAnimated);
        this.textTitle = this.$item.find(".list-text-title");
        this.textTitle.text("Text n°" + this.index);
        this.itemText = this.$item.find('.item-text');
        this.setText(this.savedText);
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

    createEntry(isAnimated) {
        UI.createListItemFromTemplate(this.id, TAB_TYPE.hash);
        super.createEntry($('#' + this.id), isAnimated);
        this.hashTitle = this.$item.find(".list-hash-title");
        this.hashTitle.text(getHashAlgorithm() + " n°" + this.index);
        this.itemHash = this.$item.find('.item-hash');
        this.setHash(this.hash);
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
        this.hashTitle.text(getHashAlgorithm() +' n°' + id);
    }
}