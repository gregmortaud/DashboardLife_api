import movieCrawler from '../crawlers/movieYtsCrawler';

function managerCrawler(callback) {
  console.log("managerCrawler");
  movieCrawler.crawl(function() {
    callback("retour du crawler");
    return ;
  });
  return ;
}

export default managerCrawler;
