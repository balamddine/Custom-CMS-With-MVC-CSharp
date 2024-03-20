
using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;

namespace Data.Helpers
{
    public class PageContentHelper
    {
        public List<PagesContentModel> GetAll()
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var ContentType = cnx.PagesContents.ToList();
                    List<PagesContentModel> c = new List<PagesContentModel>();
                    foreach (var item in ContentType)
                        c.Add(PagesContentModel.GetFromPagesContent(item));

                    return c;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "PagesContent", "Get All");
                return null;
            }

        }
        public List<PagesContentModel> GetAllFieldsTypeByPageID(int pageid, int Langid, bool forContentdisplay = false)
        {
            try
            {
                List<PagesContentModel> L = new List<PagesContentModel>();
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    var t = cnx.PagesContents.Where(x => x.PageID == pageid && x.LangId == Langid).Join(cnx.PageContentTypeFields,
            x => x.ContentFieldID,
            y => y.id,
            (pagescontent, pagecontentfield) => new
            {
                Id = pagescontent.Id,
                PageID = pagescontent.PageID,
                CreatedDate = pagescontent.CreatedDate,
                HtmlContent = pagescontent.HtmlContent,
                FileContent = pagescontent.FileContent,
                DateContent = pagescontent.DateContent,
                ImageContent = pagescontent.ImageContent,
                ContentFieldID = pagescontent.ContentFieldID,
                ContentFieldTypeID = pagescontent.ContentFieldTypeID,
                ContentFieldName = pagecontentfield.Name,
            }
        ).ToList();
                    foreach (var model in t)
                    {
                        PagesContentModel b = new PagesContentModel
                        {
                            Id = model.Id,
                            PageID = model.PageID,
                            CreatedDate = DateTime.UtcNow,
                            HtmlContent = model.HtmlContent,
                            FileContent = !string.IsNullOrEmpty(model.FileContent) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.FileContent : "",
                            ImageContent = !string.IsNullOrEmpty(model.ImageContent) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.ImageContent : "",
                            DateContent = model.DateContent != null ? model.DateContent.Value : new DateTime(1900, 1, 1),
                            ContentFieldID = model.ContentFieldID,
                            ContentFieldTypeID = model.ContentFieldTypeID,
                            ContentFieldName = model.ContentFieldName
                        };
                        L.Add(b);
                    }
                    return L;
                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "PageContentTypeField", "Get All");
                return null;
            }
        }
        public void DeleteAllContent(int pageid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    using (var transaction = cnx.Database.BeginTransaction())
                    {
                        try
                        {
                            var t = cnx.PagesContents.Where(x => x.PageID == pageid).ToList();
                            foreach (var item in t)
                            {
                                cnx.PagesContents.Remove(item);
                                cnx.SaveChanges();
                            }
                            transaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            transaction.Rollback();
                        }
                    }

                }
            }
            catch (Exception ex)
            {

                Utilities.LogError(ex, "ContentTypesId", "Get All");
            }

        }
        public bool Create(PagesContentModel model, List<LanguageModel> languages)
        {

            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    foreach (var item in languages)
                    {
                        PagesContent t = new PagesContent
                        {
                            Id = model.Id,
                            PageID = model.PageID,
                            CreatedDate = model.CreatedDate,
                            HtmlContent = model.HtmlContent,
                            FileContent = model.FileContent,
                            ImageContent = model.ImageContent,
                            ContentFieldID = model.ContentFieldID,
                            ContentFieldTypeID = model.ContentFieldTypeID,
                            DateContent = model.DateContent,
                            LangId = item.Id
                        };
                        cnx.PagesContents.Add(t);
                    }

                    cnx.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PagesContent", "Create");
            }
            return false;
        }

        public List<PagesContentModel> GetAllFieldsByPageID(int pageid)
        {
            using (IMDGEntities cnx = new IMDGEntities())
            {
                var t = cnx.PagesContents.Where(x => x.PageID == pageid).ToList();
                List<PagesContentModel> c = new List<PagesContentModel>();
                foreach (var item in t)
                    c.Add(PagesContentModel.GetFromPagesContent(item));

                return c;
            }
        }

        //public bool update(PagesContentModel model)
        //{
        //    try
        //    {

        //        using (IMDGEntities cnx = new IMDGEntities())
        //        {
        //            if (cnx.PagesContents.Any(x => x.Id == model.Id))
        //            {
        //                PagesContent t = cnx.PagesContents.First(x => x.Id == model.Id);
        //                t.PageID = model.PageID;
        //                t.CreatedDate = model.CreatedDate;
        //                t.HtmlContent = model.HtmlContent;
        //                t.FileContent = model.FileContent;
        //                t.ImageContent = model.ImageContent;
        //                t.ContentFieldID = model.ContentFieldID;
        //                t.ContentFieldTypeID = model.ContentFieldTypeID;
        //                cnx.SaveChanges();
        //                return true;
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Utilities.LogError(ex, "PagesContent", "Update");
        //    }
        //    return false;
        //}
        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContents.Any(x => x.Id == id))
                    {
                        var c = cnx.PagesContents.First(x => x.Id == id);
                        cnx.PagesContents.Remove(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PagesContent", "Delete");
            }
        }

        public void DeleteByPageIdAndItemId(int pageid, int itemId, int langid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContents.Any(x => x.PageID == pageid && x.LangId == langid && x.ContentFieldID == itemId))
                    {
                        var c = cnx.PagesContents.First(x => x.PageID == pageid && x.LangId == langid && x.ContentFieldID == itemId);
                        cnx.PagesContents.Remove(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PagesContent", "Delete");
            }
        }
        public PagesContentModel getFieldByPageIdAndItemId(int pageid, int itemId, int langid)
        {
            using (IMDGEntities cnx = new IMDGEntities())
            {
                var t = cnx.PagesContents.FirstOrDefault(x => x.PageID == pageid && x.ContentFieldID == itemId  && x.LangId == langid);

                if (t != null && t.Id > 0)
                {
                    return PagesContentModel.GetFromPagesContent(t);
                }

                return null;
            }
        }
        public void DeleteGalleryContent(int pageid, int galid, int langid, int typeid)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContents.Any(x => x.PageID == pageid && x.LangId == langid && x.ContentFieldTypeID == typeid && x.HtmlContent == galid.ToString()))
                    {
                        var c = cnx.PagesContents.First(x => x.PageID == pageid && x.LangId == langid && x.ContentFieldTypeID == typeid && x.HtmlContent == galid.ToString());
                        cnx.PagesContents.Remove(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PagesContent", "Delete");
            }
        }
        public void DeleteItemsContent(int pageid, string itemsid, int langid, int typeid)
        {
            //try
            //{
            //    using (IMDGEntities cnx = new IMDGEntities())
            //    {
            //        if (cnx.PagesContents.Any(x => x.PageID == pageid && x.LangId == langid && x.ContentFieldTypeID == typeid && x.HtmlContent == galid.ToString()))
            //        {
            //            var c = cnx.PagesContents.First(x => x.PageID == pageid && x.LangId == langid && x.ContentFieldTypeID == typeid && x.HtmlContent == galid.ToString());
            //            cnx.PagesContents.Remove(c);
            //            cnx.SaveChanges();
            //        }
            //    }
            //}
            //catch (Exception ex)
            //{
            //    Utilities.LogError(ex, "PagesContent", "Delete");
            //}

        }

        public void DeleteAllContent(int pageid, int langId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.PagesContents.Any(x => x.PageID == pageid && x.LangId == langId))
                    {
                        var c = cnx.PagesContents.Where(x => x.PageID == pageid && x.LangId == langId).ToList();
                        cnx.PagesContents.RemoveRange(c);
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex, "PagesContent", "Delete");
            }
        }
    }
}
