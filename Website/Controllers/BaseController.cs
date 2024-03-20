using Data.Common;
using Data.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Website.Controllers
{
    public class BaseController : Controller
    {
        // GET: Base
       public int Langid = 1;
        protected override void OnActionExecuting(ActionExecutingContext context)
        {
            Langid = Utilities.GetLangID();
            ViewBag.SEOkeywords = "";
            ViewBag.SEODescription = "";
            try
            {
                //var tt = new HomePageContentHelper().GetAll(Langid);
                //ViewBag.SEOkeywords = tt[0].SEOKeyword;
                //ViewBag.SEODescription = tt[0].SEODescription;
            }
            catch (Exception ex) { }
            
            ViewBag.SEOUrl = Request.RawUrl=="/"?"/home/index": Request.RawUrl;
            ViewBag.CurrentLanguage = Langid;
            base.OnActionExecuting(context);
        }


    }
}