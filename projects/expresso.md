---
title: EXPRESSO
---

# Introduction

## Object-Oriented Regular Expressions

Expresso is a Java library that redefines how you work with regular expressions by introducing object-oriented principles. Unlike traditional regex engines, Expresso
allows you to build modular, reusable, and hierarchical patterns that are easy to maintain and integrate into your applications. With Expresso, you can achieve more
structured and readable solutions for complex text parsing tasks.

## Key Features of Expresso

### Hierarchical Patterns

Define patterns in a class-like structure, enabling inheritance and reuse across multiple contexts. This makes your patterns modular and easy to extend.

### Named Group Exclusivity

Expresso focuses solely on named groups, ignoring unnamed ones to maintain clarity and alignment with object-oriented principles.

### Flexible Group Naming

Use non-standard group names like `@group`, `#number`, or even hierarchical names like `Class.Subclass.Field`, enabling better organization and readability.

### Reusable Classes

Define patterns once and reuse them across your application by referencing them like objects in your code.

### Comprehensive Java API

Leverage Expresso’s Java Matcher API to capture structured results, traverse hierarchical groups, and extract meaningful data with ease.

## Why Choose Expresso?

### Maintainable Patterns

By organizing patterns into reusable classes, Expresso minimizes redundancy and makes it easier to maintain large-scale regex-based projects.

### Structured Outputs

Generate structured outputs like JSON directly from matched patterns, making Expresso perfect for tasks like log parsing, data extraction, and domain-specific language
processing.

### Interactivity and Integration

