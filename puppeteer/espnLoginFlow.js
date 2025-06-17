const path = require('path');
const extractCookies = require('../utils/extractCookies');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

async function startEspnLogin() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.goto('https://www.espn.com/login/', { waitUntil: 'domcontentloaded' });
  return { browser, page };
}

async function completeEspnLogin({ browser, page }, leagueId, seasonId) {
  const TARGET_LEAGUE_URL = `https://fantasy.espn.com/football/league?leagueId=${leagueId}&seasonId=${seasonId}`;
  console.log(`Navigating to TARGET_LEAGUE_URL: ${TARGET_LEAGUE_URL}`);

  try {
    await page.goto(TARGET_LEAGUE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Page loaded successfully.');
  } catch (navErr) {
    console.error('❌ Navigation failed:', navErr.message);
    const screenshotPath = path.resolve(__dirname, `../screenshot_nav_failed_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`🖼 Screenshot saved to: ${screenshotPath}`);
    await browser.close();
    throw new Error('Navigation to league page failed');
  }

  console.log('🔍 Attempting to extract cookies...');
  const cookies = await extractCookies(page);
  console.log('✅ Cookies extracted:', cookies);

  console.log('📡 Fetching league data from ESPN API...');
  let league;
  try {
    league = await fetchLeagueData(cookies, leagueId, seasonId);
    console.log('✅ League data fetched:', league?.id ? `League ID: ${league.id}` : 'No valid league found');
  } catch (fetchErr) {
    console.error('❌ Failed to fetch or parse league data:', fetchErr.message);
    const failShot = path.resolve(__dirname, `../screenshot_fetch_failed_${Date.now()}.png`);
    await page.screenshot({ path: failShot });
    console.log(`🖼 Screenshot of page before failure saved to: ${failShot}`);
    await browser.close();
    throw new Error('Could not retrieve league data from ESPN');
  }

  await browser.close();
  console.log('Browser closed. Returning result.');

  return {
    cookies,
    league,
    message: `Login complete. League data for seasonId=${seasonId} loaded.`
  };
}

async function fetchLeagueData({ swid, espn_s2 }, leagueId, seasonId) {
  espn_s2 = decodeURIComponent(espn_s2);
  const scoringPeriodId = 1; // Change this dynamically later if needed

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}?scoringPeriodId=${scoringPeriodId}&view=mBoxscore&view=mMatchupScore&view=mRoster&view=mSettings&view=mStatus&view=mTeam&view=modular&view=mNav`;

  const headers = {
    'Cookie': `SWID=${swid}; espn_s2=${espn_s2}`,
    'Accept': 'application/json, text/plain, */*',
    'Referer': `https://fantasy.espn.com/football/league?leagueId=${leagueId}&seasonId=${seasonId}`,
    'Origin': 'https://fantasy.espn.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  };

  const res = await fetch(url, { headers });
  const text = await res.text();

  if (!res.ok || text.startsWith('<!DOCTYPE')) {
    console.warn('🛑 ESPN returned HTML or unauthorized response.');
    throw new Error('Failed to retrieve JSON. Got HTML or error.');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('❌ JSON parsing failed:', err.message);
    throw new Error('Failed to parse ESPN league JSON');
  }
}

module.exports = { startEspnLogin, completeEspnLogin };

