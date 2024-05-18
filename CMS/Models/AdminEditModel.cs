using Data.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace CMS.Models
{
    public class CMSUserEditModel
    {
        public int ID { get; set; }
        [Required]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }

       
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }
        [Display(Name = "Username")]
        public string UserName { get; set; }
        public DateTime CreateDate { get; set; }
        public bool isDeleted { get; set; }

        [Display(Name = "Disable")]
        public bool isDisabled { get; set; }

        [Display(Name = "Permission group")]
        public List<AdminGroupRoleModel> AdminGroupRoles { get; set; }
    }
}