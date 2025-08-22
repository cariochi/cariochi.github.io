---
title: Spring Data Web Spec
---

# Overview

**Spring Data Web Spec** is an **open-source library** for annotation-based mapping from web requests (query parameters, headers, path variables, and security
context) to Spring Data JPA Specifications.

* Declare filters directly in controller method parameters
* Integrates seamlessly with **Spring MVC** and **Spring Data JPA**
* Extensible **operator** model (`Equal`, `In`, `ContainsIgnoreCase`, `IsNull`, etc.)
* Built-in **access control** support via `@Spec.AccessControl` for security-based filters
* Minimal runtime dependencies
* **Spring Boot autoconfiguration** and optional `@EnableWebSpec` annotation for easy setup

👉 Source code is available on [GitHub](https://github.com/cariochi/spring-data-web-spec).

# Installation

**Maven**

```xml

<!-- https://mvnrepository.com/artifact/com.cariochi.spec/spring-data-web-spec -->
<dependency>
    <groupId>com.cariochi.spec</groupId>
    <artifactId>spring-data-web-spec</artifactId>
    <version>1.0.2</version>
</dependency>
```

# Quick start

## Configuration

You can register the argument resolver in one of two ways:

### 1. Spring Boot autoconfiguration (recommended)

If you use **Spring Boot 3.x** and have **spring-data-web-spec** on the classpath, the `SpecArgumentResolver` will be auto-registered.
Autoconfiguration is enabled by default but can be disabled via:

```properties

cariochi.spec.web.enabled=false
```

### 2. Manual registration via @EnableWebSpec

If you don’t want to rely on **autoconfiguration** (or you use plain **Spring MVC without Boot**), annotate your configuration class:

```java

@EnableWebSpec
@Configuration
public class WebConfig {
}
```

## Example Usage

```java

@RestController
@RequiredArgsConstructor
class DummyController {

    private final DummyService service;
    private final DummyMapper mapper;

    @GetMapping("/organizations/{organizationId}/dummy")
    public Page<DummyDto> findAll(
            @Spec.PathVariable(name = "organizationId", path = "organization.id", required = true)
            @Spec.RequestParam(name = "id")
            @Spec.RequestParam(name = "status", operator = In.class)
            @Spec.RequestParam(name = "name", operator = ContainsIgnoreCase.class)
            @Spec.RequestParam(name = "propertyValue", path = "properties.value", joinType = JoinType.INNER, operator = In.class, distinct = true)
            @Spec.RequestHeader(name = "region", path = "organization.region")
            @Spec.AccessControl(path = "organization.region", valueSupplier = UserAllowedRegions.class, operator = In.class)
            Specification<DummyEntity> specification,
            Pageable pageable
    ) {
        return service.findAll(specification, pageable)
                .map(mapper::toDto);
    }
}
```

# How it works

1. Annotate a `Specification<T>` method parameter with one or more source annotations:

    * `@Spec.RequestParam` — query parameter
    * `@Spec.RequestHeader` — HTTP header
    * `@Spec.PathVariable` — URI path variable
    * `@Spec.AccessControl` — security-based, no request value needed

2. `SpecArgumentResolver`:

    * Reads the values from the HTTP request or security context.
    * Converts them using **Spring’s ConversionService**.
    * Passes them to the chosen operator.

3. An operator implements:

   ```java
   
   interface SpecOperator<T, Y, V> {
     Specification<T> buildSpecification(SpecContext<T, Y, V> ctx);
   }
   ```

4. All generated specifications are combined with **AND** logic.

# Built-in operators

* Equal, NotEqual
* In, NotIn
* Contains, ContainsIgnoreCase
* StartWith, StartWithIgnoreCase
* IsNull, IsNotNull
* GreaterThan, GreaterThanOrEqualTo, LessThan, LessThanOrEqualTo

**You can also implement custom operators.**

# Access control / security

Use `@Spec.AccessControl` for filters without request input, e.g., enforcing user-specific restrictions.

**Example:**

Value Supplier can be a `Supplier<List<String>>` that returns the allowed regions for the current user:

```java

@Component
@RequiredArgsConstructor
class UserAllowedRegions implements Supplier<List<String>> {

    private final UserService userService;

    @Override
    public List<String> get() {
        return userService.getUserAllowedRegions();
    }
}
```

Usage example:

```java

@Spec.AccessControl(
        path = "organization.region",
        valueSupplier = UserAllowedRegions.class,
        operator = In.class
)
```

This will automatically restrict queries to allowed regions for the current user.

# License

The library is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
