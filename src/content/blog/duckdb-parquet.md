---
title: Merge Parquet with DuckDB
description: Easily merge multiple Parquet files with DuckDB.
date: 2025-04-07
---

The New York City Taxi and Limousine Commission publishes
[trip record data](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
in Parquet format. This data is partitioned by month, with one file for each
month. After downloading the yellow cab trip data for 2024, I have 12 files
between 48 and 63 MB in size, totaling 666 MB.

```bash
du -h * && du -h
```

```
 49M    yellow_tripdata_2024-01.parquet
 48M    yellow_tripdata_2024-02.parquet
 58M    yellow_tripdata_2024-03.parquet
 56M    yellow_tripdata_2024-04.parquet
 60M    yellow_tripdata_2024-05.parquet
 57M    yellow_tripdata_2024-06.parquet
 51M    yellow_tripdata_2024-07.parquet
 49M    yellow_tripdata_2024-08.parquet
 58M    yellow_tripdata_2024-09.parquet
 62M    yellow_tripdata_2024-10.parquet
 59M    yellow_tripdata_2024-11.parquet
 59M    yellow_tripdata_2024-12.parquet
666M    .
```

These files can be read together using [DuckDB](https://duckdb.org/), making
analysis across months a breeze. We'll start by previewing the first five rows
to get a feel for the dataset.

```sql
SELECT * FROM '*.parquet' LIMIT 5;
```

```
┌──────────┬──────────────────────┬───────────────────────┬─────────────────┬───────────────┬────────────┬────────────────────┬──────────────┬──────────────┬──────────────┬─────────────┬────────┬─────────┬────────────┬──────────────┬───────────────────────┬──────────────┬──────────────────────┬─────────────┐
│ VendorID │ tpep_pickup_datetime │ tpep_dropoff_datetime │ passenger_count │ trip_distance │ RatecodeID │ store_and_fwd_flag │ PULocationID │ DOLocationID │ payment_type │ fare_amount │ extra  │ mta_tax │ tip_amount │ tolls_amount │ improvement_surcharge │ total_amount │ congestion_surcharge │ Airport_fee │
│  int32   │      timestamp       │       timestamp       │      int64      │    double     │   int64    │      varchar       │    int32     │    int32     │    int64     │   double    │ double │ double  │   double   │    double    │        double         │    double    │        double        │   double    │
├──────────┼──────────────────────┼───────────────────────┼─────────────────┼───────────────┼────────────┼────────────────────┼──────────────┼──────────────┼──────────────┼─────────────┼────────┼─────────┼────────────┼──────────────┼───────────────────────┼──────────────┼──────────────────────┼─────────────┤
│        2 │ 2024-01-01 00:57:55  │ 2024-01-01 01:17:43   │               1 │          1.72 │          1 │ N                  │          186 │           79 │            2 │        17.7 │    1.0 │     0.5 │        0.0 │          0.0 │                   1.0 │         22.7 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:03:00  │ 2024-01-01 00:09:36   │               1 │           1.8 │          1 │ N                  │          140 │          236 │            1 │        10.0 │    3.5 │     0.5 │       3.75 │          0.0 │                   1.0 │        18.75 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:17:06  │ 2024-01-01 00:35:01   │               1 │           4.7 │          1 │ N                  │          236 │           79 │            1 │        23.3 │    3.5 │     0.5 │        3.0 │          0.0 │                   1.0 │         31.3 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:36:38  │ 2024-01-01 00:44:56   │               1 │           1.4 │          1 │ N                  │           79 │          211 │            1 │        10.0 │    3.5 │     0.5 │        2.0 │          0.0 │                   1.0 │         17.0 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:46:51  │ 2024-01-01 00:52:57   │               1 │           0.8 │          1 │ N                  │          211 │          148 │            1 │         7.9 │    3.5 │     0.5 │        3.2 │          0.0 │                   1.0 │         16.1 │                  2.5 │         0.0 │
└──────────┴──────────────────────┴───────────────────────┴─────────────────┴───────────────┴────────────┴────────────────────┴──────────────┴──────────────┴──────────────┴─────────────┴────────┴─────────┴────────────┴──────────────┴───────────────────────┴──────────────┴──────────────────────┴─────────────┘
```

Note that all files matching the provided
[glob pattern](https://en.wikipedia.org/wiki/Glob_(programming)) are read. Since
I've downloaded all the files to a standalone directory, `'*.parquet'` is
sufficient.

Now let's compute aggregates with DuckDB's `SUMMARIZE` statement. This is
similar to the `DataFrame.describe()` method from pandas.

```sql
SUMMARIZE SELECT * FROM '*.parquet';
```

```
┌───────────────────────┬─────────────┬─────────────────────┬─────────────────────┬───────────────┬─────────────────────┬─────────────────────┬────────────────────────────┬────────────────────────────┬────────────────────────────┬──────────┬─────────────────┐
│      column_name      │ column_type │         min         │         max         │ approx_unique │         avg         │         std         │            q25             │            q50             │            q75             │  count   │ null_percentage │
│        varchar        │   varchar   │       varchar       │       varchar       │     int64     │       varchar       │       varchar       │          varchar           │          varchar           │          varchar           │  int64   │  decimal(9,2)   │
├───────────────────────┼─────────────┼─────────────────────┼─────────────────────┼───────────────┼─────────────────────┼─────────────────────┼────────────────────────────┼────────────────────────────┼────────────────────────────┼──────────┼─────────────────┤
│ VendorID              │ INTEGER     │ 1                   │ 7                   │             4 │ 1.764232256133877   │ 0.42585681368977807 │ 2                          │ 2                          │ 2                          │ 41169720 │            0.00 │
│ tpep_pickup_datetime  │ TIMESTAMP   │ 2002-12-31 16:46:07 │ 2026-06-26 23:53:12 │      27500086 │ NULL                │ NULL                │ 2024-04-06 23:45:22.742735 │ 2024-07-04 20:58:14.034596 │ 2024-10-08 13:47:24.047136 │ 41169720 │            0.00 │
│ tpep_dropoff_datetime │ TIMESTAMP   │ 2002-12-31 17:24:07 │ 2026-06-27 20:59:10 │      26119874 │ NULL                │ NULL                │ 2024-04-07 12:51:08.420646 │ 2024-07-04 11:47:46.701477 │ 2024-10-08 08:05:33.765742 │ 41169720 │            0.00 │
│ passenger_count       │ BIGINT      │ 0                   │ 9                   │            11 │ 1.3339306338489314  │ 0.8158242156146571  │ 1                          │ 1                          │ 1                          │ 41169720 │            9.94 │
│ trip_distance         │ DOUBLE      │ 0.0                 │ 398608.62           │          8467 │ 4.976100785237721   │ 419.2304973495291   │ 1.018286605490491          │ 1.7550865518497976         │ 3.3613408753475884         │ 41169720 │            0.00 │
│ RatecodeID            │ BIGINT      │ 1                   │ 99                  │             7 │ 2.3221499754790433  │ 10.928049128923975  │ 1                          │ 1                          │ 1                          │ 41169720 │            9.94 │
│ store_and_fwd_flag    │ VARCHAR     │ N                   │ Y                   │             2 │ NULL                │ NULL                │ NULL                       │ NULL                       │ NULL                       │ 41169720 │            9.94 │
│ PULocationID          │ INTEGER     │ 1                   │ 265                 │           298 │ 164.24278644596077  │ 64.34068933213638   │ 132                        │ 161                        │ 233                        │ 41169720 │            0.00 │
│ DOLocationID          │ INTEGER     │ 1                   │ 265                 │           298 │ 163.4474527881171   │ 69.60008984472941   │ 113                        │ 162                        │ 234                        │ 41169720 │            0.00 │
│ payment_type          │ BIGINT      │ 0                   │ 5                   │             6 │ 1.107259412986049   │ 0.6515108441939662  │ 1                          │ 1                          │ 1                          │ 41169720 │            0.00 │
│ fare_amount           │ DOUBLE      │ -2261.2             │ 335544.44           │         19284 │ 19.26850972995234   │ 76.71984026978659   │ 9.29997093117226           │ 13.722870199322399         │ 22.411534140934563         │ 41169720 │            0.00 │
│ extra                 │ DOUBLE      │ -9.25               │ 65.99               │           145 │ 1.3859530689059825  │ 1.8158781232411167  │ 0.0                        │ 1.0                        │ 2.5                        │ 41169720 │            0.00 │
│ mta_tax               │ DOUBLE      │ -0.5                │ 41.3                │            27 │ 0.4797774084934267  │ 0.13018302651337385 │ 0.5                        │ 0.5                        │ 0.5                        │ 41169720 │            0.00 │
│ tip_amount            │ DOUBLE      │ -300.0              │ 999.99              │          6720 │ 3.307884018644796   │ 4.090523062522761   │ 0.0                        │ 2.6089639073989392         │ 4.241285277890167          │ 41169720 │            0.00 │
│ tolls_amount          │ DOUBLE      │ -140.63             │ 1702.88             │          3569 │ 0.5615266120309976  │ 2.2405452034369095  │ 0.0                        │ 0.0                        │ 0.0                        │ 41169720 │            0.00 │
│ improvement_surcharge │ DOUBLE      │ -1.0                │ 2.0                 │             7 │ 0.9629933771713691  │ 0.25505544624049337 │ 1.0                        │ 1.0                        │ 1.0                        │ 41169720 │            0.00 │
│ total_amount          │ DOUBLE      │ -2265.45            │ 335550.94           │         42764 │ 27.832813186895866  │ 78.05358621902562   │ 15.76365529079539          │ 20.989215331284594         │ 30.534811351688486         │ 41169720 │            0.00 │
│ congestion_surcharge  │ DOUBLE      │ -2.5                │ 2.52                │             9 │ 2.23214426300231    │ 0.874652826928968   │ 2.5                        │ 2.5                        │ 2.5                        │ 41169720 │            9.94 │
│ Airport_fee           │ DOUBLE      │ -1.75               │ 1.75                │             4 │ 0.14700596070691987 │ 0.5020406813511875  │ 0.0                        │ 0.0                        │ 0.0                        │ 41169720 │            9.94 │
├───────────────────────┴─────────────┴─────────────────────┴─────────────────────┴───────────────┴─────────────────────┴─────────────────────┴────────────────────────────┴────────────────────────────┴────────────────────────────┴──────────┴─────────────────┤
│ 19 rows                                                                                                                                                                                                                                              12 columns │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

How cool is that!? With just a simple SQL query we've computed a variety of
aggregates for 19 columns and 41 million rows stored across 12 files.

What if we want to know which file each row is from? Using the `read_parquet`
function with `filename` parameter set to `true`, a column is added specifying
the source file for each row.

```sql
SELECT
  filename,
  count(*) AS row_count
FROM read_parquet('*.parquet', filename = true)
GROUP BY filename
ORDER BY row_count DESC;
```

```
┌─────────────────────────────────┬───────────┐
│            filename             │ row_count │
│             varchar             │   int64   │
├─────────────────────────────────┼───────────┤
│ yellow_tripdata_2024-10.parquet │   3833771 │
│ yellow_tripdata_2024-05.parquet │   3723833 │
│ yellow_tripdata_2024-12.parquet │   3668371 │
│ yellow_tripdata_2024-11.parquet │   3646369 │
│ yellow_tripdata_2024-09.parquet │   3633030 │
│ yellow_tripdata_2024-03.parquet │   3582628 │
│ yellow_tripdata_2024-06.parquet │   3539193 │
│ yellow_tripdata_2024-04.parquet │   3514289 │
│ yellow_tripdata_2024-07.parquet │   3076903 │
│ yellow_tripdata_2024-02.parquet │   3007526 │
│ yellow_tripdata_2024-08.parquet │   2979183 │
│ yellow_tripdata_2024-01.parquet │   2964624 │
├─────────────────────────────────┴───────────┤
│ 12 rows                           2 columns │
└─────────────────────────────────────────────┘
```

Finally, if desired, the `COPY` statement can be used to write the data to a
single Parquet file.

```sql
COPY (SELECT * FROM '*.parquet')
TO 'yellow_tripdata_2024.parquet'
(FORMAT 'parquet', COMPRESSION zstd);
```

Specifyting the compression algorithm is optional. Snappy is used by default.

We now have a single file with all trip data for 2024.

```bash
du -h yellow_tripdata_2024.parquet
```

```
688M    yellow_tripdata_2024.parquet
```
