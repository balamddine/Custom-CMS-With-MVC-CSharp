using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Common
{
    public class Combotree
    {
     
        public int id { get; set; }
        public string title { get; set; }
        public List<Combotree> subs { get; set; }
        public bool isSelectable { get; set; }
    }
}
