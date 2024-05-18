using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Data.Models;
using Data.Helpers;
using Data.Common;
using System.Collections;
using System.Configuration;
using Data;
using Newtonsoft.Json;

namespace CMS.Controllers
{
    public class HomeController : BaseController
    {

        public ActionResult Index(int id = 0)
        {
            if (id > 0)
            {
                ViewBag.createdpageid = "#apage" + id;
            }

            return View();
        }
        public ActionResult PageNotFound()
        {
            Response.TrySkipIisCustomErrors = true;
            //Set status code And message; you could also use the HttpStatusCode enum System.Net.HttpStatusCode.NotFound
            Response.StatusCode = (int)System.Net.HttpStatusCode.NotFound;
            Response.StatusDescription = "Page not found";
            return View();
        }

        public ActionResult UnAuthorized()
        {
            Response.TrySkipIisCustomErrors = true;
            //Set status code And message; you could also use the HttpStatusCode enum System.Net.HttpStatusCode.NotFound
            Response.StatusCode = (int)System.Net.HttpStatusCode.Unauthorized;
            Response.StatusDescription = "Unauthorized";
            return View();
        }

        

        public ActionResult ClearCache()
        {

            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        [ValidateInput(false)]
        public ActionResult ClearCache(FormCollection obj)
        {
            List<string> keys = new List<string>();
            IDictionaryEnumerator enumerator = HttpContext.Cache.GetEnumerator();

            while (enumerator.MoveNext())
            {
                keys.Add(enumerator.Key.ToString());
            }
            for (int i = 0; i < keys.Count; i++)
            {
                HttpContext.Cache.Remove(keys[i]);
            }
            ModelState.AddModelError("", "Website cache cleared successfully!");
            return View();
        }
      
        public PartialViewResult LefMenuPartialView()
        {
            ViewBag.Pages = new PageHelper().GetAll(LangId,true, -1);
            return PartialView();
        }

        public PartialViewResult _ExtrasLeftMenuItems()
        {
           
            return PartialView();
        }
        public PartialViewResult _LeftMainMenu()
        {

            return PartialView();
        }
        public PartialViewResult _RightMainMenu()
        {
            //NotificationModel model = new NotificationModel();
            //int totalCount = 0;
            //List<ContactSubmissionModel> contacts = new ContactSubmissionHelper().GetContactSubmission().Where(x => !x.Processed).ToList();
            //int ContactRequests = 0;
            //if (contacts != null && contacts.Count > 0)
            //    ContactRequests = contacts.Count;
            //List<NewsletterModel> newsletter = new NewsletterHelper().GetNewsletter().Where(x => !x.Processed).ToList();
            //int NewsletterRequests = 0;
            //if (newsletter != null && newsletter.Count > 0)
            //    NewsletterRequests = newsletter.Count;
            //List<CareerSubmissionModel> careers = new CareerSubmissionHelper().GetCareerSubmission().Where(x => !x.Processed).ToList();
            //int CareerRequests = 0;
            //if (careers != null && careers.Count > 0)
            //    CareerRequests = careers.Count;


            //totalCount = ContactRequests + NewsletterRequests + CareerRequests;
            //model.TotalCount = totalCount;
            //model.ContactCount = ContactRequests;
            //model.NewsltterCount = NewsletterRequests;
            //model.VacancyCount = CareerRequests;
            AdminModel myadmin = JsonConvert.DeserializeObject<AdminModel>(Request.Cookies[Sitesettings.AdminCookie].Value);          
            return PartialView(myadmin);
        }
        
        public PartialViewResult _WelcomeMenu()
        {
            return PartialView();
        }
        
        public PartialViewResult _MainMenu()
        {
            return PartialView();
        }
        public PartialViewResult _WebsiteName()
        {
            return PartialView();
        }
        

        #region "LanguageSelector"
        public ActionResult _Language()
        {
            List<LanguageModel> languages = new LanguageHelper().getLanguage();
            int LangID = Utilities.GetCMSLanguage(ConfigurationManager.AppSettings["CMSLangCookieName"]);
            ViewBag.LangID = LangID;
            ViewBag.SelectedLanguage = Utilities.GetCMSLanguageName(LangID);
            return PartialView(languages);
        }
        [HttpGet]
        public JsonResult _changeLang(int ID)
        {
            //  int LangID = int.Parse(ID);
            if (Request.Cookies[ConfigurationManager.AppSettings["CMSLang"]] != null)
            {
                Response.Cookies.Remove(ConfigurationManager.AppSettings["CMSLangCookieName"]);
                Response.Cookies[ConfigurationManager.AppSettings["CMSLangCookieName"]].Value = (ID).ToString();
                Response.Cookies[ConfigurationManager.AppSettings["CMSLangCookieName"]].Expires = DateTime.Now.AddMinutes(60);
            }
            else
            {

                Response.Cookies[ConfigurationManager.AppSettings["CMSLangCookieName"]].Value = (ID).ToString();
                Response.Cookies[ConfigurationManager.AppSettings["CMSLangCookieName"]].Expires = DateTime.Now.AddMinutes(60);
            }
            return Json(new { success = "true" }, JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region Theme Selector
        [HttpPost]
        public JsonResult _switchTheme(string currentTheme)
        {            
            AdminModel myadmin = JsonConvert.DeserializeObject<AdminModel>(Request.Cookies[Sitesettings.AdminCookie].Value);
            if (currentTheme == "light")
            {
                myadmin.Theme = "dark";
            }
            else
            {
                myadmin.Theme = "light";
            }
            new AdminHelper().updateTheme(myadmin);
            Helpers.Helpers.AddAdminCookie(myadmin);
            return Json(new { success = "true" }, JsonRequestBehavior.AllowGet);
        }
         
        #endregion


    }
}