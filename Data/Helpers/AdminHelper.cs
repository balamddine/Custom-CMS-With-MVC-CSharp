﻿using Data.Common;
using Data.Models;
using OfficeOpenXml.Drawing.Chart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Security;

namespace Data.Helpers
{

    public class AdminHelper
    {
        public List<AdminModel> GetCMSUser()
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var CMSUsers = cnx.Admins.Where(x => !x.isDeleted).ToList();
                    List<AdminModel> c = new List<AdminModel>();
                    foreach (var item in CMSUsers)
                        c.Add(AdminModel.GetFromCMSUser(item));

                    return c;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "User", "Get All");
                return null;
            }

        }
        public bool UserExists(string Username)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Admins.Any(x => x.UserName == Username))
                        return true;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "User", "User Exists");
            }
            return false;
        }
        public AdminModel GetById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Admins.Any(x => x.Id == id))
                        return AdminModel.GetFromCMSUser(cnx.Admins.First(x => x.Id == id));
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Get by ID");
            }
            return null;
        }

        public AdminModel GetCMSUserByUsernameAndPassword(string Email, string Pwd)
        {
            try
            {
                using (IMDGEntities ctx = new IMDGEntities())
                {
                    if (ctx.Admins.Any(x => x.UserName == Email))
                        return AdminModel.GetFromCMSUser(ctx.Admins.First(x => x.UserName == Email && x.Pwd == Pwd));
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Get by UserName");
            }
            return null;
        }
        public AdminModel GetCMSUserByUsername(string Email)
        {
            try
            {
                using (IMDGEntities ctx = new IMDGEntities())
                {
                    if (ctx.Admins.Any(x => x.UserName == Email))
                        return AdminModel.GetFromCMSUser(ctx.Admins.First(x => x.UserName == Email));
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Get by UserName");
            }
            return null;
        }

        public int Create(AdminModel model, List<AdminGroupRoleModel> Roles)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    Admin t = new Admin
                    {
                        UserName = model.UserName,
                        Pwd = model.Pwd,
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        isDeleted = model.isDeleted,
                        isDisabled = model.isDisabled,
                        CreateDate = model.CreateDate,

                        Email = model.Email,
                        Theme = "light"
                    };

                    cnx.Admins.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.Id;
                    if(Roles != null && Roles.Count > 0)
                    {
                        foreach (var item in Roles)
                        {
                            cnx.AdminGroupRoles.Add(new AdminGroupRole
                            {
                                AdminId = ReturnedID,
                                GroupId = item.GroupId,
                            });
                        }
                    }
                    else
                    {
                        cnx.AdminGroupRoles.Add(new AdminGroupRole
                        {
                            AdminId = ReturnedID,
                            GroupId = 1,
                        });
                    }
                    cnx.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Create");
            }
            return ReturnedID;
        }
        public bool update(AdminModel model, List<AdminGroupRoleModel> Roles)
        {
            try
            {
                List<AdminGroupRole> l = ConverttoAdminRoles(model.AdminGroupRoles);
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Admins.Any(x => x.Id == model.ID))
                    {
                        Admin t = cnx.Admins.First(x => x.Id == model.ID);
                        t.Id = model.ID;
                        t.UserName = model.UserName;
                        t.FirstName = model.FirstName;
                        t.LastName = model.LastName;
                        t.isDeleted = model.isDeleted;
                        t.Email = model.Email;
                        t.isDisabled = model.isDisabled;
                        t.Theme = model.Theme;
                        t.AdminGroupRoles = l;
                       
                        
                        cnx.AdminGroupRoles.RemoveRange(t.AdminGroupRoles);
                        cnx.SaveChanges();
                        if (model.ID != 1)
                        {
                            if (Roles != null && Roles.Count > 0)
                            {
                                foreach (var item in Roles)
                                {
                                    cnx.AdminGroupRoles.Add(new AdminGroupRole
                                    {
                                        AdminId = model.ID,
                                        GroupId = item.GroupId,
                                    });
                                }
                            }
                            else
                            {
                                cnx.AdminGroupRoles.Add(new AdminGroupRole
                                {
                                    AdminId = model.ID,
                                    GroupId = 1,
                                });
                            }


                            cnx.SaveChanges();
                        }
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Update");
            }
            return false;
        }

        private List<AdminGroupRole> ConverttoAdminRoles(List<AdminGroupRoleModel> adminGroupRoles)
        {
            List<AdminGroupRole> l = new List<AdminGroupRole>();
            foreach (var item in adminGroupRoles)
            {
                l.Add(new AdminGroupRole
                {
                    Id = item.Id,
                    AdminId = item.AdminId,
                    GroupId = item.GroupId,
                });
            }
            return l;
        }

        public bool updatePass(int ID, string Pass)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Admins.Any(x => x.Id == ID))
                    {
                        Admin t = cnx.Admins.First(x => x.Id == ID);
                        t.Pwd = Pass;
                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Update Password");
            }
            return false;
        }
        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Admins.Any(x => x.Id == id))
                    {
                        var c = cnx.Admins.First(x => x.Id == id);
                        c.isDeleted = true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Delete");
            }
        }

        public bool updateTheme(AdminModel model)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Admins.Any(x => x.Id == model.ID))
                    {
                        Admin t = cnx.Admins.First(x => x.Id == model.ID);

                        t.Theme = model.Theme;
                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "updateTheme");
            }
            return false;
        }
    }

}
