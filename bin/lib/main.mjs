import DocFiles from "./DocFiles.mjs";

class Main {
  plugins = {
    docFiles: new DocFiles(),
  };

  getPlugin(name) {
    return this.plugins[name];
  }
}

export default Main;
