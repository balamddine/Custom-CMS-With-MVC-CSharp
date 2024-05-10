using Data.Models;
using Data.Common;
using Data.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using Newtonsoft.Json;
using CMS.Models;
using System.Text;
using Data;
using DocumentFormat.OpenXml.Bibliography;

namespace CMS.Controllers
{
    public class AlbumController : BaseController
    {
        #region "Index"        
        public ActionResult Index(int id)
        {
            ViewBag.pagemodify = 0;
            AlbumModel pg = new AlbumHelper().GetByid(id, LangId);
            if (pg == null)
            {

                return RedirectToAction("Index", new { id = Sitesettings.RootAlbumId });
            }
            return View(pg);
        }
        public ActionResult Publish(int id)
        {
            new AlbumHelper().ChangeVisibility(id);
            return RedirectToAction("Index", new { id = id });
        }
        public ActionResult MoveUp(int ID)
        {

            AlbumHelper helper = new AlbumHelper();
            AlbumModel curr = helper.GetByid(ID, LangId);
            int tempDisplay = curr.DisplayOrder;
            AlbumModel other = helper.GetAll(LangId, curr.ParentId).Where(x => x.DisplayOrder < tempDisplay).OrderByDescending(y => y.DisplayOrder).FirstOrDefault();
            if (other != null)
            {
                curr.DisplayOrder = other.DisplayOrder;
                other.DisplayOrder = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("Index", "Album", new { curr.ParentId });
        }
        public ActionResult MoveDown(int ID)
        {
            AlbumHelper helper = new AlbumHelper();
            AlbumModel curr = helper.GetByid(ID, LangId);
            int tempDisplay = curr.DisplayOrder;
            AlbumModel other = helper.GetAll(LangId, curr.ParentId).Where(x => x.DisplayOrder > tempDisplay).OrderBy(y => y.DisplayOrder).FirstOrDefault();
            if (other != null)
            {
                curr.DisplayOrder = other.DisplayOrder;
                other.DisplayOrder = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("Index", "Album", new { curr.ParentId });
        }
        public ActionResult Delete(int id)
        {

            AlbumHelper helper = new AlbumHelper();
            helper.Delete(id);
            return RedirectToAction("Index", new { id = id });
        }
        #endregion

        #region Album Tree 
        public PartialViewResult _AlbumsTree(int pageId = -1)
        {
            ViewBag.pageId = pageId;
            AlbumModel pg = new AlbumHelper().GetByid(Sitesettings.RootAlbumId, LangId);
            return PartialView(new List<AlbumModel> { pg });
        }

        public PartialViewResult _albumTreeChildrens()
        {
            return PartialView();
        }

        private List<AlbumModel> BindTree(List<AlbumModel> list, AlbumModel parentNode)
        {
            List<AlbumModel> treeView1 = new List<AlbumModel>();
            var nodes = list.Where(x => parentNode == null ? x.ParentId == -1 : x.ParentId == parentNode.Id);
            foreach (var node in nodes)
            {
                if (parentNode == null)
                {
                    treeView1.Add(node);
                }
                else
                {
                    parentNode.ChildNodes.Add(node);
                    parentNode.ChildNodes = parentNode.ChildNodes.OrderBy(x => x.DisplayOrder).ToList();
                }
                BindTree(list, node);
            }
            return treeView1;
        }
        #endregion

        #region "Create"
        public ActionResult Create(int id)
        {
            AlbumModel mymodel = new AlbumModel { ParentId = id };
            return View(mymodel);
        }
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult Create(AlbumModel model, FormCollection obj)
        {
            try
            {
                List<LanguageModel> Languages = new LanguageHelper().getLanguage();
                string fimagename = "";
                bool validimage = Request.Files["Image"] != null && Request.Files["Image"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Image"], Server.MapPath(Sitesettings.MediaPath), ref fimagename) : true;
                if (!validimage)
                {
                    ModelState.AddModelError("", "Invalid image file!");
                    return View(model);
                }

                model.Image = fimagename;
                model.Name = model.Title;
                int albid = new AlbumHelper().Create(model, Languages);
                if (albid > 0)
                {
                    TempData["Success"] = " Album added Successfully!";

                    string aditem = obj["aditem"] != null && obj["aditem"] != "" ? obj["aditem"] : "0";
                    if (aditem == "0")
                    {
                        return RedirectToAction("Index", new { id = albid });
                    }
                    else
                    {
                        return RedirectToAction("ItemListing", new { albumid = albid });
                    }
                }
                else
                    ModelState.AddModelError("", "Creating  Album failed. Check your info!");

                var errors = ModelState.Select(x => x.Value.Errors)
                           .Where(y => y.Count > 0)
                           .ToList();

                return View(model);
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex);
                return View();
            }

        }

        #endregion

        #region "Edit"
        public ActionResult Edit(int ID)
        {
            var t = new AlbumHelper().GetByid(ID, LangId);
            return View(t);
        }
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult Edit(AlbumModel model)
        {
            try
            {
                string fimagename = "";
                bool validimage = Request.Files["Image"] != null && Request.Files["Image"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Image"], Server.MapPath(Sitesettings.MediaPath), ref fimagename) : true;
                if (!validimage)
                {
                    ModelState.AddModelError("", "Invalid image file!");
                    return View(model);
                }
                model.Image = fimagename != "" ? fimagename : (!string.IsNullOrEmpty(model.Image) ? model.Image.Substring(model.Image.LastIndexOf('/') + 1) : "");
                bool vld = new AlbumHelper().Update(model, LangId);
                if (vld)
                {
                    TempData["Success"] = " Album updated Successfully!";
                    RedirectToAction("Index", new { id = model.Id });
                }
                else
                    ModelState.AddModelError("", "Updating  Album failed. Check your info!");
                return View(model);
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex);
                return View();
            }
        }
        #endregion

        #region Album items
        public ActionResult ItemListing(int page = 1, int albumid = 0, string Type = "", string search = "")
        {

            AlbumModel myalbum = new AlbumHelper().GetByid(albumid, LangId);
            ViewBag.AlbumName = myalbum.Title;
            ViewBag.Albumid = myalbum.Id;

            int totalrec = 0; int pagesize = 20;
            var t = new AlbumItemsHelper().Search(LangId, pagesize, page, albumid, ref totalrec, search, Type, true);
            ViewBag.search = search;
            ViewBag.Typeid = Type;
            ViewBag.rowsPerPage = pagesize;
            ViewBag.rowCount = totalrec;
            return View(t);

        }
        public ActionResult PublishItems(int id)
        {
            AlbumItemsHelper helper = new AlbumItemsHelper();
            AlbumItemsModel curr = helper.GetByid(id, base.LangId);
            helper.ChangeVisibility(id);
            return RedirectToAction("ItemListing", "Album", new { albumid = curr.AlbumId });
        }
        public ActionResult MoveUpItem(int ID)
        {

            AlbumItemsHelper helper = new AlbumItemsHelper();
            AlbumItemsModel curr = helper.GetByid(ID, base.LangId);
            int tempDisplay = curr.OrderDisplay;
            AlbumItemsModel other = helper.GetAll(LangId, curr.AlbumId, true).Where(x => x.OrderDisplay < tempDisplay).OrderByDescending(y => y.OrderDisplay).FirstOrDefault();
            if (other != null)
            {
                curr.OrderDisplay = other.OrderDisplay;
                other.OrderDisplay = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("ItemListing", "Album", new { albumid = curr.AlbumId });
        }
        public ActionResult MoveDownItem(int ID)
        {
            AlbumItemsHelper helper = new AlbumItemsHelper();
            AlbumItemsModel curr = helper.GetByid(ID, base.LangId);
            int tempDisplay = curr.OrderDisplay;
            AlbumItemsModel other = helper.GetAll(LangId, curr.AlbumId, true).Where(x => x.OrderDisplay > tempDisplay).OrderBy(y => y.OrderDisplay).FirstOrDefault();
            if (other != null)
            {
                curr.OrderDisplay = other.OrderDisplay;
                other.OrderDisplay = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("ItemListing", "Album", new { albumid = curr.AlbumId });
        }
        public ActionResult DeleteItem(int id)
        {
            var ctr = new AlbumItemsHelper();
            AlbumItemsHelper helper = new AlbumItemsHelper();
            var mygal = helper.GetByid(id, LangId);
            int propId = mygal.AlbumId;
            ctr.Delete(id);
            return RedirectToAction("ItemListing", "Album", new { albumid = propId });
        }


        public ActionResult CreateAlbumItem(int albumid = 0)
        {
            AlbumModel myalbum = new AlbumHelper().GetByid(albumid, LangId);
            ViewBag.albumname = myalbum != null && myalbum.Id > 0 ? myalbum.Title : "";
            ViewBag.albumid = myalbum != null && myalbum.Id > 0 ? myalbum.Id : 0;
            return View();
        }
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult CreateAlbumItem(AlbumItemsModel model, FormCollection obj)
        {
            try
            {
                List<LanguageModel> Languages = new LanguageHelper().getLanguage();
                string fimagename = ""; string ffilename = ""; string fvideoname = "";
                string tpe = obj["ItemType"] != null && obj["ItemType"] != "" ? obj["ItemType"] : "";
                int albumid = obj["AlbumId"] != null && obj["AlbumId"] != "" ? Convert.ToInt32(obj["AlbumId"]) : 0;
                if (albumid > 0)
                {
                    model.AlbumId = albumid;
                    if (tpe != "")
                    {
                        model.ItemType = tpe;
                    }
                    bool validimage = Request.Files["Image"] != null && Request.Files["Image"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Image"], Server.MapPath(Sitesettings.MediaPath), ref fimagename) : true;
                    if (!validimage)
                    {
                        ModelState.AddModelError("", "Invalid image file!");
                        return View(model);
                    }
                    bool validFileitem = Request.Files["Fileitem"] != null && Request.Files["Fileitem"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Fileitem"], Server.MapPath(Sitesettings.MediaPath), ref ffilename, "file") : true;
                    if (!validFileitem)
                    {
                        ModelState.AddModelError("", "Invalid File!");
                        return View(model);
                    }
                    bool validVideoitem = Request.Files["Videoitem"] != null && Request.Files["Videoitem"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Videoitem"], Server.MapPath(Sitesettings.MediaPath), ref fvideoname, "video") : true;
                    if (!validVideoitem)
                    {
                        ModelState.AddModelError("", "Invalid Video file!");
                        return View(model);
                    }

                    model.Image = fimagename;
                    model.Videoitem = fvideoname;
                    model.Fileitem = ffilename;
                    model.CreatedDate = DateTime.UtcNow;
                    bool vld = new AlbumItemsHelper().Create(model, Languages);
                    if (vld)
                    {
                        TempData["Success"] = " Album item added Successfully!";
                        return RedirectToAction("ItemListing", new { albumid });
                    }
                    else
                        ModelState.AddModelError("", "Creating  Album item failed. Check your info!");
                }
                else
                    ModelState.AddModelError("", "Creating  Album item failed. Check your info!");

                var errors = ModelState.Select(x => x.Value.Errors)
                           .Where(y => y.Count > 0)
                           .ToList();
                TempData["Error"] = "Creating  Album item failed. Check your info!";
                return RedirectToAction("CreateAlbumItem", new { albumid });
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex);
                return View();
            }

        }


        public ActionResult EditAlbumItem(int id)
        {
            AlbumItemsModel mymodel = new AlbumItemsHelper().GetByid(id, LangId);
            AlbumModel myalbum = new AlbumHelper().GetByid(mymodel.mAlbum.Id, LangId);
            ViewBag.albumname = myalbum != null && myalbum.Id > 0 ? myalbum.Title : "";
            ViewBag.albumid = myalbum != null && myalbum.Id > 0 ? myalbum.Id : 0;

            return View(mymodel);
        }
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult EditAlbumItem(AlbumItemsModel model, FormCollection obj)
        {
            try
            {
                string fimagename = ""; string ffilename = ""; string fvideoname = "";
                string tpe = obj["ItemType"] != null && obj["ItemType"] != "" ? obj["ItemType"] : "";
                int albumid = obj["AlbumId"] != null && obj["AlbumId"] != "" ? Convert.ToInt32(obj["AlbumId"]) : 0;
                if (albumid > 0)
                {
                    model.AlbumId = albumid;
                    if (tpe != "")
                    {
                        model.ItemType = tpe;
                    }
                    bool validimage = Request.Files["Image"] != null && Request.Files["Image"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Image"], Server.MapPath(Sitesettings.MediaPath), ref fimagename) : true;
                    if (!validimage)
                    {
                        ModelState.AddModelError("", "Invalid image file!");
                        return View(model);
                    }
                    bool validFileitem = Request.Files["Fileitem"] != null && Request.Files["Fileitem"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Fileitem"], Server.MapPath(Sitesettings.MediaPath), ref ffilename, "file") : true;
                    if (!validFileitem)
                    {
                        ModelState.AddModelError("", "Invalid File!");
                        return View(model);
                    }
                    bool validVideoitem = Request.Files["Videoitem"] != null && Request.Files["Videoitem"].ContentLength > 0 ? Utilities.CheckFile(Request.Files["Videoitem"], Server.MapPath(Sitesettings.MediaPath), ref fvideoname, "video") : true;
                    if (!validVideoitem)
                    {
                        ModelState.AddModelError("", "Invalid Video file!");
                        return View(model);
                    }
                    model.Image = fimagename != "" ? fimagename : (!string.IsNullOrEmpty(model.Image) ? model.Image.Substring(model.Image.LastIndexOf('/') + 1) : "");
                    model.Videoitem = fvideoname != "" ? fvideoname : (!string.IsNullOrEmpty(model.Videoitem) ? model.Videoitem.Substring(model.Videoitem.LastIndexOf('/') + 1) : "");
                    model.Fileitem = ffilename != "" ? ffilename : (!string.IsNullOrEmpty(model.Fileitem) ? model.Fileitem.Substring(model.Fileitem.LastIndexOf('/') + 1) : "");
                    model.CreatedDate = DateTime.UtcNow;
                    bool vld = new AlbumItemsHelper().Update(model, LangId);
                    if (vld)
                    {
                        TempData["Success"] = " Album item updated Successfully!";
                        return RedirectToAction("ItemListing", new { albumid });
                    }
                    else
                        ModelState.AddModelError("", "Updating Album item failed. Check your info!");
                }
                else
                    ModelState.AddModelError("", "Updating Album item failed. Check your info!");

                var errors = ModelState.Select(x => x.Value.Errors)
                           .Where(y => y.Count > 0)
                           .ToList();
                TempData["Error"] = "Updating  Album item failed. Check your info!";
                return RedirectToAction("EditAlbumItem", new { id = model.Id });
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex);
                return View();
            }

        }


        #endregion

       

        public PartialViewResult _FetchAlbums(string hfieldid, string ids = "")
        {
            ViewBag.hfieldid = hfieldid;
            ViewBag.selectedids = ids;
            return PartialView();
        }
        [HttpPost]
        public JsonResult _FetchAlbumsFct()
        {
            AlbumHelper pghelper = new AlbumHelper();
            List<AlbumModel> AllParentL = pghelper.GetAll(LangId, 0, true);
            List<AlbumModel> data = BindTree(AllParentL, null);
            List<Combotree> lst = Utilities.ConverttoComboxtree(data);
            return Json(new { lst }, JsonRequestBehavior.AllowGet);
        }




    }







}
