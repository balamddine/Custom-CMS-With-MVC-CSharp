
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Data.Models;
using Data.Helpers;
using Data.Common;

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
            AdminModel item = helper.GetCMSUserByUsername(model.Username);
            //string pass = Helpers.Common.Utilities.EncryptPassword(model.Password);
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
            mycookie.Value = (item.ID).ToString();
            mycookie.Expires = DateTime.Now.AddMinutes(60);
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

        #region "Register"
        public ActionResult Register()
        {
            //if (Request.Cookies["Admin"] == null || Request.Cookies["Admin"].Value.ToString() == "")
            //    return RedirectToAction("Login", "Account", new { returnUrl = "/Account/Register" });
            ViewBag.CMSUserID = 0;
            ViewBag.CMSUserName = "";
            if (Request.Cookies[Sitesettings.AdminCookie] != null || Request.Cookies[Sitesettings.AdminCookie].Value.ToString() != "")
            {
                AdminHelper helper = new AdminHelper();
                AdminModel item = helper.GetById(Convert.ToInt32(Request.Cookies[Sitesettings.AdminCookie].Value));
                ViewBag.CMSUserID = item.ID;
                ViewBag.CMSUserName = item.UserName;
            }
            CMS.Models.UserRegisterModel model = new CMS.Models.UserRegisterModel();

            return View(model);
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Register(CMS.Models.UserRegisterModel model,FormCollection obj)
        {
            if (!ModelState.IsValid)
                return View(model);
            AdminHelper helper = new AdminHelper();
            if (helper.UserExists(model.UserName))
            {
                ModelState.AddModelError("", "Username already exists.");
            }
            else
            {
                DateTime CurrDate = DateTime.UtcNow;
                string pass = Utilities.EncryptPassword(model.Password);
                AdminModel user = new AdminModel
                {
                    Email = model.Email,
                    CreateDate = CurrDate,
                    FirstName = model.FirstName,
                    isDeleted = false,
                    LastName = model.LastName,
                    Pwd = pass,
                    UserName = model.UserName,
                    CMSUserRoleId = 1,
                    isDisabled = false
                };
                int CMSUserID = Convert.ToInt32(obj["CMSUserID"].ToString());
                string CMSUserName = obj["CMSUserName"].ToString();
                int UserID = helper.Create(user);
                if (UserID > 0)
                {
                    new LogsHelper().Create(CMSUserID, "Create user", "User '" + CMSUserName + "' Created a new user with username: '" + model.UserName + "'");
                    return RedirectToAction("Index", "Admin");
                }
                else
                    ModelState.AddModelError("", "Creating CMSUser failed. Please check your info.");

            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return View(model);
        }
        #endregion
    }
}