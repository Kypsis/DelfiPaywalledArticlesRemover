let previousLinksLength = 0;

function getAndSendAllLinks() {
  let links = [...document.links]
    .map(link => link.href)
    .filter(link =>
      link.match(
        /^(?!mailto).*postimees\.ee|^(?!mailto).*delfi\.ee|^(?!admp-tc).*delfi\.ee/g
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
      document.querySelector(`a[href="${link}"]`).closest("article")
        ? (document
            .querySelector(`a[href="${link}"]`)
            .closest("article").style.opacity = 0.1)
        : (document.querySelector(`a[href="${link}"]`).style.opacity = 0.1)
    );
  }
});

//getAndSendAllLinks();
//setInterval(getAndSendAllLinks, 10000);
setTimeout(() => getAndSendAllLinks(), 10000);
