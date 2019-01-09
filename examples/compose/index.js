import React from "react";
import ReactDOM from "react-dom";
import { Overlay } from "react-overlays";

import { withCompositionProvider, composers } from "../../src";

import "../styles.css";

const InnerMenu = ({ children, onClick, entityId, placement }) => {
  const triggerRef = React.useRef();
  const [show, setShow] = React.useState(false);
  return (
    <div
      style={{
        height: 17,
        width: 5,
        cursor: "pointer",
        padding: 5
      }}
      onClick={() => setShow(!show)}
    >
      <div className="trigger" ref={triggerRef} />
      <Overlay
        placement={placement}
        container={document.body}
        show={show}
        target={() => triggerRef.current}
      >
        {({ props, arrowProps }) => (
          <div
            {...props}
            style={{
              ...props.style,
              backgroundColor: "white",
              border: "1px solid gray",
              padding: 10,
              marginTop: 10
            }}
          >
            <ul style={{ margin: 0, padding: 0 }}>
              {React.Children.map(children, (child, index) => (
                <li
                  key={index}
                  style={{
                    display: "block",
                    marginBottom: index === children.length - 1 ? 0 : 10
                  }}
                >
                  {React.cloneElement(child, { entityId, onClick })}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Overlay>
    </div>
  );
};
const Menu = withCompositionProvider(InnerMenu, {
  compose: {
    onClick: composers.func.result.ignore()
  }
});

const Card = ({ content, title, id }) => {
  const [action, setAction] = React.useState(null);
  return (
    <div
      style={{
        marginBottom: 10,
        width: 400,
        height: 200,
        boxShadow: "-3px 3px 10px -2px gray",
        borderRadius: 5,
        border: "1px solid #AAAAAA"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <Menu entityId={id} onClick={({ action }) => setAction(action)} />
      </div>
      <div>{content}</div>
      {action && <div>Selected action - {action.text}</div>}
    </div>
  );
};

const Action = ({ text, entityId, onClick }) => {
  return (
    <a
      style={{
        color: "teal",
        fontFamily: "Arial",
        fontWeight: "bold"
      }}
      href="javascript:void(0)"
      onClick={() => onClick({ action: { text }, entityId })}
    >
      {text}
    </a>
  );
};

const cards = [
  {
    title: "This is a basic title",
    content: "This is an amazing content",
    id: 1
  },
  {
    title: "Another default title",
    content: "Different content is different",
    id: 2
  },
  {
    title: "Wow, look at this one",
    content: "The content is very meaningful",
    id: 3
  },
  {
    title: "Pfff another great one",
    content: "Check this out, I know you want to",
    id: 4
  }
];

export const App = () => {
  return (
    <Menu.Provider
      kids={[
        <Action text="Check the log" />,
        <Action text="And click the menu again" />
      ]}
    >
      <div className="App">
        <Menu.Provider
          onClick={(...args) =>
            console.log("Checkout my awesome log!", ...args)
          }
          kids={[
            <Action text="both actions trigger" />,
            <Action text="Using the same onClick prop" />
          ]}
        >
          {cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </Menu.Provider>
      </div>
    </Menu.Provider>
  );
}

// const rootElement = document.getElementById("root");
// ReactDOM.render(<App />, rootElement);
