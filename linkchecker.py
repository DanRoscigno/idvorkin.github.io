# Copied from -
# https://dev.to/pjcalvo/broken-links-checker-with-python-and-scrapy-webcrawler-1gom
# Execute via:
#    scrapy runspider linkchecker.py -o ~/tmp/broken-links.csv
# Use a webtool @ https://www.brokenlinkcheck.com/broken-links.php#status

from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
from scrapy.item import Item, Field


class MyItems(Item):
    referer = Field()  # where the link is extracted
    response = Field()  # url that was requested
    status = Field()  # status code received


def parse_my_url(response):
    print(f"called on {response}")
    # list of response codes that we want to include on the report, we know
    # that 404
    report_if = [404]
    if response.status in report_if:  # if the response matches then creates a MyItem
        item = MyItems()
        item["referer"] = response.request.headers.get("Referer", None)
        item["status"] = response.status
        item["response"] = response.url
        yield item
    yield None  # if the response did not match return emptyo


class MySpider(CrawlSpider):
    name = "test-crawler"
    target_domains = ["idvork.in"]  # list of domains that will be allowed to be crawled
    start_urls = ["https://idvork.in/all"]  # list of starting urls for the crawler
    handle_httpstatus_list = [
        404,
        410,
        500,
    ]  # only 200 by default. you can add more status to list

    # Throttle crawl speed to prevent hitting site too hard
    custom_settings = {
        "CONCURRENT_REQUESTS": 20,  # Some requests timeout, so have plenty of threads.
        "DOWNLOAD_DELAY": 0.05,  # delay between requests
        "REDIRECT_ENABLED": True,
        "RETRY_ENABLED": False,
    }

    rules = [
        Rule(
            LinkExtractor(
                allow_domains=target_domains,
                deny=("patterToBeExcluded"),
                unique=("Yes"),
            ),
            callback=parse_my_url,
            follow=True,
        ),
        # crawl external links but don't follow them
        # This rule is to have the linkchecker crawl each of the links found in
        # your pages (the pages in the `target_domains` list that get crawled)
        # but not go any further. This can be used for testing the URLs on your
        # site for 302, 404, etc. The `follow=False` causes the links on these
        # pages to not get crawled.
        # Rule(
        # LinkExtractor(allow=(""), deny=("patterToBeExcluded"), unique=("Yes")),
        # callback=parse_my_url,
        # follow=False,
        # ),
    ]
