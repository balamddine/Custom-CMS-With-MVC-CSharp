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
        public int CMSUserRoleId { get; set; }

        public static AdminModel GetFromCMSUser(Admin model)
        {
            AdminModel b = new AdminModel
            {

                ID = model.Id,
                CMSUserRoleId = model.CMSUserRoleId,
                CreateDate = model.CreateDate,
                FirstName = model.FirstName,
                isDeleted = model.isDeleted,
                isDisabled = model.isDisabled,
                LastName = model.LastName,
                Pwd = model.Pwd,
                UserName = model.UserName,
                Email = model.Email,
                
            };

            return b;
        }
    }
}
