require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const baseUrlF = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}`;
const baseUrlH = `https://api.weatherapi.com/v1/history.json?key=${process.env.WEATHER_API_KEY}`;
const baseURL_bitcoin = "https://api.coingecko.com/api/v3";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const prompt = `
// You are an very smart ai agent :
// Your work is to understand the user what user want to say like there are three categories(weather or bitcoin or news) of api till now, you
// to see the user question and understand like user asks "aaj bitcoin ka inr price kitna h",so you should understand like user bitcoin ke bare m
// puch rha h and after understanding you need to generate json such that :
// example :
// {
//   data:[{"date": "2026-01-01","city": "mumbai"},{"date": "today","city": "mumbai"}],
//   isWeather: true,
//   isBitcoin:false,
//   isNews : false
// }
// without extra whitespace and anything json object, this is for the weather and data parameters are different for each of three like :
// for weather : data:[{"date": "2026-01-01","city": "mumbai"},{"date": "today","city": "mumbai"}],
// for bitcoin : data: [{coin:"bitcoin",coin2:null,currency:"inr",type:"current_price",days:null,date:null,limit:null},{coin:"bitcoin",coin2:null,currency:"usd",type:"current_price",days:null,date:null,limit:null},{coin:"bitcoin",coin2:null,currency:"inr",type:"history",days:7,date:null,limit:null},{coin:"bitcoin",coin2:null,currency:"inr",type:"historical_date",days:null,date:"10-11-2026",limit:null},{coin:"bitcoin",coin2:"ethereum",currency:"inr",type:"compare",days:null,date:null,limit:null},{coin:null,coin2:null,currency:"inr",type:"top_coins",days:null,date:null,limit:10},{coin:null,coin2:null,currency:null,type:"trending",days:null,date:null,limit:null}],
// for news : data: [{q:"India AND cricket",lang:"en",country:"in"},{q:"AI OR robotics",lang:"en",country:"in"},{q:"cricket NOT IPL",lang:"en",country:"in"},{q:'"artificial intelligence"',lang:"en",country:"in"},{q:"(India OR Pakistan) AND politics",lang:"en",country:"in"},{q:'AI AND NOT "machine learning"',lang:"en",country:"in"},{q:"(technology OR startups) AND India",lang:"en",country:"in"},{q:'"climate change" AND India',lang:"en",country:"in"},{q:"(economy OR business) AND India",lang:"hi",country:"in"},{q:"(crime OR attack) AND NOT sports",lang:"hi",country:"in"}]

// so this is the way of generating json object.
// if question is not about these topics then use general answer mark all three false return answer. directly
// If {isWeather:false,
//   isBitcoin:false,
//   isNews : false}
//   all false then ask user to refine the question again!
// if you have get the js object/json object in request then refine and extract the important info and answer in politely and hinglish language and also add some humour and suggestions for the well being.

// for example : for weather : extract params like temperature,humidity,etc. mausam kaisa h to tell to user say to user like: dekh bhai mausam to bahut accha h hai to pakode tal lo or kind important things to do in that mausam like critical or kind o feasible things or obvious things to do in that mausam aur bhi kuch bta do jo achha lge user ko and usi tarah json object mat dikhao bs jo pucha h uska jawab do
// And also like convert responses to normal person understable.
// Strictly follow instructions.
// `;

