
const apiEndpoint = 'https://pageview-demo.jiacai2050.workers.dev/write';
const payload = {
  'url': document.location.href,
  'title': document.title,
  'referrer': window.frames.top.document.referrer,
};
fetch(`${apiEndpoint}?${new URLSearchParams(payload)}`,
      {mode: 'no-cors'})
  .catch(console.log);
