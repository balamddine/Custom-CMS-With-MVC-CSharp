using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace Data.Models
{
    public class PageLayoutModel
    {
        public int Id { get; set; }
        public int PageId { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }
        public string CreatedBy { get; set; }  

        public static PageLayoutModel GetFromModel(PageLayout model)
        {
            PageLayoutModel b = new PageLayoutModel
            {
                Id = model.Id,
               CreatedBy = model.CreatedBy,
               CreatedDate = model.CreatedDate,
               PageId = model.PageId,
            };

            return b;
        }


    }
}
