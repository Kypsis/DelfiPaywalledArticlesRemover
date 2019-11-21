let previousLinksLength = 0;
let seenBeforeLinks = JSON.parse(localStorage.getItem("seenBeforeLinks")) || [];

function getAndSendAllLinks() {
  const linksFromAnchors = [...document.links]
    .map(link => link.href)
    .filter(link =>
      // Get all links containing delfi.ee or postimees.ee with regex but
      // exclude them if they contain adform, twitter or facebook
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
  localStorage.setItem("seenBeforeLinks", JSON.stringify(seenBeforeLinks));

  // If number of links is unchanged return
  if (uniqueLinks.length === previousLinksLength) return;

  previousLinksLength = uniqueLinks.length;
  console.log("Links: ", seenBeforeLinks.length);
  console.log("New links: ", newLinks.length);

  chrome.runtime.sendMessage({
    links: newLinks
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.paywallList.length) {
    console.log("Saved paywalled links: ", request.paywallList.length);

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
