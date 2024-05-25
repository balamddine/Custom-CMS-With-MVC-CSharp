
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
            PageModel pg = new PageHelper().GetById(id, LangId);
            if (pg == null)
            {
                return RedirectToAction("Index", "Pages", new { id = Sitesettings.RootPageId });
            }
            PageModel root = ph.GetById(Sitesettings.RootPageId, LangId);    
            ViewBag.RootHaveTemplate = root != null && root.mPageLayout!=null;
            return View(pg);
        }
       
      
    }
}