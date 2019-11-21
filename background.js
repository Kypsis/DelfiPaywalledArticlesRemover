window.paywalledLinks =
  JSON.parse(localStorage.getItem("paywalledLinks")) || [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const newLinks = request.links.filter(
    item => window.paywalledLinks.indexOf(item) == -1
  );
  console.log("New links: ", newLinks.length);
  console.log("Saved paywall links: ", window.paywalledLinks.length);

  Promise.all(
    newLinks.map(async url => {
      return {
        url: url,
        paywall: await fetch(url)
          .then(response => response.text())
          .then(text =>
            /pyfe-overlay|paywall-component="paywall"|class="paywall-container"/g.test(
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
    .then(newPaywallLinks => {
      window.paywalledLinks = window.paywalledLinks.length
        ? [...window.paywalledLinks, ...newPaywallLinks]
        : [...newPaywallLinks];
      localStorage.setItem(
        "paywalledLinks",
        JSON.stringify(window.paywalledLinks)
      );

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
