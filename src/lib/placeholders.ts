// src/lib/placeholders.ts

export const placeholders = {
  // Celebrity avatar (square) – uses UI Avatars for name‑based image
  celebrityAvatar: (name?: string) =>
    name
      ? `https://ui-avatars.com/api/?background=FFD700&color=000&name=${encodeURIComponent(name)}&size=200`
      : 'https://picsum.photos/id/100/200/200',

  // Celebrity banner (wide landscape)
  celebrityBanner: 'https://picsum.photos/id/104/1200/400',

  // User avatar (small, initials)
  userAvatar: (username?: string) =>
    username
      ? `https://ui-avatars.com/api/?background=0B0F1E&color=FFD700&name=${encodeURIComponent(username)}&size=100`
      : 'https://ui-avatars.com/api/?background=0B0F1E&color=FFD700&name=User',

  // Ticket image (simple text placeholder)
  ticket: 'https://placehold.co/400x300?text=🎫+Ticket',
};

// Helper to get safe image URL with fallback
export const getSafeImageUrl = (
  url: string | null | undefined,
  type: keyof typeof placeholders = 'ticket'
): string => {
  if (url && url.trim() !== '') return url;
  const placeholder = placeholders[type];
  return typeof placeholder === 'string' ? placeholder : placeholder();
};