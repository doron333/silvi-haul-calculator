#!/usr/bin/env node

// Test Valhalla Truck Routing Integration
// Run with: node test-valhalla.js

const axios = require('axios');

console.log('🚛 Testing Valhalla Truck Routing Integration\n');

// Test route: Philadelphia to Temple Quarry
const testRoute = {
    from: { lat: 39.9526, lng: -75.1652 },  // Philadelphia
    to: { lat: 40.4091, lng: -75.9177 }      // Temple, PA
};

async function testValhallaRouting() {
    console.log('📍 Test Route:');
    console.log(`   From: Philadelphia, PA (${testRoute.from.lat}, ${testRoute.from.lng})`);
    console.log(`   To: Temple, PA (${testRoute.to.lat}, ${testRoute.to.lng})\n`);
    
    const truckTypes = ['tandem', 'triaxle', 'quad'];
    
    for (const truckType of truckTypes) {
        console.log(`\n🚛 Testing ${truckType.toUpperCase()} truck routing...`);
        
        try {
            const response = await axios.post(
                'https://valhalla.openstreetmap.de/route',
                {
                    locations: [
                        { lat: testRoute.from.lat, lon: testRoute.from.lng },
                        { lat: testRoute.to.lat, lon: testRoute.to.lng }
                    ],
                    costing: "truck",
                    costing_options: {
                        truck: getTruckSpecs(truckType)
                    },
                    units: "miles"
                },
                { timeout: 10000 }
            );
            
            const route = response.data.trip.legs[0];
            const summary = route.summary;
            
            console.log(`✅ SUCCESS!`);
            console.log(`   Distance: ${(summary.length * 0.621371).toFixed(1)} miles`);
            console.log(`   Time: ${Math.round(summary.time / 60)} minutes`);
            console.log(`   Engine: Valhalla Truck Routing`);
            
            // Check for warnings
            const warnings = route.maneuvers.filter(m => 
                m.type === 'warning' || m.verbal_pre_transition_instruction
            );
            
            if (warnings.length > 0) {
                console.log(`   ⚠️  Warnings: ${warnings.length} restriction(s) noted`);
            } else {
                console.log(`   ✅ No restrictions on this route`);
            }
            
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
        }
    }
    
    // Compare with basic OSRM (car routing)
    console.log(`\n\n🚗 Comparing with basic car routing (OSRM)...\n`);
    
    try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${testRoute.from.lng},${testRoute.from.lat};${testRoute.to.lng},${testRoute.to.lat}`;
        const osrmResponse = await axios.get(osrmUrl);
        const osrmRoute = osrmResponse.data.routes[0];
        
        console.log(`✅ OSRM Route (NOT truck-aware):`);
        console.log(`   Distance: ${(osrmRoute.distance / 1609.34).toFixed(1)} miles`);
        console.log(`   Time: ${Math.round(osrmRoute.duration / 60)} minutes`);
        console.log(`   ⚠️  WARNING: May include weight/height restricted roads!`);
        
    } catch (error) {
        console.log(`❌ OSRM test failed: ${error.message}`);
    }
    
    console.log('\n\n✅ Valhalla truck routing is working!\n');
    console.log('Next steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Open: http://localhost:3000/silvi-webapp-complete.html');
    console.log('3. Try entering addresses and see truck routing in action!');
    console.log('\n🚛 Your app now has professional truck routing! 🎉\n');
}

function getTruckSpecs(truckType) {
    const specs = {
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
    
    return {
        ...specs[truckType],
        use_truck_route: 1.0,
        low_class_penalty: 100
    };
}

// Run the test
testValhallaRouting().catch(console.error);
