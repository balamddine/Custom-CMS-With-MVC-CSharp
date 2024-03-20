using CMS.Models;
using Data.Common;
using Data.Helpers;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace CMS.Controllers
{
    public class NewsletterSubscriptionController : BaseController
    {
        #region "Index"        
        public ActionResult Index(int page = 1,string search="",int export = 0)
        {
            int totalrec = 0; int pagesize = 20;
            var t = new NewsletterSubscriptionHelper().Search(LangId, pagesize, page, search, ref totalrec, true);
            ViewBag.search = search;
            ViewBag.rowsPerPage = pagesize;
            ViewBag.rowCount = totalrec;
            if (export == 1)
            {
                List<NewsletterSubscriptionModel> jj = new NewsletterSubscriptionHelper().Search(LangId, 1000000, page, search, ref totalrec, true);
               
                DataTable queryDt = Utilities.ToDataTable(jj);
                Export(queryDt);
            }
            return View(t);
        }
        public ActionResult Export(DataTable queryDt)
        {

            string[] cols = { "Email", "Deleted", "Created Date", "Ip Address"};
            string[] Hidecols = { "Id" };
            string name = DateTime.Now.ToString("dd-MM-yyyy") + "-" + "Newsletter submissions";
            ExcelExport.GenerateExcelReport(queryDt, cols, Hidecols, "Excel", name);

            return RedirectToAction("Index");
        }
        public ActionResult Delete(int id)
        {

            NewsletterSubscriptionHelper helper = new NewsletterSubscriptionHelper();
            helper.Delete(id);
            return RedirectToAction("Index");
        }
        #endregion
      

    }
}