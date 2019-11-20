let previousLinksLength = 0;
let seenBeforeLinks = [];

function getAndSendAllLinks() {
  const linksFromAnchors = [...document.links]
    .map(link => link.href)
    .filter(link =>
      // Get all links containing delfi.ee or postimees.ee with regex but
      // exclude them if they contain adform, twitter or facebook
      link.match(
        /^(?=.*(delfi\.ee|postimees\.ee))(?!.*(adform|twitter|facebook)).+$/g
      )
    );
  const uniqueLinks = [...new Set(linksFromAnchors)];

  if (uniqueLinks.length === previousLinksLength) return;

  console.log("Links: ", uniqueLinks.length);

  previousLinksLength = uniqueLinks.length;

  chrome.runtime.sendMessage({
    links: uniqueLinks
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.paywallList.length) {
    console.log("Paywalled links: ", request.paywallList.length);

    request.paywallList.forEach(link =>
      document
        .querySelectorAll(`a[href="${link}"]`)
        .forEach(item =>
          item.closest("article")
            ? (item.closest("article").style.opacity = 0.1)
            : (item.style.opacity = 0.1)
        )
    );
  }
});

getAndSendAllLinks();
setInterval(getAndSendAllLinks, 10000);
//setTimeout(() => getAndSendAllLinks(), 5000);
