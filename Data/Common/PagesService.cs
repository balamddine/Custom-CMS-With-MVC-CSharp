using Data.Helpers;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Caching;
using System.Web.UI.WebControls;

namespace Data.Common
{
    public static class PagesService
    {
        // Recursively collect siblings and parents of a node
        public static List<PageModel> GetSiblingsAndParents(PageModel node)
        {
            List<PageModel> siblingsAndParents = new List<PageModel>();
            //if (HttpContext.Current.Cache["GetSiblingsAndParents"] != null)
            //{
            //    siblingsAndParents = HttpContext.Current.Cache["GetSiblingsAndParents"] as List<PageModel>;

            //}
            //else
            //{
            PageModel Parent = new PageHelper().GetById(node.ParentId);
            if (Parent != null)
            {
                foreach (var child in Parent.ChildNodes)
                {
                    if (child != node)
                    {
                        siblingsAndParents.Add(child);
                    }
                }
                if (siblingsAndParents.FirstOrDefault(x => x.Id == Parent.Id) == null)
                {
                    siblingsAndParents.Add(Parent);
                    // Recursively add parent's siblings and parents
                    siblingsAndParents.AddRange(GetSiblingsAndParents(Parent));
                }                
            }

            //  }
            //  HttpContext.Current.Cache.Insert("GetSiblingsAndParents", siblingsAndParents, null, Cache.NoAbsoluteExpiration, TimeSpan.FromMinutes(30));


            return siblingsAndParents;
        }
    }
}
