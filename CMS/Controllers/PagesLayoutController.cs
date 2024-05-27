
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Data.Models;
using Data.Helpers;
using Data.Common;
using static Data.Common.Utilities;
using Newtonsoft.Json;
using DocumentFormat.OpenXml.Office2010.Excel;

namespace CMS.Controllers
{
    public class PagesLayoutController : BaseController
    {


        public ActionResult Index(int id)
        {
            ViewBag.pageId = id;
            PageHelper ph = new PageHelper();
            PageModel pg = ph.GetById(id, LangId);
            if (pg == null)
            {
                return RedirectToAction("Index", "Pages", new { id = Sitesettings.RootPageId });
            }
            PageModel root = ph.GetById(Sitesettings.RootPageId, LangId);
            ViewBag.RootLayout = root != null && root.mPageLayout != null? root.mPageLayout.PageHtml : "";
            ViewBag.RootHaveTemplate = root != null && root.mPageLayout != null;
            return View(pg);
        }

        [HttpPost]
        [ValidateInput(false)]
        [ValidateAntiForgeryToken]
        public JsonResult _saveLayout(int id, string htmlLayout)
        {
            PageHelper ph = new PageHelper();
            PageModel pg = ph.GetById(id, LangId);
            if (pg == null)
            {
                return Json(new { success=false }, JsonRequestBehavior.AllowGet);
            }

            PageLayoutHelper phl = new PageLayoutHelper();
            if (pg.mPageLayout != null)
            {
                pg.mPageLayout.PageHtml = htmlLayout;
                phl.update(pg.mPageLayout);
                new LogsHelper().Create(ViewBag.CMSUserID, "Page layout", "User '" + ViewBag.CMSUserName + "' updated a page layout of: '" + pg.Name + "'");
            }
            else
            {
                int returnedId = phl.Create(new PageLayoutModel
                {
                    PageHtml = htmlLayout,
                    PageId = id,
                    CreatedDate = DateTime.Now,
                    CreatedBy = ViewBag.CMSUserName
                });
                new LogsHelper().Create(ViewBag.CMSUserID, "Page layout", "User '" + ViewBag.CMSUserName + "' created a page layout of: '" + pg.Name + "'");
            }

            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }


    }
}