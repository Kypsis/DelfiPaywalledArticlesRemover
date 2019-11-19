window.bears = {};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  window.bears[request.url] = request.count;

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
  ).then(results => console.log(results));
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
