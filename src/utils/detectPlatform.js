// utils/detectPlatform.js
export const detectPlatform = (url) => {
  if (!url) return 'unknown';
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) return 'youtube';
  if (lowercaseUrl.includes('tiktok.com')) return 'tiktok';
  if (lowercaseUrl.includes('instagram.com')) return 'instagram';
  if (lowercaseUrl.includes('facebook.com')) return 'facebook';
  if (lowercaseUrl.includes('linkedin.com')) return 'linkedin';
  if (lowercaseUrl.includes('pinterest.com') || lowercaseUrl.includes('pin.it')) return 'pinterest';
  return 'unknown';
};