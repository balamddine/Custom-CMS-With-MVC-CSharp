using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Helpers
{
   public class LanguageHelper
    {

        public List<LanguageModel> getLanguage(string excludeids="")
        {
            using (IMDGEntities cnx = new IMDGEntities())
            {
                List<string> excludeidsL = excludeids.Split(',').ToList();
                IQueryable<Language> Languages = cnx.Languages;
                if (excludeids != "")
                {
                    Languages = Languages.Where(x => !excludeidsL.Contains(x.Id.ToString()));
                }
                List<LanguageModel> c = new List<LanguageModel>();
                foreach (var item in Languages)
                    c.Add(LanguageModel.GetFromLanguage(item));

                return c;
            }
        }
      
        //Get Language with name passed as parameter
        public LanguageModel getLanguageByName(string name)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Languages.Any(x => x.Name.ToLower() == name.ToLower()))
                        return LanguageModel.GetFromLanguage(cnx.Languages.First(x => x.Name.ToLower() == name.ToLower()));
                }
            }
            catch (Exception ex)
            {
                ex.LogError();
            }
            return null;
        }
        public LanguageModel getLanguageByCulture(string culture)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Languages.Any(x => x.Culture.ToLower() == culture.ToLower()))
                        return LanguageModel.GetFromLanguage(cnx.Languages.First(x => x.Culture.ToLower() == culture.ToLower()));
                }
            }
            catch (Exception ex)
            {
                ex.LogError();
            }
            return null;
        }
        public LanguageModel getLanguagebyculture(string culture)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Languages.Any(x => x.Culture.ToLower() == culture.ToLower()))
                        return LanguageModel.GetFromLanguage(cnx.Languages.First(x => x.Culture.ToLower() == culture.ToLower()));
                }
            }
            catch (Exception ex)
            {
                ex.LogError();
            }
            return null;
        }
        public string getLanguageCulture(int LangID)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Languages.Any(x => x.Id == LangID))
                        return LanguageModel.GetFromLanguage(cnx.Languages.First(x => x.Id == LangID)).Culture;
                }
            }
            catch (Exception ex)
            {
                ex.LogError();
            }
            return null;
        }
        public string getLanguageName(int LangID)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Languages.Any(x => x.Id == LangID))
                        return LanguageModel.GetFromLanguage(cnx.Languages.First(x => x.Id == LangID)).Name;
                }
            }
            catch (Exception ex)
            {
                ex.LogError();
            }
            return null;
        }
    }
}
