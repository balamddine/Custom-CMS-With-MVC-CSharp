using CMS.Controllers;
using CMS.Extensions;
using Data;
using Data.Helpers;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CMS.Controllers
{
    public class PageContentTypeFieldsController : BaseController
    {
        // GET: PageContentTypeFields

        [CustomAuthorization("PagesContentTypeFields", "View")]
        public ActionResult Index(int id)
        {
            ViewBag.Parentid = id;
            ViewBag.ParentName = new PageContentTypeHelper().GetById(id).Name;
            var t = new PageContentTypeFieldHelper().GetAll(id);
            return View(t);
        }

        [CustomAuthorization("PagesContentTypeFields", "Delete")]
        public ActionResult Delete(int id)
        {
            var ctr = new PageContentTypeFieldHelper();
            var muelem = ctr.GetById(id);

            ctr.Delete(id);

            return RedirectToAction("Index", new { id = muelem.ParentID });
        }

        #region Create

        [CustomAuthorization("PagesContentTypeFields", "Create")]
        public ActionResult Create(int id)
        {
            ViewBag.FieldsType = new PageContentTypeFieldHelper().GetAllFieldsType().Where(x=>x.Id!=7);
            ViewBag.Parentid = id;
            ViewBag.ParentName = new PageContentTypeHelper().GetById(id).Name;
            return View();
        }

        [CustomAuthorization("PagesContentTypeFields", "Create")]

        [HttpPost]
        public JsonResult Create(string ParentID, string Name, string TypeId, string TypeName)
        {
            PageContentTypeFieldHelper helper = new PageContentTypeFieldHelper();
            if (helper.ContentTypeFieldExists(Convert.ToInt32(ParentID),Name))
            {
                return Json(new { success = false, error = "This field already exists!" });
            }
            else
            {
                PageContentTypeFieldModel mCType = new PageContentTypeFieldModel
                {
                    Name = Name,
                    ParentID = Convert.ToInt32(ParentID),
                    TypeId = Convert.ToInt32(TypeId),
                    TypeName = TypeName
                };
                int id = helper.Create(mCType);
                if (id > 0)
                {
                    return Json(new { success = true });
                }
                //ModelState.AddModelError("", "Creating ContentTypeField failed. Please check your info.");
            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return Json(new { success = false, error = "Error creating content type, Check your info!" });
        }

        #endregion

        #region Edit

        [CustomAuthorization("PagesContentTypeFields", "Edit")]
        public ActionResult Edit(int id)
        {
            var elem = new PageContentTypeFieldHelper().GetById(id);
            
            ViewBag.Parentid = elem.ParentID;
            ViewBag.ParentName = elem.mParent!=null? elem.mParent.Name:"";
            ViewBag.FieldsType = new PageContentTypeFieldHelper().GetAllFieldsType().Where(x => x.Id != 7);
            return View(elem);
        }

        [CustomAuthorization("PagesContentTypeFields", "Edit")]
        [HttpPost]
        public ActionResult Edit(string id, string ParentID, string Name, string TypeId, string TypeName)
        {

            PageContentTypeFieldHelper helper = new PageContentTypeFieldHelper();
            PageContentTypeFieldModel item = helper.GetById(Convert.ToInt32(id));
            item.Name = Name;
            item.ParentID = Convert.ToInt32(ParentID);
            item.TypeId = Convert.ToInt32(TypeId);
            item.TypeName = TypeName;
            if (helper.update(item))
            {
                return Json(new { success = true });
            }


            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return Json(new { success = false, error = "updating Page Content Type fields failed. Please check your info." });
        }
        #endregion



    }
}