using CMS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Data.Models;
using Data.Helpers;
using Data.Common;
using Newtonsoft.Json;

namespace CMS.Controllers
{
    public class AdminController : BaseController
    {
        ///GET: CMSUser
        public ActionResult Index()
        {
            return View(new AdminHelper().GetCMSUser());
        }
        public ActionResult Delete(int id)
        {
            new AdminHelper().Delete(id);
            return RedirectToAction("Index");
        }

        #region "Create"
        public ActionResult Create()
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
        public ActionResult Create(CMS.Models.UserRegisterModel model, FormCollection obj)
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

        #region "Edit"
        public ActionResult Edit(int ID)
        {

           AdminModel model = new AdminHelper().GetById(ID);
            CMSUserEditModel editmodel = new CMSUserEditModel
            {
                CreateDate = model.CreateDate,
                ID = model.ID,
                isDeleted = model.isDeleted,
                FirstName = model.FirstName,
                UserName = model.UserName,
                LastName = model.LastName,
                isDisabled = model.isDisabled,
                Email = model.Email                
            };           
            return View(editmodel);
        }
        [HttpPost]
        public ActionResult Edit(CMSUserEditModel model)
        {
            if (!ModelState.IsValid)
                return View(model);
            AdminHelper helper = new AdminHelper();
            AdminModel item = helper.GetCMSUserByUsername(model.UserName);
            if (item != null && item.ID > 0 && item.ID != model.ID)
            {
                ModelState.AddModelError("", "This Username already exists.");
            }
            else
            {
                //DateTime CurrDate = DateTime.Now;
                //string pass = Common.Utility.EncryptPassword(model.Password);
                AdminModel user = new AdminModel
                {
                    Email = model.Email,
                    CreateDate = model.CreateDate,
                    FirstName = model.FirstName,
                    isDeleted = false,
                    LastName = model.LastName,
                    ID = model.ID,
                    UserName = model.UserName,
                    isDisabled = model.isDisabled
                    // Password = pass

                };
                if (helper.update(user))
                {
                    new LogsHelper().Create(ViewBag.CMSUserID, "Edit user", "User '" + ViewBag.CMSUserName + "' Edit the information of: '" + item.UserName+"'");
                    return RedirectToAction("Index");
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


        #region "Change Pass"
        public ActionResult ChangePassword(int ID)
        {
            AdminModel user = new AdminHelper().GetById(ID);
            CMSUserChangePass model = new CMSUserChangePass();
            model.ID = user.ID;
            ViewBag.Username = user.UserName;
            return View(model);

        }
        [HttpPost]
        public ActionResult ChangePassword(CMSUserChangePass model)
        {
            if (!ModelState.IsValid)
                return View(model);
            AdminHelper helper = new AdminHelper();
            AdminModel item = helper.GetById(model.ID);
            if (item != null && item.ID > 0)
            {

                string oldPass = Utilities.EncryptPassword(model.OldPass);
                string newPass = Utilities.EncryptPassword(model.Password);
                if (item.Pwd == oldPass)
                {
                    if (helper.updatePass(model.ID, newPass))
                    {
                        new LogsHelper().Create(ViewBag.CMSUserID, "Change Password", "User '" + ViewBag.CMSUserName + "' changed password of: '" + item.UserName + "'");
                        return RedirectToAction("Index");
                    }
                    else
                        ModelState.AddModelError("", "Updating password failed. Please check your info.");
                }
                else
                    ModelState.AddModelError("", "Your current password is incorrect.");

            }
           
            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();
            return View(model);
        }
        #endregion

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult _getUsersGroups(int id)
        {
            List<AdminGroupModel> adminGroupModels = new AdminRolesHelper().GetAllUsersGroups(id);
            string data = JsonConvert.SerializeObject(adminGroupModels);
            return Json(new { data = data }, JsonRequestBehavior.AllowGet);
        }
                

    }
}
