using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace Data.Models
{
    public class LogsModel
    {
        public int Id { get; set; }
        public int LogTypeId { get; set; }
        public int UserId { get; set; }
        [Required]
        [DisplayName("Title")]
        public string Title { get; set; }
        [Required]
        [DisplayName("Description")]
        public string Descr { get; set; }
        public DateTime LogDate { get; set; }

        public static LogsModel GetFromLogs(Log model)
        {
            LogsModel b = new LogsModel
            {
                Id = model.Id,
                UserId = model.UserId,
                Title = model.Title,
                Descr = model.Descr,
                LogDate = model.LogDate
            };

            return b;
        }


    }
}
