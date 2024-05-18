using Data;
using Data.Common;
using Data.Models;
using DocumentFormat.OpenXml.Spreadsheet;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace CMS.Extensions
{
    public class CustomAuthorization : AuthorizeAttribute
    {


        private readonly string controller;
        private readonly string role;
        public CustomAuthorization(string _controller, string _roles)
        {
            this.controller = _controller;
            this.role = _roles;
        }
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            bool authorize = false;

            var CurrentUser = JsonConvert.DeserializeObject<Data.Models.AdminModel>(httpContext.Request.Cookies[Data.Common.Sitesettings.AdminCookie].Value);
            if (CurrentUser != null && CurrentUser.AdminGroupRoles.Any())
            {
                List<string> roles = CurrentUser.AdminGroupRoles.Select(x => x.AdminGroup.Roles).ToList();
                foreach (string rrole in roles)
                {
                    List<string> mroles = rrole.Split('|').ToList();
                    foreach (string mrole in mroles) {
                        List<string> theRole = mrole.Split(',').ToList();
                        string mController = theRole[0];
                        if (mController.ToLower().Trim() == controller.ToLower().Trim())
                        {
                            authorize = theRole.FirstOrDefault(x => x == role) != null;                            
                        }
                    }
                   
                    
                }
                
            }


            return authorize;
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new RedirectToRouteResult(
               new RouteValueDictionary
               {
                    { "controller", "Home" },
                    { "action", "UnAuthorized" }
               });
        }
    }

}