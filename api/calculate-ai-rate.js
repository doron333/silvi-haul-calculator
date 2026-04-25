// Claude AI Analysis - Vercel Serverless Function
const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'Claude API key not configured' });
    }
    
    const { jobSite, quarry, distance, calculatedRate, volume, demand } = req.body;
    
    const prompt = `You are a construction materials logistics expert. Analyze this haul rate quote:

**Route Details:**
- From: ${quarry}
- To: ${jobSite}
- Distance: ${distance} miles (one way)

**Calculated Rate:** $${calculatedRate}/ton
**Volume:** ${volume} tons/month
**Market Demand:** ${demand}

Provide a brief executive summary with:
1. Rate competitiveness analysis
2. Key cost drivers
3. Risk factors
4. Optimization opportunities
5. Recommendation

Keep it concise and actionable.`;
    
    try {
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            },
            {
                headers: {
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        const analysis = response.data.content[0].text;
        
        res.status(200).json({
            success: true,
            analysis: analysis
        });
        
    } catch (error) {
        console.error('Claude API error:', error.message);
        res.status(500).json({
            success: false,
            error: 'AI analysis unavailable',
            details: error.response?.data || error.message
        });
    }
};
