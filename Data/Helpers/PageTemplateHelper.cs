
using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Data.Helpers
{
    public class PageTemplateHelper
    {
        public List<PageTemplateModel> GetAll()
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var ContentType = cnx.PageTemplates.ToList();
                    List<PageTemplateModel> c = new List<PageTemplateModel>();
                    foreach (var item in ContentType)
                        c.Add(PageTemplateModel.GetFromPageTemplate(item));

                    return c;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "PageTemplate", "Get All");
                return null;
            }

        }
        public bool TemplateExists(string name)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageTemplates.Any(x => x.Name == name))
                        return true;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageTemplate", "TemplateExists");
            }
            return false;
        }
        
        public int Create(PageTemplateModel model)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    PageTemplate t = new PageTemplate
                    {
                        id = model.id,                        
                        Name = model.Name,
                        ContentTypeId = model.ContentTypeId,
                        Link = model.Link
                    };
                    cnx.PageTemplates.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageTemplate", "Create");
            }
            return ReturnedID;
        }
        public bool update(PageTemplateModel model)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageTemplates.Any(x => x.id == model.id))
                    {
                        PageTemplate t = cnx.PageTemplates.First(x => x.id == model.id);
                        t.id = model.id;
                        t.Name = model.Name;
                        t.ContentTypeId = model.ContentTypeId;
                        t.Link = model.Link;

                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageTemplate", "Update");
            }
            return false;
        }
        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageTemplates.Any(x => x.id == id))
                    {
                        var c = cnx.PageTemplates.First(x => x.id == id);
                        cnx.PageTemplates.Remove(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageTemplate", "Delete");
            }
        }
        public PageTemplateModel GetById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageTemplates.Any(x => x.id == id))
                    {
                        var c = cnx.PageTemplates.First(x => x.id == id);
                        return PageTemplateModel.GetFromPageTemplate(c);
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageTemplate", "Delete");
            }
            return null;
        }
        
        
    }
}
