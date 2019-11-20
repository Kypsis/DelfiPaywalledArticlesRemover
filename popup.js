document.addEventListener(
  "DOMContentLoaded",
  () => {
    const bg = chrome.extension.getBackgroundPage();
    Object.keys(bg.paywalledLinks).forEach(url => {
      const div = document.createElement("div");
      div.textContent = `${url}: ${bg.paywalledLinks[url]}`;
      document.body.appendChild(div);
    });
  },
  false
);
