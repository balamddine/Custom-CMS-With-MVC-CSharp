function Collpsetreeview(){
    var navtreeview = $(".nav-treeview");
    $.each(navtreeview, function (index, value) {
        if (index > 0) {
            $(this).hide();
        }
    });
}
function openWindow(url) {
    window.open(url, "_self");
}
function highlightmenu(id) {
    var elem = $(id);
    if (elem !== null && elem.length > 0) {
        if (elem.attr("data-tree") !== null) {
            var treelem = $(elem.attr("data-tree"));
            $(treelem).addClass("menu-open");
            $(treelem).find(".nav-treeview").show();
        }
        $(id).addClass("active");
    }
}
function highlightTreemenu(id) {    
    var elem = $(id);
    if (elem !== null && elem.length > 0) {
        $(elem).parents().find(".has-treeview").not(".menu-open").addClass("menu-open");
        $(elem).parents().find(".nav-treeview").show();
        $($(id +" :first-child")[0]).addClass("active");
    }
}
var ck = document.querySelectorAll('.ck');
if (ck.length > 0) {
    for (var i = 0; i < ck.length; ++i) {
        CKEDITOR.replace(ck[i], {
            height: '150px'
        });
    }
}


function readMedia(input, name) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $("#" + name).show();
            $("a[data-id=" + name).show();
            $("#" + name).attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
$("input[type='file']").change(function () {

    readMedia(this, $(this).data("target"));
});
function Remove(args, id) {
    var isedit = $("#myhfid").val() !== -1;
    var AjaxArgs = {
        args: args,
        id: $("#myhfid").val()
    };
    if (isedit) {
        $.ajax({
            url: $("#myurl").val(),
            type: "POST",
            dataType: 'json',
            data: AjaxArgs,
            success: function (response) {
                $('#' + id).attr("src", "");
                $('#' + id).hide();
                $("input[datatarget=" + id).val("");
                $("a[data-id=" + id).hide();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
    else {
        $('#' + id).attr("src", "");
        $('#' + id).hide();
        $("input[datatarget=" + id).val("");
        $("a[data-id=" + id).hide();
    }
}
$(function () {
    try {
        var dir = $('#dir').val();
        var col = $('#col').val();
        var header = $("th a[href*=" + col + "]");
        if (dir === "Ascending") {
            header.html(header.html() + "  <i class='fa fa-sort-up' aria-hidden='true'></i>");
        }
        if (dir === "Descending") {
            header.html(header.html() + "  <i class='fa fa-sort-down' aria-hidden='true'></i>");
        }

    } catch (e) {
        console.log(e);
    }

});
function Inittreesearch() {
    $("#dvsearchsidebar").attr("data-widget", "sidebar-search");

    var options = {
        minLength: 3
    };
  $("[data-widget='sidebar-search']").SidebarSearch(options);
}
function closefancybox() {
    parent.jQuery.fancybox.close();
}
/*************************Gallery Item**********************************************/

function fetchGallery(sender) {
    var hiddenid = $(sender).data("hiddenid");
    var url = $(sender).data("url");
    var ids = $(sender).data("pgids");
    url += "?hfieldid=" + hiddenid + (ids != null && ids != undefined ? "&ids=" + ids : "");
    $.fancybox.open({
        padding: 0,
        src: url,
        type: 'iframe',

        opts: {
            preload: true,
            scrolling: 'yes',
            afterShow: function () {
                $(".fancybox-content").addClass("fancyboxwidth");
            }
        }

    });

}

function removeGalleryContent(sender) {
    var galid = $(sender).data("value");
    var pgid = $("#pgid").val();
    var url = $(sender).data("url");   
    $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        data: { pgid: pgid, galid: galid },
        success: function (response) {
            window.location.reload(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });

}
/*************************END Gallery Item**********************************************/

/*************************Page Items**********************************************/
 
function fetchPageItems(sender) {
    var hiddenid = $(sender).data("hiddenid");
    var url = $(sender).data("url");
    var ids = $(sender).data("pgids");
    url += "?hfieldid=" + hiddenid + (ids != null && ids != undefined ? "&ids=" + ids : "");
    $.fancybox.open({
        padding: 0,
        src: url,
        type: 'iframe',

        opts: {
            preload: true,
            scrolling: 'yes',
            afterShow: function () {
                $(".fancybox-content").addClass("fancyboxwidth");
            }
        }

    });

}
function removeItemsContent(sender) {
    var itemsid = $(sender).data("value");
    var pgid = $("#pgid").val();
    var url = $(sender).data("url");
    $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        data: { pgid: pgid, itemsid: itemsid },
        success: function (response) {
            window.location.reload(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });

}