// src/controllers/ai.controller.js
import Groq from 'groq-sdk';
import { prisma } from '../config/db.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are AutoNexus AI, a sharp and knowledgeable car dealership assistant for the East African market.
You help customers find their perfect car, understand financing, and navigate the buying process.
Your personality: friendly, confident, concise — like a knowledgeable friend, not a salesperson.

When recommending cars, naturally ask about:
- Budget (in KES), preferred body type, fuel preference, primary use case (family, commute, off-road, business etc.)
- New or used preference, transmission preference

When you have enough info, suggest specific makes/models with clear reasoning.
If asked about cars not in the inventory, give general advice but encourage them to check the listings.
Never fabricate specs. Keep responses under 150 words unless the user asks for detailed specs.
Format prices in KES with commas (e.g. KES 4,500,000).`;

// Helper: safe JSON parse — strips markdown code fences if model wraps response
const safeParseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chat = async (req, res, next) => {
  try {
    const { message, sessionId, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    }
    if (!session) {
      session = await prisma.chatSession.create({ data: { userId: req.user?.id || null } });
    }

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'USER', content: message }
    });

    const recentHistory = history.slice(-10).map(m => ({
      role: m.role.toLowerCase() === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentHistory,
        { role: 'user', content: message }
      ]
    });

    const reply = response.choices[0].message.content;

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'ASSISTANT', content: reply }
    });

    res.json({ reply, sessionId: session.id });
  } catch (err) { next(err); }
};

// ── Price Prediction ──────────────────────────────────────────────────────────
export const predictPrice = async (req, res, next) => {
  try {
    const { make, model, year, mileage, condition, bodyType, fuel, transmission } = req.body;
    if (!make || !model || !year) return res.status(400).json({ message: 'make, model and year are required' });

    const prompt = `You are an automotive pricing expert specializing in the Kenyan and East African used car market.
Analyze this vehicle and estimate its current fair market price in KES (Kenyan Shillings):

Vehicle: ${year} ${make} ${model}
Mileage: ${mileage ? Number(mileage).toLocaleString() + ' km' : 'Unknown'}
Condition: ${condition || 'USED'}
Body Type: ${bodyType || 'Unknown'}
Fuel: ${fuel || 'Unknown'}
Transmission: ${transmission || 'Unknown'}

Consider: import duty, local demand, depreciation, spare parts availability in Kenya, and current market trends.

Respond ONLY with a valid JSON object, no markdown, no text outside the JSON:
{
  "minPrice": <number>,
  "maxPrice": <number>,
  "fairPrice": <number>,
  "confidence": "<low|medium|high>",
  "reasoning": "<1-2 sentence explanation of key pricing factors>"
}`;

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    });

    const parsed = safeParseJSON(response.choices[0].message.content);
    if (!parsed) return res.status(500).json({ message: 'Failed to parse price prediction' });

    res.json(parsed);
  } catch (err) { next(err); }
};

// ── Smart Search ──────────────────────────────────────────────────────────────
export const smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ message: 'Query is required' });

    const prompt = `Convert this natural language car search query into structured database filters.
Query: "${query}"

Available filter fields and valid values:
- make: string (e.g. "Toyota", "BMW", "Mercedes-Benz")
- bodyType: "SEDAN" | "SUV" | "TRUCK" | "COUPE" | "HATCHBACK" | "CONVERTIBLE" | "VAN" | "WAGON"
- fuel: "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC"
- transmission: "AUTOMATIC" | "MANUAL"
- condition: "NEW" | "USED" | "CERTIFIED"
- minPrice: number in KES (multiply millions by 1000000)
- maxPrice: number in KES
- minYear: number
- maxYear: number
- search: string (general keyword fallback)

Rules:
- Only include fields clearly implied by the query
- Use exact uppercase enum strings
- Omit fields not mentioned

Respond ONLY with a valid JSON object, no markdown:
Example: { "bodyType": "SUV", "fuel": "HYBRID", "maxPrice": 3000000 }`;

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 200,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }]
    });

    const filters = safeParseJSON(response.choices[0].message.content);
    if (!filters) return res.status(500).json({ message: 'Could not interpret search query' });

    res.json({ filters, interpreted: true, originalQuery: query });
  } catch (err) { next(err); }
};

// ── Virtual Test Drive ────────────────────────────────────────────────────────
export const virtualTestDrive = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const { question, history = [] } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: 'Question is required' });

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const carContext = `You are a virtual test drive assistant and product expert for this specific vehicle at AutoNexus dealership.

Vehicle Details:
- ${car.year} ${car.make} ${car.model}
- Price: KES ${car.price?.toLocaleString()}
- Mileage: ${car.mileage?.toLocaleString()} km | Condition: ${car.condition}
- Body: ${car.bodyType} | Fuel: ${car.fuel} | Transmission: ${car.transmission}
- Engine: ${car.engine}${car.horsepower ? ` | Power: ${car.horsepower}hp` : ''}
- Color: ${car.color}
- Description: ${car.description}

Simulate an immersive virtual test drive. Answer questions about performance, comfort, handling, value for money in the Kenyan market, and suitability for different use cases. Be enthusiastic but honest. Never fabricate specs. Keep answers under 130 words.`;

    const recentHistory = history.slice(-8).map(m => ({
      role: m.role.toLowerCase() === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.75,
      messages: [
        { role: 'system', content: carContext },
        ...recentHistory,
        { role: 'user', content: question }
      ]
    });

    res.json({
      reply: response.choices[0].message.content,
      car: { id: car.id, make: car.make, model: car.model, year: car.year, price: car.price }
    });
  } catch (err) { next(err); }
};
