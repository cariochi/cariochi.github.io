---
title: REFLECTO
---

# Overview

## Introduction

**Reflecto** is an open-source Java library designed to streamline and simplify the usage of Java reflection. With **Reflecto**, developers can effortlessly access and
manipulate fields, invoke methods, and work with complex types. Whether navigating through nested objects or interacting with collections, **Reflecto** provides an
intuitive interface, making reflection tasks more accessible and developer-friendly.

Key Features:

* **Type Handling:** Easily create and manage types for various data structures.
* **Field Operations:** Seamlessly get and set field values, even within nested structures.
* **Method Invocation:** Invoke methods with or without parameters, including interactions with collections.
* **Mixed Usage:** Combine field access and method invocation in a cohesive manner.

## Maven Dependency

To add **Reflecto** to your project, include the following dependency in your `pom.xml`

```xml

<!-- https://mvnrepository.com/artifact/com.cariochi.reflecto/reflecto -->
<dependency>
    <groupId>com.cariochi.reflecto</groupId>
    <artifactId>reflecto</artifactId>
    <version>2.0.2</version>
</dependency>
```

# Type Creation

## Overview

Cariochi Reflecto's `Types` class offers a rich set of utilities for creating and manipulating Java `Type` instances dynamically, facilitating operations that would
otherwise be verbose or cumbersome. This section delves deeper into the functionality provided by the `Types` class, highlighting its versatility in working with generic
types, arrays, and type wildcards.

## Key Features

* **Fluent API**: A clean and intuitive interface for type creation and manipulation.
* **Support for Complex Types**: Easy creation of generic types, arrays, and nested generics.
* **Type Safety and Convenience**: Compile-time checks and utilities to reduce boilerplate.
* **Enhanced Readability**: Simplifies the representation of complex type declarations.

## Core Methods

* **`type(Class<?> rawType, Type... typeArguments)`:** Allows for the construction of parameterized types by specifying a raw type and its type arguments, offering
  flexibility in defining complex generic types.
* **`type(String typeName)`:** Enables the creation of types from their string representation, supporting dynamic type resolution from string values.
* **`listOf(Type type)`:** Produces a `Type` representing a `List` containing elements of the specified type, simplifying the declaration of generic `List` types.
* **`setOf(Type type)`:** Generates a `Type` representing a `Set` containing elements of the specified type, facilitating the creation of generic `Set` types.
* **`mapOf(Type keyType, Type valueType)`:** Creates a `Type` representing a `Map` with specified key and value types, making it straightforward to work with generic
  `Map` types.
* **`arrayOf(Type type)`:** Constructs a `Type` representing an array of a given type, useful for dynamic array type creation.
* **`optionalOf(Type type)`:** Constructs a `Type` representing an Optional of a given type.
* **`streamOf(Type type)`:** Constructs a `Type` representing a Strem of a given type.
* **`any()`:** Creates a wildcard type `?`, useful for representing an unknown type in a generic context.
* **`anyExtends(Type type)`:** Generates a wildcard type with an upper bound, `? extends Type`, allowing for flexibility in generic type constraints.
* **`anySuper(Type type)`:** Creates a wildcard type with a lower bound, `? super Type`, useful for defining a lower inclusive boundary for a generic type.

## Enhanced Flexibility and Type Safety

The `Types` class significantly enhances the flexibility and type safety of dynamic type operations in Java. By abstracting the complexity of Java's type system and
providing a more intuitive interface, it empowers developers to focus on the logic of their applications without getting bogged down in verbose type declarations.

## Usage Examples

#### Basic Type Declarations

```java

// MyType<String, Long>
Type myType = Types.type(MyType.class, String.class, Long.class);

// List<Double>
Type listType = Types.listOf(Double.class);

// Set<String>
Type setType = Types.setOf(String.class);

// Map<String, Integer>
Type mapType = Types.mapOf(String.class, Integer.class); 
```

#### Arrays and Nested Generics

```java

// List<String>[]
Type arrayOfListType = Types.arrayOf(Types.listOf(String.class));

// List<Map<String, Integer>>
Type nestedGenericType = Types.type(List.class, Types.mapOf(String.class, Integer.class)); 
```

#### Complex Type Creations

```java

// Map<String, Supplier<User>>
Type complexMapType = Types.mapOf(String.class, Types.type(Supplier.class, User.class)); 
```

#### Types with Wildcards Creation

```java

// List<?>
Type unboundedWildcardType = Types.listOf(Types.any());

// List<? extends Number>
Type upperBoundedWildcardType = Types.listOf(Types.anyExtends(Number.class));

// List<? super Integer>
Type lowerBoundedWildcardType = Types.listOf(Types.anySuper(Integer.class));

// Map<String, List<? extends Serializable>>
Type complexNestedType = Types.mapOf(String.class, Types.listOf(Types.anyExtends(Serializable.class)));
```

