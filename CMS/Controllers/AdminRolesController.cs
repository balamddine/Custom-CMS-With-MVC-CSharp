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

namespace CMS.Controllers
{
    public class AdminRolesController : BaseController
    {
        public ActionResult Index(int page = 1, string search = "")
        {
            int totalrec = 0; int pagesize = 20;
            List<AdminGroupModel> L = new AdminRolesHelper().GetAllGroups(pagesize, page, ref totalrec, search);
            ViewBag.search = search;
            ViewBag.pageSize = pagesize;
            ViewBag.totalCount = totalrec;
            ViewBag.page = page;

            





            return View(L);
        }

        public ActionResult Delete(int id)
        {
            new AdminRolesHelper().DeleteGroup(id);
            return RedirectToAction("Index");
        }
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult _GetUsersByGroup(int id)
        {
            List<AdminModel> admins = new AdminRolesHelper().GetAllUsersByGroup(id);
            string data = JsonConvert.SerializeObject(admins);
            return Json(new { data = data }, JsonRequestBehavior.AllowGet);
        }

        public PartialViewResult _RolesPermissions()
        {
            List<RolesPermissionsCls> cls = getRolesJson();            
            return PartialView(cls);
        }

        #region "Create"
        public ActionResult Create()
        {

            AdminGroupModel mdle = new AdminGroupModel();           
            return View(mdle);
        }

        private List<RolesPermissionsCls> getRolesJson()
        {
            string rolesFile = Server.MapPath(Sitesettings.RolesJsonFile);
            string rolesDoc = Data.Common.Utilities.ReadFile(rolesFile);
            List<RolesPermissionsCls> cls = JsonConvert.DeserializeObject<List<RolesPermissionsCls>>(rolesDoc);
            return cls;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(AdminGroupModel model, FormCollection obj)
        {
            if (!ModelState.IsValid)
                return View(model);
            AdminRolesHelper helper = new AdminRolesHelper();
            if (helper.GroupExists(model.GroupName))
            {
                ModelState.AddModelError("", "Users group already exists.");
            }
            else
            {
                DateTime CurrDate = DateTime.UtcNow;

                AdminGroupModel group = new AdminGroupModel
                {
                    GroupName = model.GroupName,
                    CreatedDate = CurrDate,                    
                };

               
                int UserID = helper.CreateGroup(group);
                if (UserID > 0)
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


        //#region "Edit CMS User"
        //public ActionResult Edit(int ID)
        //{

        //   AdminModel model = new AdminHelper().GetById(ID);
        //    CMSUserEditModel editmodel = new CMSUserEditModel
        //    {
        //        CreateDate = model.CreateDate,
        //        ID = model.ID,
        //        isDeleted = model.isDeleted,
        //        FirstName = model.FirstName,
        //        UserName = model.UserName,
        //        LastName = model.LastName,
        //        isDisabled = model.isDisabled,
        //        Email = model.Email                
        //    };           
        //    return View(editmodel);
        //}
        //[HttpPost]
        //public ActionResult Edit(CMSUserEditModel model)
        //{
        //    if (!ModelState.IsValid)
        //        return View(model);
        //    AdminHelper helper = new AdminHelper();
        //    AdminModel item = helper.GetCMSUserByUsername(model.UserName);
        //    if (item != null && item.ID > 0 && item.ID != model.ID)
        //    {
        //        ModelState.AddModelError("", "This Username already exists.");
        //    }
        //    else
        //    {
        //        //DateTime CurrDate = DateTime.Now;
        //        //string pass = Common.Utility.EncryptPassword(model.Password);
        //        AdminModel user = new AdminModel
        //        {
        //            Email = model.Email,
        //            CreateDate = model.CreateDate,
        //            FirstName = model.FirstName,
        //            isDeleted = false,
        //            LastName = model.LastName,
        //            ID = model.ID,
        //            UserName = model.UserName,
        //            isDisabled = model.isDisabled
        //            // Password = pass

        //        };
        //        if (helper.update(user))
        //        {
        //            new LogsHelper().Create(ViewBag.CMSUserID, "Edit user", "User '" + ViewBag.CMSUserName + "' Edit the information of: '" + item.UserName+"'");
        //            return RedirectToAction("Index");
        //        }
        //        else
        //            ModelState.AddModelError("", "Creating CMSUser failed. Please check your info.");

        //    }

        //    var errors = ModelState.Select(x => x.Value.Errors)
        //               .Where(y => y.Count > 0)
        //               .ToList();

        //    return View(model);
        //}
        //#endregion


    }
}
