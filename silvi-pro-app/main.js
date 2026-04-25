const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let licenseKey = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#667eea',
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Project',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('new-project');
                    }
                },
                {
                    label: 'Open Project',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        openProject();
                    }
                },
                {
                    label: 'Save Project',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        saveProject();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export to PDF',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('export-pdf');
                    }
                },
                {
                    label: 'Export to CSV',
                    click: () => {
                        mainWindow.webContents.send('export-csv');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => {
                        mainWindow.webContents.send('show-help');
                    }
                },
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Silvi Haul Rate Calculator Pro',
                            message: 'Silvi Haul Rate Calculator Pro',
                            detail: 'Version 1.0.0\n\nProfessional haul rate calculation software for construction materials.\n\n© 2025 Silvi Materials. All rights reserved.'
                        });
                    }
                },
                {
                    label: 'License Information',
                    click: () => {
                        const license = licenseKey || 'Trial Version';
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'License Information',
                            message: 'License Status',
                            detail: `License Key: ${license}\n\nFor licensing inquiries, please contact:\nsales@silvi.com`
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

async function saveProject() {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Project',
        defaultPath: 'silvi-project.json',
        filters: [
            { name: 'Silvi Project', extensions: ['json'] }
        ]
    });

    if (!result.canceled) {
        mainWindow.webContents.send('save-project', result.filePath);
    }
}

async function openProject() {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Open Project',
        filters: [
            { name: 'Silvi Project', extensions: ['json'] }
        ],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        try {
            const data = fs.readFileSync(result.filePaths[0], 'utf8');
            mainWindow.webContents.send('load-project', data);
        } catch (err) {
            dialog.showErrorBox('Error', 'Failed to open project file');
        }
    }
}

// IPC Handlers
ipcMain.handle('save-file', async (event, filePath, data) => {
    try {
        fs.writeFileSync(filePath, data, 'utf8');
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('export-pdf-dialog', async (event) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export to PDF',
        defaultPath: 'haul-rate-report.pdf',
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] }
        ]
    });
    return result;
});

ipcMain.handle('export-csv-dialog', async (event) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export to CSV',
        defaultPath: 'competitor-analysis.csv',
        filters: [
            { name: 'CSV Files', extensions: ['csv'] }
        ]
    });
    return result;
});

