// Backend Server for Claude API Integration
// This keeps your API key secure on the server side

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve HTML files from current directory

// ============================================
// ADD YOUR API KEYS HERE
// ============================================
// IMPORTANT: Never commit your actual API keys to GitHub!
// Use environment variables or .env file instead
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-claude-api-key-here';
const EIA_API_KEY = process.env.EIA_API_KEY || 'your-eia-api-key-here';

// ============================================
// VALHALLA TRUCK ROUTING ENDPOINT
// ============================================
app.post('/api/valhalla-truck-route', async (req, res) => {
    const { from, to, truckType, avoidTolls } = req.body;
    
    // Tri-axle dump truck presets (typical for aggregate hauling)
    const truckPresets = {
        tandem: {
            height: 4.0,        // 13.1 feet
            width: 2.4,         // 7.9 feet
            weight: 25,         // 25 metric tons (55,000 lbs)
            axle_count: 2,
            axle_load: 12.5
        },
        triaxle: {
            height: 4.0,        // 13.1 feet
            width: 2.5,         // 8.2 feet
            weight: 36,         // 36 metric tons (80,000 lbs)
            axle_count: 3,
            axle_load: 12.0
        },
        quad: {
            height: 4.0,        // 13.1 feet
            width: 2.5,         // 8.2 feet
            weight: 44,         // 44 metric tons (97,000 lbs)
            axle_count: 4,
            axle_load: 11.0
        }
    };
    
    const specs = truckPresets[truckType] || truckPresets.triaxle;
    
    try {
        // Using free OpenStreetMap Valhalla server
        const response = await axios.post(
            'https://valhalla.openstreetmap.de/route',
            {
                locations: [
                    { lat: from.lat, lon: from.lng },
                    { lat: to.lat, lon: to.lng }
                ],
                costing: "truck",
                costing_options: {
                    truck: {
                        height: specs.height,           // meters
                        width: specs.width,             // meters
                        weight: specs.weight,           // metric tons
                        axle_count: specs.axle_count,
                        axle_load: specs.axle_load,     // metric tons per axle
                        use_truck_route: 1.0,           // Prefer designated truck routes
                        low_class_penalty: 100,         // Avoid residential roads
                        use_highways: 1.0,              // Prefer highways
                        toll_booth_cost: avoidTolls ? 3600 : 15,  // 1 hour penalty to avoid, or 15 sec if OK
                        toll_booth_penalty: avoidTolls ? 1000 : 0, // High penalty to avoid tolls
                        use_tolls: avoidTolls ? 0.0 : 0.5  // Avoid or allow tolls
                    }
                },
                units: "miles",
                directions_options: {
                    units: "miles"
                }
            },
            {
                timeout: 10000 // 10 second timeout
            }
        );
        
        const route = response.data.trip.legs[0];
        const summary = route.summary;
        
        // Extract toll information and warnings
        const tollBooths = route.maneuvers.filter(m => 
            m.toll === true || (m.type && m.type.includes('toll'))
        );
        
        const warnings = route.maneuvers
            .filter(m => m.type === 'warning' || m.verbal_pre_transition_instruction)
            .map(m => m.instruction || m.verbal_pre_transition_instruction);
        
        // Calculate estimated toll costs for tri-axle trucks
        const tollCost = calculateTollCost(tollBooths, specs.axle_count);
        
        res.json({
            success: true,
            data: {
                distance: summary.length * 0.621371,    // km to miles
                duration: summary.time / 60,            // seconds to minutes
                polyline: route.shape,
                warnings: warnings,
                tollBooths: tollBooths.length,
                estimatedTollCost: tollCost,
                hasTolls: tollBooths.length > 0,
                truckType: truckType,
                truckSpecs: specs,
                routingEngine: 'Valhalla Truck',
                avoidedTolls: avoidTolls
            }
        });
        
    } catch (error) {
        console.error('Valhalla routing error:', error.message);
        
        // Fallback to basic OSRM if Valhalla fails
        try {
            const fallbackUrl = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
            const fallbackResponse = await axios.get(fallbackUrl);
            
            const fallbackRoute = fallbackResponse.data.routes[0];
            
            res.json({
                success: true,
                data: {
                    distance: fallbackRoute.distance / 1609.34,
                    duration: fallbackRoute.duration / 60,
                    polyline: fallbackRoute.geometry.coordinates,
                    warnings: ['⚠️ Using basic routing - truck restrictions NOT considered'],
                    tollBooths: 0,
                    estimatedTollCost: 0,
                    hasTolls: false,
                    truckType: truckType,
                    routingEngine: 'OSRM Fallback (NOT truck-aware)'
                }
            });
        } catch (fallbackError) {
            res.status(500).json({ 
                success: false, 
                error: 'Both Valhalla and OSRM routing failed',
                details: error.message 
            });
        }
    }
});

