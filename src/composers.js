import React from "react";

const withReverser = composer => {
  composer.reverse = ({ propChain, ...rest }) =>
    composer({ ...rest, propChain: propChain.slice().reverse() });
  return composer;
};

const withTaker = (composer, result = composer) => {
  result.take = {
    first: () => ({ propChain }) => propChain.pop(),
    last: () => ({ propChain }) => propChain.shift(),
    index: index => ({ propChain }) => propChain[index]
  };
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
