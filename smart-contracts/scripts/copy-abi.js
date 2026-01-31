const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts/contracts');
const FRONTEND_DIR = path.join(__dirname, '../../frontend/src/contracts');

function copyABI(contractName, fileName) {
    const artifactPath = path.join(ARTIFACTS_DIR, `${fileName}.sol`, `${contractName}.json`);
    const destPath = path.join(FRONTEND_DIR, `${contractName}ABI.json`);

    try {
        const artifactContent = fs.readFileSync(artifactPath, 'utf8');
        const artifact = JSON.parse(artifactContent);

        fs.writeFileSync(destPath, JSON.stringify(artifact.abi, null, 2));
        console.log(`✅ Copied ${contractName} ABI to frontend.`);
    } catch (error) {
        console.error(`❌ Error copying ${contractName} ABI:`, error.message);
    }
}

copyABI('EventTicket', 'EventTicket');
copyABI('EventFactory', 'EventFactory');
