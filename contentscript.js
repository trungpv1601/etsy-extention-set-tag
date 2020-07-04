chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    var check = false;
    var strdata = '';
    try {
        switch (request.message) {
            case "set-tag":
                if ($("#tags")) {
                    var strDataTags = request.data;
                    var arrDataTags = strDataTags.split(",");
                    var limittag = "";
                    if (arrDataTags.length >= 12) {
                        for (var i = 0; i <= 12; i++) {
                            if (limittag == "") {
                                limittag = arrDataTags[i];
                            } else {
                                limittag = limittag + "," + arrDataTags[i];
                            }
                        }
                    } else {
                        limittag = strDataTags;
                    }
                    $("#tags").val(limittag);
                    var submitBtn = $(".btn-append")[0];
                    $(submitBtn).click();
                    sendResponse({
                        success: 0,
                        data: ''
                    });
                }
                break;
            case "ECS-export":
                if ($("#tags")) {
                    var strDataTags = request.data;
                    var arrDataTags = strDataTags.split(",");
                    var limittag = "";
                    if (arrDataTags.length >= 12) {
                        for (var i = 0; i <= 12; i++) {
                            if (limittag == "") {
                                limittag = arrDataTags[i];
                            } else {
                                limittag = limittag + "," + arrDataTags[i];
                            }
                        }
                    } else {
                        limittag = strDataTags;
                    }
                    $("#tags").val(limittag);
                    var submitBtn = $(".btn-append")[0];
                    $(submitBtn).click();
                    sendResponse({
                        success: 0,
                        data: ''
                    });
                }
                break;
            case "ECS-get-total":
                if ($('div[data-region="trust-signals"]').length > 0) {
                	var total = parseInt($('div[data-region="sticky-sidebar"] > ul .is-selected .badge-transparent').text());
                    sendResponse({
                        success: 0,
                        total: isNaN(total) ? 0 : total
                    });
                }
                break;
            case "ECS-next-page":
                if ($('div[data-item-pagination]').length > 0) {
                	$('div[data-item-pagination] ul > li:last-child > a')[0].click();
                    sendResponse({
                        success: 0,
                        isDone: true
                    });
                }
                break;
            case "ECS-load-page":
                if ($('div[data-region="trust-signals"]').length > 0) {
                	var result = [];
			        var items = $('div[data-listings-container] > ul > li');
			        for (var i = 0; i < items.length; ++i) {
			            var item = items[i];
			            var $this = $(item);
			            item = {
			            	url: $this.find('.listing-link').attr('href').trim(),
			            	title: $this.find('.v2-listing-card__info h2').text().trim(),
			            	image: $this.find('img[data-listing-card-listing-image]').attr('src').trim().replace('340x270', 'fullxfull')
			            }
			            result.push(item);
			        }
			        sendResponse({
			            success: 0,
			            data: result
			        });
                }
                break;
            case "get-tag":
                var promises = [];
                // var classtag = $(".tag-button-link:visible");
                var classtag = $("#wt-content-toggle-tags-read-more .wt-btn");
                // click tag
                $(classtag).bind('click', function() {
                    chrome.runtime.sendMessage({
                        type: "add-tag",
                        message: $(this).text()
                    });
                    return false;
                });
                // get all tag
                $.each(classtag, function(key, value) {
                    var keyWord = $(value).text().trim(" ");
                    if (keyWord != "Unisex Adult Clothing" && keyWord != "Clothing" && keyWord != "T-shirts") {
                        keyWord = keyWord.toLowerCase();
                        var link = "https://www.etsy.com/suggestions_ajax.php";
                        var request = $.ajax({
                            type: "GET",
                            url: link,
                            data: {
                                search_query: keyWord,
                                search_type: "all"
                            },
                            dataType: "json",
                            success: function(data, status) {
                                if (status == 'success') {
                                    if (data.count > 2) {
                                        $(value).css("background", "#53c653");
                                    }
                                }
                            }
                        });
                        promises.push(request);
                    }
                });
                $.when(promises).then(function(data, textStatus, jqXHR) {
                    sendResponse({
                        success: 0,
                        data: ''
                    });
                });
                break;
        }
    } catch (ex) {
        console.log(ex);
        sendResponse({
            success: 1,
            data: ''
        });
    }
});
/**
 * New Feature
 */
