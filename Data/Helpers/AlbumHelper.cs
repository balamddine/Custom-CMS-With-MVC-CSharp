
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
    public class AlbumHelper
    {

        public List<AlbumModel> GetAll(int LangId, int parentid = 0, bool WithHidden = false)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    List<AlbumModel> c = new List<AlbumModel>();
                    if (cnx.Albums.Any())
                    {
                        IQueryable<Album> Albums = cnx.Albums.Where(x => x.AlbumContents.Any(z => z.LangId == LangId) && x.IsDeleted == false && (WithHidden ? true : !x.IsHidden));
                        if (parentid > 0)
                        {
                            Albums = Albums.Where(x => x.ParentId == parentid);
                        }
                        foreach (var model in Albums.OrderBy(x => x.DisplayOrder).ToList())
                            c.Add(AlbumModel.GetFromAlbum(model, LangId));

                    }
                    return c;
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
            return null;
        }
        public AlbumModel GetByid(int Id, int LangId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Albums.Any(x => x.Id == Id))
                        return AlbumModel.GetFromAlbum(cnx.Albums.First(x => x.Id == Id), LangId);
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return null;
        }
        public int Create(AlbumModel model, List<LanguageModel> languages)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    Album t = new Album()
                    {
                        DisplayOrder = model.DisplayOrder,                      
                        IsDeleted = model.IsDeleted,
                        IsHidden = model.IsHidden,
                        Name = model.Name,
                        ParentId = model.ParentId,                        
                        Image = model.Image,
                        VideoFile = model.VideoFile,
                    };
                    foreach (LanguageModel l in languages)
                    {
                        AlbumContent  c = new AlbumContent()
                        {
                            LangId = l.Id,
                            Title = !string.IsNullOrEmpty(model.Title) ? model.Title : "",
                            AlbumId = model.AlbumId,                            
                            Description = !string.IsNullOrEmpty(model.Description) ? model.Description : "",
                        };
                        t.AlbumContents.Add(c);

                    }
                    cnx.Albums.Add(t);
                    cnx.SaveChanges();
                    return t.Id;
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return 0;
        }

        public List<AlbumModel> Search(int LangID, int pageSize, int currentPage, ref int totalrec, string keyword = "", int parentid = 0, bool WithHidden = false)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    IQueryable<Album> query = cnx.Albums.Where(x => !x.IsDeleted && (keyword != "" ? x.AlbumContents.Any(y => y.Title.ToLower().Contains(keyword)) : true) && (WithHidden ? true : !x.IsHidden));

                    totalrec = query.Count();
                    var L = query.ToList().OrderBy(x => x.DisplayOrder).ToList().Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    List<AlbumModel> c = new List<AlbumModel>();
                    foreach (var item in query)
                        c.Add(AlbumModel.GetFromAlbum(item, LangID));
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
        public bool Update(AlbumModel model, int LangId)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Albums.Any(x => x.Id == model.Id))
                    {
                        Album t = cnx.Albums.First(x => x.Id == model.Id);
                        t.DisplayOrder = model.DisplayOrder;                      
                        t.IsHidden = model.IsHidden;
                        t.Name = model.Name;
                        t.Image = model.Image;
                        t.VideoFile = model.VideoFile;
                        AlbumContent c = t.AlbumContents.First(x => x.LangId == LangId);
                        c.Title = !string.IsNullOrEmpty(model.Title) ? model.Title : "";                       
                        c.Description = !string.IsNullOrEmpty(model.Description) ? model.Description : "";
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



        public void UpdateOrder(AlbumModel model)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Albums.Any(x => x.Id == model.Id))
                    {
                        var c = cnx.Albums.First(x => x.Id == model.Id);
                        c.DisplayOrder = model.DisplayOrder;
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
                    if (cnx.Albums.Any(x => x.Id == id))
                    {
                        var c = cnx.Albums.First(x => x.Id == id);
                        c.IsDeleted = true;
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
                    if (cnx.Albums.Any(x => x.Id == id))
                    {
                        var c = cnx.Albums.First(x => x.Id == id);
                        c.IsHidden = c.IsHidden ? false : true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
        }
    }
}
