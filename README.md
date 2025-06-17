ESPN LEAGUE LOGIN INTEGRATION

This module enables users to securely connect their ESPN fantasy football leagues to their profile on World Fantasy Rank. 
It uses Puppeteer to simulate a browser login and extract ESPN authentication cookies (SWID and espn_s2), which are then used to fetch league data via ESPN’s internal API.

What it does:
Automates secure ESPN login using Puppeteer.
Extracts valid ESPN cookies after login.
Makes authenticated API requests to:
  https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{seasonId}/segments/0/leagues/{leagueId}

Returns a JSON payload with all relevant league data, which can be stored and/or used to populate dashboards.


WHAT IT DOES WELL:
No need for the user to manually copy/paste cookies.
Works across any ESPN fantasy league, including private ones.
Full support for weekly matchup and roster data.
Supports multiple concurrent league syncs per user.

LIMITATIONS:
ESPN session cookies eventually expire, so users may need to re-authenticate periodically (weekly/monthly).
ESPN does not provide official API support — subject to changes on their end.
We currently do not store live tokens or refresh credentials, keeping security high but requiring periodic user action.

IDEAL FLOW:
1. User clicks "Add ESPN League".
2. Puppeteer login opens and simulates login.
3. ESPN cookies are extracted and used to pull data.
4. League is added to the user’s WFR profile.
5. Dashboard updates weekly until cookies expire.


TO RUN:
node index.js

Outputs can be sent to Postman or frontend via local server (port 3000).
Screenshots on error are saved to local /screenshots/.
