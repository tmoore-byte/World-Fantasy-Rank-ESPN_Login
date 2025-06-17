module.exports = async function extractCookies(page) {
  const cookies = await page.cookies();
  const swid = cookies.find(c => c.name === 'SWID')?.value;
  const espn_s2 = cookies.find(c => c.name === 'espn_s2')?.value;

  if (!swid || !espn_s2) throw new Error('SWID or espn_s2 cookie not found');

  return { swid, espn_s2 };
};
