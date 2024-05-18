using CMS.Controllers;
using CMS.Extensions;
using Data.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CMS.Controllers
{
    public class LogsController : BaseController
    {
        // GET: Logs
        [CustomAuthorization("Logs","View")]
        public ActionResult Index(int page=1)
        {            
            int totalrec = 0; int pagesize = 10;
            var t = new LogsHelper().GetAll(pagesize, page, ref totalrec);
            ViewBag.TotalRows = totalrec;

            return View(t);
        }
    }
}