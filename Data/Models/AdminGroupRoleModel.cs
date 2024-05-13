using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class AdminGroupRoleModel
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public int GroupId { get; set; }       
        public AdminGroupModel AdminGroup { get; set; }

        public static AdminGroupRoleModel GetFromModel(AdminGroupRole model)
        {
            AdminGroupRoleModel b = new AdminGroupRoleModel
            {

                Id = model.Id,
                AdminId = model.AdminId,
                GroupId = model.GroupId,
                AdminGroup = AdminGroupModel.GetFromModel(model.AdminGroup),
            };

            return b;
        }
    }
}
