import json

file_path = r'd:\Agency\Profit-sheets\ProfitSheets.json'
file_path_enhanced = r'd:\Agency\Profit-sheets\ProfitSheets_Enhanced.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data.get('nodes', []):
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

let aiSummary = original.short_description;
let finalContent = "";

if (rawRewritten.includes("---ARTICLE_BODY---")) {
  const parts = rawRewritten.split("---ARTICLE_BODY---");
  aiSummary = clean(parts[0]);
  finalContent = clean(parts[1]);
} else if (rawRewritten.trim().length > 100) {
  finalContent = clean(rawRewritten);
}

const allowedCategories = ["Technology", "Stock News", "IPO Calendar", "Business News", "Startup News", "Forex", "Cryptocurrency", "Mutual Funds", "Market Analysis", "Global Markets", "Banking", "Commodities", "Sports", "Indian Economy", "Company Announcements", "Quarterly Results", "Investment Tips", "Personal Finance", "Government Policies", "Trading Strategies", "Space & Science", "Entertainment", "Health", "World News"];

const category = allowedCategories.includes(original.category) ? original.category : "Top";

if (!finalContent || finalContent.split(" ").length < 80) {
  const titleText = original.title || `${category} Market Update`;
  const descText = original.short_description || `Latest updates regarding ${category}.`;
  const fullText = original.full_article_text && original.full_article_text.length > 50 
    ? original.full_article_text 
    : original.content || descText;

  finalContent = `${descText}\n\n${fullText}\n\nIn recent market developments, ${titleText} has drawn significant attention from investors and industry analysts. This update highlights key trends and operational insights shaping the ${category} sector.\n\nMarket observers note that developments of this nature often influence broader sentiment across related industries. Stakeholders are advised to monitor official announcements and market movements closely for further updates.`;
}

return [{ 
  json: {
    title: clean(original.title || `${category} News Update`),
    priority: Number(original.priority || -2),
    category,
    country: clean(original.country || "Global"),
    keywords: Array.isArray(original.keywords)
      ? original.keywords
      : String(original.keywords || "").split(",").map(k => k.trim()).filter(Boolean),
    publish_date: original.publish_date || new Date().toISOString(),
    layout: clean(original.layout || "Standard (Single Image)"),
    status: clean(original.status || "MARK AS BREAKING"),
    image_url: clean(original.image_url),
    short_description: clean(aiSummary || original.short_description || `Latest ${category} news update.`),
    source_url: original.source_url,
    content: clean(finalContent)
  }
}];'''

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

with open(file_path_enhanced, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Updated successfully!')
