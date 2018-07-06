# Override linting rule

This is a linting rule to force marking of method and property overrides.

## Setup

- Run `npm install`
- Run `npm run build` or `npm run watch`

## Tests

- Run `npm run test`

## Override Rule

This linting rule will enforce the override decorator to be used when a property or method is overriden. Where a decorator is missing, or one is provided when it is not required, a linting error will be displayed.

Acts as an implementation using decorators until https://github.com/Microsoft/TypeScript/issues/2000 is implemented.

### Example decorator declaration
If you are building for the web you will need to define the override decorator in your code. The implementation can be an empty function and does not need to do anything.

```javascript
function override(target: Object, propertyKey: string | symbol, descriptor?: any): any | void {
    /// do nothing.
}
```

### Decorator code in output
As we are using a decorator TypeScript will include it in the output, resulting in an empty function being called. Whilst modern JavaScript engines are intelligent enough to ignore these calls, a post-build step can be added to your build process (`gulp`, `grunt`, ...) to remove the output from your code. For example, the following RegExp could be used.

```javascript
/__decorate\(\[\s+override(.|\n)+?;/gmi
```

### Example usage
See the examples inside the `test/overrideRule` folder. The decorator is automatically built in with the linting rule within a NodeJS environment, however for production browser environments the decorator will need to be declared on the window, although does not require an implementation.

```javascript
/**
 * Public property should force override decorator for any implementations
 */
@override public baseProperty = "Implementation";

/**
 * Public method should force override decorator for any implementations
 */
@override public baseMethodOne() {
    /// noop
}
```

### Missing override
`ERROR: 8:9   overrideTest  Missing override decorator, properties and methods must be marked`

### Unnessesary override 
`ERROR: 11:9  overrideTest  Unnessesary override decorator, does not exist in heritage clause`
