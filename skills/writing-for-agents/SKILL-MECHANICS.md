# Skill mechanics

The skill-specific branch of [`writing-for-agents`](SKILL.md): what changes when the document is a skill (frontmatter, the invocation choice, and router skills). Everything else about writing it is the universal reference in `SKILL.md`.

## Invocation

Frontmatter has only `name` and `description`. Every skill can fire on its own, when the agent matches the description, or when the user types `/<name>`; there is no field that turns either off. Two choices remain, trading the two loads:

- An **auto-firing** skill carries a `description` with the trigger branches, so the agent can fire it autonomously. The description is the skill's top-level context pointer, forced to stay loaded at all times: permanent context load in exchange for discoverability (the pointer-writing rules in `SKILL.md` apply in full). A skill whose content is all reference is also one home for shared reference: other skills read its SKILL.md, so reference needed by several skills lives in one place.
- A **request-only** skill says so in its `description`: a one-line summary, trigger lists stripped, ending "Use only when the user asks for it by name." The agent then leaves it alone unless asked. This is a convention the agent follows, not a switch, so the description still loads, but it stays short. It spends cognitive load: you are the index that must remember it exists.

Pick auto-firing only when the agent must reach the skill on its own. If it only ever fires by hand, make it request-only and keep the description short.

To chain a skill, tell the agent to read its SKILL.md: "Read and follow `skills/<name>/SKILL.md`". There is no tool for invoking a skill and no alias; reading the file is the whole mechanism, and it works for request-only skills too. Shared reference that several skills need can therefore live in one skill and be read by the others.

## Splitting by invocation

The invocation cut of splitting (the sequence cut lives in `SKILL.md`): split off an auto-firing skill when you have a distinct leading word that should trigger it on its own (a trigger word you actually use in your prompts), or another skill must read it. You pay context load for the new always-loaded description, so that independent reach has to be worth it.

## Router skills

When request-only skills multiply past what you can remember, that piled-up cognitive load is cured by a **router skill**: one request-only skill that names the others and when to reach for each, so the human has one skill to remember instead of many. It tells the agent to read the right SKILL.md for the request.
