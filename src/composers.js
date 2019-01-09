const withReverser = composer => {
  composer.reverse = ({ propChain, ...rest }) =>
    composer({ ...rest, propChain: propChain.slice().reverse() });
  return composer;
};

const withTaker = (composer, result = composer) => {
  const createWhen = (whencb) => (cb) => ({ propChain, chainWithProp }) => {
    const index = chainWithProp.reduce(whencb(cb), -1);
    if (index === -1) {
      throw new Error ('Could not find a link in the chain that satisfies the given when condition.')
    }

    return propChain[index];
  };

  result.take = {
    first: () => ({ propChain }) => propChain.pop(),
    last: () => ({ propChain }) => propChain.shift(),
    index: index => ({ propChain }) => propChain[index]
  };

  result.take.first.when = createWhen((cb) => (result, props, index) => result > -1 ? result : cb({ props }) ? index : -1);
  result.take.last.when = createWhen((cb) => (result, props, index) => cb({ props }) ? index : result);

  return result;
};

const node = withTaker(
  withReverser(() => ({ propChain }) =>
    propChain.reduce((result, prop) => result.concat(prop), [])
  )
);

const string = withTaker(
  withReverser((separator = " ") => ({ propChain }) =>
    propChain.join(separator)
  )
);

const object = withTaker(
  withReverser(
    (merge = objects => Object.assign({}, ...objects)) => ({ propChain }) =>
      merge(propChain)
  )
);

const funcComposer = ({ propChain }) => (...args) =>
  propChain.map(cb => cb(...args));

const func = {
  result: withTaker(funcComposer, {
    ignore: () => ({ propChain }) => (...args) => {
      propChain.map(cb => cb(...args));
    },
    compose: composer => ({ propChain, ...rest }) => (...args) =>
      composer({ propChain: propChain.map(cb => cb(...args)), ...rest })
  })
};

const array = withTaker(
  withReverser(() => ({ propChain }) =>
    propChain.reduce((result, prop) => result.concat(prop), [])
  )
);

const idTaker = () => ({ propChain }) => propChain;

const number = withTaker(idTaker, {
  sum: () => ({ propChain }) => propChain.reduce((sum, num) => sum + num, 0),
  min: () => ({ propChain }) =>
    propChain.reduce((min, num) => (min > num ? num : min), Infinity),
  max: () => ({ propChain }) =>
    propChain.reduce((max, num) => (max < num ? num : max), -Infinity),
  average: () => ({ propChain }) =>
    propChain.reduce((sum, num) => sum + num, 0) / propChain.length
});
const date = withTaker(idTaker, {
  min: () => ({ propChain }) =>
    propChain.reduce((min, date) => (min > date ? date : min), propChain[0]),
  max: () => ({ propChain }) =>
    propChain.reduce((max, date) => (max < date ? date : max), propChain[0])
});
const bool = withTaker(idTaker, {
  or: () => ({ propChain }) =>
    propChain.reduce((result, prop) => result || prop, false),
  and: () => ({ propChain }) =>
    propChain.reduce((result, prop) => result && prop, true)
});

export default { node, string, object, func, array, number, date, bool };
