const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/topology/page.tsx', 'utf8');

const replacement = `const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;
  let allowedSiteIds: number[] | null = null;
  let isAdmin = false;
  let isLevel3 = false;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             isAdmin = true;
          } else if (decoded.userId) {
              const { getUser } = await import("@/app/actions/users");
              const u = await getUser(Number(decoded.userId));
              if (u) {
                  if (u.level === "Level3") {
                      isLevel3 = true;
                      allowedSiteIds = Array.isArray(u.site_ids) ? u.site_ids : [];
                  } else if (u.level === "Level2") {
                      allowedProviderIds = Array.isArray(u.provider_ids) ? u.provider_ids : [];
                  } else if (u.level === "Level1") {
                      isAdmin = true;
                  } else {
                      // Fallback for older users without explicit level
                      if (Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                          allowedProviderIds = u.provider_ids;
                      } else {
                          // No explicit permissions, assume restricted
                      }
                  }
              }
          }
      } catch (e) {}
  }

  try {
    let pQueryStr = "SELECT * FROM providers ORDER BY created_at ASC";
    let pParams: any[] = [];
    if (!isAdmin) {
        if (isLevel3) {
            if (allowedSiteIds && allowedSiteIds.length > 0) {
                 pQueryStr = "SELECT * FROM providers WHERE id IN (SELECT provider_id FROM sites WHERE id = ANY($1::int[])) ORDER BY created_at ASC";
                 pParams = [allowedSiteIds];
            } else {
                 pQueryStr = "SELECT * FROM providers WHERE 1=0";
            }
        } else if (allowedProviderIds) {
            if (allowedProviderIds.length > 0) {
                 pQueryStr = "SELECT * FROM providers WHERE id = ANY($1::int[]) ORDER BY created_at ASC";
                 pParams = [allowedProviderIds];
            } else {
                 pQueryStr = "SELECT * FROM providers WHERE 1=0";
            }
        } else {
             pQueryStr = "SELECT * FROM providers WHERE 1=0";
        }
    }
    const pRes = await query(pQueryStr, pParams);
    providers = pRes.rows;
  } catch (err) {}

  try {
    let sQueryStr = "SELECT * FROM sites ORDER BY created_at ASC";
    let sParams: any[] = [];
    if (!isAdmin) {
        if (isLevel3) {
            if (allowedSiteIds && allowedSiteIds.length > 0) {
                 sQueryStr = "SELECT * FROM sites WHERE id = ANY($1::int[]) ORDER BY created_at ASC";
                 sParams = [allowedSiteIds];
            } else {
                 sQueryStr = "SELECT * FROM sites WHERE 1=0";
            }
        } else if (allowedProviderIds) {
            if (allowedProviderIds.length > 0) {
                 sQueryStr = "SELECT * FROM sites WHERE provider_id = ANY($1::int[]) ORDER BY created_at ASC";
                 sParams = [allowedProviderIds];
            } else {
                 sQueryStr = "SELECT * FROM sites WHERE 1=0";
            }
        } else {
             sQueryStr = "SELECT * FROM sites WHERE 1=0";
        }
    }
    const sRes = await query(sQueryStr, sParams);
    sites = sRes.rows;
  } catch (err) {}`;

const lines = c.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const { cookies } = await import("next/headers");')) {
        startIdx = i;
    }
    // We are looking for the end of the site query catch block
    if (startIdx !== -1 && lines[i].includes('const sRes = await query("SELECT * FROM sites ORDER BY created_at ASC");')) {
        // Find the catch block
        for (let j = i; j < lines.length; j++) {
            if (lines[j].includes('catch (err) {}')) {
                endIdx = j;
                break;
            }
        }
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const newLines = [
        ...lines.slice(0, startIdx),
        replacement,
        ...lines.slice(endIdx + 1)
    ];
    fs.writeFileSync('c:/Toon/pssgo/app/topology/page.tsx', newLines.join('\n'));
    console.log('Fixed topology perfectly');
} else {
    console.log('Could not find boundaries');
}
