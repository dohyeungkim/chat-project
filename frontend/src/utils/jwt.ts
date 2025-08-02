export function getToken() {
  return localStorage.getItem("token");
}

// 페이로드 디코딩 (Base64)
export function decodeToken(token: string | null): any | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}