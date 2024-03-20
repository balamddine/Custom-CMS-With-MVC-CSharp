using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public  class PageContentTypeModel
    {
        public int id { get; set; }

        [Required]
        [DisplayName("Name")]
        public string Name { get; set; }

        public static PageContentTypeModel GetFromContentType(PagesContentType item)
        {
            PageContentTypeModel b = new PageContentTypeModel
            {
                id = item.Id,
                Name = item.Name,
            };

            return b;
        }

    }
}
