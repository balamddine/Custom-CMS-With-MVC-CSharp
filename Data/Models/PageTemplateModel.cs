using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public  class PageTemplateModel
    {
        public int id { get; set; }

        [Required]
        [DisplayName("Name")]
        public string Name { get; set; }

        public int ContentTypeId { get; set; }

        [Required]
        [DisplayName("Link")]
        public string Link { get; set; }

        public static PageTemplateModel GetFromPageTemplate(PageTemplate model)
        {
            PageTemplateModel b = new PageTemplateModel
            {
                id = model.id,
                Name = model.Name,
                ContentTypeId = model.ContentTypeId,
                Link = model.Link
            };

            return b;
        }

    }
}
