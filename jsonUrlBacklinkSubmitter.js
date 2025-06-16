// Utility: Fisher-Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Default fallback templates
let autoTrafficTemplates = [
  "https://archive.ph/submit/?anyway=1&url=[ENCODE_URL]",
  "https://archive.ph/[URL]",
  "https://web.archive.org/save/[URL]",
  "https://web.archive.org/web/[URL]",
  "https://web.archive.org/web/*/[URL]",
  "https://archive.ph/?run=1&url=[ENCODE_URL]",
  "https://archive.today/?run=1&url=[ENCODE_URL]",
  "https://archive.ph/submit/?anyway=1&url=[ENCODE_URL]",
  "https://archive.today/submit/?anyway=1&url=[ENCODE_URL]",
  "https://archive.ph/[ENCODE_URL]",
  "http://archive.today/[ENCODE_URL]"
];

// Template and URL sources to shuffle and try in random order
const templatesJsonSources = shuffleArray([
  "https://backlink-generator-tool.github.io/json-url-backlink-submitter/backlink-templates.json"
]);

const urlJsonSources = shuffleArray([
  "https://backlink-generator-tool.github.io/url-dump-json/url/custom-urls/seekers-of-decay.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/custom-urls/referral.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/custom-urls/blogger-reddit.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/custom-urls/blogger-profile.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/custom-urls/backlink-generator.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/custom-urls/autosurf-domains.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-1.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-2.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-3.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-4.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-5.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-6.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-7.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-8.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-9.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-10.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-11.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-12.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-13.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-14.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-15.json",
  "https://backlink-generator-tool.github.io/url-dump-json/url/pinterest-urls/pin-16.json"
]);

const iframes = [];
const targetUrls = [];

// Create 15 hidden iframes right away
for (let i = 0; i < 15; i++) {
  const iframe = document.createElement('iframe');
  iframe.classList.add('loop', 'hidden-iframe');
  iframe.src = 'about:blank';
  document.body.appendChild(iframe);
  iframes.push(iframe);
}

// Generic JSON loader with auto-retry for first valid array response
async function loadFirstValidArrayFromSources(sources, label) {
  const shuffledSources = shuffleArray([...sources]);
  for (let source of shuffledSources) {
    try {
      const res = await fetch(source);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        console.log(`✅ Loaded & shuffled ${data.length} ${label} from ${source}`);
        return shuffleArray(data);
      } else {
        console.warn(`⚠️ Invalid ${label} at ${source}`);
      }
    } catch (err) {
      console.warn(`❌ Failed to load ${label} from ${source}: ${err.message}`);
    }
  }
  console.error(`🚫 No working ${label} sources found.`);
  return [];
}

// Replaces placeholders with raw and encoded URLs
function buildFinalUrl(template, rawUrl) {
  const encoded = encodeURIComponent(rawUrl);
  return template
    .replace(/\[ENCODE_URL\]|\{\{ENCODE_URL\}\}/g, encoded)
    .replace(/\[URL\]|\{\{URL\}\}/g, rawUrl);
}

// Start iframe loop when data is ready
function startIframeLoop() {
  if (!targetUrls.length || !autoTrafficTemplates.length) {
    console.error("🚫 Cannot start loop: Missing templates or URLs.");
    return;
  }

  function buildAndSetUrl(iframe) {
    const template = autoTrafficTemplates[Math.floor(Math.random() * autoTrafficTemplates.length)];
    const target = targetUrls[Math.floor(Math.random() * targetUrls.length)];
    const finalUrl = buildFinalUrl(template, target);
    iframe.src = finalUrl;
  }

  for (let iframe of iframes) {
    iframe.onload = () => {
      setTimeout(() => {
        buildAndSetUrl(iframe);
      }, 15000); // wait 15 sec after load
    };
    buildAndSetUrl(iframe); // initial load
  }
}

// Load both templates and URLs, then start loop
(async () => {
  const [templates, urls] = await Promise.all([
    loadFirstValidArrayFromSources(templatesJsonSources, 'templates'),
    loadFirstValidArrayFromSources(urlJsonSources, 'target URLs')
  ]);

  if (templates.length) autoTrafficTemplates = templates;
  if (urls.length) targetUrls.push(...urls);

  startIframeLoop();
})();
