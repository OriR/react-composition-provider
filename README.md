# react-composition-provider

`react-composition-provider` is a small react library that helps you implement a Composition Provider pattern.

The point of the Composition Provider pattern is to make prop drilling more ergonomic.
[![npm version](https://img.shields.io/npm/v/react-composition-provider.svg?style=flat-square)](https://www.npmjs.com/package/react-composition-provider)
[![npm downloads](https://img.shields.io/npm/dm/react-composition-provider.svg?style=flat-square)](https://www.npmjs.com/package/react-composition-provider)

## Install

```
npm i --save react-composition-provider
```

## Usage

Let's you have a `Menu`, `Card` & `CardList` components. </br>
Where `CardList` contains `Card` and `Card` contains `Menu`. </br>
And you have multiple views of different types of cards, for each card you want to show different items in the menu, let's call them `NewsList`, `WeatherList`. </br>
If you're using `redux` you may want to put these items in the store, that's an option - but then you'd have to manage actions to change the items and dispatch them and a reducer to update them, etc. </br>
All you want to do is for `NewsList` to have 2 items in the menu, one for removing the article and one for staring it. </br>
And for `WeatherList` you want to have only 1 item in the menu, for marking the location as irrelevant.
Doing this kind of thing with `redux` is a bit of an overkill. </br>

You probably want something simpler just to add the correct items of the menu from different locations.</br>
At which point you'll probably pass down one of these as props down the component tree - `menuItems` or `menuProps`.</br>
This means that `Card` & `CardList` must know about `menuItems` or `menuProps` and pass them down specifically.</br>
Besides, `CardList` probably doesn't know about a component called `Menu`, it's only getting this prop because `Card` uses it.

That's where `react-composition-provider` comes in.

That `Menu` & `Card` with `react-composition-provider` would look like this

```js
// Menu.js
import { withCompositionProvider } from 'react-composition-provider';

const InnerMenu = ({ cardId, items }) => {
  // This is where the actual menu code would be.
};

export default withCompositionProvider(InnerMenu);

// Card.js
import Menu from './Menu';

export default (props) => {
    return (
        <div>
            <Menu cardId={props.id}/>
        </dib>
    )
}
```

And in `NewsList` & `WeatherList` you'd do this:

```js
// NewsList.js
import Menu from 'Menu';
export default (props) => {
    const actions = [{ text: 'remove' }, { text: 'star' }];
    return (
        <Menu.Provider items={actions} >
            <CardList cards={props.news}/>
        </Menu.Provider>
    )
}

// WeatherList.js
import Menu from 'Menu';
export default (props) => {
    const actions = [{ text: 'remove location' }];
    return (
        <Menu.Provider items={actions} >
            <CardList cards={props.locations}/>
        </Menu.Provider>
    )
}
```

And that's it!</br>
Now every time you want to supply extra props to a decendant `Menu` component just render `Menu.Provider` with what you need!

This is the basic usage but the library gives you a lot more features than just this, like:

1. You can have multiple `Menu.Provider` in the same tree, that way even if someone is using `Menu.Provider` in a component you can't change you'll still be able to pass more props to it!
2. If you want to create a scope and make sure that no ancestor of type `Menu.Provider` can add props you can use `Menu.Provider.Scoped`.
3. It handles refs correctly, you wouldn't want to write `<Menu.Provider ref={...}` and get the ref of the provider, right?
4. It can handle composition elegantly (already does so OOTB for, `ref`, `style`, `className` and `children`) and gives you a way to define the composition for each prop.
5. When you want to re-define the children of the inner component you'd have to use a prop named `kids` because obviously the `children` prop is already taken.
6. Allows you to conditionally mount the component. Even if the `Menu` was rendered somewhere, it doesn't mean that `InnerMenu` has to be mounted.
7. Gives you a way to control which props can be propagated from a `Menu.Provider` and which aren't.

Most of these can be configured through a second options argument to `withCompositionProvider`, let's have a look at it now.

```js
import { withCompositionProvider, composers } from 'react-composition-provider';

export default withCompositionProvider(MyComponent, {
  // Object defining all the polyfills used by this package.
  polyfills: {
    // If you're using an old version of react that doesn't have React.createContext,
    // you'll need to supply a polyfill for it, something like - https://github.com/jamiebuilds/create-react-context
    createContext: React.createContext
  }
  // Allows you to control when the inner component actually mounts.
  // Returns true if the component should mount and false when it shouldn't.
  // props - all the composed props for this component
  // propsChain - an array of props, ordered by closeness to the actual component.
  //              where propsChain[0] is given directly to the component and propsChain[1] is the closest Provider, and so on.
  mountWhen: ({ props, propsChain }) => true,
  // An array of props to ignore from all the Providers up the chain.
  ignore: [],
  // The most advanced configuration.
  // Gives you full control over the composition of each and every prop.
  // Each key in this object is the prop name and the value is a function that composes it and returns said composition.
  // Luckily, you don't have to think about it too much because react-composition-provider comes with a built-in set of composers.
  // To use these composers just import it like this:
  // import { composers } from 'react-composition-providers';
  //
  // There are 2 available variations for some of the composers, reverse or take.
  // reverse - composes the same way but just in reverse order.
  // take - an object with first, last & index that takes a single element from the array.
  // Note that all of the composers implement the take capabiliy, the ones marked with reverse can also use that capability.
  //
  // These are the available composers:
  //  1. composers.node()                                            - combines an array of nodes as siblings using React.Fragment. (reverse)
  //  2. composers.string(separator: String)                         - combines an array of strings with the given separator (defaults to " " - space). (reverse)
  //  3. composers.object(merge: (objects: Array<Object>) => Object) - combines an array of objects by merging them together.
  //                                                                   the first one is the least specific and the last is the most specific.
  //                                                                   the merge callback takes in an array of objects and returns a merged object (defaults to Object.assign). (reverse)
  //  4. composers.array()                                           - combines an array of arrays to a single array (essentially a flatMap). (reverse)
  //  5. composers.func.result.compose(composer: Composer)           - executes each function in the array sequentially, the composer parameter is used to combine the results.
  //  6. composers.func.result.ignore()                              - executes each function in the array sequentially and ignores the result.
  //  7. composers.bool.and()                                        - combines an array of booleans to a single boolean value by "&&" all of them together.
  //  8. composers.bool.or()                                         - combines an array of booleans to a single boolean value by "||" all of them together.
  //  9. composers.number.sum()                                      - gets the sum of the array of numbers.
  //  10. composers.number.min()                                     - gets the minimum number of the array of numbers.
  //  11. composers.number.max()                                     - gets the maximum number of the array of numbers
  //  12. composers.number.average()                                 - gets the average of the array of numbers.
  //  13. composers.date.min()                                       - gets the minimum date of the array of dates.
  //  13. composers.date.max()                                       - gets the maximum date of the array of dates.
  compose: {},
});
```

As you can see this package is very flexible, but tries to make sane defaults.

## Use cases

Although this pattern can be very helpful and you're maybe thinking to yourself "I'm going to define all of my components like this now!".

**JUST DON'T**

General rules of thumb (there are probably more since this is new) of dos and don'ts with this pattern:

1. you're in control of both ends, the component itself and the provider(s).
   1. you have to pass several props down the component tree.
   2. you have a very deep component tree and don't want to cause re-rendering for all the components in the middle.
2. as a library author, exposing _some_ internal component API - this may make the library API less predictable.
   1. when you define props like `xxxProps` - you already want to expose the props for `xxx` as part of your API.
   2. it's important to also define a scope for your components so things don't leak outside your API boundary.

So, as with all patterns out there - make sure you understand what you're doing and don't abuse it.

## License

MIT
