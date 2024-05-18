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
using System.Configuration;
using DocumentFormat.OpenXml.Office2010.Excel;
using OfficeOpenXml;
using CMS.Extensions;

namespace CMS.Controllers
{
    public class AdminRolesController : BaseController
    {
        [CustomAuthorization("AdminRole", "View")]
        public ActionResult Index(int page = 1, string search = "",string deleteError="")
        {
            int totalrec = 0; int pagesize = 20;
            List<AdminGroupModel> L = new AdminRolesHelper().GetAllGroups(pagesize, page, ref totalrec, search);
            ViewBag.search = search;
            ViewBag.pageSize = pagesize;
            ViewBag.totalCount = totalrec;
            ViewBag.page = page;
            ViewBag.deleteError = deleteError;
            return View(L);
        }
        [CustomAuthorization("AdminRole", "Delete")]
        public ActionResult Delete(int id)
        {

            bool isDeleted = new AdminRolesHelper().DeleteGroup(id);
            
            return RedirectToAction("Index", new { deleteError = !isDeleted ?"Group already contains users.":"" });
        }
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult _GetUsersByGroup(int id)
        {
            List<AdminModel> admins = new AdminRolesHelper().GetAllUsersByGroup(id);
            string data = JsonConvert.SerializeObject(admins);
            return Json(new { data = data }, JsonRequestBehavior.AllowGet);
        }

        public PartialViewResult _CurrentUserRolesPartial(string controller="")
        {
            List<AdminGroupRoleModel> l = ViewBag.UserGroupRoles as List<AdminGroupRoleModel>;
            List<string> roles =new List<string>();
            if (!string.IsNullOrWhiteSpace(controller))
            {
                roles = l.Where(z=>z.AdminGroup.Roles.Contains(controller)).Select(x=>x.AdminGroup.Roles).ToList();
                
            }
            return PartialView(roles);
        }


        public PartialViewResult _RolesPermissions(AdminGroupModel mdle = null)
        {
            List<RolesPermissionsCls> cls = getRolesJson();
            ViewBag.AdminRoles = mdle;
            return PartialView(cls);
        }

        #region "Create"
        [CustomAuthorization("AdminRole", "Create")]
        public ActionResult Create()
        {

            AdminGroupModel mdle = new AdminGroupModel();
            return View(mdle);
        }


        [CustomAuthorization("AdminRole", "Create")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(AdminGroupModel model, FormCollection obj)
        {

            AdminRolesHelper helper = new AdminRolesHelper();
            if (helper.GroupExists(model))
            {
                ModelState.AddModelError("", "Group name already exists.");
            }
            else
            {

                AdminGroupModel group = new AdminGroupModel
                {
                    GroupName = model.GroupName,
                    CreatedDate = DateTime.UtcNow,
                };
                List<string> Roles = getSelectedRoles(obj);
                group.Roles = Roles.Any() ? string.Join("|", Roles.ToArray()) : "";

                int groupId = helper.CreateGroup(group);
                if (groupId > 0)
                {
                    new LogsHelper().Create(ViewBag.CMSUserID, "Admin Roles Page", "User '" + ViewBag.CMSUserName + "' created a users group: '" + model.GroupName + "'");
                    return RedirectToAction("Index", "AdminRoles");
                }
                else
                    ModelState.AddModelError("", "Creating users group failed. Please check your info.");

            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return View(model);
        }
        #endregion

        #region "Edit"
        [CustomAuthorization("AdminRole", "Edit")]
        public ActionResult Edit(int ID)
        {

            AdminGroupModel mdle = new AdminRolesHelper().GetGroupById(ID);
            return View(mdle);
        }

        [CustomAuthorization("AdminRole", "Edit")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(AdminGroupModel group, FormCollection obj)
        {

            AdminRolesHelper helper = new AdminRolesHelper();
            if (helper.GroupExists(group))
            {
                ModelState.AddModelError("", "Group already exists.");
            }
            else
            {
                List<string> Roles = getSelectedRoles(obj);

                group.Roles = Roles.Any() ? string.Join("|", Roles.ToArray()) : "";

                bool updated = helper.EditGroup(group);
                if (updated)
                {
                    new LogsHelper().Create(ViewBag.CMSUserID, "Admin Roles Page", "User '" + ViewBag.CMSUserName + "' updated a users group: '" + group.GroupName + "'");
                    return RedirectToAction("Index", "AdminRoles");
                }
                else
                    ModelState.AddModelError("", "Updating users group failed. Please check your info.");

            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();

            return View(group);
        }

        private List<string> getSelectedRoles(FormCollection obj)
        {
            List<string> filteredKeys = obj.AllKeys.Where(x => x.Contains("role_")).ToList();
            List<string> Roles = new List<string>();
            foreach (string key in filteredKeys)
            {
                string controller = key.Replace("role_", "");
                string roles = !string.IsNullOrWhiteSpace(obj[key]) ? obj[key] : "";
                Roles.Add(controller + "," + roles);
            }
            return Roles;
        }

        #endregion



        private List<RolesPermissionsCls> getRolesJson()
        {
            string rolesFile = Server.MapPath(Sitesettings.RolesJsonFile);
            string rolesDoc = Data.Common.Utilities.ReadFile(rolesFile);
            List<RolesPermissionsCls> cls = JsonConvert.DeserializeObject<List<RolesPermissionsCls>>(rolesDoc);
            return cls;
        }



    }
}
