import { GoogleGenerativeAI } from '@google/generative-ai';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Customer from '../models/Customer.js';
import Inventory from '../models/Inventory.js';
import Employee from '../models/Employee.js';
import AiInsight from '../models/AiInsight.js';
import mongoose from 'mongoose';

// Helper – lazily initialise Gemini model
const getGeminiModel = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// Helper – generate text safely
const geminiGenerate = async (model, prompt) => {
  const result   = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// ─────────────────────────────────────────────
// @desc    Get AI business insights (Gemini or intelligent mock)
// @route   GET /api/v1/ai/insights
// @access  Private
// ─────────────────────────────────────────────
export const getAiInsights = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;

    // Gather real data from DB
    const now = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentOrders, topItems, lowStock, totalCustomers] = await Promise.all([
      Order.find({ createdAt: { $gte: weekAgo } }).lean(),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Inventory.find({ isActive: true, $expr: { $lt: ['$currentStock', '$minimumStock'] } }).lean(),
      Customer.countDocuments({ isActive: true }),
    ]);

    const weekRevenue = recentOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const topItemNames = topItems.map((i) => i._id).join(', ');

    const model = getGeminiModel();

    if (model) {
      const prompt = `You are an AI restaurant business advisor. Based on the following live data:
- Orders this week: ${recentOrders.length}
- Total revenue this week: ₹${weekRevenue.toFixed(2)}
- Top selling items: ${topItemNames || 'N/A'}
- Low stock items count: ${lowStock.length}
- Total active customers: ${totalCustomers}

Provide 5 concise, actionable, data-backed business insights to improve performance tomorrow. Use bullet points. Each insight should be under 40 words.`;

      const text = await geminiGenerate(model, prompt);

      // Persist to DB
      const insight = await AiInsight.create({
        restaurantId,
        type:           'Sales Forecast',
        insight:        text,
        recommendation: 'See insights above',
        data:           { weekRevenue, weekOrders: recentOrders.length, topItems },
      });

      return res.status(200).json({ success: true, source: 'gemini', data: insight });
    }

    // ── Intelligent mock fallback ──────────────────────────────────
    const mockInsights = [
      `📈 Revenue this week: ₹${weekRevenue.toFixed(2)} across ${recentOrders.length} orders.`,
      topItemNames
        ? `🍽️ Top sellers: ${topItemNames}. Consider featuring them in social posts.`
        : '🍽️ No clear top seller yet – promote new items with short-term discounts.',
      lowStock.length > 0
        ? `⚠️ ${lowStock.length} inventory item(s) are below minimum stock. Reorder immediately to avoid disruptions.`
        : '✅ Inventory levels are healthy. No restocking needed today.',
      `👥 ${totalCustomers} active customers. Run a loyalty campaign to boost repeat visits.`,
      `💡 Weekend evenings are typically peak hours. Ensure full staffing on Friday/Saturday nights.`,
    ].join('\n\n');

    const insight = await AiInsight.create({
      restaurantId,
      type:           'Sales Forecast',
      insight:        mockInsights,
      recommendation: 'Consider enabling Gemini API for real AI insights.',
      data:           { weekRevenue, weekOrders: recentOrders.length, topItems },
    });

    res.status(200).json({ success: true, source: 'mock', data: insight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    AI Chat – answer natural language question using DB context
// @route   POST /api/v1/ai/chat
// @access  Private
// ─────────────────────────────────────────────
export const getAiChatResponse = async (req, res) => {
  try {
    const { question, restaurantId } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    // Gather context from DB
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [todayOrders, lowStock, topMenuItems, recentCustomers] = await Promise.all([
      Order.find({ createdAt: { $gte: today } }).lean(),
      Inventory.find({ isActive: true, $expr: { $lt: ['$currentStock', '$minimumStock'] } })
        .limit(5)
        .lean(),
      MenuItem.find({ isAvailable: true })
        .sort({ rating: -1 })
        .limit(5)
        .lean(),
      Customer.find({ isActive: true })
        .sort({ totalSpent: -1 })
        .limit(5)
        .lean(),
    ]);

    const todayRevenue = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    const context = `
Restaurant Data Context:
- Today's orders: ${todayOrders.length}, Revenue: ₹${todayRevenue.toFixed(2)}
- Low stock items: ${lowStock.map((i) => i.itemName).join(', ') || 'None'}
- Top menu items by rating: ${topMenuItems.map((i) => `${i.name} (₹${i.price})`).join(', ')}
- Top customers by spend: ${recentCustomers.map((c) => `${c.name} (₹${c.totalSpent})`).join(', ')}
    `.trim();

    const model = getGeminiModel();

    let answer;
    if (model) {
      const prompt = `You are an intelligent restaurant management AI assistant named SmartServe.
      
${context}

User question: "${question}"

Answer concisely and helpfully in 2-4 sentences. Focus only on restaurant management topics.`;

      answer = await geminiGenerate(model, prompt);
    } else {
      // Smart mock responses based on keywords
      const q = question.toLowerCase();
      if (q.includes('revenue') || q.includes('sales')) {
        answer = `Today's revenue so far is ₹${todayRevenue.toFixed(2)} from ${todayOrders.length} orders. Consider upselling premium items to boost this number.`;
      } else if (q.includes('stock') || q.includes('inventory')) {
        const lowNames = lowStock.map((i) => i.itemName).join(', ');
        answer = lowNames
          ? `You have ${lowStock.length} items below minimum stock: ${lowNames}. Please reorder these immediately.`
          : 'All inventory items are at healthy stock levels. Keep monitoring daily.';
      } else if (q.includes('popular') || q.includes('menu') || q.includes('best seller')) {
        answer = `Your top-rated menu items are: ${topMenuItems.map((i) => i.name).join(', ')}. Featuring these prominently can increase order value.`;
      } else if (q.includes('customer')) {
        answer = `Your top customer by spend is ${recentCustomers[0]?.name || 'N/A'}. Running personalised loyalty campaigns can help retain high-value customers.`;
      } else {
        answer = `I'm SmartServe AI. I can help you with sales insights, inventory, customer analytics, and staff management. Could you rephrase your question? (Tip: Enable GEMINI_API_KEY for advanced AI responses)`;
      }
    }

    res.status(200).json({ success: true, question, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Generate sales forecast for next 7 days
// @route   GET /api/v1/ai/forecast
// @access  Private
// ─────────────────────────────────────────────
export const generateSalesForecast = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;

    // Fetch last 30 days of completed orders
    const orders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status:    { $in: ['Completed', 'Delivered'] },
      ...(restaurantId ? { restaurantId } : {}),
    }).lean();

    // Group by day of week to find patterns
    const dowRevenue = Array(7).fill(0);
    const dowCount   = Array(7).fill(0);

    orders.forEach((o) => {
      const dow = new Date(o.createdAt).getDay(); // 0=Sun
      dowRevenue[dow] += o.totalAmount || 0;
      dowCount[dow]   += 1;
    });

    const avgByDow = dowRevenue.map((rev, i) =>
      dowCount[i] > 0 ? parseFloat((rev / dowCount[i]).toFixed(2)) : 0
    );

    // Project next 7 days
    const dayNames    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const forecast    = [];
    const baseDate    = new Date();

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(baseDate);
      futureDate.setDate(baseDate.getDate() + i);
      const dow        = futureDate.getDay();
      const projected  = avgByDow[dow];

      // Add a slight seasonal factor (+5% on weekends)
      const factor     = dow === 0 || dow === 6 ? 1.05 : 1.0;

      forecast.push({
        date:              futureDate.toISOString().split('T')[0],
        dayOfWeek:         dayNames[dow],
        projectedRevenue:  parseFloat((projected * factor).toFixed(2)),
        projectedOrders:   Math.round((dowCount[dow] / (30 / 7)) * factor),
        confidence:        dowCount[dow] >= 4 ? 'High' : dowCount[dow] >= 2 ? 'Medium' : 'Low',
      });
    }

    const model = getGeminiModel();
    let geminiComment = null;

    if (model) {
      const forecastSummary = forecast
        .map((f) => `${f.dayOfWeek}: ₹${f.projectedRevenue}`)
        .join(', ');

      const prompt = `Based on this 7-day revenue forecast for a restaurant: ${forecastSummary}
Provide 2 brief recommendations (each under 30 words) to maximise revenue on projected high-revenue days.`;

      geminiComment = await geminiGenerate(model, prompt);
    }

    res.status(200).json({
      success: true,
      data:    forecast,
      ...(geminiComment ? { aiRecommendations: geminiComment } : {}),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Get menu optimisation suggestions
// @route   GET /api/v1/ai/menu-optimization
// @access  Private
// ─────────────────────────────────────────────
export const getMenuOptimizationSuggestions = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;
    const filter       = restaurantId ? { restaurantId } : {};

    // Items ordered in last 30 days
    const itemStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          ...(restaurantId ? { restaurantId: new mongoose.Types.ObjectId(restaurantId) } : {}),
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id:       '$items.name',
          totalSold: { $sum: '$items.quantity' },
          revenue:   { $sum: '$items.total' },
          avgPrice:  { $avg: '$items.price' },
        },
      },
      { $sort: { totalSold: -1 } },
    ]);

    // All menu items available
    const allItems = await MenuItem.find({ ...filter, isAvailable: true }).lean();

    // Items with 0 sales in last 30 days (slow movers)
    const soldNames   = new Set(itemStats.map((s) => s._id));
    const slowMovers  = allItems.filter((i) => !soldNames.has(i.name)).map((i) => i.name);

    // Stars (high sales + good rating)
    const stars       = itemStats.slice(0, 5).map((i) => i._id);

    // Items with good rating but low sales (hidden gems)
    const hiddenGems  = allItems
      .filter((i) => i.rating >= 4 && !stars.includes(i.name))
      .slice(0, 3)
      .map((i) => ({ name: i.name, rating: i.rating, price: i.price }));

    const model = getGeminiModel();
    let suggestions = null;

    if (model) {
      const prompt = `You are a restaurant menu consultant.
Star items (top sellers): ${stars.join(', ')}
Slow movers (no orders in 30 days): ${slowMovers.join(', ') || 'None'}
Hidden gems (high rating, low orders): ${hiddenGems.map((h) => h.name).join(', ') || 'None'}

Give 4 concise menu optimisation recommendations. Each under 30 words. Use bullet points.`;

      suggestions = await geminiGenerate(model, prompt);
    } else {
      const lines = [];
      if (stars.length)       lines.push(`⭐ Highlight star items: ${stars.join(', ')} – feature them prominently on the menu and in marketing.`);
      if (slowMovers.length)  lines.push(`🐢 Consider removing or repricing slow movers: ${slowMovers.slice(0, 3).join(', ')}.`);
      if (hiddenGems.length)  lines.push(`💎 Promote hidden gems: ${hiddenGems.map((h) => h.name).join(', ')} – great ratings but underordered.`);
      lines.push('🆕 Add 1-2 seasonal specials to refresh the menu and drive curiosity.');
      suggestions = lines.join('\n\n');
    }

    res.status(200).json({
      success: true,
      data: {
        stars,
        slowMovers:  slowMovers.slice(0, 10),
        hiddenGems,
        topItemStats: itemStats.slice(0, 10),
      },
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
