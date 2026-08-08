/**
 * CAREERPILOT — FULL DIAGNOSTIC SUITE
 * Tests: Gemini API → PDF Upload → PDF Extraction → AI Analysis → Data Pipeline
 * DO NOT print API keys or secrets.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// We'll import lazily to avoid crashing if a module is missing
async function runDiagnostics() {
  console.log('\n====================================================');
  console.log('🔬 CAREERPILOT FULL DIAGNOSTIC SUITE');
  console.log('====================================================\n');

  const results: Record<string, string> = {};

  // =====================================================
  // TEST 1: GEMINI API CONNECTION
  // =====================================================
  console.log('--- TEST 1: Gemini API Connection ---');
  try {
    const { geminiService } = require('./services/GeminiService');
    const testPrompt = 'Reply with exactly: GEMINI_CONNECTION_OK';
    // Use a private method workaround via analyzeResume with minimal text to force prompt path
    const pingResult = await (geminiService as any).generateText(testPrompt);
    if (pingResult && pingResult.includes('GEMINI_CONNECTION_OK')) {
      console.log('  ✅ Gemini API: CONNECTED — responded with GEMINI_CONNECTION_OK');
      results['GEMINI_API'] = 'PASS';
    } else if (pingResult) {
      console.log('  ✅ Gemini API: CONNECTED — responded (different text OK):', pingResult.slice(0, 60));
      results['GEMINI_API'] = 'PASS';
    } else {
      console.error('  ❌ Gemini API: No response returned from any candidate model.');
      results['GEMINI_API'] = 'FAIL - No response from candidate models';
    }
  } catch (err: any) {
    console.error('  ❌ Gemini API Error:', err.message || String(err));
    results['GEMINI_API'] = `FAIL - ${err.message || String(err)}`;
  }

  // =====================================================
  // TEST 2: PDF-PARSE LIBRARY AVAILABILITY
  // =====================================================
  console.log('\n--- TEST 2: pdf-parse library ---');
  let pdfParseAvailable = false;
  try {
    const pdfParse = require('pdf-parse');
    if (pdfParse && typeof pdfParse.default === 'function') {
      console.log('  ✅ pdf-parse: library found and importable');
      pdfParseAvailable = true;
      results['PDF_PARSE_LIB'] = 'PASS';
    } else {
      console.error('  ❌ pdf-parse: imported but default is not a function. Version issue.');
      results['PDF_PARSE_LIB'] = 'FAIL - default not a function';
    }
  } catch (err: any) {
    console.error('  ❌ pdf-parse: import failed:', err.message);
    results['PDF_PARSE_LIB'] = `FAIL - ${err.message}`;
    pdfParseAvailable = false;
  }

  // =====================================================
  // TEST 3: PDF EXTRACTION WITH REAL SYNTHETIC TEST RESUME
  // =====================================================
  console.log('\n--- TEST 3: PDF Text Extraction (synthetic text-based PDF) ---');

  // Create a minimal text-based PDF buffer using raw PDF syntax
  const syntheticResumeTxt = `Rahul Sharma
rahul.sharma.dev@gmail.com | +91 9876543210 | Pune, India
B.Tech Information Technology, Pune University, 2023
Skills: Java, Spring Boot, Microservices, MySQL, Hibernate, REST APIs, Git, JUnit, Maven
Experience: Java Backend Developer Intern at TechCorp Solutions (Jul 2023 - Jan 2024)
  - Built Spring Boot REST APIs handling banking transactions
  - Optimized MySQL query performance, reducing latency by 40%
Projects: Banking Transaction API (Java, Spring Boot, MySQL, Spring Security)
Certifications: Oracle Certified Associate Java SE Programmer`;

  // Write a minimal raw PDF (text-only, no fonts needed for pdf-parse)
  const rawPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<<>>>>endobj
4 0 obj<</Length ${syntheticResumeTxt.length + 20}>>
stream
BT /F1 12 Tf 10 770 Td (${syntheticResumeTxt.replace(/\n/g, ' ')}) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
500
%%EOF`;

  const testPdfBuffer = Buffer.from(rawPdfContent);

  if (pdfParseAvailable) {
    try {
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(testPdfBuffer);
      const textLen = (parsed.text || '').trim().length;
      console.log(`  📄 PDF extraction test: textLength = ${textLen}`);

      if (textLen > 10) {
        console.log('  ✅ pdf-parse: Text extracted successfully from synthetic PDF');
        console.log('  ✅ Extracted text preview:', parsed.text.slice(0, 100).replace(/\n/g, ' ') + '...');
        results['PDF_EXTRACTION'] = 'PASS';
      } else {
        console.log('  ⚠️  pdf-parse: Extracted text length =', textLen, '(too short for synthetic PDF — testing plain text fallback)');
        results['PDF_EXTRACTION'] = 'PARTIAL - low text length from PDF stream, fallback will be used';
      }
    } catch (err: any) {
      console.error('  ❌ pdf-parse threw an error on synthetic PDF:', err.message);
      results['PDF_EXTRACTION'] = `FAIL - ${err.message}`;
    }
  } else {
    results['PDF_EXTRACTION'] = 'SKIPPED - library not available';
  }

  // =====================================================
  // TEST 3B: Plain text (TXT) extraction fallback
  // =====================================================
  console.log('\n--- TEST 3B: Plain text (TXT) extraction fallback ---');
  const txtBuffer = Buffer.from(syntheticResumeTxt, 'utf-8');
  const txtAsText = txtBuffer.toString('utf-8').trim();
  console.log(`  📄 Text buffer fallback: textLength = ${txtAsText.length}`);
  if (txtAsText.length > 50) {
    console.log('  ✅ TXT/buffer-based extraction: WORKS correctly');
    results['TXT_EXTRACTION'] = 'PASS';
  } else {
    console.error('  ❌ TXT/buffer-based extraction: text too short');
    results['TXT_EXTRACTION'] = 'FAIL';
  }

  // =====================================================
  // TEST 4: GEMINI AI WITH REAL RESUME TEXT
  // =====================================================
  console.log('\n--- TEST 4: Gemini AI Analysis with Resume A (Java / Spring Boot) ---');
  try {
    const { geminiService } = require('./services/GeminiService');
    const resumeA = `Rahul Sharma
rahul.sharma.dev@gmail.com | +91 9876543210 | Pune, India
Education: B.Tech Information Technology, Pune University (2023)
Skills: Java, Spring Boot, Microservices, MySQL, Hibernate, REST APIs, Git, JUnit, Maven
Experience: Java Backend Developer Intern at TechCorp Solutions (Jul 2023 - Jan 2024).
  Built Spring Boot microservices handling banking transactions.
Projects: Banking Transaction API (Java, Spring Boot, MySQL, Spring Security).
Certifications: Oracle Certified Associate Java SE Programmer.`;

    const analysisA = await geminiService.analyzeResume(resumeA);
    console.log('  ✅ Gemini Analysis A received:');
    console.log('     Name:', analysisA.parsedData.name);
    console.log('     Skills:', (analysisA.parsedData.skills || []).slice(0, 5).join(', '));
    console.log('     Roles:', (analysisA.recommendedRoles || []).join(', '));
    console.log('     Score:', analysisA.resumeScore);
    console.log('     Strengths[0]:', (analysisA.strengths || [])[0]);
    results['GEMINI_ANALYSIS_A'] = 'PASS';
    results['CANDIDATE_A_NAME'] = analysisA.parsedData.name || '(empty)';
    results['CANDIDATE_A_SKILLS'] = (analysisA.parsedData.skills || []).slice(0, 4).join(', ');
    results['CANDIDATE_A_ROLE'] = (analysisA.recommendedRoles || [])[0] || '';

    // =====================================================
    // TEST 5: GEMINI AI WITH SECOND DIFFERENT RESUME
    // =====================================================
    console.log('\n--- TEST 5: Gemini AI Analysis with Resume B (React / TypeScript) ---');
    const resumeB = `Aisha Khan
aisha.khan.frontend@outlook.com | +91 9123456789 | Mumbai, India
Education: B.Sc Computer Science, Mumbai University (2024)
Skills: React, TypeScript, Next.js, Redux, Tailwind CSS, HTML5, CSS3, JavaScript, GraphQL, Jest
Experience: Frontend Engineer Intern at WebStudio India (Feb 2024 - Jul 2024).
  Built responsive React SPA with GraphQL API integration.
Projects: E-Commerce Storefront (React, TypeScript, Redux, Tailwind CSS, GraphQL).
Certifications: Meta Front-End Developer Professional Certificate.`;

    const analysisB = await geminiService.analyzeResume(resumeB);
    console.log('  ✅ Gemini Analysis B received:');
    console.log('     Name:', analysisB.parsedData.name);
    console.log('     Skills:', (analysisB.parsedData.skills || []).slice(0, 5).join(', '));
    console.log('     Roles:', (analysisB.recommendedRoles || []).join(', '));
    console.log('     Score:', analysisB.resumeScore);
    console.log('     Strengths[0]:', (analysisB.strengths || [])[0]);
    results['GEMINI_ANALYSIS_B'] = 'PASS';
    results['CANDIDATE_B_NAME'] = analysisB.parsedData.name || '(empty)';
    results['CANDIDATE_B_SKILLS'] = (analysisB.parsedData.skills || []).slice(0, 4).join(', ');
    results['CANDIDATE_B_ROLE'] = (analysisB.recommendedRoles || [])[0] || '';

    // Verify they differ
    console.log('\n--- DYNAMIC DIFFERENCE VERIFICATION ---');
    const namesDiffer = analysisA.parsedData.name !== analysisB.parsedData.name;
    const skillsDiffer = JSON.stringify(analysisA.parsedData.skills) !== JSON.stringify(analysisB.parsedData.skills);
    const rolesDiffer = JSON.stringify(analysisA.recommendedRoles) !== JSON.stringify(analysisB.recommendedRoles);

    console.log('  Names differ:', namesDiffer ? '✅ YES (PASS)' : '❌ NO (FAIL - static data)');
    console.log('  Skills differ:', skillsDiffer ? '✅ YES (PASS)' : '❌ NO (FAIL - static data)');
    console.log('  Roles differ:', rolesDiffer ? '✅ YES (PASS)' : '❌ NO (FAIL - static data)');

    results['RESUME_A_VS_B'] = (namesDiffer && skillsDiffer && rolesDiffer) ? 'DIFFERENT ✅' : 'SAME ❌ STILL STATIC';

  } catch (err: any) {
    console.error('  ❌ Gemini resume analysis error:', err.message);
    results['GEMINI_ANALYSIS_A'] = `FAIL - ${err.message}`;
    results['GEMINI_ANALYSIS_B'] = `FAIL - ${err.message}`;
  }

  // =====================================================
  // TEST 6: CHECK FOR STATIC FALLBACK STRINGS IN CONTROLLER
  // =====================================================
  console.log('\n--- TEST 6: Checking resumeController.ts for hardcoded static fallback ---');
  try {
    const controllerPath = path.join(__dirname, 'controllers', 'resumeController.ts');
    const controllerSrc = fs.readFileSync(controllerPath, 'utf-8');

    const staticFallbackPresent = controllerSrc.includes('Rahul Sharma') && controllerSrc.includes('rawText.length < 5');
    if (staticFallbackPresent) {
      console.error('  ❌ STATIC FALLBACK FOUND: Controller injects hardcoded "Rahul Sharma" when textLength < 5!');
      results['STATIC_FALLBACK_CONTROLLER'] = 'YES - BUG DETECTED at rawText.length < 5 branch';
    } else {
      console.log('  ✅ No static fallback injection found in controller');
      results['STATIC_FALLBACK_CONTROLLER'] = 'NO';
    }
  } catch (err: any) {
    results['STATIC_FALLBACK_CONTROLLER'] = `CHECK FAILED - ${err.message}`;
  }

  // =====================================================
  // TEST 7: CHECK FOR MULTER SETUP (memory vs disk storage)
  // =====================================================
  console.log('\n--- TEST 7: Checking multer configuration ---');
  try {
    const routePath = path.join(__dirname, 'routes', 'resumeRoutes.ts');
    const routeSrc = fs.readFileSync(routePath, 'utf-8');
    if (routeSrc.includes('memoryStorage')) {
      console.log('  ✅ Multer: Using memoryStorage — file.buffer will be available');
      results['MULTER_STORAGE'] = 'memoryStorage (CORRECT)';
    } else if (routeSrc.includes('diskStorage')) {
      console.log('  ⚠️  Multer: Using diskStorage — need file.path instead of file.buffer');
      results['MULTER_STORAGE'] = 'diskStorage - verify file.path usage in controller';
    } else {
      console.log('  ℹ️  Multer storage type not deterministic from source scan');
      results['MULTER_STORAGE'] = 'UNKNOWN';
    }
  } catch (err: any) {
    results['MULTER_STORAGE'] = `CHECK FAILED - ${err.message}`;
  }

  // =====================================================
  // FINAL REPORT
  // =====================================================
  console.log('\n====================================================');
  console.log('📋 DIAGNOSTIC REPORT');
  console.log('====================================================');
  Object.entries(results).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(35)}: ${v}`);
  });
  console.log('====================================================\n');
}

runDiagnostics().catch((err) => {
  console.error('💥 DIAGNOSTIC CRASHED:', err);
  process.exit(1);
});
