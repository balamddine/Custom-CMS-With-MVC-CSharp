using Data.Helpers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Website.Models;

namespace Website.Controllers
{
    public class HomeController : BaseController
    {
        

        public ActionResult Index()
        {
            HomePageContentModel model = new HomePageContentModel();
            //int totalrec = 0;
            //ViewBag.ProjectL = new ProjectHelper().Search(Langid, 6, 1, ref totalrec);
            
            return View(model);
        }

        public PartialViewResult _Header()
        {
            HomePageContentModel model = new HomePageContentModel();
            model.languagesL = new LanguageHelper().getLanguage();
            model.selectedlangid = base.Langid;
            model.selectedlangName = (from x in model.languagesL where x.Id == Langid select x).FirstOrDefault().Name;
            return PartialView(model);
        }

        #region language switcher
        [HttpPost]
        public JsonResult _switchLangauge(string langCulture)
        {
            HttpCookie mycookie = new HttpCookie(ConfigurationManager.AppSettings["WebsiteLang"]);

            mycookie.Value = langCulture;
            mycookie.Expires = DateTime.Now.AddYears(1);
            HttpContext.Response.Cookies.Add(mycookie);

            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }
        #endregion
        public PartialViewResult _Footer()
        {
            
            return PartialView();
        }


    }
}