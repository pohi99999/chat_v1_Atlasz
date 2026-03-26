import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@copilotkit/runtime"],
  outputFileTracingIncludes: {
    '/api/chat': ['./src/config/system-prompt.md'],
  },
};

export default nextConfig;
