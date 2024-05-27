
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
    public class PageLayoutHelper
    {
        public List<PageLayoutModel> GetAll(int pageSize, int currentPage, ref int totalrec)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var CMSUsers = cnx.PageLayouts.ToList();
                    totalrec = CMSUsers.Count();
                    List<PageLayoutModel> c = new List<PageLayoutModel>();
                    CMSUsers = CMSUsers.Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    foreach (var item in CMSUsers)
                        c.Add(PageLayoutModel.GetFromModel(item));

                    return c;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "PageLayout", "Get All");
                return null;
            }

        }
        public PageLayoutModel GetById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageLayouts.Any(x => x.Id == id))
                        return PageLayoutModel.GetFromModel(cnx.PageLayouts.First(x => x.Id == id));
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageLayout", "Get by ID");
            }
            return null;
        }

        public PageLayoutModel GetByPageId(int pageid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageLayouts.Any(x => x.PageId == pageid))
                        return PageLayoutModel.GetFromModel(cnx.PageLayouts.First(x => x.PageId == pageid));
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageLayout", "Get By Page Id");
            }
            return null;
        }

        public int Create(PageLayoutModel model)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    PageLayout t = new PageLayout
                    {
                        CreatedBy = model.CreatedBy,
                        CreatedDate = model.CreatedDate,                        
                        PageHtml = model.PageHtml,
                        PageId = model.PageId   
                    };
                    cnx.PageLayouts.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.Id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageLayout", "Create");
            }
            return ReturnedID;
        }

        public bool update(PageLayoutModel model)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageLayouts.Any(x => x.Id == model.Id))
                    {
                        PageLayout t = cnx.PageLayouts.First(x => x.Id == model.Id);
                        t.PageHtml = model.PageHtml;
                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageLayout", "Update");
            }
            return false;
        }


    }
}