ipcMain.handle('save-pdf', async (event, filePath, blob) => {
    try {
        const buffer = Buffer.from(blob);
        fs.writeFileSync(filePath, buffer);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('save-csv', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('verify-license', async (event, key) => {
    // Simple license verification (in production, verify against server)
    if (key && key.length > 10) {
        licenseKey = key;
        return { valid: true, message: 'License activated successfully!' };
    }
    return { valid: false, message: 'Invalid license key' };
});

// AI Integration Handlers
ipcMain.handle('ai-calculate-rate', async (event, params) => {
    try {
        const response = await callClaudeAPI({
            messages: [{
                role: 'user',
                content: `You are an expert pricing analyst for construction materials. Calculate professional haul rate.

ROUTE DATA:
- Distance: ${params.distance} miles
- Drive Time: ${params.driveTime} minutes
- Road Conditions: ${params.roadConditions || 'good'}

COSTS:
- Fuel: $${params.fuelPrice}/gallon (6 MPG loaded, 8 MPG empty)
- Driver: $${params.driverWage}/hour (includes benefits)
- Truck Capacity: ${params.truckCapacity} tons
- Load/Unload Time: 30 minutes
- Depreciation: $0.15/mile
- Maintenance: $0.20/mile
- Insurance: $0.05/mile

MARKET:
- Material: ${params.material}
- Monthly Volume: ${params.volume} tons
- Market Demand: ${params.demand}
- Competition Level: ${params.competition || 'medium'}

Calculate detailed haul rate with:
1. Fuel costs (round trip, different MPG loaded/empty)
2. Labor costs (drive time + load/unload)
3. Vehicle costs (depreciation + maintenance + insurance)
4. Volume discounts: <500t=0%, 500-1000t=5%, >1000t=8%
5. Market adjustments: high demand=+15%, normal=0%, low=-10%

Return ONLY valid JSON (no markdown):
{
  "haulRate": <final $/ton>,
  "components": {
    "fuel": <$/ton>,
    "labor": <$/ton>,
    "vehicle": <$/ton>,
    "discount": <$/ton>,
    "marketAdjustment": <$/ton>
  },
  "analysis": "<strategic 3-4 sentence analysis with actionable insights>",
  "profitMargin": <percentage>,
  "priceRange": {"low": <number>, "high": <number>},
  "recommendations": [
    "<specific recommendation 1>",
    "<specific recommendation 2>",
    "<specific recommendation 3>"
  ],
  "competitiveStrategy": "<specific positioning advice>",
  "riskFactors": ["<risk 1>", "<risk 2>"]
}`
            }],
            max_tokens: 3000
        });

        return { success: true, data: response };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('ai-analyze-market', async (event, params) => {
    try {
        const response = await callClaudeAPI({
            messages: [{
                role: 'user',
                content: `Analyze market conditions for construction materials hauling in ${params.region}.

MARKET DATA:
- Current Projects: ${params.projects || 'N/A'}
- Seasonal Trends: ${params.season || 'year-round'}
- Local Competition: ${params.competitorCount || 'moderate'}
- Material Type: ${params.material}
- Recent Price Changes: ${params.priceChanges || 'stable'}

Provide comprehensive market analysis including:
1. Current market conditions
2. Demand forecast (next 3-6 months)
3. Pricing pressure points
4. Competitive landscape
5. Strategic opportunities

Return JSON:
{
  "marketCondition": "strong/moderate/weak",
  "demandForecast": "<detailed forecast>",
  "pricingPressure": "<analysis>",
  "opportunities": ["<opp1>", "<opp2>", "<opp3>"],
  "threats": ["<threat1>", "<threat2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "confidenceLevel": "high/medium/low"
}`
            }],
            max_tokens: 2500
        });

        return { success: true, data: response };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('ai-generate-report', async (event, data) => {
    try {
        const response = await callClaudeAPI({
            messages: [{
                role: 'user',
                content: `Generate professional executive summary report for haul rate analysis.

PROJECT DATA:
- Client/Job Site: ${data.jobSite}
- Closest Location: ${data.closestLocation}
- Distance: ${data.distance} miles
- Calculated Rate: $${data.haulRate}/ton
- Monthly Volume: ${data.volume} tons
- Monthly Revenue: $${data.monthlyRevenue}
- Profit Margin: ${data.profitMargin}%

COMPETITIVE DATA:
${JSON.stringify(data.competitors, null, 2)}

Generate professional report with:
1. Executive Summary (2-3 paragraphs)
2. Key Findings (bullet points)
3. Competitive Analysis
4. Financial Projections
5. Strategic Recommendations
6. Risk Assessment

Return JSON with formatted sections:
{
  "executiveSummary": "<html formatted>",
  "keyFindings": ["<finding1>", "<finding2>", "<finding3>"],
  "competitiveAnalysis": "<html formatted>",
  "financialProjections": "<html formatted>",
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "riskAssessment": "<html formatted>"
}`
            }],
            max_tokens: 4000
        });

        return { success: true, data: response };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('ai-optimize-route', async (event, params) => {
    try {
        const response = await callClaudeAPI({
            messages: [{
                role: 'user',
                content: `Optimize hauling route and schedule for maximum efficiency.

ROUTE INFO:
- Origin: ${params.origin}
- Destination: ${params.destination}
- Distance: ${params.distance} miles
- Drive Time: ${params.driveTime} minutes
- Material: ${params.material}
- Volume: ${params.volume} tons
- Truck Capacity: ${params.truckCapacity} tons

CONSTRAINTS:
- Operating Hours: ${params.operatingHours || '7 AM - 5 PM'}
- Driver Availability: ${params.drivers || 1} drivers
- Delivery Deadline: ${params.deadline || 'flexible'}

Provide optimization analysis:
1. Optimal number of trips per day
2. Best departure times (considering traffic)
3. Driver schedule optimization
4. Cost savings opportunities
5. Efficiency improvements

Return JSON:
{
  "tripsPerDay": <number>,
  "optimalSchedule": [
    {"trip": 1, "departure": "7:00 AM", "arrival": "8:30 AM", "return": "10:00 AM"},
    ...
  ],
  "totalDailyCapacity": <tons>,
  "daysNeeded": <number>,
  "costSavings": "<analysis>",
  "efficiencyGain": "<percentage>",
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}`
            }],
            max_tokens: 2500
        });

        return { success: true, data: response };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Claude API Helper Function
async function callClaudeAPI(params) {
    const axios = require('axios');
    
    // In production, store API key securely (encrypted config file or environment variable)
    const API_KEY = process.env.ANTHROPIC_API_KEY || 'your-api-key-here';
    
    try {
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-sonnet-4-20250514',
                max_tokens: params.max_tokens || 3000,
                messages: params.messages
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            }
        );

        let content = response.data.content[0].text;
        // Clean up markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        return JSON.parse(content);
    } catch (error) {
        console.error('Claude API Error:', error.response?.data || error.message);
        throw new Error(`AI API Error: ${error.message}`);
    }
}

// Fuel Price Integration - EIA (U.S. Energy Information Administration)
ipcMain.handle('get-fuel-prices', async (event, params) => {
    try {
        const state = params.state || 'US'; // US for national average
        const fuelPrices = await fetchEIAFuelPrices(state);
        return { success: true, data: fuelPrices };
    } catch (error) {
        console.error('Fuel price fetch error:', error);
        return { success: false, error: error.message };
    }
});

async function fetchEIAFuelPrices(state) {
    const axios = require('axios');
    
    // EIA API key - FREE to obtain from https://www.eia.gov/opendata/register.php
    const EIA_API_KEY = process.env.EIA_API_KEY || 'demo-key';
    
    try {
        // State-specific fuel prices (or US average)
        const stateCode = state === 'US' ? '' : state;
        
        // Gasoline prices endpoint
        const gasolineSeriesId = stateCode 
            ? `PET.EMM_EPM0_PTE_S${stateCode}_DPG.W` // State-specific
            : 'PET.EMM_EPM0_PTE_NUS_DPG.W';         // US Average
        
        // Diesel prices endpoint  
        const dieselSeriesId = stateCode
            ? `PET.EMD_EPD2D_PTE_S${stateCode}_DPG.W` // State-specific
            : 'PET.EMD_EPD2D_PTE_NUS_DPG.W';          // US Average
        
        const gasolineResponse = await axios.get(
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${gasolineSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`
        );
        
        const dieselResponse = await axios.get(
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${dieselSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`
        );
        
        const gasolinePrice = gasolineResponse.data?.response?.data?.[0]?.value || 3.50;
        const dieselPrice = dieselResponse.data?.response?.data?.[0]?.value || 3.80;
        const lastUpdate = gasolineResponse.data?.response?.data?.[0]?.period || new Date().toISOString().split('T')[0];
        
        return {
            gasoline: parseFloat(gasolinePrice),
            diesel: parseFloat(dieselPrice),
            lastUpdate: lastUpdate,
            source: 'U.S. Energy Information Administration (EIA)',
            state: state === 'US' ? 'National Average' : state
        };
    } catch (error) {
        console.error('EIA API Error:', error.message);
        // Fallback to reasonable defaults if API fails
        return {
            gasoline: 3.50,
            diesel: 3.80,
            lastUpdate: new Date().toISOString().split('T')[0],
            source: 'Default (EIA unavailable)',
            state: state === 'US' ? 'National Average' : state
        };
    }
}

// Historical fuel price trends
ipcMain.handle('get-fuel-price-trends', async (event, params) => {
    try {
        const axios = require('axios');
        const EIA_API_KEY = process.env.EIA_API_KEY || 'demo-key';
        const state = params.state || 'US';
        const stateCode = state === 'US' ? '' : state;
        
        const gasolineSeriesId = stateCode 
            ? `PET.EMM_EPM0_PTE_S${stateCode}_DPG.W`
            : 'PET.EMM_EPM0_PTE_NUS_DPG.W';
        
        // Get last 12 weeks of data
        const response = await axios.get(
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[series][]=${gasolineSeriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=12`
        );
        
        const data = response.data?.response?.data || [];
        const trend = data.map(item => ({
            date: item.period,
            price: parseFloat(item.value)
        })).reverse();
        
        // Calculate trend direction
        const recentPrice = trend[trend.length - 1]?.price || 3.50;
        const oldPrice = trend[0]?.price || 3.50;
        const change = recentPrice - oldPrice;
        const percentChange = ((change / oldPrice) * 100).toFixed(2);
        
        return {
            success: true,
            data: {
                trend: trend,
                currentPrice: recentPrice,
                priceChange: change.toFixed(2),
                percentChange: percentChange,
                direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
