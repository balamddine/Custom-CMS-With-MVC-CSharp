using Data.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace CMS.Models
{
    public class UserRegisterModel
    {
        [Required]

        [Display(Name = "First Name")]
        public string FirstName { get; set; }

        [Required]

        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]        
        [Display(Name = "Username")]
        public string UserName { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }

       //public  List<permissionitem> permissions { get; set; }
       // public List<permissionitem> permissionrequest { get; set; }
    }

    //public class permissionitem
    //{
    //    public string ModuleName { get; set; }
    //    public int ModuleID { get; set; }
    //    public List<ActionModel> actions { get; set; }
    //    public string actionString { get; set; }
    //    public List<int> selectedItems { get; set; }
    //}
    //public class permissionitemrequest
    //{
    //    public string ModuleName { get; set; }
    //    public int ModuleID { get; set; }
    //    public List<ActionModel> actions { get; set; }
    //}
}