import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Core React Strict Options */
  reactStrictMode: true,

  /* Turbopack Optimization: फालतू फाइलों की स्कैनिंग रोकने के लिए */
  experimental: {
    // यहाँ अपनी इस्तेमाल होने वाली भारी लाइब्रेरी डाल दें ताकि उनके सारे आइकॉन एक साथ लोड न हों
    optimizePackageImports: ['react-icons', '@phosphor-icons/react'],
  },

  /* कंपाइलर कैशे को बूस्ट करना */
  logging: {
    fetches: {
      fullUrl: false, // फ़ेच लॉगिंग को केवल ज़रूरी चीज़ों तक सीमित रखें
    },
  },
};

export default nextConfig;
