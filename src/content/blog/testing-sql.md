---
title: Testing SQL with Python and SQLGlot
description: A guide to testing SQL with the SQLGlot Python library.
date: 2025-08-27
---

Testing production code is essential for ensuring correctness, but big data
pipelines are challenging to test because many query engines are closed-source
and cannot be run locally. What if you could test your SQL queries without
connecting to a cloud data platform?

[SQLGlot](https://github.com/tobymao/sqlglot) is a dependency-free SQL parser,
transpiler, optimizer, and engine written in Python. It supports 27 SQL
dialects, including Snowflake, BigQuery, Spark, Trino, DuckDB, and Postgres.
SQLGlot can interpret SQL queries using Python dictionaries to represent tables,
making it ideal for testing SQL. You can take a query written for an engine like
BigQuery and execute it against mock Python data locally or in a continuous
integration pipeline.

To get started, install SQLGlot (version 26.18+) in your Python environment:

```bash
pip install "sqlglot[rs]"
```

The `rs` extra adds a Rust-based tokenizer for improved performance.

Next, create a new Python file with the following code:

```python
from sqlglot.executor import execute

sql = "SELECT avg(price) AS average_price FROM items"
tables = {
    "items": [
        {"id": 1, "price": 1.0},
        {"id": 2, "price": 2.0},
    ]
}
expected_result = [{"average_price": 1.5}]
result = execute(sql, dialect="bigquery", tables=tables).to_pylist()
assert result == expected_result
```

The code is quite simple. It imports the `execute` function from SQLGlot, calls
the function with a SQL query, dialect, and table as arguments, converts the
resulting table to a list of rows/dictionaries (using the `to_pylist` method),
and then compares the result with the expected result.

Since it's just Python, tests can be run with a Python testing framework such as
[pytest](https://docs.pytest.org/en/stable/):

```python
from pytest import main
from sqlglot.executor import execute


def test_average_price():
    sql = "SELECT avg(price) AS average_price FROM items"
    tables = {
        "items": [
            {"id": 1, "price": 1.0},
            {"id": 2, "price": 2.0},
        ]
    }
    expected_result = [{"average_price": 1.5}]
    result = execute(sql, dialect="bigquery", tables=tables).to_pylist()
    assert result == expected_result


if __name__ == "__main__":
    main()
```

To make test cases concise and focused, define a base/default row that provides
values for all columns. For each test case, override only the relevant values
using [dictionary merging](https://peps.python.org/pep-0584/):

```python
default_item = {
    "id": 145,
    "sku": "CW2288-111",
    "name": "Nike Air Force 1 '07",
    "category": "Men's Shoes",
    "price": 115.00,
    "in_stock": True,
}

tables = {
    "items": [
        default_item | {"price": 104.99, "in_stock": True},
        default_item | {"price": 249.99, "in_stock": False},
    ]
}
```

The merge (`|`) operator merges the right operand (dictionary) with the left
operand (dictionary). If a key is present in both operands, the value from the
right operand wins.

Now you’re all set to test your SQL like a pro, no cloud required. Happy
querying!
