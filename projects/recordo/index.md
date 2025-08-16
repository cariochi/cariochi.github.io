# Overview

**Recordo** is a **JUnit 5
** extension that simplifies testing and json resource handling by implementing common functionality in a declarative manner. It can record or generate json files if they are absent, ensuring fast, deterministic, and accurate tests.
---
title: RECORDO
---

## Concept

The **Recordo** extension is designed to move certain test resources like DTOs, mocked or expected objects, mocked REST requests, and responses to files. This approach is
similar to how we use the annotation `@Sql` to prepare DB data with an SQL script.

You don't need to manually create these files. They will be generated on the first test run.

The most common scenario for test creation is as follows:&#x20;

1. You create a test and run it for the first time. This will generate JSON or CSV files, but the test will fail.&#x20;
2. Then, you need to examine and modify the files as needed.&#x20;
3. Finally, you run the test for the second time, and it should pass.

In case you have multiple test parameters provided by the **Recordo** extension, you may require multiple test preparation runs.

## Modules

There are four modules in the **Recordo** extension that can be used together or separately.

[read.md](read.md)
[assertions.md](assertions.md)
[mockmvc.md](mockmvc.md)
[mockserver.md](mockserver.md)

## License

&#x20;**Recordo** library is licensed under the [Apache License, Version 2.0](https://github.com/cariochi/recordo/blob/master/LICENSE).