#### Creating a Type instance from the string representation

```java

// List<String>
Type typeByName = Types.type("java.util.List<java.lang.String>");

// List<Supplier<? extends MyType>>
Type complexTypeByName = Types.type("java.util.List<java.util.function.Supplier<? extends com.cariochi.reflecto.examples.MyType>>");
```

## Advanced Usage

The `Types` class enables sophisticated type manipulation, supporting scenarios ranging from simple collections to deeply nested generic structures. Its methods provide a
straightforward way to represent and work with such types, significantly reducing the complexity and verbosity commonly associated with Java's type system.

## Conclusion

The Cariochi Reflecto `Types` class offers a powerful and user-friendly toolkit for Java developers to work with types dynamically and reflectively. By leveraging its
capabilities, developers can enhance the readability, maintainability, and flexibility of their code, especially when dealing with complex type systems and
reflection-based operations.

# Reflecting Types

## Overview

The `ReflectoType` class is a cornerstone of the Cariochi Reflecto library, offering a rich and intuitive interface for comprehensive type introspection and manipulation
in Java. It simplifies accessing detailed information about any given type, making reflective programming more accessible and powerful.

## Complete Type Information

`ReflectoType` provides a unified approach to access a wealth of information about types:

* **Actual Type and Arguments**: Discern the actual type, including generic type arguments, enabling precise type manipulation and inspection.
* **Fields and Methods**: Access detailed information about fields and methods, including their types, visibility, and whether they are static or instance members. Choose
  between declared members or all class members.
* **Modifiers**: Examine a type's modifiers, such as visibility (public, private), abstraction (abstract classes, interfaces), and more.
* **Constructors**: List a type's constructors, facilitating dynamic object instantiation.
* **Super Type and Interfaces**: Identify a type's superclass and implemented interfaces, preserving generic type information.
* **Special Types**: Special handling for arrays and enums, including component type access and enum constant retrieval.
* **Utility Methods**: Includes methods like `is()`, `as()`, `isAssignableFrom()`, and `isInstance()` to query type properties and relationships intuitively.

## Example Usage

Here are some practical examples demonstrating the power of `ReflectoType`:

#### Constructors

```java

// ArrayList<String> type to discover
Type type = Types.type(ArrayList.class, String.class);

ReflectoType reflection = reflect(type);

List<ReflectoConstructor> constructors = reflection.constructors().list();
List<ReflectoConstructor> declaredConstructors = reflection.constructors().declared().list();

// find constructor by arguments types
ReflectoConstructor constructor = reflection.constructors().get(Collection.class);

Object instance = constructor.newInstance(Set.of(1));
```

#### Methods

```java

// lists all methods
List<ReflectoMethod> methods = type.methods().list();

// lists declared methods
List<ReflectoMethod> declaredMethods = type.methods().declared().list();

// retrieves the ReflectoMethod for the "setUsername" method with a String parameter from the type.
ReflectoMethod method = type.methods().get("setUsername(?)", String.class);

// binds the ReflectoMethod to the target object (user) and creates a TargetMethod.
TargetMethod targetMethod = method.withTarget(user);

// invokes the "setUsername" method on the target object (user) with "test_user" as the argument.
targetMethod.

invoke("test_user");

// filter methods with multiple criteria
List<ReflectoMethods> postProcessors = type.methods().declared().stream()
        .filter(method -> method.modifiers().isPublic())
        .filter(method -> method.annotations().contains(PostProcessor.class))
        .filter(method -> method.returnType().is(void.class))
        .filter(method -> method.parameters().size() == 1)
        .collect(Collectors.toList());

// retrieves the ReflectoMethod for the static "sayHello" method with a String parameter from the type.
ReflectoMethod method = type.methods().get("sayHello(?)", String.class);

// converts the ReflectoMethod into a static method representation, as it doesn't require a target instance.
TargetMethod staticMethod = method.asStatic();

// invokes the static "sayHello" method with the argument "World" and stores the result.
String result = staticMethod.invoke("World");
```

#### Fields

