
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Data.Models;
using System.Web;
using Data;
using Data.Common;

namespace Data.Helpers
{
    public class LogsHelper
    {
        public List<LogsModel> GetAll(int pageSize, int currentPage, ref int totalrec)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var CMSUsers = cnx.Logs.ToList();
                    totalrec = CMSUsers.Count();
                    List<LogsModel> c = new List<LogsModel>();
                    CMSUsers = CMSUsers.Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    foreach (var item in CMSUsers)
                        c.Add(LogsModel.GetFromLogs(item));

                    return c;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "User", "Get All");
                return null;
            }

        }
        public LogsModel GetById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Logs.Any(x => x.Id == id))
                        return LogsModel.GetFromLogs(cnx.Logs.First(x => x.Id == id));
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Get by ID");
            }
            return null;
        }

        public int Create(LogsModel model)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    Log t = new Log
                    {
                        UserId = model.UserId,
                        Title = model.Title,
                        Descr = model.Descr,
                        LogDate = DateTime.UtcNow
                    };
                    cnx.Logs.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.Id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Create");
            }
            return ReturnedID;
        }

        public int Create(int userid, string Title, string description)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    Log t = new Log
                    {
                        UserId = userid,
                        Title = Title,
                        Descr = description,
                        LogDate = DateTime.UtcNow
                    };
                    cnx.Logs.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.Id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Create");
            }
            return ReturnedID;
        }

       
    }
}
