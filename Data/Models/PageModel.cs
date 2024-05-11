using Data.Common;
using Data.Helpers;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class PageModel
    {

        [DisplayName("is Hidden")]
        public bool isHidden { get; set; }
        public List<PageModel> ChildNodes { get; set; }

        public int ChildCount { get; set; }
        public Dictionary<string, dynamic> Contents { get; set; }
        [DisplayName("Friendly url")]
        public string FriendlyUrl { get; set; }
        public int ParentId { get; set; }
        public string Link { get; set; }
        public bool isDeleted { get; set; }
        [DisplayName("Is list Page")]
        public bool isList { get; set; }
        public PageTemplateModel mPageTemplate { get; set; }
        [DisplayName("Display Order")]
        [Required]
        public int MenuOrder { get; set; }
        [DisplayName("Template")]
        [Required]
        public int PageTemplateID { get; set; }
        public int PageContentID { get; set; }
        [DisplayName("Name")]
        [Required]
        public string Name { get; set; }
        public int Id { get; set; }
        public string menuHTML { get; set; }

        public static PageModel GetFromPage(Page item, int langid)
        {
            PageModel b = new PageModel
            {
                Id = item.Id,
                Name = item.Name,
                ParentId = item.ParentId.HasValue ? item.ParentId.Value : -1,
                isDeleted = item.isDeleted,
                isHidden = item.isHidden,
                isList = item.isList,
                MenuOrder = item.MenuOrder,
                ChildNodes = new List<PageModel>(),
                PageContentID = item.PageContentID,
                PageTemplateID = item.PageTemplateID,
                FriendlyUrl = item.FriendlyUrl,
                ChildCount = item.Pages1 != null ? item.Pages1.Count() : 0,
                menuHTML = "",
                Link = Sitesettings.WebsiteUrl + item.Link,

                Contents = GetContents(item.Id, langid)
            };
            if(item.Pages1!=null &&  item.Pages1.Count() > 0)
            {
                foreach (Page Chlditem in item.Pages1)
                {
                    PageModel chld = GetFromPage(Chlditem, langid);
                    b.ChildNodes.Add(chld);
                }
            }
            b.ChildNodes = b.ChildNodes.OrderBy(x => x.MenuOrder).ToList();
            return b;
        }
        public static Dictionary<string, dynamic> GetContents(int pageid, int langid)
        {
            var T = new PageContentHelper().GetAllFieldsByPageID(pageid);
            Dictionary<string, dynamic> mycontents = new Dictionary<string, dynamic>();
            if (T != null && T.Count > 0)
            {
                foreach (var item in T)
                {
                    bool keyExists = mycontents.ContainsKey(item.ContentFieldName);
                    if (!keyExists)
                    {
                        switch (item.ContentFieldTypeID)
                        {
                            case (int)Utilities.PageContentTypesIds.Html:
                            case (int)Utilities.PageContentTypesIds.Text:
                            case (int)Utilities.PageContentTypesIds.GalleryItem:
                                mycontents.Add(item.ContentFieldName, item.HtmlContent.ToString());
                                break;
                            case (int)Utilities.PageContentTypesIds.Image:
                                mycontents.Add(item.ContentFieldName, item.ImageContent.ToString());
                                break;
                            case (int)Utilities.PageContentTypesIds.File:
                                mycontents.Add(item.ContentFieldName, item.FileContent.ToString());
                                break;
                            case (int)Utilities.PageContentTypesIds.Date:
                                mycontents.Add(item.ContentFieldName, item.DateContent.ToString());
                                break;
                            case (int)Utilities.PageContentTypesIds.Items:
                                List<PageModel> lst = new PageHelper().GetByids(item.HtmlContent.Split(',').ToList(), langid);
                                mycontents.Add(item.ContentFieldName, lst);
                                break;
                            default: break;
                        }


                    }

                }

            }

            return mycontents;
        }

    }
}
