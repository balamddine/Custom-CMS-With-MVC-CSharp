using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
                Utilities.LogError(ex);
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
                Utilities.LogError(ex, "User", "Delete");
            }
        }

    }

}
