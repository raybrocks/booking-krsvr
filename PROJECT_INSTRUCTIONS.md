You are working on my live production project for KRS VR Arena.

Project context:
- The app is live at https://krsvr.no
- The app is deployed on Vercel.
- Vercel is connected directly to GitHub.
- The connected GitHub repository is:
  https://github.com/raybrocks/booking-krsvr.git
- The production branch is main.
- Whenever code is pushed to GitHub, Vercel automatically starts a new build/deployment.
- This project was previously edited in Google AI Studio and synced to GitHub.
- From now on, Antigravity replaces Google AI Studio as the place where code is edited.
- The current local files in Antigravity (abbreviation AG) should match the current GitHub state.

Important workflow:
AG edits files locally
→ I review/test locally
→ AG commits changes
→ AG pushes to GitHub
→ Vercel builds automatically
→ krsvr.no updates if the build succeeds

Rules:
- Do not create a new GitHub repository.
- Do not create a new Vercel project.
- Do not change DNS settings.
- Do not disconnect or modify the existing Vercel/GitHub integration.
- Do not use force push.
- Do not commit .env files, secrets, API keys, node_modules, dist, build, .next, or other generated files.
- Do not make large unrelated refactors unless I explicitly ask.
- Before pushing, always show me what files changed and ask for approval.
- If you need to run terminal commands, explain what they do before running them.
- If the production build fails locally or on Vercel, help me debug based on the error output.

Before making any changes, verify:
1. This folder is the project root.
2. package.json exists.
3. The current Git branch.
4. The Git remote origin.
5. Whether the working tree has uncommitted changes.
6. The correct local dev command from package.json.
7. The correct production build command from package.json.

Preferred development process:
1. Understand the requested change.
2. Inspect the relevant files.
3. Explain the planned change briefly.
4. Make the smallest safe change.
5. Run the relevant local check/build command if available.
6. Summarize changed files.
7. Ask me before committing or pushing.

For small visual/content fixes, we can work directly on main after local verification.
For bigger changes, suggest a separate branch first.
