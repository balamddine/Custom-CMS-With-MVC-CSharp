using Data.Common;
using Data.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CMS.Helpers
{
    public static class Helpers
    {
        public static void AddAdminCookie(AdminModel item)
        {
            HttpCookie mycookie = new HttpCookie(Sitesettings.AdminCookie);
            mycookie.Value = JsonConvert.SerializeObject(item);
            mycookie.Expires = DateTime.Now.AddDays(7);
            HttpContext.Current.Response.Cookies.Add(mycookie);
        }
    }
}