// Calculate estimated toll costs based on truck class and route
function calculateTollCost(tollBooths, axleCount) {
    if (!tollBooths || tollBooths.length === 0) return 0;
    
    // Typical toll costs for commercial trucks in PA/NJ/DE region
    // Class 9 trucks (tri-axle) pay 2-3x car tolls
    const tollMultiplier = {
        2: 2.0,   // Tandem - Class 6/7
        3: 2.5,   // Tri-axle - Class 9
        4: 3.0    // Quad - Class 10+
    };
    
    const multiplier = tollMultiplier[axleCount] || 2.5;
    
    // Average car toll in region: $1.50-3.00
    // Truck toll: 2-3x that amount
    const avgCarToll = 2.00;
    const avgTruckToll = avgCarToll * multiplier;
    
    // Estimate based on number of toll booths
    // Each booth = one toll plaza (may have multiple tolls)
    const estimatedCost = tollBooths.length * avgTruckToll * 2; // *2 for round trip
    
    return parseFloat(estimatedCost.toFixed(2));
}

// ============================================
// CLAUDE AI ENDPOINT
// ============================================
app.post('/api/calculate-ai-rate', async (req, res) => {
    try {
        const { distance, fuelPrice, driverWage, truckCapacity, volume, demand, material } = req.body;

        const prompt = `You are an expert in construction materials hauling and pricing. Calculate the optimal haul rate.

TRIP DETAILS:
- Distance: ${distance} miles (one way)
- Material: ${material}
- Truck capacity: ${truckCapacity} tons
- Monthly volume: ${volume} tons

COST FACTORS:
- Fuel price: $${fuelPrice}/gallon
- Loaded MPG: 6, Empty MPG: 8
- Driver wage: $${driverWage}/hour (add 40% for benefits)
- Load/unload time: 30 minutes
- Depreciation: $0.15/mile
- Maintenance: $0.20/mile
- Insurance: $0.05/mile

MARKET CONDITIONS:
- Demand level: ${demand}
- Volume discounts: <500 tons = 0%, 500-1000 = 5%, >1000 = 8%
- Market adjustments: High demand = +15%, Normal = 0%, Low = -10%

Calculate:
1. Base cost per ton (fuel + labor + fixed costs)
2. Recommended rate with 20-30% margin
3. Adjust for market demand and volume
4. Provide competitive price range
5. Key insights and recommendations

Respond ONLY with valid JSON:
{
  "haulRate": number,
  "breakdown": {
    "fuelCost": number,
    "laborCost": number,
    "fixedCosts": number,
    "totalCost": number,
    "costPerTon": number
  },
  "margin": number,
  "priceRange": { "low": number, "high": number },
  "insights": ["insight1", "insight2", "insight3"],
  "recommendation": "string"
}`;

        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            }
        );

        let content = response.data.content[0].text;
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const aiResult = JSON.parse(content);

        res.json({ success: true, data: aiResult });

    } catch (error) {
        console.error('Claude API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.response?.data 
        });
    }
});

