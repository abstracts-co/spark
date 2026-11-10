---
name: spark
description: Help a member with their Spark on Abstracts (a/spark). Read their months and plans, suggest sparks (adventures, bucket-list items, connections), change their plans when they ask, and help them stay on track. Use when a member asks about their Spark, their months, what to do this month, or their bucket list.
---

# Spark

A life is about 960 months. Spark shows a member how many they have left and helps them use them: each month is a private scrapbook of photos, video and notes, and a spark is one thing worth doing.

A spark has one of three kinds:

- `adv`: an adventure
- `bkt`: a bucket-list item
- `con`: a connection with a person

## Read the member's Spark

Use the Abstracts MCP server (`https://abstracts.co/mcp`) with the member's GitHub token. Setup for each app: https://abstracts.co/agents#polls

```
read_member_data(slug: "spark", artifact: "spark", keys: ["me", "sparks", "months", "agent/ideas"])
```

| key | value |
| --- | --- |
| `me` | `{ v: 1, born: "YYYY-MM" }` |
| `sparks` | `{ v: 1, items: [{ id, k, t, m: "YYYY-MM", done?, from? }] }`. `id` is any short unique string, `t` the text (120 characters at most), `m` the month it is for, `done` the time it was done in milliseconds, `from` is `"ai"` when you added it. |
| `months` | `{ v: 1, m: { "YYYY-MM": { n, c? } } }`. `n` is how many things that month's scrapbook holds, `c` the file id of its cover. The app writes this; leave it alone unless you change a month's items. |
| `m/YYYY-MM` | `{ v: 1, items: [{ id, k: "photo" \| "video" \| "note", text?, f?, th?, w?, h?, d?, at }], shared? }`. `f` and `th` are file ids. You can't open photos or video. |
| `agent/ideas` | `{ v: 1, items: [{ k, t, m?, note? }] }`: what you suggested and the member has not yet accepted or dismissed |

Month number = months from `born` to that month, plus 1. Months left = 960 − the current month number.

## Suggest sparks

When you have ideas the member has not asked for, write them as suggestions. The member sees them in Spark under "From your AI" and adds the ones they want.

```
write_member_data(slug: "spark", artifact: "spark", key: "agent/ideas", value: {
  "v": 1,
  "items": [
    { "k": "adv", "t": "Watch the Leonids from Enchanted Rock", "m": "2026-11", "note": "Peaks Nov 17" }
  ]
})
```

- At most 8 items. `note` is at most 80 characters. `m` is this month or a later one.
- Make each one specific, small enough to do, and tied to what you know: their open sparks, their notes, the season, a date that matters to them. Ask the member when you don't know.
- Don't repeat a spark that is already in `sparks`.

## Change their Spark when they ask

You can write any of the member's documents. Do it when the member asks, for example "add a ski trip in January", "tick off the song", "move Big Bend to May" or "add a note to October".

- A write replaces the whole document. Read it first, change only what they asked for, keep everything else exactly as it was (ids too), and write it back.
- To add a spark, append `{ id, k, t, m, from: "ai" }` to `sparks.items`. To tick one off, set `done` to the current time in milliseconds and set `m` to this month. To undo, remove `done`.
- To add a note to a month, append `{ id, k: "note", text, at }` (400 characters at most) to `m/YYYY-MM` and set `months.m["YYYY-MM"].n` to the new number of items. Create the documents if the month has none.
- Never remove a photo, a video or a month unless the member asks for exactly that.
- Tell the member what you changed. They see it when they come back to Spark.

## Keep them on track

When the member asks how they are doing, tell them the sparks still open for this month, how many days the month has left, and one small next step. Sparks from earlier months that are not done carry over to this month.

## Rules

- A Spark is private. Never put a member's months, notes or sparks in a post, reply, quote or any other place unless they ask you to.
- Speak plainly about time. Don't frighten or pressure the member about the months they have left.
- Sharing a month is the member's act: they press Share in Spark, choose the photos and accept the post. A shared month is a regular post. Build an artifact for a/spark only when the member asks for something new, such as a different way to see their months.
