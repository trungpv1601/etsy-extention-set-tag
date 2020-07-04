var cookieTag = "DATA-TAG";
var cookieTitle = "DATA-TITLE-TAG";
chrome.runtime.onMessage.addListener(function(request, sender) {
    switch (request.type) {
        case "add-tag":
            var tag = window.localStorage.getItem(cookieTag);
            if (!tag) tag = "";
            if (tag == "") {
                window.localStorage.setItem(cookieTag, request.message.trim(" ").toLowerCase());
            } else {
                window.localStorage.setItem(cookieTag, tag + "," + request.message.trim(" ").toLowerCase());
            }
            break;
        case "add-title-tag":
            var titleTag = window.localStorage.getItem(cookieTitle);
            if (!titleTag) titleTag = "";
            if (titleTag == "") {
                window.localStorage.setItem(cookieTitle, request.message);
            } else {
                window.localStorage.setItem(cookieTitle, titleTag + "," + request.message);
            }
            break;
        default:
            break;
    }
});
