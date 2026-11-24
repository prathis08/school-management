export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

const isProduction = () => process.env.NODE_ENV === "production";

const sameSite = () => {
  const configured = (process.env.COOKIE_SAMESITE || "").toLowerCase();
  const value = configured || (isProduction() ? "none" : "lax");
  // SameSite=None requires Secure.
  return value;
};

const secure = () => {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE === "true";
  }
  return isProduction() || sameSite() === "none";
};

const baseOptions = () => ({
  httpOnly: true,
  secure: secure(),
  sameSite: sameSite(),
  path: "/",
});

const parseCookies = (req) => {
  const header = req.headers?.cookie;
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const index = part.indexOf("=");
    if (index === -1) return acc;
    const key = decodeURIComponent(part.slice(0, index).trim());
    const value = decodeURIComponent(part.slice(index + 1).trim());
    if (key) acc[key] = value;
    return acc;
  }, {});
};

/**
 * Access token from the Authorization header (API clients) or the httpOnly
 * access cookie (browser).
 */
export const getAccessToken = (req) => {
  const header = req.header?.("Authorization") || req.headers?.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return parseCookies(req)[ACCESS_COOKIE] || null;
};

/**
 * Refresh token from the request body (API clients) or httpOnly cookie.
 */
export const getRefreshToken = (req) => {
  return req.body?.refreshToken || parseCookies(req)[REFRESH_COOKIE] || null;
};

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const options = baseOptions();
  if (accessToken) {
    res.cookie(ACCESS_COOKIE, accessToken, {
      ...options,
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
  if (refreshToken) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

export const clearAuthCookies = (res) => {
  const options = baseOptions();
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
};

export { parseCookies };
