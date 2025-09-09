---
title: Spring Data Web Spec
---

# Overview

**Spring Data Web Spec** is a lightweight **open‑source** library that maps HTTP request data—
(**query parameters**, **headers**, **path variables**, **JSON body fields**, and **access‑control** conditions) — into
Spring Data JPA **Specifications** using clear, concise annotations on controller method parameters.

👉 Source code is available on [GitHub](https://github.com/cariochi/spring-data-web-spec).

# Quick Start

The simplest usage example is filtering entities by query parameters in a controller method:

```java
@GetMapping("/users")
public Page<UserDto> findUsers(
        @Spec.Param(name = "role", attribute = "role.name", operator = In.class)
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        @Spec.Condition(attribute = "organization.id", valueResolver = AllowedOrganizations.class, operator = In.class)
        Specification<User> spec,
        Pageable pageable
) {
    return userService.findAll(spec, pageable).map(userMapper::toDto);
}
```

With just these annotations, incoming request parameters like `?role=ADMIN&name=alex` will be automatically mapped into
a JPA **Specification**, and **access-control** rules (for example, restricting results to organizations allowed by
`AllowedOrganizations`) will also be applied to the query.

# Installation

Maven:

```xml
<dependency>
    <groupId>com.cariochi.spec</groupId>
    <artifactId>spring-data-web-spec</artifactId>
    <version>1.0.4</version>
</dependency>
```

# Configuration

## Spring Boot autoconfiguration (recommended)

If you use **Spring Boot 3.x** and have **spring-data-web-spec** on the classpath, the `SpecificationArgumentResolver`
will be automatically registered.

Autoconfiguration is enabled by default but can be disabled via:

```properties
cariochi.spec.enabled=false
```

## Manual registration

If you don’t want to rely on **autoconfiguration** (or you use plain **Spring MVC without Boot**), annotate your
configuration class:

```java
@EnableWebSpec
@Configuration
public class WebConfig {
}
```

# Annotations

All annotations produce `Specification<?>` fragments that are combined with **AND** logic into a single query predicate.
Additionally, you can use the [`@Spec.Expression`](#specexpression) annotation to define custom combinations with groups
and Boolean
operators (AND, OR, NOT).

They share the same attributes:

* `name` – external name (query param, path variable, or header name)
* `attribute` – entity attribute path
* `operator` – comparison operator class (default `Equal`)
* `required` – fail if the value is missing (default `false`)
* `distinct` – apply `distinct` to the query (default `false`)
* `joinType` – join type when traversing associations (default `INNER`)

## `@Spec.Param`

Binds an HTTP **query parameter** to a condition.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "nameContains", operator = ContainsIgnoreCase.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return repo.findAll(spec, pageable).map(projectMapper::toDto);
}
```

## `@Spec.Path`

Binds an HTTP **path variable** to a condition.

```java
@GetMapping("/organizations/{organizationId}/projects")
public Page<ProjectDto> findProjects(
        @Spec.Path(name = "organizationId", attribute = "organization.id")
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "nameContains", operator = ContainsIgnoreCase.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return repo.findAll(spec, pageable).map(projectMapper::toDto);
}
```

## `@Spec.Header`

Binds an HTTP **header** to a condition. This can also be used for multi‑tenant support, for example separating data by
region, client, or other contextual header values.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "nameContains", operator = ContainsIgnoreCase.class)
        @Spec.Header(name = "X-Region", attribute = "organization.region", operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return repo.findAll(spec, pageable).map(projectMapper::toDto);
}
```

## `@Spec.Body`

Binds a **request body** field to a condition. Supports **JSON** (`application/json`, `application/*+json`).

* Nested keys via **dot-notation** (e.g. `filters.status`, `organization.region.id`).
* Works with both **nested** and **flattened** JSON structures.
* Can be freely **combined** with other annotations (`@Spec.Param`, `@Spec.Path`, `@Spec.Header`, `@Spec.Condition`,
  `@Spec.Expression`).
* If your body includes additional data beyond filters, you can still declare a regular `@RequestBody` parameter to
  receive the full payload as-is. This is especially useful when the request contains pagination or metadata alongside
  filter criteria. In such cases, the library ensures that filters and business data can coexist cleanly in a single
  request.

  For this to work, you need to enable the **body-repeatable** option (disabled by default):

 ```properties
  cariochi.spec.body-repeatable=true
  ```

When enabled, the request body can be consumed multiple times—once for resolving specifications and again for binding to
the controller parameter. This feature is critical for robust API designs where controllers expect both structured
filters and domain-specific payloads.

```java
@PostMapping("/projects/search")
public List<ProjectDto> findProjects(
        @Spec.Body(name = "filters.id", attribute = "id")
        @Spec.Body(name = "filters.name", attribute = "name", operator = ContainsIgnoreCase.class)
        @Spec.Body(name = "filters.status", attribute = "status", operator = In.class)
        @Spec.Body(name = "filters.labels", attribute = "labels", operator = In.class)
        @Spec.Expression(value = "(filters.id || filters.status) && (filters.name || filters.labels)")
        Specification<Project> spec,
        @RequestBody SearchRequestDto searchRequest
) {
    return repo.findAll(spec, searchRequest.getPageable()).map(projectMapper::toDto);
}
```

## `@Spec.Condition`

A flexible annotation that lets you provide your own `valueResolver`. It can be used to express **access-control
conditions** (for example, filtering by user-allowed regions), or other custom sources of values.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Condition(attribute = "organization.region", valueResolver = UserAllowedRegions.class, operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return projectService.findAll(spec, pageable).map(projectMapper::toDto);
}
```

### Custom value resolver

A custom `valueResolver` can be implemented as a **Spring bean**. For example, resolving allowed regions for the current
user:

```java
@Component
@RequiredArgsConstructor
public class UserAllowedRegions implements Function<String, Set<String>> {

    private final UserService userService;

    @Override
    public Set<String> apply(String name) {
        return userService.getAllowedRegions();
    }
}
```

## `@Spec.Expression`

Combine multiple atomic conditions with a Boolean expression defined right on the
controller parameter. The expression language supports:

* textual operators: `AND`, `OR`, `NOT` (case-insensitive)
* symbolic operators: `&&`, `||`, `!`
* parentheses for grouping

> Note: specifications declared on the controller method parameter but not referenced in the `@Spec.Expression` will
> still be included, combined with **AND**.

```java
@GetMapping("/organizations/{organizationId}/projects")
public Page<ProjectDto> findProjects(
        @Spec.Path(name = "organizationId", attribute = "organization.id")
        @Spec.Param(name = "id")
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "labels", operator = In.class)
        @Spec.Header(name = "X-Region", attribute = "organization.region", operator = In.class)
        @Spec.Condition(attribute = "organization.region", valueResolver = UserAllowedRegions.class, operator = In.class)
        @Spec.Expression("(id || name) && (status || labels)")
        Specification<Project> spec,
        Pageable pageable
) {
    return service.findAll(spec, pageable).map(projectMapper::toDto);
}
```

### Missing-parameter behavior

`@Spec.Expression` exposes a `strict` flag that controls how unknown/missing aliases are handled in the expression:

* `strict = false` *(default)*: **lenient** — missing aliases evaluate to `null` and are ignored by combinators
  (e.g., `(id OR name) AND (status OR labels)` with only `id` present simplifies to `id`).
* `strict = true`: an exception is thrown if the expression references an alias with no corresponding specification.

# Operators

By default, the library provides a set of built-in operator beans:

* equality/inequality: `Equal`, `NotEqual`
* membership: `In`, `NotIn`
* string: `Contains`, `ContainsIgnoreCase`, `StartsWith`, `StartsWithIgnoreCase`, `EndsWith`, `EndsWithIgnoreCase`
* null checks: `IsNull`, `IsNotNull`
* comparison: `GreaterThan`, `GreaterThanOrEqualTo`, `LessThan`, `LessThanOrEqualTo`

In addition to the built-in set, you can define your **own operators** and use them in annotations just like the
provided ones. **Custom operators** are classes that implement the `Operator` interface. They are managed as **Spring
beans** and can be injected or created automatically by Spring.

# License

The library is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
