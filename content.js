let previousLinksLength = 0;
let newLinks = [];

function getAndSendAllLinks() {
  let links = [...document.links]
    .map(link => link.href)
    .filter(link =>
      link.match(
        /^(?=.*(delfi\.ee|postimees\.ee))(?!.*(adform|twitter|facebook)).+$/g
      )
    );

  if (links.length === previousLinksLength) return;

  console.log("Links: ", links.length);
  previousLinksLength = links.length;

  chrome.runtime.sendMessage({
    links: links
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

/* document.querySelector(`a[href="${link}"]`).closest("article")
        ? (document
            .querySelector(`a[href="${link}"]`)
            .closest("article").style.opacity = 0.1) */

//getAndSendAllLinks();
//setInterval(getAndSendAllLinks, 10000);
setTimeout(() => getAndSendAllLinks(), 5000);
