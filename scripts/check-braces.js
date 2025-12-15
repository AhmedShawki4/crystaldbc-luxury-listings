const fs = require("fs");

const filePath = process.argv[2] || "client/src/i18n.ts";
const s = fs.readFileSync(filePath, "utf8");

let stack = [];
let mode = "code";
let quote = "";
let esc = false;
let line = 1;
let col = 0;
let modeStart = { line: 1, col: 0 };

function push(ch) {
  stack.push({ ch, line, col });
}

function popClose(ch) {
  const map = { "}": "{", ")": "(", "]": "[" };
  const need = map[ch];
  const top = stack[stack.length - 1];
  if (!top || top.ch !== need) {
    console.log("MISMATCH close", ch, "at", `${line}:${col}`, "top", top);
    process.exit(0);
  }
  stack.pop();
}

for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  col++;
  if (ch === "\n") {
    line++;
    col = 0;
  }

  if (mode === "code") {
    if (ch === "/") {
      const next = s[i + 1];
      if (next === "/") {
        mode = "linecomment";
        continue;
      }
      if (next === "*") {
        mode = "blockcomment";
        continue;
      }
    }

    if (ch === '"') {
      mode = "string";
      quote = '"';
      esc = false;
      modeStart = { line, col };
      continue;
    }
    if (ch === "'") {
      mode = "string";
      quote = "'";
      esc = false;
      modeStart = { line, col };
      continue;
    }
    if (ch === "`") {
      mode = "string";
      quote = "`";
      esc = false;
      modeStart = { line, col };
      continue;
    }

    if ("{([".includes(ch)) push(ch);
    else if ("})]".includes(ch)) popClose(ch);
  } else if (mode === "linecomment") {
    if (ch === "\n") mode = "code";
  } else if (mode === "blockcomment") {
    if (ch === "*" && s[i + 1] === "/") {
      mode = "code";
      i++;
      col++;
    }
  } else if (mode === "string") {
    if (esc) {
      esc = false;
      continue;
    }
    if (ch === "\\") {
      esc = true;
      continue;
    }
    if (ch === quote) {
      mode = "code";
      quote = "";
    }
  }
}

console.log("DONE stack size", stack.length);
console.log("END mode", mode, mode !== "code" ? `(started at ${modeStart.line}:${modeStart.col})` : "");
if (stack.length) {
  console.log("Top unclosed:");
  stack.slice(-15).forEach((t) => console.log(t.ch, "opened at", `${t.line}:${t.col}`));
}
