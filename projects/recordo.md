---
title: RECORDO
---

# Overview

**Recordo** is a **JUnit 5
** extension that simplifies testing and json resource handling by implementing common functionality in a declarative manner. It can record or generate json files if they
are absent, ensuring fast, deterministic, and accurate tests.
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

# Setup

## Maven Dependencies

You can include individual modules as needed or add all modules at once using the `recordo-all` artifact.

### All Modules

To include all modules:

```xml
<dependency>
    <groupId>com.cariochi.recordo</groupId>
    <artifactId>recordo-all</artifactId>
    <version><!-- Use the latest version --></version>
    <type>pom</type>
    <scope>test</scope>
</dependency>
```

### Individual Modules

Alternatively, you can include any of the following modules separately:

```xml
<!-- Read Module -->
<dependency>
    <groupId>com.cariochi.recordo</groupId>
    <artifactId>recordo-read</artifactId>
    <version><!-- Use the latest version --></version>
    <scope>test</scope>
</dependency>

<!-- Assertions Module -->
<dependency>
<groupId>com.cariochi.recordo</groupId>
<artifactId>recordo-assertions</artifactId>
<version><!-- Use the latest version --></version>
<scope>test</scope>
</dependency>

<!-- MockMvc Module -->
<dependency>
<groupId>com.cariochi.recordo</groupId>
<artifactId>recordo-spring-mockmvc</artifactId>
<version><!-- Use the latest version --></version>
<scope>test</scope>
</dependency>

<!-- MockServer Module -->
<dependency>
<groupId>com.cariochi.recordo</groupId>
<artifactId>recordo-mockserver</artifactId>
<version><!-- Use the latest version --></version>
<scope>test</scope>
</dependency>
```

