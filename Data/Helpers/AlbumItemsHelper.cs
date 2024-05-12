using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Helpers
{
    public class AlbumItemsHelper
    {


        public List<AlbumItemsModel> GetAll(int LangId, int Albumid, bool WithHidden = false)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    List<AlbumItemsModel> c = new List<AlbumItemsModel>();
                    if (cnx.AlbumsItems.Any())
                    {
                        IQueryable<AlbumsItem> query = cnx.AlbumsItems.Where(x => x.AlbumId == Albumid && x.isDeleted == false && (WithHidden ? true : !x.isHidden));

                        foreach (var model in query.OrderBy(x => x.OrderDisplay).ToList())
                            c.Add(AlbumItemsModel.GetFromAlbumItems(model, LangId));

                    }
                    return c;
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
            return null;
        }
        public AlbumItemsModel GetByid(int Id, int LangId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.AlbumsItems.Any(x => x.Id == Id))
                        return AlbumItemsModel.GetFromAlbumItems(cnx.AlbumsItems.First(x => x.Id == Id), LangId);
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return null;
        }

        public List<AlbumItemsModel> Search(int LangID, int pageSize, int currentPage, int albumid, ref int totalrec, string keyword = "", string tpe = "", bool WithHidden = false)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    IQueryable<AlbumsItem> query = cnx.AlbumsItems.Where(x => x.AlbumId == albumid && !x.isDeleted && (keyword != "" ? x.Title.ToLower().Contains(keyword) : true) && (WithHidden ? true : !x.isHidden));
                    if (tpe != "")
                    {
                        query = query.Where(x => x.ItemType == tpe);
                    }
                    totalrec = query.Count();
                    var L = query.ToList().OrderBy(x => x.OrderDisplay).ToList().Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    List<AlbumItemsModel> c = new List<AlbumItemsModel>();
                    foreach (var item in L)
                        c.Add(AlbumItemsModel.GetFromAlbumItems(item, LangID));
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
        public bool Update(AlbumItemsModel model, int LangId)
        {
            try
            {

                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.AlbumsItems.Any(x => x.Id == model.Id))
                    {
                        AlbumsItem t = cnx.AlbumsItems.First(x => x.Id == model.Id);
                        t.AlbumId = model.AlbumId;
                        t.Description = model.Description;
                        t.Fileitem = model.Fileitem;
                        t.Image = model.Image;
                        t.MobileImage = model.MobileImage;
                        t.isHidden = model.isHidden;
                        t.ItemType = model.ItemType;
                        t.OrderDisplay = model.OrderDisplay;
                        t.Title = model.Title;
                        t.Videoitem = model.Videoitem;
                        t.YoutubeVideo = model.YoutubeVideo;

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
        public bool Create(AlbumItemsModel model, List<LanguageModel> languages)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    foreach (var item in languages)
                    {
                        AlbumsItem t = new AlbumsItem
                        {
                            AlbumId = model.AlbumId,
                            Description = model.Description,
                            Fileitem = model.Fileitem,
                            Image = model.Image,
                            MobileImage = model.MobileImage,
                            isHidden = model.isHidden,
                            ItemType = model.ItemType,
                            OrderDisplay = model.OrderDisplay,
                            Title = model.Title,
                            Videoitem = model.Videoitem,
                            YoutubeVideo = model.YoutubeVideo,
                            LangId = item.Id,
                            isDeleted = false,
                            CreatedDate = model.CreatedDate,
                        };
                        cnx.AlbumsItems.Add(t);

                    }
                    cnx.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "AlbumItemsHelper", "Create");
            }
            return false;
        }

        public void UpdateOrder(AlbumItemsModel model)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.AlbumsItems.Any(x => x.Id == model.Id))
                    {
                        var c = cnx.AlbumsItems.First(x => x.Id == model.Id);
                        c.OrderDisplay = model.OrderDisplay;
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
                    if (cnx.AlbumsItems.Any(x => x.Id == id))
                    {
                        var c = cnx.AlbumsItems.First(x => x.Id == id);
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
                    if (cnx.AlbumsItems.Any(x => x.Id == id))
                    {
                        var c = cnx.AlbumsItems.First(x => x.Id == id);
                        c.isHidden = c.isHidden ? false : true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
        }
    }
}
