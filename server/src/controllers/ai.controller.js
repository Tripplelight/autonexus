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
    const { make, model, year, mileage, condition, bodyType, fuel, transmission, carId } = req.body;
    if (!make || !model || !year) return res.status(400).json({ message: 'make, model and year are required' });

    // Fetch full car details if carId provided
    let extraContext = '';
    if (carId) {
      const car = await prisma.car.findUnique({
        where: { id: carId },
        select: { engine: true, horsepower: true, color: true, description: true, price: true }
      });
      if (car) {
        extraContext = `
Engine: ${car.engine || 'Unknown'}
Horsepower: ${car.horsepower ? car.horsepower + 'hp' : 'Unknown'}
Color: ${car.color || 'Unknown'}
Description: ${car.description || 'None'}
Listed Price: KES ${car.price?.toLocaleString()}`;
      }
    }

    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(year);

    const prompt = `You are a Kenyan used car market expert with deep knowledge of vehicle pricing in Nairobi and East Africa.

Analyze this vehicle and provide a realistic market price estimate in KES (Kenyan Shillings):

Vehicle: ${year} ${make} ${model}
Age: ${age} years
Mileage: ${mileage ? Number(mileage).toLocaleString() + ' km' : 'Unknown'}
Condition: ${condition || 'USED'}
Body Type: ${bodyType || 'Unknown'}
Fuel: ${fuel || 'Unknown'}
Transmission: ${transmission || 'Unknown'}${extraContext}

Key factors to consider for the Kenyan market:
- Import duty and excise duty significantly inflate prices for newer/larger vehicles
- Toyota, Subaru, and Nissan hold value better than European brands due to spare parts availability
- High mileage (100k+ km) significantly drops value
- Diesel engines command a premium for commercial/off-road use
- Local Kenyan prices are typically 20-40% higher than Japanese auction prices after duty
- Land Cruisers, Harriers, Premiums command premium due to local demand
- Be realistic and conservative — do not overestimate

IMPORTANT: All prices must be in KES. A 2022 Toyota Land Cruiser in Kenya realistically sells for KES 8M-15M depending on variant. A 2018 Toyota Harrier is around KES 3.5M-5M. Calibrate accordingly.

Respond ONLY with a valid JSON object, no markdown, no text outside the JSON:
{
  "minPrice": <number in KES>,
  "maxPrice": <number in KES>,
  "fairPrice": <number in KES>,
  "confidence": "<low|medium|high>",
  "reasoning": "<2-3 sentence explanation focusing on Kenya market factors>"
}`;

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.1,
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

Simulate an immersive virtual test drive. Answer questions about performance, comfort, handling, value for money in the Kenyan market, and suitability for different use cases. Be enthusiastic but honest. I really insist on honesty Never fabricate specs. Keep answers under 130 words.`;

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
