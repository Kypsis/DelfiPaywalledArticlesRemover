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
    .then(results => {
      const filtered = results
        .filter(item => item.paywall === true)
        .map(item => item.url);
      return [...new Set(filtered)];
    })
    .then(paywallList => {
      window.paywalledLinks = paywallList;
      chrome.runtime.sendMessage({
        paywallList: paywallList
      });
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { paywallList: paywallList });
      });
    });
});

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.create({ url: "popup.html" });
});
