let previousLinksLength = 0;

function getAndSendAllLinks() {
  const linksFromAnchors = [...document.links]
    .map(link => link.href)
    .filter(link =>
      // Get all links containing delfi.ee, postimees.ee etc with regex but
      // exclude them if they contain adform, twitter, facebook, etc
      link.match(
        /^(?=.*(delfi\.ee|postimees\.ee))(?!.*(adform\.net|twitter\.com|facebook\.com|linkedin\.com|mailto|chrome-extension)).+$/g
      )
    );
  const uniqueLinks = [...new Set(linksFromAnchors)];

  // If number of links is unchanged return
  if (uniqueLinks.length === previousLinksLength) return;

  previousLinksLength = uniqueLinks.length;

  chrome.runtime.sendMessage({
    links: uniqueLinks
  });
}

// Paywall link stylings
let styles = ["style", "opacity:0.1;"];

// Receive paywall links from background.js and style them
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.paywallList.length) {
    console.log("Saved paywalled links: ", request.paywallList.length);

    request.paywallList.forEach(link => {
      const relativeLink = link.replace(/^(?:\/\/|[^\/]+)*/g, "");
      document
        .querySelectorAll(`a[href="${link}"]`)
        .forEach(item =>
          item.closest(".headline")
            ? item.closest(".headline").setAttribute(...styles)
            : item.setAttribute(...styles)
        );
      document
        .querySelectorAll(`a[href="${relativeLink}"]`)
        .forEach(item =>
          item.closest(".headline")
            ? item.closest(".headline").setAttribute(...styles)
            : item.setAttribute(...styles)
        );
    });
  }
});

getAndSendAllLinks();
setInterval(getAndSendAllLinks, 5000);
