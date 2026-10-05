import { test } from "node:test";
import assert from "node:assert/strict";
import {
  editorOptionsFromParams,
  loadEditorOptions,
  saveEditorOptions,
  setEditorOptions,
} from "../../web/editor-options.js";
import { memoryStorage } from "./source.js";

const defaults = {
  highlight: true,
  execution: true,
  autoIndent: true,
  autoClose: true,
  monospace: true,
};

test("old interview URLs retain every editor feature", () => {
  assert.deepEqual(
    editorOptionsFromParams(new URLSearchParams("problem=example")),
    defaults,
  );
});

test("each editor option can be disabled without changing the others", () => {
  for (const key of Object.keys(defaults)) {
    const options = { ...defaults, [key]: false };
    const params = new URLSearchParams("problem=example&duration=45");
    setEditorOptions(params, options);
    assert.deepEqual(editorOptionsFromParams(params), options, key);
    assert.equal(params.get("problem"), "example");
    assert.equal(params.get("duration"), "45");
  }
});

test("only a literal zero disables a known option", () => {
  for (const value of ["", "false", "no", "2", "null"]) {
    const params = new URLSearchParams({
      editorHighlight: value,
      unknown: "0",
    });
    assert.deepEqual(editorOptionsFromParams(params), defaults, value);
  }
  assert.deepEqual(
    editorOptionsFromParams(new URLSearchParams("editorHighlight=0")),
    { ...defaults, highlight: false },
  );
});

test("reenabling options removes their URL overrides", () => {
  const params = new URLSearchParams();
  setEditorOptions(
    params,
    Object.fromEntries(Object.keys(defaults).map((key) => [key, false])),
  );
  assert.deepEqual(Object.values(editorOptionsFromParams(params)), [
    false,
    false,
    false,
    false,
    false,
  ]);
  setEditorOptions(params, defaults);
  assert.equal(params.toString(), "");
});

test("preferences survive a reload without changing an existing interview URL", () => {
  const storage = memoryStorage();
  assert.deepEqual(loadEditorOptions(storage), defaults);
  const options = { ...defaults, highlight: false, execution: false };
  saveEditorOptions(options, storage);
  assert.deepEqual(loadEditorOptions(storage), options);
  const params = new URLSearchParams();
  setEditorOptions(params, loadEditorOptions(storage));
  saveEditorOptions(defaults, storage);
  assert.deepEqual(loadEditorOptions(storage), defaults);
  assert.deepEqual(editorOptionsFromParams(params), options);
  assert.deepEqual(editorOptionsFromParams(new URLSearchParams()), defaults);
});

test("refused preference storage preserves defaults and does not throw", () => {
  const storage = {
    getItem() {
      throw new Error("storage blocked");
    },
    setItem() {
      throw new Error("storage blocked");
    },
    removeItem() {
      throw new Error("storage blocked");
    },
  };
  assert.deepEqual(loadEditorOptions(storage), defaults);
  assert.doesNotThrow(() =>
    saveEditorOptions({ ...defaults, autoClose: false }, storage),
  );
  assert.doesNotThrow(() => saveEditorOptions(defaults, storage));
});
