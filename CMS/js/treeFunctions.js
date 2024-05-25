$(document).ready(async function () {
    setTimeout(function () {
        BindContextMenu();
        Inittreesearch();
    }, 100);
});

function parentClick(sender, currentNodeId, e) {

    //var $toggle = $(sender)
    //var $nested = $(sender).find("ul#childsUl-apage" + currentNodeId);
    //$toggle.toggleClass("menu-is-opening menu-open");
    //$nested.toggleClass("active");
   // e.preventDefault();
   // e.stopPropagation();
   // return false;
}
function BindContextMenu() {
    $("a[data-contextmenu]").each(function (item) {
        var id = $(this).data("id");
        var ctpid = $(this).data("tpid");
        $(this).on('contextmenu', function (e) {
            e.preventDefault();
            //Add contextual menu here
            new Contextual({
                isSticky: false,
                items: [

                    { label: '<i class="fa fa-plus-square"></i><span class="title">Add new page</span>', icon: '', onClick: () => { window.location.href = this.dataset.addlink; } },
                    { label: '<i class="fa fa-th"></i><span class="title">Page layout</span>', icon: '', onClick: () => { window.location.href = this.dataset.pagelayoutlink; } },
                    
                    (ctpid == 0 ? {} : { label: '<i class="fa fa-eye" aria-hidden="true"></i><span class="title">View page</span>', icon: '', onClick: () => { window.open(this.dataset.friendlyurl, "_blank"); } }),
                    { label: '<i class="fa fa-edit"></i><span class="title">Edit page content</span>', icon: '', onClick: () => { window.location.href = this.dataset.editlink; } },
                    { label: '<i class="fa fa-edit"></i><span class="title">Edit content type</span>', icon: '', onClick: () => { window.location.href = this.dataset.editcontenttypelink; } },

                    { label: '<i class="fa fa-images" aria-hidden="true"></i><span class="title">Photo gallery</span>', icon: '', onClick: () => { window.location.href = this.dataset.photogalleryurl; } },
                    { label: '<i class="fa fa-arrow-up" aria-hidden="true"></i><span class="title">Move up</span>', icon: '', onClick: () => { window.location.href = this.dataset.moveupurl; } },
                    { label: '<i class="fa fa-arrow-down" aria-hidden="true"></i><span class="title">Move down</span>', icon: '', onClick: () => { window.location.href = this.dataset.movedownurl; } },
                    { label: '<i class="fa fa-ban" aria-hidden="true"></i><span class="title">Hide/Unhide page</span>', icon: '', onClick: () => { window.location.href = this.dataset.hideunhideurl; } }
                ]
            });
        });
    });

}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}