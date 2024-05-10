using Data;
using Data.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Data.Models
{
    public class AlbumModel
    {
        public int Id { get; set; }
        public int ParentId { get; set; }
        public string Name { get; set; }
        [DisplayName("Cover Image")]
        public string Image { get; set; }
        [DisplayName("Cover Youtube Video")]
        public string VideoFile { get; set; }
        [DisplayName("Display Order")]
        [Required]
        public int DisplayOrder { get; set; }
        [DisplayName("Hidden")]
        public bool IsHidden { get; set; }
        public bool IsDeleted { get; set; }
        public int LangId { get; set; }
        public int AlbumId { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public List<AlbumModel> ChildNodes { get; set; }
        public int ChildCount { get; set; }
        public static AlbumModel GetFromAlbum(Album model, int LangId)
        {
            AlbumContent child = model.AlbumContents.FirstOrDefault(x => x.LangId == LangId);
            if (child != null && child.AlbumId > 0)
            {
                AlbumModel u = new AlbumModel()
                {
                    AlbumId = child.AlbumId,
                    Description = child.Description,
                    LangId = child.LangId,
                    Title = child.Title,
                    ChildNodes = new List<AlbumModel>(),
                    DisplayOrder = model.DisplayOrder,
                    Id = model.Id,
                    IsDeleted = model.IsDeleted,
                    IsHidden = model.IsHidden,
                    Name = model.Name,
                    ParentId = model.ParentId.HasValue ? model.ParentId.Value : -1,
                    ChildCount = model.Albums1 != null ? model.Albums1.Count() : 0,
                    Image = !string.IsNullOrEmpty(model.Image) ? Sitesettings.WebsiteUrl + Sitesettings.MediaPath.Replace("~", "") + model.Image : "",
                    VideoFile = !string.IsNullOrEmpty(model.VideoFile) ?  model.VideoFile : ""
                };
                if (model.Albums1 != null && model.Albums1.Count() > 0)
                {
                    foreach (Album Chlditem in model.Albums1)
                    {
                        AlbumModel chld = GetFromAlbum(Chlditem, LangId);
                        u.ChildNodes.Add(chld);
                    }
                }
                return u;
            }
            return null;
        }
    }
}