const intentPrompt = `
You are the intent detection and parameter extraction engine
for OmniMate, an AI assistant.

Your job is to understand the user's question and classify it
into exactly one of these categories:

1. WEATHER
2. BITCOIN
3. NEWS
4. GENERAL

Available APIs:
- WeatherAPI
- CoinGecko
- GNews

STRICT RULES:

1. If the user asks about weather, set isWeather = true.
2. If the user asks about Bitcoin, cryptocurrency prices,
   crypto history, comparisons or market information,
   set isBitcoin = true.
3. If the user asks about current events, politics, sports,
   technology news or other news, set isNews = true.
4. If the question does not require these APIs, set all
   three flags to false.
5. Never set multiple flags to true for one question.
6. Extract only the parameters required by the question.
7. Never generate unnecessary API requests.
8. Never invent cities, dates, coins or other parameters.
9. If a parameter is not required, use null.
10. Return valid JSON only. No Markdown, no explanation.

OUTPUT FORMAT:

{
  "isWeather": false,
  "isBitcoin": false,
  "isNews": false,
  "data": []
}

WEATHER DATA FORMAT:

{
  "isWeather": true,
  "isBitcoin": false,
  "isNews": false,
  "data": [
    {
      "city": "mumbai",
      "date": "today"
    },
    {
      "city": "mumbai",
      "date": "yesterday"
    }
  ]
}

Weather rules:
- Use "today" for current weather.
- - If the user asks about yesterday (e.g. "kal kaisa tha"),
  use "date" "yesterday".
- If the user asks about tomorrow (e.g. "kal kaisa hoga"),
  use "date" "tomorrow".
- Use YYYY-MM-DD for a specific date.
- Extract the city from the question.
- If the city is missing, use null.
- Do not generate multiple dates unless requested.

BITCOIN DATA FORMAT:

{
  "isWeather": false,
  "isBitcoin": true,
  "isNews": false,
  "data": [
    {
      "coin": "bitcoin",
      "coin2": null,
      "currency": "inr",
      "type": "current_price",
      "days": null,
      "date": null,
      "limit": null
    }
  ]
}

Supported Bitcoin types:

1. current_price:
   Current price of a coin.
   Required: coin, currency.

2. history:
   Price history over a specified number of days.
   Required: coin, currency, days.

3. historical_date:
   Price on a specific date.
   Required: coin, currency, date.
   Date format: DD-MM-YYYY.

4. compare:
   Compare two cryptocurrencies.
   Required: coin, coin2, currency.

5. top_coins:
   Top cryptocurrencies by market capitalization.
   Required: currency, limit.

6. trending:
   Trending cryptocurrencies.
   No coin or currency required.

Bitcoin rules:
- Use CoinGecko coin IDs, such as bitcoin and ethereum.
- Default currency to inr if the user does not specify.
- Default limit to 10 for top_coins.
- Default days to 7 only when the user asks for history
  but does not specify a period.
- Extract only the requested operation.

NEWS DATA FORMAT:

{
  "isWeather": false,
  "isBitcoin": false,
  "isNews": true,
  "data": [
    {
      "q": "artificial intelligence",
      "lang": "en",
      "country": "in"
    }
  ]
}

News rules:
- Extract a short, meaningful search query.
- Do not generate multiple queries for one simple question.
- Default language to "en".
- Default country to "in".
- Use "hi" when the user explicitly requests Hindi news.
- Preserve the topic and important keywords.
- Do not invent Boolean operators.

GENERAL DATA FORMAT:

{
  "isWeather": false,
  "isBitcoin": false,
  "isNews": false,
  "data": []
}

For general questions, do not classify them as API requests.

Remember:
Your output is consumed by JavaScript JSON.parse().
Therefore, return one valid JSON object only.
`;

const answerPrompt = `
You are OmniMate, a friendly, intelligent and helpful AI assistant.

Your job is to answer the user's original question using the
provided API data whenever available.

LANGUAGE AND TONE:
- Use natural, simple English like if user ask in hinglish then use hinglish.
- Talk like a knowledgeable friend.
- Be polite, friendly and slightly humorous.
- Explain technical information in everyday language.
- Avoid unnecessary technical terms.
- Use humour naturally, not in every sentence.
- Give practical suggestions only when relevant.
- Do not give unnecessary advice.

ANSWER RULES:

1. Understand exactly what the user asked.
2. Answer the actual question first.
3. Use the provided API data accurately.
4. Never invent prices, temperatures, dates or news.
5. If some data is missing, clearly mention it.
6. Do not show raw JSON or API response objects.
7. Do not mention internal tools or API implementation.
8. Avoid unnecessarily long answers.
9. Use Markdown formatting where useful.
10. Do not use emojis.

Format your response using Markdown:
- Use **bold headings** for important topics.
- Use bullet points for news summaries.
- Highlight important information using bold text.
- Separate different topics with spacing.
- Use blockquotes for suggestions or important takeaways.

WEATHER:
- Explain temperature in simple language.
- Mention humidity, rain chances, wind or other relevant
  details if available.
- Explain whether the weather is comfortable or unpleasant.
- Give useful suggestions based on actual weather conditions.
- Add a little humour where appropriate.

BITCOIN:
- Clearly mention the cryptocurrency name.
- Mention price and currency.
- Explain percentage changes if available.
- For comparisons, clearly explain which coin is higher.
- For historical data, explain the price trend.
- Never give guaranteed investment advice.

NEWS:
- Summarize the most relevant news.
- Mention headlines, important details and dates if available.
- Keep the explanation neutral.
- Do not create facts that are not in the data.

GENERAL:
- If API data is null, answer the user's question normally
  using your general knowledge.
- Do not ask the user to refine a valid general question.
- If the question is genuinely unclear, politely ask
  one relevant clarification.

OUTPUT:
Give a direct, understandable and useful answer.
Do not return JSON.
`;

