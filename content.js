const re = new RegExp("bear", "gi");
const matches = document.documentElement.innerHTML.match(re) || [];
let tags = [...document.links].map(l => l.href);
console.log(tags);

chrome.runtime.sendMessage({
  links: tags,
  count: matches.length
});