```java

// list all fields
List<ReflectoField> fields = type.fields().list();

// list declared fields
List<ReflectoField> declaredFields = type.fields().declared().list();

// find field
ReflectoField field = type.fields().get("username");

// binds the ReflectoField to the target object (user) and creates a TargetField.
TargetField targetField = field.withTarget(user);

// retrieves the current value of the 'username' field from the target object (user).
String username = targetField.getValue();

// sets a new value ("test_user") for the 'username' field on the target object (user).
targetField.

setValue("test_user");


// filter fields
List<ReflectoField> fields = type.fields().declared().stream()
        .filter(field -> field.modifiers().isPrivate())
        .filter(field -> field.annotations().contains(NotNull.class))
        .filter(field -> field.type().is(String.class))
        .collect(toList());

// Retrieves the ReflectoField for the static field "NAME" of type String from the type.
ReflectoField field = type.fields().get("NAME", String.class);

// Converts the ReflectoField into a static field representation, as it doesn't require a target instance.
TargetField staticField = field.asStatic();

// Retrieves the current value of the static field "NAME".
String name = staticField.getValue();

// Sets a new value ("New Name") for the static field "NAME".
staticField.

setValue("New Name");
```

#### Working with Arrays and Enums

```java

ReflectoType arrayType = Reflecto.reflect(String[].class);
boolean isArray = arrayType.isArray();
ReflectoType componentType = arrayType.asArray().componentType();

ReflectoType enumType = Reflecto.reflect(MyEnum.class);
boolean isEnum = enumTypee.isEnum();
List<Object> enumType = enumType.asEnum().constants();
```

#### Methods for Type Checking

```java

// Reflects the List<String> type.
ReflectoType type = Reflecto.reflect(Types.listOf(String.class));

boolean isIterable = type.is(Iterable.class); // true
boolean isIterableOfStrings = type.is(Types.type(Iterable.class, String.class)); // true
boolean isIterableOfLongs = type.is(Types.type(Iterable.class, Long.class)); // false

Class<?> firstGenericArgument = type.as(Iterable.class).arguments().get(0).actualType(); // String.class

boolean isAssignableFromArrayList = type.isAssignableFrom(ArrayList.class); // true
boolean isAssignableFromArrayListOfStrings = type.isAssignableFrom(Types.type(ArrayList.class, String.class)); // true
boolean isAssignableFromArrayListOfLongs = type.isAssignableFrom(Types.type(ArrayList.class, Long.class)); // false

boolean isInstanceOfArrayList = type.isInstance(new ArrayList<>()); // true
```

#### Inspecting Types

This example demonstrates how to use the Reflecto library to introspect generic types in Java, using a `Dto<T>` class as the case study.

```java

// Example Dto class with generics
public static class Dto<T> {
    private T value;
    private Dto<T> child;
    private Set<Dto<T>> set;
    private Map<String, Set<Dto<T>>> map;
}

Type type = Types.type(Dto.class, Integer.class);
ReflectoType reflectoType = Reflecto.reflect(type);

// Get the actual type of the first generic argument (T), which is Integer
Class<?> firstGenericArgumentType = reflectoType.arguments().get(0).actualType(); // Integer.class
Class<?> firstArgumentFromPath = reflectoType.reflect("[0]").actualType(); // Integer.class

// Get the actual type of the 'value' field, which is Integer (matches T)
Class<?> valueFieldType = reflectoType.reflect("value").actualType(); // Integer.class

// Get the actual type of the 'child.value' field, which is Integer (nested access of generic field)
Class<?> childValueType = reflectoType.reflect("child.value").actualType(); // Integer.class

// Get the actual type of the first argument (T) of the first element in the 'set' (Set<Dto<T>>), which is Integer
Class<?> setElementType = reflectoType.reflect("set[0][0]").actualType(); // Integer.class

// Get the actual type of the 'value' field (T) within the first element of 'set' (Set<Dto<T>>), which is Integer
Class<?> setElementValueType = reflectoType.reflect("set[0].value").actualType(); // Integer.class

// Get the actual type of the first generic argument (String) in the 'child.map' field (Map<String, Set<Dto<T>>>)
Class<?> mapKeyType = reflectoType.reflect("child.map[0]").actualType(); // String.class

// Get the actual type of the 'value' field (T) within the first element of the second generic argument (Set<Dto<T>>) in the 'child.map' field, which is Integer
Class<?> mapElementValueType = reflectoType.reflect("child.map[1][0].value").actualType(); // Integer.class
```

## Conclusion

The `ReflectoType` class from Cariochi Reflecto offers a comprehensive toolkit for working with Java types reflectively. It simplifies obtaining detailed information
about types, their relationships, and their members, enabling developers to write more dynamic, type-safe, and intuitive reflective code. Whether dealing with complex
generic types, navigating type hierarchies, or performing runtime type checks and conversions, `ReflectoType` provides all the necessary functionalities in an accessible
manner.\

# Reflecting Objects

## Overview

The Cariochi Reflecto library simplifies Java reflection, allowing developers to access and manipulate object fields, invoke methods, and work with collections in a more
intuitive way. Below are examples demonstrating the core functionalities of Reflecto.

## Example Usage

### Initial Object for Examples

