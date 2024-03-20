using System.Web;
using System.Web.Optimization;

namespace Website
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                      "~/Scripts/jquery*"));


            bundles.Add(new ScriptBundle("~/bundles/validate").Include(
                "~/Scripts/jquery.unobtrusive-ajax.js",
                        "~/Scripts/jquery.validate*"));


            bundles.Add(new ScriptBundle("~/Content/scripts").Include(
                   "~/Scripts/functions.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/styles/bootstrap.min.css",
                      "~/styles/style.css",
                      "~/styles/style-responsive.css"));
        }
    }
}
