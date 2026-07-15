export const isMusicUCookieExpired= (): boolean =>{
  const cookieString=localStorage.getItem('cookie') as string
  if (cookieString == null)
    return true
  const musicURegex = /MUSIC_U=[^;]+;([^;]*)(Expires=([^;]+)|Max-Age=(\d+))/i;
  const match = cookieString.match(musicURegex);

  if (!match) {
    return true;
  }

  if (match[3]) {
    const expiresDate = new Date(match[3]);
    const now = new Date();
    return expiresDate < now;
  }

  if (match[4]) {
    const maxAgeSeconds = parseInt(match[4], 10);
    const creationTime = new Date();
    const expirationTime = new Date(creationTime.getTime() + maxAgeSeconds * 1000);


    return expirationTime < new Date();
  }

  return true;
}
