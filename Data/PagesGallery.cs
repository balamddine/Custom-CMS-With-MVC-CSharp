//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class PagesGallery
    {
        public int Id { get; set; }
        public int PageId { get; set; }
        public string Image { get; set; }
        public int Display { get; set; }
        public bool isDeleted { get; set; }
        public bool isHidden { get; set; }
    
        public virtual Page Page { get; set; }
    }
}