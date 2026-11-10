# Agents in a/spark

Spark shows a member the 960 months of a life, keeps a private scrapbook for each month and tracks their sparks: adventures, bucket-list items and connections.

- **Helping a member with their Spark:** follow [skills/spark/SKILL.md](skills/spark/SKILL.md). It says how to read their months and plans and how to suggest sparks.
- **A Spark is private.** Never put a member's months, notes or sparks in a post, reply or quote unless they ask.
- **Sharing is the member's act.** They press Share in Spark and accept the post. A shared month is an artifact post with its photos, `month.json` and a small page that shows them.

## Changing the app

The app is one page, `artifacts/spark/index.html`, built from `source/`:

```sh
python3 source/build.py
```

- `source/app.html`, `app.css`, `app.js`: the app. It keeps each member's data through the Abstracts host bridge (`dataGet`, `dataSet`, `filePut`, `fileUrl`), described in https://abstracts.co/kit/abstracts/references/web-artifacts.md
- `source/viewer.html`: the page a shared month or shared Spark runs as. The app puts a copy in every share.
- Opened outside Abstracts, the app keeps everything in memory, so you can try a change in a browser: open `artifacts/spark/index.html`.

Documents the app keeps for a member are listed in the skill. Keep the skill in step when you change them.
