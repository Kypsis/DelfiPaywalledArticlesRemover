window.paywalledLinks = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const uniqueLinks = new Set(request.links);
  console.log("Unique links: ", uniqueLinks);

  Promise.all(
    [...uniqueLinks].map(async url => {
      return {
        url: url,
        paywall: await fetch(url)
          .then(response => response.text())
          .then(text =>
            /pyfe|paywall-component="paywall"|class="paywall-container"/g.test(
              text
            )
          )
          .catch(error => console.log(error))
      };
    })
  )
    .then(results =>
      results.filter(item => item.paywall === true).map(item => item.url)
    )
    .then(paywallList => {
      window.paywalledLinks = paywallList;
      chrome.runtime.sendMessage({
        paywallList: paywallList
      });
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          paywallList: window.paywalledLinks
        });
      });
    });
});

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.create({ url: "popup.html" });
});
