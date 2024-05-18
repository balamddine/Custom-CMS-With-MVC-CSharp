using CMS.Controllers;
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
    public class PageContentTypeController : BaseController
    {
        // GET: PageContentType
        [CustomAuthorization("PagesContentType", "View")]
        public ActionResult Index()
        {
            return View(new PageContentTypeHelper().GetAll());
        }

        [CustomAuthorization("PagesContentType", "Delete")]
        public ActionResult Delete(int id)
        {
            new PageContentTypeHelper().Delete(id);
            return RedirectToAction("Index");
        }

        #region Create

        [CustomAuthorization("PagesContentType", "Create")]
        public ActionResult Create()
        {
            return View();
        }

        [CustomAuthorization("PagesContentType", "Create")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(PageContentTypeModel model)
        {
            if (!ModelState.IsValid)
                return View(model);
            PageContentTypeHelper helper = new PageContentTypeHelper();
            if (helper.ContentTypeExists(model.Name))
            {
                ModelState.AddModelError("", "Content Type already exists.");
            }
            else
            {
                DateTime CurrDate = DateTime.UtcNow;
                PageContentTypeModel mCType = new PageContentTypeModel
                {
                    Name = model.Name
                };
                int id = helper.Create(mCType);
                if (id > 0)
                {
                    return RedirectToAction("Index", "PageContentType");
                }
                else
                    ModelState.AddModelError("", "Creating ContentType failed. Please check your info.");

            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return View(model);
        }


        #endregion

        #region Edit

        [CustomAuthorization("PagesContentType", "Edit")]
        public ActionResult Edit(int id)
        {
            return View(new PageContentTypeHelper().GetById(id));
        }

        [CustomAuthorization("PagesContentType", "Edit")]
        [HttpPost]
        public ActionResult Edit(PageContentTypeModel model)
        {
            if (!ModelState.IsValid)
                return View(model);
            PageContentTypeHelper helper = new PageContentTypeHelper();
            PageContentTypeModel item = helper.GetById(model.id);
            item.Name = model.Name;
            
            if (helper.update(item))
            {
                return RedirectToAction("Index");
            }
            else
                ModelState.AddModelError("", "Updating Page Content Type failed. Please check your info.");



            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return View(model);
        }
        #endregion


    }
}