```java

Bug bug = Bug.builder()
        .id(1)
        .summary("Invalid value")
        .reporter(new User(100, "qa"))
        .watchers(new ArrayList<>(List.of(
                new User(101, "developer"),
                new User(102, "manager")
        )))
        .details(new HashMap<>(Map.of(
                "Sprint", new Details("SPR-001"),
                "Component", new Details("Authorization")
        )))
        .build();
```

### Methods

```java

List<TargetMethod> methods = Reflecto.reflect(bug).methods().list();

User reporter = Reflecto.reflect(bug).methods().find("getReporter()")
        .map(TargetMethod::invoke)
        .map(User.class::cast)
        .orElseThrow();

Reflecto.reflect(bug).methods().find("setReporter(?)",User.class)
    .ifPresent(method -> method.invoke(reporter));    
```

### Fields

```java

List<TargetField> fields = Reflecto.reflect(bug).fields().list();

User reporter = Reflecto.reflect(bug).fields().find("reporter")
        .map(TargetField::getValue)
        .map(User.class::cast)
        .orElseThrow();
    
Reflecto.reflect(bug).fields().find("reporter")
    .ifPresent(field -> field.setValue(reporter));
```

### Simple Field Access and Modification

```java

// Getting Value

String username = Reflecto.reflect(bug)
        .reflect("reporter.username")
        .getValue();

String username = Reflecto.reflect(bug)
        .invoke("reporter.username");

// Setting Value

Reflecto.reflect(bug)
        .reflect("reporter.username")
        .setValue("new_name");

Reflecto.reflect(bug)
        .invoke("reporter.username=?", "new_name");
```

### Working with Lists/Arrays

```java
// Getting Value

String username = Reflecto.reflect(bug)
        .reflect("watchers[0].username")
        .getValue();

String username = Reflecto.reflect(bug)
        .reflect("watchers[?].username", 0)
        .getValue();

String username = Reflecto.reflect(bug)
        .invoke("watchers[0].username");

String username = Reflecto.reflect(bug)
        .invoke("watchers[?].username", 0);

// Setting Value

Reflecto.reflect(bug)
        .reflect("watchers[0]")
        .setValue(new User("user4"));

Reflecto.reflect(bug)
        .reflect("watchers[?]",0)
        .setValue(new User("user4"));

Reflecto.reflect(bug)
        .invoke("watchers[0]=?", new User("user4"));

Reflecto.reflect(bug)
        .invoke("watchers[?]=?", 0, new User("user4"));
```

### Working with Maps

```java

// Getting Value

String sprint = Reflecto.reflect(bug)
        .reflect("details[Sprint].text")
        .getValue();

String sprint = Reflecto.reflect(bug)
        .reflect("details[?].text", "Sprint")
        .getValue();

String sprint = Reflecto.reflect(bug)
        .invoke("details[Sprint].text");

String sprint = Reflecto.reflect(bug)
        .invoke("details[?].text", "Sprint");

// Setting Value

Reflecto.reflect(bug)
        .reflect("details[Sprint]")
        .setValue(new Details("SPR-002"));

Reflecto.reflect(bug)
        .reflect("details[?]", "Sprint")
        .setValue(new Details("SPR-002"));

Reflecto.reflect(bug)
        .invoke("details[Sprint]=?", new Details("SPR-002"));

Reflecto.reflect(bug)
        .invoke("details[?]=?","Sprint", new Details("SPR-002"));
```

### Invoking Methods

```java

String username = Reflecto.reflect(bug)
        .reflect("getWatchers().get(?).getUsername()", 0)
        .getValue();

Reflecto.reflect(bug)
        .invoke("getWatchers().get(?).setUsername(?)", 0, "new_name");
        
Reflecto.reflect(bug)
        .invoke("getDetails().remove(?)", "Sprint");
        
Reflecto.reflect(bug)
        .invoke("getDetails().put(?, ?)", "Sprint", new Details("SPR-002"));
```

### Mixed Usage

```java

String username = Reflecto.reflect(bug)
        .reflect("watchers[0].getUsername()")
        .getValue();

String username = Reflecto.reflect(bug)
        .reflect("watchers[?].getUsername()", 0)
        .getValue();

String username = Reflecto.reflect(bug)
        .reflect("getWatchers()[0].getUsername()")
        .getValue();

String username = Reflecto.reflect(bug)
        .reflect("getWatchers()[?].getUsername()", 0)
        .getValue();

Reflecto.reflect(bug)
        .invoke("getWatchers().get(?).username=?", 0, "new_name");
        
Reflecto.reflect(bug)
        .invoke("details[Sprint].setText(?)", "SPR-002");
        
Reflecto.reflect(bug)
        .invoke("details[?].setText(?)", "Sprint", "SPR-002");
```

# License

**Reflecto** library is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

