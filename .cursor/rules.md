# Cursor Rules (Low-Context Mode)

## Context
- Use ONLY the files, code snippets, and instructions explicitly provided by the user in the current message.
- Do NOT auto-search, auto-index, or include “related” files.
- Do NOT scan the repository.
- If additional files are needed, ASK FIRST and name exactly which files you need (max 2 at a time).
- Prefer partial reads: request specific functions/lines instead of whole files.

## Output
- Keep responses short and actionable.
- Provide minimal diffs; do not refactor unrelated code.
- If a change requires >30 lines of code, ask before generating the full patch.

## Work style
- Solve the task in the smallest possible step.
- Confirm assumptions only when necessary; otherwise proceed with a safe default.
- Do not introduce new dependencies unless explicitly approved.

Follow these rules strictly.
