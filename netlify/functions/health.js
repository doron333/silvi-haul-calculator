// Health Check - Vercel Serverless Function

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            valhalla: 'ready',
            eia: process.env.EIA_API_KEY ? 'configured' : 'missing',
            claude: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'
        }
    };
    
    res.status(200).json(health);
};
