---
title: EXPRESSO
---

# Introduction

> Extended regular expressions with **object-oriented** patterns and hierarchical results.

**Expresso** is a Java library that extends the familiar power of regular expressions with an **object-oriented layer**. It introduces the ability to define **named classes**, **nested structures**, and **reusable components**, while staying fully compatible with the mental model of traditional regex.

At its core, Expresso provides two things:

* A **Core API** that lets you compile and run extended regex patterns in the same spirit as `Pattern` and `Matcher`.
* A **YAML-based DSL** that allows you to declare patterns in a modular and maintainable way, with features such as `imports` and self-contained test cases.

## What Expresso is

* An **extension of regex**, not a replacement.
* A tool that can be used at different levels: from simple string matching to building complete parsers or even compiler front-ends.
* A way to keep complex patterns **organized, reusable, and understandable** by introducing OOP-style constructs.

## What Expresso is not

* It is **not** a fixed grammar or a pre-built parser for specific domains.
* The YAML templates and demo examples (logs, finance, math, HTML, SQL, code) are **illustrations only**. They show what you *can* build, but they are not shipped as a ruleset.

## Why it matters

Regular expressions are universal, but they flatten everything into numbered groups. When problems grow in complexity, patterns become unreadable and unmaintainable. Expresso addresses this by:

* Naming and structuring groups as **classes and subclasses**.
* Supporting **hierarchical nesting** that mirrors the logical structure of the input.
* Allowing **reuse** of patterns through imports and modular design.

## Positioning

You can think of Expresso as **regex with an OOP dimension**:

* Use it like plain regex when all you need is quick matching.
* Or scale up and use it as the foundation for parsers, analyzers, or compilers, where structured output is required.

# Installation & Setup

Expresso is a **tool** that can be packaged and delivered in different ways depending on integration needs. There is no single standard distribution at the moment.

## Distribution options

* **Java library** – integrate directly into Java projects by adding the JAR to your classpath or using private Maven/Gradle coordinates (when provided).
* **Docker image with REST API** – run Expresso as a service and access it from any language or platform over HTTP.
* **Other formats** – alternative packaging (standalone server, embedded component) can be arranged depending on project requirements.

> In short: Expresso provides the core functionality, and the delivery format is flexible.

## Live Demo

