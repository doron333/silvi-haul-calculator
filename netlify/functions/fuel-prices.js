// EIA Fuel Prices - Netlify Serverless Function
const axios = require('axios');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    const { state } = event.queryStringParameters || {};
    const EIA_API_KEY = process.env.EIA_API_KEY;
    
    if (!EIA_API_KEY) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'EIA API key not configured' })
        };
    }
    
    const stateCode = state ? state.toUpperCase() : 'US';
    
    try {
        const gasolineSeriesId = `PET.EMM_EPM0_PTE_S${stateCode === 'US' ? 'NUS' : stateCode}_DPG.W`;
        const dieselSeriesId = `PET.EMD_EPD2D_PTE_S${stateCode === 'US' ? 'NUS' : stateCode}_DPG.W`;
        
        const [gasolineResponse, dieselResponse] = await Promise.all([
            axios.get(`https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${gasolineSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`),
            axios.get(`https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${dieselSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`)
        ]);
        
        const gasolineData = gasolineResponse.data.response.data[0];
        const dieselData = dieselResponse.data.response.data[0];
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    state: stateCode,
                    gasoline: parseFloat(gasolineData.value),
                    diesel: parseFloat(dieselData.value),
                    lastUpdate: gasolineData.period,
                    source: 'U.S. Energy Information Administration'
                }
            })
        };
        
    } catch (error) {
        console.error('EIA API error:', error.message);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    state: stateCode,
                    gasoline: 3.50,
                    diesel: 4.25,
                    lastUpdate: new Date().toISOString().split('T')[0],
                    source: 'Fallback estimates'
                }
            })
        };
    }
};
