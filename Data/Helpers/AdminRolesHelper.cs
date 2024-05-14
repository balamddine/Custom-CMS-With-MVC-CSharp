using Data.Common;
using Data.Models;
using Microsoft.VisualBasic.ApplicationServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Data.Helpers
{

    public class AdminRolesHelper
    {
        public List<AdminGroupModel> GetAllGroups(int pageSize, int currentPage, ref int totalrec, string keyword = "")
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    IQueryable<AdminGroup> query = cnx.AdminGroups;
                    if (!string.IsNullOrWhiteSpace(keyword))
                    {
                        query = query.Where(x => x.GroupName.ToLower().Contains(keyword));
                    }
                    

                    totalrec = query.Count();
                    var L = query.ToList().OrderByDescending(x => x.CreatedDate).ToList().Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    List<AdminGroupModel> c = new List<AdminGroupModel>();
                    foreach (var item in query)
                        c.Add(AdminGroupModel.GetFromModel(item));
                    cnx.Dispose();
                    return c;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AdminRolesHelper", "GetAllGroups");
                return null;
            }

        }
 
        public void DeleteGroup(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.AdminGroups.Any(x => x.Id == id))
                    {
                        var c = cnx.AdminGroups.First(x => x.Id == id);
                        cnx.AdminGroups.Remove(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AdminRolesHelper", "DeleteGroup");
            }
        }

        public List<AdminGroupModel> GetAllUsersGroups(int userId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    IQueryable<AdminGroupRole> query = cnx.AdminGroupRoles.Where(x => x.AdminId == userId);
                    
                    List<AdminGroupModel> c = new List<AdminGroupModel>();
                    foreach (var item in query)
                        c.Add(AdminGroupModel.GetFromModel(item.AdminGroup));
                    cnx.Dispose();
                    return c;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AdminRolesHelper", "GetAllUsersGroups");
                return null;
            }
        }

        public List<AdminModel> GetAllUsersByGroup(int GroupId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    IQueryable<AdminGroupRole> query = cnx.AdminGroupRoles.Where(x => x.GroupId==GroupId);
                    List<AdminModel> c = new List<AdminModel>();
                    foreach (var item in query)
                        c.Add(AdminModel.GetFromCMSUser(item.Admin));
                    cnx.Dispose();
                    return c;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AdminRolesHelper", "GetAllUsersByGroup");
                return null;
            }
        }

        public bool GroupExists(string groupName)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.AdminGroups.Any(x => x.GroupName.Trim().ToLower() == groupName.Trim().ToLower()))
                    {
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AdminRolesHelper", "GroupExists");
            }
            return false;
        }

        public int CreateGroup(AdminGroupModel item)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    AdminGroup t = new AdminGroup
                    {
                        GroupName = item.GroupName,
                        Roles = item.Roles,
                        CreatedDate = item.CreatedDate
                    };
                    cnx.AdminGroups.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.Id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AdminRolesHelper", "CreateGroup");
            }
            return ReturnedID;
        }

        public AdminGroupModel GetGroupById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {                     
                    return AdminGroupModel.GetFromModel(cnx.AdminGroups.FirstOrDefault(x => x.Id==id));                    
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AdminRolesHelper", "AdminGroupModel");
            }
            return null;
        }
    }

}
