---
title: Memoization in Python 3
description: A guide to using memoization in Python 3.
date: 2021-05-24
---

[Memoization](https://en.wikipedia.org/wiki/Memoization) is an optimization
technique that speeds up programs by
[caching](<https://en.wikipedia.org/wiki/Cache_(computing)>) the results of
previous function calls. This allows subsequent calls to reuse the cached
results, avoiding time-consuming recalculation. Memoization is commonly used in
[dynamic programming](https://en.wikipedia.org/wiki/Dynamic_programming), where
problems can be broken down into simpler sub-problems. One such dynamic
programming problem is calculating the nth Fibonacci number.

The [Fibonacci numbers](https://en.wikipedia.org/wiki/Fibonacci_number) are a
sequence of integers where each number is the sum of the two preceding numbers,
starting with the numbers 0 and 1. A function that calculates the nth Fibonacci
number is often implemented
[recursively](<https://en.wikipedia.org/wiki/Recursion_(computer_science)>).

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

The function calls of `fibonacci(4)` can be visualized with a recursion tree.

<img src="/fibonacci_without_cache.svg" alt="fibonacci without cache" />

Notice that the function is called with the same input multiple times.
Particularly, `fibonacci(2)` is calculated from scratch twice. As the input
increases, the running time grows exponentially. This is suboptimal and can be
improved significantly using memoization.

Python 3 makes it incredibly easy to memorize functions. The
[functools](https://docs.python.org/3/library/functools.html) module included in
Python's standard library provides two useful
[decorators](https://docs.python.org/3/glossary.html#term-decorator) for
memoization:
[`lru_cache`](https://docs.python.org/3/library/functools.html#functools.lru_cache)
(new in Python 3.2) and
[`cache`](https://docs.python.org/3/library/functools.html#functools.cache) (new
in Python 3.9). These decorators use a
[least recently used (LRU)](<https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_(LRU)>)
cache, which stores items in order of use, discarding the least recently used
items to make room for new items.

To avoid costly repeated function calls, `fibonacci` can be wrapped by
`lru_cache`, which saves and returns values that have already been calculated.
The size limit of `lru_cache` can be specified with `maxsize`, which has a
default value of 128.

```python
from functools import lru_cache

@lru_cache(maxsize=64)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

The newer `cache` decorator is equivalent to `lru_cache(maxsize=None)`.

```python
from functools import cache

@cache
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

Since it does not need to discard least recently used items, `cache` is both
smaller and faster than `lru_cache` with a size limit.

With memoization implemented, the recursion tree for `fibonacci(4)` does not
have any nodes that occur more than twice. The running time now grows linearly,
which is much faster than the previous exponential growth.

<img src="/fibonacci_with_cache.svg" alt="fibonacci with cache" />

On my 2020 M1 MacBook Air, running `fibonacci(40)` without memoization takes
18.158 seconds. With the `cache` decorator added it takes only 0.039 seconds.
