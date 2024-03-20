using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public partial class PageContentTypeFieldModel
    {
        public int id { get; set; }
        public int ParentID { get; set; }
        [Required]
        [DisplayName("Name")]
        public string Name { get; set; }
        public int TypeId { get; set; }
        [Required]
        [DisplayName("Type")]
        public string TypeName { get; set; } = "Html";
        public PageContentTypeModel mParent { get; set; }
        public static PageContentTypeFieldModel GetFromContentTypeFields(PageContentTypeField item, PagesContentType parent = null)
        {
            PageContentTypeFieldModel b = new PageContentTypeFieldModel
            {
                id = item.id,
                Name = item.Name,
                TypeId = item.TypeId,
                TypeName = item.TypeName,
                ParentID = item.ParentID,
                mParent = parent != null ? PageContentTypeModel.GetFromContentType(parent) : null
            };

            return b;
        }

    }

}
