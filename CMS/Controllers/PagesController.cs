using CMS.Controllers;
using CMS.Extensions;
using CMS.Models;
using Data;
using Data.Common;
using Data.Helpers;
using Data.Models;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Caching;
using System.Web.Mvc;

namespace CMS.Controllers
{
    public class PagesController : BaseController
    {
        // GET: Pages

        #region Index
        [CustomAuthorization("WebsiteContent", "View")]
        public ActionResult Index(int id)
        {
            ViewBag.pagemodify = 0;
            ViewBag.pageId = id;
            PageModel pg = new PageHelper().GetById(id, LangId);
            if (pg == null)
            {
                return RedirectToAction("Index","Pages", new { id = Sitesettings.RootPageId });
            }
            return View(pg);
        }
     
        public PartialViewResult _PagesMenu()
        {
            return PartialView();
        }
        public ActionResult SelectTemplate(int id)
        {
            ViewBag.Templatesdd = new PageTemplateHelper().GetAll();
            ViewBag.PageContentID = new PageContentTypeHelper().GetAll();
            ViewBag.pageid = id;

            return View();
        }
        public ActionResult _EditContentType(int id)
        {
            ViewBag.PageContentID = new PageContentTypeHelper().GetAll();
            ViewBag.pageid = id;
            PageModel model = new PageHelper().GetById(id, LangId);
            return View(model);
        }

