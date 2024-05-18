using CMS.Extensions;
using Data.Helpers;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CMS.Controllers
{
    public class PagesGalleryController : BaseController
    {
        // GET: PageContentTypeFields

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult Index(int id)
        {
            PageModel myprop = new PageHelper().GetById(id, LangId);
            ViewBag.PageName = myprop.Name;
            ViewBag.PageId = myprop.Id;
            return View(new PagesGalleryHelper().GetAll(LangId,id));
        }

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult MoveUp(int ID)
        {

            PagesGalleryHelper helper = new PagesGalleryHelper();
            PagesGalleryModel curr = helper.GetByid(ID, base.LangId);
            int tempDisplay = curr.Display;
            PagesGalleryModel other = helper.GetAll(LangId, curr.PageId).Where(x => x.Display < tempDisplay).OrderByDescending(y => y.Display).FirstOrDefault();
            if (other != null)
            {
                curr.Display = other.Display;
                other.Display = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("Index", "PagesGallery", new { id = curr.PageId });
        }

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult MoveDown(int ID)
        {
            PagesGalleryHelper helper = new PagesGalleryHelper();
            PagesGalleryModel curr = helper.GetByid(ID, base.LangId);
            int tempDisplay = curr.Display;
            PagesGalleryModel other = helper.GetAll(base.LangId, curr.PageId).Where(x => x.Display > tempDisplay).OrderBy(y => y.Display).FirstOrDefault();
            if (other != null)
            {
                curr.Display = other.Display;
                other.Display = tempDisplay;
                helper.UpdateOrder(curr);
                helper.UpdateOrder(other);
            }
            return RedirectToAction("Index", "PagesGallery", new { id = curr.PageId });
        }

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult Delete(int id)
        {
            var ctr = new PagesGalleryHelper();
            PagesGalleryHelper helper = new PagesGalleryHelper();
            var mygal = helper.GetByid(id, LangId);
            int propId = mygal.PageId;
            ctr.Delete(id);
            return RedirectToAction("Index", "PagesGallery", new { id = propId });
        }

        #region Create

        [CustomAuthorization("WebsiteContent", "Edit")]
        public ActionResult Create(int id)
        {
            PagesGalleryModel pm = new PagesGalleryModel { PageId = id };
            PageModel myprop = new PageHelper().GetById(id, LangId);
            ViewBag.PageName = myprop.Name;
            ViewBag.PageId = myprop.Id;
            return View(pm);
        }


        [CustomAuthorization("WebsiteContent", "Edit")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [ValidateInput(false)]
        public ActionResult Create(PagesGalleryModel model)
        {
            if (!ModelState.IsValid)
                return View(model);
            PagesGalleryHelper helper = new PagesGalleryHelper();
            helper.Create(model, Request.Files);
            return RedirectToAction("Index", "PagesGallery", new { id = model.PageId });           
        }


        #endregion      
     

    }
}