using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class AdminGroupModel
    {
        public int Id { get; set; }
        [Required]
        [DisplayName("Group name")] 
        public string GroupName { get; set; }
        public string Roles { get; set; }
        public int UsersCount { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }

        public static AdminGroupModel GetFromModel(AdminGroup model)
        {
            AdminGroupModel b = new AdminGroupModel
            {

                Id = model.Id,
                GroupName = model.GroupName,
                Roles = model.Roles,
                UsersCount = model.AdminGroupRoles != null && model.AdminGroupRoles.Count > 0? model.AdminGroupRoles.Select(x => x.AdminId).Distinct().Count():0,
               
                CreatedDate = model.CreatedDate
            };
            
            return b;
        }
    }
}
