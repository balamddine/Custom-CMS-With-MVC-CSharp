using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class AdminModel
    {
        public int ID { get; set; }
        [DisplayName("Username")]
        [Required]
        public string UserName { get; set; }
        public string Theme { get; set; }
        [DisplayName("Password")]
        [Required]
        public string Pwd { get; set; }
        [DisplayName("First name")]
        [Required]
        public string FirstName { get; set; }
        [DisplayName("Last name")]
        [Required]
        public string LastName { get; set; }
        [EmailAddress]
        [Required]
        public string Email { get; set; }
        public DateTime CreateDate { get; set; }
        public bool isDeleted { get; set; }
        public bool isDisabled { get; set; }
        public List<AdminGroupRoleModel> AdminGroupRoles { get; set; }
        public static AdminModel GetFromCMSUser(Admin model)
        {
            AdminModel b = new AdminModel
            {

                ID = model.Id,
                CreateDate = model.CreateDate,
                FirstName = model.FirstName,
                isDeleted = model.isDeleted,
                isDisabled = model.isDisabled,
                LastName = model.LastName,
                Pwd = model.Pwd,
                UserName = model.UserName,
                AdminGroupRoles = new List<AdminGroupRoleModel>(),
                Email = model.Email,
                Theme = !string.IsNullOrWhiteSpace(model.Theme)? model.Theme:"light",
            };
            if(model.AdminGroupRoles!=null && model.AdminGroupRoles.Count > 0)
            {
                foreach (AdminGroupRole item in model.AdminGroupRoles)
                {
                    b.AdminGroupRoles.Add(AdminGroupRoleModel.GetFromModel(item));
                }
            }
            return b;
        }
    }
}
