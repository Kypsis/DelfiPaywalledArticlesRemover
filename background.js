window.paywalledLinks = [];
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  Promise.all(
    request.links.map(async url => {
      return {
        url: url,
        paywall: await fetch(url)
          .then(response => response.text())
          .then(text => text.includes("paywall"))
          .catch(error => console.log(error))
      };
    })
  )
    .then(results =>
      results.filter(item => item.paywall === true).map(item => item.url)
    )
    .then(paywallList => (window.paywalledLinks = paywallList));
});

chrome.browserAction.onClicked.addListener(async tab => {
  chrome.tabs.create({ url: "popup.html" });

  /* let plinks = await Promise.all(
    tags.map(url => {
      return potusParse("https://en.wikipedia.org" + url);
    })
  ); */

  return true;
  // Will respond asynchronously.
});
