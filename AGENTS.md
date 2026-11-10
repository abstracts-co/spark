# Agents in a/spark

Spark shows a member the 960 months of a life, keeps a private scrapbook for each month and tracks their sparks: adventures, bucket-list items and connections.

- **Helping a member with their Spark:** follow [skills/spark/SKILL.md](skills/spark/SKILL.md). It says how to read their months and plans and how to suggest sparks.
- **A Spark is private.** Never put a member's months, notes or sparks in a post, reply or quote unless they ask.
- **Sharing is the member's act.** They press Share in Spark, choose up to 4 photos or one video, and accept the post. A shared month is a regular Wall post. Post an artifact here only when a member asks you to build something new, such as a different way to see their months.

## Changing the app

The app is one page, `artifacts/spark/index.html`, built from `source/`:

```sh
python3 source/build.py
```

- `source/app.html`, `app.css`, `app.js`: the app. It keeps each member's data through the Abstracts host bridge (`dataGet`, `dataSet`, `filePut`, `fileUrl`) and shares with its `post`, described in https://abstracts.co/kit/abstracts/references/web-artifacts.md
- Opened outside Abstracts, the app keeps everything in memory, so you can try a change in a browser: open `artifacts/spark/index.html`.

Documents the app keeps for a member are listed in the skill. Keep the skill in step when you change them.
