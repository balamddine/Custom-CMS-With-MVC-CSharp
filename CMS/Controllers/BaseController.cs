
using Data.Common;
using Data.Helpers;
using Data.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CMS.Controllers
{
    public class BaseController : Controller
    {

        public int LangId = 0;
        // GET: Base
        protected override void OnActionExecuting(ActionExecutingContext context)
        {
            if (Request.Cookies[Sitesettings.AdminCookie] == null || Request.Cookies[Sitesettings.AdminCookie].Value.ToString() == "")
            {
                string returnURL = Request.RawUrl;
                context.Result = new RedirectResult("~/Account/Login?returnUrl=" + returnURL);
            }
            else
            {
                AdminModel item = JsonConvert.DeserializeObject<AdminModel>(Request.Cookies[Sitesettings.AdminCookie].Value);
                ViewBag.CMSUserID = item.ID;
                ViewBag.CurrentUser = item;
            }


            // if (!context.IsChildAction)
            //  {
            if (ViewBag.CurrentUser != null && ViewBag.CMSUserID > 0)
            {
               
                AdminModel item = ViewBag.CurrentUser as AdminModel;
                ViewBag.CMSUserName = item != null ? item.UserName : "";
                ViewBag.theme = item != null ? item.Theme : "light";
                ViewBag.UserGroupRoles = item != null ? item.AdminGroupRoles : new List<AdminGroupRoleModel>();
                ViewBag.bodyThemeClass = item != null ? (item.Theme == "dark" ? "dark-mode" : "") : "";
            }
            else
            {
                string returnURL = Request.RawUrl;
                context.Result = new RedirectResult("~/Account/Login?returnUrl=" + returnURL);
            }
            // }

            ViewBag.pagemodify = 1;
            LangId = Utilities.GetCMSLanguage(Sitesettings.CMSLangCookieName);
            ViewBag.LangID = LangId;
            base.OnActionExecuting(context);


        }
    }
}