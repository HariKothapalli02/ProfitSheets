import json

file_path = r'd:\Agency\Profit-sheets\ProfitSheets.json'
file_path_enhanced = r'd:\Agency\Profit-sheets\ProfitSheets_Enhanced.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data.get('nodes', []):

    # 1. Update Normalize Merged Category Items node (Clean tags & keywords)
    if node.get('name') == 'Normalize Merged Category Items':
        node['parameters']['jsCode'] = '''const all = $input.all();

const clean = (text) => String(text || "")
  .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, " ")
  .replace(/<[^>]*>/g, " ")
  .replace(/\\s+/g, " ")
  .trim();

const stopwords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "this", "that", "these", "those", "it", "its", "as", "stays", "under", "via", "what", "next"]);

const categoryFallback = {
  "Stock News": ["stock", "market", "sensex", "nifty", "trading", "stocks"],
  "IPO Calendar": ["ipo", "listing", "calendar", "shares", "issue"],
  "Business News": ["business", "economy", "finance", "corporate", "market"],
  "Technology": ["technology", "ai", "tech", "software", "innovation"],
  "Startup News": ["startup", "funding", "unicorn", "venture", "business"],
  "Forex": ["forex", "currency", "exchange", "trading", "dollar", "rupee"],
  "Cryptocurrency": ["crypto", "bitcoin", "ethereum", "blockchain", "altcoin"],
  "Mutual Funds": ["mutual-funds", "sip", "investing", "finance", "equity"],
  "Market Analysis": ["market", "analysis", "technical", "charts", "trading"],
  "Global Markets": ["global", "markets", "wallstreet", "nasdaq", "economy"],
  "Banking": ["banking", "central-bank", "rbi", "fed", "interest-rates"],
  "Commodities": ["commodities", "gold", "silver", "crude-oil", "metals"]
};

const seenTitles = new Set();
const seenUrls = new Set();

return all
  .filter(item => {
    if (!item.json || item.json.error) return false;
    const title = clean(item.json.title || item.json.rss_title || item.json.headline);
    const sourceUrl = clean(item.json.source_url || item.json.rss_link || item.json.link || item.json.guid);
    if (!title || title.length < 12) return false;

    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seenTitles.has(normalizedTitle)) return false;
    if (sourceUrl && seenUrls.has(sourceUrl)) return false;

    seenTitles.add(normalizedTitle);
    if (sourceUrl) seenUrls.add(sourceUrl);
    return true;
  })
  .map(item => {
    const j = item.json;

    const title = clean(j.title || j.rss_title || j.headline);
    const description = clean(j.short_description || j.rss_description || j.description || j.contentSnippet || j.content);
    const sourceUrl = clean(j.source_url || j.rss_link || j.link || j.guid);
    const category = clean(j.category || "Top");
    const defaultTags = categoryFallback[category] || ["news", "updates", "finance"];

    // Clean meaningful keywords (exclude single characters & stopwords)
    const titleKeywords = title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(w => w.length > 3 && !stopwords.has(w))
      .slice(0, 4);

    const keywords = Array.from(new Set([...defaultTags, ...titleKeywords]));
    const imageQuery = titleKeywords.length ? `${category} ${titleKeywords.slice(0, 3).join(" ")}` : `${category} news`;

    return {
      json: {
        title: title || `${category} News Update`,
        priority: Number(j.priority || -2),
        category: category || "Top",
        country: clean(j.country || (category === "Global Markets" ? "Global" : "India")),
        keywords,
        publish_date: j.publish_date || j.rss_date || j.isoDate || j.pubDate || new Date().toISOString(),
        layout: clean(j.layout || "Standard (Single Image)"),
        status: clean(j.status || "MARK AS BREAKING"),
        image_url: clean(j.image_url),
        image_search_query: imageQuery,
        short_description: description || `Latest ${category} news update.`,
        content: clean(j.content || j.rss_description || description || title || `Latest ${category} news update.`),
        source_url: sourceUrl
      }
    };
  });'''

    # 2. Update Extract Full Article Text node (Strip navigation, symbols, headers & footers)
    if node.get('name') == 'Extract Full Article Text':
        node['parameters']['jsCode'] = '''const original = $('Split News Items').item.json;

const clean = (text) => String(text || "")
  .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, " ")
  .replace(/[ \\t]+/g, " ")
  .replace(/\\n{3,}/g, "\\n\\n")
  .trim();

let html = "";

if (typeof $json === "string") {
  html = $json;
} else {
  html = $json.body || $json.data || $json.text || $json.html || $json.response || "";
}

html = String(html || "");

let articleText = html
  .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
  .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
  .replace(/<noscript[\\s\\S]*?<\\/noscript>/gi, " ")
  .replace(/<header[\\s\\S]*?<\\/header>/gi, " ")
  .replace(/<footer[\\s\\S]*?<\\/footer>/gi, " ")
  .replace(/<nav[\\s\\S]*?<\\/nav>/gi, " ")
  .replace(/<aside[\\s\\S]*?<\\/aside>/gi, " ")
  .replace(/<form[\\s\\S]*?<\\/form>/gi, " ")
  .replace(/<button[\\s\\S]*?<\\/button>/gi, " ")
  .replace(/<svg[\\s\\S]*?<\\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&rsquo;/g, "'")
  .replace(/&lsquo;/g, "'")
  .replace(/&ldquo;/g, '"')
  .replace(/&rdquo;/g, '"')
  .replace(/\\s+/g, " ")
  .trim();

// Strip symbol lists, UI noise, site navigation garbage
articleText = articleText
  .replace(/["']?\\s*[#\\$%\&'\(\\)\\*\\+,\\-\\.\\/0-9:;<=>\\?@A-Z\\[\\\\\\]\\^_`a-z\\{\\|\\}~!]{20,}/gi, " ")
  .replace(/Home\\s+Stocks.*?(?=FUNDAMENTAL|TECHNICAL|MARKET|ANALYSIS|S&P|NIFTY|SENSEX)/gi, " ")
  .replace(/Loading the next article/gi, " ")
  .replace(/Error loading the next article/gi, " ")
  .replace(/Did you find what you were looking for\\?/gi, " ")
  .replace(/Was this page helpful\\?/gi, " ")
  .replace(/\\(Required\\)/gi, " ")
  .replace(/Yes No Partly/gi, " ")
  .replace(/Share Details/gi, " ")
  .replace(/Last Updated.*?Location/gi, " ")
  .replace(/Related Terms.*?$/gi, " ")
  .replace(/Most Popular/gi, " ")
  .replace(/Trending Stories/gi, " ")
  .replace(/Advertisement/gi, " ")
  .replace(/Subscribe to.*?Newsletter/gi, " ")
  .replace(/REGISTER NOW/gi, " ")
  .replace(/View Bio/gi, " ")
  .replace(/The post .*? appeared first on .*?\\./gi, " ")
  .replace(/\\s+/g, " ")
  .trim();

articleText = clean(articleText);

if (articleText.length > 15000) {
  articleText = articleText.substring(0, 15000);
  const lastStop = Math.max(articleText.lastIndexOf("."), articleText.lastIndexOf("?"), articleText.lastIndexOf("!"));
  if (lastStop > 5000) {
    articleText = articleText.substring(0, lastStop + 1);
  }
}

const fallbackText = clean(
  `${original.title}. ${original.short_description}. ${original.content}. Source URL: ${original.source_url || ""}`
);

return [{
  json: {
    ...original,
    full_article_text: articleText.length > 300 ? articleText : fallbackText
  }
}];'''

    # 3. Update Rewrite News Prompt node (Generate clean short description & clean article body)
    if node.get('name') == 'Rewrite News Prompt':
        node['parameters']['jsCode'] = '''const original = $json;

const sourceText = String(
  original.full_article_text ||
  original.content ||
  original.short_description ||
  ""
).trim();

const prompt = `
You are a senior news journalist, fact-checking editor, and financial content editor.

Rewrite this news into a clean, well-formatted, professional news article for publishing on a news website.

Category: ${original.category}
Title: ${original.title}
Source URL: ${original.source_url || ""}

Raw Source Content:
${sourceText}

OUTPUT FORMAT INSTRUCTIONS (CRITICAL):
Line 1: Write a concise 1-2 sentence executive summary (under 200 characters) for preview cards.
Line 2: Exactly this separator line: ---ARTICLE_BODY---
Line 3 onwards: Write the full news article body.

STRICT CLEANING & QUALITY RULES:
1. DO NOT include repetitive title lines, author metadata, symbol/character dumps, or UI button text.
2. DO NOT include raw symbol lists (like "a b c d e f g...").
3. DO NOT repeat the main headline as a subtitle or first sentence of the article body.
4. Expand on the facts provided in the source into clear, engaging paragraphs.
5. Use clean paragraph breaks for readability. No bullet points, no raw markdown headers (e.g. # or ##).
6. Ensure the article ends with a complete closing sentence.
`;

return [
  {
    json: {
      original,
      geminiBody: {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 20,
          maxOutputTokens: 16384
        }
      }
    }
  }
];'''

    # 4. Update Final Clean JSON node (Sanitize title, description, body, and tags)
    if node.get('name') == 'Final Clean JSON':
        node['parameters']['jsCode'] = '''const original = $('Rewrite News Prompt').item.json.original;

const clean = (text) => String(text || "")
  .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, " ")
  .replace(/[ \\t]+/g, " ")
  .replace(/\\n{3,}/g, "\\n\\n")
  .trim();

let rawRewritten = "";
if ($json?.candidates?.[0]?.content?.parts?.[0]?.text) {
  rawRewritten = $json.candidates[0].content.parts[0].text;
}

let aiSummary = "";
let finalContent = "";

if (rawRewritten.includes("---ARTICLE_BODY---")) {
  const parts = rawRewritten.split("---ARTICLE_BODY---");
  aiSummary = clean(parts[0]);
  finalContent = clean(parts[1]);
} else if (rawRewritten.trim().length > 100) {
  finalContent = clean(rawRewritten);
}

// Ensure short_description is concise (under 250 characters)
if (!aiSummary || aiSummary.length > 250) {
  aiSummary = clean(original.short_description || original.title || "").substring(0, 220);
  const lastDot = aiSummary.lastIndexOf(".");
  if (lastDot > 80) aiSummary = aiSummary.substring(0, lastDot + 1);
  else aiSummary = aiSummary + "...";
}

const allowedCategories = ["Technology", "Stock News", "IPO Calendar", "Business News", "Startup News", "Forex", "Cryptocurrency", "Mutual Funds", "Market Analysis", "Global Markets", "Banking", "Commodities", "Sports", "Indian Economy", "Company Announcements", "Quarterly Results", "Investment Tips", "Personal Finance", "Government Policies", "Trading Strategies", "Space & Science", "Entertainment", "Health", "World News"];

const category = allowedCategories.includes(original.category) ? original.category : "Top";

if (!finalContent || finalContent.split(" ").length < 60) {
  const titleText = original.title || `${category} News Update`;
  const descText = original.short_description || `Latest news update regarding ${category}.`;
  const sourceText = clean(original.full_article_text || original.content || descText);

  finalContent = `${sourceText}\\n\\nIn recent market developments, ${titleText} has generated interest across financial and business sectors. Market participants continue to follow related trends for further strategic insights.`;
}

// Clean title if it contains repeated junk
let title = clean(original.title || `${category} News Update`);
if (title.length > 180) {
  title = title.substring(0, 180).trim() + "...";
}

return [{ 
  json: {
    title,
    priority: Number(original.priority || -2),
    category,
    country: clean(original.country || "Global"),
    keywords: Array.isArray(original.keywords) ? original.keywords.filter(k => k.length > 2) : [category.toLowerCase()],
    publish_date: original.publish_date || new Date().toISOString(),
    layout: clean(original.layout || "Standard (Single Image)"),
    status: clean(original.status || "MARK AS BREAKING"),
    image_url: clean(original.image_url),
    short_description: clean(aiSummary),
    source_url: original.source_url,
    content: clean(finalContent)
  }
}];'''

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

with open(file_path_enhanced, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Successfully updated n8n JSON workflow!')
