
using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace Data.Helpers
{
    public class PageHelper
    {


        public PageModel GetByFriendlyUrl(string friendlyuurl,int langid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.FriendlyUrl.ToLower().Trim() == friendlyuurl.ToLower().Trim()))
                        return PageModel.GetFromPage(cnx.Pages.First(x => x.FriendlyUrl.ToLower().Trim() == friendlyuurl.ToLower().Trim()), langid);
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "Page", "Get by ID");
            }
            return null;
        }

        public List<PageModel> GetByids(List<string> ids, int langId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var ContentType = cnx.Pages.Where(x => x.PagesContents.Any(z => z.LangId == langId) && ids.Contains(x.Id.ToString()));
                    List<PageModel> c = new List<PageModel>();
                    foreach (var item in ContentType)
                        c.Add(PageModel.GetFromPage(item,langId));
                    return c.OrderBy(x => x.MenuOrder).ToList();
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "Page", "Get All");
                return null;
            }
        }
        public void HideUnhide(PageModel mde)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.Id == mde.Id))
                    {
                        var c = cnx.Pages.First(x => x.Id == mde.Id);
                        c.isHidden = c.isHidden ? false : true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
        }

        public void updateContentType(int pageid, int contenttypeid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.Id == pageid))
                    {
                        var c = cnx.Pages.First(x => x.Id == pageid);
                        var lst = cnx.PagesContents.Where(x => x.PageID == pageid);
                        c.PageContentID = contenttypeid;
                        cnx.PagesContents.RemoveRange(lst);                        
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
        }

        public void UpdateOrder(PageModel model)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.Id == model.Id))
                    {
                        var c = cnx.Pages.First(x => x.Id == model.Id);
                        c.MenuOrder = model.MenuOrder;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }


        }




        public List<PageModel> GetAll(int langid,bool WithHidden = true, int parentid = 0)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var ContentType = cnx.Pages.SqlQuery("select * from pages where isDeleted=0 " + (WithHidden ? "" : " and isHidden=0")).ToList();
                    if (parentid > 0)
                    {
                        ContentType = ContentType.Where(x => x.ParentId == parentid).ToList();
                    }
                    List<PageModel> c = new List<PageModel>();
                    foreach (var item in ContentType)
                        c.Add(PageModel.GetFromPage(item,langid));
                    return c.OrderBy(x => x.MenuOrder).ToList();
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "Page", "Get All");
                return null;
            }

        }
        public List<PageModel> GetAllPagesByTemplateId(int templateid,int langid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var ContentType = cnx.Pages.Where(x => x.isDeleted == false && x.PageTemplateID == templateid).ToList();
                    List<PageModel> c = new List<PageModel>();
                    foreach (var item in ContentType)
                        c.Add(PageModel.GetFromPage(item,langid));

                    return c.OrderBy(x => x.MenuOrder).ToList();
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "Page", "Get All");
                return null;
            }

        }
        public void updateLink(int id, string link,int contenttypeid=-1)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.Id == id))
                    {
                        var t = cnx.Pages.First(x => x.Id == id);
                        t.Link = link;
                        if(contenttypeid >-1)
                        {
                            t.PageContentID = contenttypeid;
                            var allcontent = cnx.PagesContents.Where(x => x.PageID == id).ToList();
                            cnx.PagesContents.RemoveRange(allcontent);
                        }
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "Page", "Get by ID");
            }
        }
        public PageModel GetById(int id,int langid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.Id == id))
                        return PageModel.GetFromPage(cnx.Pages.First(x => x.Id == id), langid);                    
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "Page", "Get by ID");
            }
            return null;
        }

        public int Create(PageModel item)
        {
            int ReturnedID = 0;
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    Page t = new Page
                    {
                        Name = item.Name,
                        isDeleted = item.isDeleted,
                        isHidden = item.isHidden,
                        MenuOrder = item.MenuOrder,
                        PageContentID = item.PageContentID,
                        PageTemplateID = item.PageTemplateID,
                        Link = item.Link,
                        FriendlyUrl = item.FriendlyUrl,
                        isList = item.isList,
                        ParentId = item.ParentId                        
                    };
                    cnx.Pages.Add(t);
                    cnx.SaveChanges();
                    ReturnedID = t.Id;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "Page", "Create");
            }
            return ReturnedID;
        }

        public bool update(PageModel model)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.Id == model.Id))
                    {
                        Page t = cnx.Pages.First(x => x.Id == model.Id);
                        t.Id = model.Id;
                        t.Name = model.Name;
                        t.isHidden = model.isHidden;
                        t.MenuOrder = model.MenuOrder;
                        t.FriendlyUrl = model.FriendlyUrl;
                        t.isList = model.isList;
                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "Page", "Update");
            }
            return false;
        }
        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Pages.Any(x => x.Id == id))
                    {
                        var c = cnx.Pages.First(x => x.Id == id);
                        c.isDeleted = true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "Page", "Delete");
            }
        }

       

        public List<PageModel> Search(int langId,int parentId, int pageSize, int currentPage, string search,  ref int totalrec, bool WithHidden = true)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var query = cnx.Pages.SqlQuery("select * from pages where isDeleted=0 " + (WithHidden ? "" : " and isHidden=0")).ToList();
                    if (parentId > 0)
                    {
                        query = query.Where(x => x.ParentId == parentId).ToList();
                    }
                    if (search != "")
                    {
                        query = query.Where(x => x.Name.ToLower() == search.ToLower()).ToList();
                    }
                    totalrec = query.Count();
                    var L = query.ToList().OrderBy(x => x.MenuOrder).ToList().Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    List<PageModel> c = new List<PageModel>();
                    foreach (var item in query)
                        c.Add(PageModel.GetFromPage(item, langId));
                    return c.OrderBy(x => x.MenuOrder).ToList();
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "Page", "Get All");
                return null;
            }
        }
    }
}
