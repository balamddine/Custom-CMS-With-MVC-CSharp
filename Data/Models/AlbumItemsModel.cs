using Data.Models;
using Data.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class AlbumItemsModel
    {
        [DisplayName("Hidden")]
        public bool isHidden { get; set; }
        [DisplayName("Deleted")]
        public bool isDeleted { get; set; }
        [DisplayName("Order Display")]
        [Required]
        public int OrderDisplay { get; set; }
        [DisplayName("Mobile Image")]
        public string MobileImage { get; set; }
        [Required]
        public string Image { get; set; }
        public int LangId { get; set; }
        public DateTime CreatedDate { get; set; }
        [DisplayName("Type")]
        public string ItemType { get; set; }
        [DisplayName("Youtube video link")]
        public string YoutubeVideo { get; set; }
        [DisplayName("Video")]
        public string Videoitem { get; set; }
        public string Description { get; set; }
        [Required]
        public string Title { get; set; }
        public int AlbumId { get; set; }
        public int Id { get; set; }
        [DisplayName("File")]
        public string Fileitem { get; set; }
        public virtual AlbumModel mAlbum { get; set; }

        public static AlbumItemsModel GetFromAlbumItems(AlbumsItem model, int LangId)
        {

            AlbumItemsModel u = new AlbumItemsModel()
            {
                AlbumId = model.AlbumId,
                CreatedDate = model.CreatedDate,
                Description = model.Description,
                Fileitem = model.Fileitem,
                isDeleted = model.isDeleted,
                isHidden = model.isHidden,
                ItemType = model.ItemType,
                LangId = model.LangId,
                OrderDisplay = model.OrderDisplay,
                Title = model.Title,
                Videoitem = model.Videoitem,
                YoutubeVideo = model.YoutubeVideo,
                mAlbum = model.Album != null ? AlbumModel.GetFromAlbum(model.Album, LangId) : null,
                MobileImage = !string.IsNullOrEmpty(model.MobileImage) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.MobileImage : "",
                Image = !string.IsNullOrEmpty(model.Image) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.Image : "",

            };

            return u;

        }


    }
}
