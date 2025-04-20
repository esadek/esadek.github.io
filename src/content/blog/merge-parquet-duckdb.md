---
title: Merge Parquet with DuckDB
description: Easily merge multiple Parquet files with DuckDB.
date: 2025-04-19
---

I'll often have a large collection of [Parquet](https://parquet.apache.org/)
files that I'd like to merge into a single file. For example, when loading
clickstream data into a data warehouse, I'd rather have a single Parquet file
for each 24-hour period than separate files for each 30-minute period.

The solution: [DuckDB](https://duckdb.org/). If you're not already familiar,
DuckDB is a high-performance, in-process, analytical database management system.
Important for this particular use case, DuckDB supports reading one or more
Parquet files and writing Parquet files. DuckDB also supports reading from and
writing to Amazon S3, and has a Python API allowing it to be run in AWS Lambda
functions. I won't cover AWS integration in this post, but if you're interested,
check out DuckDB's
[S3 API](https://duckdb.org/docs/stable/extensions/httpfs/s3api) and
[Python API](https://duckdb.org/docs/stable/clients/python/overview)
documentation.

The first step is reading all Parquet files for a given day. All files matching
the provided [glob pattern](https://en.wikipedia.org/wiki/Glob_(programming))
are read.

```sql
SELECT * FROM '20250312*.parquet';
```

```
┌─────────────────────┬─────────────────┬────────────┬──────────────────────────────────────┬──────────────────────────────────────┐
│      timestamp      │   event_name    │    path    │             anonymous_id             │               event_id               │
│      timestamp      │     varchar     │  varchar   │               varchar                │               varchar                │
├─────────────────────┼─────────────────┼────────────┼──────────────────────────────────────┼──────────────────────────────────────┤
│ 2025-03-12 10:03:54 │ page_viewed     │ /          │ fa52e635-fbcd-4762-87a9-1328f7957d9a │ a3ca83d2-ab5f-4191-8870-9f5cdc5f5b02 │
│ 2025-03-12 10:04:23 │ page_viewed     │ /pricing   │ fa52e635-fbcd-4762-87a9-1328f7957d9a │ 7d0f9ee0-a84a-4398-9e82-8542fdc33a4a │
│ 2025-03-12 10:21:47 │ page_viewed     │ /          │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ 14c90dcb-5626-4da2-b6b8-106692930f23 │
│ 2025-03-12 10:22:15 │ page_viewed     │ /sign-up   │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ 14df3967-6b79-4ebc-9b74-5185d910d52a │
│ 2025-03-12 10:22:34 │ account_created │ /sign-up   │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ 3f6605fb-b360-4aad-8333-65eef31a1fc2 │
│ 2025-03-12 10:22:39 │ page_viewed     │ /dashboard │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ c105a3af-c506-48ab-a39c-91e0c1f22ac4 │
│ 2025-03-12 10:41:22 │ page_viewed     │ /          │ 47992bff-fe8a-4462-b9d3-a4402329bda8 │ 210abaa8-ab6d-4c6b-bda9-e9af97d8250b │
│ 2025-03-12 10:41:56 │ page_viewed     │ /blog      │ 47992bff-fe8a-4462-b9d3-a4402329bda8 │ 11b44944-3345-4eef-bd69-f336ef17d717 │
│ 2025-03-12 10:52:13 │ page_viewed     │ /          │ 85e6160b-ae56-48ff-8ce2-d3d2cc551a43 │ 574ca23f-7ee0-4823-af54-e5a043b5755a │
└─────────────────────┴─────────────────┴────────────┴──────────────────────────────────────┴──────────────────────────────────────┘
```

We can see which file each row is from using the `read_parquet` function's
`filename` parameter. This adds a column specifying the source file for each
row.

```sql
SELECT * FROM read_parquet('20250312*.parquet', filename = true)
```

```
┌─────────────────────┬─────────────────┬────────────┬──────────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│      timestamp      │   event_name    │    path    │             anonymous_id             │               event_id               │         filename         │
│      timestamp      │     varchar     │  varchar   │               varchar                │               varchar                │         varchar          │
├─────────────────────┼─────────────────┼────────────┼──────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ 2025-03-12 10:03:54 │ page_viewed     │ /          │ fa52e635-fbcd-4762-87a9-1328f7957d9a │ a3ca83d2-ab5f-4191-8870-9f5cdc5f5b02 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:04:23 │ page_viewed     │ /pricing   │ fa52e635-fbcd-4762-87a9-1328f7957d9a │ 7d0f9ee0-a84a-4398-9e82-8542fdc33a4a │ 20250312T100000Z.parquet │
│ 2025-03-12 10:21:47 │ page_viewed     │ /          │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ 14c90dcb-5626-4da2-b6b8-106692930f23 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:22:15 │ page_viewed     │ /sign-up   │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ 14df3967-6b79-4ebc-9b74-5185d910d52a │ 20250312T100000Z.parquet │
│ 2025-03-12 10:22:34 │ account_created │ /sign-up   │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ 3f6605fb-b360-4aad-8333-65eef31a1fc2 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:22:39 │ page_viewed     │ /dashboard │ 6279b95a-9040-4e2b-81da-fbb0b04e3109 │ c105a3af-c506-48ab-a39c-91e0c1f22ac4 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:41:22 │ page_viewed     │ /          │ 47992bff-fe8a-4462-b9d3-a4402329bda8 │ 210abaa8-ab6d-4c6b-bda9-e9af97d8250b │ 20250312T103000Z.parquet │
│ 2025-03-12 10:41:56 │ page_viewed     │ /blog      │ 47992bff-fe8a-4462-b9d3-a4402329bda8 │ 11b44944-3345-4eef-bd69-f336ef17d717 │ 20250312T103000Z.parquet │
│ 2025-03-12 10:52:13 │ page_viewed     │ /          │ 85e6160b-ae56-48ff-8ce2-d3d2cc551a43 │ 574ca23f-7ee0-4823-af54-e5a043b5755a │ 20250312T103000Z.parquet │
└─────────────────────┴─────────────────┴────────────┴──────────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┘
```

Note: Another helpful `read_parquet` parameter is `union_by_name`, which unifies
the columns of multiple schemas by name instead of position. This is useful when
the files you're reading have differing schemas.

Before writing to a file, we can perform any aggregations, enrichment, hashing,
renaming, etc.

```sql
SELECT
  timestamp,
  event_name,
  path,
  md5(anonymous_id) AS anonymous_id_hash,
  event_id,
  filename AS source_file
FROM read_parquet('20250312*.parquet', filename = true);
```

```
┌─────────────────────┬─────────────────┬────────────┬──────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│      timestamp      │   event_name    │    path    │        anonymous_id_hash         │               event_id               │       source_file        │
│      timestamp      │     varchar     │  varchar   │             varchar              │               varchar                │         varchar          │
├─────────────────────┼─────────────────┼────────────┼──────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ 2025-03-12 10:03:54 │ page_viewed     │ /          │ d3d313733f682d4f64090141db5ba2b2 │ a3ca83d2-ab5f-4191-8870-9f5cdc5f5b02 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:04:23 │ page_viewed     │ /pricing   │ d3d313733f682d4f64090141db5ba2b2 │ 7d0f9ee0-a84a-4398-9e82-8542fdc33a4a │ 20250312T100000Z.parquet │
│ 2025-03-12 10:21:47 │ page_viewed     │ /          │ 3182ef98ef4c14163950fd8d3210221f │ 14c90dcb-5626-4da2-b6b8-106692930f23 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:22:15 │ page_viewed     │ /sign-up   │ 3182ef98ef4c14163950fd8d3210221f │ 14df3967-6b79-4ebc-9b74-5185d910d52a │ 20250312T100000Z.parquet │
│ 2025-03-12 10:22:34 │ account_created │ /sign-up   │ 3182ef98ef4c14163950fd8d3210221f │ 3f6605fb-b360-4aad-8333-65eef31a1fc2 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:22:39 │ page_viewed     │ /dashboard │ 3182ef98ef4c14163950fd8d3210221f │ c105a3af-c506-48ab-a39c-91e0c1f22ac4 │ 20250312T100000Z.parquet │
│ 2025-03-12 10:41:22 │ page_viewed     │ /          │ 63be933ec60dcc5499ff08917c7315ab │ 210abaa8-ab6d-4c6b-bda9-e9af97d8250b │ 20250312T103000Z.parquet │
│ 2025-03-12 10:41:56 │ page_viewed     │ /blog      │ 63be933ec60dcc5499ff08917c7315ab │ 11b44944-3345-4eef-bd69-f336ef17d717 │ 20250312T103000Z.parquet │
│ 2025-03-12 10:52:13 │ page_viewed     │ /          │ 35478a22b5c9b2b8e90ce161b3f3eab2 │ 574ca23f-7ee0-4823-af54-e5a043b5755a │ 20250312T103000Z.parquet │
└─────────────────────┴─────────────────┴────────────┴──────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┘
```

Finally, let's write the data to a single file using the `COPY` statement.

```sql
COPY (SELECT * FROM '20250312*.parquet')
TO '2025-03-12.parquet'
(FORMAT 'parquet');
```

[Snappy](https://en.wikipedia.org/wiki/Snappy_(compression)) compression is used
by default. A different compression algorithm such as
[Zstandard](https://en.wikipedia.org/wiki/Zstd) can be specified if desired.

```sql
COPY (SELECT * FROM '20250312*.parquet')
TO '2025-03-12.parquet'
(FORMAT 'parquet', COMPRESSION zstd);
```

With hashing and renaming shown earlier, the full statement would look like this.

```sql
COPY (
  SELECT
    timestamp,
    event_name,
    path,
    md5(anonymous_id) AS anonymous_id_hash,
    event_id,
    filename AS source_file
  FROM read_parquet('20250312*.parquet', filename = true)
)
TO '2025-03-12.parquet'
(FORMAT 'parquet', COMPRESSION zstd);
```

That's it! We've read multiple Parquet files, hashed a column, added and renamed
a column, then wrote the result to a single Parquet file with zstd compression,
using just a single SQL query in DuckDB.
