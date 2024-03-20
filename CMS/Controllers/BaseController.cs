
using Data.Common;
using Data.Helpers;
using Data.Models;
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
                ViewBag.CMSUserID = Convert.ToInt32(Request.Cookies[Sitesettings.AdminCookie].Value);
            }

           
            if (!context.IsChildAction)
            {
                if (ViewBag.CMSUserID != null && ViewBag.CMSUserID > 0)
                {
                    AdminHelper helper = new AdminHelper();
                    AdminModel item = helper.GetById(ViewBag.CMSUserID);
                    ViewBag.CMSUserName = item != null ? item.UserName : "";
                }
                else
                {
                    string returnURL = Request.RawUrl;
                    context.Result = new RedirectResult("~/Account/Login?returnUrl=" + returnURL);
                }
            }

            ViewBag.pagemodify = 1;
            LangId = Utilities.GetCMSLanguage(Sitesettings.CMSLangCookieName);
            //  ViewBag.LangID = LangId;
            base.OnActionExecuting(context);


        }
    }
}