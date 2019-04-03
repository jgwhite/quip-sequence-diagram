export default class App extends React.Component {
  state = {
    isFocused: false,
    isEditing: false
  };

  render() {
    let src = this.props.rootRecord.get("src");
    let width = quip.apps.getContainerWidth();
    let { isFocused, isEditing } = this.state;

    return (
      <div
        style={{
          width: `${width}px`,
          background: isEditing ? "pink" : "",
          outline: isFocused ? "1px solid red" : ""
        }}
      >
        {src}
      </div>
    );
  }

  componentDidMount() {
    quip.apps.addEventListener(quip.apps.EventType.FOCUS, this.onFocus);
    quip.apps.addEventListener(quip.apps.EventType.BLUR, this.onBlur);
    this.props.rootRecord.listen(this.onChange);
    this.updateMenu();
  }

  componentDidUpdate() {
    this.updateMenu();
  }

  componentWillUnmount() {
    quip.apps.removeEventListener(quip.apps.EventType.FOCUS, this.onFocus);
    quip.apps.removeEventListener(quip.apps.EventType.BLUR, this.onBlur);
    this.props.rootRecord.unlisten(this.onChange);
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

  editorDidMount(editor) {
    editor.focus();
    this.editor = editor;
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
}
