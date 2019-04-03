import quip from "quip";
import App from "./App.jsx";

export class RootRecord extends quip.apps.RootRecord {
  static getProperties() {
    return {
      src: "string"
    };
  }

  static getDefaultProperties() {
    return {
      src: "title Example\nAlice -> Bob: Hello\nBob -> Alice: Hi"
    };
  }
}

quip.apps.registerClass(RootRecord, "root-record");

quip.apps.initialize({
  initializationCallback(rootNode) {
    let rootRecord = quip.apps.getRootRecord();

    ReactDOM.render(<App rootRecord={rootRecord} />, rootNode);
  }
});
