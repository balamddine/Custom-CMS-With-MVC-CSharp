using CMS.Controllers;
using Data;
using Data.Helpers;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace CMS.Controllers
{
    public class PageTemplateController : BaseController
    {
        // GET: PageContentTypeFields
        public ActionResult Index()
        {

            return View(new PageTemplateHelper().GetAll());
        }

        public ActionResult Delete(int id)
        {
            var ctr = new PageTemplateHelper();
            var muelem = ctr.GetById(id);

            ctr.Delete(id);

            return RedirectToAction("Index");
        }
        
        #region Create
        public ActionResult Create()
        {
            ViewBag.ContentTypedd = new PageContentTypeHelper().GetAll();
            return View();
        }

        [HttpPost]
        public ActionResult Create(PageTemplateModel model, FormCollection obj)
        {
            PageTemplateHelper helper = new PageTemplateHelper();
            if (helper.TemplateExists(model.Name))
            {
                ModelState.AddModelError("", "Template already exists.");
            }
            else
            {
                string TemplateType = obj["TemplateType"] != null ? obj["TemplateType"] : "";
                PageTemplateModel mCType = new PageTemplateModel
                {
                    Name = model.Name,
                    ContentTypeId =  model.ContentTypeId,
                    Link = model.Link
                };
                int id = helper.Create(mCType);
                if (id > 0)
                {
                    return RedirectToAction("Index", "PageTemplate");
                }
                else
                    ModelState.AddModelError("", "Creating template failed. Please check your info.");
            }

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();
            return View(model);
        }


        #endregion

        #region Edit
        public ActionResult Edit(int id)
        {
            ViewBag.ContentTypedd = new PageContentTypeHelper().GetAll();
            var elem = new PageTemplateHelper().GetById(id);
            return View(elem);
        }
        [HttpPost]
        public ActionResult Edit(PageTemplateModel model)
        {

            PageTemplateHelper helper = new PageTemplateHelper();
            PageHelper pghelper = new PageHelper();
            PageTemplateModel item = helper.GetById(model.id);
            item.Name = model.Name;
            item.ContentTypeId = model.ContentTypeId;
            item.Link = model.Link;
            if (helper.update(item))
            {
                List<PageModel> Listpages = pghelper.GetAllPagesByTemplateId(model.id,LangId);
                foreach (PageModel pge in Listpages)
                {
                    string Link = item.Link + "/" + pge.Id;                    
                    pghelper.updateLink(pge.Id, Link, item.ContentTypeId);
                    
                }                
                return RedirectToAction("Index");
            }
            else
                ModelState.AddModelError("", "Updating template failed. Please check your info.");

            var errors = ModelState.Select(x => x.Value.Errors)
                       .Where(y => y.Count > 0)
                       .ToList();
            return View(model);
        }
        #endregion



    }
}