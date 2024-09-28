export const getUserAgentMatch = (userAgent: string, matches: string) => {
  const matchesRegex = new RegExp(matches, "i");
  return matchesRegex.test(userAgent);
};

export function isWebView(userAgent: string | null) {
  if (!userAgent) {
    return false;
  }

  return (
    getUserAgentMatch(
      userAgent,
      "com.hungryroot.ios.prod|com.hungryroot.android.prod|com.hungryroot.android.staging|com.hungryroot.ios.staging"
    ) ||
    (getUserAgentMatch(userAgent, "Android") &&
      getUserAgentMatch(userAgent, "wv"))
  );
}
