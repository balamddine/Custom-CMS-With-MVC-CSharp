using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
   public class LanguageModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Culture { get; set; }

        public static LanguageModel GetFromLanguage(Language model)
        {
            LanguageModel b = new LanguageModel
            {
                Id = model.Id,
                Culture = model.Culture,
                Name = model.Name
            };

            return b;
        }
    }
}
