using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Common
{

    public static class Sitesettings
    {
        public static string AllowedImageContentType = ConfigurationManager.AppSettings["AllowedImageContentType"] != null ? ConfigurationManager.AppSettings["AllowedImageContentType"].ToString() : "";
        public static string ToEmail = ConfigurationManager.AppSettings["ToEmail"] != null ? ConfigurationManager.AppSettings["ToEmail"].ToString() : "";
        public static string FromEmail = ConfigurationManager.AppSettings["FromEmail"] != null ? ConfigurationManager.AppSettings["FromEmail"].ToString() : "";
        public static string FromName = ConfigurationManager.AppSettings["FromName"] != null ? ConfigurationManager.AppSettings["FromName"].ToString() : "";
        public static string AllowedContentType = ConfigurationManager.AppSettings["AllowedContentType"] != null ? ConfigurationManager.AppSettings["AllowedContentType"].ToString() : "";
        public static string CaptchaURL = ConfigurationManager.AppSettings["CaptchaURL"] != null ? ConfigurationManager.AppSettings["CaptchaURL"].ToString() : "";
        public static string CaptchaSiteKey = ConfigurationManager.AppSettings["CaptchaSiteKey"] != null ? ConfigurationManager.AppSettings["CaptchaSiteKey"].ToString() : "";
        public static string WebsiteUrl = ConfigurationManager.AppSettings["WebsiteUrl"] != null ? ConfigurationManager.AppSettings["WebsiteUrl"].ToString() : "";
        public static string WebsitePath = ConfigurationManager.AppSettings["WebsitePath"] != null ? ConfigurationManager.AppSettings["WebsitePath"].ToString() : "";
        public static string WebsiteLang = ConfigurationManager.AppSettings["WebsiteLang"] != null ? ConfigurationManager.AppSettings["WebsiteLang"].ToString() : "";
        public static string DefaultCulture = ConfigurationManager.AppSettings["DefaultCulture"] != null ? ConfigurationManager.AppSettings["DefaultCulture"].ToString() : "";
        
        public static string EmailTemplateSitePath = ConfigurationManager.AppSettings["AdminCookie"] != null ? ConfigurationManager.AppSettings["AdminCookie"].ToString() : "";
        public static string MediaPath = ConfigurationManager.AppSettings["MediaPath"] != null ? ConfigurationManager.AppSettings["MediaPath"].ToString() : "";
        public static int RootPageId = ConfigurationManager.AppSettings["RootPageId"] != null ? Convert.ToInt32(ConfigurationManager.AppSettings["RootPageId"].ToString()) : 0;
        public static int RootAlbumId = ConfigurationManager.AppSettings["RootAlbumId"] != null ? Convert.ToInt32(ConfigurationManager.AppSettings["RootAlbumId"].ToString() ): 0;
        public static int HomePageId = ConfigurationManager.AppSettings["HomePageId"] != null ? Convert.ToInt32(ConfigurationManager.AppSettings["HomePageId"].ToString()) : 0;        
        public static string CMSAdminSessionName = ConfigurationManager.AppSettings["CMSAdminSessionName"] != null ? ConfigurationManager.AppSettings["CMSAdminSessionName"].ToString() : "";
        public static string CMSLangCookieName = ConfigurationManager.AppSettings["CMSLangCookieName"] != null ? ConfigurationManager.AppSettings["CMSLangCookieName"].ToString() : "";
        public static string AdminCookie = ConfigurationManager.AppSettings["AdminCookie"] != null ? ConfigurationManager.AppSettings["AdminCookie"].ToString() : "";
        public static string AllowedVideoContentType = ConfigurationManager.AppSettings["AllowedVideoContentType"] != null ? ConfigurationManager.AppSettings["AllowedVideoContentType"].ToString() : "";
        public static string AllowedFileContentType = ConfigurationManager.AppSettings["AllowedFileContentType"] != null ? ConfigurationManager.AppSettings["AllowedFileContentType"].ToString() : "";
        public static int DefaultLangId = ConfigurationManager.AppSettings["DefaultLangId"] != null ? Convert.ToInt32(ConfigurationManager.AppSettings["DefaultLangId"].ToString() ): 0;
        public static string ShareImage = ConfigurationManager.AppSettings["ShareImage"] != null ? ConfigurationManager.AppSettings["ShareImage"].ToString() : "";
        
    }

}
