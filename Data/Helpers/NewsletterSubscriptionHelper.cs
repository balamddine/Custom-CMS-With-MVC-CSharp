using Data.Common;
using Data.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Data.Helpers
{
    public class NewsletterSubscriptionHelper
    {
        public List<NewsletterSubscriptionModel> GetAll(int LangId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    List<NewsletterSubscriptionModel> c = new List<NewsletterSubscriptionModel>();
                    if (cnx.Subscribers.Any())
                    {
                        IQueryable<Subscriber> NewsletterSubscription = cnx.Subscribers.Where(x =>  x.isDeleted == false );

                        foreach (var model in NewsletterSubscription.ToList())
                            c.Add(NewsletterSubscriptionModel.GetFromNewsletterSubscription(model, LangId));
                    }
                    return c.OrderByDescending(x => x.SubscriptionDate).ToList();
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
            return null;
        }

        public bool CheckIfExists(string email)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Subscribers.Any(x => x.Email == email))
                    {
                       return true;
                    }

                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return false;
        }

        public NewsletterSubscriptionModel GetByid(int Id, int LangId)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Subscribers.Any(x => x.Id == Id))
                    {
                        var t = cnx.Subscribers.First(x => x.Id == Id);
                        return NewsletterSubscriptionModel.GetFromNewsletterSubscription(t, LangId);
                    }

                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return null;
        }

        public List<NewsletterSubscriptionModel> GetListing(int LangID, int pageSize, int currentPage, ref int totalrec)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    IQueryable<Subscriber> query = cnx.Subscribers.Where(x =>!x.isDeleted);
                    totalrec = query.Count();
                    var L = query.ToList().OrderByDescending(x => x.SubscriptionDate).ToList().Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    List<NewsletterSubscriptionModel> c = new List<NewsletterSubscriptionModel>();
                    foreach (var item in L)
                        c.Add(NewsletterSubscriptionModel.GetFromNewsletterSubscription(item, LangID));
                    cnx.Dispose();
                    return c.ToList();
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex);
                return null;
            }
        }

        

        public List<NewsletterSubscriptionModel> Search(int LangID, int pageSize, int currentPage,string search, ref int totalrec, bool WithHidden = false)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    IQueryable<Subscriber> query = cnx.Subscribers.Where(x => !x.isDeleted );
                    if (search != "")
                    {
                        query = query.Where(x => x.Email.ToLower() == search.ToLower());
                    }
                    totalrec = query.Count();
                    var L = query.ToList().OrderByDescending(x => x.SubscriptionDate).ToList().Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
                    List<NewsletterSubscriptionModel> c = new List<NewsletterSubscriptionModel>();
                    foreach (var item in query)
                        c.Add(NewsletterSubscriptionModel.GetFromNewsletterSubscription(item, LangID));
                    cnx.Dispose();
                    return c.ToList();
                }
            }
            catch (Exception ex)
            {
                Utilities.LogError(ex);
                return null;
            }

        }

        public bool Create(NewsletterSubscriptionModel model)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {

                    Subscriber t = new Subscriber()
                    {
                        Email = model.Email,
                        IpAddress = model.IpAddress,
                        isDeleted = model.isDeleted,
                        SubscriptionDate = model.SubscriptionDate
                    };
                    cnx.Subscribers.Add(t);
                    cnx.SaveChanges();

                    return true;
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }

            return false;
        }


        public void Delete(int id)
        {
            try
            {
                using (IMDGEntities cnx = new IMDGEntities())
                {
                    if (cnx.Subscribers.Any(x => x.Id == id))
                    {
                        var c = cnx.Subscribers.First(x => x.Id == id);
                        c.isDeleted = true;
                        cnx.SaveChanges();
                    }
                }
            }
            catch (Exception ex) { Utilities.LogError(ex); }
        }

    }
}