You can find the latest version on [Maven Repository](https://mvnrepository.com/artifact/com.cariochi.recordo).

## Compatibility

* **Versions 1.x.x**: Compatible with **Java 11+** and **Spring 5.x** (**Spring Boot 2.x**).
* **Versions 2.x.x**: Compatible with **Java 17+** and **Spring 6.x** (**Spring Boot 3.x**).

**Important Note:** Three of the four modules (`recordo-read`, `recordo-assertions`, and `recordo-mockserver`) can be used in projects that do not utilize the **Spring
Framework**. Only `recordo-spring-mockmvc` requires **Spring**.

## Initialize Extension

To set up **Recordo** for your test, simply use the `RecordoExtension`.

```java

@ExtendWith(RecordoExtension.class)
class BookServiceTest {
    ...
}
```

## **ObjectMapper**

**Recordo** uses the Jackson **ObjectMapper** for JSON operations. The logic for locating the **ObjectMapper** instance is as follows:

1. As the highest priority, the **ObjectMapper** field annotated with the `@EnableRecordo` annotation will be used, if present.
2. If **Spring** is being used and the test doesn't have a field, the library will use the **ObjectMapper** bean from the Spring context if available.
3. In all cases other than the specific ones where a custom **ObjectMapper** instance is provided, the library will utilize its default **Recordo** **ObjectMapper**
   instance.

# Read Module

The **Recordo Read** module is designed to enhance the testing experience in JUnit. This module introduces flexible and convenient ways to create test objects by
seamlessly integrating external JSON data.

If the specified JSON file is missing, **Recordo** will automatically create a new file with an object structure and populate it with random values. This feature
streamlines test preparation, allowing developers to focus on establishing anticipated values without the need for manual file creation.

The module provides three convenient approaches for reading objects:&#x20;

[#interface-based-object-factory](read.md#interface-based-object-factory "mention")

[#parameterized-object-factory](read.md#parameterized-object-factory "mention")

[#direct-object-creation](read.md#direct-object-creation "mention")

## **Annotation Parameters**

The `@Read` annotation has two parameters:

<table><thead><tr><th width="173">Name</th><th width="102">Type</th><th>Description</th></tr></thead><tbody><tr><td><strong>value</strong></td><td>String</td><td>Path to JSON file</td></tr><tr><td><strong>objectMapper</strong></td><td>String</td><td>Name of ObjectMapper bean or test class field</td></tr></tbody></table>

## Interface-based **Object Factory**

Developers can define interfaces with the `@RecordoObjectFactory` annotation to instruct **Recordo** on how to create objects. Here's an example interface:

The **Interface-based Object Factories** feature is built upon the [Cariochi Objecto](broken-reference) library, inheriting all the capabilities of **Objecto** while
expanding its functionality. Additionally, it introduces the usage of the `@Read` annotation for factory methods, altering the behavior of the method by transforming it
from generating a random object on each invocation to generating it only upon the first usage and subsequently persisting it to a file.

For detailed information and documentation regarding the **Objecto** library, please refer to the [Objecto documentation](broken-reference).

### Declaration

```java

@RecordoObjectFactory
public interface LogRecordObjectFactory {

    // Factory methods with @Read annotation
    @Read("/messages/log.json")
    LogRecord getLogRecord();

    @Read("/messages/log.json")
    LogRecord getLogRecord(@Modifier("id") Long id);

    @Read("/messages/logs.json")
    List<LogRecord> getLogRecords();

    @Read("/files/output.zip")
    byte[] getOutputFile();

    // Modification methods without @Read annotation
    @Modifier("id")
    LogRecordObjectFactory withId(Long id);

    @Modifier("responses[0].status")
    LogRecordObjectFactory withFirstResponseStatus(ResponseStatus status);

    @Modifier("responses[*].status")
    LogRecordObjectFactory withAllResponseStatuses(ResponseStatus status);

}
```

**Factory Methods:**

Methods annotated with `@Read` represent factory methods for creating objects, specifying the JSON file paths and parameters.

* **Return Type:** The factory method's return type should be the object you want to create.
* **@Read Annotation:** Apply the `@Read` annotation to specify the path to the JSON file containing the object's data.
* **Parameters:** If the object creation involves parameters, use method parameters annotated with `@Modifier`  to specify the paths within the object that need to be
  modified.

**Modification Methods:**

Methods annotated with `@Modifier` serve as modification methods, allowing developers to alter the factory object with specific parameters.

* **Return Type:** The return type should be the same factory interface (`LogRecordObjectFactory` in this case).
* **@Modifier Annotation:** Use the `@Modifier` annotation on methods to specify the paths within the object that need to be modified.

### Usage

```java

@ExtendWith(RecordoExtension.class)
class MyTest {

    private TestDtoObjectFactory objectFactory = Recordo.create(TestDtoObjectFactory.class);

    @Test
    void createLogRecord() {

        // Use factory methods to create LogRecord objects
        LogRecord log = factory.getLogRecord();

        // ...

        // Create a new LogRecord using the modification methods
        LogRecord modifiedLog = factory
                .withId(123)
                .withFirstResponseStatus(ResponseStatus.SUCCESS)
                .getLogRecord()

        // ...

        // Use factory methods to read file content
        byte[] fileContent = factory.getOutputFile();

        // ...

    }
}
```

## Parameterized Object Factory

Developers can use the `ObjectFactory` class along with the `@Read` annotation to create objects with specified parameters.&#x20;

### Usage example

```java
@Read("/messages/log.json")
private ObjectFactory<LogRecord> logFactory;

@Test
void shouldGetLogStats() {
    // Given
    List<LogRecord> logs = List.of(

            // creates a LogRecord object with default values
            logFactory.create(),

            // creates a LogRecord object with the "id" field set to "TEST-100"
            logFactory.with("id", "TEST-100").create(),

            // creates a LogRecord object with the status of the second response set to FAILED
            logFactory.with("responses[1].status", ResponseStatus.FAILED).create(),

            // creates a LogRecord object with an empty list for the "responses" field
            logFactory.with("responses", emptyList()).create()

    );

    // Perform additional test logic with the created LogRecord objects
    // ...
}
```

### How it Works

1. **@Read Annotation:** Annotate a field of type `ObjectFactory<T>` with the `@Read` annotation, where `T` is the type of object to be created.
2. **ObjectFactory Methods:**
    * **create():** Create an object using the default values specified in the associated JSON file.
    * **with(String key, Object value):** Specify a key-value pair to modify the object being created. The key uses a JSONPath-like syntax.

## Direct Object Creation

Among its features, the module offers a straightforward method for creating objects directly within test methods using the `@Read` annotation.

Developers can use the `@Read` annotation on test methods to effortlessly create objects with default values, simplifying the testing process. This method is suitable for
scenarios where customization or modification of object values is not required.

### Usage Examples

In the given examples, the test methods effortlessly create objects using the data from the JSON file. Developers can focus on writing test logic without additional setup
or object instantiation.

**Single object**

```java

@Test
void should_create_book(
        @Read("/books/book.json") Book book
) {
    ...
}
```

**List of objects**

```java

@Test
void should_read_books(
        @Read("/books/books.json") List<Book> books
) {
    ...
}
```

**Strings**

```java

@Test
void should_parse_string(
        @Read("/books/text.txt") String string
) {
    ...
}
```

**Bytes**

```java

@Test
void should_upload_zip_archive(
        @Read("/books/books.zip") byte[] content
) {
    ...
}
```

### **How it Works**

* **@Read Annotation:** Apply the `@Read` annotation to a method parameter to signify that the associated JSON file should be used to create an object.
* **Default Object Creation:** The `@Read` annotation, when applied directly to a test method parameter, signals Recordo to create an object with default values specified
  in the associated JSON file.

# Assertions Module

## JsonAssertion

Asserts that the actual object is equal as JSON to the expected one stored in a file.

If the expected JSON file is missing, the actual value will be saved as expected.

All you need to do is verify the details, and the test will be ready.

If an assertion fails, the actual value will be saved in a new file for manual comparison.

### JsonAssertion Parameters

#### **.using**(ObjectMapper mapper)

Sets the ObjectMapper to be used for JSON conversion.

#### **.extensible**(boolean value)

Sets whether the comparison should allow for additional properties in the expected JSON.&#x20;

Defaults to false.

#### **.withStrictOrder**(boolean value)

Sets whether the order of elements in the JSON arrays should be strictly enforced.&#x20;

Defaults to true.

#### **.including**(String... fields)

Specifies a list of fields to be included during comparison.&#x20;

Fields can be specified with nested structures using dot notation (e.g., `parent.name`, `user.role.name`).&#x20;

You can also use index for collections and arrays (e.g., `children[0].id`, `issues[0].tags[0].text`) or wildcard character `*` _to match any element (e.g.,_
`children[*].name`, `issues[*].tags[*].text`).

#### **.excluding**(String... fields)

Specifies a list of fields to be excluded during comparison.&#x20;

Fields can be specified with nested structures using dot notation (e.g., `parent.name`, `user.role.name`).&#x20;

You can also use index for collections and arrays (e.g., `children[0].id`, `issues[0].tags[0].text`) or wildcard character `*` _to match any element (e.g.,_
`children[*].name`, `issues[*].tags[*].text`).

### Examples

**Java**

```java

@Test
void should_get_book_by_id() {
    Book actual = bookService.getById(1L);

    JsonAssertion.assertAsJson(actual)
            .isEqualTo("/books/book.json");
}
```

**book.json**

```javascript
{
  "id"
:
  1,
      "title"
:
  "Othello",
      "author"
:
  {
    "id"
  :
    1,
        "firstName"
  :
    "William",
        "lastName"
  :
    "Shakespeare"
  }
}
```

**Java**

```java

@Test
void should_get_books_by_author(
        @Read("/books/author.json") Author author
) {
    Page<Book> actual = bookService.findAllByAuthor(author);

    JsonAssertion.assertAsJson(actual)
            .using(objectMapper)
            .extensible(true)
            .including("content[*].id", "content[*].title", "content[*].author.id")
            .isEqualTo("/books/short_books.json");
}
```

**author.json**

```javascript
{
  "id"
:
  1,
      "firstName"
:
  "William",
      "lastName"
:
  "Shakespeare"
}
```

**short:books.json**

```javascript
{
  "content"
:
  [
    {
      "id": 1,
      "title": "Othello",
      "author": {
        "id": 1
      }
    },
    {
      "id": 2,
      "title": "Macbeth",
      "author": {
        "id": 1
      }
    },
    {
      "id": 3,
      "title": "Richard II",
      "author": {
        "id": 1
      }
    }
  ]
}
```

**Java**

```java

@Test
void should_get_all_books() {
    List<Book> actual = bookService.findAll();

    JsonAssertion.assertAsJson(actual)
            .excluding("author.firstName", "author.lastName")
            .withStrictOrder(false)
            .isEqualTo("/books/short_books.json");
}
```

**short:books.json**

```javascript
{
  "content"
:
  [
    {
      "id": 1,
      "title": "Othello",
      "author": {
        "id": 1
      }
    },
    {
      "id": 2,
      "title": "Macbeth",
      "author": {
        "id": 1
      }
    },
    {
      "id": 3,
      "title": "Richard II",
      "author": {
        "id": 1
      }
    }
  ]
}
```

## CsvAssertion

Asserts that the CSV string matches the expected one from a file.

If the expected CSV file is missing, the actual value will be saved as expected.

You only need to verify them, and then the test will be ready.

If an assertion fails, the actual value will be saved for manual comparison.

### CsvAssertion Parameters

|                         |                                                                       |
|-------------------------|-----------------------------------------------------------------------|
| **withHeaders**         | With header line. Default value is `false`.                           |
| **withStrictOrder**     | Requires strict ordering of array elements. Default value is `false`. |
| **withColumnSeparator** | Default value is `,`                                                  |
| **withLineSeparator**   | Default value is                                                      |

### Examples

```java

@Test
void test() {
    String csv = ...
    CsvAssertion.assertCsv(csv)
            .withHeaders(true)
            .withStrictOrder(false)
            .isEqualsTo("/expected.csv");
}
```

# MockMvc Module

The **Recordo MockMvc** module empowers developers to streamline the testing of controllers using the MockMvc framework, offering two powerful mechanisms for testing
flexibility:

[#api-client-interfaces](mockmvc.md#api-client-interfaces "mention")

[#test-parameters](mockmvc.md#test-parameters "mention")

## API Client Interfaces

Developers can define an interface where they specify the API endpoints they want to test using standard Spring annotations. This intuitive approach simplifies the
testing process, as **Recordo** handles the underlying logic. Developers only need to autowire this interface in their test classes.

### **Example Interface**

```java

@RecordoApiClient(interceptors = AuthInterceptor.class)
@RequestMapping("/users")
public interface UserApiClient {

    @GetMapping("/{id}")
    UserDto findById(@PathVariable int id);

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorDto findById_NotFound(@PathVariable int id);

    @GetMapping
    Page<UserDto> findAll(@RequestParam("q") String query, Pageable pageable);

    @PostMapping("/{id}/pic")
    void uploadPic(@PathVariable int id, @RequestParam Request.File file);

    @PostMapping
    UserDto create(@RequestBody UserDto userDto);

    @DeleteMapping("/{id}")
    void delete(@PathVariable int id);
}
```

### Usage Examples

```java

@ExtendWith(RecordoExtension.class)
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private UserApiClient apiClient;

    @Test
    void should_find_by_id() {
        // ...
        UserDto user = apiClient.findById(1L);
        // ...
    }

    @Test
    void should_get_not_found_error() {
        // ...
        ErrorDto error = apiClient.findById_NotFound(1L);
        // ...
    }

    @Test
    void should_find_all() {
        // ...
        PageRequest pageRequest = PageRequest.of(0, 20, Sort.by(asc("name")));
        Page<UserDto> users = apiClient.findAll("john", pageRequest);
        // ...
    }

    @Test
    void should_create_user(
            @Read("/users/new_user.json") UserDto newUser
    ) {
        // ...
        UserDto createdUser = apiClient.create(newUser);
        // ...
    }

    @Test
    void should_upload_pic() {
        // ...      
        Request.File file = Request.File.builder()
                .name("pic.png")
                .content(fileBytes)
                .build();

        apiClient.uploadPic(1L, file);
        // ...
    }

}

```

## Test Parameters

Developers can declare necessary requests directly as parameters in their test methods, specifying the HTTP method, URI, request body, and other details. This approach
provides fine-grained control over requests.

### **Annotation Parameters**

<table><thead><tr><th width="167">Name</th><th width="241">Type</th><th>Description</th></tr></thead><tbody><tr><td><strong>value</strong></td><td>String</td><td>Request path</td></tr><tr><td><strong>headers</strong></td><td>String[]</td><td>List of headers</td></tr><tr><td><strong>expectedStatus</strong></td><td>HttpStatus</td><td>Expected HTTP status (OK by default)</td></tr><tr><td><strong>interceptors</strong></td><td>Class&#x3C;? extends RequestInterceptor>[]</td><td>List of request Interceptors</td></tr><tr><td><strong>objectMapper</strong></td><td>String</td><td>Name of ObjectMapper bean or test class field</td></tr></tbody></table>

### Usage Examples

```java

@Test
void shouldGetBooks(
        @Get("/users/1/books?page=2") Page<Book> books
) {
    // Perform test assertions using the retrieved books
    // ...
}

@Test
void shouldGetNotFound(
        @Get(value = "/users/1/books?page=2", expectedStatus = HttpStatus.NOT_FOUND) ErrorDto errorDto
) {
    // ...
}

@Test
void shouldCreateBook(
        @Post(value = "/books", expectedStatus = HttpStatus.CREATED) Request<Book> request
) {
    // Create a book instance
    Book book = ...

    // Perform the request and retrieve the response
    Response<Book> response = request.body(book).perform();
    Book createdBook = response.getBody();
    // Perform test assertions using the created book
    // ...
}

@Test
void shouldUpdateBook(
        @Put(value = "/books", body = @Content(file = "/book.json")) Book updatedBook
) {
    // Perform test assertions using the updated book
    // ...
}

@Test
void shouldDeleteBook(
        @Delete(value = "/books/{id}", expectedStatus = HttpStatus.NO_CONTENT) Response<Void> response
) {
    // Perform test assertions for successful deletion
    // ...
}

```

## Type Options

Available in both the API client interfaces and when declaring requests as test parameters

Developers have flexibility in choosing how they handle response and request types. Result Type Options offer a convenient way to interact with API responses for diverse
testing scenarios.

#### 1. Object Result Type (`Page<Book>`, `Book`)

Developers can directly retrieve the response body as an object, simplifying test assertions.&#x20;

**Interface Usage:**

```java

@GetMapping("/{id}")
UserDto findById(@PathVariable int id);
```

**Test Parameter Usage:**

```java
@Get("/users/1/books?page=2") Page<Book> books
```

#### 2. Response Object (`Response<Book>`, `Response<Void>`)

Developers can declare the response type as an object to access detailed information such as status and headers.&#x20;

**Interface Usage:**

```java

@GetMapping("/{id}")
Response<UserDto> findById(@PathVariable int id);
```

**Test Parameter Usage:**

```java
@Get("/users/1/books?page=2") Response<Page<Book>> booksResponse
```

#### 3. Request Object (`Request<Book>`)

Developers can use the `Request` type to perform additional customizations before executing the request.&#x20;

**Interface Usage:**

```java

@GetMapping("/{id}")
Request<UserDto> findById(@PathVariable int id);
```

**Test Parameter Usage:**

```java
@Get("/users/1/books?page=2") Request<Page<Book>> booksRequest
```

# MockServer Module

During the first test run or in the absence of a file, all real interactions are recorded into a file.

Once the file is saved, it is automatically utilized for mocking purposes.

## Setup

### HTTP Interceptor

**Recordo** adds an interceptor to your HTTP client to capture and replay HTTP requests and responses.

\
At present, three HTTP clients are supported:

* Spring RestTemplate
* OkHttp Client
* Apache HTTP Client

**Recordo** searches for an HTTP client in the application context. If you are not using the **Spring** **Framework** or if you don't have an HTTP client or have multiple
ones, you can specify which HTTP client to use by explicitly adding the `@EnableRecordo` annotatio&#x6E;**.**

If you need to use multiple MockServers for different HTTP clients, you can specify the HTTP client bean or the name of the test class field in the \`httpClient\`
annotation parameter.

**RestTemplate**

```java
@Autowired
@EnableRecordo
private RestTemplate restTemplate;
```

**OkHttp**

```java
@Autowired
@EnableRecordo
private OkHttpClient okHttpClient;
```

**Apache HttpClient**

```java
@Autowired
@EnableRecordo
private HttpClient httpClient;
```

### OpenFeign Client definition example

You can use an HTTP client that has been intercepted underneath **OpenFeign** or other high-level clients.

**OkHttp**

```java

@Bean
public okhttp3.OkHttpClient okHttpClient() {
    return new okhttp3.OkHttpClient();
}

@Bean
public feign.Client feignClient(OkHttpClient okHttpClient) {
    return new feign.okhttp.OkHttpClient(okHttpClient);
}
```

**Apache HttpClient**

```java

@Bean
public HttpClient apacheHttpClient() {
    return HttpClients.createDefault();
}

@Bean
public feign.Client feignClient(HttpClient apacheHttpClient) {
    return new feign.httpclient.ApacheHttpClient(httpClient);
}
```

## Annotation Parameters

The `@MockServer` annotation has 4 parameters:

<table><thead><tr><th width="156">Name</th><th width="109">Type</th><th>Description</th></tr></thead><tbody><tr><td><strong>value</strong></td><td>String</td><td><p></p><p>The <code>value</code> property in the MockServer annotation can specify both file and folder paths:</p><ul><li><strong>File Path (<code>.json</code>):</strong> <br>Records and replays multiple requests in a single file.</li><li><strong>Folder Path (No <code>.json</code>):</strong> <br>Creates individual JSON files for each request in the folder.</li></ul></td></tr><tr><td><strong>urlPattern</strong></td><td>String</td><td>The mapping matches URLs using the following rules:<br><code>?</code> matches one character<br><code>*</code>matches zero or more characters<br><code>**</code> matches zero or more directories in a path</td></tr><tr><td><strong>httpClient</strong></td><td>String</td><td>Name of RestTemplate, OkHttp, or Apache HTTP Client bean or test class field</td></tr><tr><td><strong>objectMapper</strong></td><td>String</td><td>Name of ObjectMapper bean or test class field</td></tr></tbody></table>

## Examples

#### Single Server

**Java**

```java

@Test
@MockServer("/mock_servers/get_gists.json")
void should_retrieve_gists() {
    ...
    List<GistResponse> gists = gitHubClient.getGists();
    ...
}
```

**get_gists.json (recorded)**

```javascript
[
  {
    "request": {
      "method": "GET",
      "url": "https://api.github.com/gists",
      "headers": {
        "authorization": "********",
        "accept": "application/json, application/*+json"
      },
      "body": null
    },
    "response": {
      "protocol": "HTTP/1.1",
      "statusCode": 200,
      "statusText": "OK",
      "headers": {
        "content-type": "application/json; charset=utf-8"
      },
      "body": [
        {
          "url": "https://api.github.com/gists/77c974bae1167df5c880f4849b7e001c",
          "forks_url": "https://api.github.com/gists/77c974bae1167df5c880f4849b7e001c/forks",
          "commits_url": "https://api.github.com/gists/77c974bae1167df5c880f4849b7e001c/commits",
          "id": "77c974bae1167df5c880f4849b7e001c",
          "node_id": "MDQ6R2lzdDc3Yzk3NGJhZTExNjdkZjVjODgwZjQ4NDliN2UwMDFj",
          "git_pull_url": "https://gist.github.com/77c974bae1167df5c880f4849b7e001c.git",
          "git_push_url": "https://gist.github.com/77c974bae1167df5c880f4849b7e001c.git",
          "html_url": "https://gist.github.com/77c974bae1167df5c880f4849b7e001c",
          "files": {
            "hello_world.txt": {
              "filename": "hello_world.txt",
              "type": "text/plain",
              "language": "Text",
              "raw_url": "https://gist.githubusercontent.com/vadimdeineka/77c974bae1167df5c880f4849b7e001c/raw/d66c8d4d32962340839b015b7849e067d0f79479/hello_world.txt",
              "size": 14
            }
          },
          "public": false,
          "created_at": "2020-06-26T14:19:30Z",
          "updated_at": "2020-06-26T14:19:32Z",
          "description": "Hello World!",
          "comments": 0,
          "user": null,
          "comments_url": "https://api.github.com/gists/77c974bae1167df5c880f4849b7e001c/comments",
          "owner": {
            "login": "vadimdeineka",
            "id": 9740075,
            "node_id": "MDQ6VXNlcjk3NDAwNzU=",
            "avatar_url": "https://avatars3.githubusercontent.com/u/9740075?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/vadimdeineka",
            "html_url": "https://github.com/vadimdeineka",
            "followers_url": "https://api.github.com/users/vadimdeineka/followers",
            "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
            "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
            "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
            "repos_url": "https://api.github.com/users/vadimdeineka/repos",
            "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
            "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
            "type": "User",
            "site_admin": false
          },
          "truncated": false
        }
      ]
    }
  }
]
```

**Java**

```java

@Test
@MockServer("/mock_servers/create_and_delete_gist.json")
    // File Path
void should_create_and_delete_gist() {
    ...
    GistResponse response = gitHubClient.createGist(gist);
    Gist created = gitHubClient.getGist(response.getId());
    gitHubClient.deleteGist(response.getId());
    ...
}
```

**create_and_delete_gist.json (recorded)**

```javascript
[
  {
    "request": {
      "method": "POST",
      "url": "https://api.github.com/gists",
      "headers": {
        "authorization": "********",
        "content-type": "application/json",
        "accept": "application/json, application/*+json"
      },
      "body": {
        "description": "Hello World!",
        "files": {
          "hello_world.txt": {
            "content": "Hello \nWorld\n!"
          }
        }
      }
    },
    "response": {
      "protocol": "HTTP/1.1",
      "statusCode": 201,
      "statusText": "Created",
      "headers": {
        "content-type": "application/json; charset=utf-8",
        "location": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca"
      },
      "body": {
        "url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca",
        "forks_url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca/forks",
        "commits_url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca/commits",
        "id": "4c16188cd8b6bc2de6ea2eec953ed7ca",
        "node_id": "MDQ6R2lzdDRjMTYxODhjZDhiNmJjMmRlNmVhMmVlYzk1M2VkN2Nh",
        "git_pull_url": "https://gist.github.com/4c16188cd8b6bc2de6ea2eec953ed7ca.git",
        "git_push_url": "https://gist.github.com/4c16188cd8b6bc2de6ea2eec953ed7ca.git",
        "html_url": "https://gist.github.com/4c16188cd8b6bc2de6ea2eec953ed7ca",
        "files": {
          "hello_world.txt": {
            "filename": "hello_world.txt",
            "type": "text/plain",
            "language": "Text",
            "raw_url": "https://gist.githubusercontent.com/vadimdeineka/4c16188cd8b6bc2de6ea2eec953ed7ca/raw/d66c8d4d32962340839b015b7849e067d0f79479/hello_world.txt",
            "size": 14,
            "truncated": false,
            "content": "Hello \nWorld\n!"
          }
        },
        "public": false,
        "created_at": "2020-07-06T08:34:56Z",
        "updated_at": "2020-07-06T08:34:56Z",
        "description": "Hello World!",
        "comments": 0,
        "user": null,
        "comments_url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca/comments",
        "owner": {
          "login": "vadimdeineka",
          "id": 9740075,
          "node_id": "MDQ6VXNlcjk3NDAwNzU=",
          "avatar_url": "https://avatars3.githubusercontent.com/u/9740075?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/vadimdeineka",
          "html_url": "https://github.com/vadimdeineka",
          "followers_url": "https://api.github.com/users/vadimdeineka/followers",
          "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
          "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
          "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
          "repos_url": "https://api.github.com/users/vadimdeineka/repos",
          "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
          "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
          "type": "User",
          "site_admin": false
        },
        "forks": [],
        "history": [],
        "truncated": false
      }
    }
  },
  {
    "request": {
      "method": "GET",
      "url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca",
      "headers": {
        "authorization": "********",
        "accept": "application/json, application/*+json"
      },
      "body": null
    },
    "response": {
      "protocol": "HTTP/1.1",
      "statusCode": 200,
      "statusText": "OK",
      "headers": {
        "content-type": "application/json; charset=utf-8"
      },
      "body": {
        "url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca",
        "forks_url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca/forks",
        "commits_url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca/commits",
        "id": "4c16188cd8b6bc2de6ea2eec953ed7ca",
        "node_id": "MDQ6R2lzdDRjMTYxODhjZDhiNmJjMmRlNmVhMmVlYzk1M2VkN2Nh",
        "git_pull_url": "https://gist.github.com/4c16188cd8b6bc2de6ea2eec953ed7ca.git",
        "git_push_url": "https://gist.github.com/4c16188cd8b6bc2de6ea2eec953ed7ca.git",
        "html_url": "https://gist.github.com/4c16188cd8b6bc2de6ea2eec953ed7ca",
        "files": {
          "hello_world.txt": {
            "filename": "hello_world.txt",
            "type": "text/plain",
            "language": "Text",
            "raw_url": "https://gist.githubusercontent.com/vadimdeineka/4c16188cd8b6bc2de6ea2eec953ed7ca/raw/d66c8d4d32962340839b015b7849e067d0f79479/hello_world.txt",
            "size": 14,
            "truncated": false,
            "content": "Hello \nWorld\n!"
          }
        },
        "public": false,
        "created_at": "2020-07-06T08:34:56Z",
        "updated_at": "2020-07-06T08:34:56Z",
        "description": "Hello World!",
        "comments": 0,
        "user": null,
        "comments_url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca/comments",
        "owner": {
          "login": "vadimdeineka",
          "id": 9740075,
          "node_id": "MDQ6VXNlcjk3NDAwNzU=",
          "avatar_url": "https://avatars3.githubusercontent.com/u/9740075?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/vadimdeineka",
          "html_url": "https://github.com/vadimdeineka",
          "followers_url": "https://api.github.com/users/vadimdeineka/followers",
          "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
          "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
          "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
          "repos_url": "https://api.github.com/users/vadimdeineka/repos",
          "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
          "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
          "type": "User",
          "site_admin": false
        },
        "forks": [],
        "history": [],
        "truncated": false
      }
    }
  },
  {
    "request": {
      "method": "DELETE",
      "url": "https://api.github.com/gists/4c16188cd8b6bc2de6ea2eec953ed7ca",
      "headers": {
        "authorization": "********",
        "accept": "application/json, application/*+json"
      },
      "body": null
    },
    "response": {
      "protocol": "HTTP/1.1",
      "statusCode": 204,
      "statusText": "No Content",
      "headers": {},
      "body": null
    }
  }
]
```

**Java**

```java

@Test
@MockServer("/mock_servers/gists/")
    // Folder Path
void should_create_and_delete_gist() {
    ...
    GistResponse response = gitHubClient.createGist(gist);
    Gist created = gitHubClient.getGist(response.getId());
    gitHubClient.deleteGist(response.getId());
    ...
}
```

**001__POST__api.github.com__gists.json**

```json
{
  "request": {
    "method": "POST",
    "url": "https://api.github.com/gists",
    "headers": {
      "authorization": "********",
      "accept": "*/*"
    },
    "body": {
      "description": "Hello World!",
      "files": {
        "hello_world.txt": {
          "content": "Hello \nWorld\n!"
        }
      }
    }
  },
  "response": {
    "protocol": "h2",
    "statusCode": 201,
    "headers": {
      "content-type": "application/json; charset=utf-8",
      "location": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622"
    },
    "body": {
      "url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622",
      "forks_url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/forks",
      "commits_url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/commits",
      "id": "31e4458e2fbb1e073787790766268622",
      "node_id": "G_kwDOAJSfK9oAIDMxZTQ0NThlMmZiYjFlMDczNzg3NzkwNzY2MjY4NjIy",
      "git_pull_url": "https://gist.github.com/31e4458e2fbb1e073787790766268622.git",
      "git_push_url": "https://gist.github.com/31e4458e2fbb1e073787790766268622.git",
      "html_url": "https://gist.github.com/vadimdeineka/31e4458e2fbb1e073787790766268622",
      "files": {
        "hello_world.txt": {
          "filename": "hello_world.txt",
          "type": "text/plain",
          "language": "Text",
          "raw_url": "https://gist.githubusercontent.com/vadimdeineka/31e4458e2fbb1e073787790766268622/raw/d66c8d4d32962340839b015b7849e067d0f79479/hello_world.txt",
          "size": 14,
          "truncated": false,
          "content": "Hello \nWorld\n!"
        }
      },
      "public": false,
      "created_at": "2024-03-22T10:32:21Z",
      "updated_at": "2024-03-22T10:32:22Z",
      "description": "Hello World!",
      "comments": 0,
      "user": null,
      "comments_url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/comments",
      "owner": {
        "login": "vadimdeineka",
        "id": 9740075,
        "node_id": "MDQ6VXNlcjk3NDAwNzU=",
        "avatar_url": "https://avatars.githubusercontent.com/u/9740075?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/vadimdeineka",
        "html_url": "https://github.com/vadimdeineka",
        "followers_url": "https://api.github.com/users/vadimdeineka/followers",
        "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
        "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
        "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
        "repos_url": "https://api.github.com/users/vadimdeineka/repos",
        "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
        "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
        "type": "User",
        "site_admin": false
      },
      "forks": [],
      "history": [
        {
          "user": {
            "login": "vadimdeineka",
            "id": 9740075,
            "node_id": "MDQ6VXNlcjk3NDAwNzU=",
            "avatar_url": "https://avatars.githubusercontent.com/u/9740075?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/vadimdeineka",
            "html_url": "https://github.com/vadimdeineka",
            "followers_url": "https://api.github.com/users/vadimdeineka/followers",
            "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
            "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
            "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
            "repos_url": "https://api.github.com/users/vadimdeineka/repos",
            "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
            "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
            "type": "User",
            "site_admin": false
          },
          "version": "8763d463517eef559e7fd7daf653ffc5c1e7245f",
          "committed_at": "2024-03-22T10:32:21Z",
          "change_status": {
            "total": 3,
            "additions": 3,
            "deletions": 0
          },
          "url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/8763d463517eef559e7fd7daf653ffc5c1e7245f"
        }
      ],
      "truncated": false
    }
  }
}

```

**002__GET__api.github.com__gists_31e4458e2fbb1e073787790766268622.json**

```json
{
  "request": {
    "method": "GET",
    "url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622?rand=hello%20world",
    "headers": {
      "authorization": "********",
      "accept": "*/*"
    }
  },
  "response": {
    "protocol": "h2",
    "statusCode": 200,
    "headers": {
      "content-type": "application/json; charset=utf-8"
    },
    "body": {
      "url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622",
      "forks_url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/forks",
      "commits_url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/commits",
      "id": "31e4458e2fbb1e073787790766268622",
      "node_id": "G_kwDOAJSfK9oAIDMxZTQ0NThlMmZiYjFlMDczNzg3NzkwNzY2MjY4NjIy",
      "git_pull_url": "https://gist.github.com/31e4458e2fbb1e073787790766268622.git",
      "git_push_url": "https://gist.github.com/31e4458e2fbb1e073787790766268622.git",
      "html_url": "https://gist.github.com/vadimdeineka/31e4458e2fbb1e073787790766268622",
      "files": {
        "hello_world.txt": {
          "filename": "hello_world.txt",
          "type": "text/plain",
          "language": "Text",
          "raw_url": "https://gist.githubusercontent.com/vadimdeineka/31e4458e2fbb1e073787790766268622/raw/d66c8d4d32962340839b015b7849e067d0f79479/hello_world.txt",
          "size": 14,
          "truncated": false,
          "content": "Hello \nWorld\n!"
        }
      },
      "public": false,
      "created_at": "2024-03-22T10:32:21Z",
      "updated_at": "2024-03-22T10:32:22Z",
      "description": "Hello World!",
      "comments": 0,
      "user": null,
      "comments_url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/comments",
      "owner": {
        "login": "vadimdeineka",
        "id": 9740075,
        "node_id": "MDQ6VXNlcjk3NDAwNzU=",
        "avatar_url": "https://avatars.githubusercontent.com/u/9740075?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/vadimdeineka",
        "html_url": "https://github.com/vadimdeineka",
        "followers_url": "https://api.github.com/users/vadimdeineka/followers",
        "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
        "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
        "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
        "repos_url": "https://api.github.com/users/vadimdeineka/repos",
        "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
        "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
        "type": "User",
        "site_admin": false
      },
      "forks": [],
      "history": [
        {
          "user": {
            "login": "vadimdeineka",
            "id": 9740075,
            "node_id": "MDQ6VXNlcjk3NDAwNzU=",
            "avatar_url": "https://avatars.githubusercontent.com/u/9740075?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/vadimdeineka",
            "html_url": "https://github.com/vadimdeineka",
            "followers_url": "https://api.github.com/users/vadimdeineka/followers",
            "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
            "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
            "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
            "repos_url": "https://api.github.com/users/vadimdeineka/repos",
            "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
            "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
            "type": "User",
            "site_admin": false
          },
          "version": "3e02b0d2032e3972744b9393c0287b41dcda6959",
          "committed_at": "2024-03-22T10:32:22Z",
          "change_status": {
            "total": 0,
            "additions": 0,
            "deletions": 0
          },
          "url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/3e02b0d2032e3972744b9393c0287b41dcda6959"
        },
        {
          "user": {
            "login": "vadimdeineka",
            "id": 9740075,
            "node_id": "MDQ6VXNlcjk3NDAwNzU=",
            "avatar_url": "https://avatars.githubusercontent.com/u/9740075?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/vadimdeineka",
            "html_url": "https://github.com/vadimdeineka",
            "followers_url": "https://api.github.com/users/vadimdeineka/followers",
            "following_url": "https://api.github.com/users/vadimdeineka/following{/other_user}",
            "gists_url": "https://api.github.com/users/vadimdeineka/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/vadimdeineka/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/vadimdeineka/subscriptions",
            "organizations_url": "https://api.github.com/users/vadimdeineka/orgs",
            "repos_url": "https://api.github.com/users/vadimdeineka/repos",
            "events_url": "https://api.github.com/users/vadimdeineka/events{/privacy}",
            "received_events_url": "https://api.github.com/users/vadimdeineka/received_events",
            "type": "User",
            "site_admin": false
          },
          "version": "8763d463517eef559e7fd7daf653ffc5c1e7245f",
          "committed_at": "2024-03-22T10:32:21Z",
          "change_status": {
            "total": 3,
            "additions": 3,
            "deletions": 0
          },
          "url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622/8763d463517eef559e7fd7daf653ffc5c1e7245f"
        }
      ],
      "truncated": false
    }
  }
}

```

**003__DELETE__api.github.com__gists_31e4458e2fbb1e073787790766268622.json**

```json
{
  "request": {
    "method": "DELETE",
    "url": "https://api.github.com/gists/31e4458e2fbb1e073787790766268622",
    "headers": {
      "authorization": "********",
      "accept": "*/*"
    }
  },
  "response": {
    "protocol": "h2",
    "statusCode": 204
  }
}

```

#### Multiple HTTP clients

**Java**

```java
@Autowired
private RestTemplate bookServerRestTemplate;

@Autowired
private RestTemplate authorServerRestTemplate;

@Test
@MockServer(httpClient = "bookServerRestTemplate", value = "/mockserver/multiservers/books-server.rest.json")
@MockServer(httpClient = "authorServerRestTemplate", value = "/mockserver/multiservers/authors-server.rest.json")
void should_retrieve_books() {
    ...
    List<Book> allBooks = restClient.get("https://books.server/books", listOf(Book.class));
    List<Author> allAuthors = restClient.get("https://authors.server/authors", listOf(Author.class));
    Book book = restClient.get("https://books.server/books/129649986932158", typeOf(Book.class));
    Author author = restClient.get("https://authors.server/authors/1", typeOf(Author.class));
    ...
}
```

#### Multiple Servers

**Java**

```java

@Test
@MockServer(urlPattern = "https://books.server/**", value = "/mockserver/multiservers/books-server.rest.json")
@MockServer(urlPattern = "https://authors.server/**", value = "/mockserver/multiservers/authors-server.rest.json")
void should_retrieve_books() {
    ...
    List<Book> allBooks = restClient.get("https://books.server/books", listOf(Book.class));
    List<Author> allAuthors = restClient.get("https://authors.server/authors", listOf(Author.class));
    Book book = restClient.get("https://books.server/books/129649986932158", typeOf(Book.class));
    Author author = restClient.get("https://authors.server/authors/1", typeOf(Author.class));
    ...
}
```

**books-server.rest.json**

```json
[
  {
    "request": {
      "method": "GET",
      "url": "https://books.server/books",
      "headers": {
        "accept": "application/json, application/*+json"
      }
    },
    "response": {
      "statusCode": 200,
      "statusText": "OK",
      "headers": {
        "content-type": "application/json; charset=utf-8"
      },
      "body": [
        {
          "id": 129649986932158,
          "author": {
            "id": 129649985822335,
            "firstName": "3vRRjH5Eir",
            "lastName": "v4qcdNu87_"
          },
          "title": "lIEE41TMJh"
        },
        {
          "id": 129649988384959,
          "author": {
            "id": 129649987758738,
            "firstName": "0ddAM5PDcp",
            "lastName": "Q2DXdR9DdB"
          },
          "title": "Oin7c_WtHq"
        }
      ]
    }
  },
  {
    "request": {
      "method": "GET",
      "url": "https://books.server/books/129649986932158",
      "headers": {
        "accept": "application/json, application/*+json"
      }
    },
    "response": {
      "statusCode": 200,
      "statusText": "OK",
      "headers": {
        "content-type": "application/json; charset=utf-8"
      },
      "body": {
        "id": 129649986932158,
        "author": {
          "id": 129649985822335,
          "firstName": "3vRRjH5Eir",
          "lastName": "v4qcdNu87_"
        },
        "title": "lIEE41TMJh"
      }
    }
  }
]

```

**authors-server.rest.json**

```json
[
  {
    "request": {
      "method": "GET",
      "url": "https://authors.server/authors",
      "headers": {
        "accept": "application/json, application/*+json"
      }
    },
    "response": {
      "statusCode": 200,
      "statusText": "OK",
      "headers": {
        "content-type": "application/json; charset=utf-8"
      },
      "body": [
        {
          "id": 1,
          "firstName": "William",
          "lastName": "Shakespeare"
        }
      ]
    }
  },
  {
    "request": {
      "method": "GET",
      "url": "https://authors.server/authors/1",
      "headers": {
        "accept": "application/json, application/*+json"
      }
    },
    "response": {
      "statusCode": 200,
      "statusText": "OK",
      "headers": {
        "content-type": "application/json; charset=utf-8"
      },
      "body": {
        "id": 1,
        "firstName": "William",
        "lastName": "Shakespeare"
      }
    }
  }
]

```

# License

&#x20;**Recordo** library is licensed under the [Apache License, Version 2.0](https://github.com/cariochi/recordo/blob/master/LICENSE).