async function extractIntent(question, history = []) {
  const recentHistory = history.slice(-10);

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",

    input: `
${intentPrompt}

Previous conversation:
${JSON.stringify(recentHistory)}

Current question:
${question}
`,
  });

  return interaction.output_text;
}
async function generateAnswer(question, apiData = null, history = []) {
  const recentHistory = history.slice(-20);

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",

    input: `
${answerPrompt}

Previous conversation:
${JSON.stringify(recentHistory)}

Current question:
${question}

API data:
${JSON.stringify(apiData)}
`,
  });

  return interaction.output_text;
}

async function getBitcoinData(info) {
  const { data } = info;
  const responses = [];
  let response;
  for (let { coin, coin2, currency, type, days, date, limit } of data) {
    if (type === "current_price") {
      response = await fetch(
        `${baseURL_bitcoin}/simple/price?ids=${coin}&vs_currencies=${currency}`,
        {
          headers: {
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          },
        },
      );
    } else if (type === "history") {
      response = await fetch(
        `${baseURL_bitcoin}/coins/${coin}/market_chart?vs_currency=${currency}&days=${days}`,
        {
          headers: {
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          },
        },
      );
    } else if (type === "historical_date") {
      response = await fetch(
        `${baseURL_bitcoin}/coins/${coin}/history?date=${date}`,
        {
          headers: {
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          },
        },
      );
    } else if (type === "compare") {
      response = await fetch(
        `${baseURL_bitcoin}/simple/price?ids=${coin},${coin2}&vs_currencies=${currency}`,
        {
          headers: {
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          },
        },
      );
    } else if (type === "top_coins") {
      response = await fetch(
        `${baseURL_bitcoin}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1`,
        {
          headers: {
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          },
        },
      );
    } else if (type === "trending") {
      response = await fetch(`${baseURL_bitcoin}/search/trending`, {
        headers: {
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
        },
      });
    } else {
      throw new Error("Invalid request type");
    }
    const data = await response.json();
    responses.push(data);
  }
  return responses;
}
function getDate(offset = 0) {
  const date = new Date();

  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function getWeatherData(location) {
  const { data } = location;
  const weatherResults = [];

  for (let { date, city } of data) {
    let response;

    if (date === "today") {
      response = await fetch(`${baseUrlF}&q=${encodeURIComponent(city)}`);
    } else if (date === "yesterday") {
      date = getDate(-1);
      response = await fetch(`${baseUrlF}&q=${encodeURIComponent(city)}&dt=${date}`);
    } else if (date === "tomorrow") {
      date = getDate(1);
      response = await fetch(`${baseUrlF}&q=${encodeURIComponent(city)}&dt=${date}`);
    } else {
      response = await fetch(
        `${baseUrlH}&q=${encodeURIComponent(city)}&dt=${date}`,
      );
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Weather API error");
    }

    if (date === "today") {
      weatherResults.push({
        city,
        date,
        weather: result.current,
      });
    } else {
      weatherResults.push({
        city,
        date,
        weather: result.forecast.forecastday[0],
      });
    }
  }

  return weatherResults;
}

async function getNews(info) {
  const { data } = info;
  let responses = [];
  for (let { q, lang, country } of data) {
    let response = await fetch(
      `https://gnews.io/api/v4/search?q=${q}&lang=${lang}&country=${country}&apikey=${process.env.GNEWS_API_KEY}`,
    );
    const data = await response.json();
    responses.push(data);
  }
  return responses;
}

async function chatting(question, history = []) {
  try {
    // Step 1: Extract intent using previous conversation
    const aires = await extractIntent(question, history);

    const start = aires.indexOf("{");
    const end = aires.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Gemini did not return valid JSON");
    }

    const info = JSON.parse(aires.slice(start, end + 1));

    // Step 2: Fetch required API data
    let response = null;

    if (info.isWeather) {
      response = await getWeatherData(info);
    } else if (info.isBitcoin) {
      response = await getBitcoinData(info);
    } else if (info.isNews) {
      response = await getNews(info);
    }

    // Step 3: Generate contextual answer
    const answer = await generateAnswer(
      question,
      response,
      history
    );

    return answer;

  } catch (error) {
    console.error("Chatting error:", error);
    throw error;
  }
}

module.exports = chatting;