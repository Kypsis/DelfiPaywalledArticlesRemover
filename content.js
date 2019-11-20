const re = new RegExp("bear", "gi");
const matches = document.documentElement.innerHTML.match(re) || [];

let tags = [...document.links]
  .map(link => link.href)
  .filter(link =>
    link.match(/^(?!mailto).*postimees\.ee|^(?!mailto).*delfi\.ee/g)
  );
console.log(tags);

chrome.runtime.sendMessage({
  links: tags,
  count: matches.length
});
