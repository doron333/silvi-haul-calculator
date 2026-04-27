exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                valhalla: 'ready',
                eia: process.env.EIA_API_KEY ? 'configured' : 'missing',
                claude: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'
            }
        })
    };
};
