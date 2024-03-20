using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Website.Models
{
    public class HomePageContentModel
    {
        public List<LanguageModel> languagesL { get; set; } 
        public int selectedlangid { get; set; }
        public string selectedlangName { get; set; }
    }
}