
using Data.Helpers;
using Data.Models;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace Data.Common
{
    public static class Utilities
    {
     
        #region files Read/Upload

        public static string GetFileSize(int len)
        {
            string result = "";
            try
            {
                string[] sizes = { "B", "KB", "MB", "GB", "TB" };
                int order = 0;
                while (len >= 1024 && order < sizes.Length - 1)
                {
                    order++;
                    len = len / 1024;
                }
                // Adjust the format string to your preferences. For example "{0:0.#}{1}" would
                // show a single decimal place, and no space.
                result = String.Format("{0:0.#} {1}", len, sizes[order]);
            }
            catch (Exception ex)
            {
                result = "0 (KB)";
                ex.LogError();
            }


            return result;
        }

        public static string ReadFile(string FilePath)
        {
            System.IO.StreamReader Reader = new System.IO.StreamReader(FilePath);
            string StrContent = Reader.ReadToEnd();
            Reader.Close();
            return StrContent;
        }
        public static string GenerateRandomPassword(int length)
        {
            Random random = new Random();
            string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }
        public static bool CheckFile(dynamic files, string SavePath, ref string msg, string filetype = "image", bool shrinkname = false, bool renamefile = true)
        {

            bool uploaded = false;

            string CLFileExtension = null;
            string AllowedUploadContentType = "";
            if (filetype == "image")
            {
                AllowedUploadContentType = Sitesettings.AllowedImageContentType;
            }
            else if (filetype == "video")
            {
                AllowedUploadContentType = Sitesettings.AllowedVideoContentType;
            }
            else if (filetype == "imagefile")
            {
                AllowedUploadContentType = Sitesettings.AllowedContentType;
            }
            else
            {
                AllowedUploadContentType = Sitesettings.AllowedFileContentType;
            }
            CLFileExtension = files.ContentType.ToLower().ToString();

            //**********************************************************************************
            //********************** Extra validation on the upload file type*******************
            //**********************************************************************************
            Winista.Mime.MimeTypes g_MimeTypes = new Winista.Mime.MimeTypes(HttpContext.Current.Server.MapPath("~/App_Data/mime-types.xml"));
            Winista.Mime.MimeType oMimeType = default(Winista.Mime.MimeType);
            bool ContentIsValid = false;




            // create byte array
            //using (Stream stream = files.InputStream)
            // {
            byte[] attachmentBytes = new byte[files.InputStream.Length];
            files.InputStream.Seek(0, SeekOrigin.Begin);
            files.InputStream.Read(attachmentBytes, 0, attachmentBytes.Length);
            // read attachment into byte array 
            //stream.Read(attachmentBytes, 0, attachmentBytes.Length);
            sbyte[] signed = (sbyte[])(System.Array)attachmentBytes;
            oMimeType = g_MimeTypes.GetMimeType(signed);
            //if word .docx then content should be .zip


            if (oMimeType != null && ((IsValidFile(CLFileExtension.ToLower(), filetype) && IsValidFile(oMimeType.Name.ToLower(), filetype))))
            {
                ContentIsValid = true;
            }
            else
            {
                if (oMimeType != null && AllowedUploadContentType.Contains(oMimeType.Name.ToLower()))
                {
                    ContentIsValid = true;
                }

            }

            //**********************************************************************************
            //**********************************************************************************
            //**********************************************************************************                

            if (Strings.InStr(AllowedUploadContentType, CLFileExtension, CompareMethod.Text) > 0 && ContentIsValid)
            {
                FileInfo fin = new FileInfo(files.FileName);

                string Fname = Path.GetFileNameWithoutExtension(RemoveSpecialString(fin.Name)) + "-" + GenerateRandomPassword(4) + fin.Extension;
                if (renamefile)
                {
                    string myguid = Guid.NewGuid().ToString();
                    if (shrinkname)
                    {
                        myguid = myguid.Substring(0, 8).ToString();
                    }
                    Fname = myguid + fin.Extension;
                }
                files.SaveAs(SavePath + Fname);
                msg = Fname;
                uploaded = true;
            }
            else
            {
                msg = "";
                uploaded = false;
            }

            //}



            return uploaded;

        }

        private static string RemoveSpecialString(string fullName)
        {
            return fullName.Replace("!", "")
                           .Replace(":", "")
                           .Replace(",", "")
                           .Replace(";", "")
                           .Replace("$", "")
                           .Replace("+", "");
        }

        public static bool IsValidFile(string args, string tpe)
        {


            if (tpe == "image")
            {
                return args.Contains("image/jpeg") ||
                      args.Contains("image/png") ||
                      args.Contains("image/gif") ||
                      args.Contains("image/apng") ||
                      args.Contains("image/svg+xml") ||
                      args.Contains("text/xml");
            }
            else if (tpe == "imagefile")
            {
                return args.Contains("image/jpeg") ||
                      args.Contains("image/png") ||
                      args.Contains("image/gif") ||
                      args.Contains("image/apng") ||
                      args.Contains("image/svg+xml") ||
                      args.Contains("text/xml") ||
                      args.Contains("application/zip") ||
                      args.Contains("application/pdf") ||
                      args.Contains("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            }
            else if (tpe == "video")
            {
                return args.Contains("video/mp4") ||
                      args.Contains("video/x-flv") ||
                      args.Contains("application/x-mpegURL") ||
                      args.Contains("video/MP2T") ||
                      args.Contains("video/quicktime") ||
                      args.Contains("video/x-msvideo") ||
                      args.Contains("video/x-ms-wmv") ||
                      args.Contains("image/x-xwindowdump") ||
                      args.Contains("video/3gpp");
            }
            else if (tpe == "file")
            {
                return args.Contains("application/zip") ||
                       args.Contains("application/pdf") ||
                       args.Contains("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            }
            return false;
        }

        public static string UploadFile(HttpPostedFileBase file, string folderPath, string filename = "")
        {
            try
            {
                if (file != null && file.ContentLength > 0)
                {

                    string FName = "";
                    if (string.IsNullOrEmpty(filename))
                        FName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                    else
                        FName = filename + Path.GetExtension(file.FileName);
                    var webImagepath = Path.Combine(folderPath, FName);
                    file.SaveAs(webImagepath);

                    return FName;
                }
                else
                {
                    return "";
                }
            }
            catch (Exception ex)
            {
                ex.LogError();
                return "";
            }
        }


        #endregion

        #region CMSLanguagues
        public static int GetCMSLanguage(string CookieName)
        {

            int LangID = 0;
            if (HttpContext.Current.Request.Cookies[CookieName] != null)
            {
                LangID = int.Parse(HttpContext.Current.Request.Cookies[CookieName].Value.ToString());
            }
            else
            {
                LanguageHelper LH = new LanguageHelper();
                LanguageModel LM = LH.getLanguagebyculture(ConfigurationManager.AppSettings["DefaultCulture"].ToString());

                HttpCookie mycookie = new HttpCookie(CookieName);
                mycookie.Value = (LM.Id).ToString();
                mycookie.Expires = DateTime.Now.AddMinutes(60);
                HttpContext.Current.Response.Cookies.Add(mycookie);
                LangID = int.Parse(HttpContext.Current.Request.Cookies[CookieName].Value.ToString());
            }
            return LangID;
        }
        public static string GetCMSLanguageName(int LangID)
        {
            return new LanguageHelper().getLanguageName(LangID);


        }
        public static int GetLangID()
        {
            string langCulture = ConfigurationManager.AppSettings["DefaultCulture"].ToString();
            if (HttpContext.Current.Request.QueryString["langid"] != null)
            {
                langCulture = HttpContext.Current.Request.QueryString["langid"].ToString();
                HttpContext.Current.Response.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]].Value = langCulture;
                HttpContext.Current.Response.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]].Expires = DateTime.Now.AddYears(1);

            }
            else if (HttpContext.Current.Request.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]] == null || HttpContext.Current.Request.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]].Value == "")
            {

                HttpContext.Current.Response.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]].Value = langCulture;
                HttpContext.Current.Response.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]].Expires = DateTime.Now.AddYears(1);
                langCulture = HttpContext.Current.Request.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]].Value.ToString();
                HttpContext.Current.Response.Cookies.Add(HttpContext.Current.Request.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]]);
            }
            else langCulture = HttpContext.Current.Request.Cookies[ConfigurationManager.AppSettings["WebsiteLang"]].Value.ToString();

            if (langCulture == "")
            {
                langCulture = ConfigurationManager.AppSettings["DefaultCulture"].ToString();
            }

            int langid = 0;
            using (IMDGEntities cnx = new IMDGEntities())
            {
                langid = int.Parse(cnx.Languages.Where(x => x.Culture.Equals(langCulture)).FirstOrDefault().Id.ToString());
            }

            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(langCulture);
            Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(langCulture);

            return langid;
        }

        #endregion

        #region Common
        public static bool IsNumeric(this string s)
        {
            float output;
            return float.TryParse(s, out output);
        }
        public static string CutSummary(string Summary, int maxlen, bool show3dots = true)
        {
            //this function is used to get a certain number of Characters from a summary without cutting the words at the middle
            int i = 0;
            int sumlen = 0;
            sumlen = Summary.Length;
            if (sumlen > maxlen)
            {
                Summary = Microsoft.VisualBasic.Strings.Left(Summary, maxlen);
                for (i = maxlen - 1; i >= maxlen - 10; i += -1)
                {
                    if (Summary[i] == Microsoft.VisualBasic.Strings.Chr(32))
                    {
                        break; // TODO: might not be correct. Was : Exit For
                    }
                }
                Summary = Microsoft.VisualBasic.Strings.Left(Summary, i) + (show3dots ? " ... " : "");
            }
            else
            {
            }
            return Summary;
        }
        public static string EncryptPassword(string password)
        {
            var sha1 = new SHA1CryptoServiceProvider();
            var data = Encoding.ASCII.GetBytes(password);
            var sha1data = sha1.ComputeHash(data);

            var hashedPassword = Encoding.ASCII.GetString(sha1data);
            return hashedPassword;
        }
      
        public static bool LogError<T>(this T exp, string errorType = "ErrorLoging", string extramessage = "") where T : Exception
        {
            if (!exp.Message.ToLower().Contains("thread was being aborted"))
            {
                string strDate = DateTime.Now.Date.ToString("yyyy-MM");
                string FilePath = HttpContext.Current.Server.MapPath(ConfigurationManager.AppSettings["ErrorLoging"]) + errorType + "-" + strDate + ".txt";
                System.IO.FileInfo myFile = new System.IO.FileInfo(FilePath);
                System.IO.StreamWriter sWriter = new System.IO.StreamWriter(FilePath, true);
                sWriter.WriteLine(("#------------" + DateTime.Now.Date.ToString("dd-MM-yyyy hh:mm:ss tt") + "------------#"));
                sWriter.WriteLine(("Source: " + exp.Source));
                sWriter.WriteLine(("Method: " + exp.TargetSite.Name));
                sWriter.WriteLine(("Message: " + exp.Message));
                if (exp.InnerException != null)
                    sWriter.WriteLine(("Inner Exception: " + exp.InnerException.Message));
                sWriter.WriteLine(("StackTrace: " + exp.StackTrace));
                if (extramessage != "")
                {
                    sWriter.WriteLine(" -- Extra Message: --  ");
                    sWriter.WriteLine(extramessage);
                }
                sWriter.WriteLine("#------------------------------------------------#");
                sWriter.WriteLine();
                sWriter.WriteLine();
                sWriter.Close();
            }
            return true;
        }

        public static string GetIpAddress()
        {
            string strIp = HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];

            if (strIp == null || strIp == "unknown" || strIp == "")
            {
                strIp = HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"];
            }
            return strIp;
        }
        public static string RenderRazorViewToString(ControllerBase CB, string viewName, object model)
        {
            CB.ViewData.Model = model;
            using (var sw = new System.IO.StringWriter())
            {
                var viewResult = ViewEngines.Engines.FindPartialView(CB.ControllerContext,
                    viewName);
                var viewContext = new ViewContext(CB.ControllerContext, viewResult.View,
                    CB.ViewData, CB.TempData, sw);
                viewResult.View.Render(viewContext, sw);
                viewResult.ViewEngine.ReleaseView(CB.ControllerContext, viewResult.View);
                return sw.GetStringBuilder().ToString();
            }
        }

        public static string SendNETEmail(string FromName, string FromEmail, string ToEmail, string MailSubject, string MailBody, string MailFormat, string AttachedFile = "-1", string ccEmail = "", string BCCEmail = "")
        {
            System.Net.Mail.MailAddress FromAddress = new System.Net.Mail.MailAddress(FromEmail, FromName);
            string SMTPUserName, SMTPPassword, SMTPPort, SMTPEnableSSL;
            System.Net.Mail.MailMessage mailMsg = new System.Net.Mail.MailMessage();
            mailMsg.From = FromAddress;
            if (ccEmail != "")
            {
                mailMsg.CC.Add(ccEmail);

            }
            if (BCCEmail != "")
            {
                mailMsg.Bcc.Add(BCCEmail);
            }

            if (ToEmail.Contains(","))
            {
                string[] Addresses = ToEmail.Split(',');
                foreach (string Address in Addresses)
                {
                    if (Address != "")
                    {
                        mailMsg.To.Add(Address);
                    }
                }
            }
            else
            {
                mailMsg.To.Add(ToEmail);
            }
            mailMsg.Subject = MailSubject;
            mailMsg.Body = MailBody;
            mailMsg.IsBodyHtml = MailFormat == "html" ? true : false;
            mailMsg.BodyEncoding = System.Text.Encoding.UTF8;
            if (AttachedFile != "-1")
            {
                mailMsg.Attachments.Add(new System.Net.Mail.Attachment(HttpContext.Current.Server.MapPath(AttachedFile)));
            }

            SMTPUserName = ConfigurationManager.AppSettings["SMTPUserName"] != null ? ConfigurationManager.AppSettings["SMTPUserName"] : "";
            SMTPPassword = ConfigurationManager.AppSettings["SMTPPassword"] != null ? ConfigurationManager.AppSettings["SMTPPassword"] : "";
            SMTPPort = ConfigurationManager.AppSettings["SMTPPort"] != null ? ConfigurationManager.AppSettings["SMTPPort"] : "";
            SMTPEnableSSL = ConfigurationManager.AppSettings["SMTPEnableSSL"] != null ? ConfigurationManager.AppSettings["SMTPEnableSSL"] : "";
            //sending the email
            System.Net.Mail.SmtpClient myMail = new System.Net.Mail.SmtpClient();
            myMail.Host = ConfigurationManager.AppSettings["SMTP"];
            if (SMTPUserName != "" && SMTPPassword != "")
            {
                //This object stores the authentication values
                System.Net.NetworkCredential AuthenticationInfo = new System.Net.NetworkCredential(SMTPUserName, SMTPPassword);
                myMail.UseDefaultCredentials = false;
                myMail.Credentials = AuthenticationInfo;
            }
            if (SMTPEnableSSL != "")
            {
                myMail.EnableSsl = bool.Parse(SMTPEnableSSL);
            }

            if (SMTPPort != "")
            {
                myMail.Port = int.Parse(SMTPPort);
            }
            string err = "";
            try
            {

                myMail.Send(mailMsg);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
            return err;
        }

        #endregion

        public static List<Combotree> ConverttoComboxtree(List<AlbumModel> model)
        {
            List<Combotree> l = new List<Combotree>();
            foreach (var item in model)
            {
                l.Add(new Combotree
                {
                    id = item.Id,
                    isSelectable = false,
                    subs = ConverttoComboxtree(item.ChildNodes),
                    title = item.Title
                });
            }
            return l;
        }
        public static List<Combotree> ConverttoComboxtreePages(List<PageModel> model)
        {
            List<Combotree> l = new List<Combotree>();
            foreach (var item in model)
            {
                Combotree ct = new Combotree
                {
                    id = item.Id,
                    isSelectable = true,
                    title = item.Name,
                    subs = ConverttoComboxtreePages(item.ChildNodes)
                };
                l.Add(ct);
            }
            return l;
        }
      
        public static DataTable ToDataTable<T>(this IList<T> data)
        {
            PropertyDescriptorCollection props =
                TypeDescriptor.GetProperties(typeof(T));
            DataTable table = new DataTable();
            for (int i = 0; i < props.Count; i++)
            {
                PropertyDescriptor prop = props[i];
                table.Columns.Add(prop.Name, prop.PropertyType);
            }
            object[] values = new object[props.Count];
            foreach (T item in data)
            {
                for (int i = 0; i < values.Length; i++)
                {
                    values[i] = props[i].GetValue(item);
                }
                table.Rows.Add(values);
            }
            return table;
        }

        public enum PageContentTypesIds
        {
            Html = 1,
            Text = 2,
            Image = 3,
            File = 4,
            Date = 5,
            Items = 6,
            GalleryItem = 7
        }
    }
}
