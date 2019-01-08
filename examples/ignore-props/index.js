import React from "react";
import ReactDOM from "react-dom";
import { Overlay } from "react-overlays";

import withCompositionProvider from "../../src";

import "../styles.css";

const InnerMenu = ({ actions, onClick, entityId, placement }) => {
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
              {actions.map((action, index) => (
                <li
                  key={index}
                  style={{
                    display: "block",
                    marginBottom: index === actions.length - 1 ? 0 : 10
                  }}
                >
                  <a
                    style={{
                      color: "teal",
                      fontFamily: "Arial",
                      fontWeight: "bold"
                    }}
                    href="javascript:void(0)"
                    onClick={() => onClick({ action, entityId })}
                  >
                    {action.text}
                  </a>
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
  ignore: ["placement"]
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
        <Menu
          placement="right"
          entityId={id}
          onClick={({ action }) => setAction(action)}
        />
      </div>
      <div>{content}</div>
      {action && <div>Selected action - {action.text}</div>}
    </div>
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

function App() {
  return (
    <div className="App">
      <Menu.Provider
        placement="left"
        actions={[
          { text: "Notice the placement" },
          { text: "left from Menu.Provoder" },
          { text: "Is ignored" }
        ]}
      >
        {cards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </Menu.Provider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
