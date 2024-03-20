using Data.Common;
using Data.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class NewsletterSubscriptionModel
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public bool isDeleted { get; set; }
        public System.DateTime SubscriptionDate { get; set; }
        public string IpAddress { get; set; }
        public static NewsletterSubscriptionModel GetFromNewsletterSubscription(Subscriber model, int langid)
        {
            NewsletterSubscriptionModel b = new NewsletterSubscriptionModel
            {

                Id = model.Id,
                Email = model.Email,
                SubscriptionDate = model.SubscriptionDate,
                IpAddress = model.IpAddress,
                isDeleted = model.isDeleted
            };

            return b;
        }

    }
}
