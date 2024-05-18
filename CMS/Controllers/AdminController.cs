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
using Data;
using System.Data.Entity.Migrations.Model;
using CMS.Extensions;

namespace CMS.Controllers
{
    public class AdminController : BaseController
    {
        ///GET: CMSUser
        [CustomAuthorization("AdminSettings", "View")]
        public ActionResult Index()
        {
            return View(new AdminHelper().GetCMSUser());
        }
        [CustomAuthorization("AdminSettings", "Delete")]
        public ActionResult Delete(int id)
        {
            new AdminHelper().Delete(id);
            return RedirectToAction("Index");
        }

        #region "Create"
        [CustomAuthorization("AdminSettings", "Create")]
        public ActionResult Create()
        {
            ViewBag.CMSUserID = 0;
            ViewBag.CMSUserName = "";
            if (Request.Cookies[Sitesettings.AdminCookie] != null || Request.Cookies[Sitesettings.AdminCookie].Value.ToString() != "")
            {                
                AdminModel item = JsonConvert.DeserializeObject<AdminModel>(Request.Cookies[Sitesettings.AdminCookie].Value);
                ViewBag.CMSUserID = item.ID;
                ViewBag.CMSUserName = item.UserName;
            }

            CMS.Models.UserRegisterModel model = new CMS.Models.UserRegisterModel();
            int totalrec = 0;
            model.AdminGroupRoles = new AdminRolesHelper().GetAllGroups(1000, 1, ref totalrec, "");
            return View(model);
        }
        [CustomAuthorization("AdminSettings", "Create")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(CMS.Models.UserRegisterModel model, FormCollection obj)
        {
            AdminHelper helper = new AdminHelper();
            if (helper.UserExists(model.UserName))
            {
                ModelState.AddModelError("", "Username already exists.");
            }
            else
            {
                DateTime CurrDate = DateTime.UtcNow;
                string pass = Utilities.EncryptPassword(model.Password);

                string selectedRoles = obj["AdminGroupRoles"];
                List<AdminGroupRoleModel> roles = new List<AdminGroupRoleModel>();
                foreach (var item in selectedRoles.Split(','))
                {
                    roles.Add(new AdminGroupRoleModel
                    {
                        AdminId = 0,
                        GroupId = Convert.ToInt32(item)
                    });
                }
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
                int UserID = helper.Create(user, roles);
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
            int totalrec = 0;
            model.AdminGroupRoles = new AdminRolesHelper().GetAllGroups(1000, 1, ref totalrec, "");
            return View(model);
        }
        #endregion

        #region "Edit"
        [CustomAuthorization("AdminSettings", "Edit")]
        public ActionResult Edit(int ID)
        {
            int totalrec = 0;
            ViewBag.AdminGroupRoles = new AdminRolesHelper().GetAllGroups(1000, 1, ref totalrec, "");
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
                Email = model.Email,
                AdminGroupRoles = model.AdminGroupRoles
            };
            return View(editmodel);
        }

        [CustomAuthorization("AdminSettings", "Edit")]
        [HttpPost]
        public ActionResult Edit(CMSUserEditModel model, FormCollection obj)
        {

            AdminHelper helper = new AdminHelper();
            AdminModel item = helper.GetCMSUserByUsername(model.UserName);
            if (item != null && item.ID > 0 && item.ID != model.ID)
            {
                ModelState.AddModelError("", "This Username already exists.");
            }
            else
            {
               
                string selectedRoles = !string.IsNullOrWhiteSpace(obj["AdminGroupRoles"]) ? obj["AdminGroupRoles"].ToString() : "";
                List<AdminGroupRoleModel> roles = new List<AdminGroupRoleModel>();
                foreach (string role in selectedRoles.Split(','))
                {
                    roles.Add(new AdminGroupRoleModel
                    {
                        AdminId = item.ID,
                        GroupId = Convert.ToInt32(role)
                    });
                }

                AdminModel user = new AdminModel
                {
                    Email = model.Email,
                    CreateDate = model.CreateDate,
                    FirstName = model.FirstName,
                    isDeleted = false,
                    LastName = model.LastName,
                    ID = model.ID,
                    UserName = model.UserName,
                    isDisabled = model.isDisabled,
                    AdminGroupRoles = item.AdminGroupRoles
                    // Password = pass

                };
                if (item.ID == 1) // not admin
                {
                    roles = new List<AdminGroupRoleModel>();
                }
                bool IsUpdated = helper.update(user, roles);
                if (IsUpdated)
                {
                    new LogsHelper().Create(ViewBag.CMSUserID, "Edit user", "User '" + ViewBag.CMSUserName + "' Edit the information of: '" + item.UserName + "'");
                    return RedirectToAction("Index");
                }
                else
                    ModelState.AddModelError("", "Creating CMSUser failed. Please check your info.");

            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();
            int totalrec = 0;
            ViewBag.AdminGroupRoles = new AdminRolesHelper().GetAllGroups(1000, 1, ref totalrec, "");
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
