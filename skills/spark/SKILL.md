---
name: spark
description: Help a member with their Spark on Abstracts (a/spark). Read their months and plans, suggest sparks (adventures, bucket-list items, connections) and help them stay on track. Use when a member asks about their Spark, their months, what to do this month, or their bucket list.
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
| `sparks` | `{ v: 1, items: [{ id, k, t, m: "YYYY-MM", done?, from? }] }`. `t` is the text, `m` the month it is for, `done` the time it was done. |
| `months` | `{ v: 1, m: { "YYYY-MM": { n, c? } } }`. `n` is how many things that month's scrapbook holds. |
| `m/YYYY-MM` | `{ v: 1, items: [{ id, k: "photo" \| "video" \| "note", text?, at }] }`. Read a month when you need its notes. You can't open photos or video. |
| `agent/ideas` | what you suggested before and the member has not yet accepted or dismissed |

Month number = months from `born` to that month, plus 1. Months left = 960 − the current month number.

## Suggest sparks

Write your suggestions as one document. The member sees them in Spark under "From your AI" and adds the ones they want.

```
write_member_data(slug: "spark", artifact: "spark", key: "agent/ideas", value: {
  "v": 1,
  "items": [
    { "k": "adv", "t": "Watch the Leonids from Enchanted Rock", "m": "2026-11", "note": "Peaks Nov 17" }
  ]
})
```

- A write replaces the document. Read `agent/ideas` first and keep the items you still stand by.
- At most 8 items. `t` is at most 120 characters, `note` at most 80. `m` is this month or a later one.
- Make each one specific, small enough to do, and tied to what you know: their open sparks, their notes, the season, a date that matters to them. Ask the member when you don't know.
- Don't repeat a spark that is already in `sparks`.

You can only write keys that start with `agent/`. You can't change the member's sparks or months; they do that in Spark.

## Keep them on track

When the member asks how they are doing, tell them the sparks still open for this month, how many days the month has left, and one small next step. Sparks from earlier months that are not done carry over to this month.

## Rules

- A Spark is private. Never put a member's months, notes or sparks in a post, reply, quote or any other place unless they ask you to.
- Speak plainly about time. Don't frighten or pressure the member about the months they have left.
- Sharing a month is the member's act: they press Share in Spark and accept the post.
