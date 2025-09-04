---
title: Spring Data Web Spec
---

# Overview

**Spring Data Web Spec** is a small **open-source** library that maps HTTP request data
(**query params**, **headers**, **path variables**, plus optional **access-control** inputs)
into **Spring Data JPA Specifications** using concise annotations on controller method parameters.

* Declare filters directly in controller signatures
* Integrates seamlessly with **Spring MVC** and **Spring Data JPA**
* Pluggable **operators** (`Equal`, `In`, `ContainsIgnoreCase`, `IsNull`, `GreaterThan`, ...)
* **Access control** support via `@Spec.Condition` for security-based filters
* Spring Boot autoconfiguration (or enable manually with `@EnableWebSpec`)

  👉 Source code is available on [GitHub](https://github.com/cariochi/spring-data-web-spec).

# Installation

Maven:

```xml
<dependency>
    <groupId>com.cariochi.spec</groupId>
    <artifactId>spring-data-web-spec</artifactId>
  <version>1.0.3</version>
</dependency>
```

# Configuration

## Spring Boot autoconfiguration (recommended)

If you use **Spring Boot 3.x** and have **spring-data-web-spec** on the classpath, the`SpecificationArgumentResolver`will be
auto-registered.

Autoconfiguration is enabled by default but can be disabled via:

```properties
cariochi.spec.web.enabled=false
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

# Core Annotations

All annotations produce `Specification<?>` fragments that are combined with **AND** logic into a single query predicate.

They share the same attributes:

* `name` – external name (query param, path variable, or header name)
* `attribute` – entity attribute path
* `operator` – comparison operator class (default `Equal`)
* `required` – fail if the value is missing
* `distinct` – apply `distinct` to the query
* `joinType` – join type when traversing associations (default `INNER`)

## `@Spec.Param`

Binds an HTTP **query parameter** to a condition.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return repo.findAll(spec, pageable)
            .map(projectMapper::toDto);
}
```

## `@Spec.Path`

Binds a **path variable** to a condition.

```java
@GetMapping("/organizations/{organizationId}/projects")
public Page<ProjectDto> findProjects(
        @Spec.Path(name = "organizationId", attribute = "organization.id")
        Specification<Project> spec,
        Pageable pageable
) {
    return repo.findAll(spec, pageable)
            .map(projectMapper::toDto);
}
```

## `@Spec.Header`

Binds an HTTP **header** to a condition.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Header(name = "region", attribute = "organization.region", operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return repo.findAll(spec, pageable)
            .map(projectMapper::toDto);
}
```

## `@Spec.Condition`

A flexible annotation that lets you provide your own `valueResolver`. It can be used to express access-control
conditions (for example, filtering by user-allowed regions), or other custom sources of values.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Condition(attribute = "organization.region", valueResolver = UserAllowedRegions.class, operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return projectRepository.findAll(spec, pageable)
            .map(projectMapper::toDto);
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

# Logical Expressions — `@Spec.Expression`

Combine multiple atomic conditions with a Boolean expression defined right on the
controller parameter. The expression language supports:

* textual operators: `AND`, `OR`, `NOT` (case-insensitive)
* symbolic operators: `&&`, `||`, `!`
* parentheses for grouping

> Note: specifications declared on the controller method parameter but not referenced in the `@Spec.Expression` will
> still be included, combined with **AND**.

```java
@GetMapping("/organizations/{organizationId}/projects")
public Page<DummyDto> findProjects(
        @Spec.Path(name = "organizationId", attribute = "organization.id")
        @Spec.Param(name = "id")
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "labels", operator = In.class)
        @Spec.Header(name = "region", attribute = "organization.region", operator = In.class)
        @Spec.Condition(attribute = "organization.region", valueResolver = UserAllowedRegions.class, operator = In.class)
        @Spec.Expression("(id OR name) AND (status OR labels)")
        Specification<DummyEntity> spec,
        Pageable pageable
) {
  return service.findAll(spec, pageable)
          .map(emapper::toDto);
}
```

## Missing-parameter behavior

`@Spec.Expression` exposes a `strict` flag that controls how unknown/missing aliases are handled in the expression:

* `strict = false` *(default)*: **lenient** — missing aliases evaluate to `null` and are ignored by combinators
  (e.g., `(id OR name) AND (status OR labels)` with only `id` present simplifies to `id`).
* `strict = true`: an exception is thrown if the expression references an alias with no corresponding specification.

# Operators

By default the library provides a set of built-in operator beans:

* equality/inequality: `Equal`, `NotEqual`
* membership: `In`, `NotIn`
* string: `Contains`, `ContainsIgnoreCase`, `StartsWith`, `StartsWithIgnoreCase`, `EndsWith`, `EndsWithIgnoreCase`
* null checks: `IsNull`, `IsNotNull`
* comparison: `GreaterThan`, `GreaterThanOrEqualTo`, `LessThan`, `LessThanOrEqualTo`

In addition to the built-in set, you can define your **own operators** and use them in annotations just like the provided
ones. **Custom operators** are classes that implement the `Operator` interface. They are managed as **Spring beans** and can be
injected or created automatically by Spring.

# Examples

## Basic usage

```java
@GetMapping("/users")
public Page<UserDto> findUsers(
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        Specification<User> spec,
        Pageable pageable
) {
  return userRepository.findAll(spec, pageable)
          .map(userMapper::toDto);
}
```

## Combining path, header, and query params

```java
@GetMapping("/organizations/{organizationId}/projects")
public Page<ProjectDto> findProjects(
        @Spec.Path(name = "organizationId", attribute = "organization.id")
        @Spec.Header(name = "region", attribute = "organization.region", operator = In.class)
        @Spec.Param(name = "active", attribute = "status", operator = Equal.class)
        Specification<Project> spec,
        Pageable pageable
) {
  return projectRepository.findAll(spec, pageable)
            .map(projectMapper::toDto);
}
```

## Expression example

```java
@GetMapping("/search")
public Page<ItemDto> search(
        @Spec.Param(name = "id")
        @Spec.Param(name = "title", operator = ContainsIgnoreCase.class)
        @Spec.Param(name = "category", operator = In.class)
        @Spec.Expression("(id OR title) AND category")
        Specification<Item> spec,
        Pageable pageable
) {
  return itemRepository.findAll(spec, pageable)
            .map(itemMapper::toDto);
}
```

## Access-control example

```java
@GetMapping("/organizations/{organizationId}/projects")
public Page<ProjectDto> findProjects(
        @Spec.Path(name = "organizationId", attribute = "organization.id")
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Header(name = "region", attribute = "organization.region", operator = In.class)
        @Spec.Condition(attribute = "organization.region", valueResolver = UserAllowedRegions.class, operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
  return projectRepository.findAll(spec, pageable)
          .map(projectMapper::toDto);
}
```

# License

The library is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