With Expresso’s [interactive demo](https://expresso.cariochi.com/), you can experiment with patterns and input text in real-time, ensuring precision before deploying them
into your application.

## Ready to Start?

Dive into the sections below to explore how to define patterns, utilize advanced features, and see real-world examples of Expresso in action.

# Defining Patterns

Expresso patterns are designed with modularity, readability, and reusability in mind. Unlike traditional regex engines, Expresso organizes patterns in a class-based
structure using YAML format. This structure allows you to create, extend, and reuse patterns like objects in an object-oriented programming language.

Expresso supports two formats for defining patterns: **Verbose Notation** and **Compact Notation**. Each format is suited for different use cases depending on the
complexity and size of your pattern definitions.

## Verbose Notation

Verbose notation provides an explicit and detailed way to define patterns, making it ideal for more complex structures or when documentation clarity is important. Each
class includes its name, optional parent class, and a list of associated patterns.

#### Syntax:

```yaml
- class: <class name>
  extends: <parent class name>
  patterns: [ <list of patterns> ]
```

#### Example:

```yaml
- class: IsoDate
  extends: Date
  patterns: [ '(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})' ]

- class: UsDate
  extends: Date
  patterns: [ '(?<month>\d{2})/(?<day>\d{2})/(?<year>\d{4})' ]
```

## Compact Notation

Compact notation offers a concise way to define patterns, making it suitable for smaller or simpler pattern structures. Patterns are defined directly under their parent
classes without additional fields.

#### Syntax:

```yaml
<parent class name>:
  <class name>: [ <list of patterns> ]
```

#### Example:

```yaml
Date:
  IsoDate: [ '(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})' ]
  UsDate: [ '(?<month>\d{2})/(?<day>\d{2})/(?<year>\d{4})' ]
```

## Choosing the Right Notation

The choice between verbose and compact notation depends on your project’s needs:

* **Verbose Notation** is ideal for complex patterns, as it provides a clear and structured way to define details such as inheritance and multiple patterns.
* **Compact Notation** is best for quick and straightforward definitions, where clarity and simplicity are prioritized.

Expresso allows you to mix and match both notations within the same project, enabling flexibility based on the complexity of each pattern.

## Using Classes in Patterns

One of the unique and powerful features of Expresso is the ability to reference defined classes directly within other patterns. This feature allows for modular and
reusable pattern definitions by embedding class names into templates using the `${ClassName}` syntax.

This approach simplifies complex pattern creation by breaking them into smaller, reusable components.

#### Syntax

When defining a pattern, you can reference an existing class by enclosing its name in `${...}`. The referenced class’s pattern will be expanded in place, maintaining the
hierarchy and reusability of your design.

#### Example

```yaml
Number:
  Integer: [ '\d+' ]
  Decimal: [ '${Integer}\.${Integer}' ]

Measurement:
  Weight: [ '${Decimal}\s*(kg|lbs)' ]
  Height: [ '${Decimal}\s*(cm|in)' ]
```

In this example:

* The Decimal pattern reuses the Integer pattern to define decimal numbers.
* The Weight and Height patterns reuse the Decimal class to define units of measurement like kilograms (kg) or centimeters (cm).

#### Real-World Use Case

For instance, if you need to define monetary values and reuse numeric formats:

```yaml
Currency:
  USD: [ '\$${Decimal}' ]
  EUR: [ '€${Decimal}' ]

Price:
  Range: [ '${Currency}\s*-\s*${Currency}' ]
```

Here:

* `USD` and `EUR` reuse the `Decimal` class to represent amounts in dollars and euros.
* `Range` uses `Currency` to define a price range, like $10.99 - $20.49.

This powerful feature allows Expresso users to build scalable and maintainable solutions for even the most complex text-parsing requirements.

## Defining Pattern Hierarchies

Expresso’s true strength lies in its ability to use classes and inheritance for pattern definitions. By defining patterns in a hierarchy, you can build modular, reusable,
and scalable solutions. This approach simplifies pattern management, as changes in base classes automatically propagate to derived patterns.

#### Example

```yaml
Number:
  Integer: [ '\d+' ]
  Decimal: [ '${?Integer}\.${?Integer}' ]

Currency:
  USD: [ '\$' ]
  EUR: [ '€' ]
  GBP: [ '£' ]

Money: [ '${Currency}${Number}' ]

Percent: [ '${Number}%' ]
```

In this example:

* The `Number` class defines reusable numeric patterns:
    * `Integer` matches whole numbers (123).
    * `Decimal` reuses the `Integer` class to match decimal numbers (123.45).
* The `Currency` class defines various currency symbols: $, €, and £.
* The `Money` pattern combines `Currency` and `Number`, allowing for monetary expressions like $123.45 or €456.
* The `Percent` pattern combines `Number` with % to match percentages, e.g., 25%.

#### Advantages

1. **Modularity**: Individual patterns are small and focused, making them easier to manage and extend.
2. **Reusability**: Base classes like `Number` and `Currency` can be reused across multiple higher-level patterns.
3. **Flexibility**: Patterns can adapt to various formats by simply updating used classes.
4. **Maintainability**: Updates to base patterns automatically reflect in all dependent patterns.

With these powerful notations, you can design robust, maintainable, and modular patterns that are easily extendable and adaptable to different use cases.

# Non-Capturing Groups

Expresso provides advanced control over pattern capturing through **non-capturing** groups and **explicit capturing**, allowing for clean, modular, and maintainable
patterns.

## Non-Capturing Groups

**Non-capturing groups** are used to define classes or groups that participate in pattern matching but are not included in the final output. This can be useful when
certain parts of a pattern are auxiliary or should not clutter the result.

### Defining Non-Capturing Classes

Non-capturing classes can be defined in **three ways**:

1. **Compact Notation** (using the `?` prefix):

```yaml
'?Action': [ 'grew by', 'is growing by' ]
```

2. **Verbose Notation** (using the `?` prefix):

```yaml
- class: '?Action'
  patterns: [ 'grew by', 'is growing by' ]
```

3. **Verbose Notation with** `nonCapturing` **Field**:

```yaml
- class: Action
  nonCapturing: true
  patterns: [ 'grew by', 'is growing by' ]
```

**Behavior**: If a class is marked as non-capturing, all its descendant classes will also be non-capturing unless explicitly overridden.

### Defining Non-Capturing Groups in Patterns

Even if a class is **not non-capturing**, it can be treated as such within a specific pattern by prefixing it with `?`.

**Example:**

```yaml
Number:
  Integer: [ '\d+' ]
  Decimal: [ '${?Integer}\.${?Integer}' ]
```

Here:

* The `Integer` class is captured normally in other contexts.
* Within the `Decimal` pattern, `Integer` is used but will not be captured.

## Explicit Capturing

**Explicit capturing** allows you to override non-capturing behavior at both the class and group levels.

### Explicit Capturing for Classes

You can define a class as **explicit capturing** if it extends a non-capturing parent class. This can be done in verbose or compact notation:

1. **Compact Notation** (using the `!` prefix):

```yaml
'?NonCapturing':
  '!Capturing': [ 'specific patterns' ]
```

2. **Verbose Notation** (using the `!` prefix):

```yaml
- class: '?NonCapturing'

- class: '!Capturing'
  extends: NonCapturing
  patterns: [ 'specific patterns' ]
```

3. **Verbose Notation with** `explicitCapturing` **Field**:

```yaml
- class: NonCapturing
  nonCapturing: true

- class: Capturing
  extends: NonCapturing
  explicitCapturing: true
  patterns: [ 'specific patterns' ]
```

### Explicit Capturing for Groups in Patterns

You can mark specific groups within a pattern as **explicitly capturing** even if their class is non-capturing. Use the `!` prefix for this.

**Example:**

```yaml
?Action: [ 'grew by', 'is growing by' ]
FinData: [ '${FinIndicator} ${!Action} ${Percent}' ]
```

Here:

* The `Action` class is marked as non-capturing.
* Within the `FinData` pattern, the `Action` group is explicitly captured.

## Summary of Capturing Behavior

<table><thead><tr><th width="212">Type</th><th>Behavior</th></tr></thead><tbody><tr><td><strong>Non-Capturing</strong></td><td>Excludes classes or groups from results unless explicitly captured.</td></tr><tr><td><strong>Explicit Capturing</strong></td><td>Overrides non-capturing behavior for specific classes or groups.</td></tr><tr><td><strong>Group-Level Control</strong></td><td>Allows fine-grained control within individual patterns using <code>?</code> or <code>!</code>.</td></tr></tbody></table>

With **non-capturing** and **explicit capturing**, Expresso gives you powerful tools to build clean and structured patterns while maintaining precision in your outputs

---
description: EXPRESSO
---

# Examples

## Matching Example

### Input Text:

```
Invoice date: 2023-11-26. Total amount paid: $123.45 (including 20% VAT).
Order placed on: 15/10/2024. Total discount applied: 15% and 10%.
Transaction completed: €678.90 on 2022-12-01. Currency conversion fee: 2.5%.
Payment received: £345.67 on 01/09/2023. Early bird discount: 5%.
Subscription renewed: $49.99 (tax: 8%) on 26-Nov-2024.
```

### Patterns:

**Verbose**

```yaml
classes:

  - class: Date
    patterns:
      - '(?<year>(?<Integer>\d{4}))-(?<month>(?<Integer>\d{2}))-(?<day>(?<Integer>\d{2}))'
      - '(?<month>(?<Integer>\d{2}))/(?<day>(?<Integer>\d{2}))/(?<year>(?<Integer>\d{4}))'
      - '(?<day>(?<Integer>\d{2}))-(?<month>[JFMAJSOND][a-z]{2})-(?<year>(?<Integer>\d{4}))'

  - class: Integer
    extends: Number
    patterns: [ '\d+' ]

  - class: Decimal
    extends: Number
    patterns: [ '${?Integer}\.${?Integer}' ]

  - class: USD
    extends: Currency
    patterns: [ '\$' ]

  - class: EUR
    extends: Currency
    patterns: [ '€' ]

  - class: GBP
    extends: Currency
    patterns: [ '£' ]

  - class: Money
    patterns: [ '${Currency}${Number}' ]

  - class: Percent
    patterns: [ '${Number}%' ]

```

**Compact**

```yaml
classes:

  Date:
    - '(?<year>(?<Integer>\d{4}))-(?<month>(?<Integer>\d{2}))-(?<day>(?<Integer>\d{2}))'
    - '(?<month>(?<Integer>\d{2}))/(?<day>(?<Integer>\d{2}))/(?<year>(?<Integer>\d{4}))'
    - '(?<day>(?<Integer>\d{2}))-(?<month>[JFMAJSOND][a-z]{2})-(?<year>(?<Integer>\d{4}))'

  Number:
    Integer: [ '\d+' ]
    Decimal: [ '${?Integer}\.${?Integer}' ]

  Currency:
    USD: [ '\$' ]
    EUR: [ '€' ]
    GBP: [ '£' ]

  Money: [ '${Currency}${Number}' ]

  Percent: [ '${Number}%' ]

```

### Java Code:

```java
String classes = """
        
        Date:
          - '(?<year>(?<Integer>\\d{4}))-(?<month>(?<Integer>\\d{2}))-(?<day>(?<Integer>\\d{2}))'
          - '(?<month>(?<Integer>\\d{2}))/(?<day>(?<Integer>\\d{2}))/(?<year>(?<Integer>\\d{4}))'
          - '(?<day>(?<Integer>\\d{2}))-(?<month>[JFMAJSOND][a-z]{2})-(?<year>(?<Integer>\\d{4}))'
        
        Number:
          Integer: [ '\\d+' ]
          Decimal: [ '${?Integer}\\.${?Integer}' ]
        
        Currency:
          USD: [ '\\$' ]
          EUR: [ '€' ]
          GBP: [ '£' ]
        
        Money: [ '${Currency}${Number}' ]
        
        Percent: [ '${Number}%' ]
        
        """;

String input = """
        Invoice date: 2023-11-26. Total amount paid: $123.45 (including 20% VAT).
        Order placed on: 15/10/2024. Total discount applied: 15% and 10%.
        Transaction completed: €678.90 on 2022-12-01. Currency conversion fee: 2.5%.
        Payment received: £345.67 on 01/09/2023. Early bird discount: 5%.
        Subscription renewed: $49.99 (tax: 8%) on 26-Nov-2024.
        """;

RegexMatcher matcher = Expresso.parse(classes).matcher(input);

while(matcher.

find()){
final String group = "%s: %s".formatted(matcher.groupName(), matcher.group());
final String subgroups = IntStream.range(1, matcher.groupCount())
        .mapToObj(i -> "%s: %s".formatted(matcher.groupName(i), matcher.group(i)))
        .collect(Collectors.joining(", "));
    System.out.

println(group +(subgroups.isEmpty() ?"":" ("+subgroups +")"));
        }
```

### Capture All Groups

```java
RegexMatcher matcher = Expresso.parse(classes).matcher(input);
```

**Output:**

```
Date: 2023-11-26 (year: 2023, Integer: 2023, month: 11, Integer: 11, day: 26, Integer: 26)
Money: $123.45 (USD: $, Decimal: 123.45)
Percent: 20% (Integer: 20)
Date: 15/10/2024 (month: 15, Integer: 15, day: 10, Integer: 10, year: 2024, Integer: 2024)
Percent: 15% (Integer: 15)
Percent: 10% (Integer: 10)
Money: €678.90 (EUR: €, Decimal: 678.90)
Date: 2022-12-01 (year: 2022, Integer: 2022, month: 12, Integer: 12, day: 01, Integer: 01)
Percent: 2.5% (Decimal: 2.5)
Money: £345.67 (GBP: £, Decimal: 345.67)
Date: 01/09/2023 (month: 01, Integer: 01, day: 09, Integer: 09, year: 2023, Integer: 2023)
Percent: 5% (Integer: 5)
Money: $49.99 (USD: $, Decimal: 49.99)
Percent: 8% (Integer: 8)
Date: 26-Nov-2024 (day: 26, Integer: 26, month: Nov, year: 2024, Integer: 2024)
```

### Capture Numbers

```java
RegexMatcher matcher = Expresso.parse(classes).matcher(input).within("Number");
```

**Output:**

```
Integer: 2023
Integer: 11
Integer: 26
Decimal: 123.45
Integer: 20
Integer: 15
Integer: 10
Integer: 2024
Integer: 15
Integer: 10
Decimal: 678.90
Integer: 2022
Integer: 12
Integer: 01
Decimal: 2.5
Decimal: 345.67
Integer: 01
Integer: 09
Integer: 2023
Integer: 5
Decimal: 49.99
Integer: 8
Integer: 26
Integer: 2024
```

### Capture Decimals

```java
RegexMatcher matcher = Expresso.parse(classes).matcher(input).within("Decimal");
```

**Output:**

```
Decimal: 123.45
Decimal: 678.90
Decimal: 2.5
Decimal: 345.67
Decimal: 49.99
```

### Capture Dates

```java
RegexMatcher matcher = Expresso.parse(classes).matcher(input).within("Date");
```

**Output:**

```
Date: 2023-11-26 (year: 2023, Integer: 2023, month: 11, Integer: 11, day: 26, Integer: 26)
Date: 15/10/2024 (month: 15, Integer: 15, day: 10, Integer: 10, year: 2024, Integer: 2024)
Date: 2022-12-01 (year: 2022, Integer: 2022, month: 12, Integer: 12, day: 01, Integer: 01)
Date: 01/09/2023 (month: 01, Integer: 01, day: 09, Integer: 09, year: 2023, Integer: 2023)
Date: 26-Nov-2024 (day: 26, Integer: 26, month: Nov, year: 2024, Integer: 2024)
```

### Capture Years

```java
RegexMatcher matcher = Expresso.parse(classes).matcher(input).within("year");
```

**Output:**

```
year: 2023 (Integer: 2023)
year: 2024 (Integer: 2024)
year: 2022 (Integer: 2022)
year: 2023 (Integer: 2023)
year: 2024 (Integer: 2024)
```

### Capture Percent Amounts

```java
RegexMatcher matcher = Expresso.parse(classes).matcher(input).within("Percent").within("Number");
```

**Output:**

```
Integer: 20
Integer: 15
Integer: 10
Decimal: 2.5
Integer: 5
Integer: 8
```

## Try It Yourself

Want to see this example in action? Use our [Interactive Demo Application](https://expresso.cariochi.com/#1) to experiment with the patterns, input, and output. You can
modify the classes, input text, or try capturing different groups and observe the results live.
