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
        $(this).on('contextmenu', function (e) {
            e.preventDefault();
            //Add contextual menu here
            new Contextual({
                isSticky: false,
                items: [
                    { label: '<i class="fa fa-plus-square"></i><span class="title">Add new Album</span>', icon: '', onClick: () => { window.location.href = this.dataset.addlink; } },
                    { label: '<i class="fa fa-edit"></i><span class="title">Edit</span>', icon: '', onClick: () => { window.location.href = this.dataset.editlink; } },
                    { label: '<i class="fa fa-images" aria-hidden="true"></i><span class="title">Album items</span>', icon: '', onClick: () => { window.location.href = this.dataset.photogalleryurl; } },
                    { label: '<i class="fa fa-arrow-up" aria-hidden="true"></i><span class="title">Move up</span>', icon: '', onClick: () => { window.location.href = this.dataset.moveupurl; } },
                    { label: '<i class="fa fa-arrow-down" aria-hidden="true"></i><span class="title">Move down</span>', icon: '', onClick: () => { window.location.href = this.dataset.movedownurl; } },
                    { label: '<i class="fa fa-ban" aria-hidden="true"></i><span class="title">Hide/Unhide page</span>', icon: '', onClick: () => { window.location.href = this.dataset.hideunhideurl; } }
                ]
            });
        });
    });
}