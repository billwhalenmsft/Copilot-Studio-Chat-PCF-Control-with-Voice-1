/**
 * Setup Test Harness Script
 * 
 * This script reads test-config.local.json and outputs:
 * 1. JavaScript to paste into browser console to set localStorage values
 * 2. A bookmarklet you can save for one-click setup
 * 
 * Usage: node scripts/setup-test-harness.js
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'test-config.local.json');

// Check if local config exists
if (!fs.existsSync(configPath)) {
    console.error('\n❌ test-config.local.json not found!');
    console.log('\nTo set up test defaults:');
    console.log('1. Copy test-config.example.json to test-config.local.json');
    console.log('2. Fill in your API keys and IDs');
    console.log('3. Run this script again\n');
    process.exit(1);
}

// Read the config
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// PCF test harness localStorage key format
// The harness uses a specific format for storing property values
const CONTROL_NAMESPACE = 'Copilot';
const CONTROL_NAME_BETA = 'CopilotStudioChatBeta';
const CONTROL_NAME_GA = 'CopilotStudioChatGA';

// Generate localStorage commands for the Beta control
const generateLocalStorageCommands = (controlName) => {
    const commands = [];
    for (const [key, value] of Object.entries(config)) {
        if (key.startsWith('_')) continue; // Skip comments
        if (value === '' || value === null) continue; // Skip empty values
        
        // The PCF harness stores values with this key format
        const storageKey = `pcf_${CONTROL_NAMESPACE}_${controlName}_${key}`;
        commands.push(`localStorage.setItem('${storageKey}', '${value}');`);
    }
    return commands;
};

// Also set values in the simpler format the harness might use
const generateSimpleCommands = () => {
    const commands = [];
    for (const [key, value] of Object.entries(config)) {
        if (key.startsWith('_')) continue;
        if (value === '' || value === null) continue;
        
        // Some harness versions use simpler key names
        commands.push(`localStorage.setItem('${key}', '${value}');`);
    }
    return commands;
};

console.log('\\n🔧 PCF Test Harness Setup\\n');
console.log('=' .repeat(60));

// Output the JavaScript for console
const betaCommands = generateLocalStorageCommands(CONTROL_NAME_BETA);
const gaCommands = generateLocalStorageCommands(CONTROL_NAME_GA);
const simpleCommands = generateSimpleCommands();

const allCommands = [
    '// PCF Test Harness - Auto-load settings',
    '// Paste this into browser console (F12) on localhost:8181',
    '',
    '// Beta Control settings',
    ...betaCommands,
    '',
    '// GA Control settings', 
    ...gaCommands,
    '',
    '// Simple format (fallback)',
    ...simpleCommands,
    '',
    '// Reload to apply',
    'location.reload();'
];

console.log('\\n📋 CONSOLE COMMANDS (copy all and paste into browser F12 console):\\n');
console.log(allCommands.join('\\n'));

// Create a bookmarklet
const bookmarkletCode = [
    ...betaCommands,
    ...gaCommands,
    ...simpleCommands,
    'location.reload();'
].join('');

const bookmarklet = `javascript:(function(){${encodeURIComponent(bookmarkletCode)}})()`;

console.log('\\n' + '=' .repeat(60));
console.log('\\n🔖 BOOKMARKLET (drag to bookmarks bar for one-click setup):\\n');
console.log('Name: PCF Test Setup');
console.log('URL:', bookmarklet.substring(0, 100) + '...');

// Also create an HTML file they can open
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>PCF Test Harness Setup</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #0078d4; }
        .btn { background: #0078d4; color: white; border: none; padding: 15px 30px; font-size: 16px; cursor: pointer; border-radius: 4px; margin: 10px 0; }
        .btn:hover { background: #106ebe; }
        .success { color: #107c10; font-weight: bold; margin-top: 20px; }
        pre { background: #f4f4f4; padding: 15px; overflow-x: auto; border-radius: 4px; }
        .config { background: #fff8e6; padding: 15px; border-left: 4px solid #ffd800; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🔧 PCF Test Harness Setup</h1>
    <p>Click the button below to load your test configuration into localStorage, then the page will redirect to the test harness.</p>
    
    <div class="config">
        <strong>Configuration loaded from:</strong> test-config.local.json
    </div>

    <button class="btn" onclick="setupAndRedirect()">Setup & Open Test Harness</button>
    <button class="btn" onclick="setupOnly()" style="background: #6c757d;">Setup Only (No Redirect)</button>
    
    <div id="result"></div>

    <h2>Manual Setup</h2>
    <p>If the button doesn't work, copy this code into your browser console (F12) on localhost:8181:</p>
    <pre id="commands">${allCommands.join('\\n')}</pre>

    <script>
        const config = ${JSON.stringify(config, null, 2)};
        
        function setupLocalStorage() {
            const CONTROL_NAMESPACE = 'Copilot';
            const controls = ['CopilotStudioChatBeta', 'CopilotStudioChatGA'];
            let count = 0;
            
            for (const controlName of controls) {
                for (const [key, value] of Object.entries(config)) {
                    if (key.startsWith('_') || value === '' || value === null) continue;
                    localStorage.setItem('pcf_' + CONTROL_NAMESPACE + '_' + controlName + '_' + key, value);
                    count++;
                }
            }
            
            // Also set simple format
            for (const [key, value] of Object.entries(config)) {
                if (key.startsWith('_') || value === '' || value === null) continue;
                localStorage.setItem(key, value);
                count++;
            }
            
            return count;
        }
        
        function setupAndRedirect() {
            const count = setupLocalStorage();
            document.getElementById('result').innerHTML = '<p class="success">✅ ' + count + ' settings saved! Redirecting to test harness...</p>';
            setTimeout(() => {
                window.location.href = 'http://localhost:8181';
            }, 1000);
        }
        
        function setupOnly() {
            const count = setupLocalStorage();
            document.getElementById('result').innerHTML = '<p class="success">✅ ' + count + ' settings saved to localStorage!</p>';
        }
    </script>
</body>
</html>`;

const htmlPath = path.join(__dirname, '..', 'setup-test-harness.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('\\n' + '=' .repeat(60));
console.log('\\n📄 HTML SETUP PAGE created: setup-test-harness.html');
console.log('   Open this file in your browser for a GUI setup experience.\\n');

console.log('\\n✅ Setup complete! Options:');
console.log('   1. Open setup-test-harness.html in browser and click the button');
console.log('   2. Copy the console commands above and paste into F12 console');
console.log('   3. Run: npm run test:setup\\n');
