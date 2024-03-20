using Data.Common;
using Data.Helpers;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class PagesContentModel
    {

        public int Id { get; set; }
        public int PageID { get; set; }
        public int LangId { get; set; }
        [Required]
        public string HtmlContent { get; set; }
        public string ImageContent { get; set; }
        public string FileContent { get; set; }
        public DateTime DateContent { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ContentFieldID { get; set; }
        public int ContentFieldTypeID { get; set; }
        public string ContentFieldName { get; set; }

        public static PagesContentModel GetFromPagesContent(PagesContent model)
        {

            PagesContentModel b = new PagesContentModel
            {
                Id = model.Id,
                PageID = model.PageID,
                CreatedDate = DateTime.UtcNow,
                HtmlContent = !string.IsNullOrEmpty(model.HtmlContent) ? model.HtmlContent : "",
                FileContent = !string.IsNullOrEmpty(model.FileContent) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.FileContent : "",
                ImageContent = !string.IsNullOrEmpty(model.ImageContent) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.ImageContent : "",
                DateContent = model.DateContent != null ? model.DateContent.Value : new DateTime(1900, 1, 1),
                ContentFieldID = model.ContentFieldID,
                ContentFieldTypeID = model.ContentFieldTypeID,
                LangId = model.LangId,
                ContentFieldName = ""
            };
            var x = new PageContentTypeFieldHelper().GetById(model.ContentFieldID);
            if(x!=null && x.id > 0)
            {
                b.ContentFieldName = x.Name;
            }
            return b;
        }

    }
}
