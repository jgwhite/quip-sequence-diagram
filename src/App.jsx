import Editor from "./editor.jsx";
import SequenceDiagram from "react-sequence-diagram";

export default class App extends React.Component {
  state = {
    isFocused: false,
    isEditing: false
  };

  render() {
    let src = this.props.rootRecord.get("src");
    let width = quip.apps.getContainerWidth();
    let gray = "#e3e5e8";
    let { isEditing } = this.state;

    return (
      <div
        style={{
          width: `${width}px`,
          outline: isEditing ? `2px solid ${gray}` : "none",
          minHeight: isEditing ? "128px" : "0"
        }}
      >
        <SequenceDiagram
          input={src}
          options={{
            theme: "simple"
          }}
          onError={this.onDiagramError}
        />
        {isEditing && (
          <Editor
            src={src}
            style={{
              position: "absolute",
              top: "-2px",
              left: "100%",
              bottom: "-2px",
              width: (document.body.clientWidth - width) / 2 - 16 + "px",
              border: `2px solid ${gray}`
            }}
            onChange={value => this.updateSrc(value)}
            onMount={editor => this.editorDidMount(editor)}
          />
        )}
      </div>
    );
  }

  componentDidMount() {
    quip.apps.addEventListener(quip.apps.EventType.FOCUS, this.onFocus);
    quip.apps.addEventListener(quip.apps.EventType.BLUR, this.onBlur);
    this.props.rootRecord.listen(this.onChange);
    this.updateMenu();
  }

  editorDidMount(editor) {
    editor.focus();
    this.editor = editor;
  }

  componentDidUpdate() {
    this.updateMenu();

    if (this.editor) {
      this.editor.layout();
    }
  }

  componentWillUnmount() {
    quip.apps.removeEventListener(quip.apps.EventType.FOCUS, this.onFocus);
    quip.apps.removeEventListener(quip.apps.EventType.BLUR, this.onBlur);
    this.props.rootRecord.unlisten(this.onChange);
  }

  updateSrc(value) {
    let { rootRecord } = this.props;
    rootRecord.set("src", value);
    this.forceUpdate();
  }

  updateMenu() {
    if (this.state.isEditing) {
      quip.apps.updateToolbar({
        toolbarCommandIds: ["edit"],
        menuCommands: [
          {
            id: "edit",
            label: "Done",
            handler: () => this.setState({ isEditing: false })
          }
        ]
      });
    } else {
      quip.apps.updateToolbar({
        toolbarCommandIds: ["edit"],
        menuCommands: [
          {
            id: "edit",
            label: "Edit",
            handler: () => this.setState({ isEditing: true })
          }
        ]
      });
    }
  }

  onFocus = () => {
    this.setState({ isFocused: true });
    this.updateMenu();
  };

  onBlur = () => {
    this.setState({ isFocused: false, isEditing: false });
    this.updateMenu();
  };

  onChange = () => {
    if (this.state.isEditing) {
      return;
    }
    this.forceUpdate();
  };

  onDiagramError = error => {
    console.error(error);
  };
}
