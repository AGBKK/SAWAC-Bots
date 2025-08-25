#!/usr/bin/env node

// Generate distribution script for approved token requests
const fs = require('fs');
const path = require('path');

const REQUESTS_FILE = path.join(__dirname, '../data/token-requests.json');

function generateDistributionScript() {
  console.log('🚀 Generating distribution script for approved requests...\n');
  
  try {
    // Load approved requests
    const data = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
    const approved = Object.values(data.approved || {});
    
    if (approved.length === 0) {
      console.log('❌ No approved requests found.');
      console.log('Use /approve command in the bot to approve requests first.');
      return;
    }
    
    console.log(`📋 Found ${approved.length} approved requests:`);
    approved.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.firstName} (@${req.username || 'no username'}) - ${req.walletAddress}`);
    });
    
    // Generate addresses array
    const addresses = approved.map(req => req.walletAddress);
    
    // Create distribution script
    const scriptContent = `// SAWAC Token Distribution Script - Generated on ${new Date().toISOString()}
// Run with: npx hardhat run scripts/distributeTestTokens.js --network bscTestnet

const hre = require("hardhat");

async function main() {
  console.log("🚀 SAWAC Test Token Distribution Script\\n");

  // Contract addresses (BSC Testnet)
  const sawacTokenAddress = "0xA9B266b3cee8691b0b3ecE2FdEF7e89C4e0d34F3"; // SAWAC Token
  const usdtTokenAddress = "0x101a13505A7ae2d2C72AC74a4c26732100852455"; // Test USDT

  // Load contracts
  const sawacToken = await hre.ethers.getContractAt("SAWACToken", sawacTokenAddress);
  const usdtToken = await hre.ethers.getContractAt("TestUSDT", usdtTokenAddress);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📤 Distributing from:", deployer.address);

  // Test token amounts
  const sawacAmount = hre.ethers.parseUnits("1000", 18); // 1000 SAWAC
  const usdtAmount = hre.ethers.parseUnits("100", 6);    // 100 USDT

  // Approved tester addresses (${approved.length} users)
  const testers = [
${addresses.map(addr => `    "${addr}",`).join('\n')}
  ];

  console.log(\`\\n🎯 Distributing to \${testers.length} approved testers:\`);
  console.log(\`   SAWAC: \${hre.ethers.formatEther(sawacAmount)} per tester\`);
  console.log(\`   USDT: \${hre.ethers.formatUnits(usdtAmount, 6)} per tester\`);

  // Check deployer balances
  const deployerSawacBalance = await sawacToken.balanceOf(deployer.address);
  const deployerUsdtBalance = await usdtToken.balanceOf(deployer.address);

  console.log(\`\\n💰 Deployer Balances:\`);
  console.log(\`   SAWAC: \${hre.ethers.formatEther(deployerSawacBalance)}\`);
  console.log(\`   USDT: \${hre.ethers.formatUnits(deployerUsdtBalance, 6)}\`);

  const totalSawacNeeded = sawacAmount * BigInt(testers.length);
  const totalUsdtNeeded = usdtAmount * BigInt(testers.length);

  if (deployerSawacBalance < totalSawacNeeded) {
    console.log(\`❌ Insufficient SAWAC balance. Need \${hre.ethers.formatEther(totalSawacNeeded)}, have \${hre.ethers.formatEther(deployerSawacBalance)}\`);
    return;
  }

  if (deployerUsdtBalance < totalUsdtNeeded) {
    console.log(\`❌ Insufficient USDT balance. Need \${hre.ethers.formatUnits(totalUsdtNeeded, 6)}, have \${hre.ethers.formatUnits(deployerUsdtBalance, 6)}\`);
    return;
  }

  console.log("\\n✅ Sufficient balances. Starting distribution...\\n");

  // Distribute tokens to each tester
  for (let i = 0; i < testers.length; i++) {
    const testerAddress = testers[i];
    console.log(\`📤 Distributing to tester \${i + 1}/\${testers.length}: \${testerAddress}\`);

    try {
      // Transfer SAWAC tokens
      console.log("   🪙 Transferring SAWAC...");
      const sawacTx = await sawacToken.transfer(testerAddress, sawacAmount);
      await sawacTx.wait();
      console.log("   ✅ SAWAC transferred successfully");

      // Transfer USDT tokens
      console.log("   💰 Transferring USDT...");
      const usdtTx = await usdtToken.transfer(testerAddress, usdtAmount);
      await usdtTx.wait();
      console.log("   ✅ USDT transferred successfully");

      console.log(\`   🎉 Tester \${i + 1} completed!\\n\`);

    } catch (error) {
      console.error(\`   ❌ Error distributing to \${testerAddress}:\`, error.message);
      console.log("   ⏭️  Skipping to next tester...\\n");
    }
  }

  console.log("🎊 Distribution completed!");
  console.log("\\n📋 Next steps for testers:");
  console.log("1. Add BSC Testnet to MetaMask");
  console.log("2. Get test BNB from faucet");
  console.log("3. Visit sawac.io and connect wallet");
  console.log("4. Start testing features");
  console.log("5. Report findings via GitHub Issues");
}

main().catch((error) => {
  console.error("❌ Distribution failed:", error);
  process.exit(1);
});`;

    // Write the script
    const scriptPath = path.join(__dirname, '../generated-distribution.js');
    fs.writeFileSync(scriptPath, scriptContent);
    
    console.log('\n✅ Distribution script generated successfully!');
    console.log(`📁 File: ${scriptPath}`);
    console.log('\n🚀 To run the distribution:');
    console.log(`   cd ../sawac-token`);
    console.log(`   cp ../sawac-bots/telegram-bot/generated-distribution.js scripts/`);
    console.log(`   npx hardhat run scripts/generated-distribution.js --network bscTestnet`);
    
    // Also create a simple addresses file
    const addressesContent = `// Approved addresses for distribution
const approvedAddresses = [
${addresses.map(addr => `  "${addr}",`).join('\n')}
];

module.exports = approvedAddresses;`;
    
    const addressesPath = path.join(__dirname, '../approved-addresses.js');
    fs.writeFileSync(addressesPath, addressesContent);
    
    console.log(`\n📋 Addresses file: ${addressesPath}`);
    
  } catch (error) {
    console.error('❌ Error generating distribution script:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  generateDistributionScript();
}

module.exports = { generateDistributionScript }; 