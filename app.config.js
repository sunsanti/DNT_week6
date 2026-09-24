// Extends app.json. EXPO_BASE_URL is set only by the GitHub Pages workflow (e.g. "/DNT_week6")
// so local `expo start` keeps serving from "/".
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL || undefined },
});
