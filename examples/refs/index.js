import React from "react";
import ReactDOM from "react-dom";
import { Overlay } from "react-overlays";

import withCompositionProvider, { refProp } from "../../src";

import "../styles.css";

class InnerMenu extends React.Component {
  state = { show: false };

  toggleShow = () => {
    this.setState({ show: !this.state.show });
  };

  setTriggerRef = _ => (this.triggerRef = _);

  render() {
    return (
      <div
        style={{
          height: 17,
          width: 5,
          cursor: "pointer",
          padding: 5
        }}
        onClick={this.toggleShow}
      >
        <div className="trigger" ref={this.setTriggerRef} />
        <Overlay
          placement={this.props.placement}
          container={document.body}
          show={this.state.show}
          target={this.triggerRef}
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
                {this.props.actions.map((action, index) => (
                  <li
                    key={index}
                    style={{
                      display: "block",
                      marginBottom:
                        index === this.props.actions.length - 1 ? 0 : 10
                    }}
                  >
                    <a
                      style={{
                        color: "teal",
                        fontFamily: "Arial",
                        fontWeight: "bold"
                      }}
                      href="javascript:void(0)"
                      onClick={() =>
                        this.props.onClick({
                          action,
                          entityId: this.props.entityId
                        })
                      }
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
  }
}
const Menu = withCompositionProvider(InnerMenu);

class Card extends React.Component {
  state = { action: null };

  setAction = action => this.setState({ action });
  render() {
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
          <h3 style={{ margin: 0 }}>{this.props.title}</h3>
          <Menu entityId={this.props.id} onClick={this.setAction} />
        </div>
        <div>{this.props.content}</div>
        {this.state.action && (
          <div>Selected action - {this.state.action.text}</div>
        )}
      </div>
    );
  }
}

const cards = [
  {
    title: "This is a basic title",
    content: "This is an amazing content 1",
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
    <Menu.Provider
      {...{
        [refProp]: _ =>
          _ &&
          console.log("Can't use forwardRef? no worries, import refProp!", _)
      }}
    >
      <div className="App">
        <Menu.Provider
          ref={_ => _ && console.log("Check out my ref!", _)}
          actions={[{ text: "Move" }, { text: "Rename" }]}
        >
          {cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </Menu.Provider>
      </div>
    </Menu.Provider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
