export async function fetchPublicIpOnly() {
  const attempts = [];
  const providers = [
    async () => {
      const res = await fetch('https://api64.ipify.org?format=json', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`IPIFY64 HTTP ${res.status}`);
      const data = await res.json();
      return data?.ip;
    },
    async () => {
      const res = await fetch('https://api.ipify.org?format=json', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`IPIFY HTTP ${res.status}`);
      const data = await res.json();
      return data?.ip;
    },
    async () => {
      const res = await fetch('https://ipwho.is/', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`IPWHO.IS HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.success === false) throw new Error(data.message || 'IPWHO.IS FAILED');
      return data?.ip;
    }
  ];

  for (const provider of providers) {
    try {
      const ip = await provider();
      if (ip) return ip;
      attempts.push('MISSING IP');
    } catch (error) {
      attempts.push(String(error?.message || error));
    }
  }

  throw new Error(`PUBLIC IP FAILED / ${attempts.join(' / ')}`);
}

export async function fetchBothIps() {
  // Parallel fetch IPv4 and IPv6 from multiple providers
  const results = {
    ipv4: null,
    ipv6: null,
    errors: []
  };

  // IPv4 providers - explicit IPv4-only endpoints
  const ipv4Providers = [
    async () => {
      const res = await fetch('https://api.ipify.org?format=json', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`IPIFY HTTP ${res.status}`);
      const data = await res.json();
      return data?.ip;
    },
    async () => {
      const res = await fetch('https://checkip.amazonaws.com');
      if (!res.ok) throw new Error(`CHECKIP HTTP ${res.status}`);
      const text = await res.text();
      return text?.trim();
    },
    async () => {
      const res = await fetch('https://v4.icanhazip.com/');
      if (!res.ok) throw new Error(`ICANHAZIP-V4 HTTP ${res.status}`);
      const text = await res.text();
      return text?.trim();
    },
    async () => {
      const res = await fetch('https://ident.me');
      if (!res.ok) throw new Error(`IDENT.ME HTTP ${res.status}`);
      const text = await res.text();
      return text?.trim();
    },
    async () => {
      const res = await fetch('https://bot.whatismyipaddress.com');
      if (!res.ok) throw new Error(`WHATISMYIPADDRESS HTTP ${res.status}`);
      const text = await res.text();
      return text?.trim();
    }
  ];

  // IPv6 providers - explicit IPv6-only endpoints
  const ipv6Providers = [
    async () => {
      const res = await fetch('https://api64.ipify.org?format=json', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`IPIFY64 HTTP ${res.status}`);
      const data = await res.json();
      return data?.ip;
    },
    async () => {
      const res = await fetch('https://v6.icanhazip.com/');
      if (!res.ok) throw new Error(`ICANHAZIP-V6 HTTP ${res.status}`);
      const text = await res.text();
      return text?.trim();
    },
    async () => {
      const res = await fetch('https://api6.ipify.org?format=json', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`IPIFY6 HTTP ${res.status}`);
      const data = await res.json();
      return data?.ip;
    },
    async () => {
      const res = await fetch('https://ident.me/');
      if (!res.ok) throw new Error(`IDENT.ME HTTP ${res.status}`);
      const text = await res.text();
      return text?.trim();
    },
    async () => {
      const res = await fetch('https://ipv6.whatismyipaddress.com');
      if (!res.ok) throw new Error(`WHATISMYIPADDRESS-V6 HTTP ${res.status}`);
      const text = await res.text();
      return text?.trim();
    }
  ];

  // Fetch both in parallel with validation
  const [ipv4Result, ipv6Result] = await Promise.all([
    fetchFirstValidIp(ipv4Providers, 'IPv4', false),
    fetchFirstValidIp(ipv6Providers, 'IPv6', true)
  ]);

  if (ipv4Result.ip) results.ipv4 = ipv4Result.ip;
  if (ipv6Result.ip) results.ipv6 = ipv6Result.ip;

  if (ipv4Result.error) results.errors.push(ipv4Result.error);
  if (ipv6Result.error) results.errors.push(ipv6Result.error);

  return results;
}

async function fetchFirstValidIp(providers, label, shouldContainColon) {
  const errors = [];

  for (const provider of providers) {
    try {
      const ip = await Promise.race([
        provider(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 5000))
      ]);

      if (!ip) {
        errors.push(`No IP returned`);
        continue;
      }

      const ipStr = String(ip).trim();
      const hasColon = ipStr.includes(':');

      // Validate IP type matches expectation
      if (shouldContainColon && !hasColon) {
        errors.push(`Got IPv4 instead: ${ipStr}`);
        continue;
      }
      if (!shouldContainColon && hasColon) {
        errors.push(`Got IPv6 instead: ${ipStr}`);
        continue;
      }

      // Success - found valid IP of correct type
      return { ip: ipStr, error: null };
    } catch (error) {
      errors.push(String(error?.message || error));
    }
  }

  // All providers failed
  return { ip: null, error: `${label}: ${errors.join(' / ')}` };
}

export async function fetchIpData(ip) {
  const attempts = [];

  try {
    const url = ip ? `https://ipwho.is/?ip=${encodeURIComponent(ip)}` : 'https://ipwho.is/';
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`IPWHO.IS HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.success === false) throw new Error(data.message || 'IPWHO.IS FAILED');
    return data;
  } catch (error) {
    attempts.push(String(error?.message || error));
  }

  try {
    const url = ip ? `https://ipwhois.io/website/ip?ip=${encodeURIComponent(ip)}` : 'https://ipwhois.io/';
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`IPWHOIS.IO HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.success === false) throw new Error(data.message || 'IPWHOIS.IO FAILED');
    return normalizeIpWhoisIo(data);
  } catch (error) {
    attempts.push(String(error?.message || error));
  }

  try {
    const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : 'https://ipapi.co/json/';
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`IPAPI.CO HTTP ${res.status}`);
    const data = await res.json();
    if (data?.error) throw new Error(data.reason || data.message || 'IPAPI.CO FAILED');
    return normalizeIpApiCo(data);
  } catch (error) {
    attempts.push(String(error?.message || error));
  }

  try {
    const res = await fetch('https://api64.ipify.org?format=json', { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`IPIFY HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.ip) throw new Error('IPIFY MISSING IP');
    return normalizeIpOnly(data.ip);
  } catch (error) {
    attempts.push(String(error?.message || error));
  }

  throw new Error(`IP LOOKUP FAILED / ${attempts.join(' / ')}`);
}

export function normalizeIpOnly(ip) {
  return {
    ip,
    type: inferIpType(ip),
    connection: {},
    timezone: {},
    flag: {}
  };
}

function normalizeIpWhoisIo(data) {
  const tzId = data.timezone?.id;
  return {
    ip: data.ip,
    type: data.type,
    country: data.country,
    country_code: data.country_code,
    region: data.region,
    city: data.city,
    postal: data.postal,
    latitude: numberOrUndefined(data.latitude),
    longitude: numberOrUndefined(data.longitude),
    connection: {
      isp: data.connection?.isp,
      org: data.connection?.org,
      asn: data.connection?.asn,
      domain: data.connection?.domain,
      hostname: data.connection?.hostname
    },
    flag: { emoji: data.flag?.emoji },
    timezone: {
      id: tzId,
      abbr: data.timezone?.abbr,
      utc: data.timezone?.utc,
      current_time: tzId ? currentTimeForZone(tzId) : undefined,
      is_dst: typeof data.timezone?.is_dst === 'boolean' ? data.timezone.is_dst : (tzId ? isDstNowInZone(tzId) : undefined)
    },
    security: data.security
  };
}

function normalizeIpApiCo(data) {
  const tzId = data.timezone;
  const utc = formatIpApiUtcOffset(data.utc_offset);
  return {
    ip: data.ip,
    type: data.version ? `IPv${data.version}` : undefined,
    country: data.country_name || data.country,
    country_code: data.country_code,
    region: data.region,
    city: data.city,
    postal: data.postal,
    latitude: numberOrUndefined(data.latitude),
    longitude: numberOrUndefined(data.longitude),
    connection: { isp: data.org, org: data.org, asn: data.asn, domain: undefined, hostname: undefined },
    flag: { emoji: countryCodeToFlagEmoji(data.country_code) },
    timezone: {
      id: tzId,
      abbr: undefined,
      utc,
      current_time: tzId ? currentTimeForZone(tzId) : undefined,
      is_dst: tzId ? isDstNowInZone(tzId) : undefined
    },
    security: undefined
  };
}

function inferIpType(ip) {
  if (!ip) return undefined;
  return String(ip).includes(':') ? 'IPv6' : 'IPv4';
}

function numberOrUndefined(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function formatIpApiUtcOffset(value) {
  if (!value && value !== 0) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  if (/^[+-]\d{2}:?\d{2}$/.test(str)) {
    return str.includes(':') ? str : `${str.slice(0, 3)}:${str.slice(3)}`;
  }
  return str;
}

function countryCodeToFlagEmoji(code) {
  if (!code || String(code).length !== 2) return undefined;
  const cc = String(code).toUpperCase();
  const base = 127397;
  try {
    return String.fromCodePoint(...cc.split('').map((char) => base + char.charCodeAt(0)));
  } catch {
    return undefined;
  }
}

function currentTimeForZone(timeZone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(new Date());
  } catch {
    return undefined;
  }
}

function isDstNowInZone(timeZone) {
  try {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const nowOffset = zonedOffsetMinutes(now, timeZone);
    const janOffset = zonedOffsetMinutes(jan, timeZone);
    const julOffset = zonedOffsetMinutes(jul, timeZone);
    const baseline = Math.max(janOffset, julOffset);
    return nowOffset < baseline;
  } catch {
    return undefined;
  }
}

function zonedOffsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(map.year), Number(map.month) - 1, Number(map.day),
    Number(map.hour), Number(map.minute), Number(map.second)
  );
  return (asUtc - date.getTime()) / 60000;
}