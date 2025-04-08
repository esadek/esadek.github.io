---
title: Merge Parquet with DuckDB
description: Easily merge multiple Parquet files with DuckDB.
date: 2025-04-07
---

The popular [NYC taxi trip data](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page) is divided into one Parquet file for each month.
Using DuckDB, we can easily read multiple files at once.

Running the `du` (disk usage) command we can see that each file is between 48 and 63 MB in size, totaling 666 MB.

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

```sql
SELECT count(*)
FROM '*.parquet';
```

```
┌─────────────────┐
│  count_star()   │
│      int64      │
├─────────────────┤
│    41169720     │
│ (41.17 million) │
└─────────────────┘
```

```sql
SELECT *
FROM '*.parquet'
LIMIT 5;
```

```
┌──────────┬──────────────────────┬──────────────────────┬─────────────────┬───┬──────────────┬──────────────────────┬──────────────┬──────────────────────┬─────────────┐
│ VendorID │ tpep_pickup_datetime │ tpep_dropoff_datet…  │ passenger_count │ … │ tolls_amount │ improvement_surcha…  │ total_amount │ congestion_surcharge │ Airport_fee │
│  int32   │      timestamp       │      timestamp       │      int64      │   │    double    │        double        │    double    │        double        │   double    │
├──────────┼──────────────────────┼──────────────────────┼─────────────────┼───┼──────────────┼──────────────────────┼──────────────┼──────────────────────┼─────────────┤
│        2 │ 2024-01-01 00:57:55  │ 2024-01-01 01:17:43  │               1 │ … │          0.0 │                  1.0 │         22.7 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:03:00  │ 2024-01-01 00:09:36  │               1 │ … │          0.0 │                  1.0 │        18.75 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:17:06  │ 2024-01-01 00:35:01  │               1 │ … │          0.0 │                  1.0 │         31.3 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:36:38  │ 2024-01-01 00:44:56  │               1 │ … │          0.0 │                  1.0 │         17.0 │                  2.5 │         0.0 │
│        1 │ 2024-01-01 00:46:51  │ 2024-01-01 00:52:57  │               1 │ … │          0.0 │                  1.0 │         16.1 │                  2.5 │         0.0 │
├──────────┴──────────────────────┴──────────────────────┴─────────────────┴───┴──────────────┴──────────────────────┴──────────────┴──────────────────────┴─────────────┤
│ 5 rows                                                                                                                                            19 columns (9 shown) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Using the `read_parquet` function's  `filename` parameter, we can get the row count for each file.

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

Merge the data into a single Parquet file with Zstandard (zstd) compression instead of the default Snappy compression.

```sql
COPY (
  SELECT *
  FROM '*.parquet'
)
TO 'yellow_tripdata_2024.parquet'
(FORMAT 'parquet', COMPRESSION zstd);
```

```bash
du -h yellow_tripdata_2024.parquet
```

```
688M    yellow_tripdata_2024.parquet
```
