using Data.Common;
using Data.Models;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CMS.Extensions
{
    public class CustomAuthorization : AuthorizeAttribute
    {


        private readonly int[] allowedRoles;
        public CustomAuthorization(params int[] roles)
        {
            this.allowedRoles = roles;
        }
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            //bool authorize = false;
            //foreach (int role in allowedRoles)
            //{
            //    int CurrentUserId = int.Parse(HttpContext.Current.Request.Cookies[System.Configuration.ConfigurationManager.AppSettings["AdminCookie"]].Value.ToString());
            //    AdminModel CurrentUser = new Data.Helpers.AdminHelper().GetById(CurrentUserId);
                
            //    if (CurrentUser != null && CurrentUser.CMSUserRole == role.ToString())
            //    {
            //        authorize = true;
            //    }
            //}
            return true;
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new HttpUnauthorizedResult();
        }
    }

}