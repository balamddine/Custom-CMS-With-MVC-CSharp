
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

namespace CMS.Controllers
{
    public class AccountController : Controller
    {

        #region "Login"
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }
        public PartialViewResult _Logout()
        {
          
            return PartialView();
        }        
        [HttpPost]
        public ActionResult Login(CMS.Models.UserLoginModel model, string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            AdminHelper helper = new AdminHelper();
            string pass = Utilities.EncryptPassword(model.Password);
            AdminModel item = helper.GetCMSUserByUsernameAndPassword(model.Username,pass);

            if (item != null && item.ID > 0)
            {
                if (item.isDisabled)
                {
                    ModelState.AddModelError("", "This account is currently disabled.");
                    return View(model);
                }
                if (item.Pwd != item.Pwd)
                    ModelState.AddModelError("", "Username or password are incorrect.");
                else
                {
                    Session[Sitesettings.CMSAdminSessionName] = item;
                    AddAdminCookie(item);

                    if (returnUrl != "")
                        return RedirectToLocal(returnUrl);
                    else
                        return RedirectToAction("Index", "Home");
                }
            }
            else
            {
                ModelState.AddModelError("", "Username or password are incorrect.");
            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return View(model);
        }

        private void AddAdminCookie(AdminModel item)
        {
            HttpCookie mycookie = new HttpCookie(Sitesettings.AdminCookie);
            mycookie.Value = JsonConvert.SerializeObject(item);
            mycookie.Expires = DateTime.Now.AddDays(7);
            Response.Cookies.Add(mycookie);
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }
        public ActionResult LogOff()
        {
            HttpCookie currentUserCookie = Request.Cookies[Sitesettings.AdminCookie];
            Response.Cookies.Remove(Sitesettings.AdminCookie);
            currentUserCookie.Expires = DateTime.Now.AddDays(-10);
            currentUserCookie.Value = null;
            Response.SetCookie(currentUserCookie);
            Session.Abandon();

            return RedirectToAction("Login", "Account");
        }
        #endregion

      
    }
}