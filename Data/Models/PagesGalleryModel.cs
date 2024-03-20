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
    public class PagesGalleryModel
    {
        public int Id { get; set; }
        public int PageId { get; set; }
        [Required]
        public string Image { get; set; }
        [Required]
        public int Display { get; set; }
        [DisplayName("Deleted")]
        public bool isDeleted { get; set; }
        [DisplayName("Hidden")]
        public bool isHidden { get; set; }
        public PageModel mPage { get; set; }


        public static PagesGalleryModel GetFromPagesGalleryModel(PagesGallery model,int langid)
        {
            PagesGalleryModel b = new PagesGalleryModel
            {
                Display = model.Display,
                isDeleted = model.isDeleted,
                isHidden = model.isHidden,
                PageId = model.PageId,
                mPage = model.PageId > 0 ? new PageHelper().GetById(model.PageId,langid) : null,
                Image = !string.IsNullOrEmpty(model.Image) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.Image : "",
            };

            return b;
        }


    }
}
