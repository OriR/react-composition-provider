import React from "react";
import composers from "./composers";
export const innerRefProp = `$$__WithCompositionProvider__inner-ref-prop__$$`;

export const defaultCompose = {
  style: composers.object(),
  className: composers.string(),
  ref: composers.func.result.ignore(),
  children: composers.node()
};

const composeChain = (chain, { compose, ignore }) => {
  const composeObject = { ...defaultCompose, ...compose };
  const filteredChain = [chain[0]].concat(
    chain.slice(1).map(props => {
      return Object.keys(props).reduce((seed, prop) => {
        if (ignore.indexOf(prop) === -1) {
          seed[prop] = props[prop];
        }
        return seed;
      }, {});
    })
  );

  return {
    ...filteredChain.reduce((result, props) => ({ ...result, ...props }), {}),
    ...Object.keys(composeObject).reduce((seed, prop) => {
      const chainWithProp = filteredChain.filter(props => prop in props);
      if (chainWithProp.length > 1) {
        seed[prop] = composeObject[prop]({
          propChain: chainWithProp.map(props => props[prop]),
          chainWithProp,
          chain
        });
      }
      return seed;
    }, {})
  };
};

const addProp = (obj, prop, name) => (prop ? { ...obj, [name]: prop } : obj);

const normalizeProps = ({ children, kids, [innerRefProp]: ref, ...rest }) =>
  addProp(addProp(rest, kids, "children"), ref, "ref");

const innerCompositionProvider = (
  originalProps,
  Component,
  { mountWhen, ...options }
) => chain => {
  const { [innerRefProp]: ref, ...rest } = originalProps;
  const props = addProp(rest, ref, "ref");
  const propsChain = [props].concat(chain);
  const composedProps = composeChain(propsChain, options);
  return mountWhen({ props: composedProps, propsChain }) ? (
    <Component {...composedProps} />
  ) : null;
};

const innerProvider = (Context, props, children) => (
  <Context.Provider value={props}>{children}</Context.Provider>
);

const innerConsumingProvider = (Context, { children, ...props }) => chain => {
  return innerProvider(
    Context,
    [normalizeProps(props)].concat(chain),
    children
  );
};

const Hooks = (Context, Component, options) => ({
  CompositionConsumer: originalProps =>
    innerCompositionProvider(originalProps, Component, options)(
      React.useContext(Context)
    ),
  Provider: originalProps =>
    innerConsumingProvider(Context, originalProps)(React.useContext(Context))
});

const Fallback = (Context, Component, options) => ({
  CompositionConsumer: originalProps => (
    <Context.Consumer>
      {innerCompositionProvider(originalProps, Component, options)}
    </Context.Consumer>
  ),
  Provider: originalProps => (
    <Context.Consumer>
      {innerConsumingProvider(Context, originalProps)}
    </Context.Consumer>
  )
});

const forward = Component =>
  React.forwardRef
    ? React.forwardRef((props, ref) => (
        <Component
          {...props}
          {...{ [innerRefProp]: ref || props[innerRefProp] }}
        />
      ))
    : Component;
const memo = Component => (React.memo ? React.memo(Component) : Component);

export default (
  Component,
  {
    polyfills: { createContext = React.createContext, ...polyfills } = {},
    compose = {},
    mountWhen = () => true,
    ignore = []
  } = {}
) => {
  const Context = createContext([]);

  const { CompositionConsumer, Provider } = (React.useState ? Hooks : Fallback)(
    Context,
    Component,
    { compose, mountWhen, ignore, polyfills }
  );

  const WithCompositionProvider = forward(memo(CompositionConsumer));

  WithCompositionProvider.Provider = forward(memo(Provider));

  WithCompositionProvider.Provider.Scoped = ({ children, ...props }) =>
    innerProvider(Context, normalizeProps(props), children);

  return WithCompositionProvider;
};
