using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Data.Helpers
{
    public class PageContentTypeHelper
    {
        public List<PageContentTypeModel> GetAll()
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var ContentType = cnx.PagesContentTypes.ToList();
                    List<PageContentTypeModel> c = new List<PageContentTypeModel>();
                    foreach (var item in ContentType)
                        c.Add(PageContentTypeModel.GetFromContentType(item));

                    return c;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "PageContentType", "Get All");
                return null;
            }

        }

        public PageContentTypeModel GetById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContentTypes.Any(x => x.Id == id))
                        return PageContentTypeModel.GetFromContentType(cnx.PagesContentTypes.First(x => x.Id == id));
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Get by ID");
            }
            return null;
        }
        public bool ContentTypeExists(string name)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContentTypes.Any(x => x.Name == name))
                        return true;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "ContentTypeExists");
            }
            return false;
        }
        


        public int Create(PageContentTypeModel model)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    PagesContentType t = new PagesContentType
                    {
                        Name = model.Name,                      
                    };
                    cnx.PagesContentTypes.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.Id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageContentType", "Create");
            }
            return ReturnedID;
        }
        public bool update(PageContentTypeModel model)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContentTypes.Any(x => x.Id == model.id))
                    {
                        PagesContentType t = cnx.PagesContentTypes.First(x => x.Id == model.id);
                        t.Id = model.id;
                        t.Name = model.Name;                       
                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageContentType", "Update");
            }
            return false;
        }
        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContentTypes.Any(x => x.Id == id))
                    {
                        var c = cnx.PagesContentTypes.First(x => x.Id == id);
                        cnx.PagesContentTypes.Remove(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PagesContentType", "Delete");
            }
        }

       
    }
}
