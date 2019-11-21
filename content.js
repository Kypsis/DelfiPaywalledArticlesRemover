let previousLinksLength = 0;
let seenBeforeLinks =
  JSON.parse(sessionStorage.getItem("seenBeforeLinks")) || [];

function getAndSendAllLinks() {
  const linksFromAnchors = [...document.links]
    .map(link => link.href)
    .filter(link =>
      // Get all links containing delfi.ee or postimees.ee with regex but
      // exclude them if they contain adform, twitter, facebook, etc
      link.match(
        /^(?=.*(delfi\.ee|postimees\.ee))(?!.*(adform\.net|twitter\.com|facebook\.com|linkedin\.com|mailto|chrome-extension)).+$/g
      )
    );
  const uniqueLinks = [...new Set(linksFromAnchors)];

  // Filter out new links
  const newLinks = uniqueLinks.filter(
    item => seenBeforeLinks.indexOf(item) == -1
  );

  // Store all unique links and only add when new unique link
  seenBeforeLinks = seenBeforeLinks.length
    ? [...new Set([...seenBeforeLinks, ...uniqueLinks])]
    : [...uniqueLinks];
  sessionStorage.setItem("seenBeforeLinks", JSON.stringify(seenBeforeLinks));

  // If number of links is unchanged return
  if (uniqueLinks.length === previousLinksLength) return;

  previousLinksLength = uniqueLinks.length;
  console.log("Previously saved links: ", seenBeforeLinks.length);
  console.log("New links: ", newLinks.length);

  chrome.runtime.sendMessage({
    links: newLinks
  });
}

// Paywall link stylings
let styles = ["style", "opacity:0.1;"];

// Receive paywall links from background.js and style them
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.paywallList.length) {
    console.log("Saved paywalled links: ", request.paywallList.length);

    request.paywallList.forEach(link =>
      document
        .querySelectorAll(`a[href="${link}"]`)
        .forEach(item =>
          item.closest("article")
            ? item.closest("article").setAttribute(...styles)
            : item.setAttribute(...styles)
        )
    );
  }
});

getAndSendAllLinks();
setInterval(getAndSendAllLinks, 5000);
