using Data.Common;
using Data.Helpers;
using Data.Models;
using System;
using System.Web;

namespace HttpMapper
{
    public class FriendlyUrlCreatorModule : IHttpModule
    {
        /// <summary>
        /// You will need to configure this module in the Web.config file of your
        /// web and register it with IIS before being able to use it. For more information
        /// see the following link: https://go.microsoft.com/?linkid=8101007
        /// </summary>
        #region IHttpModule Members

        public void Dispose()
        {
            //clean-up code here.
        }

        public void Init(HttpApplication context)
        {
            // Below is an example of how you can handle LogRequest event and provide 
            // custom logging implementation for it
            context.BeginRequest += new EventHandler(OnBeginRequest);
        }

        public void OnBeginRequest(object sender, EventArgs e)
        {
            HttpApplication application = sender as HttpApplication;
            string ReqURL = application.Request.Url.ToString();
            ReqURL = ReqURL.Replace(Sitesettings.WebsiteUrl, "");

            string [] arr = ReqURL.Split('?');
            string pageURL = arr[0];
            var pagehelper = new PageHelper();
            int langid = Sitesettings.DefaultLangId;
            PageModel mPage = pagehelper.GetByFriendlyUrl(pageURL,langid);
            if (mPage != null && mPage.Id > 0)
            {
                if (!string.IsNullOrWhiteSpace(mPage.Link))
                {
                    var uri = new Uri(Sitesettings.WebsiteUrl+ReqURL);
                    var querystring = HttpUtility.ParseQueryString(uri.Query);
                   
                    string newLink = mPage.Link.Replace(Sitesettings.WebsiteUrl, "");
                    newLink = newLink + (querystring.ToString()!=""? "&" + querystring.ToString() : "");
                    application.Context.RewritePath(newLink);
                }
            }
        }

        #endregion

    }
}
