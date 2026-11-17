using Microsoft.AspNetCore.Mvc;

namespace PublishingStarter.Controllers;

public class HomeController : Controller
{


    [HttpGet("/")]
    public IActionResult Index() => Screen("Home/Index");


    [HttpGet("/about")]
    public IActionResult About() => Screen("About/Index");


    [HttpGet("/contact")]
    public IActionResult Contact() => Screen("About/Contact");


    [HttpGet("/members")]
    public IActionResult Members() => Screen("Members/Index");


    [HttpGet("/members/detail")]
    public IActionResult MemberDetail() => Screen("Members/Detail");


    [HttpGet("/practice")]
    public IActionResult Practice() => Screen("Practice/Index");


    [HttpGet("/practice/detail")]
    public IActionResult PracticeDetail() => Screen("Practice/Detail");


    [HttpGet("/regions")]
    public IActionResult Regions() => Screen("Practice/Regions");


    [HttpGet("/regions/detail")]
    public IActionResult RegionDetail() => Screen("Practice/RegionDetail");


    [HttpGet("/centers")]
    public IActionResult Centers() => Screen("Practice/Centers");


    [HttpGet("/center")]
    public IActionResult Center() => Screen("Practice/Center");


    [HttpGet("/cases")]
    public IActionResult Cases() => Screen("Cases/Index");


    [HttpGet("/cases/detail")]
    public IActionResult CaseDetail() => Screen("Cases/Detail");


    [HttpGet("/news")]
    public IActionResult News() => Screen("News/Index");


    [HttpGet("/news/detail")]
    public IActionResult NewsDetail() => Screen("News/Detail");


    [HttpGet("/resources")]
    public IActionResult Resources() => Screen("News/Resources");


    [HttpGet("/media")]
    public IActionResult Media() => Screen("News/Media");


    [HttpGet("/consultation")]
    public IActionResult Consultation() => Screen("Consultation/Index");


    [HttpGet("/search")]
    public IActionResult Search() => Screen("Search/Index");

    // 법적 고지: 정적 퍼블리싱 화면
    [HttpGet("/policy/privacy")]
    public IActionResult Privacy() => Screen("Policy/Privacy");

    [HttpGet("/policy/agree")]
    public IActionResult Agree() => Screen("Policy/Agree");

    [HttpGet("/policy/disclaimer")]
    public IActionResult Disclaimer() => Screen("Policy/Disclaimer");

    private ViewResult Screen(string name) => View("~/Views/Fronts/" + name + ".cshtml");



    [HttpGet("/sitemap.xml")]
    public IActionResult Sitemap()
    {
        var paths = new[] { "/", "/about", "/contact", "/members", "/members/detail", "/practice", "/practice/detail", "/regions", "/regions/detail", "/centers", "/center", "/cases", "/cases/detail", "/news", "/news/detail", "/resources", "/media", "/consultation", "/policy/privacy", "/policy/agree", "/policy/disclaimer" };
        var origin = Request.Scheme + "://" + Request.Host;
        var ns = System.Xml.Linq.XNamespace.Get("http://www.sitemaps.org/schemas/sitemap/0.9");
        var document = new System.Xml.Linq.XDocument(new System.Xml.Linq.XElement(ns + "urlset",
            paths.Select(path => new System.Xml.Linq.XElement(ns + "url", new System.Xml.Linq.XElement(ns + "loc", origin + path)))));
        return Content(document.ToString(), "application/xml");
    }



    [HttpGet("/robots.txt")]
    public IActionResult Robots() => Content("User-agent: *\nAllow: /\nSitemap: " + Request.Scheme + "://" + Request.Host + "/sitemap.xml\n", "text/plain");
}