$(function() {
    if ($('#wt-content-toggle-tags-read-more').length) {
        $('<button type="button" id="btnAddTitle" class="btnX btnX-sm btnX-warning" style="float: right;width: 100%;margin-bottom: 10px;">ADD TITLE</button>').insertAfter('h1[data-buy-box-listing-title]');
        $('#btnAddTitle').on('click', function() {
            var titleLabel = $('h1[data-buy-box-listing-title]');
            var titleTags = formatData(titleLabel.text());
            chrome.runtime.sendMessage({
                type: "add-title-tag",
                message: titleTags
            });
            return false;
        });
        $('body').append('<div class="fixedButton"><button type="button" id="btnScrollDown" class="scrollDown"><span class="etsy-icon float-right" data-content-toggle-icon=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,15.414L7.293,10.707A1,1,0,1,1,8.707,9.293L12,12.586l3.293-3.293a1,1,0,0,1,1.414,1.414Z"></path></svg></span></button> <button type="button" id="btnScrollUp" class="scrollUp"><span class="etsy-icon float-right" style="transform: rotate(180deg);" data-content-toggle-icon=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,15.414L7.293,10.707A1,1,0,1,1,8.707,9.293L12,12.586l3.293-3.293a1,1,0,0,1,1.414,1.414Z"></path></svg></span></button></div>');
        $('#btnScrollDown').on('click', function() {
            $('html, body').animate({
                scrollTop: $('#wt-content-toggle-tags-read-more').offset().top - 50
            }, 1000);
        });
        $('#btnScrollUp').on('click', function() {
            $('html, body').animate({
                scrollTop: 0
            }, 1000);
        });
    }

    function formatData(data) {
        data = data.replaceAll(", ", " - ");
        data = data.replaceAll(" [|] ", " - ");
        var arrTag = data.split(" - ");
        var arrResult = [];
        arrTag.forEach(function(item, index) {
            if (item.trim(" ") != "" && $.inArray(item, arrResult) === -1) {
                arrResult.push(titleCase(item.trim(" ").toLowerCase()));
            }
        });
        return arrResult.join(",");
    };
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, "g"), replacement);
    };

    function titleCase(str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            // You do not need to check if i is larger than splitStr length, as your for does that for you
            // Assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        // Directly return the joined string
        return splitStr.join(' ');
    }

    function getTags() {
        var promises = [];
        // var classtag = $(".tag-button-link:visible");
        var classtag = $("#wt-content-toggle-tags-read-more .wt-btn");
        // click tag
        $(classtag).bind('click', function() {
            chrome.runtime.sendMessage({
                type: "add-tag",
                message: $(this).text()
            });
            return false;
        });
        // get all tag
        $.each(classtag, function(key, value) {
            var keyWord = $(value).text().trim(" ");
            if (keyWord != "Unisex Adult Clothing" && keyWord != "Clothing" && keyWord != "T-shirts") {
                keyWord = keyWord.toLowerCase();
                var link = "https://www.etsy.com/suggestions_ajax.php";
                var request = $.ajax({
                    type: "GET",
                    url: link,
                    data: {
                        search_query: keyWord,
                        search_type: "all"
                    },
                    dataType: "json",
                    success: function(data, status) {
                        if (status == 'success') {
                            if (data.count > 2) {
                                $(value).css("background", "#53c653");
                            }
                        }
                    }
                });
                promises.push(request);
            }
        });
        // $.when(promises).then(function(data, textStatus, jqXHR) {
        //     sendResponse({
        //         success: 0,
        //         data: ''
        //     });
        // });
    }
    getTags();
    /**
     * Export CSV Shop
     */
    // if ($('div[data-region="trust-signals"]').length > 0) {
    //     $('<button type="button" id="btnExportCSVShop" class="btn btn-secondary width-full btn-multi-line" style="margin-top: 10px;background-color: #5cb85c;color: white;">Export CSV Shop</button>').insertAfter('a[aria-label="Favorite shop"]');
    //     $('#btnExportCSVShop').on('click', function() {
    //         var titleLabel = $('h1[data-buy-box-listing-title]');
    //         var titleTags = formatData(titleLabel.text());
    //         chrome.runtime.sendMessage({
    //             type: "add-title-tag",
    //             message: titleTags
    //         });
    //         return false;
    //     });
    // }
});
