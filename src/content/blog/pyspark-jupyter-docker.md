---
title: PySpark and Jupyter in Docker
description: A guide to running PySpark and Jupyter in a Docker container.
date: 2025-06-10
---

When getting started with
[PySpark](https://spark.apache.org/docs/latest/api/python/index.html), it can be
difficult just to get up and running. You create a fresh Python virtual
environment and `pip install pyspark` as you would with any other Python
package, but then you encounter errors relating to Java version incompatability,
environment variable misconfiguration, Py4J dependencies, etc.

Thankfully, the Jupyter team have created
[Jupyter Docker Stacks](https://jupyter-docker-stacks.readthedocs.io/en/latest/),
a set of ready-to-run Docker images containing Jupyter applications and
interactive computing tools. Their
[`jupyter/pyspark-notebook`](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-pyspark-notebook)
image comes packed with Spark, JupyterLab, and many popular packages from the
scientific Python ecosystem (pandas, matplotlib, scikit-learn, etc).

To use the image, make sure you have Docker running on your machine and run the
following command:

```bash
docker run -p 8888:8888 quay.io/jupyter/pyspark-notebook:latest
```

Docker will pull the image which may take a minute or two. Once complete, a
container will be started up with a Jupyter server running. In the terminal
output you should see a `localhost:8888/lab` URL with a `token` query string.

```
Jupyter Server 2.16.0 is running at:
http://localhost:8888/lab?token=8110043283b6474e06d8f22cf1f78e2b79a61804552c0620
```

Open the URL in your browser to access JupyterLab. You can then open a new
Python 3 notebook, import PySpark, and write all the Spark code your heart
desires.

```python
from datetime import date
from pyspark.sql import Row, SparkSession

spark = SparkSession.builder.getOrCreate()

df = spark.createDataFrame([
    Row(id=1, name="Tom", birthday=date(1998, 4, 7)),
    Row(id=2, name="Alice", birthday=date(2002, 10, 22)),
    Row(id=4, name="Brett", birthday=date(1973, 8, 16))
])

df.show()
```

If you prefer using a dev container, I've created a minimal
[repo](https://github.com/esadek/pyspark-dev-container) that you can try out.
