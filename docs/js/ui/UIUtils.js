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

/*  ULCDOCUMENTS UI UTILS JAVASCRIPT
*  @author Arnaud VERGNET <arnaud.vergnet@netc.fr>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

(function($){
    /**
     * Get an HTMLElement using Jquery, and store them in a cache for a faster access later
     * @param selector {String} The Jquery selector to use
     * @return {(jQuery.fn.init | jQuery | HTMLElement)} The JQuery HTMLElement
     */
    $.selector_cache = function (selector) {
        if (!$.selector_cache[selector]) {
            $.selector_cache[selector] = $(selector);
        }
        return $.selector_cache[selector];
    };
})(jQuery); // Edit JQuery namespace to use the function as $.selector_cache('#elements');



function humanFileSize(bytes, si) {
    let thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    let units = si
        ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

function getMimeTypeIcon(file) {
    let icon = "";
    if (file !== undefined) {
        for (let mimeType in MIME_TYPE_ICONS) {
            if (file.type.search(mimeType) !== -1) {
                icon = MIME_TYPE_ICONS[mimeType];
                break;
            }
        }
    }
    if (icon === "")
        icon = MIME_TYPE_ICONS['fallback'];
    return icon;
}

function getFileIndexFromId(id) {
    return parseInt(id.slice(id.indexOf('_') + 1, id.length));
}

function getCardFromTarget($target) {
    let $card;
    if ($target.hasClass('item-card'))// file list item
        $card = $target;
    else if ($target.parents(".item-card").length)// child of file list
        $card = $($target.parents(".item-card")[0]);
    return $card
}

function capitalizeFirstLetter(string) {
    let value = "";
    if (typeof string === 'string')
        value = string.charAt(0).toUpperCase() + string.slice(1);
    return value;
}

// Using animate.css, translated into jquery
// https://github.com/daneden/animate.css
function animateCss($elem, animationName, callback) {
    $elem.addClass('animated ' + animationName);
    $elem.on('animationend', function () {
        $elem.removeClass('animated ' + animationName);
        if (typeof callback === 'function')
            callback();
    });
}

function customExtraToMap(customExtraData) {
    let newMap = new Map();
    for (let i = 0; i < customExtraData.length; i++) {
        if (customExtraData[i] !== undefined && customExtraData[i][0] !== '' && customExtraData[i][1] !== '') {
            newMap.set(customExtraData[i][0], customExtraData[i][1]);
        }
    }
    return newMap;
}


function sendNotification(type, title, message) {
    let className = "";
    let iconName = "";
    switch (type) {
        case TypeInfo.Good:
            className = 'success';
            iconName = 'fas fa-check';
            break;
        case TypeInfo.Info:
            className = 'info';
            iconName = 'fas fa-info';
            break;
        case TypeInfo.Warning:
            className = 'warning';
            iconName = 'fas fa-exclamation-triangle';
            break;
        case TypeInfo.Critical:
            className = 'danger';
            iconName = 'fas fa-times';
            break;
    }
    $.notify({
        // options
        icon: iconName,
        title: title,
        message: message,
        target: '_blank'
    }, {
        // settings
        element: 'body',
        position: null,
        type: className,
        allow_dismiss: true,
        newest_on_top: true,
        showProgressbar: false,
        placement: {
            from: "bottom",
            align: "right"
        },
        offset: 0,
        spacing: 0,
        z_index: 1031,
        delay: 5000,
        timer: 1000,
        url_target: '_blank',
        mouse_over: null,
        animate: {
            enter: 'animated bounceInRight',
            exit: 'animated bounceOutRight'
        },
        icon_type: 'class',
        template:
            '<div data-notify="container" class="bootstrap-notify">' +
            '<div role="alert" class="alert alert-{0}">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<span class="mr-1" data-notify="icon"></span> ' +
            '<span class="bootstrap-notify-title" data-notify="title">{1}</span> ' +
            '<br>' +
            '<p data-notify="message">{2}</p>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>' +
            '</div>'
    });
}

function logMe(prefix, message, type) {
    if (UI.getVerbose()) {
        let textColor = "";
        if (prefix === UIManagerPrefix) {
            textColor = "blue";
        } else {
            textColor = "purple"
        }
        let finalMessage = "%c[" + prefix + "]%c " + message;
        switch (type) {
            case TypeInfo.Warning:
                console.warn(finalMessage, "color:" + textColor, "color:black");
                break;
            case TypeInfo.Critical:
                console.error(finalMessage, "color:" + textColor, "color:black");
                break;
            default:
                console.log(finalMessage, "color:" + textColor, "color:black");
                break;
        }
    }
}

function getUrlHashParameter(param) {
    let pageUrl = window.location.hash.substring(1);
    let urlVars = pageUrl.split('&');
    let fullParam;
    let paramValue;

    for (let i = 0; i < urlVars.length; i++) {
        fullParam = urlVars[i].split(':');
        if (fullParam[0] === param) {
            paramValue = fullParam[1] === undefined ? true : decodeURIComponent(fullParam[1]);
        }
    }
    return paramValue;
}

function setUrlHashParameter(param, value) {
    let pageUrl = window.location.hash.substring(1);
    let urlVars = pageUrl.split('&');
    let validVars = [];
    let fullParam;
    let paramIndex = -1;
    // get the param id and keep only valid params
    for (let i = 0; i < urlVars.length; i++) {
        fullParam = urlVars[i].split(':');
        if (fullParam.length === 2) { // param is in valid format
            validVars.push(urlVars[i]);
            if (fullParam[0] === param) {
                fullParam[1] = value;
                paramIndex = i;
            }
        }
    }
    // edit the param list
    pageUrl = "";
    for (let i = 0; i < validVars.length; i++) {
        let andChar = i === validVars.length - 1 || 0 ? "" : "&";
        if (paramIndex === i) {
            pageUrl += param + ":" + value + andChar;
        } else if (validVars[i] !== "") {
            pageUrl += validVars[i] + andChar;
        }
    }
    if (paramIndex === -1) {
        if (pageUrl === "")
            pageUrl += param + ":" + value;
        else
            pageUrl += "&" + param + ":" + value;
    }

    window.location.hash = pageUrl;
}

/**
 * Set the color of the specified Jquery DOM element using COLOR_CLASSES constant
 * @param $item The Jquery DOM element to color
 * @param color {COLOR_CLASSES} The color class to use
 */
let setDOMColor = function ($item, color) {
    for (let c of Object.keys(COLOR_CLASSES)) {
        if ($item.hasClass(COLOR_CLASSES[c]))
            $item.removeClass(COLOR_CLASSES[c])
    }
    if (color !== undefined)
        $item.addClass(color);
};

/**
 * Trigger a callback when the selected images are loaded:
 * @param {String} selector
 * @param {Function} callback
 */
let onImgLoad = function(selector, callback){
    $(selector).each(function(){
        if (this.complete || /*for IE 10-*/ $(this).height() > 0) {
            callback.apply(this);
        }
        else {
            $(this).on('load', function(){
                callback.apply(this);
            });
        }
    });
};

let isValueInObject = function (val, object) {
    let isIn = false;
    for (let i of Object.keys(object)) {
        if (object[i] === val) {
            isIn = true;
            break;
        }
    }
    return isIn;
};

/**
 *
 * @param colorClass {COLOR_CLASSES}
 * @return {String}
 */
let getJConfirmTypeFromColorClass = function (colorClass) {
    let type = '';
    switch (colorClass) {
        case COLOR_CLASSES.info:
            type = 'blue';
            break;
        case COLOR_CLASSES.danger:
            type = 'red';
            break;
        case COLOR_CLASSES.success:
            type = 'green';
            break;
        case COLOR_CLASSES.warning:
            type = 'orange';
            break;
        default:
            type = '';
            break;
    }
    return type;
};