// ============================================
// FUEL PRICE ENDPOINT (EIA)
// ============================================
app.get('/api/fuel-prices/:state', async (req, res) => {
    try {
        const state = req.params.state;
        const stateCode = state === 'US' ? '' : state;

        // Gasoline series ID
        const gasolineSeriesId = stateCode 
            ? `PET.EMM_EPM0_PTE_S${stateCode}_DPG.W`
            : 'PET.EMM_EPM0_PTE_NUS_DPG.W';

        // Diesel series ID
        const dieselSeriesId = stateCode
            ? `PET.EMD_EPD2D_PTE_S${stateCode}_DPG.W`
            : 'PET.EMD_EPD2D_PTE_NUS_DPG.W';

        const gasolineResponse = await axios.get(
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${gasolineSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`
        );

        const dieselResponse = await axios.get(
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${dieselSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`
        );

        const gasolinePrice = gasolineResponse.data?.response?.data?.[0]?.value || 3.50;
        const dieselPrice = dieselResponse.data?.response?.data?.[0]?.value || 3.80;
        const lastUpdate = gasolineResponse.data?.response?.data?.[0]?.period || new Date().toISOString().split('T')[0];

        res.json({
            success: true,
            data: {
                gasoline: parseFloat(gasolinePrice),
                diesel: parseFloat(dieselPrice),
                lastUpdate: lastUpdate,
                source: 'U.S. Energy Information Administration (EIA)',
                state: state === 'US' ? 'National Average' : state
            }
        });

    } catch (error) {
        console.error('EIA API Error:', error.message);
        // Fallback to defaults if API fails
        res.json({
            success: true,
            data: {
                gasoline: 3.50,
                diesel: 3.80,
                lastUpdate: new Date().toISOString().split('T')[0],
                source: 'Default (EIA unavailable)',
                state: req.params.state === 'US' ? 'National Average' : req.params.state
            }
        });
    }
});

// ============================================
// FUEL PRICE TRENDS (12 weeks)
// ============================================
app.get('/api/fuel-trends/:state', async (req, res) => {
    try {
        const state = req.params.state;
        const stateCode = state === 'US' ? '' : state;

        const gasolineSeriesId = stateCode 
            ? `PET.EMM_EPM0_PTE_S${stateCode}_DPG.W`
            : 'PET.EMM_EPM0_PTE_NUS_DPG.W';

        const response = await axios.get(
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${gasolineSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=12`
        );

        const data = response.data?.response?.data || [];
        const trend = data.map(item => ({
            date: item.period,
            price: parseFloat(item.value)
        })).reverse();

        const recentPrice = trend[trend.length - 1]?.price || 3.50;
        const oldPrice = trend[0]?.price || 3.50;
        const change = recentPrice - oldPrice;
        const percentChange = ((change / oldPrice) * 100).toFixed(2);

        res.json({
            success: true,
            data: {
                trend: trend,
                currentPrice: recentPrice,
                priceChange: change.toFixed(2),
                percentChange: percentChange,
                direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        apiKeys: {
            claude: ANTHROPIC_API_KEY !== 'your-claude-api-key-here' ? 'Configured ✅' : 'Missing ❌',
            eia: EIA_API_KEY !== 'your-eia-api-key-here' ? 'Configured ✅' : 'Missing ❌'
        }
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('\n🚀 Silvi Haul Rate Calculator Server Started!');
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`📊 API Status: http://localhost:${PORT}/api/health`);
    console.log('\n🔑 API Key Status:');
    console.log(`   Claude: ${ANTHROPIC_API_KEY !== 'your-claude-api-key-here' ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   EIA:    ${EIA_API_KEY !== 'your-eia-api-key-here' ? '✅ Configured' : '❌ Not configured'}`);
    console.log('\n💡 Open your browser to: http://localhost:3000/silvi-webapp-complete.html\n');
});
