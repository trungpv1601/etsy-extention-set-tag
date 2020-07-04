/**
 * VARS
 */
var cookieTag = "DATA-TAG";
var cookieTitle = "DATA-TITLE-TAG";
/* Export CSV Shop */
var RESULTS = [];
var HEADER = 'Url,Title,FeaturedImageURL';
/**
 * End VARs
 */
$(document).ready(function() {
    loadData();
    $("#txtTag").change(function() {
        window.localStorage.setItem(cookieTag, $("#txtTag").val());
        updateNumberDataTitle();
    });
    $("#btnSet").click(function() {
        var data = window.localStorage.getItem(cookieTag);
        var temp = formatData(data);
        if (temp) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    message: "set-tag",
                    data: temp
                }, function(result) {
                    if (result.success == 0) {
                        $("#txtLog").text("OK");
                    } else {
                        $("#txtLog").text("ERROR");
                    }
                })
            });
        } else { // loi
            $("#txtLog").text("ERROR");
        }
    });
    //$("#btnGet").click(function () {
    //$("#txtTag").val("");
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // 	chrome.tabs.sendMessage(tabs[0].id, { message: "get-tag" }, function (result) {
    // 		if (result) {
    // 			if (result.success == 0) {
    // 				$("#txtLog").text("OK");
    // 				// lam gi o day
    // 			} else {
    // 				$("#txtLog").text("ERROR");
    // 			}
    // 		}
    // 	})
    // });
    //});
    $("#btnClear").click(function() {
        window.localStorage.removeItem(cookieTag);
        // $("#txtTag").val("");
        $('#txtTag').tagsinput('removeAll');
        //loadData();
    });
    $("#btnClearTitle").click(function() {
        window.localStorage.removeItem(cookieTitle);
        // $("#txtTag").val("");
        $('#titleTags').tagsinput('removeAll');
        updateNumberDataTitle();
    });
    $("#btnReplaceForMug").click(function() {
        var blackLists = ["T-Shirt", "T-shirt", "T shirt", "T Shirt", "t shirt", "t Shirt", "Tshirt", "tshirt", "shirt", "SHIRT", "T-SHIRT", "Shirt", "Tee", "tee"];
        const data = window.localStorage.getItem(cookieTag);
        const dataTitle = window.localStorage.getItem(cookieTitle);
        var dataTmp = data;
        var dataTitleTmp = dataTitle;
        blackLists.forEach(function(item, index, array) {
            dataTmp = dataTmp.replaceAll(item, 'Mug');
            dataTitleTmp = dataTitleTmp.replaceAll(item, 'Mug');
        });
        $('#txtTag').tagsinput('removeAll');
        $('#titleTags').tagsinput('removeAll');
        window.localStorage.setItem(cookieTag, dataTmp);
        window.localStorage.setItem(cookieTitle, dataTitleTmp);
        loadData();
    });
    $('#btnExportCSVShop').click(function() {
    	var $this = $(this);
    	$this.button('loading');
        getTotal(async function(total) {
            var totalPage = parseInt(total / 96) + 1;
            if (totalPage == 1) {
                loadPage(function(result) {
                    downloadCSV({ filename: "export-shop-data.csv", data: result });
                    $this.button('reset');
                });
            } else {
                getDataShop([], totalPage, function(result) {
                    downloadCSV({ filename: "export-shop-data.csv", data: result });
                    $this.button('reset');
                });
            }
        })
    });
    var clipboard = new ClipboardJS('#btnCopy', {
        text: function() {
            return document.querySelector('#titleTags').value.replaceAll(",", " - ");
        }
    });
    clipboard.on('success', function(e) {
        e.clearSelection();
    });
    var clipboardTags = new ClipboardJS('#btnCopyTags', {
        text: function() {
            return document.querySelector('#txtTag').value;
        }
    });
    clipboardTags.on('success', function(e) {
        e.clearSelection();
    });
    $("#titleTags").change(function() {
        window.localStorage.setItem(cookieTitle, $("#titleTags").val());
        loadData();
    });
});
/**
chuan hoa data
**/
function formatData(data) {
    var arrTag = data.trim(",").split(",");
    var arrResult = [];
    arrTag.forEach(function(item, index) {
        if (item.trim(" ") != "" && $.inArray(item, arrResult) === -1) {
            arrResult.push(item.trim(" "));
        }
    });
    return arrResult.join(",");
};
/**
get data tu localStorage
**/
function loadData() {
    var data = window.localStorage.getItem(cookieTag);
    if (data) {
        data = data.split(",");
        data.forEach(element => {
            $('#txtTag').tagsinput('add', element);
        });
        // $("#txtTag").val(data);
    }
    var dataTitle = window.localStorage.getItem(cookieTitle);
    if (dataTitle) {
        $('#titleTagsCountChar').text(dataTitle.replaceAll(",", " - ").length);
        if (dataTitle.replaceAll(",", " - ").length > 140) {
            $('#titleTagsCountChar').css('color', 'red');
        } else {
            $('#titleTagsCountChar').css('color', '#737373');
        }
        dataTitle = dataTitle.split(",");
        dataTitle.forEach(element => {
            $('#titleTags').tagsinput('add', element);
        });
        // $("#txtTag").val(data);
        $('#titleTagsCount').text(dataTitle.length);
    }
}

function updateNumberDataTitle() {
    var dataTitle = window.localStorage.getItem(cookieTitle);
    if (dataTitle != null) {
        $('#titleTagsCountChar').text(dataTitle.replaceAll(",", " - ").length);
        if (dataTitle.replaceAll(",", " - ").length > 140) {
            $('#titleTagsCountChar').css('color', 'red');
        } else {
            $('#titleTagsCountChar').css('color', '#737373');
        }
        $('#titleTagsCount').text(dataTitle.trim() == '' ? 0 : dataTitle.split(",").length);
    }
}
// String.prototype.replaceAll = function(search, replacement) {
// 	var target = this;
// 	return target.replace(new RegExp(search, "g"), replacement);
// };
String.prototype.replaceAll = function(searchStr, replaceStr) {
    var str = this;
    // escape regexp special characters in search string
    searchStr = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(searchStr, 'gi'), replaceStr);
};
/**
 * FUNCTIONS
 */
function getTotal(done) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            message: "ECS-get-total"
        }, function(result) {
            if (result) {
                if (result.success == 0) {
                    done(result.total);
                }
            }
        })
    });
}

function loadPage(done) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            message: "ECS-load-page"
        }, function(result) {
            if (result) {
                if (result.success == 0) {
                    done(result.data);
                }
            }
        })
    });
}

function clickNextPage(done) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            message: "ECS-next-page"
        }, function(result) {
            if (result) {
                if (result.success == 0) {
                    done(result.isDone);
                }
            }
        })
    });
}

function wait(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

function getDataShop(result, total, done) {
    if (total == 0) {
        return done(result);
    }
    loadPage(function(data) {
        clickNextPage(async function(isDone) {
            if (isDone) {
                await wait(2000);
                return getDataShop(result.concat(data), total - 1, done);
            }
        });
    });
}
/**
 * Export CSV
 */
function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;
    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }
    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';
    keys = Object.keys(data[0]);
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;
    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;
            result += '"' + item[key] + '"';
            ctr++;
        });
        result += lineDelimiter;
    });
    return result;
}

function downloadCSV(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: args.data
    });
    if (csv == null) return;
    filename = args.filename || 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}