        [CustomAuthorization("WebsiteContent", "Edit")]
        [HttpPost]
        public ActionResult _EditContentType(FormCollection obj)
        {
            int contenttypeid = !string.IsNullOrWhiteSpace(obj["PageContentID"]) ? Convert.ToInt32(obj["PageContentID"]) : -1;
            int pageid = !string.IsNullOrWhiteSpace(obj["id"]) ? Convert.ToInt32(obj["id"]) : -1;
            if (pageid > -1 && contenttypeid > -1)
            {
                new PageHelper().updateContentType(pageid, contenttypeid);
            }
            return RedirectToAction("Index","Pages", new { id = pageid });
        }

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult _HideUnhide(int id)
        {
            PageHelper pghelper = new PageHelper();
            PageModel mde = pghelper.GetById(id, LangId);

            string hide = "hide";
            if (mde.isHidden)
            {
                mde.isHidden = false;
                hide = "unhide";
            }
            else
            {
                mde.isHidden = true;
            }
            pghelper.HideUnhide(mde);
            new LogsHelper().Create(ViewBag.CMSUserID, "HideUnihide Page", "User '" + ViewBag.CMSUserName + "' " + hide + " a page: '" + mde.Name + "'");
            return RedirectToAction("Index", "Pages", new { id = id });
        }

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult MoveUp(int ID)
        {

            PageHelper helper = new PageHelper();
            PageModel curr = helper.GetById(ID, LangId);
            int tempDisplay = curr.MenuOrder;
            PageModel other = helper.GetAll(LangId, parentid: curr.ParentId).Where(x => x.MenuOrder < tempDisplay).OrderByDescending(y => y.MenuOrder).FirstOrDefault();
            if (other != null)
            {
                curr.MenuOrder = other.MenuOrder;
                other.MenuOrder = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("Index", "Pages", new { id = curr.ParentId });
        }

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult MoveDown(int ID)
        {
            PageHelper helper = new PageHelper();
            PageModel curr = helper.GetById(ID, LangId);
            int tempDisplay = curr.MenuOrder;
            PageModel other = helper.GetAll(LangId, parentid: curr.ParentId).Where(x => x.MenuOrder > tempDisplay).OrderBy(y => y.MenuOrder).FirstOrDefault();
            if (other != null)
            {
                curr.MenuOrder = other.MenuOrder;
                other.MenuOrder = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("Index", "Pages", new { id = curr.ParentId });
        }


        [CustomAuthorization("WebsiteContent", "View")]
        public ActionResult PhotoGallery(int id)
        {
            PageModel mde = new PageHelper().GetById(id, LangId);

            return View();
        }

        [CustomAuthorization("WebsiteContent", "Delete")]
        public ActionResult Delete(int id)
        {
            PageModel mde = new PageHelper().GetById(id, LangId);
            new PageHelper().Delete(id);
            new LogsHelper().Create(ViewBag.CMSUserID, "Edit Page", "User '" + ViewBag.CMSUserName + "' deleted a page: '" + mde.Name + "'");
            return RedirectToAction("Index", "Pages", new { });
        }

        public PartialViewResult _FetchPages(string hfieldid, string ids = "")
        {
            ViewBag.hfieldid = hfieldid;
            ViewBag.selectedids = ids;
            return PartialView();
        }
        public PartialViewResult _PageIsList(int id, int page = 1, string search = "")
        {
            PageHelper pghelper = new PageHelper();
            int totalrec = 0; int pagesize = 20;
            List<PageModel> lst = pghelper.Search(LangId, id, pagesize, page, search, ref totalrec, true);

            ViewBag.rowsPerPage = pagesize;
            ViewBag.rowCount = totalrec;
            return PartialView(lst);
        }
        [HttpGet]
        public ActionResult _getPageChidlrenInList(int parentId, int page = 1, string search = "")
        {
            PageHelper pghelper = new PageHelper();
            int totalrec = 0; int pagesize = 20;
            List<PageModel> lst = pghelper.Search(LangId, parentId, pagesize, page, search, ref totalrec, true);

            ViewBag.rowsPerPage = pagesize;
            ViewBag.rowCount = totalrec;
            string data = Utilities.RenderRazorViewToString(this, "_PageIsList", lst);
            return Json(new { data = data }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult _FetchPagesFct()
        {
            PageHelper pghelper = new PageHelper();
            List<PageModel> AllParentL = pghelper.GetAll(LangId, true, 0);
            List<PageModel> data = BindTree(AllParentL, null);
            List<Combotree> lst = Utilities.ConverttoComboxtreePages(data);
            return Json(new { lst }, JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region Pages Tree

        public PartialViewResult _PagesTree(int pageId=-1)
        {
            ViewBag.pageId = pageId;
            PageModel pg = new PageHelper().GetById(Sitesettings.RootPageId, LangId);            
            return PartialView(new List<PageModel> { pg});
        }

      

        public PartialViewResult _treeChildrens()
        {
            return PartialView();
        }


        private List<PageModel> BindTree(List<PageModel> list, PageModel parentNode)
        {
            List<PageModel> treeView1 = new List<PageModel>();
            var nodes = list.Where(x => parentNode == null ? x.ParentId == -1 : x.ParentId == parentNode.Id);
            foreach (var node in nodes)
            {

                if (parentNode == null)
                {
                    treeView1.Add(node);
                }
                else
                {
                    // if (!parentNode.isList)
                    // {
                    parentNode.ChildNodes.Add(node);
                    parentNode.ChildNodes = parentNode.ChildNodes.OrderBy(x => x.MenuOrder).ToList();
                    // }                    
                }

                BindTree(list, node);
            }
            return treeView1;
        }

        [HttpPost]
        public JsonResult _GetPagesContent(int id)
        {
            StringBuilder str = new StringBuilder("");
            PageModel pg = new PageHelper().GetById(id, LangId);
            List<PagesContentModel> fields = new PageContentHelper().GetAllFieldsTypeByPageID(id, LangId, true);
            if (fields != null && fields.Count > 0)
            {
                str.Append("<table cellpadding='0' cellspacing='0' width='100%' class='contentTable'>");
                foreach (var item in fields)
                {
                    str.Append(GenerateContent(item));
                }
                str.Append("</table>");
            }
            else
            {
                str.Append("<p>" + pg.Name + " page has no content to display</p>");
            }



            return Json(new { data = str.ToString(), name = pg.Name }, JsonRequestBehavior.AllowGet);
        }

        private string GenerateContent(PagesContentModel item)
        {
            StringBuilder str = new StringBuilder();
            str.Append("<tr><td><label>" + item.ContentFieldName + "</label></td>");
            str.Append("<td>");
            if (item.ContentFieldTypeID == (int)Utilities.PageContentTypesIds.Html || item.ContentFieldTypeID == (int)Utilities.PageContentTypesIds.Text)
            {
                str.Append((!string.IsNullOrEmpty(item.HtmlContent) ? "<span>" + item.HtmlContent + "</span>" : "-"));
            }
            else if (item.ContentFieldTypeID == (int)Utilities.PageContentTypesIds.Image)
            {
                str.Append((!string.IsNullOrEmpty(item.ImageContent) ? "<img src='" + item.ImageContent + "' alt='" + item.ContentFieldName + "' width='400' />" : "-"));
            }
            else if (item.ContentFieldTypeID == (int)Utilities.PageContentTypesIds.File)
            {
                str.Append((!string.IsNullOrEmpty(item.FileContent) ? "<a href='" + item.FileContent + "' alt='" + item.ContentFieldName + "' target='_blank' ><i class='far fa-eye'></i>&nbsp;View</a>" : "-"));

            }
            else if (item.ContentFieldTypeID == (int)Utilities.PageContentTypesIds.Date)
            {
                str.Append((item.DateContent != new DateTime(1900, 1, 1) ? "<span>" + item.DateContent + "</span>" : "-"));
            }
            else if (item.ContentFieldTypeID == (int)Utilities.PageContentTypesIds.Items)
            {
                if (!string.IsNullOrWhiteSpace(item.HtmlContent))
                {
                    List<string> ids = item.HtmlContent.Split(',').ToList();
                    List<PageModel> Pagemodels = new PageHelper().GetByids(ids, LangId);
                    string titles = string.Join(", ", Pagemodels.Select(x => x.Name));
                    str.Append("<span>" + titles + "</span>");
                }
                else
                {
                    str.Append("<span>-</span>");
                }


            }
            else if (item.ContentFieldTypeID == (int)Utilities.PageContentTypesIds.GalleryItem)
            {
                if (!string.IsNullOrWhiteSpace(item.HtmlContent))
                {
                    AlbumModel albumModel = new AlbumHelper().GetByid(Convert.ToInt32(item.HtmlContent), LangId);
                    str.Append("<span>" + albumModel.Title + "</span>");
                }
                else
                {
                    str.Append("<span>-</span>");
                }

            }
            str.Append("</td>");
            str.Append("</tr>");
            return str.ToString();
        }
        #endregion

        #region Create

        [CustomAuthorization("WebsiteContent", "Create")]
        public ActionResult Create()
        {

            PageModel mde = new PageModel();
            int templateid = !string.IsNullOrWhiteSpace(Request.QueryString["templateid"]) && Utilities.IsNumeric(Request.QueryString["templateid"]) ? Convert.ToInt32(Request.QueryString["templateid"]) : 0;
            int contentid = !string.IsNullOrWhiteSpace(Request.QueryString["contentid"]) && Utilities.IsNumeric(Request.QueryString["contentid"]) ? Convert.ToInt32(Request.QueryString["contentid"]) : 0;
            int parentpageid = !string.IsNullOrWhiteSpace(Request.QueryString["parentpageid"]) && Utilities.IsNumeric(Request.QueryString["parentpageid"]) ? Convert.ToInt32(Request.QueryString["parentpageid"]) : 0;

            if (parentpageid > 0)
            {
                mde.ParentId = parentpageid;
                displaypage(templateid, contentid, mde);
            }
            return View(mde);
        }



        [CustomAuthorization("WebsiteContent", "Create")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [ValidateInput(false)]
        public ActionResult Create(PageModel mde, FormCollection obj)
        {
            PageModel mymodel = new PageModel
            {
                isDeleted = mde.isDeleted,
                isHidden = mde.isHidden,
                MenuOrder = mde.MenuOrder,
                Name = mde.Name,
                PageContentID = mde.PageContentID,
                PageTemplateID = mde.PageTemplateID,
                ParentId = mde.ParentId,
                isList = mde.isList,
                FriendlyUrl = mde.FriendlyUrl,
                Link = mde.PageContentID == 1 ? obj["link"] : ""
            };
            int pageid = new PageHelper().Create(mymodel);
            string Link = mymodel.Link != "" ? mymodel.Link + "?pageid=" + pageid : "";
            new PageHelper().updateLink(pageid, Link);
            List<PageContentTypeField> fields = new PageContentTypeFieldHelper().GetAllFieldTypeByContentTypeID(mde.PageContentID);
            bool valid = true; string globErr = "";
            foreach (var item in fields)
            {
                string errmsg = "";
                valid = CreateTheField(item, obj, pageid, true, ref errmsg);
                if (!valid)
                {
                    ModelState.AddModelError("", "Error creating page. Reason:" + errmsg);
                    displaypage(mde.PageTemplateID, mde.PageContentID, mde);
                    return View(mde);
                }
            }
            if (valid)
            {
                new LogsHelper().Create(ViewBag.CMSUserID, "Create Page", "User '" + ViewBag.CMSUserName + "' Created a page: '" + mymodel.Name + "'");
                return RedirectToAction("Index", "Pages", new { id = pageid });
            }
            // else {
            ModelState.AddModelError("", "Error creating page. Reason:" + globErr);
            //}


            displaypage(mde.PageTemplateID, mde.PageContentID, mde);
            return View(mde);
        }
        #endregion

        #region Edit

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult Edit(int id)
        {


            PageModel mde = new PageHelper().GetById(id, LangId);
            displayEditpage(mde);

            return View(mde);
        }
        private void displayEditpage(PageModel mde)
        {

            StringBuilder str = new StringBuilder();
            List<PagesContentModel> fields = new PageContentHelper().GetAllFieldsTypeByPageID(mde.Id, LangId);
            foreach (var item in fields)
            {
                switch (item.ContentFieldTypeID)
                {
                    case (int)Utilities.PageContentTypesIds.Html: str.Append(GenerateInputField(true, item.ContentFieldName, item.HtmlContent)); break;
                    case (int)Utilities.PageContentTypesIds.Text: str.Append(GenerateInputField(false, item.ContentFieldName, item.HtmlContent)); break;
                    case (int)Utilities.PageContentTypesIds.Image: str.Append(GenerateFileField(item.ContentFieldName, item.ImageContent)); break;
                    case (int)Utilities.PageContentTypesIds.File: str.Append(GenerateFileField(item.ContentFieldName, item.FileContent, "file")); break;
                    case (int)Utilities.PageContentTypesIds.Date: str.Append(GenerateDateField(item.ContentFieldName, item.DateContent)); break;
                    case (int)Utilities.PageContentTypesIds.Items: str.Append(GenerateItemField(item.ContentFieldName, item.HtmlContent)); break;
                    case (int)Utilities.PageContentTypesIds.GalleryItem: str.Append(GenerateGalleryField(item.ContentFieldName, item.HtmlContent)); break;
                    default: break;
                }
            }
            // in case the fields where deleted we should show them anyway
            List<int> ids = fields.Select(x => x.ContentFieldID).ToList();
            List<PageContentTypeFieldModel> Otherfields = new PageContentTypeFieldHelper().GetAll(mde.PageContentID);
            Otherfields = Otherfields.Where(x => !ids.Contains(x.id)).ToList();
            foreach (var item in Otherfields)
            {
                switch (item.TypeId)
                {
                    case (int)Utilities.PageContentTypesIds.Html: str.Append(GenerateInputField(true, item.Name, "")); break;
                    case (int)Utilities.PageContentTypesIds.Text: str.Append(GenerateInputField(false, item.Name, "")); break;
                    case (int)Utilities.PageContentTypesIds.Image: str.Append(GenerateFileField(item.Name, "")); break;
                    case (int)Utilities.PageContentTypesIds.File: str.Append(GenerateFileField(item.Name, "", "file")); break;
                    case (int)Utilities.PageContentTypesIds.Date: str.Append(GenerateDateField(item.Name, new DateTime(1900, 1, 1))); break;
                    case (int)Utilities.PageContentTypesIds.Items: str.Append(GenerateItemField(item.Name, "")); break;
                    case (int)Utilities.PageContentTypesIds.GalleryItem: str.Append(GenerateGalleryField(item.Name, "")); break;
                    default: break;
                }
            }
            ViewBag.InputDisplay = str.ToString();
        }


        [CustomAuthorization("WebsiteContent", "Edit")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [ValidateInput(false)]
        public ActionResult Edit(PageModel mde, FormCollection obj)
        {
            bool updated = new PageHelper().update(mde);
            PageContentHelper PageContent = new PageContentHelper();
            PageContent.DeleteAllContent(mde.Id, LangId);
            List<PageContentTypeField> fields = new PageContentTypeFieldHelper().GetAllFieldTypeByContentTypeID(mde.PageContentID);
            bool valid = true;

            foreach (var item in fields)
            {
                if (updated)
                {
                    string errmsg = "";
                    valid = CreateTheField(item, obj, mde.Id, false, ref errmsg);
                    if (!valid)
                    {
                        ModelState.AddModelError("", "Error updating page. Reason:" + errmsg);
                        mde = new PageHelper().GetById(mde.Id, LangId);
                        displaypage(mde.PageTemplateID, mde.PageContentID, mde);
                        return View(mde);
                    }
                }
            }
            if (valid)
            {
                new LogsHelper().Create(ViewBag.CMSUserID, "Edit Page", "User '" + ViewBag.CMSUserName + "' updated a page: '" + mde.Name + "'");
                return RedirectToAction("Index", "Pages", new { id = mde.Id });
            }


            ModelState.AddModelError("", "Error updating. Please check your info.");
            displaypage(mde.PageTemplateID, mde.PageContentID, mde);
            return View(mde);
        }
        #endregion

        #region Functions used
        private string GenerateFileField(string name, string val, string tpe = "image")
        {
            StringBuilder str = new StringBuilder();

            string id = "txt" + name;
            string imgdisplay = val == "" ? "none" : "block";

            str.Append("<div class=\"row mb-2\">");
            str.Append("<div class=\"col-md-3\">");
            str.Append("<b><label class=\"form-control\" for=\"" + name + "\">" + name + "</label></b>");
            str.Append("</div>");
            str.Append("<div class=\"col-md-4\">");
            str.Append("<input type = \"hidden\"  id=\"" + id + "\" name=\"" + name + "\"  value=\"" + val + "\" />");
            str.Append("<input class=\"form-control inputstoread\"  id=\"" + id + "\" name=\"" + name + "\" type=\"file\" data-target= \"preview" + id + "\" value=\"" + val + "\" />");
            if (tpe != "image")
            {
                str.Append("<a id= \"preview" + id + "\" href= '" + val + "' width=\"100%\" style=\"display:" + imgdisplay + "; margin-top:15px\" alt= \"File of " + name + "\" target=\"_blank\" ><i class=\"far fa-eye\"></i>&nbsp;View</a>");
            }
            else
            {
                str.Append("<img id= \"preview" + id + "\" src= '" + val + "' width=\"100%\" style=\"display:" + imgdisplay + "; margin-top:15px\" alt= \"Image of " + name + "\" />");
            }


            str.Append("</div>");
            str.Append("</div>");
            return str.ToString();
        }
        public void displaypage(int templateid, int contentid, PageModel mde)
        {
            var template = templateid != 0 ? new PageTemplateHelper().GetById(templateid) : null;
            ViewBag.TemplateLink = template != null ? template.Link : "";
            mde.PageTemplateID = templateid;
            mde.PageContentID = contentid;
            mde.isDeleted = false;
            mde.Link = "";
            StringBuilder str = new StringBuilder();
            List<PageContentTypeField> fields = new List<PageContentTypeField>();
            if (template != null)
            {
                fields = new PageContentTypeFieldHelper().GetAllFieldTypeByContentTypeID(template.ContentTypeId);
            }
            else
            {
                fields = new PageContentTypeFieldHelper().GetAllFieldTypeByContentTypeID(contentid);
            }

            foreach (var item in fields)
            {
                switch (item.TypeId)
                {
                    case (int)Utilities.PageContentTypesIds.Html: str.Append(GenerateInputField(true, item.Name)); break;
                    case (int)Utilities.PageContentTypesIds.Text: str.Append(GenerateInputField(false, item.Name)); break;
                    case (int)Utilities.PageContentTypesIds.Date: str.Append(GenerateDateField(item.Name, new DateTime(1900, 1, 1))); break;
                    case (int)Utilities.PageContentTypesIds.Image: str.Append(GenerateFileField(item.Name, "")); break;
                    case (int)Utilities.PageContentTypesIds.File: str.Append(GenerateFileField(item.Name, "", "file")); break;
                    case (int)Utilities.PageContentTypesIds.GalleryItem: str.Append(GenerateGalleryField(item.Name, "")); break;
                    case (int)Utilities.PageContentTypesIds.Items: str.Append(GenerateItemField(item.Name, "")); break;
                    default: break;
                }
            }
            ViewBag.InputDisplay = str.ToString();
        }

        private string GenerateItemField(string name, string val)
        {
            string id = "txt" + name;
            StringBuilder str = new StringBuilder();
            str.Append("<div class=\"row mb-2\">");
            str.Append("<div class=\"col-md-3\">");
            str.Append("<b><label class=\"form-control\" for=\"" + name + "\">" + name + "</label></b>");
            str.Append("</div>");
            str.Append("<div class=\"col-md-4\"><div class=\"addpadd\">");
            string hyperlnktext = ""; string addclass = ""; string plusicon = "";
            if (val == "")
            {
                hyperlnktext = "Assign";
                plusicon = "<i class=\"fas fa-plus\"></i>&nbsp;";
            }
            else
            {
                List<string> ids = val.Split(',').ToList();
                List<PageModel> Pagemodels = new PageHelper().GetByids(ids, LangId);
                hyperlnktext = Pagemodels != null && Pagemodels.Count > 0 ? string.Join(",", Pagemodels.Select(x => x.Name).ToList()) : "";
                addclass = "green";

            }
            str.Append("<input type=\"hidden\" id=\"" + id + "\" name=\"" + name + "\" value=\"" + val + "\">");
            str.Append("<a href=\"javascript:;\" " + (val != "" ? "data-pgids=\"" + val + "\"" : "") + "  data-hiddenid=\"" + id + "\" onclick=\"fetchPageItems(this)\" data-url=\"" + Url.Content("~/Pages/_FetchPages") + "\" class=\"hyperlinks inputstoread " + addclass + "\" >" + plusicon + " " + hyperlnktext + "</a>");
            if (val != "")
            {
                str.Append("&nbsp;<a href=\"javascript:;\" data-value=\"" + val + "\" onclick=\"removeItemsContent(this)\" data-url=\"" + Url.Content("~/Pages/_removeItemsContent") + "\" class=\"red\" ><i class=\"fas fa-times\"></i>&nbsp;</a>");
            }
            str.Append("</div></div>");
            str.Append("</div>");
            return str.ToString();
        }

        private string GenerateGalleryField(string name, string val = "")
        {
            string id = "txt" + name;
            StringBuilder str = new StringBuilder();
            str.Append("<div class=\"row mb-2\">");
            str.Append("<div class=\"col-md-3\">");
            str.Append("<b><label class=\"form-control\" for=\"" + name + "\">" + name + "</label></b>");
            str.Append("</div>");
            str.Append("<div class=\"col-md-4\"><div class=\"addpadd\">");
            string hyperlnktext = ""; string addclass = ""; string plusicon = "";
            if (val == "")
            {
                hyperlnktext = "Assign";
                plusicon = "<i class=\"fas fa-plus\"></i>&nbsp;";
            }
            else
            {
                AlbumModel albumModel = new AlbumHelper().GetByid(Convert.ToInt32(val), LangId);
                hyperlnktext = albumModel != null && albumModel.Id > 0 ? albumModel.Title : "";
                addclass = "green";
            }
            str.Append("<input type=\"hidden\" id=\"" + id + "\" name=\"" + name + "\" value=\"" + val + "\">");
            str.Append("<a href=\"javascript:;\" " + (val != "" ? "data-pgids=\"" + val + "\"" : "") + " data-hiddenid=\"" + id + "\" onclick=\"fetchGallery(this)\" data-url=\"" + Url.Content("~/Album/_FetchAlbums") + "\" class=\"hyperlinks inputstoread " + addclass + "\" >" + plusicon + " " + hyperlnktext + "</a>");
            if (val != "")
            {
                str.Append("&nbsp;<a href=\"javascript:;\"  data-value=\"" + val + "\" onclick=\"removeGalleryContent(this)\" data-url=\"" + Url.Content("~/Pages/_removeAlbumContent") + "\" class=\"red\" ><i class=\"fas fa-times\"></i>&nbsp;</a>");
            }
            str.Append("</div></div>");
            str.Append("</div>");
            return str.ToString();
        }
        private string GenerateInputField(bool istextarea, string name, string val = "")
        {
            StringBuilder str = new StringBuilder();
            bool isrequired = false;
            string isrequiredtext = "";
            string id = "txt" + name;
            if (name.ToLower() == "title")
            {
                isrequired = true;
                isrequiredtext = "data-val=\"true\" data-val-required=\"The " + name + " field is required.\"";
            }
            else
            {
                isrequired = false;
                isrequiredtext = "";
            }
            str.Append("<div class=\"row mb-2\">");
            str.Append("<div class=\"col-md-3\">");
            str.Append("<b><label class=\"form-control\" for=\"" + name + "\">" + name + "</label></b>");
            str.Append("</div>");
            str.Append("<div class=\"col-md-4\">");
            if (istextarea)
            {
                str.Append("<textarea rows=\"5\" class=\"form-control inputstoread ck\" " + isrequiredtext + "  id=\"" + id + "\" name=\"" + name + "\"  >" + val + "</textarea>");
            }
            else
            {
                string tpe = "text";
                str.Append("<input class=\"form-control inputstoread\" " + isrequiredtext + " id=\"" + id + "\" name=\"" + name + "\" type=\"" + tpe + "\" value=\"" + val + "\" />");
            }

            if (isrequired)
            {
                str.Append("<span class=\"field-validation-valid text-danger\" data-valmsg-for=\"" + name + "\" data-valmsg-replace=\"true\"></span>");
            }
            str.Append("</div>");
            str.Append("</div>");
            return str.ToString();
        }
        private string GenerateDateField(string name, DateTime val)
        {
            StringBuilder str = new StringBuilder();
            bool isrequired = false;
            string isrequiredtext = "";
            string id = "txt" + name;
            if (name.ToLower() == "title")
            {
                isrequired = true;
                isrequiredtext = "data-val=\"true\" data-val-required=\"The " + name + " field is required.\"";
            }
            else
            {
                isrequired = false;
                isrequiredtext = "";
            }
            str.Append("<div class=\"row mb-2\">");
            str.Append("<div class=\"col-md-3\">");
            str.Append("<b><label class=\"form-control\" for=\"" + name + "\">" + name + "</label></b>");
            str.Append("</div>");
            str.Append("<div class=\"col-md-4\">");
            str.Append("<input data-mask data-inputmask-alias=\"datetime\" data-inputmask-inputformat=\"mm/dd/yyyy\" class=\"form-control inputstoread\" " + isrequiredtext + " id=\"" + id + "\" name=\"" + name + "\" type=\"text\" value=\"" + val.ToString("MM/dd/yyyy") + "\" />");
            if (isrequired)
            {
                str.Append("<span class=\"field-validation-valid text-danger\" data-valmsg-for=\"" + name + "\" data-valmsg-replace=\"true\"></span>");
            }
            str.Append("</div>");
            str.Append("</div>");
            return str.ToString();
        }

        private bool CreateTheField(PageContentTypeField item, FormCollection obj, int pageid, bool iscreate, ref string Errmsg)
        {

            PageContentHelper hlpe = new PageContentHelper();
            DateTime emptydate = new DateTime(1900, 1, 1);
            string HtmlContent = ""; string ImageContent = ""; string FileContent = ""; DateTime DateContent = emptydate; bool valid = true;
            if (item.TypeId == (int)Utilities.PageContentTypesIds.Html ||
                item.TypeId == (int)Utilities.PageContentTypesIds.Text ||
                item.TypeId == (int)Utilities.PageContentTypesIds.GalleryItem ||
                item.TypeId == (int)Utilities.PageContentTypesIds.Items)
            {
                ImageContent = "";
                FileContent = "";
                HtmlContent = obj[item.Name] != null ? obj[item.Name].ToString() : "";
            }
            else if (item.TypeId == (int)Utilities.PageContentTypesIds.Image) // image
            {
                string fimagename = "";
                bool validimage = Request.Files[item.Name] != null && Request.Files[item.Name].ContentLength > 0 ? Utilities.CheckFile(Request.Files[item.Name], Server.MapPath(Sitesettings.MediaPath), ref fimagename) : true;
                if (!validimage)
                {
                    Errmsg = item.Name + " is not a valid image";
                    return false;
                }
                HtmlContent = "";
                FileContent = "";
                ImageContent = fimagename != "" ? fimagename : obj[item.Name].Replace(Sitesettings.WebsiteUrl, "").Replace("/Media/", "");
            }
            else if (item.TypeId == (int)Utilities.PageContentTypesIds.File) // file
            {
                string fname = "";
                bool validfile = Request.Files[item.Name] != null && Request.Files[item.Name].ContentLength > 0 ? Utilities.CheckFile(Request.Files[item.Name], Server.MapPath(Sitesettings.MediaPath), ref fname, "file") : true;
                if (!validfile)
                {
                    Errmsg = item.Name + " is not a valid file";
                    return false;
                }
                HtmlContent = "";
                ImageContent = "";
                FileContent = fname != "" ? fname : obj[item.Name].Replace(Sitesettings.WebsiteUrl, "").Replace("/Media/", "");
            }
            else if (item.TypeId == (int)Utilities.PageContentTypesIds.Date)
            {
                HtmlContent = "";
                ImageContent = "";
                FileContent = "";
                DateContent = obj[item.Name] != null ? Convert.ToDateTime(obj[item.Name].ToString()) : emptydate;
            }

            List<LanguageModel> Languages = new List<LanguageModel>();
            if (pageid > 0)
            {
                PagesContentModel model = new PagesContentModel
                {
                    PageID = pageid,
                    HtmlContent = HtmlContent,
                    ImageContent = ImageContent,
                    FileContent = FileContent,
                    DateContent = DateContent,
                    CreatedDate = DateTime.UtcNow,
                    ContentFieldID = item.id,
                    ContentFieldTypeID = item.TypeId,
                    ContentFieldName = item.Name,
                    LangId = LangId
                };
                if (iscreate)
                {
                    Languages = new LanguageHelper().getLanguage();

                }
                else
                {
                    model.LangId = LangId;
                    Languages = new List<LanguageModel> { new LanguageModel { Id = LangId } };

                    //var mitem = hlpe.getFieldByPageIdAndItemId(pageid, item.id, LangId);
                    //if (mitem != null && mitem.Id > 0)
                    //{
                    //    hlpe.DeleteByPageIdAndItemId(pageid, item.id, LangId);
                    //}
                }



                bool contentid = hlpe.Create(model, Languages);
                if (!contentid)
                {
                    valid = false;
                }
            }
            return valid;
        }

        [HttpPost]
        public JsonResult _removeAlbumContent(string pgid, string galid)
        {
            try
            {
                new PageContentHelper().DeleteGalleryContent(Convert.ToInt32(pgid), Convert.ToInt32(galid), LangId, (int)Utilities.PageContentTypesIds.GalleryItem);
                return Json(new { success = true }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                ex.LogError();
            }
            return Json(new { success = false }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public JsonResult _removeItemsContent(string pgid, string itemsid)
        {
            try
            {
                new PageContentHelper().DeleteItemsContent(Convert.ToInt32(pgid), itemsid, LangId, (int)Utilities.PageContentTypesIds.Items);
                return Json(new { success = true }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                ex.LogError();
            }
            return Json(new { success = false }, JsonRequestBehavior.AllowGet);
        }
        #endregion



    }
}