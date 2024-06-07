const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+/, "");

module.exports = {
  branches: [
    { name: "main", channel: "latest" },
    { name: "dev", channel: "nightly", prerelease: `nightly-${timestamp}` },
  ],
  repositoryUrl: "https://github.com/gestaoengenharia/chimaera-api",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["./package.json"],
        message:
          "chore(release): ${nextRelease.version}! [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
