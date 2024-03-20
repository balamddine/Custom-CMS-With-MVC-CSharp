
using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Data.Helpers
{
    public class PageContentTypeFieldHelper
    {
        public List<PageContentTypeFieldModel> GetAll(int parentid = -1)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    List<PageContentTypeField> ContentType = new List<PageContentTypeField>();
                    if (parentid == -1)
                    {
                        ContentType = cnx.PageContentTypeFields.SqlQuery("select * from PageContentTypeFields").ToList();
                    }
                    else
                    {
                        ContentType = cnx.PageContentTypeFields.SqlQuery("select * from PageContentTypeFields where ParentID="+parentid).ToList();
                    }
                    List<PageContentTypeFieldModel> c = new List<PageContentTypeFieldModel>();
                    PagesContentType parent = cnx.PagesContentTypes.SqlQuery("select * from PagesContentTypes where Id=" + parentid).FirstOrDefault();
                    foreach (var item in ContentType)
                        c.Add(PageContentTypeFieldModel.GetFromContentTypeFields(item, parent));

                    return c;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "PageContentTypeFields", "Get All");
                return null;
            }

        }

       

        public List<PageContentTypeField> GetAllFieldTypeByContentTypeID(int contentTypeId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {

                    return cnx.PageContentTypeFields.Where(x=>x.ParentID== contentTypeId).ToList();
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "PageContentTypeField", "Get All");
                return null;
            }
        }

        public List<PageContentTypesId> GetAllFieldsType()
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                   
                    return cnx.PageContentTypesIds.ToList();                    
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "ContentTypesId", "Get All");
                return null;
            }

        }
        public PageContentTypesId GetByFieldTypeById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {

                    return cnx.PageContentTypesIds.Where(x=>x.Id==id).FirstOrDefault();
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "ContentTypesId", "Get All");
                return null;
            }

        }

        
        

        public bool ContentTypeFieldExists(int pid,string name)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageContentTypeFields.Any(x => x.Name == name && x.ParentID== pid))
                        return true;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageContentTypeFields", "ContentTypeFieldExists");
            }
            return false;
        }
        public PageContentTypeFieldModel GetById(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageContentTypeFields.Any(x => x.id == id))
                    {
                        var t = cnx.PageContentTypeFields.First(x => x.id == id);                      
                        return PageContentTypeFieldModel.GetFromContentTypeFields(t);
                    }
                        
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "User", "Get by ID");
            }
            return null;
        }
        public int Create(PageContentTypeFieldModel item)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    PageContentTypeField t = new PageContentTypeField
                    {
                        Name = item.Name,
                        TypeId = item.TypeId,
                        TypeName = item.TypeName,
                        ParentID = item.ParentID
                    };
                    cnx.PageContentTypeFields.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageContentTypeFields", "Create");
            }
            return ReturnedID;
        }
        public bool update(PageContentTypeFieldModel item)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageContentTypeFields.Any(x => x.id == item.id))
                    {
                        PageContentTypeField t = cnx.PageContentTypeFields.First(x => x.id == item.id);
                        t.id = item.id;
                        t.Name = item.Name;
                        t.TypeId = item.TypeId;
                        t.TypeName = item.TypeName;
                        t.ParentID = item.ParentID;
                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageContentTypeFields", "Update");
            }
            return false;
        }
        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PageContentTypeFields.Any(x => x.id == id))
                    {
                        var c = cnx.PageContentTypeFields.First(x => x.id == id);
                        cnx.PageContentTypeFields.Remove(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PageContentTypeFields", "Delete");
            }
        }


    }
}
