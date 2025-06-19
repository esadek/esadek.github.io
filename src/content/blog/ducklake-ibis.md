---
title: DuckLake with Ibis Python DataFrames
description: A guide to using Ibis Python dataframes with DuckLake.
date: 2025-06-02
---

[DuckLake](https://ducklake.select/) is a new integrated data lake and catalog
format from the [DuckDB](https://duckdb.org/) team. It uses a SQL database for
all catalog and table metadata, and stores data in
[Apache Parquet](https://parquet.apache.org/) files. Most users interact with
DuckLake using SQL, but for those who prefer dataframes there's
[Ibis](https://ibis-project.org/)—a portable Python dataframe library with
support for DuckDB as a backend. To get started using DuckLake with Ibis, follow
the steps below.

Create a new project with [uv](https://docs.astral.sh/uv/):

```bash
uv init --bare ducklake-ibis
cd ducklake-ibis
```

Install DuckDB, Ibis and [JupyterLab](https://jupyter.org/):

```bash
uv add "ibis-framework[duckdb,examples]" jupyterlab
```

Launch JupyterLab:

```bash
uv run jupyter lab
```

Open `localhost:8888` in your browser, create a new Python notebook, then
incrementally add and run the code below:

```python
import ibis
```

```python
ibis.options.interactive = True
```

```python
con = ibis.duckdb.connect(extensions="ducklake")
con.attach("ducklake:my_ducklake.ducklake")
```

```python
con.list_catalogs()
```

```
['__ducklake_metadata_my_ducklake', 'memory', 'my_ducklake', 'system', 'temp']
```

```python
con.raw_sql("USE my_ducklake")
```

```
<duckdb.duckdb.DuckDBPyConnection at 0x1068e1e30>
```

```python
con.create_table(
    "penguins",
    ibis.examples.penguins.fetch().to_pyarrow(),
    overwrite=True
)
```

```
DatabaseTable: my_ducklake.main.penguins
  species           string
  island            string
  bill_length_mm    float64
  bill_depth_mm     float64
  flipper_length_mm int64
  body_mass_g       int64
  sex               string
  year              int64
```

```python
con.list_tables()
```

```
['penguins']
```

```python
penguins = con.table("penguins")
penguins
```

```
┏━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━┳━━━━━━━┓
┃ species ┃ island    ┃ bill_length_mm ┃ bill_depth_mm ┃ flipper_length_mm ┃ body_mass_g ┃ sex    ┃ year  ┃
┡━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━╇━━━━━━━┩
│ string  │ string    │ float64        │ float64       │ int64             │ int64       │ string │ int64 │
├─────────┼───────────┼────────────────┼───────────────┼───────────────────┼─────────────┼────────┼───────┤
│ Adelie  │ Torgersen │           39.1 │          18.7 │               181 │        3750 │ male   │  2007 │
│ Adelie  │ Torgersen │           39.5 │          17.4 │               186 │        3800 │ female │  2007 │
│ Adelie  │ Torgersen │           40.3 │          18.0 │               195 │        3250 │ female │  2007 │
│ Adelie  │ Torgersen │           NULL │          NULL │              NULL │        NULL │ NULL   │  2007 │
│ Adelie  │ Torgersen │           36.7 │          19.3 │               193 │        3450 │ female │  2007 │
│ Adelie  │ Torgersen │           39.3 │          20.6 │               190 │        3650 │ male   │  2007 │
│ Adelie  │ Torgersen │           38.9 │          17.8 │               181 │        3625 │ female │  2007 │
│ Adelie  │ Torgersen │           39.2 │          19.6 │               195 │        4675 │ male   │  2007 │
│ Adelie  │ Torgersen │           34.1 │          18.1 │               193 │        3475 │ NULL   │  2007 │
│ Adelie  │ Torgersen │           42.0 │          20.2 │               190 │        4250 │ NULL   │  2007 │
│ …       │ …         │              … │             … │                 … │           … │ …      │     … │
└─────────┴───────────┴────────────────┴───────────────┴───────────────────┴─────────────┴────────┴───────┘
```

```python
penguins.group_by("species").count()
```

```
┏━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓
┃ species   ┃ CountStar(penguins) ┃
┡━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩
│ string    │ int64               │
├───────────┼─────────────────────┤
│ Gentoo    │                 124 │
│ Adelie    │                 152 │
│ Chinstrap │                  68 │
└───────────┴─────────────────────┘
```

```python
con.raw_sql("USE __ducklake_metadata_my_ducklake")
```

```
<duckdb.duckdb.DuckDBPyConnection at 0x1068e1e30>
```

```python
con.list_tables()
```

```
['ducklake_column',
 'ducklake_column_tag',
 'ducklake_data_file',
 'ducklake_delete_file',
 'ducklake_file_column_statistics',
 'ducklake_file_partition_value',
 'ducklake_files_scheduled_for_deletion',
 'ducklake_inlined_data_tables',
 'ducklake_metadata',
 'ducklake_partition_column',
 'ducklake_partition_info',
 'ducklake_schema',
 'ducklake_snapshot',
 'ducklake_snapshot_changes',
 'ducklake_table',
 'ducklake_table_column_stats',
 'ducklake_table_stats',
 'ducklake_tag',
 'ducklake_view']
```

```python
con.table("ducklake_table_column_stats")
```

```
┏━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━┓
┃ table_id ┃ column_id ┃ contains_null ┃ contains_nan ┃ min_value ┃ max_value ┃
┡━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━┩
│ int64    │ int64     │ boolean       │ boolean      │ string    │ string    │
├──────────┼───────────┼───────────────┼──────────────┼───────────┼───────────┤
│        1 │         1 │ False         │ NULL         │ Adelie    │ Gentoo    │
│        1 │         2 │ False         │ NULL         │ Biscoe    │ Torgersen │
│        1 │         3 │ True          │ False        │ 32.1      │ 59.6      │
│        1 │         4 │ True          │ False        │ 13.1      │ 21.5      │
│        1 │         5 │ True          │ NULL         │ 172       │ 231       │
│        1 │         6 │ True          │ NULL         │ 2700      │ 6300      │
│        1 │         7 │ True          │ NULL         │ female    │ male      │
│        1 │         8 │ False         │ NULL         │ 2007      │ 2009      │
└──────────┴───────────┴───────────────┴──────────────┴───────────┴───────────┘
```

```python
con.disconnect()
```
