---
layout: home
title: Cariochi Projects
---

> ## Cariochi Projects
> Welcome to the documentation hub for **Cariochi** libraries and tools. Each project is designed to simplify development and testing by providing expressive, declarative, and maintainable APIs.

### Projects

**[Reflecto](/reflecto)** 🟢 Open source  
  A reflection utility that makes Java reflection **simple and fluent**. Includes a unified `perform(...)` API, powerful `Types` utilities, and rich object/type inspection.

---

**[Objecto](/objecto)** 🟢 Open source  
  A random object generator for tests. Supports **factory interfaces**, Faker integration, modifiers, references, reproducibility via seeds, and post-processing.

---

**[Recordo](/recordo)** 🟢 Open source  
  A JUnit 5 extension that streamlines testing with **recorded fixtures**. Provides modules for reading data, JSON/CSV assertions, MockMvc clients, and HTTP traffic replay.
  
  Modules:
  - [Read](/recordo#read-module) – load JSON, CSV, or ZIP resources into tests with `@Read`. Missing files are generated automatically.
  - [Assertions](/recordo#assertions-module) – assert JSON or CSV outputs against expected files with rich comparison options.
  - [MockMvc](/recordo#mockmvc-module) – generate type-safe clients for Spring MockMvc tests, making controller calls look like regular Java methods.
  - [MockServer](/recordo#mockserver-module) – record and replay HTTP interactions from OkHttp, RestTemplate, and other clients.

---

**[Spring Data Web Spec](/spring-data-web-spec)** 🟢 Open source  
  Annotation-driven mapping from web requests to **Spring Data JPA Specifications**. Simplifies controllers, adds type-safe filtering, and supports access control.

---

**[Expresso](/expresso)**  
  Extended regular expressions with **object-oriented patterns** and hierarchical results. Build structured parsers or use regex with added clarity and reusability.

