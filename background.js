// Restrict page action (icon grayed out) to only delfi.ee and postimees.ee
// BUGGED. TODO: check why the click functionality on icon bugs out.
/* chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: ["*.delfi.ee/*", "*.postimees.ee/*"] }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
}); */

let seenBeforeLinks = JSON.parse(localStorage.getItem("seenBeforeLinks")) || [];
window.paywalledLinks =
  JSON.parse(localStorage.getItem("paywalledLinks")) || [];

// Listen for links from content.js and store new links
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const newLinks = request.links.filter(
    item => seenBeforeLinks.indexOf(item) == -1
  );

  console.log("New links: ", newLinks.length);

  // Fetch new links that contain paywall regex
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
      // Convert array of objects to an array where every link is paywall link
      results.filter(item => item.paywall === true).map(item => item.url)
    )
    .then(newPaywallLinks => {
      // Store new paywall links
      window.paywalledLinks = window.paywalledLinks.length
        ? [...window.paywalledLinks, ...newPaywallLinks]
        : [...newPaywallLinks];
      localStorage.setItem(
        "paywalledLinks",
        JSON.stringify(window.paywalledLinks)
      );

      // Store all unique links and only add when new unique link
      seenBeforeLinks = seenBeforeLinks.length
        ? [...new Set([...seenBeforeLinks, ...newLinks])]
        : [...newLinks];
      localStorage.setItem("seenBeforeLinks", JSON.stringify(seenBeforeLinks));

      console.log("Total saved links: ", seenBeforeLinks.length);
      console.log("Saved paywall links: ", window.paywalledLinks.length);

      // Send paywalled links to content.js
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          paywallList: window.paywalledLinks
        });
      });
    });
});

// When clicking extension icon create new page with paywall links
chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.create({ url: "popup.html" });
});
