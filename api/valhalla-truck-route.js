// Valhalla Truck Routing - Vercel Serverless Function
const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { from, to, truckType, avoidTolls } = req.body;
    
    // Tri-axle dump truck presets
    const truckPresets = {
        tandem: {
            height: 4.0,
            width: 2.4,
            weight: 25,
            axle_count: 2,
            axle_load: 12.5
        },
        triaxle: {
            height: 4.0,
            width: 2.5,
            weight: 36,
            axle_count: 3,
            axle_load: 12.0
        },
        quad: {
            height: 4.0,
            width: 2.5,
            weight: 44,
            axle_count: 4,
            axle_load: 11.0
        }
    };
    
    const specs = truckPresets[truckType] || truckPresets.triaxle;
    
    try {
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
                        height: specs.height,
                        width: specs.width,
                        weight: specs.weight,
                        axle_count: specs.axle_count,
                        axle_load: specs.axle_load,
                        use_truck_route: 1.0,
                        low_class_penalty: 100,
                        use_highways: 1.0,
                        toll_booth_cost: avoidTolls ? 3600 : 15,
                        toll_booth_penalty: avoidTolls ? 1000 : 0,
                        use_tolls: avoidTolls ? 0.0 : 0.5
                    }
                },
                units: "miles",
                directions_options: {
                    units: "miles"
                }
            },
            { timeout: 10000 }
        );
        
        const route = response.data.trip.legs[0];
        const summary = route.summary;
        
        const tollBooths = route.maneuvers.filter(m => 
            m.toll === true || (m.type && m.type.includes('toll'))
        );
        
        const warnings = route.maneuvers
            .filter(m => m.type === 'warning' || m.verbal_pre_transition_instruction)
            .map(m => m.instruction || m.verbal_pre_transition_instruction);
        
        const tollCost = calculateTollCost(tollBooths, specs.axle_count);
        
        res.status(200).json({
            success: true,
            data: {
                distance: summary.length * 0.621371,
                duration: summary.time / 60,
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
        
        try {
            const fallbackUrl = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
            const fallbackResponse = await axios.get(fallbackUrl);
            
            const fallbackRoute = fallbackResponse.data.routes[0];
            
            res.status(200).json({
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
};

function calculateTollCost(tollBooths, axleCount) {
    if (!tollBooths || tollBooths.length === 0) return 0;
    
    const tollMultiplier = {
        2: 2.0,
        3: 2.5,
        4: 3.0
    };
    
    const multiplier = tollMultiplier[axleCount] || 2.5;
    const avgCarToll = 2.00;
    const avgTruckToll = avgCarToll * multiplier;
    const estimatedCost = tollBooths.length * avgTruckToll * 2;
    
    return parseFloat(estimatedCost.toFixed(2));
}
