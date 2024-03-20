using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Data.Helpers
{
    public class PagesGalleryHelper
    {
        public List<PagesGalleryModel> GetAll(int LangId, int pageid, bool WithHidden = false)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    List<PagesGalleryModel> c = new List<PagesGalleryModel>();
                    if (cnx.PagesGalleries.Any())
                    {
                        IQueryable<PagesGallery> Blogs = cnx.PagesGalleries.Where(x => x.PageId==pageid && x.isDeleted == false && (WithHidden ? true : !x.isHidden));
                        
                        foreach (var model in Blogs.OrderBy(x => x.Display).ToList())
                            c.Add(PagesGalleryModel.GetFromPagesGalleryModel(model, LangId));

                    }
                    return c;
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
            return null;
        }
        public PagesGalleryModel GetByid(int Id, int LangId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesGalleries.Any(x => x.Id == Id))
                        return PagesGalleryModel.GetFromPagesGalleryModel(cnx.PagesGalleries.First(x => x.Id == Id), LangId);
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return null;
        }
        public bool Create(PagesGalleryModel model, HttpFileCollectionBase files)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    PagesGallery t = new PagesGallery()
                    {
                        Display = model.Display,
                        isDeleted = model.isDeleted,
                        isHidden = model.isHidden,
                        PageId = model.PageId,
                        Image = files.Count >0 && files["Image"].ContentLength > 0 ? Utilities.UploadFile(files["Image"], HttpContext.Current.Server.MapPath(Sitesettings.MediaPath)) : "",
                    };
                    cnx.PagesGalleries.Add(t);
                    cnx.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return false;
        }

        public bool Update(PagesGalleryModel model, HttpFileCollectionBase files)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesGalleries.Any(x => x.Id == model.Id))
                    {
                        PagesGallery t = cnx.PagesGalleries.First(x => x.Id == model.Id);
                        t.Display = model.Display;
                        t.isDeleted = model.isDeleted;
                        t.isHidden = model.isHidden;
                        t.PageId = model.PageId;
                        t.Image = files.Count > 0 && files["Image"].ContentLength > 0 ? Utilities.UploadFile(files["Image"], HttpContext.Current.Server.MapPath(Sitesettings.MediaPath), "") : (!string.IsNullOrEmpty(model.Image) ? model.Image.Substring(model.Image.LastIndexOf('/') + 1) : ""); 
                        cnx.SaveChanges();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex);
            }
            return false;
        }
        public void UpdateOrder(PagesGalleryModel model)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesGalleries.Any(x => x.Id == model.Id))
                    {
                        var c = cnx.PagesGalleries.First(x => x.Id == model.Id);
                        c.Display = model.Display;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

        }
        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesGalleries.Any(x => x.Id == id))
                    {
                        var c = cnx.PagesGalleries.First(x => x.Id == id);
                        c.isDeleted = true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
        }
        public void ChangeVisibility(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesGalleries.Any(x => x.Id == id))
                    {
                        var c = cnx.PagesGalleries.First(x => x.Id == id);
                        c.isHidden = c.isHidden ? false : true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
        }
    }


}