A fully functional **Live Demo** is available online: [expresso.cariochi.com](https://expresso.cariochi.com)

The demo allows you to explore Expresso immediately, try out example patterns, and view structured results without any installation.

# Quick Start

Expresso can run inside Java applications or be accessed remotely through a REST service. In Java, the API provides dedicated classes (`Matcher`, `Group`) that work much like the standard regex API but return structured objects instead of plain strings.

## Using the Core API

The API design resembles Java’s `Pattern`/`Matcher`, while extending it with structured results:

```java
// Define patterns as a YAML string
String patterns = """
        Number:
          Integer: [ '\\d+' ]
          Decimal: [ '${?Integer}\\.${?Integer}' ]
        Currency:
          USD: [ '\\$' ]
          EUR: [ '€' ]
          GBP: [ '£' ]
        Price: [ '${Currency}${Number}' ]
        Percent: [ '${Number}%' ]
        """;

// Compile pattern definitions (compile once, reuse for multiple inputs)
Matcher matcher = Expresso.compile(patterns).matcher(text);

// Collect hierarchical matches
List<Group> matches = matcher.results().toList();

// Navigate the tree of groups
Group first = matches.getFirst();
first.getChildren();   // access nested groups
first.collect();       // flatten subtree into a list

// Perform replacements using a function of the matched group
String out = matcher.replaceAll(g -> "<" + g.getValue() + ">");
```

Key points:

* `results()` provides a stream of `Group` objects, each representing a full match with nested structure.
* `replaceAll(Function<Group,String>)` enables programmatic text transformation.
* `Matcher` also exposes index‑based methods (`start(int)`, `end(int)`, `group(int)`, `groupName(int)`) for low‑level access.

## Using the REST service

When running as a service (for example via Docker):

* Patterns are first registered through the API or UI. They can import other patterns, allowing for a shared core library.
* After registration, a client sends input text together with the chosen pattern name/ID and the preferred output format:

    * **model** – hierarchical result with named classes and groups.
    * **raw** – flat matches with positions and values.
* The service applies the stored pattern configuration and returns the structured JSON result.

# Core Concepts

Expresso brings an **object‑oriented layer** to regular expressions. Instead of flat, numbered groups, you define **classes** with a hierarchical structure and compose them into larger patterns. The result is a tree of matches that reflects this hierarchy.

## Classes and Hierarchy

* A **class** is a named unit that describes a piece of text, such as `Number`, `Date`, or `Currency`.
* Classes can be organized into a **multi‑level hierarchy**. The hierarchy is expressed using dot notation (`Number.Integer`, `Number.Decimal`) or via indentation in YAML.
* A class may define **multiple regex patterns**. This allows one logical type to match several textual forms.

Example:

```yaml
Integer: [ "\\d+" ]
Decimal:
  Common: [ "\\d+\\.\\d+" ]
  Scientific: [ "\\d+\\.\\d+e[+-]?\\d+" ]
```

This defines `Number.Integer`, `Number.Decimal`, `Number.Decimal.Common` and `Number.Decimal.Scientific` as part of the same hierarchy.

## Composition

* Classes can reference other classes to build larger constructs.
* References can point to any level of the hierarchy. You can use `${Class}`, `${Class.Subclass}`, or even deeper paths like `${Class.Subclass.Child}`.


Example:

```yaml
Currency:
  USD: [ "\\$" ]
  EUR: [ "€" ]

Number:
  Integer: [ "\\d+" ]
  Decimal:
    Scientific: [ "\\d+\\.\\d+e[+-]?\\d+" ]

Price: [ "${Currency}${Number}" ]                               # use whole classes
PriceUSD: [ "${Currency.USD}${Number}" ]                        # reference a specific subclass
ScientificPrice: [ "${Currency}${Number.Decimal.Scientific}" ]  # reference a deep child
```

Here, `Price` composes from entire classes, `PriceUSD` targets a specific subclass, and `ScientificPrice` references a deeper level in the hierarchy.

## Named Groups as Fields

* Within a class’s regex, you may define **named groups** to expose sub-components of the match.
* Named groups can also be combined with **references** to other classes, so you can wrap reused patterns with additional structure.

Examples:

```yaml
Date: [ "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})" ]

Currency:
  USD: [ "\\$" ]
  EUR: [ "€" ]

Number:
  Integer: [ "\\d+" ]

Transaction: [ "(?<amount>${Number.Integer})(?<currency>${Currency})" ]
```

* `Date` uses local named groups (`year`, `month`, `day`).
* `Transaction` combines named groups (`amount`, `currency`) with references to other classes, producing a structured result like:

```
Transaction
 ├─ amount → Number.Integer
 └─ currency → Currency (USD/EUR)
```

## Non-Capturing Classes

A non-capturing class is used only for grouping and matching, but it does not produce its own node in the result tree. They are useful when you need regex structure without polluting the output.

* Mark a class as **non-capturing** using the `?` prefix:

```yaml
'?Action': [ 'grew by', 'is growing by' ]
```

* Treat a class as non-capturing **within a specific pattern** using `${?Class}`:

```yaml
Number:
  Integer: [ '\d+' ]
  Decimal: [ '${?Integer}\.${?Integer}' ]
```

Here `Integer` is captured normally elsewhere, but inside `Decimal` it participates without creating separate nodes.

## Explicit Capturing

* If a class is under a non-capturing parent, you can mark a child as **explicitly capturing** with the `!` prefix (compact notation):

```yaml
'?NonCapturing':
  '!Capturing': [ 'specific patterns' ]
```

* At the **group level**, force capture of a non-capturing class inside a pattern using `${!Class}`:

```yaml
'?Action': [ 'grew by', 'is growing by' ]
FinData: [ '${FinIndicator} ${!Action} ${Percent}' ]
```

This way `Action` remains non-capturing by default, but is included in results within `FinData`.

## Flags (Inline)

Flags modify how individual regex patterns behave. They can be applied inline inside a regex literal, following the same syntax as Java’s `Pattern`.

Supported flags:

* `i` — case-insensitive
* `m` — multiline mode (`^` and `$` match line boundaries)
* `s` — dotall mode (`.` matches line terminators)
* `u` — unicode case
* `x` — extended mode (ignore whitespace and allow comments in regex)
* `d` — UNIX lines mode 

Examples:

```yaml
Line: [ '(?m)^(.*)$' ]               # (?m) enables multiline mode

Pet:
  Dog: [ '(?i)do(ggies|ggy|gs|g)' ]  # (?i) makes the match case‑insensitive
  Cat: [ '(?i)cats?', '(?i)kitt(ies|y)' ]
```

## Result Tree

* Every match reflects the class hierarchy and named groups, producing a **tree structure**.
* In Java, this tree is navigated with `Group` (children, values, positions).
* In REST responses, the same structure is serialized as JSON, with `model` representing the hierarchical view and `raw` showing the low‑level spans.

> In essence, Expresso turns regex into an **OOP‑like system**: classes define types, dot notation defines hierarchy, composition combines them, and named groups act as fields.

# YAML DSL

Expresso provides a **domain-specific language (DSL)** for defining pattern libraries in YAML. This format makes complex pattern sets modular, reusable, and easier to maintain.

> For an explanation of the underlying ideas (classes, hierarchy, composition, named groups), see **Core Concepts**. This section focuses on the YAML syntax itself.

## Structure

A pattern file has two top-level keys:

* `imports` – optional, used to include other YAML pattern files.
* `flags` – optional, sets file-level flags that apply to all patterns.
* `classes` – required, defines the class hierarchy and their regex patterns.

Example:

```yaml
imports: [ 'numbers', 'money' ]

flags: [ 'case_insensitive' ]

classes:
  
  Date: [ "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})" ]

  Currency:
    USD: [ "\\$" ]
    EUR: [ "€" ]

  Number:
    Integer: [ "\\d+" ]
    Decimal: [ "\\d+\\.\\d+" ]

  Price: [ "${Currency}${Number}" ]
```

## Imports

The `imports` section allows one YAML file to reuse definitions from others, so that common building blocks can be centralized and shared.

There are several ways to specify imports:

* By logical name (without extension):

  ```yaml
  imports: [ 'numbers', 'money' ]
  ```
* By file name (with extension):

  ```yaml
  imports: [ 'numbers.yml', 'money.yml' ]
  ```
* By relative path (for organized libraries):

  ```yaml
  imports:
    - 'core/datetime.yml'
    - 'core/finance.yml'
  ```

This flexibility allows you to structure pattern libraries according to your project’s needs, whether as simple names, explicit file references, or organized folder hierarchies. Imports are also resolved recursively: if an imported file itself declares `imports`, those will be loaded as well, so that the entire dependency chain is brought in automatically.
> The YAML DSL makes Expresso patterns portable and maintainable, while directly mapping onto the object model of the core API.

## Flags (File-level)

In the YAML DSL you can declare **file-level flags** that apply to all patterns in the file. This is useful when you want a consistent matching mode across many classes.

Supported values for `flags` (file-level keywords):

* `case_insensitive` — case-insensitive
* `multiline` — multiline mode (`^` and `$` match line boundaries)
* `dotall` — dotall mode (`.` matches line terminators)
* `unicode_case` — unicode case
* `comments` — extended mode (ignore whitespace and allow comments in regex)
* `unix_lines` — UNIX lines mode

# Applying Patterns & Results

Once patterns are defined (either as YAML or inline strings), Expresso can apply them to input text and produce structured results. The output always reflects the class hierarchy and any named groups.

## In Java (Matcher / Group)

Using the Core API, results are provided as `Group` objects organized into a tree.

Example:

```java
Matcher matcher = Expresso.compile(patterns).matcher("Price: $123");

List<Group> matches = matcher.results().toList();
Group first = matches.getFirst();

System.out.println(first.getName());     // e.g. "Price"
System.out.println(first.getChildren()); // nested groups: Currency, Number
```

* `Matcher` exposes methods similar to `Matcher` (`start`, `end`, `group`), but works with hierarchical groups.
* `Group` represents a single match node with children, value, and position.

## Via REST (JSON results)

When Expresso runs as a service, results can be returned in two formats:

* **model** – a hierarchical JSON object where each node corresponds to a class/group in the pattern.
* **raw** – a flat list of matches with their positions and values.

Example (`model`):

```json
{
  "Price": {
    "Currency.USD": "$",
    "Number.Integer": "123"
  }
}
```

Example (`raw`):

```json
[
  {
    "name": "Money",
    "value": "$123",
    "start": 7,
    "end": 11,
    "groups": [
      {
        "name": "Currency.USD",
        "value": "$",
        "start": 7,
        "end": 8
      },
      {
        "name": "Number.Integer",
        "value": "123",
        "start": 8,
        "end": 11
      }
    ]
  }
]
```

## Choosing the format

* Use **model** when you want structured trees that mirror the class hierarchy.
* Use **raw** when you need exact spans, positions, or prefer a flattened view of the matches.

> The JSON examples shown above are illustrative. The actual output format can be customized to fit your integration needs.

# Advanced Usage

Beyond the basics, Expresso enables more advanced ways to organize and apply patterns. These features highlight its flexibility for real-world scenarios.

## Building libraries of patterns

* You can maintain common definitions (e.g., numbers, dates, currencies) in separate YAML files.
* Other pattern files can `import` them and build higher-level constructs.

Example:

```yaml
imports: [ 'numbers', 'dates' ]

classes:
  Event: [ "${Date} — ${Number}" ]
```

This way, `Event` automatically benefits from improvements in the shared `numbers` and `dates` libraries.

## Multi-level hierarchy in practice

* Classes can be nested multiple levels deep, creating rich type systems.

Example:

```yaml
Number:
  Decimal:
    Scientific: [ "\\d+\\.\\d+e[+-]?\\d+" ]
```

Here `Number.Decimal.Scientific` is a precise subtype of `Number.Decimal`, which itself is under `Number`.

## Combining named groups with references

* Named groups can wrap references to add structure or capture labels around reused classes.

Example:

```yaml
Transaction: [ "(?<amount>${Number})(?<currency>${Currency})" ]
```

This produces a tree with a `Transaction` node containing two child groups, `amount` and `currency`, which in turn resolve into their respective class matches.

## Handling variations in input formats

* A class can define multiple regex patterns to cover different formats. 

Example:

```yaml
Date:
  ISO: [ "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})" ]
  US:  [ "(?<month>\\d{2})/(?<day>\\d{2})/(?<year>\\d{4})" ]
```

This allows `Date` to match either ISO (`2024-12-31`) or US (`12/31/2024`) style inputs.

> These advanced usage patterns show how Expresso can scale from simple string matching to complex, domain-specific grammars while keeping definitions modular and maintainable.

# Examples

Expresso is not tied to a single domain. The same object‑oriented pattern approach can be applied to many different kinds of text. Below are some illustrative examples.

## Log Parsing

System logs often contain a timestamp, log level, thread, and message. With Expresso, these parts can be defined as classes and then composed.

Input:

```
2024-05-01 12:34:56 [INFO] [main] Application started
```

Pattern (simplified):

```yaml
Timestamp: [ "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" ]
Level: [ "INFO", "WARN", "ERROR" ]
Thread: [ "\\[.*?\\]" ]
LogEntry: [ "${Timestamp} ${Level} ${Thread} (?<message>.*)" ]
```

Result (model):

```json
{
  "LogEntry": {
    "Timestamp": "2024-05-01 12:34:56",
    "Level": "INFO",
    "Thread": "[main]",
    "message": "Application started"
  }
}
```

## Financial Transactions

Bank or payment logs can also be broken down into structured elements.

Input:

```
TXN-4456 DEBIT 120.50 USD Grocery
```

Pattern (simplified):

```yaml
Id: [ "TXN-\\d+" ]
Type: [ "DEBIT", "CREDIT" ]
Currency:
  USD: [ "USD" ]
  EUR: [ "EUR" ]
Number:
  Decimal: [ "\\d+\\.\\d+" ]
Transaction: [ "${Id} ${Type} ${Number} ${Currency} (?<category>.*)" ]
```

Result (model):

```json
{
  "Transaction": {
    "Id": "TXN-4456",
    "Type": "DEBIT",
    "Number.Decimal": "120.50",
    "Currency.USD": "USD",
    "category": "Grocery"
  }
}
```

> For more complex, fully worked out examples, see the Live Demo: [expresso.cariochi.com](https://expresso.cariochi.com)

# Summary

Expresso extends regular expressions with an **object-oriented model**: classes, hierarchy, composition, and named groups. Instead of flat group captures, it produces structured trees that map naturally onto domain concepts.

Key points:

* Use it as a **Java library** (via `Matcher`/`Group`) or as a **service** (Docker/REST).
* Patterns can be declared directly as strings or maintained in **YAML DSL** files with imports.
* Results can be consumed as Java objects or serialized into JSON (`model`, `raw`, or a custom format).
* Advanced usage includes creating shared YAML libraries (via imports) and supporting multiple formats within a single class.
* A fully functional **Live Demo** is available at [expresso.cariochi.com](https://expresso.cariochi.com).

Expresso, like regex itself, is domain-agnostic. It is not a pre-built grammar, but a **tool**: it provides an object-oriented way to describe patterns in any kind of text. Using classes, hierarchy, composition, and named groups, you can model structures across diverse domains.
