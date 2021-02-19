import Editor from "./editor.jsx";
import SequenceDiagram from "react-sequence-diagram";
import debounceRender from "react-debounce-render";

class FixedWidthSequenceDiagram extends SequenceDiagram {
  componentDidMount() {
    super.componentDidMount();
    this.fixWidth();
  }

  componentDidUpdate() {
    super.componentDidUpdate();
    this.fixWidth();
  }

  fixWidth() {
    if (!this.div) return;

    const svg = this.div.querySelector("svg");
    const width = svg.getAttribute("width");
    const height = svg.getAttribute("height");
    const viewBox = `0 0 ${width} ${height}`;

    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("width", "100%");
    svg.removeAttribute("height");
  }
}
const DebouncedSequenceDiagram = debounceRender(FixedWidthSequenceDiagram);

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
        <DebouncedSequenceDiagram
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
        toolbarCommandIds: ["edit", "download"],
        menuCommands: [
          {
            id: "edit",
            label: "Done",
            handler: () => this.setState({ isEditing: false })
          },
          {
            id: "download",
            label: "Download",
            handler: () => this.download()
          }
        ]
      });
    } else {
      quip.apps.updateToolbar({
        toolbarCommandIds: ["edit", "download"],
        menuCommands: [
          {
            id: "edit",
            label: "Edit",
            handler: () => this.setState({ isEditing: true })
          },
          {
            id: "download",
            label: "Download",
            handler: () => this.download()
          }
        ]
      });
    }
  }

  download = () => {
    const svg = document.body.querySelector("svg");
    const blob = new Blob([svg.outerHTML], {type : 'image/svg+xml'});
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
  element.setAttribute('href', url);
  element.setAttribute('download', "diagram.svg");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
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
