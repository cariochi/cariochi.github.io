# Overview

## Introduction

**Objecto** is a powerful open-source Java library designed to streamline the generation of random objects and data structures. With a focus on simplicity and flexibility, **Objecto** allows developers to create random instances of objects for various use cases, including testing and data initialization.

## Maven Dependency

To add **Reflecto** to your project, include the following dependency in your `pom.xml`

```xml
<dependency>
    <groupId>com.cariochi.objecto</groupId>
    <artifactId>objecto</artifactId>
    <version><!-- Use the latest version --></version>
</dependency>
```

You can find the latest version on [Maven Repository](https://mvnrepository.com/artifact/com.cariochi.objecto/objecto).

## Key Concepts

### Object Factories

**Objecto** revolves around the concept of object factories, which are central to its design and functionality. Developers define interfaces or abstract classes known as factories to specify how objects should be generated. These factories serve as blueprints for creating objects with predetermined configurations, streamlining the object creation process, especially in testing scenarios.

After defining a factory, the next step is to create an instance of this factory. **Objecto** provides a simple and intuitive way to instantiate these factories, enabling developers to generate random objects effortlessly. By leveraging the `Objecto.create()` method, developers can obtain an instance of their defined factory and use it to create objects according to the specifications laid out in the factory's design.

**Example Definition:**

```java
public interface IssueFactory {
    Issue createIssue();
}

public abstract class IssueFactory {
    public abstract Issue createIssue();
}
```

**Example Usage:**

```java
IssueFactory issueFactory = Objecto.create(IssueFactory.class);
Issue randomIssue = issueFactory.createIssue();
```

In addition to basic object generation, developers have the flexibility to customize their factories according to specific needs. **Objecto's** "[Generation](generation.md)" and "[Modification](modification.md)" sections detail a variety of features that enable fine-tuning of the object creation process. These features allow for the modification of object properties, the generation of complex nested structures, and the application of custom generation logic, among others. By utilizing these capabilities, developers can tailor their factories to produce objects that precisely fit the requirements of their testing scenarios, ensuring comprehensive and effective tests.

### Custom Factory Methods

Developers can also implement their own factory methods to create objects with specific values. These factory methods can be [customized](modification.md#applying-modifications-to-custom-factory-methods) according to the developer's requirements.

#### Example

```java
default Issue createDefaultIssue(User assignee) {
    return Issue.builder()
            .key("DEFAULT")
            .type(Type.STORY)
            .status(Status.OPEN)
            .assignee(assignee)
            .build();
}
```

## License

**Objecto** library is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
