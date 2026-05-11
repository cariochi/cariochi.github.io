---
title: Spring Data Web Spec
description: Open-source annotation-driven mapping from web requests to Spring Data JPA Specifications. Simplifies controllers, adds type-safe filtering, and supports access control.
image: /assets/images/og/webspec.png
---

# Introduction

Spring Data Web Spec maps HTTP request data to Spring Data JPA `Specification` objects directly in Spring MVC
controller method signatures.

Use it when a search endpoint needs filters from query parameters, path variables, headers, JSON body fields, or
application-specific context such as tenant or access-control rules.

```java
@GetMapping("/users")
public Page<UserDto> findUsers(
        @Spec.Param(name = "role", attribute = "role.name", operator = In.class)
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        Specification<User> spec,
        Pageable pageable
) {
    return userRepository.findAll(spec, pageable).map(userMapper::toDto);
}
```

A request such as:

```http
GET /users?role=ADMIN&role=MANAGER&name=alex
```

is converted to a JPA specification equivalent to:

```text
role.name IN ('ADMIN', 'MANAGER') AND name LIKE '%alex%'
```
Source code is available on [GitHub](https://github.com/cariochi/spring-data-web-spec).

> Current documentation covers Spring Data Web Spec `1.1.x` for Spring Boot 4 / Spring Framework 7 projects. If your project still
> uses Spring Boot 3 / Spring Framework 6, use the archived [Spring Data Web Spec v1.0.x]({{ '/archive/spec-v1.0.x' | relative_url }})
> documentation.

# Why It Exists

Search and filtering endpoints often start simple and then accumulate query-parameter parsing, conditional joins,
access-control predicates, and ad hoc query-building code.

Spring Data Web Spec lets controllers describe dynamic search APIs declaratively, mapping request data and access
rules into reusable Spring Data JPA Specifications.

# Installation

```xml
<dependency>
    <groupId>com.cariochi.spec</groupId>
    <artifactId>spring-data-web-spec</artifactId>
    <version>1.1.0</version>
</dependency>
```

# Requirements

- Java 21+
- Spring Boot 4.0.x, or plain Spring Framework 7.0.x
- Spring MVC 7.0.x
- Spring Data JPA 4.0.x
- Jakarta Servlet stack

Spring Boot applications are auto-configured when the library is on the classpath.

# Configuration

Auto-configuration is enabled by default:

```properties
cariochi.spec.enabled=true
```

Disable it when you want to register the infrastructure yourself:

```properties
cariochi.spec.enabled=false
```

For plain Spring MVC or manual registration:

```java
@Configuration
@EnableWebSpec
public class WebConfig {
}
```

If `@Spec.Body` is used together with a regular `@RequestBody` parameter, enable repeatable body reads:

```properties
cariochi.spec.body-repeatable=true
```

# Core Model

All source annotations create small `Specification<?>` fragments. Without an explicit expression, all resolved fragments
are combined with `AND`.

A specification parameter can be declared as either:

```java
Specification<User> spec
```

or:

```java
Optional<Specification<User>> spec
```

Use `Optional<Specification<T>>` when your repository code wants to distinguish "no filters" from "some filters".

All source annotations share these attributes:

| Attribute | Description |
| --- | --- |
| `name` | External input name: query parameter, path variable, header, body key, or custom resolver key. |
| `attribute` | Entity attribute path. Defaults to `name` when omitted. Supports dotted paths such as `organization.region`. |
| `operator` | Operator class. Defaults to `Equal`. |
| `required` | Fails argument resolution when the value is missing or empty. Defaults to `false`. |
| `distinct` | Applies `distinct` to the Criteria query when this condition is used. |
| `joinType` | Join type used when traversing associations. Defaults to `INNER`. |

# Query Parameters

Use `@Spec.Param` for HTTP query parameters.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return projectRepository.findAll(spec, pageable).map(projectMapper::toDto);
}
```

Multiple query values are supported:

```http
GET /projects?status=ACTIVE&status=PAUSED
```

Comma-separated values are also handled by Spring conversion for collection operators:

```http
GET /projects?status=ACTIVE,PAUSED
```

# Path Variables

Use `@Spec.Path` for URI template variables.

```java
@GetMapping("/organizations/{organizationId}/projects")
public Page<ProjectDto> findProjects(
        @Spec.Path(name = "organizationId", attribute = "organization.id")
        @Spec.Param(name = "status", operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return projectRepository.findAll(spec, pageable).map(projectMapper::toDto);
}
```

# Headers

Use `@Spec.Header` for HTTP headers. This is useful for contextual filters such as region, tenant, client, or locale.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Header(name = "X-Region", attribute = "organization.region", operator = In.class)
        @Spec.Param(name = "status", operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return projectRepository.findAll(spec, pageable).map(projectMapper::toDto);
}
```

# JSON Body Fields

Use `@Spec.Body` for JSON request bodies.

```java
@PostMapping("/projects/search")
public Page<ProjectDto> searchProjects(
        @Spec.Body(name = "filters.id", attribute = "id")
        @Spec.Body(name = "filters.name", attribute = "name", operator = ContainsIgnoreCase.class)
        @Spec.Body(name = "filters.status", attribute = "status", operator = In.class)
        Specification<Project> spec,
        @RequestBody SearchRequest request
) {
    return projectRepository.findAll(spec, request.pageable()).map(projectMapper::toDto);
}
```

Example body:

```json
{
  "filters": {
    "id": 42,
    "name": "billing",
    "status": ["ACTIVE", "PAUSED"]
  },
  "page": 0,
  "size": 20
}
```

Body keys support dot notation. Literal dotted keys are checked before nested object traversal, so both forms work:

```json
{ "filters.status": ["ACTIVE"] }
```

```json
{ "filters": { "status": ["ACTIVE"] } }
```

Servlet request bodies are normally single-read. If `@Spec.Body` and `@RequestBody` are used in the same handler, enable:

```properties
cariochi.spec.body-repeatable=true
```

# Custom Conditions

Use `@Spec.Condition` when a value comes from application code instead of the HTTP request. This is a good fit for
tenant isolation, permissions, user-scoped regions, or other access-control filters.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Condition(attribute = "organization.region", resolver = UserAllowedRegions.class, operator = In.class)
        @Spec.Param(name = "status", operator = In.class)
        Specification<Project> spec,
        Pageable pageable
) {
    return projectRepository.findAll(spec, pageable).map(projectMapper::toDto);
}
```

The resolver is a `Function<String, ?>`. It can be a Spring bean; if no bean exists, Spring creates it through the bean
factory.

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

# Expressions

Use `@Spec.Expression` when the default `AND` combination is not enough.

```java
@GetMapping("/projects")
public Page<ProjectDto> findProjects(
        @Spec.Param(name = "id")
        @Spec.Param(name = "name", operator = ContainsIgnoreCase.class)
        @Spec.Param(name = "status", operator = In.class)
        @Spec.Param(name = "labels", operator = In.class)
        @Spec.Expression("(id || name) && (status || labels)")
        Specification<Project> spec,
        Pageable pageable
) {
    return projectRepository.findAll(spec, pageable).map(projectMapper::toDto);
}
```

Supported operators:

| Logical operator | Symbolic form | Text form |
| --- | --- | --- |
| AND | `&&` | `AND` |
| OR | `\|\|` | `OR` |
| NOT | `!` | `NOT` |

Parentheses are supported.

Conditions declared on the parameter but not referenced by the expression are still included and combined with `AND`.

By default, expressions are lenient: a missing condition alias evaluates as an absent predicate. To fail when an
expression references an unknown or missing alias:

```java
@Spec.Expression(value = "(id || name) && status", strict = true)
```

# Operators

Built-in operators:

| Category | Operators |
| --- | --- |
| Equality | `Equal`, `NotEqual` |
| Membership | `In`, `NotIn` |
| String matching | `Contains`, `ContainsIgnoreCase`, `StartsWith`, `StartsWithIgnoreCase` |
| Null checks | `IsNull`, `IsNotNull` |
| Comparison | `GreaterThan`, `GreaterThanOrEqualTo`, `LessThan`, `LessThanOrEqualTo` |

## Custom Operators

Implement `Operator` directly when you need full control, or implement `BaseOperator` for the common case where you only
need to build a predicate for an attribute and converted value.

```java
public class EndsWithIgnoreCase<T> implements BaseOperator<T, String, String> {

    @Override
    public Specification<T> buildSpecification(SpecAttribute<T, String> attribute, SpecValue<String> specValue) {
        return (root, query, cb) -> {
            Path<String> path = attribute.resolve(root);
            String value = specValue.convertTo(String.class);
            return cb.like(cb.lower(path), "%" + value.toLowerCase());
        };
    }
}
```

Then use it in an annotation:

```java
@Spec.Param(name = "emailDomain", attribute = "email", operator = EndsWithIgnoreCase.class)
Specification<User> spec
```

Custom operators can be registered as Spring beans. If no bean exists, the library asks Spring to create the operator.

# Attribute Paths

The default attribute resolver supports:

- simple attributes: `status`
- nested attributes: `organization.region`
- collection joins: `labels`
- map keys and values: `properties.key`, `properties.value`

Override the default `AttributeResolver` with your own Spring bean when your project needs aliases, stricter validation,
or different join behavior.

# Error Handling

The library fails fast for invalid filter definitions and includes the failing condition in the error message.

Examples of reported problems:

- missing required values
- invalid JSON body for `@Spec.Body`
- failed conversion from request value to entity attribute type
- invalid attribute path
- invalid or strict expression alias

# License

The library is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
