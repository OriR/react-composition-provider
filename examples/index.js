import React from "react";
import ReactDOM from "react-dom";
import { App as Compose } from './compose';
import { App as ConditionalMount } from './conditional-mount';
import { App as IgnoreProps } from './ignore-props';
import { App as MultipleProviders } from './multiple-providers';
import { App as Refs } from './refs';

const Empty = () => <div/>;

const App = () => {
    const [example, setExample] = React.useState(null);
    const examples = {
        refs: Refs,
        compose: Compose,
        'conditional-mount': ConditionalMount,
        'ignore-props': IgnoreProps,
        'multiple-providers': MultipleProviders
    };
    const ExampleComponent = example ? examples[example] : Empty;
    return (
    <div>
        <h1>
            Choose an example to view
        </h1>
        <button onClick={() => setExample('compose')}>Compose</button>
        <button onClick={() => setExample('conditional-mount')}>Conditional Mount</button>
        <button onClick={() => setExample('ignore-props')}>Ignore Props</button>
        <button onClick={() => setExample('multiple-providers')}>Multiple Providers</button>
        <button onClick={() => setExample('refs')}>Refs</button>
        <ExampleComponent />
    </div>
    )
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
