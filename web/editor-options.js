import { readStored, writeStored } from "./audio-output.js";

const STORAGE_KEY = "codetrial:editorOptions";
const PARAMETERS = {
  highlight: "editorHighlight",
  execution: "editorExecution",
  autoIndent: "editorAutoIndent",
  autoClose: "editorAutoClose",
  monospace: "editorMonospace",
};

export function editorOptionsFromParams(params) {
  return Object.fromEntries(
    Object.entries(PARAMETERS).map(([key, name]) => [
      key,
      params.get(name) !== "0",
    ]),
  );
}

export function setEditorOptions(params, options) {
  for (const [key, name] of Object.entries(PARAMETERS)) {
    if (options[key] === false) params.set(name, "0");
    else params.delete(name);
  }
}

export function loadEditorOptions(storage) {
  return editorOptionsFromParams(
    new URLSearchParams(readStored(STORAGE_KEY, storage) || ""),
  );
}

export function saveEditorOptions(options, storage) {
  const params = new URLSearchParams();
  setEditorOptions(params, options);
  writeStored(STORAGE_KEY, params.toString(), storage);
}
